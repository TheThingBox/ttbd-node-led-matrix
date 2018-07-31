module.exports = function(RED) {
  "use strict";

  var getColor = require("./utils").getColor
  var getOffsetHour = require("./utils").getOffsetHour
  var mqtt = require("mqtt");
  var scrollingDirection = [
    {
      name: 'right2left',
      value: 'r2l'
    },
    {
      name: 'left2right',
      value: 'l2r'
    },
    {
      name: 'bottom2top',
      value: 'b2t'
    },
    {
      name: 'top2bottom',
      value: 't2b'
    }
  ]

  var clockRe = /(([01][0-9]|2[0-3]):[0-5][0-9])/;

  function ledmatrix(n) {
    RED.nodes.createNode(this, n);
    this.scrollingDirection = n.scrollingDirection;
    this.client = mqtt.connect("mqtt://mosquitto:1883");

    var node = this;

    this.client.on("close", function() {
      node.status({ fill: "red", shape: "ring", text: "disconnected" });
    });
    this.client.on("connect", function() {
      node.status({ fill: "green", shape: "dot", text: "connected" });
    });

    this.on('input', function(msg) {
      if (typeof msg._led_matrix === "undefined") {
        return;
      }
      if(!msg._led_matrix.data){
        return;
      }

      var speed = 50;
      var _speed_value = msg.speed;
      if (_speed_value === null || typeof _speed_value === 'undefined' || _speed_value === ""){
          _speed_value = 3;
      }
      _speed_value = Number(parseInt(_speed_value, 10) || (parseInt(_speed_value, 10) === 0 ? 0 : 3))
      if(_speed_value>5) _speed_value = 5;
      if(_speed_value<0) _speed_value = 0;

      msg._led_matrix.backgroundColor = getColor(msg.backgroundColor, msg.backgroundIntensity, 'bgr', 'black', 40)

      switch (_speed_value) {
        case 0:
          speed = 0;
          break;
        case 1:
          speed = 150;
          break;
        case 2:
          speed = 100;
          break;
        case 3:
          speed = 75;
          break;
        case 4:
          speed = 50;
          break;
        case 5:
          speed = 30;
          break;
        default:
          speed = 50;
          break;
      }

      var scrollingMode = node.scrollingDirection;
      if (scrollingMode === null || typeof scrollingMode === 'undefined' || scrollingMode === "" || scrollingDirection.findIndex(e => e.name === scrollingMode) === -1) {
        scrollingMode = msg.scrollingDirection;
        if (scrollingMode === null || typeof scrollingMode === 'undefined' || scrollingMode === "" || scrollingDirection.findIndex(e => e.name === scrollingMode) === -1){
          scrollingMode = scrollingDirection[0].name;
        }
      }
      scrollingMode = scrollingDirection.filter(e => e.name === scrollingMode)[0].value

      msg._led_matrix.scroll = {
        mode: scrollingMode,
        speed: speed,
        collapse: msg.collapse || false
      };

      node.client.publish("ui/ledmatrix/textAndImage/start", JSON.stringify(msg._led_matrix));
    });
    this.on('close', function() {
      if (node.client) {
        node.client.end();
      }
    });
  }
  RED.nodes.registerType("ledmatrix", ledmatrix);

}

module.exports = function(RED) {
  "use strict";

  var getColor = require("./utils").getColor
  var getOffsetHour = require("./utils").getOffsetHour
  var mqtt = require("mqtt");
  var scrollMods = [
    'r2l', // rigth to left : ←
    'l2r', // left to right : →
    'b2t', // bottom to top : ↑
    't2b'  // top to bottom : ↓
  ]
  var clockRe = /(([01][0-9]|2[0-3]):[0-5][0-9])/;

  function ledmatrix(n) {
    RED.nodes.createNode(this, n);
    this.speed = n.speed;
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

      var isHour
      if(msg._led_matrix.data.length === 1 && msg._led_matrix.data[0].type === "str"){
        isHour = msg._led_matrix.data[0].content.match(clockRe)
        if(isHour !== null && isHour.length !== 0 && isHour[0] == msg._led_matrix.data[0].content){
          node.client.publish("ui/ledmatrix/clock/start", JSON.stringify({
            timezone: getOffsetHour(msg._led_matrix.data[0].content),
            color: msg._led_matrix.data[0].color,
            backgroundColor: getColor(msg.backgroundColor, msg.backgroundIntensity, 'bgr', 'black', 40)
          }));
          return;
        }
      }

      var speed = 50;
      var speed_value = node.speed;
      if (speed_value === null || typeof speed_value === 'undefined' || speed_value === "") {
        speed_value = msg.speed;
        if (speed_value === null || typeof speed_value === 'undefined' || speed_value === ""){
          speed_value = 3;
        }
      }
      var _speed_value = Number(parseInt(speed_value, 10) || (parseInt(speed_value, 10) === 0 ? 0 : 3))
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

      msg._led_matrix.scroll = {
        mode: ((msg.mode && scrollMods.indexOf(msg.mode) !== -1)?msg.mode:scrollMods[0]),
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

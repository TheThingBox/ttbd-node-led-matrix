module.exports = function ( RED ) {
  "use strict";
  var moment = require("moment-timezone");
  var fs = require("fs");
  var path = require("path");
  var mqtt = require("mqtt");

  var getColor = require("./utils").getColor
  var getOffsetHour = require("./utils").getOffsetHour

  const ttbdNodeTextFont = "ttbd-node-text-font"
  const ttbdNodeTextFontPath = path.dirname(require.resolve(`${ttbdNodeTextFont}/package.json`));
  const fontPath = path.join(ttbdNodeTextFontPath, require(`${ttbdNodeTextFontPath}/package.json`).fontsLib)

  const font = require(fontPath)
  let fonts = []
  font.get( f => { fonts = f })

  function ledclock(config) {
    RED.nodes.createNode(this, config);
    this.timezone = config.timezone;
    this.secondHand = config.secondHand;
    this.colonBlink = config.colonBlink;
    this.client = mqtt.connect("mqtt://mosquitto:1883");

    var node = this;
    this.client.on("close", function() {
      node.status({ fill: "red", shape: "ring", text: "disconnected" });
    });
    this.client.on("connect", function() {
      node.status({ fill: "green", shape: "dot", text: "connected" });
    });

    this.on("input", function(msg) {

      /************************************
      ************ SECOND HAND ************
      ************************************/

      var secondHand = node.secondHand;
      if (secondHand === null || typeof secondHand === 'undefined' || secondHand === "") {
        secondHand = msg.secondHand;
        if (secondHand === null || typeof secondHand === 'undefined' || secondHand === ""){
          secondHand = false;
        }
      }
      if(secondHand === "true"){
        secondHand = true
      }

      /************************************
      ************ COLON BLINK ************
      ************************************/

      var colonBlink = node.colonBlink;
      if (colonBlink === null || typeof colonBlink === 'undefined' || colonBlink === "") {
        colonBlink = msg.colonBlink;
        if (colonBlink === null || typeof colonBlink === 'undefined' || colonBlink === ""){
          colonBlink = false;
        }
      }
      if(colonBlink === "true"){
        colonBlink = true
      }

      /************************************
      ************** TIMEZONE *************
      ************************************/

      var timezone = node.timezone;
      if (timezone === null || typeof timezone === 'undefined' || timezone === "") {
        timezone = msg.timezone;
        if (timezone === null || typeof timezone === 'undefined' || timezone === ""){
          timezone = "Europe/Paris";
        }
      }

      /************************************
      ************* TIMESTAMP *************
      ************************************/

      var timestamp = msg.timestamp;
      if (timestamp === null || typeof timestamp === 'undefined' || timestamp === ""){
        timestamp = new Date().getTime();
      }

      /************************************
      ************* FONT SIZE *************
      ************************************/

      var textsize = 3
      if(msg.textsize && !isNaN(msg.textsize)){
        textsize = Number(parseInt(msg.textsize, 10) || 3)
        if(textsize>5) textsize = 5;
        if(textsize<1) textsize = 1;
      }

      textsize = 2*textsize + 6

      /************************************
      ************* TEXT FONT  ************
      ************************************/

      var textFont = msg.font || null
      var prefferedOffsetY = null

      if(textFont && fonts.length > 0){
        let indexFont = fonts.findIndex(f => {
          let fontAvailable = []
          for(var i in f.types){
            fontAvailable.push(`${f.font.value}${f.types[i].value}`)
          }
          return fontAvailable.indexOf(textFont) !== -1
        })
        if(indexFont !== -1){
          let size = fonts[indexFont].sizes.filter(s => s.size === `${textsize}`)
          if(size.length > 0){
            size = size[0]
            prefferedOffsetY = size.offset
          }
        } else {
          node.warn(`Unsupported font : ${textFont}`)
          node.send(msg);
          return;
        }
      }

      /************************************
      *************** OFFSET **************
      ************************************/

      var defaultOffsetX = 0
      var defaultOffsetY = prefferedOffsetY || 0

      var offset = {
        x: (msg.offset && msg.offset.x)?msg.offset.x:defaultOffsetX,
        y: (msg.offset && msg.offset.y)?msg.offset.y:defaultOffsetY
      }


      /************************************
      **************** SEND ***************
      ************************************/

      var manipulatedMoment = moment(timestamp)
      if(typeof timezone === 'number' || (typeof timezone === 'string' && timezone.split('').findIndex(e => ['-','+'].indexOf(e) !== -1) !== -1)){
        manipulatedMoment = manipulatedMoment.utcOffset(timezone)
      } else {
        manipulatedMoment = manipulatedMoment.tz(timezone)
      }

      node.client.publish("ui/ledmatrix/clock/start", JSON.stringify({
        timezone: getOffsetHour(manipulatedMoment.format('HH:mm')),
        backgroundColor: getColor(msg.backgroundColor, msg.backgroundIntensity, 'bgr', 'black', 40),
        font: ((textFont!==null)?`${textFont}_${textsize}`:undefined),
        color: getColor(msg.color, msg.intensity, 'rgb', 'white', 40),
        offset: offset,
        colonBlink: colonBlink,
        secondHand: secondHand
      }));
      node.send(msg);
    });

    this.on('close', function() {
      if (node.client) {
        node.client.end();
      }
    });
  }
  RED.nodes.registerType("ledclock", ledclock);
}

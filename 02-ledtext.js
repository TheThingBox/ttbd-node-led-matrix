module.exports = function(RED) {
  "use strict";
  var fs = require("fs");
  var path = require("path");
  var getColor = require("./utils").getColor

  const ttbdNodeTextFont = "ttbd-node-text-font"
  const ttbdNodeTextFontPath = path.dirname(require.resolve(`${ttbdNodeTextFont}/package.json`));
  const fontPath = path.join(ttbdNodeTextFontPath, require(`${ttbdNodeTextFontPath}/package.json`).fontsLib)

  const font = require(fontPath)
  let fonts = []
  font.get( f => { fonts = f })

  function ledtext(n) {
    RED.nodes.createNode(this,n);

    this.message = n.message;
    var node = this;

    this.on('input', function (msg) {

      /************************************
      ************** MESSAGE **************
      ************************************/

      var message = node.message;
      if (message === null || typeof message === 'undefined' || message === "") {
        message = msg.message;
        if (message === null || typeof message === 'undefined' || message === ""){
          message = msg.payload;
          if(message === null || typeof message === 'undefined' || message === ""){
            node.send(msg);
            return;
          }
        }
      }

      if (typeof message === "object") {
        try{
          message = JSON.stringify(message);
        } catch(e){
          message = "[object Object]"
        }
      } else {
        try{
          message = message.toString()
        } catch(e){
          try{
            message = message+""
          } catch(e){
            message = ""
          }
        }
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

      var textFont = `${msg.font || "Roboto-Regular"}`
      var prefferedOffsetY = null

      if(fonts.length > 0){
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
      *************** CHECK ***************
      ************************************/

      if(typeof msg._led_matrix === "undefined") {
        msg._led_matrix = {
          data: []
        };
      } else if(typeof msg._led_matrix.data === "undefined") {
        msg._led_matrix.data = []
      }

      /************************************
      **************** SEND ***************
      ************************************/

      msg._led_matrix.data.push({
        type: "str",
        content: message,
        font: `${textFont}_${textsize}`,
        offset: offset,
        color: getColor(msg.color, msg.intensity, 'rgb', 'white', 40)
      })

      node.send(msg);
    });
  }
  RED.nodes.registerType("ledtext", ledtext);

}

module.exports = function(RED) {
  "use strict";
  var sharp = require("sharp");
  var fs = require("fs");
  var http = require("follow-redirects").http;
  var https = require("follow-redirects").https;
  var urllib = require("url");

  function ledpicture(n) {
    RED.nodes.createNode(this,n);

    this.picture = n.picture;
    if (RED.settings.httpRequestTimeout) { this.reqTimeout = parseInt(RED.settings.httpRequestTimeout) || 120000; }
    else { this.reqTimeout = 120000; }

    var node = this;
    this.on('input', function (msg) {

      var pic = node.picture;
      var options = {};
      if (pic === null || typeof pic === 'undefined' || pic === "") {
        pic = msg.picture;
        if (pic === null || typeof pic === 'undefined' || pic === ""){
          pic = msg.payload;
          if(pic === null || typeof pic === 'undefined' || pic === ""){
            node.send(msg);
            return;
          }
        }
      }

      if (typeof pic === "object") {
        pic = JSON.stringify(pic);
      } else {
        try{
          pic = pic.toString()
        } catch(e){
          try{
            pic = pic+""
          } catch(e){}
        }
      }

      var defaultOffsetX = 0
      var defaultOffsetY = 0

      var offset = {
        x: (msg.offset && msg.offset.x)?msg.offset.x:defaultOffsetX,
        y: (msg.offset && msg.offset.y)?msg.offset.y:defaultOffsetY
      }

      if(typeof msg._led_matrix === "undefined") {
        msg._led_matrix = {
          data: []
        };
      } else if(typeof msg._led_matrix.data === "undefined") {
        msg._led_matrix.data = []
      }

      function getIntensity(intensity, defaultIntensity){
        var _intensity = Number(parseInt(intensity, 10) || Number(parseInt(defaultIntensity, 10) || 100))
        if(_intensity>100) _intensity = 100;
        if(_intensity<0) _intensity = 0;
        _intensity = 100 - _intensity
        _intensity = Math.round(_intensity*2.55)
        return _intensity
      }

      function resizeAnndBrightness(image, intensity, w, h, algo, callback){
        if(!algo){ algo = sharp.kernel.nearest }
        if(!h){ h = 16 }
        if (typeof callback !== 'function') {
          callback = function(){};
        }
        try {
          sharp(image).overlayWith(
            new Buffer([0, 0, 0, getIntensity(intensity, 40)]),
            { tile: true, raw: { width: 1, height: 1, channels: 4 } }
          ).resize(w, h, { kernel: algo }).max().toBuffer().then(data => {
            callback(JSON.parse(JSON.stringify(data)).data)
          })
        } catch(e){
          callback(null)
        }
      }

      if(pic.indexOf("http") == 0){
        options = urllib.parse(pic);
        options.method = "GET";
        if (msg.headers) {
          options.headers = msg.headers;
        } else {
          options.headers = {};
        }
        var req = ((/^https/.test(pic))?https:http).request(options,function(res) {
          res.setEncoding('hex');
          var content = "";
          res.on('data',function(chunk) {
            content += chunk;
          });
          res.on('end',function() {
            resizeAnndBrightness(new Buffer(content, "hex"), msg.intensity, null, 16, null, dataArray => {
              if(dataArray){
                msg._led_matrix.data.push({
                  type: "img",
                  offset: "offset",
                  content: dataArray
                });
              }
              node.send(msg)
            })
          });
        });

        req.setTimeout(node.reqTimeout, function() {
          node.warn(pic+" is unreachable");
          req.abort();
          node.send(msg);
        });
        req.on('error',function(err) {
          node.error(err);
          node.send(msg);
        });
        req.end();
      } else {
        fs.access(pic, fs.constants.F_OK | fs.constants.R_OK, function(errAccess) {
          if(!errAccess){
            fs.readFile(pic, options, function(errRead, data) {
              if (!errRead) {
                resizeAnndBrightness(data, msg.intensity, null, 16, null, dataArray => {
                  if(dataArray){
                    msg._led_matrix.data.push({
                      type: "img",
                      offset: offset,
                      content: dataArray
                    });
                  }
                  node.send(msg)
                })
              } else {
                node.warn(pic+" is unreachable");
                msg.error = errRead;
                node.send(msg);
              }
            });
          } else {
            node.send(msg);
          }
        });
      }
    });
  }
  RED.nodes.registerType("ledpicture", ledpicture);
}

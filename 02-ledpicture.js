module.exports = function(RED) {
  "use strict";
  var fs = require("fs-extra");
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

      if(typeof msg._led_matrix === "undefined") {
        msg._led_matrix = {
          data: []
        };
      } else if(typeof msg._led_matrix.data === "undefined") {
        msg._led_matrix.data = []
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
            msg._led_matrix.data.push({
              type:"img",
              content:JSON.parse(JSON.stringify(new Buffer(content,"hex"))).data
            });
            node.send(msg);
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
        fs.access(pic, fs.R_OK, function(err){
          if(!err){
            fs.readFileSync(pic, options, function(err,data) {
              if (err) {
                node.warn(pic+" is unreachable");
                msg.error = err;
              } else {
                msg._led_matrix_led_matrix.data.push({
                  type:"img",
                  content:JSON.parse(JSON.stringify(data)).data
                });
                delete msg.error;
              }
              node.send(msg);
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

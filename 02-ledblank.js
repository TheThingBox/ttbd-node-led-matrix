module.exports = function(RED) {
  "use strict";

  function ledblank(n) {
    RED.nodes.createNode(this,n);
    var node = this;

    this.on('input', function (msg) {
      msg._led_matrix = {
        data: []
      };
      node.send(msg);
    });
  }
  RED.nodes.registerType("ledblank", ledblank);
}

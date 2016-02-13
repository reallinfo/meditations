// Generated by CoffeeScript 1.10.0
(function() {
  var json_request, make_editor, make_socket;

  make_editor = function(selector, args) {
    var editor;
    if (args == null) {
      args = {};
    }
    editor = window.Common.editor = new MediumEditor(selector, $.extend({
      autoLink: true,
      placeholder: false,
      toolbar: {
        buttons: ['bold', 'italic', 'underline', 'anchor', 'image', 'quote', 'orderedlist', 'unorderedlist', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      }
    }, args));
    return editor;
  };

  json_request = function(data) {
    var ret;
    ret = $.extend({
      type: "POST",
      contentType: "application/json; charset=UTF-8"
    }, data);
    ret.data = JSON.stringify(ret.data);
    return ret;
  };

  make_socket = function(location, onmessage) {
    var socket, url;
    url = "ws://" + window.location.hostname + ":" + window.location.port + "/" + location;
    socket = new WebSocket(url);
    socket.onopen = function(m) {
      return console.log("Connected to " + url + " websocket");
    };
    return socket.onmessage = function(m) {
      console.log(location + ": Socket message", m);
      return onmessage(m);
    };
  };

  window.Common = {
    json_request: json_request,
    make_editor: make_editor,
    make_socket: make_socket
  };

}).call(this);

//# sourceMappingURL=common.js.map

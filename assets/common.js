// Generated by CoffeeScript 1.10.0
(function() {
  var Store;

  Store = (function() {
    function Store() {
      riot.observable(this);
      window.Common.register_events(this);
    }

    return Store;

  })();

  window.Common = {
    Store: Store,
    request: function(data) {
      var ret;
      ret = $.extend({
        type: "POST",
        contentType: "application/json; charset=UTF-8"
      }, data);
      ret.data = JSON.stringify(ret.data);
      return $.ajax(ret);
    },
    make_editor: function(selector, args) {
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
    },
    make_socket: function(location, onmessage) {
      var socket, url;
      url = "ws://" + window.location.hostname + ":" + window.location.port + "/" + location;
      socket = new WebSocket(url);
      socket.onopen = function(m) {
        return console.log("Connected to " + url + " websocket");
      };
      return socket.onmessage = function(m) {
        console.log(location + ": Socket message", m);
        return onmessage($.parseJSON(m.data));
      };
    },
    route: function(base, first, routes) {
      riot.route(function() {
        var action;
        action = [].shift.apply(arguments);
        if (routes[action]) {
          return routes[action].apply(this, arguments);
        } else if (action === '' && routes['no_action']) {
          return routes['no_action'].apply(this, arguments);
        } else {
          return console.log('Unknown action', action);
        }
      });
      riot.route.base(base);
      riot.route.start(true);
      if (!(window.location.hash.length > 2)) {
        if (first) {
          return riot.route(first);
        }
      }
    },
    register_events: function(store) {
      var key, results, value;
      results = [];
      for (key in store) {
        value = store[key];
        if (key.slice(0, 3) === "on_") {
          results.push(store.on(key.slice(3).replace(/_/g, "-"), value));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

}).call(this);

//# sourceMappingURL=common.js.map

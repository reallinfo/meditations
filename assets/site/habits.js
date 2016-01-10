// Generated by CoffeeScript 1.10.0
(function() {
  var Scope, Status, TaskStore, main;

  Scope = {
    day: 0,
    month: 1,
    year: 2,
    bucket: 3
  };

  Status = {
    unset: 0,
    complete: 1,
    incomplete: 2,
    wrap: 3
  };

  TaskStore = (function() {
    TaskStore.prototype.mount_scope = function(scope, date, mount) {
      var fetch, fetch_date, ref, self;
      self = this;
      fetch = null;
      if (typeof date === 'string') {
        date = moment.utc(date);
      } else {
        date = date.clone();
      }
      fetch_date = date.clone();
      ref = (function() {
        switch (scope) {
          case Scope.day:
            return ["day", fetch_date, "#scope-day-" + (date.format('DD'))];
          case Scope.month:
            return ["month", fetch_date.date(1), "#scope-month"];
          case Scope.year:
            return ["year", fetch_date.date(1).month(0), "#scope-year"];
          case Scope.bucket:
            return ["bucket", fetch_date, "#scope-bucket"];
        }
      })(), fetch = ref[0], fetch_date = ref[1], mount = ref[2];
      return $.get("/habits/tasks/in-" + fetch + "?date=" + (fetch_date.format('YYYY-MM-DD')), function(tasks) {
        var result, title;
        tasks = tasks || [];
        title = (function() {
          switch (false) {
            case scope !== Scope.day:
              return date.format('Do');
            case scope !== Scope.month:
              return date.format('MMMM');
            case scope !== Scope.year:
              return date.format('YYYY');
            case scope !== Scope.bucket:
              return "Bucket";
          }
        })();
        return result = riot.mount(mount, {
          date: date,
          scope: scope,
          tasks: tasks,
          title: title
        });
      });
    };

    function TaskStore() {
      var remount, self;
      riot.observable(this);
      self = this;
      self.on('comment-update', function(task, comment) {
        return $.post('habits/comment/update', comment, function(saved_comment) {
          return self.trigger('comment-updated', task, saved_comment);
        });
      });
      self.on('task-new', function(scope, task_name, created_at) {
        return $.post('habits/task/new', {
          name: task_name,
          scope: scope.scope,
          created_at: created_at.format('YYYY-MM-DD')
        }, function() {
          return self.mount_scope(scope.scope, scope.date);
        });
      });
      remount = function(path) {
        return function(task) {
          return $.post(path, task, function() {
            return self.mount_scope(task.scope, task.created_at);
          });
        };
      };
      self.on('task-delete', remount('/habits/task/delete'));
      self.on('task-order-down', remount('/habits/task/order-down'));
      self.on('task-order-up', remount('/habits/task/order-up'));
      self.on('task-update', remount('/habits/task/update'));
    }

    return TaskStore;

  })();

  main = function() {
    var browse_from, current_date, task_near, task_store;
    console.log('Initializing main habits page');
    if (typeof html5 !== "undefined" && html5 !== null) {
      html5.addElements('scope task');
    }
    task_store = window.task_store = new TaskStore();
    RiotControl.addStore(task_store);
    current_date = false;
    browse_from = function(from) {
      var today;
      console.log('Browsing from', from);
      today = moment();
      from = moment(from, 'YYYY-MM');
      document.title = (from.format('MMM YYYY')) + " / habits";
      current_date = from.clone();
      task_store.mount_scope(Scope.month, from);
      task_store.mount_scope(Scope.year, from);
      task_store.mount_scope(Scope.bucket, from);
      return riot.mount("scope-days", {
        thunk: function() {
          var check, date, next, results;
          date = 1;
          results = [];
          while (date <= from.daysInMonth()) {
            next = from.clone().date(date);
            if (next > today) {
              check = next.clone();
              if (!(check.subtract(4, 'hours') < today)) {
                break;
              }
            }
            task_store.mount_scope(Scope.day, next);
            results.push(date += 1);
          }
          return results;
        }
      });
    };
    RiotControl.on("change-date", function(forward, scope) {
      return riot.route.exec(function(action, date) {
        date = scope.date.clone().date(1);
        date[forward ? 'add' : 'subtract'](1, scope.scope === Scope.month ? 'months' : 'years');
        return riot.route("from/" + (date.format('YYYY-MM')));
      });
    });
    riot.route(function(action, rest) {
      switch (action) {
        case 'from':
          return browse_from(rest);
        default:
          return console.log("Unknown action", action);
      }
    });
    riot.route("from/" + (moment().format('YYYY-MM')));
    return task_near = function(task, date2) {
      var date1;
      date1 = moment.utc(task.created_at);
      return ((task.scope === Scope.month || task.scope === Scope.day) && date1.month() === date2.month() && date1.year() === date2.year()) || (task.scope === Scope.year && date1.year() === date2.year()) || task.scope === Scope.bucket;
    };

    /* Setup websocket
    socket = false
    make_socket = () ->
      socket = new WebSocket("ws://#{window.location.hostname}:#{window.location.port}/update-subscribe")
      socket.onopen = (m) ->
        console.log 'Connected to /update-subscribe websocket'
      socket.onmessage = (m) ->
        task = $.parseJSON(m.data)
         * No need to refresh if task is not in the current scope
        date = moment.utc(task.created_at)
        console.log task_near(task, current_date), task, current_date
        if task_near(task, current_date)
          task_store.mount_scope task.scope, date
       * Reconnect to socket on failure for development re-loading
      #socket.onclose = () ->
       *  setTimeout(() ->
       *    socket = make_socket()
       *    console.log 'Lost websocket connection, retrying in 10 seconds'
       *  , 10000)
    #socket = make_socket()
     */
  };

  window.Habits = {
    Scope: Scope,
    Status: Status,
    TaskStore: TaskStore,
    main: main
  };

}).call(this);

//# sourceMappingURL=habits.js.map

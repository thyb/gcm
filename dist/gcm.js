(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  repository: 'gcm',
  username: 'thyb'
};

},{}],2:[function(require,module,exports){
var AlwaysCtrl, Ctrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = AlwaysCtrl = (function(_super) {
  __extends(AlwaysCtrl, _super);

  function AlwaysCtrl() {
    return AlwaysCtrl.__super__.constructor.apply(this, arguments);
  }

  AlwaysCtrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  AlwaysCtrl.prototype["do"] = function() {};

  AlwaysCtrl.prototype.on = {
    "signin": function() {},
    "logout": function() {}
  };

  return AlwaysCtrl;

})(Ctrl);

},{"../framework/Ctrl":8}],3:[function(require,module,exports){
var Ctrl, DashboardCtrl, DocumentManagerService, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

config = require('../config');

DocumentManagerService = require('../services/DocumentManagerService');

module.exports = DashboardCtrl = (function(_super) {
  __extends(DashboardCtrl, _super);

  function DashboardCtrl(app) {
    DashboardCtrl.__super__.constructor.call(this, app);
    console.log("construct dashboard");
    if (!this.app.github) {
      return this.app.redirect('/');
    }
    this.services.documentManager = new DocumentManagerService(this.app.github);
  }

  DashboardCtrl.prototype.initialize = function(callback) {
    return this.services.documentManager.list((function(_this) {
      return function(err, data) {
        if (err === 'not found') {
          if (callback) {
            return callback({
              documents: null
            });
          }
        }
        console.log("list", data);
        _this.app.documents = data;
        if (callback) {
          return callback({
            documents: data
          });
        }
      };
    })(this));
  };

  DashboardCtrl.prototype["do"] = function() {
    $('#create-document').click(function() {
      return $('#new-document-modal').modal('show');
    });
    $('#name-input').keyup(function() {
      return $('#slug-input').val($(this).val().dasherize());
    });
    return $('#create-button').click((function(_this) {
      return function() {
        var formData, type;
        type = $('#new-document-modal .btn-group label.active').text().trim().toLowerCase();
        if (type === 'markdown') {
          type = 'md';
        }
        formData = {
          name: $('#name-input').val(),
          slug: $('#slug-input').val(),
          extension: type
        };
        return _this.services.documentManager.create(formData, function(err) {
          $('.modal-backdrop').remove();
          return _this.app.redirect('/document/' + formData.slug);
        });
      };
    })(this));
  };

  return DashboardCtrl;

})(Ctrl);

},{"../config":1,"../framework/Ctrl":8,"../services/DocumentManagerService":19}],4:[function(require,module,exports){
var Ctrl, DocumentCtrl, DocumentManagerService,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

DocumentManagerService = require('../services/DocumentManagerService');

module.exports = DocumentCtrl = (function(_super) {
  __extends(DocumentCtrl, _super);

  function DocumentCtrl(app, params) {
    DocumentCtrl.__super__.constructor.call(this, app, params);
    if (!this.app.github) {
      return this.app.redirect('/');
    }
    this.services.documentManager = new DocumentManagerService(this.app.github);
    Handlebars.registerHelper('releaseDotImg', function(passedString) {
      if (passedString.substr(0, 6) === 'Delete') {
        return 'img/delete-dot.png';
      } else {
        return 'img/release-dot.png';
      }
    });
  }

  DocumentCtrl.prototype.initialize = function(callback) {
    return this.services.documentManager.getDocument(this.params.slug, (function(_this) {
      return function(doc) {
        console.log('getDocument', doc);
        if (!doc) {
          _this.app.redirect('/documents');
        }
        return _this.services.documentManager.getDocumentHistory(_this.params.slug, function(err, documentHistory) {
          return _this.services.documentManager.getReleaseHistory(_this.params.slug, function(err, releaseHistory) {
            var localChanges, localContent, merge, _ref, _ref1;
            localContent = JSON.parse(localStorage.getItem(_this.params.slug));
            localChanges = false;
            if ((localContent != null ? (_ref = localContent[_this.params.slug]) != null ? _ref.content.length : void 0 : void 0) > 0 && (localContent != null ? (_ref1 = localContent[_this.params.slug]) != null ? _ref1.content.trim() : void 0 : void 0) !== doc.lastVersion) {
              localChanges = true;
            }
            merge = _this.services.documentManager.mergeHistory(releaseHistory, documentHistory);
            _this.viewParams = {
              doc: doc,
              slug: _this.params.slug,
              diff: documentHistory,
              history: merge,
              localChanges: localChanges
            };
            if (callback) {
              return callback(_this.viewParams);
            }
          });
        });
      };
    })(this));
  };

  DocumentCtrl.prototype.checkLocalChanges = function(callback) {
    var localChanges, localContent, _ref;
    localContent = JSON.parse(localStorage.getItem(this.params.slug));
    localChanges = false;
    if ((localContent != null ? (_ref = localContent[this.params.slug]) != null ? _ref.content.length : void 0 : void 0) > 0 && localContent[this.params.slug].content.trim() !== this.viewParams.doc.lastVersion) {
      localChanges = true;
    }
    return callback(localChanges, localContent);
  };

  DocumentCtrl.prototype.saveDraft = function(callback) {
    var content, filename, message, slug;
    if (!this.draftMessageOpen) {
      $('#draft-add-message').slideDown('fast');
      this.draftMessageOpen = true;
      $('#release').attr('disabled', 'disabled');
      if (callback) {
        callback(false);
      }
    } else {
      $('#release,#save-draft').attr('disabled', 'disabled');
      message = $("#draft-message").val();
      content = this.editor.exportFile().trim();
      filename = this.viewParams.doc.filename;
      slug = this.viewParams.slug;
      this.services.documentManager.saveDraft(slug, filename, content, message, (function(_this) {
        return function() {
          $("#history p:first").text(' ' + message).prepend('<img src="img/draft-dot.png">');
          $('#draft-add-message').slideUp('fast');
          _this.draftMessageOpen = false;
          $('#release').removeAttr('disabled');
          if (callback) {
            return callback(true);
          }
        };
      })(this));
    }
    return false;
  };

  DocumentCtrl.prototype.release = function(callback) {
    var content, filename, message, releaseFct, slug;
    if (!this.draftMessageOpen) {
      $('#draft-add-message').slideDown('fast');
      $('#save-draft').attr('disabled', 'disabled');
      this.releaseMessage = true;
      this.draftMessageOpen = true;
      if (callback) {
        callback(false);
      }
    } else {
      $('#release,#save-draft').attr('disabled', 'disabled');
      message = $("#draft-message").val();
      content = this.editor.exportFile().trim();
      filename = this.viewParams.doc.filename;
      slug = this.viewParams.slug;
      releaseFct = (function(_this) {
        return function() {
          return _this.services.documentManager.release(slug, filename, content, message, function() {
            $("#history").prepend('<p></p>').find('p:first').text(' ' + message).prepend('<img src="img/release-dot.png">');
            $('#draft-add-message').slideUp('fast');
            _this.draftMessageOpen = false;
            _this.releaseMessage = false;
            if (callback) {
              return callback(true);
            }
          });
        };
      })(this);
      this.checkLocalChanges((function(_this) {
        return function(changes) {
          if (changes) {
            return _this.services.documentManager.saveDraft(slug, filename, content, message, function() {
              $("#history p:first").text(' ' + message).prepend('<img src="img/draft-dot.png">');
              return releaseFct();
            });
          } else {
            return releaseFct();
          }
        };
      })(this));
    }
    return this.services.documentManager.getDocumentHistory(this.params.slug, (function(_this) {
      return function(err, res) {
        return console.log(release);
      };
    })(this));
  };

  DocumentCtrl.prototype["do"] = function() {
    var resize, selector;
    $('#document-panel').css('overflow', 'auto');
    selector = $('#epiceditor, #document-panel');
    resize = function() {
      return selector.height($(window).height() - 20);
    };
    resize();
    $(window).resize(function() {
      resize();
      return this.editor.reflow();
    });
    this.editor = new EpicEditor({
      localStorageName: this.params.slug,
      focusOnLoad: true,
      basePath: '/lib/epiceditor',
      file: {
        name: this.params.slug
      }
    }).load((function(_this) {
      return function() {
        var _ref;
        if (((_ref = _this.viewParams.history[0]) != null ? _ref.imgType : void 0) === 'img/release-dot.png' && $('#history > p:first img').attr('src') !== 'img/local-dot.png' || !_this.editor || _this.editor.exportFile().trim() === '') {
          $('#save-draft').removeAttr('disabled');
        }
        $("#save-draft").click(function() {
          _this.saveDraft();
          return false;
        });
        $("#release").click(function() {
          _this.release();
          return false;
        });
        $("#draft-message-go").click(function() {
          if (_this.releaseMessage) {
            _this.release();
          } else {
            _this.saveDraft();
          }
          return false;
        });
        return $("#draft-message-cancel").click(function() {
          _this.draftMessageOpen = false;
          $("#draft-add-message").slideUp('fast');
          $('#save-draft,#release').removeAttr('disabled');
          return false;
        });
      };
    })(this));
    return this.editor.on('update', (function(_this) {
      return function() {
        return _this.checkLocalChanges(function(localChanges, localContent) {
          if (localChanges && $('#history > p:first img').attr('src') !== 'img/local-dot.png') {
            $('#history').prepend('<p><img src="img/local-dot.png"> Local changes</p>');
            $('#save-draft,#release').removeAttr('disabled');
          } else if (!localChanges && $('#history > p:first img').attr('src') === 'img/local-dot.png') {
            $('#history p:first').remove();
            $('#save-draft').attr('disabled', 'disabled');
          }
          if (!localChanges && (!_this.editor || _this.editor.exportFile().trim() === '')) {
            return $('#save-draft').removeAttr('disabled');
          }
        });
      };
    })(this));
  };

  return DocumentCtrl;

})(Ctrl);

},{"../framework/Ctrl":8,"../services/DocumentManagerService":19}],5:[function(require,module,exports){
var Ctrl, ErrorCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = ErrorCtrl = (function(_super) {
  __extends(ErrorCtrl, _super);

  function ErrorCtrl() {
    return ErrorCtrl.__super__.constructor.apply(this, arguments);
  }

  ErrorCtrl.prototype["do"] = function() {};

  return ErrorCtrl;

})(Ctrl);

},{"../framework/Ctrl":8}],6:[function(require,module,exports){
var Ctrl, IndexCtrl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Ctrl = require('../framework/Ctrl');

module.exports = IndexCtrl = (function(_super) {
  __extends(IndexCtrl, _super);

  function IndexCtrl() {
    return IndexCtrl.__super__.constructor.apply(this, arguments);
  }

  IndexCtrl.prototype["do"] = function() {
    OAuth.initialize('poZr5pdrx7yFDfoE-gICayo2cBc');
    return $('button').click((function(_this) {
      return function() {
        return OAuth.popup('github', function(err, res) {
          if (err) {
            return console.log(err);
          }
          _this.app.env.set('access_token', res.access_token);
          _this.app.github = new Github({
            token: res.access_token,
            auth: 'oauth'
          });
          _this.app.redirect('/documents');
          return _this.app.event.emit("signin");
        });
      };
    })(this));
  };

  return IndexCtrl;

})(Ctrl);

},{"../framework/Ctrl":8}],7:[function(require,module,exports){
var App, CtrlManager, Env, GlobalEvent, LayoutManager, Router, TemplateManager;

Router = require('./Router');

Env = require('./Env');

GlobalEvent = require('./GlobalEvent');

CtrlManager = require('./CtrlManager');

TemplateManager = require('./TemplateManager');

LayoutManager = require('./LayoutManager');

module.exports = App = (function() {
  function App() {
    this.env = new Env();
    this.event = new GlobalEvent();
    this.ctrlManager = new CtrlManager(this);
    this.templateManager = TemplateManager;
    this.layoutManager = LayoutManager;
    this.ready = true;
  }

  App.prototype.initializeRouter = function(setting) {
    this.router = new Router(this, setting);
    return this.router;
  };

  App.prototype.setLayout = function(layout) {
    this.ready = false;
    this.layoutManager.set(layout, (function(_this) {
      return function() {
        _this.router.setDefaultPlacement('#content');
        _this.ready = true;
        if (_this.started) {
          return _this.start();
        }
      };
    })(this));
    return this;
  };

  App.prototype.start = function() {
    var hash;
    this.started = true;
    if (this.ready) {
      hash = window.location.hash;
      console.log('router start', hash, this.router._state);
      if (hash && hash !== '#') {
        return this.redirect(hash.substr(1));
      } else if (!this.router._state) {
        return this.redirect('/');
      } else {
        return this.redirect(this.router._state);
      }
    }
  };

  App.prototype.include = function(ctrl, placement) {
    return this.ctrlManager.addPartial(ctrl, placement);
  };

  App.prototype.redirect = function(path) {
    console.log('redirect', path);
    return this.router.stopPropagate(path).change(path);
  };

  App.prototype.setTitle = function(title) {};

  App.prototype.setMeta = function(meta, value) {};

  return App;

})();

},{"./CtrlManager":10,"./Env":11,"./GlobalEvent":12,"./LayoutManager":13,"./Router":14,"./TemplateManager":16}],8:[function(require,module,exports){
var Ctrl, CtrlEvent, View;

CtrlEvent = require('./CtrlEvent');

View = require('./View');

module.exports = Ctrl = (function() {
  function Ctrl(app, params) {
    var ctrlname;
    this.app = app;
    this.params = params;
    ctrlname = this.constructor.name;
    ctrlname = ctrlname.substr(0, ctrlname.length - 4);
    ctrlname = ctrlname.replace(/([A-Z])/g, "-$1");
    this.templateUrl = ctrlname.substr(1).toLowerCase() + '.html';
    console.log(this.templateUrl);
    this.scope = {};
    this.event = new CtrlEvent();
    this.view = new View();
    this.services = {};
  }

  Ctrl.prototype.use = function(callback) {
    return this.render((function(_this) {
      return function() {
        return _this["do"](callback);
      };
    })(this));
  };

  Ctrl.prototype.initialize = function(callback) {
    if (callback) {
      return callback();
    }
  };

  Ctrl.prototype["do"] = function(callback) {
    if (callback) {
      return callback();
    }
  };

  Ctrl.prototype.render = function(callback) {
    return this.initialize((function(_this) {
      return function(params) {
        return _this.view.render(_this.templateUrl, params, _this.app.router.defaultPlacement, callback);
      };
    })(this));
  };

  return Ctrl;

})();

},{"./CtrlEvent":9,"./View":17}],9:[function(require,module,exports){
var CtrlEvent;

module.exports = CtrlEvent = (function() {
  function CtrlEvent() {
    this.listeners = [];
  }

  CtrlEvent.prototype.emit = function(name, value) {
    var listener, _i, _len, _ref, _results;
    _ref = this.listeners;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      if (listener.name === name) {
        _results.push(listener.callback(value));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  CtrlEvent.prototype.receive = function(name, callback) {
    return this.listeners.push({
      name: name,
      callback: callback
    });
  };

  return CtrlEvent;

})();

},{}],10:[function(require,module,exports){
var CtrlManager;

module.exports = CtrlManager = (function() {
  function CtrlManager(app) {
    this.app = app;
    this.partials = [];
  }

  CtrlManager.prototype.setMaster = function(ctrl, params, callback) {
    this.master = new ctrl(this.app, params);
    console.log(this.app.router.stop, params.path);
    if (this.app.router.stop && this.app.router.stop !== params.path) {
      return (this.app.router.stop = false);
    }
    return this.master.use(callback);
  };

  CtrlManager.prototype.addPartial = function(ctrl, placement, callback) {
    this.partials.push({
      ctrl: new ctrl(this.app, {
        placement: placement
      })
    });
    return this.partials[this.partials.length - 1].ctrl.use(callback);
  };

  CtrlManager.prototype.removePartial = function(ctrl, placement) {
    var partial;
    for (partial in this.partials) {
      if (partials[partial].placement === placement) {
        delete partials[partial];
      }
    }
    return $(placement).html('');
  };

  return CtrlManager;

})();

},{}],11:[function(require,module,exports){
var Env;

module.exports = Env = (function() {
  var data;

  data = {};

  function Env() {
    if (localStorage) {
      console.log('has local storage');
      try {
        data = JSON.parse(localStorage.getItem('env'));
      } catch (_error) {}
      if (!data) {
        data = {};
      }
    }
    console.log(data);
  }

  Env.prototype.set = function(key, value) {
    console.log('env set', key, value);
    data[key] = value;
    console.log(data);
    if (localStorage) {
      console.log('set localstorage to', data);
      return localStorage.setItem('env', JSON.stringify(data));
    }
  };

  Env.prototype.get = function(key) {
    return data[key];
  };

  return Env;

})();

},{}],12:[function(require,module,exports){
var GlobalEvent;

module.exports = GlobalEvent = (function() {
  function GlobalEvent() {
    this.listeners = [];
  }

  GlobalEvent.prototype.emit = function(name, value) {
    var listener, _i, _len, _ref, _results;
    _ref = this.listeners;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      if (listener.name === name) {
        _results.push(listener.callback(value));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  GlobalEvent.prototype.receive = function(name, callback) {
    return this.listeners.push({
      name: name,
      callback: callback
    });
  };

  return GlobalEvent;

})();

},{}],13:[function(require,module,exports){
var LayoutManager;

module.exports = LayoutManager = (function() {
  var Layout, baseUrl, layout, layouts;

  function LayoutManager() {}

  layouts = {};

  layout = null;

  baseUrl = '/tmpl/layout/';

  Layout = (function() {
    function Layout(template) {
      this.template = template;
    }

    Layout.prototype.getContent = function(callback) {
      if (this.content) {
        return callback(this.content);
      }
      return $.ajax({
        url: baseUrl + this.template + '.html',
        type: "get"
      }).done((function(_this) {
        return function(content) {
          _this.content = content;
          if (callback) {
            return callback(content);
          }
        };
      })(this));
    };

    return Layout;

  })();

  LayoutManager.setBaseUrl = function(base) {
    return baseUrl = base;
  };

  LayoutManager.set = function(l, callback) {
    layout = l;
    if (layouts[layout] == null) {
      layouts[layout] = new Layout(layout);
    }
    return layouts[layout].getContent((function(_this) {
      return function(content) {
        $('body').html(content);
        return callback();
      };
    })(this));
  };

  return LayoutManager;

})();

},{}],14:[function(require,module,exports){
var Router, View;

View = require('./View');

module.exports = Router = (function() {
  function Router(app, setup) {
    this.app = app;
    this._routes = setup;
    this.changingHash = false;
    this.defaultPlacement = 'body';
    $(window).hashchange((function(_this) {
      return function() {
        return _this.app.redirect(window.location.hash.substr(1));
      };
    })(this));
  }

  Router.prototype.setDefaultPlacement = function(defaultPlacement) {
    this.defaultPlacement = defaultPlacement;
    return this;
  };

  Router.prototype.changeHash = function(path) {
    this._state = path;
    this.changingHash = true;
    return window.location.hash = this._state;
  };

  Router.prototype._checkPath = function(path) {
    var masterCtrl, masterParams, param, params, regexpStr, res, route;
    masterParams = new Array();
    for (route in this._routes) {
      if (route.indexOf('/:') !== -1) {
        res = route.match(/\/:([a-zA-Z0-9]+)/);
        res.shift();
        params = res;
        console.log(res, res.length);
        regexpStr = route.replace(/\/:[a-zA-Z0-9]+/g, '/([a-zA-Z0-9_-]+)').replace(/\//g, '\\/');
        res = path.match(new RegExp(regexpStr));
        if (!res) {
          continue;
        }
        res.shift();
        for (param in params) {
          if (param === 'index' || param === 'input') {
            continue;
          }
          console.log('for', param);
          masterParams[params[param]] = res[param];
        }
        console.log(masterParams);
        if (this._routes[route].ctrl) {
          masterCtrl = this._routes[route].ctrl;
        } else {
          masterCtrl = this._routes[route];
        }
      } else if (route === path) {
        if (this._routes[route].ctrl) {
          masterCtrl = this._routes[route].ctrl;
        } else {
          masterCtrl = this._routes[route];
        }
        break;
      }
    }
    masterParams['path'] = path;
    console.log('params', masterParams);
    return {
      master: masterCtrl,
      masterParams: masterParams,
      partial: null
    };
  };

  Router.prototype.stopPropagate = function(path) {
    this.stop = path;
    return this;
  };

  Router.prototype.change = function(path) {
    var res;
    res = this._checkPath(path);
    if (!res.master) {
      return this.change('/404');
    }
    this.changeHash(path);
    this.app.ctrlManager.setMaster(res.master, res.masterParams, (function(_this) {
      return function() {
        if (_this.stop) {
          return _this.stop = false;
        }
      };
    })(this));
    return this;
  };

  return Router;

})();

},{"./View":17}],15:[function(require,module,exports){
var Service;

module.exports = Service = (function() {
  function Service() {}

  return Service;

})();

},{}],16:[function(require,module,exports){
var TemplateManager;

module.exports = TemplateManager = (function() {
  var Template, baseUrl, instances;

  function TemplateManager() {}

  instances = {};

  baseUrl = '/tmpl/main/';

  Template = (function() {
    function Template(template) {
      this.template = template;
    }

    Template.prototype.getContent = function(callback) {
      if (this.content) {
        return callback(this.content);
      }
      return $.ajax({
        url: baseUrl + this.template,
        type: "get"
      }).done(callback);
    };

    return Template;

  })();

  TemplateManager.setBaseUrl = function(base) {
    return baseUrl = base;
  };

  TemplateManager.get = function(template, callback) {
    if (instances[template] == null) {
      instances[template] = new Template(template);
    }
    return instances[template].getContent(callback);
  };

  return TemplateManager;

})();

},{}],17:[function(require,module,exports){
var TemplateManager, View;

TemplateManager = require('./TemplateManager');

module.exports = View = (function() {
  function View() {}

  View.prototype.render = function(templateUrl, params, placement, success) {
    return TemplateManager.get(templateUrl, function(content) {
      var template;
      template = Handlebars.compile(content);
      $(placement).html(template(params));
      if (success) {
        return success();
      }
    });
  };

  return View;

})();

},{"./TemplateManager":16}],18:[function(require,module,exports){

/*
class GDraft
	construct: (slug, commit) ->
	push: (content, commit) ->
	diff: (commit) ->

class GDocument
	construct: (slug, options) ->
	getContent: ->
	getMeta: ->
	createDraft: ->

documentManager =
	documents: [],
	createOrOpen: (slug, options) ->
		 *git branch document-{slug} if not exists
		 *git checkout document-{slug}
		 *
	diff: (slug, v1, v2) ->
	list: ->

repo =
	construct: ->
 */
var AlwaysCtrl, App, DashboardCtrl, DocumentCtrl, ErrorCtrl, IndexCtrl;

App = require('./framework/App');

AlwaysCtrl = require('./controllers/AlwaysCtrl');

ErrorCtrl = require('./controllers/ErrorCtrl');

IndexCtrl = require('./controllers/IndexCtrl');

DashboardCtrl = require('./controllers/DashboardCtrl');

DocumentCtrl = require('./controllers/DocumentCtrl');

$('document').ready(function() {
  var accessToken, app;
  app = new App();
  app.initializeRouter({
    '/document/:slug': DocumentCtrl,
    '/': IndexCtrl,
    '/404': ErrorCtrl,
    '/documents': DashboardCtrl
  });
  accessToken = app.env.get('access_token');
  console.log(accessToken);
  if (accessToken) {
    app.github = new Github({
      token: accessToken,
      auth: 'oauth'
    });
  }
  return app.setLayout('index').start();
});

},{"./controllers/AlwaysCtrl":2,"./controllers/DashboardCtrl":3,"./controllers/DocumentCtrl":4,"./controllers/ErrorCtrl":5,"./controllers/IndexCtrl":6,"./framework/App":7}],19:[function(require,module,exports){
var DocumentManagerService, Service, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Service = require('../framework/Service');

config = require('../config');

module.exports = DocumentManagerService = (function(_super) {
  __extends(DocumentManagerService, _super);

  function DocumentManagerService(github) {
    this.github = github;
    this.documents = {};
    this.repo = this.github.getRepo(config.username, config.repository);
  }

  DocumentManagerService.prototype.create = function(params, callback) {
    this.documents[params.slug] = {
      name: params.name,
      extension: params.extension,
      created: Date.now(),
      path: '',
      filename: params.slug + '.' + params.extension
    };
    return this.repo.write('master', 'documents.json', JSON.stringify(this.documents, null, 2), 'Create document ' + params.slug + ' in documents.json', (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.repo.branch(params.slug, function(err) {
          if (err) {
            return callback(err);
          }
          return callback();
        });
      };
    })(this));
  };

  DocumentManagerService.prototype.release = function(slug, filename, content, message, callback) {
    console.log('release', slug, filename, content, message);
    this.documents[slug].updated = Date.now();
    return this.repo.write('master', 'documents.json', JSON.stringify(this.documents, null, 2), 'Update draft ' + slug, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        console.log('documents.json updated', filename, content, message);
        return _this.repo.write('master', filename, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.saveDraft = function(slug, filename, content, message, callback) {
    console.log('saveDraft', slug, filename, content, message);
    this.documents[slug].updated = Date.now();
    return this.repo.write(slug, 'documents.json', JSON.stringify(this.documents, null, 2), 'Update draft ' + slug, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        console.log('documents.json updated', filename, content, message);
        return _this.repo.write(slug, filename, content, message, callback);
      };
    })(this));
  };

  DocumentManagerService.prototype.getDocument = function(slug, callback) {
    console.log('getDocument', slug, this.documents);
    if (Object.equal(this.documents, {})) {
      return this.repo.read('master', 'documents.json', (function(_this) {
        return function(err, data) {
          var doc;
          _this.documents = JSON.parse(data);
          doc = _this.documents[slug];
          return _this.repo.read(slug, doc.filename, function(err, content) {
            doc.lastVersion = content;
            return callback(doc);
          });
        };
      })(this));
    } else {
      return callback(this.documents[slug]);
    }
  };

  DocumentManagerService.prototype.getReleaseHistory = function(slug, callback) {
    if (!this.documents[slug]) {
      callback('not found', null);
    }
    return this.repo.getCommits({
      path: this.documents[slug].filename,
      sha: 'master'
    }, callback);
  };

  DocumentManagerService.prototype.getDocumentHistory = function(slug, callback) {
    if (!this.documents[slug]) {
      callback('not found', null);
    }
    return this.repo.getCommits({
      path: this.documents[slug].filename,
      sha: slug
    }, callback);
  };

  DocumentManagerService.prototype.mergeHistory = function(releaseHistory, documentHistory) {
    var history, v, _i, _j, _len, _len1;
    console.log(releaseHistory, documentHistory);
    history = new Array();
    for (_i = 0, _len = releaseHistory.length; _i < _len; _i++) {
      v = releaseHistory[_i];
      v.imgType = 'img/release-dot.png';
    }
    for (_j = 0, _len1 = documentHistory.length; _j < _len1; _j++) {
      v = documentHistory[_j];
      v.imgType = 'img/draft-dot.png';
    }
    history = releaseHistory.add(documentHistory);
    console.log(history);
    history = history.sortBy((function(elem) {
      return new Date(elem.commit.author.date);
    }), true);
    console.log(history);
    return history;
  };

  DocumentManagerService.prototype.diffToRelease = function(slug, callback) {
    return this.repo.compare('master', slug, callback);
  };

  DocumentManagerService.prototype.diff = function(slug, v1, v2) {};

  DocumentManagerService.prototype.list = function(callback) {
    return this.repo.read('master', 'documents.json', (function(_this) {
      return function(err, data) {
        var list, slug;
        if (!err) {
          _this.documents = JSON.parse(data);
        } else {
          _this.documents = {};
        }
        list = new Array();
        for (slug in _this.documents) {
          list.push($.extend({
            slug: slug
          }, _this.documents[slug]));
        }
        if (callback) {
          return callback(err, list);
        }
      };
    })(this));
  };

  return DocumentManagerService;

})(Service);

},{"../config":1,"../framework/Service":15}]},{},[18])
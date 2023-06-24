"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.createComponent = exports.render = exports.createDocument = exports.createDocumentFromFile = exports.registerComponent = exports.runOnce = exports.runOnLoaded = exports.runAtClient = exports.feature = exports.navigateTo = exports.registerRoute = exports.postMessage = exports.deviceSubscribesTo = exports.subscribeTo = exports.registerAllowedOrigin = void 0;
/**
 * URLPattern
 *
 * According to MDN Web Docs this is an experimental feature and is not supported by all browsers.
 * For this reason, if this feature is not supported then it defaults to importing urlpatter.min.js
 * which implements this feature.
 *
 * The import is wrapped in a self executing async function so that there are no problems with minifying
 * this file since some minifiers might crash on there being a high level await. The minifier has no
 * way of knowing that this file will be loaded as a module.
 */
(function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!globalThis.URLPattern) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./urlpattern.min.js'); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
})();
/**
 * ALLOWED ORIGINS
 *
 * Are the domains from iframe/child windows which are allowed to post messages to
 * the main application window. By default the domain of the main window is registered.
 */
var allowedOrigins = [''];
if (window.location)
    allowedOrigins.push(window.location.origin);
function registerAllowedOrigin(uri) {
    allowedOrigins.push(uri);
}
exports.registerAllowedOrigin = registerAllowedOrigin;
/**
 * SCRIPT HOST
 *
 * This file can be imported by a client or from code running in JSphere server. As a result the
 * scriptHost constant is an object which can used to determine which host is executing this file.
 */
var scriptHost = { server: (globalThis.Deno) ? true : false, client: (globalThis.Deno) ? false : true };
/**
 * MESSAGING
 *
 * This feature allows for message listeners, for a specific subject, to be registered. Mobile apps
 * using a WebView implementation can be setup to receive messages too. A message is an object with
 * properties subject and data. Message listeners are prioritized in the follwing order: mobile device,
 * client registered, then components (element).
 */
var registeredMessages = {};
var registeredDeviceMessages = {};
// THIS IS FOR MESSAGES POSTED TO THE WINDOW OBJECT FROM EITHER THE DEVICE OR AN IFRAME/CHILD WINDOW
globalThis.addEventListener('message', function (event) {
    var thisEvent = event;
    if (!thisEvent.data) {
        console.warn('An invalid message structure was received:', thisEvent.data);
        return;
    }
    var eventData = thisEvent.data;
    var eventOrigin = thisEvent.origin;
    var message = eventData.split('::');
    var subject = message[0];
    var data = message[1];
    var listenerFound = false;
    if (!subject) {
        console.warn('Missing message subject:', message);
        return;
    }
    if (!allowedOrigins.includes(eventOrigin)) {
        console.warn('Message origin not registered:', eventOrigin);
        return;
    }
    if (registeredDeviceMessages[subject]) {
        listenerFound = true;
        // iOS
        var deviceWindow = window;
        if ((deviceWindow).webkit) {
            deviceWindow.webkit.messageHandlers.Device.postMessage(eventData);
        }
        // Android
        else {
            deviceWindow.Device.postMessage(eventData);
        }
    }
    if (registeredMessages[subject]) {
        listenerFound = true;
        var jsonData = (data) ? JSON.parse(data) : {};
        registeredMessages[subject](jsonData);
    }
    var children = window.document.querySelectorAll("[data-listening]");
    var _loop_1 = function (childElement) {
        if (childElement._subscribedTo(subject)) {
            listenerFound = true;
            setTimeout(function () {
                var jsonData = (data) ? JSON.parse(data) : {};
                childElement._onMessageReceived(subject, jsonData);
            }, 0);
        }
    };
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var childElement = children_1[_i];
        _loop_1(childElement);
    }
    if (!listenerFound) {
        console.warn("No message listener was found for the subject '".concat(subject, "'"));
    }
}, false);
// SUBSCRIBE TO A MESSAGE SUBJECT
function subscribeTo(subject, func) {
    if (!subject || (typeof subject != 'string')) {
        console.warn('A subject must be specified when subscribing to a message:', subject);
        return;
    }
    registeredMessages[subject] = func;
}
exports.subscribeTo = subscribeTo;
// REGISTER MESSAGE SUBJECT THAT THE DEVICE SUBSCRIBES TO 
function deviceSubscribesTo(subject) {
    if (!subject || (typeof subject != 'string')) {
        console.warn('A subject must be specified when subscribing to a message:', subject);
        return;
    }
    registeredDeviceMessages[subject] = true;
}
exports.deviceSubscribesTo = deviceSubscribesTo;
// TRIGGER AN APPLICATION EVENT FOR EITHER THE APPLICATION OR THE DEVICE TO HANDLE
function postMessage(subject, data, target) {
    if (target === undefined)
        target = window;
    if (data === undefined)
        data = {};
    if (typeof target.postMessage != 'function')
        throw 'target: Must be a window object';
    target.postMessage("".concat(subject, "::").concat(JSON.stringify(data)));
}
exports.postMessage = postMessage;
/**
 * ROUTING
 *
 * This feature allows for the application to register routes that execute a route handler
 * when the browser url changes. A browser url change is done by calling the navigateTo
 * function which allows you to specify the path to update the browser bar with and a data
 * object that you would like to pass to the handler. This feature does not work if the
 * user directly enters a url into the broswer bar.
 */
var registeredRoutes = {};
// REGISTER ROUTES THAT THE APPLICATION RESPONDS TO WHEN navigateTo IS USED
function registerRoute(path, handler) {
    if (path === undefined || (typeof path != 'string')) {
        console.warn('A path must be specified when registering a route:', path);
        return;
    }
    if (typeof handler != 'function') {
        console.warn('A valid hanlder must be specified when registering a route:', handler);
        return;
    }
    registeredRoutes[path] = handler;
}
exports.registerRoute = registerRoute;
// THIS IS FOR WHEN THE URL HASH IS CHANGED
globalThis.addEventListener('popstate', function () { return __awaiter(void 0, void 0, void 0, function () {
    var path, _a, _b, _i, routePath, route, pattern, params, searchParams, _c, _d, _e, key, value;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                path = window.location.href;
                _a = [];
                for (_b in registeredRoutes)
                    _a.push(_b);
                _i = 0;
                _f.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                routePath = _a[_i];
                route = { path: routePath, handler: registeredRoutes[routePath] };
                pattern = new globalThis.URLPattern({ pathname: route.path });
                if (!pattern.test(path)) return [3 /*break*/, 3];
                params = pattern.exec(path).pathname.groups;
                if (params[0])
                    params = { path: params[0] };
                searchParams = new URLSearchParams(window.location.search);
                for (_c = 0, _d = searchParams.entries(); _c < _d.length; _c++) {
                    _e = _d[_c], key = _e[0], value = _e[1];
                    params[key] = value;
                }
                return [4 /*yield*/, route.handler(params)];
            case 2:
                _f.sent();
                return [3 /*break*/, 4];
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); }, false);
function navigateTo(path) {
    if (path === undefined)
        globalThis.dispatchEvent(new Event('popstate'));
    else if (path == window.location.pathname)
        return;
    else {
        if (typeof path != 'string') {
            console.warn('Provided path must of type string:', path);
            return;
        }
        window.history.pushState({}, '', path);
        dispatchEvent(new Event('popstate'));
    }
}
exports.navigateTo = navigateTo;
/**
 * FEATURE MANAGEMENT
 *
 * A simple implementation for flagging features.
 */
var Feature = /** @class */ (function () {
    function Feature(flags) {
        this.featureFlags = [];
        this.featureFlags = flags;
    }
    Feature.prototype.flag = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var prop, found, flags, _i, flags_1, flag;
            return __generator(this, function (_a) {
                for (prop in obj) {
                    found = false;
                    flags = prop.split(',');
                    for (_i = 0, flags_1 = flags; _i < flags_1.length; _i++) {
                        flag = flags_1[_i];
                        if (this.featureFlags.includes(flag) || flag == 'default') {
                            obj[prop]();
                            found = true;
                            break;
                        }
                    }
                    if (found)
                        break;
                }
                return [2 /*return*/];
            });
        });
    };
    return Feature;
}());
var featureFlags = (function () {
    if (scriptHost.client) {
        var featureFlags_1 = window.document.cookie.split('; ').find(function (row) { return row.startsWith('featureFlags='); });
        if (featureFlags_1)
            return featureFlags_1.split('=')[1].split(':');
    }
    return [];
})();
exports.feature = new Feature(featureFlags);
/**
 * RENDERING STATUS
 */
var RenderingStatus = /** @class */ (function () {
    function RenderingStatus() {
        this.rootElement = null;
    }
    Object.defineProperty(RenderingStatus.prototype, "document", {
        set: function (value) {
            this.rootElement = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderingStatus.prototype, "atClient", {
        get: function () {
            return this.rootElement.getAttribute('data-rendering-status') === 'client';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderingStatus.prototype, "atServer", {
        get: function () {
            return this.rootElement.getAttribute('data-rendering-status') === 'server';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderingStatus.prototype, "loaded", {
        get: function () {
            return this.rootElement.getAttribute('data-rendering-status') === null;
        },
        enumerable: false,
        configurable: true
    });
    return RenderingStatus;
}());
var renderingStatus = new RenderingStatus();
/**
 * HYDRATION FUNCTIONS
 */
function runAtClient(fn) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(renderingStatus.atClient || renderingStatus.loaded)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fn()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.runAtClient = runAtClient;
function runOnLoaded(fn) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!renderingStatus.loaded) return [3 /*break*/, 2];
                    return [4 /*yield*/, fn()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.runOnLoaded = runOnLoaded;
function runOnce(fn) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(renderingStatus.atServer || renderingStatus.loaded)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fn()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.runOnce = runOnce;
/**
 * COMPONENT MANAGEMENT
 */
var componentFactory = {};
function registerComponent(type, initFunction) {
    componentFactory[type] = initFunction;
}
exports.registerComponent = registerComponent;
/**
 * SERVER SIDE RENDERING
 */
function createDocumentFromFile(path, ctx, config) {
    return __awaiter(this, void 0, void 0, function () {
        var file, content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!scriptHost.server) return [3 /*break*/, 5];
                    return [4 /*yield*/, ctx.getPackageItem(path)];
                case 1:
                    file = _a.sent();
                    if (!file) return [3 /*break*/, 3];
                    content = new TextDecoder().decode(file.content);
                    return [4 /*yield*/, createDocument(content, ctx, config)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3: throw 'File Not Found';
                case 4: return [3 /*break*/, 6];
                case 5: return [2 /*return*/, ''];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.createDocumentFromFile = createDocumentFromFile;
function createDocument(html, ctx, config) {
    return __awaiter(this, void 0, void 0, function () {
        var document_1, appContext, _i, _a, item;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!scriptHost.server) return [3 /*break*/, 2];
                    document_1 = ctx.parser.parseFromString(html, 'text/html');
                    appContext = {
                        _componentTemplates: [],
                        document: document_1,
                        getResource: function (path) { return __awaiter(_this, void 0, void 0, function () {
                            var file, content;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, ctx.getPackageItem(path)];
                                    case 1:
                                        file = _a.sent();
                                        if (file) {
                                            content = new TextDecoder().decode(file.content);
                                            return [2 /*return*/, content];
                                        }
                                        else
                                            throw 'File Not Found';
                                        return [2 /*return*/];
                                }
                            });
                        }); },
                        importModule: function (url) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require(url + "?eTag=".concat(ctx.domain.hostname, ":").concat(ctx.domain.cacheDTS)); })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); },
                        loadCaptions: function (url) { return __awaiter(_this, void 0, void 0, function () {
                            var module, captions;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require(url + "?eTag=".concat(ctx.domain.hostname, ":").concat(ctx.domain.cacheDTS)); })];
                                    case 1:
                                        module = _a.sent();
                                        captions = module['captions'];
                                        return [2 /*return*/, function (value) {
                                                var args = [];
                                                for (var _i = 1; _i < arguments.length; _i++) {
                                                    args[_i - 1] = arguments[_i];
                                                }
                                                var caption = captions[value] || value;
                                                if (args && args.length > 0) {
                                                    for (var i = 0; i < args.length; i++) {
                                                        caption = caption.replaceAll('$' + (i + 1), args[i]);
                                                    }
                                                }
                                                return caption;
                                            }];
                                }
                            });
                        }); }
                    };
                    document_1.documentElement.setAttribute('data-rendering-status', 'server');
                    return [4 /*yield*/, render(document_1.documentElement, config, appContext)];
                case 1:
                    _b.sent();
                    for (_i = 0, _a = appContext._componentTemplates; _i < _a.length; _i++) {
                        item = _a[_i];
                        item.parent.insertBefore(item.template, item.parent.children[0]);
                    }
                    return [2 /*return*/, document_1.documentElement.outerHTML];
                case 2: return [2 /*return*/, ''];
            }
        });
    });
}
exports.createDocument = createDocument;
/**
 * COMPONENT RENDERING
 */
function render(element, config, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var children, _i, children_2, childElement, children, _a, children_3, childElement, children, _b, children_4, childElement;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    //debugger;
                    if (!element) {
                        element = window.document.documentElement;
                        renderingStatus.document = element;
                    }
                    else {
                        renderingStatus.document = element.ownerDocument.documentElement;
                    }
                    if (!ctx)
                        ctx = {
                            _componentTemplates: [],
                            document: renderingStatus.document,
                            getResource: function (path) { return __awaiter(_this, void 0, void 0, function () {
                                var response, content;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, fetch(path)];
                                        case 1:
                                            response = _a.sent();
                                            if (!(response.status === 200)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, response.text()];
                                        case 2:
                                            content = _a.sent();
                                            return [2 /*return*/, content];
                                        case 3: throw 'File Not Found';
                                    }
                                });
                            }); },
                            importModule: function (url) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require(url); })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); },
                            loadCaptions: function (url) { return __awaiter(_this, void 0, void 0, function () {
                                var module, captions;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require(url); })];
                                        case 1:
                                            module = _a.sent();
                                            captions = module['captions'];
                                            return [2 /*return*/, function (value) {
                                                    var args = [];
                                                    for (var _i = 1; _i < arguments.length; _i++) {
                                                        args[_i - 1] = arguments[_i];
                                                    }
                                                    var caption = captions[value] || value;
                                                    if (args && args.length > 0) {
                                                        for (var i = 0; i < args.length; i++) {
                                                            caption = caption.replaceAll('$' + (i + 1), args[i]);
                                                        }
                                                    }
                                                    return caption;
                                                }];
                                    }
                                });
                            }); }
                        };
                    createComponent(element, ctx);
                    if (!renderingStatus.atServer) return [3 /*break*/, 6];
                    element.setAttribute('data-id', 'root');
                    children = element.querySelectorAll('[data-id]');
                    _i = 0, children_2 = children;
                    _c.label = 1;
                case 1:
                    if (!(_i < children_2.length)) return [3 /*break*/, 5];
                    childElement = children_2[_i];
                    childElement.setAttribute('data-parent', 'root');
                    createComponent(childElement, ctx);
                    if (!childElement._render) return [3 /*break*/, 3];
                    return [4 /*yield*/, childElement._render(config)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    element._components[childElement.getAttribute('data-id')] = childElement;
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    element.setAttribute('data-rendering-status', 'client');
                    return [3 /*break*/, 18];
                case 6:
                    if (!renderingStatus.atClient) return [3 /*break*/, 12];
                    children = element.querySelectorAll('[data-parent="root"]');
                    _a = 0, children_3 = children;
                    _c.label = 7;
                case 7:
                    if (!(_a < children_3.length)) return [3 /*break*/, 11];
                    childElement = children_3[_a];
                    createComponent(childElement, ctx);
                    if (!childElement._render) return [3 /*break*/, 9];
                    return [4 /*yield*/, childElement._render(config)];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9:
                    element._components[childElement.getAttribute('data-id')] = childElement;
                    _c.label = 10;
                case 10:
                    _a++;
                    return [3 /*break*/, 7];
                case 11:
                    element.removeAttribute('data-rendering-status');
                    return [3 /*break*/, 18];
                case 12:
                    element.setAttribute('data-id', 'root');
                    children = element.querySelectorAll('[data-id]');
                    _b = 0, children_4 = children;
                    _c.label = 13;
                case 13:
                    if (!(_b < children_4.length)) return [3 /*break*/, 17];
                    childElement = children_4[_b];
                    childElement.setAttribute('data-parent', 'root');
                    createComponent(childElement, ctx);
                    if (!childElement._render) return [3 /*break*/, 15];
                    return [4 /*yield*/, childElement._render(config)];
                case 14:
                    _c.sent();
                    _c.label = 15;
                case 15:
                    element._components[childElement.getAttribute('data-id')] = childElement;
                    _c.label = 16;
                case 16:
                    _b++;
                    return [3 /*break*/, 13];
                case 17:
                    navigateTo();
                    _c.label = 18;
                case 18: return [2 /*return*/, element._components];
            }
        });
    });
}
exports.render = render;
globalThis.render = render;
/**
 * CREATE COMPONENT
 */
function createComponent(element, ctx) {
    var _this = this;
    if (element._extend)
        return;
    var _messageListeners = {};
    var _childComponents = {};
    var _state = {};
    var _template = null;
    Object.defineProperties(element, {
        '_extend': {
            value: function (obj) {
                var props = {};
                var _loop_2 = function (prop) {
                    if (prop == 'render') {
                        props['_' + prop] = {
                            value: function (props) { return __awaiter(_this, void 0, void 0, function () {
                                var propObject, attrs, _i, _a, attr;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (typeof props !== 'object')
                                                props = {};
                                            if (element._renderAtClient && scriptHost.server)
                                                return [2 /*return*/];
                                            propObject = obj[prop];
                                            attrs = {};
                                            for (_i = 0, _a = element.attributes; _i < _a.length; _i++) {
                                                attr = _a[_i];
                                                if (attr.name.startsWith('data-is-')) {
                                                    attrs[attr.name.substring(8)] = attr.value || true;
                                                }
                                            }
                                            props = Object.assign(attrs, props);
                                            return [4 /*yield*/, propObject(Object.freeze(props))];
                                        case 1:
                                            _b.sent();
                                            if (renderingStatus.atServer) {
                                                element.setAttribute('data-is-state', JSON.stringify(_state));
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        };
                    }
                    else if (typeof obj[prop] === 'function') {
                        props['_' + prop] = { value: obj[prop] };
                    }
                    else
                        props['_' + prop] = obj[prop];
                };
                for (var prop in obj) {
                    _loop_2(prop);
                }
                Object.defineProperties(element, props);
            }
        },
        '_components': {
            get: function () {
                return _childComponents;
            }
        },
        '_onMessageReceived': {
            value: function (subject, data) {
                if (_messageListeners[subject])
                    _messageListeners[subject](data);
            }
        },
        '_renderAtClient': {
            get: function () {
                return element.getAttribute('data-render-at') === 'client';
            }
        },
        '_subscribedTo': {
            value: function (subject) {
                return (_messageListeners[subject]) ? true : false;
            }
        },
        '_subscribeTo': {
            value: function (subject, func) {
                _messageListeners[subject] = func;
                element.setAttribute('data-listening', 'true');
            }
        },
        '_template': {
            set: function (value) {
                _template = value;
            },
            get: function () {
                return _template;
            }
        },
        '_unsubscribeTo': {
            value: function (subject) {
                delete _messageListeners[subject];
                if (Object.keys(_messageListeners).length === 0)
                    element.removeAttribute('data-listening');
            }
        },
        '_useState': {
            value: function (state, obj) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (renderingStatus.atClient) {
                        if (element.hasAttribute('data-is-state')) {
                            Object.assign(state, obj);
                            Object.assign(state, JSON.parse(element.getAttribute('data-is-state')));
                            element.removeAttribute('data-is-state');
                        }
                    }
                    else {
                        Object.assign(state, obj);
                        _state = state;
                    }
                    return [2 /*return*/, state];
                });
            }); }
        },
        '_useTemplate': {
            value: function (template, func) {
                if (renderingStatus.atServer) {
                    template = sanitize(template);
                    _childComponents = {};
                    loadTemplate(element, template);
                    parseTemplate(element, ctx);
                }
                else if (renderingStatus.atClient) {
                    if (element._renderAtClient) {
                        _childComponents = {};
                        loadTemplate(element, template);
                    }
                    parseTemplate(element, ctx);
                }
                else {
                    if (func) {
                        setTimeout(function () {
                            if (template.startsWith('/') && template === element.getAttribute('data-view-template'))
                                return;
                            _childComponents = {};
                            loadTemplate(element, template);
                            parseTemplate(element, ctx);
                            func();
                        }, 0);
                    }
                    else {
                        _childComponents = {};
                        loadTemplate(element, template);
                        parseTemplate(element, ctx);
                    }
                }
                return element._components;
            }
        },
        '_useTemplateUrl': {
            value: function (url, func) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!renderingStatus.atServer) return [3 /*break*/, 2];
                            _childComponents = {};
                            return [4 /*yield*/, loadTemplateUrl(element, ctx, url)];
                        case 1:
                            _a.sent();
                            parseTemplate(element, ctx);
                            return [3 /*break*/, 8];
                        case 2:
                            if (!renderingStatus.atClient) return [3 /*break*/, 5];
                            if (!element._renderAtClient) return [3 /*break*/, 4];
                            _childComponents = {};
                            return [4 /*yield*/, loadTemplateUrl(element, ctx, url)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            parseTemplate(element, ctx);
                            return [3 /*break*/, 8];
                        case 5:
                            if (!func) return [3 /*break*/, 6];
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (url === element.getAttribute('data-view-template'))
                                                return [2 /*return*/];
                                            _childComponents = {};
                                            return [4 /*yield*/, loadTemplateUrl(element, ctx, url)];
                                        case 1:
                                            _a.sent();
                                            parseTemplate(element, ctx);
                                            func();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 0);
                            return [3 /*break*/, 8];
                        case 6:
                            if (url === element.getAttribute('data-view-template'))
                                return [2 /*return*/];
                            _childComponents = {};
                            return [4 /*yield*/, loadTemplateUrl(element, ctx, url)];
                        case 7:
                            _a.sent();
                            parseTemplate(element, ctx);
                            _a.label = 8;
                        case 8: return [2 /*return*/, element._components];
                    }
                });
            }); }
        }
    });
    var type = element.getAttribute('data-is');
    if (type) {
        if (componentFactory[type])
            componentFactory[type](element, ctx);
        else
            console.warn("The component type '".concat(type, "' is not registered."));
    }
}
exports.createComponent = createComponent;
/**
 * LOAD TEMPLATE
 */
function loadTemplate(element, template) {
    if (!template)
        return;
    if (renderingStatus.atClient && (element.getAttribute('data-view-template') !== null))
        return;
    element.setAttribute('data-view-template', 'component');
    element.innerHTML = template;
}
function loadTemplateUrl(element, ctx, url) {
    return __awaiter(this, void 0, void 0, function () {
        var template;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!url)
                        return [2 /*return*/];
                    if (renderingStatus.atClient && (element.getAttribute('data-view-template') !== null))
                        return [2 /*return*/];
                    element.setAttribute('data-view-template', url);
                    return [4 /*yield*/, ctx.getResource(url)];
                case 1:
                    template = _a.sent();
                    element.innerHTML = template;
                    return [2 /*return*/];
            }
        });
    });
}
function parseTemplate(element, ctx) {
    if (renderingStatus.atServer) {
        var templates = element.querySelectorAll('template');
        for (var _i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
            var template = templates_1[_i];
            ctx._componentTemplates.push({ parent: template.parentElement, template: template });
            template.parentElement._template = template.parentElement.removeChild(template);
        }
        var children = element.querySelectorAll('[data-id]');
        for (var _a = 0, children_5 = children; _a < children_5.length; _a++) {
            var childElement = children_5[_a];
            childElement.setAttribute('data-parent', element.getAttribute('data-id'));
            createComponent(childElement, ctx);
            element._components[childElement.getAttribute('data-id')] = childElement;
        }
    }
    else if (renderingStatus.atClient) {
        var templates = element.querySelectorAll('template');
        for (var _b = 0, templates_2 = templates; _b < templates_2.length; _b++) {
            var template = templates_2[_b];
            template.parentElement._template = template;
        }
        if (element._renderAtClient) {
            var children = element.querySelectorAll('[data-id]');
            for (var _c = 0, children_6 = children; _c < children_6.length; _c++) {
                var childElement = children_6[_c];
                childElement.setAttribute('data-parent', element.getAttribute('data-id'));
                createComponent(childElement, ctx);
                element._components[childElement.getAttribute('data-id')] = childElement;
            }
        }
        else {
            var children = element.querySelectorAll("[data-parent=\"".concat(element.getAttribute('data-id'), "\"]"));
            for (var _d = 0, children_7 = children; _d < children_7.length; _d++) {
                var childElement = children_7[_d];
                createComponent(childElement, ctx);
                element._components[childElement.getAttribute('data-id')] = childElement;
            }
        }
    }
    else {
        var templates = element.querySelectorAll('template');
        for (var _e = 0, templates_3 = templates; _e < templates_3.length; _e++) {
            var template = templates_3[_e];
            template.parentElement._template = template;
        }
        var children = element.querySelectorAll('[data-id]');
        for (var _f = 0, children_8 = children; _f < children_8.length; _f++) {
            var childElement = children_8[_f];
            createComponent(childElement, ctx);
            element._components[childElement.getAttribute('data-id')] = childElement;
        }
    }
}
function sanitize(code) {
    var sanitizedCode = code.replaceAll(/\?eTag=[a-zA-Z0-9:]+[\"]/g, '\"').replaceAll(/\?eTag=[a-zA-Z0-9:]+[\']/g, '\'');
    return sanitizedCode;
}
/**
 * REPEATER COMPONENT
 */
registerComponent('Repeater', function (element, ctx) {
    element._extend({
        render: {
            value: function (props) {
                element._useTemplate('');
                element._visible = props.visible || true;
            }
        },
        add: {
            value: function (id) {
                var clone;
                var children; //NodeListOf<HTMLElement>;
                if (!element._components[id]) {
                    clone = element._template.content.firstElementChild.cloneNode(true);
                    clone.setAttribute("data-id", id);
                    clone.setAttribute("data-parent", element.getAttribute("data-id"));
                    element.appendChild(clone);
                    createComponent(clone, ctx);
                    element._components[id] = clone;
                    children = clone.querySelectorAll('[data-id]');
                }
                else {
                    clone = element._components[id];
                    children = clone.querySelectorAll("[data-parent=\"".concat(id, "\"]"));
                }
                for (var _i = 0, children_9 = children; _i < children_9.length; _i++) {
                    var childElement = children_9[_i];
                    (childElement).setAttribute("data-parent", id);
                    createComponent(childElement, ctx);
                    clone._components[childElement.getAttribute('data-id')] = childElement;
                }
                return clone._components;
            }
        },
        removeAll: {
            value: function () {
                if (renderingStatus.loaded) {
                    element.innerHTML = '';
                    for (var item in element._components) {
                        delete element._components[item];
                    }
                }
            }
        },
        visible: {
            set: function (value) {
                element.style.display = (value) ? '' : 'none';
            },
            get: function () {
                return element.style.display === '';
            }
        }
    });
});

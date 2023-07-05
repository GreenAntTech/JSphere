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
(async function () {
    if (!window.URLPattern)
        await import('./urlpattern.min.js');
})()

/**
 * ALLOWED ORIGINS
 * 
 * Are the domains from iframe/child windows which are allowed to post messages to
 * the main application window. By default the domain of the main window is registered.
 */

const allowedOrigins = [''];
if (window.location) allowedOrigins.push(window.location.origin);

export function registerAllowedOrigin(uri) {
    allowedOrigins.push(uri);
}

/**
 * SCRIPT HOST
 * 
 * This file can be imported by a client or from code running in JSphere server. As a result the
 * scriptHost constant is an object which can used to determine which host is executing this file.
 */

const scriptHost = { server: (globalThis.Deno) ? true : false, client: (globalThis.Deno) ? false : true };

/**
 * MESSAGING
 * 
 * This feature allows for message listeners, for a specific subject, to be registered. Mobile apps
 * using a WebView implementation can be setup to receive messages too. A message is an object with
 * properties subject and data. Message listeners are prioritized in the follwing order: mobile device,
 * client registered, then components (element).
 */

const registeredMessages = {};
const registeredDeviceMessages = {};

// THIS IS FOR MESSAGES POSTED TO THE WINDOW OBJECT FROM EITHER THE DEVICE OR AN IFRAME/CHILD WINDOW
globalThis.addEventListener('message', (event) => {
    if (!event.data) {
        console.warn('An invalid message structure was received:', event.data);
        return;
    }
    const message = (event.data) ? event.data.split('::') : '';
    const subject = message[0];
    const data = message[1];
    let listenerFound = false;
    if (!subject) {
        console.warn('Missing message subject:', message);
        return;
    }
    if (!allowedOrigins.includes(event.origin)) {
        console.warn('Message origin not registered:', event.origin);
        return;
    }
    if (registeredDeviceMessages[subject]) {
        listenerFound = true;
        // iOS
        if (window.webkit) {
            window.webkit.messageHandlers.Device.postMessage(event.data);
        }
        // Android
        else {
            window.Device.postMessage(event.data);
        }
    }
    if (registeredMessages[subject]) {
        listenerFound = true;
        const jsonData = (data) ? JSON.parse(data) : {};
        registeredMessages[subject](jsonData);
    }
    const children = document.querySelectorAll(`[data-listening]`);
    for (const childElement of children) {
        if (childElement._subscribedTo(subject)) {
            listenerFound = true;
            setTimeout(() => {
                const jsonData = (data) ? JSON.parse(data) : {};
                childElement._onMessageReceived(subject, jsonData);
            }, 0);
        }
    }
    if (!listenerFound) {
        console.warn(`No message listener was found for the subject '${subject}'`);
    }
}, false);

// SUBSCRIBE TO A MESSAGE SUBJECT
export function subscribeTo (subject, func) {
    if (!subject || (typeof subject != 'string')) {
        console.warn('A subject must be specified when subscribing to a message:', subject);
        return;
    }
    registeredMessages[subject] = func;
}

// REGISTER MESSAGE SUBJECT THAT THE DEVICE SUBSCRIBES TO 
export function deviceSubscribesTo (subject) {
    if (!subject || (typeof subject != 'string')) {
        console.warn('A subject must be specified when subscribing to a message:', subject);
        return;
    }
    registeredDeviceMessages[subject] = true;
}

// TRIGGER AN APPLICATION EVENT FOR EITHER THE APPLICATION OR THE DEVICE TO HANDLE
export function postMessage (subject, data, target) {
    if (target === undefined) target = window;
    if (data === undefined) data = {};
    if (typeof target.postMessage != 'function') throw 'target: Must be a window object';
    target.postMessage(`${subject}::${JSON.stringify(data)}`);
}

/**
 * ROUTING
 * 
 * This feature allows for the application to register routes that execute a route handler
 * when the browser url changes. A browser url change is done by calling the navigateTo
 * function which allows you to specify the path to update the browser bar with and a data
 * object that you would like to pass to the handler. This feature does not work if the
 * user directly enters a url into the broswer bar.
 */

const registeredRoutes = {};

// REGISTER ROUTES THAT THE APPLICATION RESPONDS TO WHEN navigateTo IS USED
export function registerRoute (path, handler) {
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

// THIS IS FOR WHEN THE URL HASH IS CHANGED
globalThis.addEventListener('popstate', async () => {
    const path = window.location.href;
    for (const routePath in registeredRoutes) {
        const route = { path: routePath, handler: registeredRoutes[routePath] };
        const pattern = new window.URLPattern({ pathname: route.path });
        if (pattern.test(path)) {
            let params = pattern.exec(path).pathname.groups;
            if (params[0]) params = { path: params[0] };
            const searchParams = new URLSearchParams(window.location.search);
            for(const [key, value] of searchParams.entries()) {
                params[key] = value; 
             }
            await route.handler(params);
            break;
        }
    }
}, false);

export function navigateTo (path) {
    if (path === undefined) globalThis.dispatchEvent(new Event('popstate'));
    else if (path == window.location.pathname) return;
    else {
        if (typeof path != 'string') {
            console.warn('Provided path must of type string:', path);
            return;
        }
        window.history.pushState({}, '', path);
        dispatchEvent(new Event('popstate'));
    }
}

/**
 * FEATURE MANAGEMENT
 * 
 * A simple implementation for flagging features.
 */

class Feature {
    featureFlags = [];

    constructor(flags) {
        this.featureFlags = flags;
    }

    flag(obj) {
        for (const prop in obj)  {
            let found = false;
            const flags = prop.split(',');
            for (const flag of flags) {
                if (this.featureFlags.includes(flag) || flag == 'default') {
                    obj[prop]();
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }
}

const featureFlags = (function () {
    if (scriptHost.client) {
        const featureFlags = window.document.cookie.split('; ').find((row) => row.startsWith('featureFlags='));
        if (featureFlags) return featureFlags.split('=')[1].split(':');
    }
    return [];
})();

export const feature = new Feature(featureFlags);

/**
 * RENDERING STATUS
 */

class RenderingStatus {

    rootElement = null;
    
    set document (value) {
        this.rootElement = value;
    }

    get atClient () {
        return this.rootElement.getAttribute('data-rendering-status') === 'client';
    }

    get atServer () {
        return this.rootElement.getAttribute('data-rendering-status') === 'server';
    }

    get loaded () {
        return this.rootElement.getAttribute('data-rendering-status') === null;
    }
}

const renderingStatus = new RenderingStatus();

/**
 * HYDRATION FUNCTIONS
 */

export async function runAtClient(fn) {
    if (renderingStatus.atClient || renderingStatus.loaded) await fn();
}

export async function runOnLoaded(fn) {
    if (renderingStatus.loaded) await fn();
}

export async function runOnce(fn) {
    if (renderingStatus.atServer || renderingStatus.loaded) await fn();
}

/**
 * COMPONENT MANAGEMENT
 */

const componentFactory = {};

export function registerComponent(type, initFunction) {
    componentFactory[type] = initFunction;
}

/**
 * SERVER SIDE RENDERING
 */

export async function createDocumentFromFile (path, ctx, config) {
    if (scriptHost.server) {
        const file = await ctx.getPackageItem(path);
        if (file) {
            const content = new TextDecoder().decode(file.content);
            return await createDocument(content, ctx, config)
        }
        else throw 'File Not Found';
    }
    else {
        return '';
    }
}

export async function createDocument (html, ctx, config) {
    if (scriptHost.server) {
        const document = ctx.parser.parseFromString(html, 'text/html');

        const appContext = {
            _componentTemplates: [],
            document,
            getResource: async (path) => {
                const file = await ctx.getPackageItem(path);
                if (file) {
                    const content = new TextDecoder().decode(file.content);
                    return content;
                }
                else throw 'File Not Found';
            },
            importModule: async (url) => {
                return await import(url + `?eTag=${ctx.domain.hostname}:${ctx.domain.cacheDTS}`);
            },
            loadCaptions: async (url) => {
                const module = await import(url + `?eTag=${ctx.domain.hostname}:${ctx.domain.cacheDTS}`);
                const captions = module['captions'];
                return (value, ...args) => {
                    let caption = captions[value] || value;
                    if (args && args.length > 0) {
                        for (let i = 0; i < args.length; i++) {
                            caption = caption.replaceAll('$' + (i + 1), args[i]);
                        }
                    }
                    return caption;
                }
            }
        }

        document.documentElement.setAttribute('data-rendering-status', 'server');

        await render(config, document.documentElement, appContext);

        for (const item of appContext._componentTemplates) {
            item.parent.insertBefore(item.template, item.parent.children[0]);
        }    
    
        return document.documentElement.outerHTML;    
    }
    else {
        return '';
    }
}

/**
 * COMPONENT RENDERING
 */

export async function render (config, element, ctx) {
    //debugger;
    if (!element) {
        element = document.documentElement;
        renderingStatus.document = element;
    }
    else {
        renderingStatus.document = element.ownerDocument.documentElement;
    }

    if (!ctx) ctx = {
        _componentTemplates: [] ,
        document: renderingStatus.document,
        getResource: async (path) => {
            const response = await fetch(path);
            if (response.status === 200) {
                const content = await response.text();
                return content;
            }
            else throw 'File Not Found';
        },
        importModule: async (url) => {
            return await import(url);
        },
        loadCaptions: async (url) => {
            const module = await import(url);
            const captions = module['captions'];
            return (value, ...args) => {
                let caption = captions[value] || value;
                if (args && args.length > 0) {
                    for (let i = 0; i < args.length; i++) {
                        caption = caption.replaceAll('$' + (i + 1), args[i]);
                    }
                }
                return caption;
            }
        }
    }

    createComponent(element, ctx);

    if (renderingStatus.atServer) {
        element.setAttribute('data-id', 'root');
        const children = element.querySelectorAll('[data-id]');
        for (const childElement of children) {
            childElement.setAttribute('data-parent', 'root');
            createComponent(childElement, ctx);
            if (childElement._render) await childElement._render(config);
            element._components[childElement.getAttribute('data-id')] = childElement;
        }
        element.setAttribute('data-rendering-status', 'client');
    }
    else if (renderingStatus.atClient) {
        const children = element.querySelectorAll('[data-parent="root"]');
        for (const childElement of children) {
            createComponent(childElement, ctx);
            if (childElement._render) await childElement._render(config);
            element._components[childElement.getAttribute('data-id')] = childElement;
        }
        element.removeAttribute('data-rendering-status');
    }
    else {
        element.setAttribute('data-id', 'root');
        const children = element.querySelectorAll('[data-id]');
        for (const childElement of children) {
            childElement.setAttribute('data-parent', 'root')
            createComponent(childElement, ctx);
            if (childElement._render) await childElement._render(config);
            element._components[childElement.getAttribute('data-id')] = childElement;
        }
        navigateTo();
    }
    return element._components;
}

/**
 * CREATE COMPONENT
 */

export function createComponent (element, ctx) {
    if (element._extend) return;

    const _messageListeners = {};
    let _childComponents = {};
    let _state = {};
    let _template = null;

    Object.defineProperties(element, {
        '_extend': {
            value: (obj) => {
                const props = {};
                for (const prop in obj) {
                    if (prop == 'render') {
                        props['_' + prop] = {
                            value: async (props) => {
                                if (typeof props !== 'object') props = {};
                                if (element._renderAtClient && scriptHost.server) return;
                                const propObject = obj[prop]
                                const attrs = {};
                                for (const attr of element.attributes) {
                                    if (attr.name.startsWith('data-is-')) {
                                        attrs[attr.name.substring(8)] = attr.value || true;
                                    }
                                }
                                props = Object.assign(attrs, props);
                                await propObject(props);
                                if (renderingStatus.atServer) {
                                    element.setAttribute('data-is-state', JSON.stringify(_state));
                                }
                            }
                        }
                    }
                    else if (typeof obj[prop] === 'function') {
                        props['_' + prop] = { value: obj[prop] };
                    }
                    else props['_' + prop] = obj[prop];
                }
                Object.defineProperties(element, props);
            }
        },
        '_components': {
            get: () => {
                return _childComponents;
            }
        },
        '_onMessageReceived': {
            value: (subject, data) => {
                if (_messageListeners[subject]) _messageListeners[subject](data);
            }
        },
        '_renderAtClient': {
            get: () => {
                return element.getAttribute('data-render-at') === 'client';
            }
        },
        '_subscribedTo': {
            value: (subject) => {
                return (_messageListeners[subject]) ? true : false;
            }
        },
        '_subscribeTo': {
            value: (subject, func) => {
                _messageListeners[subject] = func;
                element.setAttribute('data-listening', 'true');
            }
        },
        '_template': {
            set: (value ) => {
                _template = value;
            },
            get: () => {
                return _template;
            }
        },
        '_unsubscribeTo': {
            value: (subject) => {
                delete _messageListeners[subject];
                if (Object.keys(_messageListeners).length === 0) element.removeAttribute('data-listening');
            }
        },
        '_useState': {
            value: (state, obj) => {
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
                return state;
            }
        },
        '_useTemplate': {
            value: (template, func) => {
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
                        setTimeout(() => {
                            if (template.startsWith('/') && template === element.getAttribute('data-view-template')) return;
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
            value: async (url, func) => {
                if (renderingStatus.atServer) {
                    _childComponents = {};
                    await loadTemplateUrl(element, ctx, url);
                    parseTemplate(element, ctx);
                }
                else if (renderingStatus.atClient) {
                    if (element._renderAtClient) {
                        _childComponents = {};
                        await loadTemplateUrl(element, ctx, url);
                    }
                    parseTemplate(element, ctx);
                }
                else {
                    if (func) {
                        setTimeout(async () => {
                            if (url === element.getAttribute('data-view-template')) return;
                            _childComponents = {};
                            await loadTemplateUrl(element, ctx, url);
                            parseTemplate(element, ctx);
                            func();
                        }, 0);                    
                    }
                    else {
                        if (url === element.getAttribute('data-view-template')) return;
                        _childComponents = {};
                        await loadTemplateUrl(element, ctx, url);
                        parseTemplate(element, ctx);
                    }    
                }
                return element._components;
            }
        }
    });

    const type = element.getAttribute('data-is');
    if (type) {
        if (componentFactory[type]) componentFactory[type](element, ctx);
        else console.warn(`The component type '${type}' is not registered.`);
    }
}

/**
 * LOAD TEMPLATE
 */

function loadTemplate (element, template) {
    if (!template) return;
    if (renderingStatus.atClient && (element.getAttribute('data-view-template') !== null)) return;
    element.setAttribute('data-view-template', 'component');
    element.innerHTML = template;
}

async function loadTemplateUrl (element, ctx, url) {
    if (!url) return;
    if (renderingStatus.atClient && (element.getAttribute('data-view-template') !== null)) return;
    element.setAttribute('data-view-template', url);
    const template = await ctx.getResource(url);
    element.innerHTML = template;
}

function parseTemplate (element, ctx) {
    if (renderingStatus.atServer) {
        const templates = element.querySelectorAll('template');
        for (const template of templates) {
            ctx._componentTemplates.push({parent: template.parentElement, template});
            template.parentElement._template = template.parentElement.removeChild(template);
        }        
        const children = element.querySelectorAll('[data-id]');
        for (const childElement of children) {
            childElement.setAttribute('data-parent', element.getAttribute('data-id'));
            createComponent(childElement, ctx);
            element._components[childElement.getAttribute('data-id')] = childElement;
        }
    }
    else if (renderingStatus.atClient) {
        const templates = element.querySelectorAll('template');
        for (const template of templates) {
            template.parentElement._template = template;
        }
        if (element._renderAtClient) {
            const children = element.querySelectorAll('[data-id]');
            for (const childElement of children) {
                childElement.setAttribute('data-parent', element.getAttribute('data-id'));
                createComponent(childElement, ctx);
                element._components[childElement.getAttribute('data-id')] = childElement;
            }
        }
        else {
            const children = element.querySelectorAll(`[data-parent="${element.getAttribute('data-id')}"]`);
            for (const childElement of children) {
                createComponent(childElement, ctx);
                element._components[childElement.getAttribute('data-id')] = childElement;
            }    
        }
    }
    else {
        const templates = element.querySelectorAll('template');
        for (const template of templates) {
            template.parentElement._template = template;
        }        
        const children = element.querySelectorAll('[data-id]');
        for (const childElement of children) {
            createComponent(childElement, ctx);
            element._components[childElement.getAttribute('data-id')] = childElement;
        }    
    }
}

function sanitize (code)  {
    const sanitizedCode = code.replaceAll(/\?eTag=[a-zA-Z0-9:]+[\"]/g, '\"').replaceAll(/\?eTag=[a-zA-Z0-9:]+[\']/g, '\'');
    return sanitizedCode;
}

/**
 * REPEATER COMPONENT
 */

registerComponent('Repeater', (element, ctx) => {
    element._extend({
        render: (props) => {
            element._useTemplate('');
            element._visible = props.visible || true;
        },
        add: (id) => {
            let clone;
            let children;
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
                children = clone.querySelectorAll(`[data-parent="${id}"]`);
            }
            for (const childElement of children) {
                childElement.setAttribute("data-parent", id);
                createComponent(childElement, ctx);
                clone._components[childElement.getAttribute('data-id')] = childElement;
            }
            return clone._components;           
        },
        removeAll: () => {
            if (renderingStatus.loaded) {
                element.innerHTML = '';
                for (const item in element._components) {
                    delete element._components[item];
                }
            }
        },
        visible: {
            set: (value) => {
                element.style.display = (value) ? '' : 'none';
            },
            get: () => {
                return element.style.display === '';
            }
        }
    });
});

/**
 * LINK COMPONENT
 */

registerComponent('Link', (element) => {
    
    element._extend({
        render: (props) => {
            if ((typeof props.onclick !== 'function') && element.hasAttribute('onclick')) props.onclick = element.onclick;
            element._disabled = props.disabled ? true : false;
            element._hidden = props.hidden ? true : false;
            element._href = props.href;
            element._onclick = props.onclick || (() => {});
            element._value = props.value;
        },
        click: () => {
            element.click();
        },
        disabled: {
            set: (value) => {
                if (typeof value != 'boolean') return;
                if (value) {
                    element.setAttribute('disabled', 'true');
                }
                else {
                    element.removeAttribute('disabled');
                }
            },
            get: () => {
                return element.getAttribute('disabled') ? true : false;
            }
        },
        hidden: {
            set: (value) => {
                if (typeof value != 'boolean') return;
                element.style.display = (value) ? 'none' : 'inline-block';
            },
            get: () => {
                return element.style.display == 'none';
            }
        },
        href: {
            set: (value) => {
                if (typeof value != 'string') return;
                element.href = value;
            },
            get: () => {
                return element.href;
            }            
        },
        onclick: {
            set: (value) => {
                if (typeof value != 'function') return;
                element.onclick = (event) => { 
                    if (element._disabled || element._hidden) return;
                    if (value() === false) return;
                    navigateTo(element._href);
                    event.preventDefault();
                };
            }
        },
        value: {
            set: (value) => {
                if (typeof value != 'string') return;
                element.innerHTML = value;
            },
            get: () => {
                return element.innerHTML;
            }            
        }
    });
});
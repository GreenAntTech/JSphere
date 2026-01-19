console.log('elementJS:', 'v1.0.0-preview.253');
let idCount = 0;
const appContext = {
    server: globalThis.Deno ? true : false,
    client: globalThis.Deno ? false : true,
    documentElement: null,
    ctx: null
};
class Feature {
    featureFlags = [];
    constructor(flags){
        this.featureFlags = flags;
    }
    async flag(obj) {
        for(const prop in obj){
            let found = false;
            const flags = prop.split(',');
            for (const flag of flags){
                if (this.featureFlags.includes(flag) || flag == 'default') {
                    await obj[prop]();
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }
}
class RenderError extends Error {
    constructor(message){
        super(message);
        this.name = 'RenderError';
    }
}
class Prop {
    boundFunction = ()=>{};
    propValue = undefined;
    constructor(value){
        this.propValue = value;
    }
    get value() {
        return this.propValue;
    }
    set value(value) {
        this.propValue = value;
        this.boundFunction(this.propValue);
    }
    onChange(fn) {
        this.boundFunction = fn;
    }
}
class StateProp {
    _propValue = undefined;
    _statePath = undefined;
    _onChange = ()=>{};
    constructor(statePath, value, fn){
        this._statePath = statePath;
        this._propValue = value;
        this._onChange = fn;
    }
    get statePath() {
        return this._statePath;
    }
    set statePath(value) {
        this._statePath = value;
    }
    get value() {
        return this._propValue;
    }
    set value(value) {
        this._propValue = value;
    }
    onChange(fn) {
        this._onChange(fn);
    }
}
function processEvent(event) {
    try {
        let message;
        try {
            message = JSON.parse(event.data);
        } catch (e) {
            e && console.warn('Received unparsable message:', event.data);
            return;
        }
        if (!isValidMessage(message)) {
            console.warn('Invalid message structure:', message);
            return;
        }
        const subject = message.subject;
        const data = message.data;
        let listenerFound = false;
        if (!registeredAllowedOrigins.includes(event.origin)) {
            console.warn('Message origin not registered:', event.origin);
            return;
        }
        if (registeredDeviceMessages[subject]) {
            listenerFound = true;
            if (window.webkit) {
                window.webkit.messageHandlers.Device.postMessage(event.data);
            } else {
                window.Device.postMessage(event.data);
            }
        }
        if (registeredMessages[subject]) {
            listenerFound = true;
            registeredMessages[subject](data, appContext.ctx);
        }
        const children = document.documentElement.querySelectorAll(`[el-listening]`);
        for (const childElement of children){
            if (childElement.is$ && childElement.listensFor$(subject)) {
                listenerFound = true;
                setTimeout(async ()=>{
                    await childElement.onMessageReceived$(subject, data);
                }, 0);
            }
        }
        if (!listenerFound) {
            console.warn(`No message listener was found for the subject '${subject}'`);
        }
    } catch (e) {
        console.warn('Failed to parse message:', e);
    }
}
function isValidMessage(data) {
    return typeof data === 'object' && data !== null && 'subject' in data && typeof data.subject === 'string';
}
globalThis.addEventListener('message', processEvent, false);
globalThis.addEventListener('popstate', async ()=>{
    setExtendedURL(globalThis.location);
    for(const routePath in registeredRoutes){
        const route = {
            path: routePath,
            handler: registeredRoutes[routePath]
        };
        const pattern = new globalThis.URLPattern({
            pathname: route.path
        });
        if (pattern.test(extendedURL.href)) {
            await route.handler();
            break;
        }
    }
}, false);
const extendedURL = {};
const feature = new Feature(getFeatureFlags());
const registeredAllowedOrigins = [
    ''
];
const registeredCaptions = {};
const registeredComponents = {};
const registeredDependencies = {};
const registeredServerDependencies = {};
const registeredDeviceMessages = {};
const registeredMessages = {};
const registeredRoutes = {};
const resourceCache = new Map();
let intersectionObserver;
(function() {
    if (globalThis.location) registerAllowedOrigin(globalThis.location.origin);
})();
function createComponent(param1, param2) {
    if (typeof param1 == 'string') {
        registeredComponents[param1] = param2;
        return param1;
    } else {
        registeredComponents[param1.name] = param1;
        return param1.name;
    }
}
function deviceSubscribesTo(subject) {
    registeredDeviceMessages[subject] = true;
}
async function emitMessage(subject, data, target) {
    const docEl = appContext.server ? appContext.documentElement : document.documentElement;
    const el = docEl.querySelector(`[el-active]`);
    if (el) {
        if (el.is$ && el.listensFor$(subject)) {
            await el.onMessageReceived$(subject, data);
        } else if (registeredMessages[subject]) {
            await registeredMessages[subject](data, appContext.ctx);
        }
    } else {
        if (target === undefined) target = window;
        if (data === undefined) data = {};
        if (typeof target.postMessage != 'function') throw new Error('target: Must be a window object');
        target.postMessage(JSON.stringify({
            subject,
            data
        }));
    }
}
function navigateTo(path) {
    if (path === undefined) globalThis.dispatchEvent(new Event('popstate'));
    else if (path == globalThis.location.pathname) return;
    else {
        globalThis.history.pushState({}, '', path);
        dispatchEvent(new Event('popstate'));
    }
}
async function elementFetch(path, options = {
    headers: []
}) {
    let url = path;
    if (appContext.server) {
        url = `${extendedURL.protocol}//127.0.0.1:${extendedURL.port || '80'}${path}`;
        if (options && options.headers === undefined) options.headers = [];
        options.headers.push([
            'element-server-request',
            'true'
        ]);
    }
    return await fetch(url, options);
}
function registerAllowedOrigin(uri) {
    registeredAllowedOrigins.push(uri);
}
function registerCaptions(name, captions) {
    registeredCaptions[name] = captions;
}
function registerDependencies(dependencies) {
    Object.assign(registeredDependencies, dependencies);
}
function registerRoute(path, handler) {
    if (path === undefined || typeof path != 'string') {
        console.warn('A path must be specified when registering a route:', path);
        return;
    }
    if (typeof handler != 'function') {
        console.warn('A valid hanlder must be specified when registering a route:', handler);
        return;
    }
    registeredRoutes[path] = handler;
}
function registerServerDependencies(dependencies) {
    Object.assign(registeredServerDependencies, dependencies);
}
function subscribeTo(subject, handler) {
    registeredMessages[subject] = handler;
}
function useCaptions(name) {
    return (value, ...args)=>{
        const captionPack = registeredCaptions[name] || {};
        let caption = captionPack[value] || value;
        if (args && args.length > 0) {
            for(let i = 0; i < args.length; i++){
                caption = caption.replaceAll('{' + (i + 1) + '}', args[i]);
            }
        }
        return caption;
    };
}
function observe(objectToObserve, name, config) {
    const observablesCache = new WeakMap();
    const watchList = new Map();
    let listenerId = 0;
    let activeCompute = null;
    function objectAccessor(path) {
        return {
            get (target, key, receiver) {
                if (key === '__proxy__') return true;
                const value = Reflect.get(target, key, receiver);
                if (activeCompute) {
                    activeCompute.deps.add({
                        path
                    });
                }
                if (Array.isArray(value) && !value.__proxy__) {
                    const proxiedValue = new Proxy(value, arrayAccessor(`${path}.${key}`, receiver, key));
                    Reflect.set(target, key, proxiedValue, receiver);
                    return proxiedValue;
                } else if (typeof value === 'object' && value !== null && !value.__proxy__) {
                    const proxiedValue = new Proxy(value, objectAccessor(`${path}.${key}`));
                    Reflect.set(target, key, proxiedValue, receiver);
                    return proxiedValue;
                }
                return value;
            },
            set (target, key, value, receiver) {
                if (value && value.__proxy__) return true;
                if (key == '__path__') {
                    path = value;
                    if (Array.isArray(receiver)) {
                        for (const item of receiver)item.__path__ = `${path}.${key}`;
                    } else if (typeof receiver === 'object') {
                        for(const item in receiver){
                            if (typeof receiver[item] != 'object') continue;
                            receiver[item].__path__ = `${path}.${key}`;
                        }
                    }
                    return true;
                }
                const oldValue = receiver[key];
                if (deepEqual(value, oldValue)) return true;
                const result = Reflect.set(target, key, value, receiver);
                if (result) {
                    const rootState = path.split('.')[0];
                    let listeners = watchList.get(`${path}.${key}`);
                    if (listeners) listeners.forEach((listener)=>listener(receiver, key, oldValue));
                    listeners = watchList.get(`${path}`);
                    if (listeners) listeners.forEach((listener)=>listener(receiver, key, oldValue));
                    if (path != rootState) {
                        listeners = watchList.get(rootState);
                        if (listeners) listeners.forEach((listener)=>listener(receiver, key, oldValue));
                    }
                }
                return result;
            }
        };
    }
    function arrayAccessor(path, parentTarget, parentKey) {
        return {
            get (target, key, receiver) {
                if (key === '__proxy__') return true;
                const mutatingMethods = [
                    'push',
                    'pop',
                    'shift',
                    'unshift',
                    'splice',
                    'replace',
                    'reverse',
                    'sort',
                    'move',
                    'swap'
                ];
                if (mutatingMethods.includes(key)) {
                    if (activeCompute) {
                        activeCompute.deps.add({
                            path
                        });
                    }
                    return function(...args) {
                        let result, oldValue;
                        if (key === 'replace') {
                            oldValue = target[args[0]];
                            result = target[args[0]] = args[1];
                        } else if (key == 'move') {
                            const index = args[0];
                            const position = args[1] === undefined ? 0 : args[1];
                            const value = target.splice(index, 1);
                            result = target.splice(position, 0, ...value);
                        } else if (key == 'swap') {
                            const value = target[args[0]];
                            target[args[0]] = target[args[1]];
                            target[args[1]] = value;
                            result = true;
                        } else {
                            result = target[key].apply(target, args);
                        }
                        receiver.forEach((item, index)=>{
                            item.__path__ = `${path}.${index}`;
                        });
                        const rootState = path.split('.')[0];
                        const parentPath = path.substring(0, path.lastIndexOf('.'));
                        let listeners = watchList.get(path);
                        if (listeners) listeners.forEach((listener)=>listener(parentTarget, parentKey, oldValue));
                        listeners = watchList.get(parentPath);
                        if (listeners) listeners.forEach((listener)=>listener(parentTarget, parentKey, oldValue));
                        if (parentPath != rootState) {
                            listeners = watchList.get(rootState);
                            if (listeners) listeners.forEach((listener)=>listener(parentTarget, parentKey, oldValue));
                        }
                        return result;
                    };
                }
                if (activeCompute) {
                    activeCompute.deps.add({
                        path
                    });
                }
                const value = Reflect.get(target, key, receiver);
                if (Array.isArray(value) && !value.__proxy__) {
                    const proxiedValue = new Proxy(value, arrayAccessor(`${path}.${key}`, receiver, key));
                    Reflect.set(target, key, proxiedValue, receiver);
                    return proxiedValue;
                } else if (typeof value === 'object' && value !== null && !value.__proxy__) {
                    const proxiedValue = new Proxy(value, objectAccessor(`${path}.${key}`));
                    Reflect.set(target, key, proxiedValue, receiver);
                    return proxiedValue;
                }
                return value;
            },
            set (target, key, value, receiver) {
                if (value && value.__proxy__) return true;
                if (key == '__path__') {
                    path = value;
                    if (Array.isArray(receiver)) {
                        for (const item of receiver)item.__path__ = `${path}.${key}`;
                    } else if (typeof receiver === 'object') {
                        for(const item in receiver){
                            receiver[item].__path__ = `${path}.${key}`;
                        }
                    }
                    return true;
                }
                const oldValue = receiver[key];
                if (deepEqual(value, oldValue)) return true;
                const result = Reflect.set(target, key, value, receiver);
                if (result) {
                    const rootState = path.split('.')[0];
                    const parentPath = path.substring(0, path.lastIndexOf('.'));
                    let listeners = watchList.get(path);
                    if (listeners) listeners.forEach((listener)=>listener(parentTarget[parentKey], key, oldValue));
                    listeners = watchList.get(parentPath);
                    if (listeners) listeners.forEach((listener)=>listener(parentTarget[parentKey], key, oldValue));
                    if (parentPath != rootState) {
                        listeners = watchList.get(rootState);
                        if (listeners) listeners.forEach((listener)=>listener(parentTarget[parentKey], key, oldValue));
                    }
                }
                return result;
            }
        };
    }
    function makeObservable(obj) {
        if (!obj || typeof obj !== 'object') {
            console.warn('Only objects can be observed. The following was provided:', obj);
            return obj;
        }
        if (observablesCache.has(obj)) {
            return observablesCache.get(obj);
        }
        const proxy = new Proxy(obj, objectAccessor(name));
        observablesCache.set(obj, proxy);
        return proxy;
    }
    function watch(path, fn, el) {
        const entryId = listenerId++;
        const getListeners = (path)=>{
            let listeners = watchList.get(path);
            if (!listeners) {
                listeners = new Map();
                watchList.set(path, listeners);
            }
            return listeners;
        };
        const getListener = (path, fn, el)=>{
            return (object, key, oldValue)=>{
                if (el && !el.parentElement) {
                    const listeners = watchList.get(path);
                    listeners.delete(entryId);
                    return;
                }
                fn(object[key], oldValue);
            };
        };
        let currentPath = path;
        const listeners = getListeners(currentPath);
        listeners.set(entryId, getListener(currentPath, fn, el));
        return [
            ()=>{
                const listeners = watchList.get(currentPath);
                listeners.delete(entryId);
                if (listeners.size === 0) watchList.delete(currentPath);
            },
            (newPath)=>{
                let listeners = watchList.get(currentPath);
                listeners.delete(entryId);
                if (listeners.size === 0) watchList.delete(currentPath);
                currentPath = newPath;
                listeners = getListeners(currentPath);
                listeners.set(entryId, getListener(currentPath, fn, el));
            }
        ];
    }
    function compute(fn, el) {
        let cachedValue;
        let dirty = true;
        const deps = new Set();
        const recompute = ()=>{
            deps.forEach(({ path })=>{
                const listeners = watchList.get(path);
                if (listeners) listeners.delete(markDirty);
            });
            deps.clear();
            activeCompute = {
                deps
            };
            cachedValue = fn();
            activeCompute = null;
            dirty = false;
            deps.forEach(({ path })=>{
                watch(path, markDirty, el);
            });
        };
        function markDirty() {
            dirty = true;
        }
        return {
            get value () {
                if (dirty) recompute();
                return cachedValue;
            }
        };
    }
    function persistState() {
        localStorage.setItem(config.key, JSON.stringify(proxy));
    }
    function loadState() {
        const savedState = JSON.parse(localStorage.getItem(config.key) || '{}');
        if (savedState) {
            Object.assign(proxy, savedState);
        }
    }
    const proxy = makeObservable(objectToObserve);
    if (config && config.persist && config.key) {
        loadState();
        watch('appState', persistState);
    }
    return [
        proxy,
        watch,
        compute
    ];
}
function runAt(props) {
    if (appContext.server && props.server) return props.server();
    else if (appContext.client && props.client) return props.client();
}
function getElementProxy(el) {
    const shims = {};
    const componentProps = {};
    Object.defineProperties(componentProps, {
        define$: {
            value: (userDefinedProperties)=>{
                for(const prop in userDefinedProperties){
                    if (!prop.endsWith('$')) throw new RenderError(`Invalid property name '${prop}'. Property names must end with a $.`);
                    if (typeof userDefinedProperties[prop] === 'function') {
                        userDefinedProperties[prop] = {
                            value: userDefinedProperties[prop]
                        };
                    }
                }
                Object.defineProperties(componentProps, userDefinedProperties);
            }
        },
        shims$: {
            value: (userDefinedProperties)=>{
                for(const prop in userDefinedProperties){
                    if (typeof userDefinedProperties[prop] === 'function') {
                        userDefinedProperties[prop] = {
                            value: userDefinedProperties[prop]
                        };
                    }
                }
                Object.defineProperties(shims, userDefinedProperties);
            }
        }
    });
    function getProxyHandler() {
        return {
            get: (target, prop, receiver)=>{
                if (prop.endsWith('$')) {
                    const value = componentProps[prop];
                    if (typeof value == 'function') {
                        return function(...args) {
                            return value(args);
                        };
                    }
                    return value;
                }
                if (shims[prop]) {
                    const value = shims[prop];
                    if (typeof value == 'function') {
                        return function(...args) {
                            return value(args);
                        };
                    }
                    return value;
                }
                const value = Reflect.get(target, prop, receiver);
                return value;
            },
            set: (target, prop, value, receiver)=>{
                if (prop.endsWith('$')) {
                    if (!componentProps[prop]) {
                        componentProps[prop] = value;
                    }
                    return true;
                }
                if (shims[prop]) {
                    shims[prop] = value;
                    return true;
                }
                const success = Reflect.set(target, prop, value, receiver);
                return success;
            }
        };
    }
    return new Proxy(el, getProxyHandler());
}
function initializeComponent(el, appState, pageState) {
    el = getElementProxy(el);
    const componentId = el.getAttribute('el-id');
    const componentIs = el.getAttribute('el-is') || 'component';
    const componentProps = {};
    const renderAt = el.getAttribute('el-render-at');
    const stateObject = observe({}, 'state');
    const messageListeners = new Map();
    new Set();
    let componentState = 0;
    let childComponents = {};
    let parent;
    if (el.hasAttribute('el-comp-state')) {
        componentState = parseInt(el.getAttribute('el-comp-state'));
    } else {
        el.setAttribute('el-comp-state', String(componentState));
    }
    el.define$({
        init$: async (props)=>{
            addPropsFromAttributes(componentProps, el, props);
            addMissingLifecycleMethods(el);
            if (appContext.server && renderAt == 'client') {
                return childComponents;
            }
            if (appContext.client && renderAt == 'server') {
                return childComponents;
            }
            if (componentState === 0) {
                await loadDependencies(el.use$(componentProps));
                await onInit(el, componentProps);
                await onStyle(el, componentProps);
                await onTemplate(el, componentProps);
                await onRender(el, componentProps);
            }
            if (appContext.server) {
                componentState = 1;
                return childComponents;
            } else {
                componentState = 2;
            }
            if (componentState === 1) {
                await onResume(el);
                componentState = 2;
            }
            if (componentState === 2) {
                await onHydrate(el, props);
                componentState = 3;
            }
            if (componentState === 3) {
                await onReady(el, props);
                componentState = 0;
                el.removeAttribute('el-comp-state');
            }
            return childComponents;
        },
        uId$: {
            get: ()=>{
                return el.getAttribute('id');
            }
        },
        id$: {
            get: ()=>{
                return componentId;
            }
        },
        is$: {
            get: ()=>{
                return componentIs;
            }
        },
        emit$: (subject, data)=>{
            let parentEl = el.parent$;
            while(parentEl.id$ != 'document'){
                if (parentEl.listensFor$(subject)) {
                    parentEl.onMessageReceived$(subject, data);
                }
                parentEl = parentEl.parent$;
            }
        },
        on$: (event, handler)=>{
            el.addEventListener(event, handler);
        },
        children$: {
            get: ()=>{
                return childComponents;
            },
            set: (value)=>{
                childComponents = value;
            }
        },
        componentState$: {
            get: ()=>{
                return componentState;
            }
        },
        hidden$: {
            set: (value)=>{
                if (typeof value != 'boolean') return;
                if (value) {
                    let style = el.getAttribute('style');
                    if (!style) style = '';
                    if (/\bdisplay\s*:\s*none\b/i.test(style)) return;
                    style += '; display: none';
                    el.setAttribute('style', style);
                } else {
                    let style = el.getAttribute('style');
                    if (!style) style = '';
                    style = style.replace(/\bdisplay\s*:\s*none\s*;?/gi, '').replace(/;;+/g, ';').replace(/^\s*;\s*|\s*;\s*$/g, '').trim();
                    el.setAttribute('style', style);
                }
            },
            get: ()=>{
                let style = el.getAttribute('style');
                if (!style) style = '';
                return style.includes('display: none');
            }
        },
        onMessageReceived$: async (subject, data)=>{
            if (messageListeners.get(subject)) await messageListeners.get(subject)(data, appContext.ctx);
        },
        parent$: {
            set: (value)=>{
                parent = value;
            },
            get: ()=>{
                return parent || el.ownerDocument.documentElement;
            }
        },
        props$: {
            get: ()=>{
                return componentProps;
            }
        },
        remove$: async ()=>{
            await onCleanup(el);
            unwatchElementProps(el);
            delete el.parent$.children$[el.id$];
            el.parent$.removeChild(el);
        },
        removeChild$: async (childElement)=>{
            await onCleanup(childElement);
            unwatchElementProps(childElement);
            delete el.children$[childElement.id$];
            el.removeChild(childElement);
        },
        listensFor$: (subject)=>{
            return messageListeners.has(subject);
        },
        subscribeTo$: (subject, handler)=>{
            messageListeners.set(subject, async (data)=>{
                await handler(data);
            });
            el.setAttribute('el-listening', 'true');
        },
        appState$: {
            get: ()=>{
                return appState || el.ownerDocument.documentElement.appState$;
            }
        },
        pageState$: {
            get: ()=>{
                return pageState || el.ownerDocument.documentElement.pageState$;
            }
        },
        state$: {
            get: ()=>{
                return stateObject;
            }
        },
        unsubscribeTo$: (subject)=>{
            messageListeners.delete(subject);
            if (messageListeners.size === 0) el.removeAttribute('el-listening');
        }
    });
    if (componentIs == 'component') el.setAttribute('el-is', 'component');
    if (registeredComponents[componentIs]) {
        if (el.hasAttribute('el-state')) {
            Object.assign(stateObject[0], JSON.parse(el.getAttribute('el-state')));
            el.removeAttribute('el-state');
        }
        registeredComponents[componentIs](el);
    } else console.warn(`The component type '${componentIs}' is not registered.`);
    return el;
}
async function onInit(el, props) {
    el.setAttribute('el-active', '');
    await el.onInit$(props);
    el.removeAttribute('el-active');
}
async function onStyle(el, props) {
    if (props.theme === undefined) props.theme = {};
    const theme = props.theme.value || '';
    const themeId = el.is$ + (theme ? '_' + theme : '');
    let css = el.onStyle$(props);
    if (!css) return;
    if (css.endsWith('.css')) {
        const path = css;
        let content;
        if (path.endsWith('.theme.css')) {
            if (appContext.server) {
                if (resourceCache.has(path)) {
                    content = resourceCache.get(path);
                    console.log(`Loaded CSS theme from cache: ${path}`);
                } else {
                    content = await getResource(path) || '';
                    if (content !== undefined) resourceCache.set(path, content);
                }
            } else {
                content = await getResource(path) || '';
            }
            if (theme) content = content.replaceAll('[el]', `[el-is='${el.is$}'][data-theme='${theme}']`);
            else content = content.replaceAll('[el]', `[el-is='${el.is$}']`);
            el.setAttribute('data-theme', themeId);
            if (el.ownerDocument.getElementById(themeId)) return;
            const tag = el.ownerDocument.createElement('style');
            tag.setAttribute('id', themeId);
            tag.textContent = content;
            el.ownerDocument.head.append(tag);
        } else {
            if (el.ownerDocument.head.querySelector(`[href='${path}']`)) return;
            const tag = el.ownerDocument.createElement('link');
            tag.setAttribute('rel', 'stylesheet');
            tag.setAttribute('href', path);
            el.ownerDocument.head.append(tag);
        }
    } else {
        if (el.ownerDocument.head.querySelector(`[id="${themeId}"]`)) return;
        if (theme) css = css.replaceAll('[el]', `[el-is='${el.is$}'][data-theme='${theme}']`);
        else css = css.replaceAll('[el]', `[el-is='${el.is$}']`);
        const tag = el.ownerDocument.createElement('style');
        tag.setAttribute('id', themeId);
        tag.textContent = css;
        el.ownerDocument.head.append(tag);
    }
}
async function onTemplate(el, props) {
    let content;
    const template = el.onTemplate$(props);
    if (template && template.startsWith('/')) {
        const url = template;
        if (appContext.server) {
            if (resourceCache.has(url)) {
                content = resourceCache.get(url);
                console.log(`Loaded template from cache: ${url}`);
            } else {
                content = await getResource(url) || '';
                if (content !== undefined) resourceCache.set(url, content);
            }
            el.innerHTML = sanitize(content);
        } else {
            content = await getResource(url) || '';
            el.innerHTML = sanitize(content);
        }
    } else if (template) {
        content = template;
        el.innerHTML = sanitize(content);
    } else if (template == '') {
        el.innerHTML = template;
    }
    await getDependencies(el);
    initChildren(el);
}
async function onRender(el, props) {
    await el.onRender$(props);
    for(const id in el.children$){
        const child = el.children$[id];
        await child.init$();
    }
}
async function onResume(el) {
    await getDependencies(el);
    initChildren(el);
    for(const id in el.children$){
        const child = el.children$[id];
        await child.init$();
    }
}
async function onHydrate(el, props) {
    if (el.hasAttribute('el-hydrate-on')) {
        el.parent$.hydrateOnComponents$.add({
            el,
            props,
            hydrateOn: el.getAttribute('el-hydrate-on')
        });
        el.removeAttribute('el-hydrate-on');
        return;
    }
    await el.onHydrate$(props);
    for(const id in el.children$){
        const child = el.children$[id];
        await child.init$();
    }
}
async function onReady(el, props) {
    await el.onReady$(props);
    onHydrateOn(el);
    el.removeAttribute('el-comp-state');
    el.removeAttribute('el-parent');
    for (const attr of el.attributes){
        if (attr.name.startsWith('data-')) el.removeAttribute(attr.name);
    }
}
function onHydrateOn(el) {
    for (const entry of el.hydrateOnComponents$){
        const component = entry.component;
        const props = entry.props;
        const hydrateOn = entry.hydrateOn;
        if (hydrateOn == 'idle' || hydrateOn.startsWith('idle:')) {
            const time = hydrateOn.startsWith('idle:') ? parseInt(hydrateOn.substring(5)) : 0;
            if (time) {
                const callback = async ()=>{
                    await getDependencies(component);
                    await component.init$(props);
                };
                globalThis.requestIdleCallback(callback, {
                    timeout: time
                });
            }
        } else if (hydrateOn == 'timeout' || hydrateOn.startsWith('timeout:')) {
            const time = hydrateOn.startsWith('timeout:') ? parseInt(hydrateOn.substring(8)) : 500;
            const callback = async ()=>{
                if (!component.parentElement) return;
                await getDependencies(component);
                await component.init$(props);
            };
            setTimeout(callback, time);
        } else if (hydrateOn == 'visible') {
            component.hydrateOnCallback$ = async ()=>{
                await getDependencies(component);
                await component.init$(props);
                intersectionObserver.unobserve(component);
            };
            intersectionObserver.observe(component);
        } else {
            throw new RenderError(`Invalid el-hydrate-on attribute value: ${hydrateOn}`);
        }
    }
    el.hydrateOnComponents$.clear();
}
async function onCleanup(el) {
    await el.onCleanup$();
    for(const id in el.children$){
        const child = el.children$[id];
        if (child.onCleanup$) await child.onCleanup$();
    }
}
function initChildren(el) {
    let children;
    el.children$ = {};
    if (el.componentState$ === 1) {
        children = el.querySelectorAll(`:scope [el-parent="${el.id$}"]`);
    } else {
        children = getChildComponents(el);
    }
    for (const child of children){
        const childElement = initializeComponent(child);
        if (!childElement.hasAttribute('id')) childElement.setAttribute('id', `el${++idCount}`);
        childElement.setAttribute('el-parent', el.getAttribute('el-id'));
        childElement.parent$ = el;
        const elId = childElement.id$;
        el.children$[elId] = childElement;
    }
}
async function renderDocument(config, ctx) {
    try {
        if (!config) config = {};
        if (!config.pageState) config.pageState = {};
        validateInputs(config, ctx);
        appContext.ctx = ctx;
        const appState = observe({}, 'appState', {
            persist: true,
            key: 'elementJS_appState_' + (ctx ? ctx.request.url.hostname : globalThis.location.hostname)
        });
        const pageState = observe(config.pageState, 'pageState');
        if (appContext.server) {
            setExtendedURL(ctx.request.url);
            appContext.documentElement = await getDocumentElement(config);
            const el = initializeComponent(appContext.documentElement, appState, pageState);
            el.setAttribute('el-is', 'document');
            el.setAttribute('el-id', 'document');
            el.setAttribute('el-server-rendering', 'true');
            await el.init$();
            const components = el.querySelectorAll('[el-is]');
            for (const component of components){
                if (component.state$ && Object.keys(component.state$).length) component.setAttribute('el-state', JSON.stringify(component.state$[0]));
            }
            el.setAttribute('el-state', JSON.stringify(config.pageState));
            el.setAttribute('el-server-rendered', 'true');
            el.setAttribute('el-id-count', idCount.toString());
            return el;
        } else {
            document.documentElement;
            const el = initializeComponent(appContext.documentElement, appState, pageState);
            el.setAttribute('el-is', 'document');
            el.setAttribute('el-id', 'document');
            if (el.hasAttribute('el-server-rendered')) {
                idCount = parseInt(el.getAttribute('el-id-count'));
                el.removeAttribute('el-id-count');
            } else {
                el.setAttribute('el-client-rendering', 'true');
            }
            if (el.hasAttribute('el-state')) {
                Object.assign(pageState[0], JSON.parse(el.getAttribute('el-state')));
                el.removeAttribute('el-state');
            }
            setExtendedURL(globalThis.location);
            setupIntersectionObserver();
            await el.init$();
            return el;
        }
    } catch (e) {
        console.error('Render error:', e);
        throw e;
    }
}
function validateInputs(config, ctx) {
    if (appContext.server) {
        if (!config || typeof config !== 'object') {
            throw new RenderError('Invalid config object provided');
        }
        if (!ctx || typeof ctx !== 'object') {
            throw new RenderError('Invalid server context object provided');
        }
        if (!config.file && !config.html) {
            throw new RenderError('Either file path or HTML content must be provided');
        }
    }
}
async function getDocumentElement(config) {
    let html = config.html;
    if (!html && config.file) {
        html = await getResource(config.file);
        if (!html) {
            console.error('Could not create document element - file not found: ', config.file);
            throw new RenderError('FileNotFound');
        }
    }
    return appContext.ctx.parser.parseFromString(html, 'text/html').documentElement;
}
function createStyleShim(el) {
    return new Proxy({}, {
        set (_, prop, value) {
            const existing = el.getAttribute("style") || "";
            const styles = parseStyle(existing);
            styles[prop] = value;
            el.setAttribute("style", serializeStyle(styles));
            return true;
        },
        get (_, prop) {
            const styles = parseStyle(el.getAttribute("style") || "");
            return styles[prop];
        }
    });
}
function parseStyle(style) {
    const obj = {};
    style.split(";").forEach((rule)=>{
        if (!rule) return;
        const [key, val] = rule.split(":");
        if (key && val) obj[key.trim()] = val.trim();
    });
    return obj;
}
function serializeStyle(obj) {
    return Object.entries(obj).map(([k, v])=>`${k}:${v}`).join(";");
}
function createElementShim(el) {
    const PROPERTY_TO_ATTRIBUTE = {
        value: "value",
        checked: "checked",
        selected: "selected",
        disabled: "disabled",
        id: "id",
        className: "class"
    };
    let styleShim;
    return new Proxy(el, {
        get (target, prop) {
            if (prop === "style") {
                if (!styleShim) styleShim = createStyleShim(target);
                return styleShim;
            }
            if (prop in PROPERTY_TO_ATTRIBUTE) {
                return target.getAttribute(PROPERTY_TO_ATTRIBUTE[prop]);
            }
            if (typeof target[prop] === "function") {
                return target[prop].bind(target);
            }
            return target[prop];
        },
        set (target, prop, value) {
            if (prop in PROPERTY_TO_ATTRIBUTE) {
                if (typeof value === "boolean") {
                    value ? target.setAttribute(PROPERTY_TO_ATTRIBUTE[prop], "") : target.removeAttribute(PROPERTY_TO_ATTRIBUTE[prop]);
                } else {
                    target.setAttribute(PROPERTY_TO_ATTRIBUTE[prop], String(value));
                }
                return true;
            }
            target[prop] = value;
            return true;
        }
    });
}
function unwatchElementProps(el) {
    for(const id in el.children$){
        unwatchElementProps(el.children$[id]);
    }
    for(const prop in el.props$){
        const value = el.props$[prop];
        if (value.unwatch) {
            value.unwatch();
        }
    }
}
function reIndexStatePath(el, oldRoot, newRoot, depth) {
    for(const id in el.children$){
        reIndexStatePath(el.children$[id], oldRoot, newRoot, depth + 1);
    }
    for(const prop in el.props$){
        let statePath = el.props$[prop].statePath;
        if (statePath) {
            if (depth === 0) {
                statePath = statePath.replace(oldRoot, newRoot);
            } else {
                statePath = statePath.replace(oldRoot + '.', newRoot + '.');
            }
            const arrStatePath = statePath.split('.');
            arrStatePath[0] = 'state';
            const value = el.props$[prop];
            if (value.rewatch) value.rewatch(arrStatePath.join('.'));
        }
    }
}
function addPropsFromAttributes(componentProps, el, props) {
    const attrs = {};
    for (const attr of el.attributes){
        if (attr.name.startsWith('data-')) {
            const propName = kebabToCamelCase(attr.name.substring(5));
            if (attr.value && attr.value.startsWith('bind:')) {
                attrs[propName] = getBoundEntity(el, propName, attr.value.substring(5));
            } else {
                let value;
                if (attr.value && attr.value.startsWith('num:')) {
                    value = Number(attr.value.substring(4));
                    if (isNaN(value)) {
                        throw `The attribute ${attr.name} on the element id="${el.uId$}" is not a valid number`;
                    }
                } else if (attr.value && attr.value.startsWith('bool:')) {
                    value = attr.value.substring(5);
                    value = value == 'true' ? true : value == 'false' ? false : null;
                    if (value === null) {
                        throw `The attribute ${attr.name} on the element id="${el.uId$}" is not a valid boolean`;
                    }
                } else {
                    value = attr.value || true;
                }
                attrs[propName] = new Prop(value);
            }
        }
    }
    Object.assign(componentProps, attrs, props);
}
function getBoundEntity(el, propName, path) {
    const arrPath = path.split('.');
    let statePath = '', value;
    if ([
        'appState',
        'pageState'
    ].includes(arrPath[0])) {
        statePath = path;
        value = el[arrPath[0] + '$'][0];
        for(let i = 1; i < arrPath.length; i++){
            value = value[arrPath[i]];
        }
    } else if (arrPath[0] == 'state') {
        let parentEl = el.parent$;
        let found = false;
        while(parentEl.id$ != 'document' && !found){
            value = parentEl[arrPath[0] + '$'][0];
            for(let i = 1; i < arrPath.length; i++){
                if (!value.hasOwnProperty(arrPath[i])) {
                    parentEl = parentEl.parent$;
                    break;
                } else {
                    value = value[arrPath[i]];
                    statePath = path.replace('state.', parentEl.uId$ + '.');
                    found = true;
                }
            }
            if (parentEl.id$ == 'document') {
                statePath = path.replace('state.', parentEl.uId$ + '.');
                value = undefined;
            }
        }
    } else {
        const parentProp = el.parent$.props$[arrPath[0]];
        value = parentProp.value;
        for(let i = 1; i < arrPath.length; i++){
            value = value[arrPath[i]];
        }
        arrPath.shift();
        statePath = parentProp.statePath + '.' + arrPath.join('.');
    }
    return new StateProp(statePath, value, bind(el, propName, statePath));
}
function bind(el, propName, statePath) {
    return (fn)=>{
        const arrPath = statePath.split('.');
        let observer, path;
        if (![
            'appState',
            'pageState'
        ].includes(arrPath[0])) {
            observer = el.ownerDocument.getElementById(arrPath[0]).state$;
            path = statePath.replace(arrPath[0] + '.', 'state.');
        } else {
            observer = el[arrPath[0] + '$'];
            path = statePath;
        }
        const watch = observer[1];
        const [unwatch, rewatch] = watch(path, fn, el);
        el.props$[propName].unwatch = unwatch;
        el.props$[propName].rewatch = rewatch;
    };
}
function kebabToCamelCase(kebabCaseString) {
    return kebabCaseString.replace(/-([a-z])/g, (g)=>g[1].toUpperCase());
}
function addMissingLifecycleMethods(el) {
    if (typeof el.use$ == 'undefined') el.use$ = ()=>[];
    if (typeof el.onInit$ == 'undefined') el.onInit$ = ()=>{};
    if (typeof el.onStyle$ == 'undefined') el.onStyle$ = ()=>{};
    if (typeof el.onTemplate$ == 'undefined') el.onTemplate$ = ()=>{};
    if (typeof el.onRender$ == 'undefined') el.onRender$ = ()=>{};
    if (typeof el.onHydrate$ == 'undefined') el.onHydrate$ = ()=>{};
    if (typeof el.onReady$ == 'undefined') el.onReady$ = ()=>{};
    if (typeof el.onCleanup$ == 'undefined') el.onCleanup$ = ()=>{};
}
function sanitize(code) {
    const sanitizedCode = code.replaceAll(/\?eTag=[a-zA-Z0-9:]+[\"]/g, '\"').replaceAll(/\?eTag=[a-zA-Z0-9:]+[\']/g, '\'');
    return sanitizedCode;
}
function setupIntersectionObserver() {
    intersectionObserver = new IntersectionObserver(async (entries)=>{
        for (const entry of entries){
            if (entry.isIntersecting) {
                await entry.target.hydrateOnCallback$();
            }
        }
    }, {
        rootMargin: '100px',
        threshold: 0
    });
}
function getChildComponents(parent) {
    const components = [
        ...parent.querySelectorAll('[el-id]')
    ];
    return components.filter((child)=>{
        let match = child.closest('[el-is]');
        if (match.is$ == parent.is$) return true;
        match = match.parentElement.closest('[el-id]');
        if (match.id$ == parent.id$) return true;
        return false;
    });
}
function setExtendedURL(url) {
    const searchParams = {};
    if (url.searchParams) url.searchParams.forEach((value, key)=>searchParams[key] = value);
    else new URLSearchParams(url.search).forEach((value, key)=>searchParams[key] = value);
    extendedURL.hash = url.hash, extendedURL.host = url.host, extendedURL.hostname = url.hostname, extendedURL.href = url.href, extendedURL.origin = url.origin, extendedURL.pathname = url.pathname, extendedURL.port = url.port, extendedURL.protocol = url.protocol, extendedURL.search = url.search, extendedURL.searchParams = searchParams;
}
async function getDependencies(el) {
    const dependencies = [];
    if (![
        'component',
        'document',
        'link',
        'list'
    ].includes(el.getAttribute('el-is'))) dependencies.push(el.getAttribute('el-is'));
    let children;
    if (el.componentState$ === 2) children = el.querySelectorAll(`:scope [el-parent="${el.id$}"]`);
    else children = el.querySelectorAll(':scope [el-is]');
    children.forEach((component)=>{
        if (component.getAttribute('el-is') == 'component') return;
        else if (appContext.server && component.getAttribute('el-render-at') == 'client') return;
        else if (appContext.client && component.getAttribute('el-render-at') == 'server') return;
        dependencies.push(component.getAttribute('el-is'));
    });
    await loadDependencies(dependencies);
}
function getFeatureFlags() {
    if (appContext.client) {
        const featureFlags = globalThis.document.cookie.split('; ').find((row)=>row.startsWith('featureFlags='));
        if (featureFlags) return featureFlags.split('=')[1].split(':');
    }
    return [];
}
async function getResource(path) {
    if (appContext.server) {
        const file = await appContext.ctx.getPackageItem(path);
        if (file) {
            const content = new TextDecoder().decode(file.content);
            return content;
        }
    } else {
        const response = await fetch(path);
        if (response.status === 200) {
            const content = await response.text();
            return content;
        }
    }
}
async function importModule(url) {
    try {
        if (appContext.server) {
            const module = await import(url + `?eTag=${appContext.ctx.cacheDTS}`);
            return module;
        } else {
            const module = await import(url);
            return module;
        }
    } catch (e) {
        console.log(e);
        throw new RenderError(`Either the requested resource or one of its dependencies was not found: ${url}`);
    }
}
async function loadDependencies(dependencies) {
    try {
        const imports = dependencies.map((dependency)=>{
            if (![
                'component',
                'document',
                'link',
                'list'
            ].includes(dependency)) {
                let modulePath = registeredDependencies[dependency];
                if (appContext.server) modulePath = registeredServerDependencies[dependency] || modulePath;
                if (!modulePath) {
                    if (!registeredComponents[dependency]) console.warn(`Dependency '${dependency}' not registered`);
                } else return importModule(modulePath);
            }
        }).filter((value)=>Boolean(value));
        if (imports.length > 0) await Promise.allSettled(imports);
    } catch (e) {
        console.error('Failed to load dependencies:', e);
        throw e;
    }
}
function deepEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for(let i = 0; i < a.length; i++){
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (const key of keysA){
            if (!deepEqual(a[key], b[key])) return false;
        }
        return true;
    }
    return false;
}
async function insertElement(parent, element, action, elId) {
    const tagNameMap = {
        ul: 'li',
        ol: 'li',
        thead: 'tr',
        tbody: 'tr'
    };
    if (element.tagName === undefined && tagNameMap[parent.tagName.toLowerCase()] === undefined) element.tagName = 'div';
    else element.tagName = tagNameMap[parent.tagName.toLowerCase()];
    let el = parent.ownerDocument.createElement(element.tagName);
    for(const prop in element){
        if (prop == 'tagName' || prop == 'props') continue;
        el.setAttribute(prop, element[prop]);
    }
    await loadDependencies([
        element['el-is']
    ]);
    el = initializeComponent(el);
    el.setAttribute('id', `el${++idCount}`);
    el.parent$ = parent;
    el.setAttribute('el-parent', parent.id$);
    parent.children$[element['el-id']] = el;
    el.componentState$ = parent.componentState$ === -1 ? -1 : 0;
    switch(action){
        case 'prepend':
            parent.prepend(el);
            break;
        case 'append':
            parent.append(el);
            break;
        case 'before':
            parent.children$[elId].before(el);
            break;
        case 'after':
            parent.children$[elId].after(el);
            break;
        default:
            parent.append(el);
    }
    if (parent.componentState$ === -1) await el.init$(element.props);
    return el;
}
createComponent('document', (el)=>{
    el.define$({
        onRender$: async (props)=>{
            for(const id in el.children$){
                const child = el.children$[id];
                if (Array.isArray(child)) child.forEach(async (child)=>await child.init$(props));
                else await child.init$(props);
            }
        },
        onHydrate$: async (props)=>{
            for(const id in el.children$){
                const child = el.children$[id];
                if (Array.isArray(child)) child.forEach(async (child)=>await child.init$(props));
                else await child.init$(props);
            }
        }
    });
});
createComponent('component', (el)=>{
    el.define$({
        text$: {
            set: (value)=>{
                el.textContent = value;
            },
            get: ()=>{
                return el.textContent;
            }
        },
        html$: {
            set: (value)=>{
                el.innerHTML = value;
            },
            get: ()=>{
                return el.innerHTML;
            }
        }
    });
});
createComponent('reactive-list', (el)=>{
    let listItems;
    el.define$({
        onRender$: async (props)=>{
            listItems = transformSourceList(props);
            await clearComponents();
            await createComponents(props);
        },
        onHydrate$: async (props)=>{
            props.src.onChange((src)=>{
                props.src.value = src;
                listItems = transformSourceList(props);
                const currentOrder = [];
                let index = 0;
                for(const id in el.children$){
                    currentOrder.push({
                        id,
                        index: index++
                    });
                }
                const newOrder = [];
                index = 0;
                for (const item of props.src.value){
                    newOrder.push({
                        id: item.id,
                        index: index++
                    });
                }
                reconcileDom(currentOrder, newOrder);
                if (currentOrder.length === 0) {
                    el.emit$(el.id$ + ':ItemsUpdated');
                } else if (newOrder.length > currentOrder.length) {
                    el.emit$(el.id$ + ':ItemsAdded');
                } else if (newOrder.length < currentOrder.length) {
                    el.emit$(el.id$ + ':ItemsRemoved');
                }
            });
        }
    });
    function transformSourceList(props) {
        const items = {};
        for (const item of props.src.value){
            items[String(item[props.componentId.value])] = item;
        }
        return items;
    }
    async function clearComponents() {
        for(const id in el.children$){
            await el.removeChild$(el.children$[id]);
        }
    }
    async function createComponents(props) {
        let index = 0;
        const propName = props.alias.value || 'item';
        for(const id in listItems){
            await insertElement(el, {
                'el-is': props.component.value,
                'el-id': id,
                'data-index': `num:${index}`,
                [`data-${propName}`]: 'bind:src.' + index++
            }, 'append');
        }
    }
    async function reconcileDom(currentOrder, newOrder) {
        const nextById = newOrder.map((item)=>item.id.toString());
        for (const { id } of currentOrder){
            if (!nextById.includes(id)) {
                const node = el.children$[id];
                if (node && node.parent$ === el) {
                    el.children$[id].remove$();
                    delete el.children$[id];
                }
            }
        }
        for(let i = 0; i < newOrder.length; i++){
            const referenceNode = el.children[i] || null;
            const { id } = newOrder[i];
            let node = el.children$[id];
            if (!node) {
                const propName = el.props$.alias.value || 'item';
                await insertElement(el, {
                    'el-is': el.props$.component.value,
                    'el-id': id,
                    'data-index': `num:${i}`,
                    [`data-${propName}`]: 'bind:src.' + i
                }, 'append');
                node = el.children$[id];
            } else {
                el.insertBefore(node, referenceNode);
                node.props$.index.value = i;
                for(const prop in node.props$){
                    const statePath = node.props$[prop].statePath;
                    if (statePath) {
                        const arrPath = statePath.split('.');
                        arrPath[arrPath.length - 1] = i.toString();
                        reIndexStatePath(el.children$[id], statePath, arrPath.join('.'), 0);
                    }
                }
            }
        }
    }
});
createComponent('list', (el)=>{
    el.define$({
        clear$: async ()=>{
            for(const id in el.children$){
                await el.removeChild$(el.children$[id]);
            }
        },
        append$: async (element)=>{
            const component = await insertElement(el, element, 'append');
            return component;
        },
        prepend$: async (element)=>{
            const component = await insertElement(el, element, 'prepend');
            return component;
        },
        before$: async (element, elId)=>{
            const component = await insertElement(el, element, 'before', elId);
            return component;
        },
        after$: async (element, elId)=>{
            const component = await insertElement(el, element, 'after', elId);
            return component;
        }
    });
});
createComponent('link', (el)=>{
    let _onclick;
    el.define$({
        onRender$: ({ value, hidden, disabled, href })=>{
            if (typeof value.value != 'undefined') {
                el.text$ = value.value;
            }
            if (typeof hidden.value == 'boolean') {
                el.hidden$ = hidden.value;
            }
            el.disabled$ = disabled.value || false;
            el.href$ = href.value;
        },
        onHydrate$: (props)=>{
            const onclick = props.onclick.value || (()=>{});
            if (typeof onclick != 'function') return;
            el.removeEventListener('click', _onclick);
            _onclick = (event)=>{
                event.preventDefault();
                if (el.disabled$) return;
                if (onclick(event) === false) return;
                if (el.href$) navigateTo(el.href$);
                else if (el.getAttribute('href')) globalThis.location.href = el.getAttribute('href');
            };
            el.addEventListener('click', _onclick);
        },
        disabled$: {
            set: (value)=>{
                if (typeof value != 'boolean') return;
                if (value) el.setAttribute('disabled', '');
                else el.removeAttribute('disabled');
            },
            get: ()=>{
                return el.hasAttribute('disabled');
            }
        },
        href$: {
            set: (value)=>{
                if (typeof value != 'string') return;
                el.setAttribute('data-href', value);
                el.setAttribute('href', value);
            },
            get: ()=>{
                return el.getAttribute('data-href');
            }
        },
        text$: {
            set: (value)=>{
                el.textContent = value;
            },
            get: ()=>{
                return el.textContent;
            }
        }
    });
});
createComponent('caption', (el)=>{
    const [appState, watchAppState] = el.appState$;
    const [pageState, watchPageState] = el.pageState$;
    const [state] = el.state$;
    el.define$({
        onRender$: ({ params })=>{
            setCaption(params.value);
            state.params = params.value;
        },
        onHydrate$: ()=>{
            watchAppState('appState.captionPack', ()=>{
                setCaption(state.params);
            });
            watchPageState('pageState.captionPack', ()=>{
                setCaption(state.params);
            });
        },
        param$: {
            set: (value)=>{
                setCaption(value);
                state.params = value;
            }
        }
    });
    function setCaption(params) {
        const caption = useCaptions(appState.captionPack || pageState.captionPack);
        if (params) {
            if (Array.isArray(params)) {
                el.textContent = caption(el.id$, ...params);
            } else {
                try {
                    const paramsArray = JSON.parse(params);
                    el.textContent = caption(el.id$, ...paramsArray);
                } catch (e) {
                    el.textContent = caption(el.id$, params);
                }
            }
        } else el.textContent = caption(el.id$);
    }
});
createComponent('reactive-input', (el)=>{
    el.define$({
        onRender$: ({ value })=>{
            el.setAttribute('value', value.value);
        },
        onHydrate$: ({ value })=>{
            value.onChange((value)=>{
                el.value = value;
            });
            el.addEventListener('input', ()=>{
                value.value = el.value;
            });
        }
    });
});
createComponent('reactive-checkbox', (el)=>{
    el.define$({
        onRender$: ({ checked })=>{
            el.setAttribute('checked', checked.value);
        },
        onHydrate$: ({ checked })=>{
            checked.onChange((value)=>{
                el.checked = value;
            });
            el.addEventListener('input', ()=>{
                checked.value = el.checked;
            });
        }
    });
});
createComponent('reactive-content', (el)=>{
    el.define$({
        onRender$: ({ content })=>{
            el.textContent = content.value;
        },
        onHydrate$: ({ content })=>{
            content.onChange((value)=>{
                el.textContent = value;
            });
        }
    });
});
export { createComponent as createComponent$, deviceSubscribesTo as deviceSubscribesTo$, emitMessage as emit$, extendedURL as url$, feature as feature$, elementFetch as fetch$, useCaptions as useCaptions$, navigateTo as navigateTo$, registerAllowedOrigin as registerAllowedOrigin$, registerCaptions as registerCaptions$, registerDependencies as registerDependencies$, registerServerDependencies as registerServerDependencies$, registerRoute as registerRoute$, renderDocument as renderDocument$, runAt as runAt$, subscribeTo as subscribeTo$ };
export { observe as observe };
export { createElementShim as createElementShim };

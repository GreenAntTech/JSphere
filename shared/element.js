console.log('elementJS:', 'v1.0.0-preview.227');
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
(async function() {
    if (!globalThis.URLPattern) await import('./urlpattern.js');
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
async function elementFetch(input, options = {
    headers: []
}) {
    if (appContext.server) {
        input = `${extendedURL.protocol}//127.0.0.1:${extendedURL.port || '80'}${input}`;
        options.headers.push([
            'element-server-request',
            'true'
        ]);
    }
    return await fetch(input, options);
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
    const watchList = {};
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
                const oldValue = receiver[key];
                if (deepEqual(value, oldValue)) return true;
                const result = Reflect.set(target, key, value, receiver);
                if (result) {
                    const rootState = path.split('.')[0];
                    let listeners = watchList[`${path}.${key}`];
                    if (listeners) listeners.forEach((listener)=>listener(receiver, key, oldValue));
                    listeners = watchList[`${path}`];
                    if (listeners) listeners.forEach((listener)=>listener(receiver, key, oldValue));
                    if (path != rootState) {
                        listeners = watchList[rootState];
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
                    'replace'
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
                        } else {
                            result = target[key].apply(target, args);
                        }
                        const rootState = path.split('.')[0];
                        const parentPath = path.substring(0, path.lastIndexOf('.'));
                        let listeners = watchList[path];
                        if (listeners) listeners.forEach((listener)=>listener(parentTarget, parentKey, oldValue));
                        listeners = watchList[parentPath];
                        if (listeners) listeners.forEach((listener)=>listener(parentTarget, parentKey, oldValue));
                        if (parentPath != rootState) {
                            listeners = watchList[rootState];
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
                const oldValue = receiver[key];
                if (deepEqual(value, oldValue)) return true;
                const result = Reflect.set(target, key, value, receiver);
                if (result) {
                    const rootState = path.split('.')[0];
                    const parentPath = path.substring(0, path.lastIndexOf('.'));
                    let listeners = watchList[path];
                    if (listeners) listeners.forEach((listener)=>listener(parentTarget[parentKey], key, oldValue));
                    listeners = watchList[parentPath];
                    if (listeners) listeners.forEach((listener)=>listener(parentTarget[parentKey], key, oldValue));
                    if (parentPath != rootState) {
                        listeners = watchList[rootState];
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
    function watch(root, path, fn, el) {
        let listeners = watchList[path];
        if (!listeners) {
            listeners = new Set();
            watchList[path] = listeners;
        }
        const listener = (object, key, oldValue)=>{
            if (el && !el.parentElement) {
                delete watchList[path];
                return;
            }
            fn(object, key, oldValue);
        };
        listeners.add(listener);
        let obj = root;
        const arrPath = path.split('.');
        for(let i = 1; i < arrPath.length - 1; i++){
            obj = obj[arrPath[i]];
        }
        const property = arrPath.pop();
        listener(obj, property, obj[property]);
        return ()=>{
            delete watchList[path];
        };
    }
    function compute(fn, el) {
        let cachedValue;
        let dirty = true;
        const deps = new Set();
        const recompute = ()=>{
            deps.forEach(({ path })=>{
                const listeners = watchList[path];
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
                watch(proxy, path, markDirty, el);
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
        watch(proxy, 'appState', persistState);
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
            const el = appContext.documentElement = await getDocumentElement(config);
            el.setAttribute('el-is', 'document');
            el.setAttribute('el-id', 'document');
            initElementAsComponent(el, appState, pageState);
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
            const el = document.documentElement;
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
            initElementAsComponent(el, appState, pageState);
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
function initElementAsComponent(el, appState, pageState) {
    const messageListeners = {};
    const hydrateOnComponents = [];
    const stateObject = observe({}, 'state');
    const tagNameMap = {
        ul: 'li',
        ol: 'li',
        thead: 'tr',
        tbody: 'tr'
    };
    let props = {};
    let childComponents = {};
    let parent;
    let bound = false;
    let hydrateOnCallback = ()=>{};
    if (!el.init$) {
        Object.defineProperties(el, {
            define$: {
                value: (obj)=>{
                    const componentProps = {};
                    for(const prop in obj){
                        if (!prop.endsWith('$')) throw new RenderError(`Invalid property name '${prop}'. Property names must end with a $.`);
                        if (typeof obj[prop] === 'function') componentProps[prop] = {
                            value: obj[prop]
                        };
                        else componentProps[prop] = obj[prop];
                    }
                    Object.defineProperties(el, componentProps);
                }
            },
            init$: {
                value: async (obj)=>{
                    const docEl = el.ownerDocument.documentElement;
                    if (appContext.server) {
                        if (el.renderAtClient$) return el.children$;
                        props = addPropsFromAttributes(el, obj);
                        addMissingLifecycleMethods(el);
                        await loadDependencies(el.use$(props));
                        await onInit(props);
                        await onStyle(props);
                        await onTemplate(props);
                        await onRender(props);
                        return el.children$;
                    } else if (docEl.hasAttribute('el-server-rendered')) {
                        props = addPropsFromAttributes(el, obj);
                        addMissingLifecycleMethods(el);
                        await loadDependencies(el.use$(props));
                        if (el.is$ == 'document') {
                            await onPostRender();
                            await onHydrate(props);
                            onHydrateOn('0');
                            await onReady(props);
                            docEl.removeAttribute('el-server-rendered');
                        } else if (el.componentState$ === -1) {
                            el.componentState$ = 0;
                            await onInit(props);
                            await onStyle(props);
                            await onTemplate(props);
                            await onRender(props);
                            await onHydrate(props);
                            onHydrateOn('2');
                            await onReady(props);
                        } else {
                            await onPostRender();
                            await onHydrate(props);
                            await onReady(props);
                        }
                        return el.children$;
                    } else if (docEl.hasAttribute('el-client-rendering')) {
                        props = addPropsFromAttributes(el, obj);
                        addMissingLifecycleMethods(el);
                        await loadDependencies(el.use$(props));
                        await onInit(props);
                        await onStyle(props);
                        await onTemplate(props);
                        await onRender(props);
                        if (el.is$ == 'document') {
                            docEl.removeAttribute('el-client-rendering');
                            docEl.setAttribute('el-client-hydrating', 'true');
                            await onHydrate(props);
                            onHydrateOn('1');
                            await onReady(props);
                            docEl.removeAttribute('el-client-hydrating');
                        }
                        return el.children$;
                    } else if (docEl.hasAttribute('el-client-hydrating')) {
                        props = addPropsFromAttributes(el, obj);
                        if (el.componentState$ === -1 || el.componentState$ === 0) {
                            el.componentState$ = 0;
                            addMissingLifecycleMethods(el);
                            await onInit(props);
                            await onStyle(props);
                            await onTemplate(props);
                            await onRender(props);
                            await onHydrate(props);
                            onHydrateOn('1');
                            await onReady(props);
                        } else {
                            await onHydrate(props);
                            onHydrateOn('1');
                            await onReady(props);
                        }
                        return el.children$;
                    } else if (el.getAttribute('el-hydration-delayed') == '0') {
                        props = addPropsFromAttributes(el, obj);
                        if (el.componentState$ === 2) {
                            await onPostRender();
                            await onHydrate(props);
                            await onReady(props);
                        } else if (el.componentState$ === 3) {
                            await onHydrate(props);
                            await onReady(props);
                        }
                        return el.children$;
                    } else if ([
                        '1',
                        '2'
                    ].includes(el.getAttribute('el-hydration-delayed'))) {
                        props = addPropsFromAttributes(el, obj);
                        if (el.componentState$ === 2) {
                            await onHydrate(props);
                            await onReady(props);
                        } else if (el.componentState$ === 3) {
                            await onHydrate(props);
                            await onReady(props);
                        }
                        return el.children$;
                    } else {
                        props = addPropsFromAttributes(el, obj);
                        if (el.componentState$ === -1) {
                            el.componentState$ = 0;
                            addMissingLifecycleMethods(el);
                            await loadDependencies(el.use$(props));
                            await onInit(props);
                            await onStyle(props);
                            await onTemplate(props);
                            await onRender(props);
                            await onHydrate(props);
                            onHydrateOn('2');
                            await onReady(props);
                        }
                        if (el.componentState$ === 0) {
                            addMissingLifecycleMethods(el);
                            await loadDependencies(el.use$(props));
                            await onInit(props);
                            await onStyle(props);
                            await onTemplate(props);
                            await onRender(props);
                        } else if (el.componentState$ === 1) {
                            await onStyle(props);
                            await onTemplate(props);
                            await onRender(props);
                        } else if (el.componentState$ === 2 || el.componentState$ === 3) {
                            await onHydrate(props);
                            await onReady(props);
                        }
                        return el.children$;
                    }
                }
            },
            initChildren$: {
                value: ()=>{
                    let children;
                    el.children$ = {};
                    if (el.componentState$ === 2) {
                        children = el.querySelectorAll(`:scope [el-parent="${el.id$}"]`);
                    } else if (el.id$ == 'document') {
                        children = [];
                        const head = el.querySelector('head');
                        const body = el.querySelector('body');
                        if (head) {
                            if (head.hasAttribute('el-is')) children.push(head);
                            else {
                                const components = head.querySelectorAll(':scope [el-id]');
                                for (const component of components)children.push(component);
                            }
                        }
                        if (body) {
                            if (body.hasAttribute('el-is')) children.push(body);
                            else {
                                const components = body.querySelectorAll(':scope [el-id]');
                                for (const component of components)children.push(component);
                            }
                        }
                    } else {
                        children = el.querySelectorAll(':scope [el-id]');
                    }
                    for (const childElement of children){
                        if (!childElement.hasAttribute('id')) childElement.setAttribute('id', `el${++idCount}`);
                        if (!childElement.getAttribute('el-id')) childElement.setAttribute('el-id', `el${idCount}`);
                        childElement.setAttribute('el-parent', el.getAttribute('el-id'));
                        initElementAsComponent(childElement);
                        childElement.parent$ = el;
                        const elId = childElement.id$;
                        if (childElement.is$ != 'component' && childElement.componentState$ !== 2) childElement.componentState$ = 0;
                        el.children$[elId] = childElement;
                    }
                }
            },
            uId$: {
                get: ()=>{
                    return el.getAttribute('id');
                }
            },
            id$: {
                get: ()=>{
                    return el.getAttribute('el-id');
                }
            },
            is$: {
                get: ()=>{
                    return el.getAttribute('el-is');
                }
            },
            bind$: {
                value: (fn)=>{
                    if (bound) {
                        return;
                    } else {
                        const path = props.bind;
                        if (path === null || path === undefined) return;
                        const arrPath = path ? path.split('.') : [];
                        const stateProp = arrPath[0] + '$';
                        const watch = el.parent$[stateProp][1];
                        const newWatch = (obj, path, fn)=>{
                            watch(obj, path, fn, el);
                        };
                        const state = el.parent$[stateProp][0];
                        let obj = state;
                        for(let i = 1; i < arrPath.length - 1; i++){
                            obj = obj[arrPath[i]];
                        }
                        bound = true;
                        return [
                            obj,
                            newWatch(state, path, fn)
                        ];
                    }
                }
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
                set: (value)=>{
                    if (value === -1) el.removeAttribute('el-component-state');
                    else el.setAttribute('el-component-state', value.toString());
                },
                get: ()=>{
                    const value = el.getAttribute('el-component-state');
                    if (value) return parseInt(value);
                    else return -1;
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
            hydrateOnCallback$: {
                set: (value)=>{
                    hydrateOnCallback = value;
                },
                get: ()=>{
                    return hydrateOnCallback;
                }
            },
            hydrateOnComponents$: {
                get: ()=>{
                    return hydrateOnComponents;
                }
            },
            insert$: {
                value: async (element, action, elId)=>{
                    if (element.tagName === undefined && tagNameMap[el.tagName.toLowerCase()] === undefined) element.tagName = 'div';
                    else element.tagName = tagNameMap[el.tagName.toLowerCase()];
                    const component = el.ownerDocument.createElement(element.tagName);
                    for(const prop in element){
                        if (prop == 'tagName' || prop == 'props') continue;
                        component.setAttribute(prop, element[prop]);
                    }
                    await loadDependencies([
                        element['el-is']
                    ]);
                    initElementAsComponent(component);
                    component.setAttribute('id', `el${++idCount}`);
                    component.parent$ = el;
                    component.setAttribute('el-parent', el.id$);
                    el.children$[element['el-id']] = component;
                    component.componentState$ = el.componentState$ === -1 ? -1 : 0;
                    switch(action){
                        case 'prepend':
                            el.prepend(component);
                            break;
                        case 'append':
                            el.append(component);
                            break;
                        case 'before':
                            el.children$[elId].before(component);
                            break;
                        case 'after':
                            el.children$[elId].after(component);
                            break;
                        default:
                            el.append(component);
                    }
                    if (el.componentState$ === -1) await component.init$(element.props);
                    return component;
                }
            },
            on$: {
                value: (event, ...args)=>{
                    const method = props[`on-${event}`];
                    if (typeof method == 'string') el.addEventListener(event, ()=>el.parent$[method](args));
                    else if (typeof method == 'function') el.addEventListener(event, ()=>method(args));
                }
            },
            onMessageReceived$: {
                value: async (subject, data)=>{
                    if (messageListeners[subject]) await messageListeners[subject](data, appContext.ctx);
                }
            },
            parent$: {
                set: (value)=>{
                    parent = value;
                },
                get: ()=>{
                    return parent || el.ownerDocument.documentElement;
                }
            },
            remove$: {
                value: ()=>{
                    el.parent$.removeChild(el);
                }
            },
            removeChild$: {
                value: (childElement)=>{
                    delete el.children$[childElement.id$];
                    el.removeChild(childElement);
                }
            },
            renderAtClient$: {
                get: ()=>{
                    return el.getAttribute('el-render-at') === 'client';
                }
            },
            listensFor$: {
                value: (subject)=>{
                    return messageListeners[subject] ? true : false;
                }
            },
            subscribeTo$: {
                value: (subject, handler)=>{
                    messageListeners[subject] = async (data)=>{
                        await handler(data);
                    };
                    el.setAttribute('el-listening', 'true');
                }
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
            unsubscribeTo$: {
                value: (subject)=>{
                    delete messageListeners[subject];
                    if (Object.keys(messageListeners).length === 0) el.removeAttribute('el-listening');
                }
            }
        });
    }
    async function onInit(props) {
        el.setAttribute('el-active', '');
        await el.onInit$(props);
        el.removeAttribute('el-active');
        el.componentState$ = 1;
    }
    async function onStyle(props) {
        const theme = props.theme || '';
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
    async function onTemplate(props) {
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
        } else if (![
            'HTML',
            'HEAD',
            'BODY'
        ].includes(el.tagName)) {
            el.innerHTML = '';
        }
        await getDependencies(el);
        el.initChildren$();
    }
    async function onRender(props) {
        await el.onRender$(props);
        for(const id in el.children$){
            const child = el.children$[id];
            if (child.componentState$ === 0) await child.init$();
        }
        el.componentState$ = 2;
    }
    async function onPostRender() {
        await getDependencies(el);
        el.initChildren$();
    }
    async function onHydrate(props) {
        if (el.hasAttribute('el-hydrate-on')) {
            el.componentState$ = 3;
            el.ownerDocument.documentElement.hydrateOnComponents$.push({
                'component': el,
                props
            });
        } else {
            await el.onHydrate$(props);
            for(const id in el.children$){
                const child = el.children$[id];
                if (child.componentState$ === 2) await child.init$();
            }
            if (el.componentState$ == 3) {
                el.removeAttribute('el-hydration-delayed');
                const components = el.querySelectorAll(':scope > [el-hydration-delayed]');
                for (const component of components)component.removeAttribute('el-hydration-delayed');
            }
            el.componentState$ = -1;
        }
    }
    async function onReady(props) {
        await el.onReady$(props);
    }
    function onHydrateOn(state) {
        const hydrateOnComponents = el.ownerDocument.documentElement.hydrateOnComponents$;
        if (hydrateOnComponents.length == 0) {
            el.removeAttribute('el-component-state');
            const hydratedComponents = el.querySelectorAll(':scope [el-component-state]');
            for (const component of hydratedComponents)component.removeAttribute('el-component-state');
            return;
        }
        for (const entry of hydrateOnComponents){
            const component = entry.component;
            const props = entry.props;
            const hydrateOn = component.getAttribute('el-hydrate-on');
            component.removeAttribute('el-hydrate-on');
            component.setAttribute('el-hydration-delayed', state);
            const components = el.querySelectorAll(':scope [el-component-state]');
            for (const child of components)child.setAttribute('el-hydration-delayed', state);
            if (hydrateOn == 'idle' || hydrateOn.startsWith('idle:')) {
                const time = hydrateOn.startsWith('idle:') ? parseInt(hydrateOn.substring(5)) : 0;
                if (time) {
                    component.hydrateOnCallback$ = async ()=>{
                        await getDependencies(component);
                        await component.init$(props);
                    };
                    globalThis.requestIdleCallback(component.hydrateOnCallback$, {
                        timeout: time
                    });
                }
            } else if (hydrateOn == 'timeout' || hydrateOn.startsWith('timeout:')) {
                const time = hydrateOn.startsWith('timeout:') ? parseInt(hydrateOn.substring(8)) : 500;
                component.hydrateOnCallback$ = async ()=>{
                    await getDependencies(component);
                    await component.init$(props);
                };
                setTimeout(component.hydrateOnCallback$, time);
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
        hydrateOnComponents.length = 0;
    }
    const type = el.getAttribute('el-is') || 'component';
    if (type == 'component') el.setAttribute('el-is', 'component');
    if (registeredComponents[type]) {
        if (el.hasAttribute('el-state')) {
            Object.assign(stateObject[0], JSON.parse(el.getAttribute('el-state')));
            el.removeAttribute('el-state');
        }
        registeredComponents[type](el);
    } else console.warn(`The component type '${type}' is not registered.`);
}
function addPropsFromAttributes(el, props) {
    const attrs = {};
    for (const attr of el.attributes){
        if (attr.name.startsWith('data-')) {
            attrs[attr.name.substring(5)] = attr.value || true;
        }
    }
    props = Object.assign(attrs, props);
    return props;
}
function addMissingLifecycleMethods(el) {
    if (typeof el.use$ == 'undefined') el.use$ = ()=>[];
    if (typeof el.onInit$ == 'undefined') el.onInit$ = ()=>{};
    if (typeof el.onStyle$ == 'undefined') el.onStyle$ = ()=>{};
    if (typeof el.onTemplate$ == 'undefined') el.onTemplate$ = ()=>{};
    if (typeof el.onRender$ == 'undefined') el.onRender$ = ()=>{};
    if (typeof el.onHydrate$ == 'undefined') el.onHydrate$ = ()=>{};
    if (typeof el.onReady$ == 'undefined') el.onReady$ = ()=>{};
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
    if (typeof a === "object" && typeof b === "object") {
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
        }
    });
});
createComponent('link', (el)=>{
    let _onclick;
    el.define$({
        onRender$: (props)=>{
            if (typeof props.value != 'undefined') {
                el.text$ = props.value;
            }
            if (typeof props.hidden == 'boolean') {
                el.hidden$ = props.hidden;
            }
            el.disabled$ = props.disabled || false;
            el.href$ = props.href;
        },
        onHydrate$: (props)=>{
            const onclick = props.onclick || (()=>{});
            if (typeof onclick != 'function') return;
            el.removeEventListener('click', _onclick);
            _onclick = (event)=>{
                event.preventDefault();
                if (el.disabled$) return;
                if (onclick(event) === false) return;
                if (el.href$) navigateTo(el.href$);
                else if (el.getAttribute('href')) globalThis.location.href = el.getAttribute('href');
            };
            el.addEventListener("click", _onclick);
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
        onRender$: (props)=>{
            setCaption(props.params);
            state.params = props.params;
        },
        onHydrate$: ()=>{
            watchAppState(appState, 'appState.captionPack', ()=>{
                setCaption(state.params);
            });
            watchPageState(pageState, 'pageState.captionPack', ()=>{
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
createComponent('bound-input', (el)=>{
    el.define$({
        onHydrate$: ()=>{
            const [obj] = el.bind$((obj, property)=>{
                if (obj[property]) el.value = obj[property];
            });
            el.addEventListener('input', ()=>{
                obj[el.id$] = el.value;
            });
        }
    });
});
createComponent('bound-checkbox', (el)=>{
    el.define$({
        onHydrate$: ()=>{
            const [obj] = el.bind$((obj, property)=>{
                if (obj[property]) el.checked = obj[property];
            });
            el.addEventListener('click', ()=>{
                obj[el.id$] = el.checked;
            });
        }
    });
});
export { createComponent as createComponent$, deviceSubscribesTo as deviceSubscribesTo$, emitMessage as emitMessage$, extendedURL as url$, feature as feature$, elementFetch as fetch$, useCaptions as useCaptions$, navigateTo as navigateTo$, observe as observe$, registerAllowedOrigin as registerAllowedOrigin$, registerCaptions as registerCaptions$, registerDependencies as registerDependencies$, registerServerDependencies as registerServerDependencies$, registerRoute as registerRoute$, renderDocument as renderDocument$, runAt as runAt$, subscribeTo as subscribeTo$ };
export { observe as observe };

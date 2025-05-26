console.log('elementJS:', 'v1.0.0-preview.62');
const appContext = {
    server: globalThis.Deno ? true : false,
    client: globalThis.Deno ? false : true,
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
const appState = observe({}, {
    persist: true,
    key: 'appState'
});
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
    if (!globalThis.URLPattern) await import('./urlpattern.min.js');
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
function emitMessage(subject, data, target) {
    if (target === undefined) target = window;
    if (data === undefined) data = {};
    if (typeof target.postMessage != 'function') throw new Error('target: Must be a window object');
    target.postMessage(JSON.stringify({
        subject,
        data
    }));
}
function navigateTo(path) {
    if (path === undefined) globalThis.dispatchEvent(new Event('popstate'));
    else if (path == globalThis.location.pathname) return;
    else {
        globalThis.history.pushState({}, '', path);
        dispatchEvent(new Event('popstate'));
    }
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
        let caption = registeredCaptions[name][value] || value;
        if (args && args.length > 0) {
            for(let i = 0; i < args.length; i++){
                caption = caption.replaceAll('$' + (i + 1), args[i]);
            }
        }
        return caption;
    };
}
function observe(objectToObserve, config) {
    const proxyCache = new WeakMap();
    const listeners = new Set();
    function makeObservable(obj, isRoot) {
        if (!obj || typeof obj !== 'object') return obj;
        if (proxyCache.has(obj)) return proxyCache.get(obj);
        const __root__ = {
            watch,
            watchEffect,
            computed
        };
        const proxy = new Proxy(obj, {
            get (target, key, receiver) {
                if (isRoot) __root__.proxy = proxy;
                if (key === '__root__') return __root__;
                if (key === '__proxy__') return true;
                if (Array.isArray(target) && [
                    'push',
                    'pop',
                    'shift',
                    'unshift',
                    'splice',
                    'replace'
                ].includes(key)) {
                    return function(...args) {
                        let result;
                        if (key === 'replace') {
                            result = target[args[0]];
                            target[args[0]] = args[1];
                        } else {
                            result = target[key](...args);
                        }
                        listeners.forEach((listener)=>listener(proxy, 'mutated', undefined));
                        return result;
                    };
                }
                const value = Reflect.get(target, key, receiver);
                return value && value.__proxy__ ? value : makeObservable(value);
            },
            set (target, key, value, receiver) {
                const result = Reflect.set(target, key, value, receiver);
                listeners.forEach((listener)=>listener(receiver, key, value));
                return result;
            }
        });
        proxyCache.set(obj, proxy);
        return proxy;
    }
    const proxy = makeObservable(objectToObserve, true);
    function watch(fn) {
        listeners.add(fn);
        fn(objectToObserve, '', undefined);
    }
    function computed(fn) {
        let cachedValue;
        let dirty = true;
        const result = {
            get value () {
                if (dirty) {
                    cachedValue = fn();
                    dirty = false;
                }
                return cachedValue;
            }
        };
        watch(()=>{
            dirty = true;
        });
        return result;
    }
    function debounce(fn, delay) {
        let timeout;
        return function(target, key, value) {
            clearTimeout(timeout);
            timeout = setTimeout(()=>fn(target, key, value), delay);
        };
    }
    function throttle(fn, limit) {
        let lastFn;
        let lastRan;
        return (target, key, value)=>{
            if (!lastRan) {
                fn(target, key, value);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFn);
                lastFn = setTimeout(()=>{
                    if (Date.now() - lastRan >= limit) {
                        fn(target, key, value);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    function watchEffect(fn, condition, { debounceTime = 0, throttleTime = 0 } = {}) {
        let effect = fn;
        if (debounceTime) effect = debounce(fn, debounceTime);
        if (throttleTime) effect = throttle(fn, throttleTime);
        watch((target, key, value)=>{
            if (condition(target, key, value)) {
                effect(target, key, value);
            }
        });
    }
    function persistState() {
        localStorage.setItem(config.key, JSON.stringify(objectToObserve));
    }
    function loadState() {
        const savedState = JSON.parse(localStorage.getItem(config.key) || '{}');
        if (savedState) {
            Object.assign(objectToObserve, savedState);
        }
    }
    if (config && config.persist && config.key) {
        loadState();
        watch(persistState);
    }
    return [
        proxy,
        watch,
        watchEffect,
        computed
    ];
}
function runAt(props) {
    if (appContext.server && props.server) return props.server();
    else if (appContext.client && props.client) return props.client();
}
async function renderDocument(config, ctx) {
    try {
        if (!config) config = {};
        if (!config.props) config.props = {};
        validateInputs(config, ctx);
        appContext.ctx = ctx;
        if (appContext.server) {
            setExtendedURL(ctx.request.url);
            const el = await getDocumentElement(config);
            el.setAttribute('el-is', 'document');
            el.setAttribute('el-id', 'document');
            initElementAsComponent(el, new Object());
            await el.init$(config.props);
            const components = el.querySelectorAll('[el-is]');
            for (const component of components){
                if (component.state$ && Object.keys(component.state$).length) component.setAttribute('el-state', JSON.stringify(component.state$));
            }
            el.setAttribute('el-server-rendered', 'true');
            return el;
        } else {
            const el = document.documentElement;
            el.setAttribute('el-is', 'document');
            el.setAttribute('el-id', 'document');
            if (!el.hasAttribute('el-server-rendered')) el.setAttribute('el-client-rendering', 'true');
            initElementAsComponent(el, new Object());
            setExtendedURL(globalThis.location);
            setupIntersectionObserver();
            await el.init$(config.props);
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
function initElementAsComponent(el, pageState) {
    const messageListeners = {};
    const hydrateOnComponents = [];
    const stateObject = {};
    let childComponents = {};
    let parent;
    let boundValue;
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
                value: async (props)=>{
                    const docEl = el.ownerDocument.documentElement;
                    if (appContext.server) {
                        if (el.renderAtClient$) return el.children$;
                        props = addPropsFromAttributes(el, props);
                        addMissingLifecycleMethods(el);
                        if (el.use$) await loadDependencies(el.use$());
                        await onInit(props);
                        await onStyle(props);
                        await onTemplate(props);
                        await onRender(props);
                        return el.children$;
                    } else if (docEl.hasAttribute('el-server-rendered')) {
                        props = addPropsFromAttributes(el, props);
                        addMissingLifecycleMethods(el);
                        if (el.use$) await loadDependencies(el.use$());
                        if (el.is$ == 'document') {
                            await onPostRender();
                            await onHydrate(props);
                            onHydrateOn('0');
                            docEl.removeAttribute('el-server-rendered');
                            for(const id in el.children$){
                                el.children$[id].onLoaded$(props);
                            }
                        } else {
                            await onPostRender();
                            await onHydrate(props);
                        }
                        return el.children$;
                    } else if (docEl.hasAttribute('el-client-rendering')) {
                        props = addPropsFromAttributes(el, props);
                        addMissingLifecycleMethods(el);
                        if (el.use$) await loadDependencies(el.use$());
                        await onInit(props);
                        await onStyle(props);
                        await onTemplate(props);
                        await onRender(props);
                        if (el.is$ == 'document') {
                            docEl.removeAttribute('el-client-rendering');
                            docEl.setAttribute('el-client-hydrating', 'true');
                            await onHydrate(props);
                            onHydrateOn('1');
                            docEl.removeAttribute('el-client-hydrating');
                        }
                        return el.children$;
                    } else if (docEl.hasAttribute('el-client-hydrating')) {
                        props = addPropsFromAttributes(el, props);
                        await onHydrate(props);
                        return el.children$;
                    } else if (el.getAttribute('el-hydration-delayed') == '0') {
                        props = addPropsFromAttributes(el, props);
                        if (el.componentState$ === 2) {
                            await onPostRender();
                            await onHydrate(props);
                        } else if (el.componentState$ === 3) {
                            await onHydrate(props);
                        }
                        return el.children$;
                    } else if ([
                        '1',
                        '2'
                    ].includes(el.getAttribute('el-hydration-delayed'))) {
                        props = addPropsFromAttributes(el, props);
                        if (el.componentState$ === 2) {
                            await onHydrate(props);
                        } else if (el.componentState$ === 3) {
                            await onHydrate(props);
                        }
                        return el.children$;
                    } else {
                        props = addPropsFromAttributes(el, props);
                        if (el.componentState$ === -1) {
                            el.componentState$ = 0;
                            addMissingLifecycleMethods(el);
                            if (el.use$) await loadDependencies(el.use$());
                            await onInit(props);
                            await onStyle(props);
                            await onTemplate(props);
                            await onRender(props);
                            await onHydrate(props);
                            onHydrateOn('2');
                        }
                        if (el.componentState$ === 0) {
                            addMissingLifecycleMethods(el);
                            if (el.use$) await loadDependencies(el.use$());
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
                        }
                        return el.children$;
                    }
                }
            },
            initChildren$: {
                value: ()=>{
                    let idCount = 0;
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
                                const components = head.querySelectorAll(':scope [el-is], [el-id]');
                                for (const component of components)children.push(component);
                            }
                        }
                        if (body) {
                            if (body.hasAttribute('el-is')) children.push(body);
                            else {
                                const components = body.querySelectorAll(':scope [el-is], [el-id]');
                                for (const component of components)children.push(component);
                            }
                        }
                    } else {
                        children = el.querySelectorAll(':scope [el-is], [el-id]');
                    }
                    for (const childElement of children){
                        if (!childElement.getAttribute('el-id')) childElement.setAttribute('el-id', `component${idCount++}`);
                        childElement.setAttribute('el-parent', el.getAttribute('el-id'));
                        initElementAsComponent(childElement, pageState);
                        childElement.parent$ = el;
                        const elId = childElement.id$;
                        if (childElement.is$ != 'component' && childElement.componentState$ !== 2) childElement.componentState$ = 0;
                        if (childElement.parent$.is$ == 'list') {
                            if (!el.children$.items) el.children$.items = [];
                            el.children$.items.push(childElement);
                        } else el.children$[elId] = childElement;
                    }
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
            index$: {
                get: ()=>{
                    const index = el.getAttribute('el-index');
                    return index ? Number(index) : null;
                }
            },
            bind$: {
                set: (value)=>{
                    if (!Array.isArray(value) || value.length !== 2) return;
                    const [observable, property] = boundValue = value;
                    if (typeof observable[property] === 'undefined') el.boundValue$ = el.value$;
                    else el.value$ = el.boundValue$;
                    observable.__root__.watchEffect((target)=>{
                        observable === target;
                    }, ()=>{
                        if (el.hasOwnProperty('value$')) el.value$ = el.boundValue$;
                    });
                }
            },
            boundValue$: {
                set: (value)=>{
                    if (boundValue) {
                        const [observable, property] = boundValue;
                        if (observable[property] !== value) observable[property] = value;
                    }
                },
                get: ()=>{
                    if (boundValue) {
                        const [observable, property] = boundValue;
                        return observable[property];
                    }
                    return undefined;
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
            emitMessage$: {
                value: async (subject, data)=>{
                    if (registeredMessages[subject]) {
                        const response = await registeredMessages[subject](data || {}, appContext.ctx);
                        if (isValidMessage(response)) {
                            await el.onMessageReceived$(response.subject, response.data);
                        }
                    } else console.warn('Message not registered:', subject);
                }
            },
            hidden$: {
                set: (value)=>{
                    if (typeof value != 'boolean') return;
                    if (value) {
                        let style = el.getAttribute('style');
                        if (!style) style = '';
                        style += '; display: none';
                        el.setAttribute('style', style);
                    } else {
                        let style = el.getAttribute('style');
                        if (!style) style = '';
                        style = style.replaceAll('; display: none', '');
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
                    delete el.parent$.children$[el.id$];
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
        await el.onInit$(props);
        el.componentState$ = 1;
    }
    async function onStyle(props) {
        if (el.hasOwnProperty('theme$')) return;
        const theme = el.getAttribute('el-theme') || '';
        el.define$({
            theme$: {
                get: ()=>{
                    return theme;
                }
            }
        });
        const themeId = el.is$ + (theme ? '_' + theme : '');
        let css = el.style$(props);
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
                content = content.replaceAll('[component]', `[el-theme='${themeId}']`);
                el.setAttribute('el-theme', themeId);
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
            el.setAttribute('el-theme', themeId);
            if (el.ownerDocument.head.querySelector(`[id="${themeId}"]`)) return;
            css = css.replaceAll('[component]', `[el-theme='${themeId}']`);
            const tag = el.ownerDocument.createElement('style');
            tag.setAttribute('id', themeId);
            tag.textContent = css;
            el.ownerDocument.head.append(tag);
        }
    }
    async function onTemplate(props) {
        let content;
        const template = el.template$(props);
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
        el.initChildren$();
    }
    async function onRender(props) {
        await el.onRender$(props);
        el.componentState$ = 2;
    }
    async function onPostRender() {
        await getDependencies(el);
        el.initChildren$();
    }
    async function onHydrate(props) {
        getServerState(el);
        if (el.hasAttribute('el-hydrate-on')) {
            el.componentState$ = 3;
            el.ownerDocument.documentElement.hydrateOnComponents$.push({
                'component': el,
                props
            });
        } else {
            await el.onHydrate$(props);
            if (el.componentState$ == 3) {
                el.removeAttribute('el-hydration-delayed');
                const components = el.querySelectorAll(':scope [el-hydration-delayed]');
                for (const component of components)component.removeAttribute('el-hydration-delayed');
            }
            el.componentState$ = -1;
        }
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
    if (registeredComponents[type]) registeredComponents[type](el, pageState);
    else console.warn(`The component type '${type}' is not registered.`);
}
function getServerState(el) {
    if (el.hasAttribute('el-state')) {
        const stateObject = JSON.parse(el.getAttribute('el-state') || '{}');
        Object.assign(el.state$, stateObject);
        el.removeAttribute('el-state');
    }
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
    if (typeof el.style$ == 'undefined') el.style$ = ()=>{};
    if (typeof el.template$ == 'undefined') el.template$ = ()=>{};
    if (typeof el.onInit$ == 'undefined') el.onInit$ = ()=>{};
    if (typeof el.onRender$ == 'undefined') el.onRender$ = ()=>{};
    if (typeof el.onHydrate$ == 'undefined') el.onHydrate$ = ()=>{};
    if (typeof el.onLoaded$ == 'undefined') el.onLoaded$ = ()=>{};
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
            const module = await import(url + `?eTag=${appContext.ctx.domain.hostname}:${appContext.ctx.domain.cacheDTS}`);
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
        });
        await Promise.allSettled(imports);
    } catch (e) {
        console.error('Failed to load dependencies:', e);
        throw e;
    }
}
createComponent('document', (el, _pageState)=>{
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
createComponent('list', (el, pageState)=>{
    const tagNameMap = {
        ul: 'li',
        ol: 'li',
        thead: 'tr',
        tbody: 'tr',
        body: 'div',
        main: 'div'
    };
    let idCount = 0;
    el.define$({
        template$: (_props)=>'',
        onRender$: async (props)=>{
            let items = [];
            el.setAttribute('el-type', props.type);
            if (typeof props.items == 'undefined') {
                delete props.type;
                await el.add$(props, 0);
                items.push(props);
            } else if (Array.isArray(props.items) && props.items.length > 0) {
                items = props.items;
                delete props.type;
                delete props.items;
                for(let i = 0; i < items.length; i++){
                    const newProps = {
                        ...props,
                        ...items[i]
                    };
                    await el.add$(newProps, i);
                }
            }
        },
        onHydrate$: async (props)=>{
            if (typeof props != 'object') props = {};
            const items = el.children$.items || [];
            for (const child of items){
                const newProps = {
                    ...props
                };
                await child.init$(newProps);
            }
        },
        add$: async (props, index = 0)=>{
            const type = el.getAttribute('el-type');
            const tagName = tagNameMap[el.tagName.toLocaleLowerCase()] || el.tagName;
            const component = el.ownerDocument.createElement(tagName);
            component.setAttribute('el-is', type);
            component.setAttribute('el-id', `${type}${idCount++}`);
            component.setAttribute('el-parent', el.id$);
            component.setAttribute('el-index', index.toString());
            await loadDependencies([
                type
            ]);
            initElementAsComponent(component, pageState);
            component.parent$ = el;
            component.componentState$ = 0;
            if (!el.children$.items) el.children$.items = [];
            el.children$.items.push(component);
            el.append(component);
            await component.init$(props);
            return component;
        }
    });
});
createComponent('component', (el, _pageState)=>{
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
createComponent('link', (el, _pageState)=>{
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
export { appState as appState$, createComponent as createComponent$, deviceSubscribesTo as deviceSubscribesTo$, emitMessage as emitMessage$, extendedURL as url$, feature as feature$, useCaptions as useCaptions$, navigateTo as navigateTo$, observe as observe$, registerAllowedOrigin as registerAllowedOrigin$, registerCaptions as registerCaptions$, registerDependencies as registerDependencies$, registerServerDependencies as registerServerDependencies$, registerRoute as registerRoute$, renderDocument as renderDocument$, runAt as runAt$, subscribeTo as subscribeTo$ };

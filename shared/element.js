console.log('elementJS:', 'v1.0.0-preview.281');
const Symbols = {
    use: Symbol('use'),
    onInit: Symbol('onInit'),
    onStyle: Symbol('onStyle'),
    onTemplate: Symbol('onTemplate'),
    onRender: Symbol('onRender'),
    onHydrate: Symbol('onHydrate'),
    onReady: Symbol('onReady'),
    onCleanup: Symbol('onCleanup')
};
const appContext = {
    server: globalThis.Deno ? true : false,
    client: globalThis.Deno ? false : true,
    documentElement: null,
    ctx: null
};
const pipes = {
    currency (value, currency = 'USD', display = 'symbol', digits, locale = 'en') {
        const options = {
            style: 'currency',
            currency
        };
        if (display === 'code') {
            options.currencyDisplay = 'code';
        } else if (display === 'symbol') {
            options.currencyDisplay = 'symbol';
        } else if (display === 'symbol-narrow') {
            options.currencyDisplay = 'narrowSymbol';
        }
        if (digits) {
            const match = digits.match(/(\d+)\.(\d+)-(\d+)/);
            if (match) {
                const [, minInt, minFrac, maxFrac] = match;
                options.minimumIntegerDigits = +minInt;
                options.minimumFractionDigits = +minFrac;
                options.maximumFractionDigits = +maxFrac;
            }
        }
        return new Intl.NumberFormat(locale, options).format(value);
    },
    date (value, format = 'mediumDate', locale = 'en-US', timezone) {
        let date = value instanceof Date ? value : new Date(value);
        if ('__target__' in date) date = date.__target__;
        const tz = normalizeTimezone(timezone);
        if (tz && tz.type === 'offset') {
            date = shiftDateByOffset(date, tz.offsetMinutes);
        }
        const predefined = {
            short: {
                dateStyle: 'short',
                timeStyle: 'short'
            },
            medium: {
                dateStyle: 'medium',
                timeStyle: 'medium'
            },
            long: {
                dateStyle: 'long',
                timeStyle: 'long'
            },
            full: {
                dateStyle: 'full',
                timeStyle: 'full'
            },
            shortDate: {
                dateStyle: 'short'
            },
            mediumDate: {
                dateStyle: 'medium'
            },
            longDate: {
                dateStyle: 'long'
            },
            fullDate: {
                dateStyle: 'full'
            },
            shortTime: {
                timeStyle: 'short'
            },
            mediumTime: {
                timeStyle: 'medium'
            },
            longTime: {
                timeStyle: 'long'
            },
            fullTime: {
                timeStyle: 'full'
            }
        };
        const options = predefined[format];
        if (options) {
            return new Intl.DateTimeFormat(locale, {
                ...options,
                ...tz && tz.type === 'iana' ? {
                    timeZone: tz.value
                } : {}
            }).format(date);
        }
        return formatDateCustom(date, format, locale, tz);
    },
    number (value, digitsInfo, locale = 'en-US') {
        if (value == null || isNaN(value)) return null;
        const { minIntegerDigits, minFractionDigits, maxFractionDigits } = parseDigitsInfo(digitsInfo);
        const formatter = new Intl.NumberFormat(locale, {
            minimumIntegerDigits: minIntegerDigits,
            minimumFractionDigits: minFractionDigits,
            maximumFractionDigits: maxFractionDigits
        });
        return formatter.format(value);
    },
    lowercase (value) {
        if (value == null) return value;
        return String(value).toLowerCase();
    },
    uppercase (value) {
        if (value == null) return value;
        return String(value).toUpperCase();
    },
    titlecase (value) {
        if (value == null) return value;
        return String(value).toLowerCase().replace(/\b\w/g, (__char)=>__char.toUpperCase());
    },
    percent (value, digitsInfo, locale = 'en-US') {
        if (value == null || isNaN(value)) return null;
        const { minIntegerDigits, minFractionDigits, maxFractionDigits } = parseDigitsInfo(digitsInfo);
        const formatter = new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumIntegerDigits: minIntegerDigits,
            minimumFractionDigits: minFractionDigits,
            maximumFractionDigits: maxFractionDigits
        });
        return formatter.format(value);
    }
};
function parseDigitsInfo(digitsInfo) {
    let minIntegerDigits = 1;
    let minFractionDigits = 0;
    let maxFractionDigits = 3;
    if (!digitsInfo) {
        return {
            minIntegerDigits,
            minFractionDigits,
            maxFractionDigits
        };
    }
    const match = digitsInfo.match(/^(\d+)?\.?(\d+)?-?(\d+)?$/);
    if (!match) {
        throw new Error(`Invalid digitsInfo format: "${digitsInfo}"`);
    }
    const [, intPart, minFrac, maxFrac] = match;
    if (intPart !== undefined) minIntegerDigits = +intPart;
    if (minFrac !== undefined) minFractionDigits = +minFrac;
    if (maxFrac !== undefined) maxFractionDigits = +maxFrac;
    return {
        minIntegerDigits,
        minFractionDigits,
        maxFractionDigits
    };
}
function normalizeTimezone(tz) {
    if (!tz) return null;
    if (tz === 'UTC' || tz === 'Z') {
        return {
            type: 'iana',
            value: 'UTC'
        };
    }
    if (tz.includes('/')) {
        return {
            type: 'iana',
            value: tz
        };
    }
    const match = tz.match(/^([+-])(\d{2}):?(\d{2})$/);
    if (match) {
        const [, sign, h, m] = match;
        const minutes = parseInt(h) * 60 + parseInt(m);
        return {
            type: 'offset',
            offsetMinutes: sign === '+' ? minutes : -minutes
        };
    }
    return null;
}
function formatDateCustom(date, format, locale, tz) {
    const intlOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        ...tz && tz.type === 'iana' ? {
            timeZone: tz.value
        } : {}
    };
    const parts = new Intl.DateTimeFormat(locale, intlOptions).formatToParts(date);
    const map = Object.fromEntries(parts.map((p)=>[
            p.type,
            p.value
        ]));
    const tokens = {
        yyyy: map.year,
        yy: map.year.slice(-2),
        MMMM: new Intl.DateTimeFormat(locale, {
            month: 'long',
            ...tz?.type === 'iana' && {
                timeZone: tz.value
            }
        }).format(date),
        MMM: map.month,
        MM: String(date.getMonth() + 1).padStart(2, '0'),
        M: date.getMonth() + 1,
        dd: map.day,
        d: Number(map.day),
        EEEE: map.weekday,
        hh: map.hour.padStart(2, '0'),
        h: Number(map.hour),
        mm: map.minute,
        m: Number(map.minute),
        ss: map.second,
        s: Number(map.second),
        a: map.dayPeriod || ''
    };
    format = format.replace(/'([^']+)'/g, (_, literal)=>`__LITERAL_${literal}__`);
    let result = format;
    for (const key of Object.keys(tokens).sort((a, b)=>b.length - a.length)){
        result = result.replace(new RegExp(key, 'g'), tokens[key]);
    }
    return result.replace(/__LITERAL_(.*?)__/g, (_, literal)=>literal);
}
function shiftDateByOffset(date, offsetMinutes) {
    const localOffset = date.getTimezoneOffset();
    const diff = offsetMinutes + localOffset;
    return new Date(date.getTime() + diff * 60000);
}
class Pipe {
    name;
    args;
    fn;
    constructor(expression){
        const [name, ...args] = expression.split(':');
        this.name = name;
        this.args = args;
        this.fn = pipes[name];
        if (!this.fn) {
            throw new Error(`Pipe "${name}" not found`);
        }
    }
    getValue(value) {
        return this.fn(value, ...this.args);
    }
}
class PipeChain {
    pipes;
    constructor(expression){
        this.pipes = expression.map((val)=>new Pipe(val.trim()));
    }
    getValue(value) {
        return this.pipes.reduce((val, pipe)=>pipe.getValue(val), value);
    }
}
class Feature {
    featureFlags = null;
    constructor(){}
    async flag(obj) {
        if (this.featureFlags === null) {
            this.featureFlags = appContext.ctx ? appContext.ctx.feature.featureFlags : getFeatureFlags();
        }
        for(const prop in obj){
            const flags = prop.split(',');
            for (const flag of flags){
                if (this.featureFlags.includes(flag) || flag == 'default') {
                    return await obj[prop]();
                }
            }
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
    el = null;
    isProp = true;
    boundFunctions = new Set();
    propValue = undefined;
    pipedPropValue = undefined;
    propPipeChain = undefined;
    unwatchFn = ()=>{};
    rewatchFn = ()=>{};
    static isProp(obj) {
        return obj == null ? undefined : obj.isProp;
    }
    constructor(value, el){
        this.el = el;
        this.propValue = value;
    }
    get value() {
        return this.propValue;
    }
    set value(value) {
        this.propValue = value;
        this.pipedPropValue = this.propPipeChain.getValue(value);
        this.boundFunctions.forEach((fn)=>fn(this.propValue, this.pipedPropValue));
    }
    set pipeChain(value) {
        this.propPipeChain = value;
        this.pipedPropValue = this.propPipeChain.getValue(this.propValue);
    }
    get pipedValue() {
        return this.pipedPropValue;
    }
    get unwatch() {
        return this.unwatchFn;
    }
    set unwatch(value) {
        this.unwatchFn = value;
    }
    get rewatch() {
        return this.rewatchFn;
    }
    set rewatch(value) {
        this.rewatchFn = value;
    }
    onChange(fn, execute = false) {
        this.boundFunctions.add(fn);
        if (execute || this.el.hydratedOn) fn(this.propValue, this.pipedPropValue);
        return ()=>{
            this.boundFunctions.delete(fn);
        };
    }
}
class StateProp {
    el = null;
    isStateProp = true;
    boundFunctions = new Set();
    isBound = false;
    stateObj = undefined;
    path = undefined;
    propName = undefined;
    pipedPropValue = undefined;
    propPipeChain = undefined;
    bindFunction = ()=>{};
    unwatchFn = ()=>{};
    rewatchFn = ()=>{};
    static isStateProp(obj) {
        return obj == null ? undefined : obj.isStateProp;
    }
    constructor(statePath, stateObj, stateObjPropName, bindFunction, el){
        this.el = el;
        this.path = statePath;
        this.stateObj = stateObj;
        this.propName = stateObjPropName;
        this.bindFunction = bindFunction;
    }
    get statePath() {
        return this.path;
    }
    set statePath(value) {
        this.pipedPropValue = this.propPipeChain.getValue(value);
        this.path = value;
    }
    get value() {
        const value = this.stateObj[this.propName];
        return DerivedState.isDerived(value) ? value.value : value;
    }
    set value(value) {
        this.stateObj[this.propName] = value;
    }
    set pipeChain(value) {
        this.propPipeChain = value;
        this.pipedPropValue = this.propPipeChain.getValue(this.value);
    }
    get pipedValue() {
        return this.pipedPropValue;
    }
    get unwatch() {
        return this.unwatchFn;
    }
    set unwatch(value) {
        this.unwatchFn = value;
    }
    get rewatch() {
        return this.rewatchFn;
    }
    set rewatch(value) {
        this.rewatchFn = value;
    }
    onChange(fn, execute = false) {
        if (!this.isBound) {
            this.bindFunction(()=>{
                this.boundFunctions.forEach((fn)=>{
                    const value = this.stateObj[this.propName];
                    this.pipedPropValue = this.propPipeChain.getValue(value);
                    fn(value, this.pipedPropValue);
                });
            });
        }
        this.boundFunctions.add(fn);
        if (execute || this.el.hydratedOn) fn(this.stateObj[this.propName], this.pipedPropValue);
        return ()=>{
            this.boundFunctions.delete(fn);
        };
    }
}
class DerivedState {
    isDerived = true;
    boundFunctions = new Set();
    propValue = undefined;
    static isDerived(obj) {
        return obj == null ? undefined : obj.isDerived;
    }
    constructor(){}
    get value() {
        return this.propValue;
    }
    set value(value) {
        this.propValue = value;
        this.boundFunctions.forEach((fn)=>fn(this.propValue));
    }
    onChange(fn, execute = false) {
        this.boundFunctions.add(fn);
        if (execute) fn(this.propValue);
        return ()=>{
            this.boundFunctions.delete(fn);
        };
    }
}
const feature = new Feature();
const registeredAllowedOrigins = [
    ''
];
const registeredTranslations = {};
const registeredComponents = {};
const registeredDependencies = {};
const registeredServerDependencies = {};
const deviceMessageHandlers = new Map();
const messageHandlers = new Map();
const registeredRoutes = {};
const resourceCache = new Map();
let intersectionObserver;
let idCount = 0;
(function() {
    globalThis.addEventListener('message', processMessageEvent, false);
    globalThis.addEventListener('popstate', processPopStateEvent, false);
    if (globalThis.location) registerAllowedOrigin(globalThis.location.origin);
})();
async function processMessageEvent(event) {
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
        if (deviceMessageHandlers.has(subject)) {
            listenerFound = true;
            if (window.webkit) {
                window.webkit.messageHandlers.Device.postMessage(event.data);
            } else {
                window.Device.postMessage(event.data);
            }
        }
        if (messageHandlers.has(subject)) {
            listenerFound = true;
            const listeners = messageHandlers.get(subject);
            const arr = [];
            for (const listener of listeners)arr.push(listener(data));
            const results = await Promise.allSettled(arr);
            for (const result of results){
                if (result.status == 'rejected') console.error(result.reason);
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
async function processPopStateEvent() {
    for(const routePath in registeredRoutes){
        const route = {
            path: routePath,
            handler: registeredRoutes[routePath]
        };
        const pattern = new globalThis.URLPattern({
            pathname: route.path
        });
        if (pattern.test(globalThis.location.href)) {
            await route.handler();
            break;
        }
    }
}
async function serverRenderDocument(htmlOrFile, ctx) {
    try {
        if (!htmlOrFile) {
            throw new RenderError('Either a file path or HTML content must be provided');
        }
        if (!ctx || typeof ctx !== 'object') {
            throw new RenderError('Invalid server context object provided');
        }
        if (!appContext.server) return;
        appContext.ctx = ctx;
        const pageState = observe({}, 'pageState');
        const el = appContext.documentElement = await getDocumentElement(htmlOrFile);
        el.setAttribute('data-is', 'document');
        el.setAttribute('el-server-rendering', 'true');
        initElementAsComponent(el, null, null, pageState, ctx);
        await el.init();
        const components = el.querySelectorAll('[data-is]');
        for (const component of components){
            if (Object.keys(component.state).length) component.setAttribute('el-state', JSON.stringify(component.state[0]));
        }
        el.removeAttribute('el-server-rendering');
        el.setAttribute('el-server-rendered', 'true');
        el.setAttribute('el-state', JSON.stringify(el.pageState[0]));
        el.setAttribute('el-id-count', idCount.toString());
        return el;
    } catch (e) {
        console.error('Render error:', e);
        throw e;
    }
}
async function renderDocument() {
    try {
        if (appContext.server) return;
        const appState = observe({}, 'appState', {
            persist: true,
            key: 'elementJS_appState_' + globalThis.location.hostname
        });
        const pageState = observe({}, 'pageState');
        const el = document.documentElement;
        el.setAttribute('data-is', 'document');
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
        const scripts = el.querySelectorAll('script[data-ssr-script]');
        for (const script of scripts){
            script.removeAttribute('data-ssr-script');
        }
        initElementAsComponent(el, null, appState, pageState);
        setupIntersectionObserver();
        await el.init();
        return el;
    } catch (e) {
        console.error('Render error:', e);
        throw e;
    }
}
async function getDocumentElement(htmlOrFile) {
    let html;
    if (htmlOrFile.startsWith('/')) {
        html = await getResource(htmlOrFile);
        if (!html) {
            console.error('Could not create document element - file not found: ', htmlOrFile);
            throw new RenderError('FileNotFound');
        }
    }
    const docEl = appContext.ctx.parser.parseFromString(html, 'text/html').documentElement;
    const scripts = docEl.querySelectorAll('script[data-ssr-script]');
    for (const script of scripts){
        await importModule(script.getAttribute('src'));
        script.removeAttribute('data-ssr-script');
    }
    return docEl;
}
function initElementAsComponent(el, parent, appState, pageState, ctx) {
    const isParts = el.dataset.is.split(':');
    const componentIs = isParts[0];
    const componentId = isParts[1];
    const componentProps = {};
    const renderAt = el.getAttribute('data-render-at');
    const hydrateOnComponents = new Set();
    const style = parseStyle(el.getAttribute('style') || '');
    let isRoot = parent === null || parent.componentState === -1;
    let componentState = -1;
    let childComponents = {};
    let stateObject = null;
    let hydratedOn = false;
    if (parent === null || parent.componentState === -1) isRoot = true;
    if (el.hasAttribute('el-comp-state')) {
        componentState = parseInt(el.getAttribute('el-comp-state'));
    } else {
        el.setAttribute('el-comp-state', String(componentState));
    }
    Object.defineProperties(el, {
        define: {
            value: (userDefinedProperties)=>{
                for(const prop in userDefinedProperties){
                    if (typeof userDefinedProperties[prop] === 'function') {
                        userDefinedProperties[prop] = {
                            value: userDefinedProperties[prop]
                        };
                    }
                    if ([
                        'use',
                        'onInit',
                        'onStyle',
                        'onTemplate',
                        'onRender',
                        'onHydrate',
                        'onReady',
                        'onCleanup'
                    ].includes(prop)) {
                        userDefinedProperties[Symbols[prop]] = userDefinedProperties[prop];
                        delete userDefinedProperties[prop];
                    }
                }
                Object.defineProperties(el, userDefinedProperties);
            }
        },
        init: {
            value: async (props)=>{
                if (componentState === -1) componentState = 0;
                addMissingLifecycleMethods(el);
                if (appContext.server && renderAt == 'client') {
                    return childComponents;
                }
                if (appContext.client && renderAt == 'server') {
                    return childComponents;
                }
                if (componentState === 0) {
                    addPropsFromAttributes(componentProps, el);
                    addProps(componentProps, el, props);
                    await loadDependencies(el[Symbols.use](componentProps));
                    await onInit(el, componentProps);
                    await onStyle(el, componentProps);
                    await onTemplate(el, componentProps);
                    await onRender(el, componentProps);
                }
                if (appContext.server) {
                    componentState = 1;
                    el.setAttribute('el-comp-state', String(componentState));
                    return childComponents;
                }
                if (componentState === 0) {
                    componentState = 2;
                    if (!isRoot) return childComponents;
                }
                if (componentState === 1) {
                    await onResume(el);
                    componentState = 2;
                    if (!isRoot) return childComponents;
                }
                if (componentState === 2) {
                    if (el.hasAttribute('data-hydrate-on')) {
                        el.parent.hydrateOnComponents.add({
                            el,
                            props: componentProps,
                            hydrateOn: el.getAttribute('data-hydrate-on')
                        });
                        hydratedOn = true;
                        el.removeAttribute('data-hydrate-on');
                        return;
                    }
                    addPropsFromAttributes(componentProps, el);
                    addProps(componentProps, el, props);
                    await loadDependencies(el[Symbols.use](componentProps));
                    await onHydrate(el, componentProps);
                    await onReady(el, componentProps);
                    componentState = -1;
                    el.removeAttribute('el-comp-state');
                }
            }
        },
        compId: {
            get: ()=>{
                return componentId;
            }
        },
        compIs: {
            get: ()=>{
                return componentIs;
            }
        },
        emit: {
            value: (event, data, config = {})=>{
                const bubbles = config.bubbles !== false || false;
                Object.assign(config, {
                    bubbles,
                    detail: data
                });
                const async = config.async;
                delete config.async;
                if (async === true) {
                    setTimeout(()=>{
                        el.dispatchEvent(new CustomEvent(event, config));
                    }, 0);
                } else {
                    el.dispatchEvent(new CustomEvent(event, config));
                }
            }
        },
        on: {
            value: (event, handler)=>{
                el.addEventListener(event, handler);
                return ()=>{
                    el.removeEventListener(event, handler);
                };
            }
        },
        components: {
            get: ()=>{
                return childComponents;
            },
            set: (value)=>{
                childComponents = value;
            }
        },
        componentState: {
            get: ()=>{
                return componentState;
            }
        },
        hydratedOn: {
            get: ()=>{
                return hydratedOn;
            }
        },
        hydrateOnComponents: {
            get: ()=>{
                return hydrateOnComponents;
            }
        },
        parent: {
            set: (value)=>{
                parent = value;
            },
            get: ()=>{
                return parent;
            }
        },
        setProp: {
            value: (name, value)=>{
                if (appContext.server && !el.hasAttribute('data-' + name)) {
                    if (typeof value == 'boolean') {
                        value = 'bool:' + String(value);
                    } else if (typeof value == 'number') {
                        value = 'num:' + String(value);
                    } else if (typeof value != 'string') {
                        console.warn(`setProp: The property '${name}' has an invalid value type of ${typeof value}`);
                    }
                    el.setAttribute('data-' + name, value);
                }
                const prop = {};
                name = toCamelCase(name);
                prop[name] = value;
                addProps(componentProps, el, prop);
                return componentProps[name];
            }
        },
        props: {
            get: ()=>{
                return componentProps;
            }
        },
        unmount: {
            value: async (element)=>{
                await onCleanup(element || el);
            }
        },
        appState: {
            get: ()=>{
                return appState || el.ownerDocument.documentElement.appState;
            }
        },
        pageState: {
            get: ()=>{
                return pageState || el.ownerDocument.documentElement.pageState;
            }
        },
        state: {
            get: ()=>{
                if (!stateObject) stateObject = observe({}, 'state');
                return stateObject;
            }
        },
        hasState: {
            get: ()=>{
                return stateObject ? true : false;
            }
        },
        unmountComponents: {
            value: async ()=>{
                for(const key in el.components)await el.components[key].unmount();
            }
        },
        url: {
            get: ()=>{
                if (appContext.server) {
                    return ctx ? ctx.request.url : el.ownerDocument.documentElement.url;
                } else {
                    return globalThis.location;
                }
            }
        },
        addFirst: {
            value: async (element, autoInit = false)=>{
                const component = await insertElement(el, element, 'append', '', autoInit);
                return component;
            }
        },
        addLast: {
            value: async (element, autoInit = false)=>{
                const component = await insertElement(el, element, 'prepend', '', autoInit);
                return component;
            }
        },
        addBefore: {
            value: async (element, elId, autoInit = false)=>{
                const component = await insertElement(el, element, 'before', elId, autoInit);
                return component;
            }
        },
        addAfter: {
            value: async (element, elId, autoInit = false)=>{
                const component = await insertElement(el, element, 'after', elId, autoInit);
                return component;
            }
        }
    });
    if (appContext.server) {
        Object.defineProperties(el, {
            alt: {
                set: (value)=>{
                    if (value === undefined) el.removeAttribute('alt');
                    else el.setAttribute('alt', value);
                },
                get: ()=>{
                    return el.getAttribute('alt') || '';
                }
            },
            checked: {
                set: (value)=>{
                    if (typeof value != 'boolean') return;
                    if (value) el.setAttribute('checked', '');
                    else el.removeAttribute('checked');
                },
                get: ()=>{
                    return el.hasAttribute('checked');
                }
            },
            disabled: {
                set: (value)=>{
                    if (typeof value != 'boolean') return;
                    if (value) el.setAttribute('disabled', '');
                    else el.removeAttribute('disabled');
                },
                get: ()=>{
                    return el.hasAttribute('disabled');
                }
            },
            hidden: {
                set: (value)=>{
                    if (typeof value != 'boolean') return;
                    if (value) el.setAttribute('hidden', '');
                    else el.removeAttribute('hidden');
                },
                get: ()=>{
                    return el.hasAttribute('hidden');
                }
            },
            readOnly: {
                set: (value)=>{
                    if (typeof value != 'boolean') return;
                    if (value) el.setAttribute('readonly', '');
                    else el.removeAttribute('readonly');
                },
                get: ()=>{
                    return el.hasAttribute('readonly');
                }
            },
            src: {
                set: (value)=>{
                    if (value === undefined) el.removeAttribute('src');
                    else el.setAttribute('src', value);
                },
                get: ()=>{
                    return el.getAttribute('src') || '';
                }
            },
            style: {
                get: ()=>{
                    return style;
                }
            },
            title: {
                set: (value)=>{
                    if (value === undefined) el.removeAttribute('title');
                    else el.setAttribute('title', value);
                },
                get: ()=>{
                    return el.getAttribute('title') || '';
                }
            },
            type: {
                set: (value)=>{
                    if (value === undefined) el.removeAttribute('type');
                    else el.setAttribute('type', value);
                },
                get: ()=>{
                    return el.getAttribute('type') || '';
                }
            },
            value: {
                set: (value)=>{
                    if (value === undefined) el.removeAttribute('value');
                    else el.setAttribute('value', value);
                },
                get: ()=>{
                    return el.getAttribute('value') || '';
                }
            }
        });
    }
    if (registeredComponents[componentIs]) {
        if (el.hasAttribute('el-state')) {
            Object.assign(el.state[0], JSON.parse(el.getAttribute('el-state')));
            el.removeAttribute('el-state');
        }
        registeredComponents[componentIs](el);
    } else console.warn(`The component type '${componentIs}' is not registered.`);
    return el;
}
function addMissingLifecycleMethods(el) {
    if (typeof el[Symbols.use] == 'undefined') el[Symbols.use] = ()=>[];
    if (typeof el[Symbols.onInit] == 'undefined') el[Symbols.onInit] = ()=>{};
    if (typeof el[Symbols.onStyle] == 'undefined') el[Symbols.onStyle] = ()=>{};
    if (typeof el[Symbols.onTemplate] == 'undefined') el[Symbols.onTemplate] = ()=>{};
    if (typeof el[Symbols.onRender] == 'undefined') el[Symbols.onRender] = ()=>{};
    if (typeof el[Symbols.onHydrate] == 'undefined') el[Symbols.onHydrate] = ()=>{};
    if (typeof el[Symbols.onReady] == 'undefined') el[Symbols.onReady] = ()=>{};
    if (typeof el[Symbols.onCleanup] == 'undefined') el[Symbols.onCleanup] = ()=>{};
}
async function onInit(el, props) {
    el.setAttribute('el-active', '');
    await el[Symbols.onInit](props);
    el.removeAttribute('el-active');
}
async function onStyle(el, props) {
    const theme = props.theme !== undefined ? props.theme.value : '';
    const themeId = el.compIs + (theme ? '_' + theme : '');
    let css = el[Symbols.onStyle](props);
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
            if (theme) content = content.replaceAll('[el]', `[data-is^='${el.compIs}:'][data-theme='${theme}']`);
            else content = content.replaceAll('[el]', `[data-is^='${el.compIs}:']`);
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
        if (theme) css = css.replaceAll('[el]', `[data-is^='${el.compIs}:'][data-theme='${theme}']`);
        else css = css.replaceAll('[el]', `[data-is^='${el.compIs}:']`);
        const tag = el.ownerDocument.createElement('style');
        tag.setAttribute('id', themeId);
        tag.textContent = css;
        el.ownerDocument.head.append(tag);
    }
}
async function onTemplate(el, props) {
    let content;
    const template = el[Symbols.onTemplate](props);
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
            el.innerHTML = content;
        } else {
            content = await getResource(url) || '';
            el.innerHTML = content;
        }
    } else if (template) {
        content = template;
        el.innerHTML = content;
    } else if (template == '') {
        el.innerHTML = template;
    }
    await getDependencies(el);
    initChildren(el);
}
async function onRender(el, props) {
    for(const name in props){
        if (name == 'class') {
            const value = props[name].value;
            if (typeof value == 'string') {
                el.className = value;
            } else if (Array.isArray(value)) {
                el.className = value.join(' ');
            } else if (typeof value == 'object') {
                const names = [];
                for(const key in value){
                    if (value[key]) names.push(key);
                }
                el.className = names.join(' ');
            }
        } else if (name.startsWith('class:')) {
            const parts = name.split(':');
            if (parts.length === 2) {
                const className = parts[1];
                el.classList.toggle(className, props[name].value);
            }
        } else if (name == 'hidden') {
            el.hidden = props[name].value;
        } else if (name == 'visible') {
            el.hidden = !props[name].value;
        } else if (name == 'style') {
            const value = props[name].value;
            if (typeof value == 'string') {
                const styles = parseStyle(value);
                for(const key in styles){
                    if (styles[key]) el.style[key] = styles[key];
                }
            } else if (typeof value == 'object' && !Array.isArray(value)) {
                for(const key in value){
                    if (value[key]) el.style[key] = value[key];
                }
            }
        } else if (name.startsWith('style:')) {
            const styleProp = name.split(':')[1];
            el.style[styleProp] = props[name].value;
        }
    }
    await el[Symbols.onRender](props);
    if (appContext.server) el.setAttribute('style', serializeStyle(el.style));
    for(const id in el.components){
        const child = el.components[id];
        if (child.componentState == -1) await child.init();
    }
}
async function onResume(el) {
    await getDependencies(el);
    initChildren(el);
    for(const id in el.components){
        const child = el.components[id];
        await child.init();
    }
}
async function onHydrate(el, props) {
    for(const name in props){
        if (name == 'class') {
            props[name].onChange((value)=>{
                if (typeof value == 'string') {
                    el.className = value;
                } else if (Array.isArray(value)) {
                    el.className = value.join(' ');
                } else if (typeof value == 'object') {
                    const names = [];
                    for(const key in value){
                        if (value[key]) names.push(key);
                    }
                    el.className = names.join(' ');
                }
            });
        } else if (name.startsWith('class:')) {
            props[name].onChange((value)=>{
                const parts = name.split(':');
                if (parts.length === 2) {
                    const className = parts[1];
                    el.classList.toggle(className, value);
                }
            });
        } else if (name == 'hidden') {
            props[name].onChange((value)=>{
                el.hidden = value;
            });
        } else if (name.startsWith('on:')) {
            props[name].onChange((value)=>{
                const onProp = name.replace(':', '');
                if (typeof value == 'function') {
                    el[onProp] = value;
                } else if (typeof value == 'string') {
                    el[onProp] = (data)=>{
                        el.emit(value, data);
                    };
                }
            });
        } else if (name == 'visible') {
            props[name].onChange((value)=>{
                el.hidden = !value;
            });
        } else if (name == 'style') {
            props[name].onChange((value)=>{
                if (typeof value == 'string') {
                    const styles = parseStyle(value);
                    for(const key in styles){
                        if (styles[key]) el.style[key] = styles[key];
                    }
                } else if (typeof value == 'object' && !Array.isArray(value)) {
                    for(const key in value){
                        if (value[key]) el.style[key] = value[key];
                    }
                }
            });
        } else if (name.startsWith('style:')) {
            props[name].onChange((value)=>{
                const styleProp = name.split(':')[1];
                el.style[styleProp] = value;
            });
        }
    }
    await el[Symbols.onHydrate](props);
    for(const id in el.components){
        const child = el.components[id];
        if (child.componentState == 2) await child.init();
    }
}
async function onReady(el, props) {
    await el[Symbols.onReady](props);
    onHydrateOn(el);
    if (el.pageState[0].__dev__ != true) removeAttributes(el);
}
function onHydrateOn(el) {
    for (const entry of el.hydrateOnComponents){
        const component = entry.el;
        const hydrateOn = entry.hydrateOn;
        if (hydrateOn == 'idle' || hydrateOn.startsWith('idle:')) {
            const time = hydrateOn.startsWith('idle:') ? parseInt(hydrateOn.substring(5)) : 0;
            if (time) {
                const callback = async ()=>{
                    if (component.parent == null) return;
                    await getDependencies(component);
                    await component.init(entry.props);
                };
                globalThis.requestIdleCallback(callback, {
                    timeout: time
                });
            }
        } else if (hydrateOn == 'timeout' || hydrateOn.startsWith('timeout:')) {
            const time = hydrateOn.startsWith('timeout:') ? parseInt(hydrateOn.substring(8)) : 500;
            const callback = async ()=>{
                if (component.parent == null) return;
                await getDependencies(component);
                await component.init(entry.props);
            };
            setTimeout(callback, time);
        } else if (hydrateOn == 'visible') {
            component.hydrateOnCallback = async ()=>{
                if (component.parent == null) return;
                await getDependencies(component);
                await component.init(entry.props);
                intersectionObserver.unobserve(component);
            };
            intersectionObserver.observe(component);
        } else {
            throw new RenderError(`Invalid data-hydrate-on attribute value: ${hydrateOn}`);
        }
    }
    el.hydrateOnComponents.clear();
}
async function onCleanup(el) {
    const descendants = el.querySelectorAll(':scope [data-is]');
    for (const descendant of descendants){
        await descendant[Symbols.onCleanup]();
        descendant.parent = null;
    }
    await el[Symbols.onCleanup]();
    unwatchElementProps(el);
    delete el.parent.components[el.compId];
    setTimeout(()=>{
        el.parent = null;
    }, 0);
    el.parentElement.removeChild(el);
}
function initChildren(el) {
    let children;
    el.components = {};
    if (el.componentState === 1) {
        children = el.querySelectorAll(`:scope [el-parent="${el.id}"]`);
    } else {
        children = getChildComponents(el);
    }
    for (const child of children){
        if (!child.hasAttribute('el-parent')) {
            if (!child.hasAttribute('id')) child.setAttribute('id', `el${++idCount}`);
            const isParts = child.getAttribute('data-is').split(':');
            if (!isParts[1]) {
                child.setAttribute('data-is', `${isParts[0]}:${child.getAttribute('id')}`);
            }
        }
        const childElement = initElementAsComponent(child, el);
        childElement.setAttribute('el-parent', el.id);
        childElement.parent = el;
        const elId = childElement.compId;
        el.components[elId] = childElement;
    }
}
function getChildComponents(parent) {
    const components = [
        ...parent.querySelectorAll('[data-is]')
    ];
    return components.filter((child)=>{
        const match = child.parentElement.closest('[data-is]');
        if (match === parent) return true;
        return false;
    });
}
function addProps(componentProps, el, props = {}) {
    const newProps = {};
    delete props.is;
    delete props.id;
    for(const propName in props){
        let pipeChain;
        let propValue = props[propName];
        if (componentProps[propName]) continue;
        if (typeof props[propName] == 'string') {
            const arrPropValue = props[propName].split('|');
            propValue = arrPropValue[0];
            arrPropValue.splice(0, 1);
            pipeChain = new PipeChain(arrPropValue);
            if (propValue.startsWith('bind:')) {
                propValue = getBoundEntity(el, propName, propValue.substring(5));
            } else {
                let value;
                if (propValue.startsWith('num:')) {
                    value = Number(propValue.substring(4));
                    if (isNaN(value)) {
                        throw `The attribute ${propName} on the element id="${el.id}" is not a valid number`;
                    }
                } else if (propValue.startsWith('bool:')) {
                    value = propValue.substring(5);
                    value = value == 'true' ? true : value == 'false' ? false : null;
                    if (value === null) {
                        throw `The attribute ${propName} on the element id="${el.id}" is not a valid boolean`;
                    }
                } else if (propValue.startsWith('json:')) {
                    try {
                        value = JSON.parse(propValue.substring(5));
                    } catch (e) {
                        throw `The attribute ${propName} on the element id="${el.id}" is not valid JSON: ${e.message}`;
                    }
                } else {
                    value = propValue;
                }
                propValue = new Prop(value, el);
            }
            propValue.pipeChain = pipeChain;
        } else {
            propValue = new Prop(propValue, el);
        }
        newProps[propName] = propValue;
    }
    Object.assign(componentProps, newProps);
}
function addPropsFromAttributes(componentProps, el) {
    const attrs = {};
    for(const attr in el.dataset){
        attrs[attr] = el.dataset[attr] || true;
    }
    addProps(componentProps, el, attrs);
}
function getBoundEntity(el, propName, path) {
    const arrPath = path.split('.');
    const stateObjPropName = arrPath[arrPath.length - 1];
    if ([
        'appState',
        'pageState'
    ].includes(arrPath[0])) {
        const statePath = path;
        let stateObj = el[arrPath[0]][0];
        for(let i = 1; i < arrPath.length - 1; i++){
            stateObj = stateObj[arrPath[i]];
        }
        return new StateProp(statePath, stateObj, stateObjPropName, bind(el, propName, statePath), el);
    } else if (arrPath[0] == 'state') {
        let stateObj = el.parent[arrPath[0]][0];
        arrPath[0] = el.parent.id;
        const statePath = arrPath.join('.');
        for(let i = 1; i < arrPath.length - 1; i++){
            stateObj = stateObj[arrPath[i]];
        }
        return new StateProp(statePath, stateObj, stateObjPropName, bind(el, propName, statePath), el);
    } else {
        const parentProp = el.parent.props[arrPath[0]];
        if (arrPath.length === 1) {
            return parentProp;
        } else if (parentProp.statePath) {
            let stateObj = parentProp.value;
            for(let i = 1; i < arrPath.length - 1; i++){
                stateObj = stateObj[arrPath[i]];
            }
            arrPath.shift();
            const statePath = parentProp.statePath + '.' + arrPath.join('.');
            return new StateProp(statePath, stateObj, stateObjPropName, bind(el, propName, statePath), el);
        } else {
            let value = parentProp.value;
            for(let i = 1; i < arrPath.length; i++){
                value = value[arrPath[i]];
            }
            return new Prop(value, el);
        }
    }
}
function bind(el, propName, statePath) {
    return (fn)=>{
        const arrPath = statePath.split('.');
        let observer, path;
        if (![
            'appState',
            'pageState'
        ].includes(arrPath[0])) {
            observer = el.ownerDocument.getElementById(arrPath[0]).state;
            path = statePath.replace(arrPath[0] + '.', 'state.');
        } else {
            observer = el[arrPath[0]];
            path = statePath;
        }
        const watch = observer[2];
        const [unwatch, rewatch] = watch(path, fn, el);
        el.props[propName].unwatch = unwatch;
        el.props[propName].rewatch = rewatch;
    };
}
function unwatchElementProps(el) {
    for(const id in el.components){
        const child = el.components[id];
        unwatchElementProps(child);
    }
    for(const prop in el.props){
        const value = el.props[prop];
        if (value.unwatch) {
            value.unwatch();
        }
    }
}
function reIndexStatePath(el, oldRoot, newRoot, depth) {
    for(const id in el.components){
        const child = el.components[id];
        reIndexStatePath(child, oldRoot, newRoot, depth + 1);
    }
    for(const prop in el.props){
        let statePath = el.props[prop].statePath;
        if (statePath) {
            if (depth === 0) {
                statePath = statePath.replace(oldRoot, newRoot);
            } else {
                statePath = statePath.replace(oldRoot + '.', newRoot + '.');
            }
            const arrStatePath = statePath.split('.');
            arrStatePath[0] = 'state';
            const value = el.props[prop];
            if (value.rewatch) value.rewatch(arrStatePath.join('.'));
        }
    }
}
async function insertElement(parent, component, action, elId, autoInit) {
    if (!component.nodeType) {
        const tagNameMap = {
            ul: 'li',
            ol: 'li',
            table: 'tr',
            thead: 'tr',
            tbody: 'tr'
        };
        const element = component;
        if (element.tagName === undefined && tagNameMap[parent.tagName.toLowerCase()] === undefined) element.tagName = 'div';
        else element.tagName = tagNameMap[parent.tagName.toLowerCase()];
        component = parent.ownerDocument.createElement(element.tagName);
        for(const prop in element){
            if (prop == 'tagName' || prop == 'props') continue;
            component.setAttribute(prop, element[prop]);
        }
    }
    const isParts = component.getAttribute('data-is').split(':');
    const compIs = isParts[0];
    const compId = isParts[1];
    if (!component.hasAttribute('id')) component.setAttribute('id', `el${++idCount}`);
    if (!compId) {
        component.setAttribute('data-is', `${isParts[0]}:${component.getAttribute('id')})`);
    }
    await loadDependencies([
        compIs
    ]);
    initElementAsComponent(component, parent);
    component.parent = parent;
    component.setAttribute('el-parent', parent.id);
    parent.components[compId] = component;
    switch(action){
        case 'prepend':
            parent.prepend(component);
            break;
        case 'append':
            parent.append(component);
            break;
        case 'before':
            parent.components[elId].before(component);
            break;
        case 'after':
            parent.components[elId].after(component);
            break;
        default:
            parent.append(component);
    }
    if (autoInit) await component.init(component.props);
    return component;
}
function component(param1, param2) {
    if (typeof param1 == 'string') {
        registeredComponents[param1] = param2;
        return param1;
    } else {
        registeredComponents[param1.name] = param1;
        return param1.name;
    }
}
async function elementFetch(path, options = {
    headers: []
}) {
    let url = path;
    if (appContext.server) {
        url = `${appContext.ctx.request.url.protocol}//127.0.0.1:${appContext.ctx.request.url.port || '80'}${path}`;
        if (options && options.headers === undefined) options.headers = [];
        options.headers.push([
            'element-server-request',
            'true'
        ]);
    }
    return await fetch(url, options);
}
async function emit(subject, data, target) {
    const docEl = appContext.server ? appContext.documentElement : document.documentElement;
    const el = docEl.querySelector(`[el-active]`);
    if (el) {
        if (messageHandlers.has(subject)) {
            const listeners = messageHandlers.get(subject);
            const arr = [];
            for (const listener of listeners)arr.push(listener(data));
            const results = await Promise.allSettled(arr);
            for (const result of results){
                if (result.status == 'rejected') console.error(result.reason);
            }
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
function deviceSubscribesTo(subject) {
    deviceMessageHandlers.set(subject, true);
}
function navigateTo(path) {
    if (path === undefined) globalThis.dispatchEvent(new Event('popstate'));
    else if (path == globalThis.location.pathname) return;
    else {
        globalThis.history.pushState({}, '', path);
        dispatchEvent(new Event('popstate'));
    }
}
function observe(objectToObserve, name, config) {
    const observablesCache = new WeakMap();
    const watchList = new Map();
    let listenerId = 0;
    function objectAccessor(path) {
        return {
            get (target, key, receiver) {
                if (key === '__proxy__') return true;
                if (key == '__path__') return path;
                const value = Reflect.get(target, key, receiver);
                if (Array.isArray(value) && !value.__proxy__) {
                    const proxiedValue = new Proxy(value, arrayAccessor(`${path}.${key}`, receiver, key));
                    Reflect.set(target, key, proxiedValue, receiver);
                    return proxiedValue;
                } else if (typeof value === 'object' && value !== null && !DerivedState.isDerived(value) && !value.__proxy__) {
                    const proxiedValue = new Proxy(value, objectAccessor(`${path}.${key}`));
                    Reflect.set(target, key, proxiedValue, receiver);
                    return proxiedValue;
                } else if (DerivedState.isDerived(value)) {
                    return value.value;
                }
                return value;
            },
            set (target, key, value, receiver) {
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
                if (DerivedState.isDerived(value)) {
                    value.onChange((value)=>processListeners(`${path}.${key}`, value, key));
                }
                if (result) processListeners(`${path}.${key}`, value, key, oldValue);
                return result;
            }
        };
    }
    function arrayAccessor(path, parentTarget, parentKey) {
        return {
            get (target, key, receiver) {
                if (key === '__proxy__') return true;
                if (key == '__path__') return path;
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
                            if (typeof path === 'object') item.__path__ = `${path}.${index}`;
                        });
                        if (result) processListeners(path, parentTarget, parentKey, oldValue);
                        return result;
                    };
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
                if (DerivedState.isDerived(value)) {
                    value.onChange((value)=>processListeners(`${path}.${key}`, value, key));
                }
                if (result) processListeners(path, parentTarget[parentKey], key, oldValue);
                return result;
            }
        };
    }
    function processListeners(path, value, key, oldValue) {
        const rootState = path.split('.')[0];
        const parentPath = path.substring(0, path.lastIndexOf('.'));
        let listeners = watchList.get(path);
        if (listeners) listeners.forEach((listener)=>listener(value, key, oldValue));
        listeners = watchList.get(parentPath);
        if (listeners) listeners.forEach((listener)=>listener(value, key, oldValue));
        if (parentPath != rootState) {
            listeners = watchList.get(rootState);
            if (listeners) listeners.forEach((listener)=>listener(value, key, oldValue));
        }
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
                if (listeners) {
                    listeners.delete(entryId);
                    if (listeners.size === 0) watchList.delete(currentPath);
                }
            },
            (newPath)=>{
                let listeners = watchList.get(currentPath);
                if (listeners) {
                    listeners.delete(entryId);
                    if (listeners.size === 0) watchList.delete(currentPath);
                }
                currentPath = newPath;
                listeners = getListeners(currentPath);
                listeners.set(entryId, getListener(currentPath, fn, el));
            }
        ];
    }
    function derive(fn, deps) {
        const derivedObj = new DerivedState();
        derivedObj.value = fn();
        deps.forEach((prop, index)=>{
            const cb = ()=>{
                derivedObj.value = fn();
            };
            if (Array.isArray(prop)) {
                for (const item of prop){
                    if (Prop.isProp(item) || StateProp.isStateProp(item)) {
                        item.onChange(()=>cb());
                    } else if (item.__path__) {
                        watch(item.__path__, cb);
                    }
                }
            } else if (Prop.isProp(prop) || StateProp.isStateProp(prop)) {
                prop.onChange(()=>cb());
            } else if (prop !== null && prop !== undefined && prop.__path__) {
                watch(prop.__path__, cb);
            } else {
                throw `Dependency ${index} cannot be tracked as it has a value of:${prop}`;
            }
        });
        return derivedObj;
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
        derive,
        watch,
        watchList
    ];
}
function registerAllowedOrigin(uri) {
    registeredAllowedOrigins.push(uri);
}
function registerTranslationPack(name, translations) {
    registeredTranslations[name] = translations;
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
function runAt(props) {
    if (appContext.server && props.server) return props.server();
    else if (appContext.client && props.client) return props.client();
}
function subscribeTo(subject, handler) {
    if (!messageHandlers.has(subject)) {
        messageHandlers.set(subject, new Set());
    }
    const listeners = messageHandlers.get(subject);
    listeners.add(handler);
    return ()=>{
        listeners.delete(handler);
        if (listeners.size === 0) {
            messageHandlers.delete(subject);
        }
    };
}
function useTranslationPack(name) {
    return (value, ...args)=>{
        const translationPack = registeredTranslations[name] || {};
        let translation = translationPack[value] || value;
        if (args && args.length > 0) {
            for(let i = 0; i < args.length; i++){
                translation = translation.replaceAll('{' + (i + 1) + '}', args[i]);
            }
        }
        return translation;
    };
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
async function getDependencies(el) {
    const dependencies = [
        el.dataset.is.split(':')[0]
    ];
    let children;
    if ([
        1,
        2
    ].includes(el.componentState)) children = el.querySelectorAll(`:scope [el-parent="${el.id}"]`);
    else children = el.querySelectorAll(':scope [data-is]');
    children.forEach((component)=>{
        const compParts = component.dataset.is.split(':');
        const compIs = compParts[0];
        if (appContext.server && component.getAttribute('data-render-at') == 'client') return;
        else if (appContext.client && component.getAttribute('data-render-at') == 'server') return;
        if (!dependencies.includes(compIs)) dependencies.push(compIs);
    });
    if (dependencies.length > 0) await loadDependencies(dependencies);
}
function getFeatureFlags() {
    const featureFlags = globalThis.document.cookie.split('; ').find((row)=>row.startsWith('featureFlags='));
    if (featureFlags) return featureFlags.split('=')[1].split(':');
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
                'el',
                'document',
                'link',
                'list',
                'translate'
            ].includes(dependency) && !registeredComponents[dependency]) {
                let modulePath = registeredDependencies[dependency];
                if (appContext.server) modulePath = registeredServerDependencies[dependency] || modulePath;
                if (!modulePath) {
                    console.warn(`Dependency '${dependency}' not registered`);
                } else return importModule(modulePath);
            }
        }).filter((value)=>Boolean(value));
        if (imports.length > 0) await Promise.allSettled(imports);
    } catch (e) {
        console.error('Failed to load dependencies:', e);
        throw e;
    }
}
function parseStyle(style) {
    const obj = {};
    style.split(";").forEach((rule)=>{
        if (!rule) return;
        const [key, value] = rule.split(":");
        if (key && value) obj[key.trim()] = value.trim();
    });
    return obj;
}
function removeAttributes(el) {
    const attrs = [
        'data-render-at',
        'el-client-rendering',
        'el-server-rendering',
        'el-server-rendered',
        'el-comp-state',
        'el-parent'
    ];
    for(const attr in el.dataset){
        if (![
            'id',
            'is'
        ].includes(attr)) attrs.push('data-' + attr);
    }
    for (const attr of attrs)el.removeAttribute(attr);
}
function serializeStyle(obj) {
    return Object.entries(obj).map(([k, v])=>`${k}:${v}`).join(";");
}
function setupIntersectionObserver() {
    intersectionObserver = new IntersectionObserver(async (entries)=>{
        for (const entry of entries){
            if (entry.isIntersecting) {
                await entry.target.hydrateOnCallback();
            }
        }
    }, {
        rootMargin: '100px',
        threshold: 0
    });
}
const toCamelCase = (str)=>{
    return str.replace(/-([a-z])/g, (_match, letter)=>letter.toUpperCase());
};
component('el', (el)=>{
    const [pageState, _derivePageState, watchPageState] = el.pageState;
    let unwatchPageState;
    el.define({
        onRender: (props)=>{
            for(const name in props){
                if (name == 'checked') {
                    if (el.type == 'checkbox') {
                        if (Array.isArray(props[name].value)) {
                            el.checked = props[name].value.includes(el.value);
                        } else if (typeof props[name].value == 'boolean') {
                            el.checked = props[name].value;
                        } else {
                            el.checked = props[name].value === el.value;
                        }
                    } else if (el.type == 'radio') {
                        if (typeof props[name].value == 'boolean') {
                            el.checked = props[name].value;
                        } else {
                            el.checked = props[name].value === el.value;
                        }
                    }
                } else if (name == 'class') {
                    const value = props[name].value;
                    if (typeof value == 'string') {
                        el.className = value;
                    } else if (Array.isArray(value)) {
                        el.className = value.join(' ');
                    } else if (typeof value == 'object') {
                        const names = [];
                        for(const key in value){
                            if (value[key]) names.push(key);
                        }
                        el.className = names.join(' ');
                    }
                } else if (name.startsWith('class:')) {
                    const parts = name.split(':');
                    if (parts.length === 2) {
                        const className = parts[1];
                        el.classList.toggle(className, props[name].value);
                    }
                } else if (name == 'text') {
                    el.textContent = props[name].pipedValue || props[name].value;
                } else if (name == 'value') {
                    el.value = props[name].value;
                } else if (name == 'visible') {
                    el.hidden = !props[name].value;
                } else if (name == 'style') {
                    const value = props[name].value;
                    if (typeof value == 'string') {
                        const styles = parseStyle(value);
                        for(const key in styles){
                            if (styles[key]) el.style[key] = styles[key];
                        }
                    } else if (typeof value == 'object' && !Array.isArray(value)) {
                        for(const key in value){
                            if (value[key]) el.style[key] = value[key];
                        }
                    }
                } else if (name.startsWith('style:')) {
                    const styleProp = name.split(':')[1];
                    el.style[styleProp] = props[name].value;
                } else if (name == 'translate') {
                    if (props['params'] === undefined) el.setProp('params', 'json:[]');
                    translate(props[name].value, props['params'].value);
                } else if (name in el) {
                    el[name] = props[name].value;
                }
            }
        },
        onHydrate: (props)=>{
            for(const name in props){
                if (name == 'checked') {
                    if (el.type == 'checkbox') {
                        props[name].onChange((value)=>{
                            if (el.type == 'checkbox') {
                                if (Array.isArray(props[name].value)) {
                                    el.checked = props[name].value.includes(el.value);
                                } else if (typeof value == 'boolean') {
                                    el.checked = value;
                                } else {
                                    el.checked = value === el.value;
                                }
                            } else if (el.type == 'radio') {
                                if (typeof value == 'boolean') {
                                    el.checked = value;
                                } else {
                                    el.checked = value === el.value;
                                }
                            }
                        });
                        el.addEventListener('change', ()=>{
                            if (Array.isArray(props[name].value)) {
                                if (el.checked) {
                                    props[name].value.push(el.value);
                                } else {
                                    const newList = props[name].value.filter((item)=>item !== el.value);
                                    props[name].value = newList;
                                }
                            } else {
                                props[name].value = el.checked;
                            }
                        });
                    } else if (el.type == 'radio') {
                        props[name].onChange((value)=>{
                            el.checked = value === el.value;
                        });
                        el.addEventListener('change', ()=>{
                            props[name].value = el.value;
                        });
                    }
                } else if (name == 'class') {
                    props[name].onChange((value)=>{
                        if (typeof value == 'string') {
                            el.className = value;
                        } else if (Array.isArray(value)) {
                            el.className = value.join(' ');
                        } else if (typeof value == 'object') {
                            const names = [];
                            for(const key in value){
                                if (value[key]) names.push(key);
                            }
                            el.className = names.join(' ');
                        }
                    });
                } else if (name.startsWith('class:')) {
                    props[name].onChange((value)=>{
                        const parts = name.split(':');
                        if (parts.length === 2) {
                            const className = parts[1];
                            el.classList.toggle(className, value);
                        }
                    });
                } else if (name.startsWith('on:')) {
                    props[name].onChange((value)=>{
                        const onProp = name.replace(':', '');
                        if (typeof value == 'function') {
                            el[onProp] = value;
                        } else if (typeof value == 'string') {
                            el[onProp] = (data)=>{
                                el.emit(value, data);
                            };
                        }
                    }, true);
                } else if (name == 'text') {
                    props[name].onChange((value, pipedValue)=>{
                        el.textContent = pipedValue || value;
                    });
                    el.addEventListener('input', ()=>{
                        props[name].value = el.textContent;
                    });
                } else if (name == 'value') {
                    props[name].onChange((value)=>{
                        el.value = value;
                    });
                    el.addEventListener('input', ()=>{
                        props[name].value = el.value;
                    });
                } else if (name == 'visible') {
                    props[name].onChange((value)=>{
                        el.hidden = !value;
                    });
                } else if (name == 'style') {
                    props[name].onChange((value)=>{
                        if (typeof value == 'string') {
                            const styles = parseStyle(value);
                            for(const key in styles){
                                if (styles[key]) el.style[key] = styles[key];
                            }
                        } else if (typeof value == 'object' && !Array.isArray(value)) {
                            for(const key in value){
                                if (value[key]) el.style[key] = value[key];
                            }
                        }
                    });
                } else if (name.startsWith('style:')) {
                    props[name].onChange((value)=>{
                        const styleProp = name.split(':')[1];
                        el.style[styleProp] = value;
                    });
                } else if (name == 'translate') {
                    if (props['params'] === undefined) el.setProp('params', 'json:[]');
                    props[name].onChange((value)=>{
                        translate(value, props['params'].value);
                    });
                    props['params'].onChange((value)=>{
                        translate(props['translate'].value, value);
                    });
                    unwatchPageState = watchPageState('pageState.activeTranslationPack', ()=>{
                        translate(props['translate'].value, props['params'].value);
                    })[0];
                } else {
                    props[name].onChange((value)=>{
                        el[name] = value;
                    });
                }
            }
        },
        onCleanup: ()=>{
            unwatchPageState();
        }
    });
    function translate(value, params) {
        const translateText = useTranslationPack(pageState.activeTranslationPack);
        if (Array.isArray(params)) {
            console.log('params', ...params);
            el.textContent = translateText(value, ...params);
        } else el.textContent = translateText(value);
    }
});
component('document', (el)=>{
    el.define({
        onRender: async (props)=>{
            for(const id in el.components){
                const child = el.components[id];
                if (Array.isArray(child)) child.forEach(async (child)=>await child.init(props));
                else await child.init(props);
            }
        },
        onHydrate: async (props)=>{
            for(const id in el.components){
                const child = el.components[id];
                if (Array.isArray(child)) child.forEach(async (child)=>await child.init(props));
                else await child.init(props);
            }
        }
    });
});
component('list', (el)=>{
    let listItems;
    const templateFragment = el.firstElementChild.content.firstElementChild;
    el.define({
        onRender: async (props)=>{
            if (!props.componentId) el.setProp('componentId', 'id');
            listItems = transformSourceList(props);
            await clearComponents();
            await createComponents(props);
        },
        onHydrate: (props)=>{
            props.src.onChange((src)=>{
                props.src.value = src;
                listItems = transformSourceList(props);
                const currentOrder = [];
                let index = 0;
                for(const id in el.components){
                    currentOrder.push({
                        id,
                        index: index++
                    });
                }
                const newOrder = [];
                index = 0;
                for (const item of props.src.value){
                    const id = item.id;
                    newOrder.push({
                        id,
                        index: index++
                    });
                }
                reconcileDom(currentOrder, newOrder);
                if (currentOrder.length === 0) {
                    el.emit('ItemsUpdated', null, {
                        async: true
                    });
                } else if (newOrder.length > currentOrder.length) {
                    el.emit('ItemsAdded', null, {
                        async: true
                    });
                } else if (newOrder.length < currentOrder.length) {
                    el.emit('ItemsRemoved', null, {
                        async: true
                    });
                }
            });
        },
        onReady: ()=>{
            el.firstElementChild.remove();
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
        for(const id in el.components){
            await el.unmount(el.components[id]);
        }
    }
    async function createComponents(props) {
        let index = 0;
        const propName = props.item && props.item.value ? props.item.value : 'item';
        for(const id in listItems){
            const component = el.ownerDocument.importNode(templateFragment, true);
            const compIs = component.dataset.is + ':' + id;
            component.setAttribute('data-is', compIs);
            component.setAttribute(`data-${propName}`, `bind:src.${index}`);
            component.setAttribute('data-index', String(index++));
            await insertElement(el, component, 'append', '', true);
        }
    }
    async function reconcileDom(currentOrder, newOrder) {
        const nextById = newOrder.map((item)=>item.id.toString());
        for (const { id } of currentOrder){
            if (!nextById.includes(id)) {
                const node = el.components[id];
                if (node && node.parent === el) {
                    el.components[id].unmount();
                }
            }
        }
        for(let i = 0; i < newOrder.length; i++){
            const { id } = newOrder[i];
            const node = el.components[id];
            if (node === undefined) {
                let action;
                let elId;
                if (i === 0) {
                    action = 'prepend', elId = null;
                } else {
                    action = 'after', elId = newOrder[i - 1].id;
                }
                const propName = el.props.item && el.props.item.value ? el.props.item.value : 'item';
                const component = el.ownerDocument.importNode(templateFragment, true);
                const compIs = component.dataset.is + ':' + id;
                component.setAttribute('data-is', compIs);
                component.setAttribute(`data-${propName}`, `bind:src.${i}`);
                component.setAttribute('data-index', String(i));
                await insertElement(el, component, action, elId, true);
            } else {
                const referenceNode = el.childNodes[i];
                if (i === 0) {
                    el.prepend(node);
                } else if (node !== referenceNode) {
                    el.insertBefore(node, referenceNode);
                }
                node.props.index.value = i;
                for(const prop in node.props){
                    const statePath = node.props[prop].statePath;
                    if (statePath) {
                        const arrPath = statePath.split('.');
                        arrPath[arrPath.length - 1] = i.toString();
                        reIndexStatePath(el.components[id], statePath, arrPath.join('.'), 0);
                    }
                }
            }
        }
    }
});
component('link', (el)=>{
    el.define({
        onRender: ({ href, text })=>{
            if (href) el.setAttribute('href', href.value);
            if (text) el.textContent = text.value;
        },
        onHydrate: ({ href, disabled, onclick })=>{
            let onClick = ()=>true;
            if (href) href.onChange((value)=>el.setAttribute('href', value));
            if (onclick) onClick = onclick.value;
            el.addEventListener('click', (event)=>{
                event.preventDefault();
                if (disabled && disabled.value) return;
                if (onClick(event) === false) return;
                if (href) navigateTo(href.value);
                else if (el.getAttribute('href')) globalThis.location.href = el.getAttribute('href') || '';
            });
        }
    });
});
component('translate', (el)=>{
    const [appState, _deriveAppState, watchAppState] = el.appState;
    const [pageState, _derivePageState, watchPageState] = el.pageState;
    const [state] = el.state;
    el.define({
        onRender: ({ params })=>{
            setCaption(params.value);
            state.params = params.value;
        },
        onHydrate: ({ params })=>{
            params.onChange((value)=>{
                setCaption(value);
                state.params = value;
            });
            watchAppState('appState.activeTranslationPack', ()=>{
                setCaption(state.params);
            });
            watchPageState('pageState.activeTranslationPack', ()=>{
                setCaption(state.params);
            });
        }
    });
    function setCaption(params) {
        const translate = useTranslationPack(appState.activeTranslationPack || pageState.activeTranslationPack);
        if (params) {
            if (Array.isArray(params)) {
                el.textContent = translate(el.compId, ...params);
            } else {
                try {
                    const paramsArray = JSON.parse(params);
                    el.textContent = translate(el.compId, ...paramsArray);
                } catch (e) {
                    el.textContent = translate(el.compId, params);
                }
            }
        } else el.textContent = translate(el.compId);
    }
});
export { component as component, deviceSubscribesTo as deviceOn, elementFetch as retrieve, emit as emit, feature as feature, navigateTo as navigateTo, registerAllowedOrigin as registerAllowedOrigin, registerTranslationPack as registerTranslationPack, registerDependencies as registerDependencies, registerServerDependencies as registerServerDependencies, registerRoute as registerRoute, renderDocument as renderDocument, runAt as runAt, serverRenderDocument as serverRenderDocument, subscribeTo as on, useTranslationPack as useTranslationPack,  };

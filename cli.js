// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var LogLevels;
(function(LogLevels1) {
    LogLevels1[LogLevels1["NOTSET"] = 0] = "NOTSET";
    LogLevels1[LogLevels1["DEBUG"] = 10] = "DEBUG";
    LogLevels1[LogLevels1["INFO"] = 20] = "INFO";
    LogLevels1[LogLevels1["WARNING"] = 30] = "WARNING";
    LogLevels1[LogLevels1["ERROR"] = 40] = "ERROR";
    LogLevels1[LogLevels1["CRITICAL"] = 50] = "CRITICAL";
})(LogLevels || (LogLevels = {}));
Object.keys(LogLevels).filter((key)=>isNaN(Number(key)));
const byLevel = {
    [String(LogLevels.NOTSET)]: "NOTSET",
    [String(LogLevels.DEBUG)]: "DEBUG",
    [String(LogLevels.INFO)]: "INFO",
    [String(LogLevels.WARNING)]: "WARNING",
    [String(LogLevels.ERROR)]: "ERROR",
    [String(LogLevels.CRITICAL)]: "CRITICAL"
};
function getLevelByName(name) {
    switch(name){
        case "NOTSET":
            return LogLevels.NOTSET;
        case "DEBUG":
            return LogLevels.DEBUG;
        case "INFO":
            return LogLevels.INFO;
        case "WARNING":
            return LogLevels.WARNING;
        case "ERROR":
            return LogLevels.ERROR;
        case "CRITICAL":
            return LogLevels.CRITICAL;
        default:
            throw new Error(`no log level found for "${name}"`);
    }
}
function getLevelName(level) {
    const levelName = byLevel[level];
    if (levelName) {
        return levelName;
    }
    throw new Error(`no level name found for level: ${level}`);
}
class LogRecord {
    msg;
    #args;
    #datetime;
    level;
    levelName;
    loggerName;
    constructor(options){
        this.msg = options.msg;
        this.#args = [
            ...options.args
        ];
        this.level = options.level;
        this.loggerName = options.loggerName;
        this.#datetime = new Date();
        this.levelName = getLevelName(options.level);
    }
    get args() {
        return [
            ...this.#args
        ];
    }
    get datetime() {
        return new Date(this.#datetime.getTime());
    }
}
class Logger {
    #level;
    #handlers;
    #loggerName;
    constructor(loggerName, levelName, options = {}){
        this.#loggerName = loggerName;
        this.#level = getLevelByName(levelName);
        this.#handlers = options.handlers || [];
    }
    get level() {
        return this.#level;
    }
    set level(level) {
        this.#level = level;
    }
    get levelName() {
        return getLevelName(this.#level);
    }
    set levelName(levelName) {
        this.#level = getLevelByName(levelName);
    }
    get loggerName() {
        return this.#loggerName;
    }
    set handlers(hndls) {
        this.#handlers = hndls;
    }
    get handlers() {
        return this.#handlers;
    }
     #_log(level, msg, ...args) {
        if (this.level > level) {
            return msg instanceof Function ? undefined : msg;
        }
        let fnResult;
        let logMessage;
        if (msg instanceof Function) {
            fnResult = msg();
            logMessage = this.asString(fnResult);
        } else {
            logMessage = this.asString(msg);
        }
        const record = new LogRecord({
            msg: logMessage,
            args: args,
            level: level,
            loggerName: this.loggerName
        });
        this.#handlers.forEach((handler)=>{
            handler.handle(record);
        });
        return msg instanceof Function ? fnResult : msg;
    }
    asString(data) {
        if (typeof data === "string") {
            return data;
        } else if (data === null || typeof data === "number" || typeof data === "bigint" || typeof data === "boolean" || typeof data === "undefined" || typeof data === "symbol") {
            return String(data);
        } else if (data instanceof Error) {
            return data.stack;
        } else if (typeof data === "object") {
            return JSON.stringify(data);
        }
        return "undefined";
    }
    debug(msg1, ...args1) {
        return this.#_log(LogLevels.DEBUG, msg1, ...args1);
    }
    info(msg2, ...args2) {
        return this.#_log(LogLevels.INFO, msg2, ...args2);
    }
    warning(msg3, ...args3) {
        return this.#_log(LogLevels.WARNING, msg3, ...args3);
    }
    error(msg4, ...args4) {
        return this.#_log(LogLevels.ERROR, msg4, ...args4);
    }
    critical(msg5, ...args5) {
        return this.#_log(LogLevels.CRITICAL, msg5, ...args5);
    }
}
const { Deno: Deno1  } = globalThis;
const noColor = typeof Deno1?.noColor === "boolean" ? Deno1.noColor : true;
let enabled = !noColor;
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code1) {
    return enabled ? `${code1.open}${str.replace(code1.regexp, code1.open)}${code1.close}` : str;
}
function bold(str) {
    return run(str, code([
        1
    ], 22));
}
function red(str) {
    return run(str, code([
        31
    ], 39));
}
function yellow(str) {
    return run(str, code([
        33
    ], 39));
}
function blue(str) {
    return run(str, code([
        34
    ], 39));
}
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))", 
].join("|"), "g");
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
class AbstractBufBase {
    buf;
    usedBufferBytes = 0;
    err = null;
    constructor(buf){
        this.buf = buf;
    }
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += await this.#writer.write(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.#writer.write(data);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += this.#writer.writeSync(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.#writer.writeSync(data);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const DEFAULT_FORMATTER = "{levelName} {msg}";
class BaseHandler {
    level;
    levelName;
    formatter;
    constructor(levelName, options = {}){
        this.level = getLevelByName(levelName);
        this.levelName = levelName;
        this.formatter = options.formatter || DEFAULT_FORMATTER;
    }
    handle(logRecord) {
        if (this.level > logRecord.level) return;
        const msg6 = this.format(logRecord);
        return this.log(msg6);
    }
    format(logRecord) {
        if (this.formatter instanceof Function) {
            return this.formatter(logRecord);
        }
        return this.formatter.replace(/{([^\s}]+)}/g, (match, p1)=>{
            const value = logRecord[p1];
            if (value == null) {
                return match;
            }
            return String(value);
        });
    }
    log(_msg) {}
    setup() {}
    destroy() {}
}
class ConsoleHandler extends BaseHandler {
    format(logRecord) {
        let msg7 = super.format(logRecord);
        switch(logRecord.level){
            case LogLevels.INFO:
                msg7 = blue(msg7);
                break;
            case LogLevels.WARNING:
                msg7 = yellow(msg7);
                break;
            case LogLevels.ERROR:
                msg7 = red(msg7);
                break;
            case LogLevels.CRITICAL:
                msg7 = bold(red(msg7));
                break;
            default:
                break;
        }
        return msg7;
    }
    log(msg8) {
        console.log(msg8);
    }
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg9 = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg9);
    }
}
const DEFAULT_LEVEL = "INFO";
const DEFAULT_CONFIG = {
    handlers: {
        default: new ConsoleHandler(DEFAULT_LEVEL)
    },
    loggers: {
        default: {
            level: DEFAULT_LEVEL,
            handlers: [
                "default"
            ]
        }
    }
};
const state = {
    handlers: new Map(),
    loggers: new Map(),
    config: DEFAULT_CONFIG
};
function getLogger(name) {
    if (!name) {
        const d = state.loggers.get("default");
        assert(d != null, `"default" logger must be set for getting logger without name`);
        return d;
    }
    const result = state.loggers.get(name);
    if (!result) {
        const logger = new Logger(name, "NOTSET", {
            handlers: []
        });
        state.loggers.set(name, logger);
        return logger;
    }
    return result;
}
function info(msg10, ...args6) {
    if (msg10 instanceof Function) {
        return getLogger("default").info(msg10, ...args6);
    }
    return getLogger("default").info(msg10, ...args6);
}
function error(msg11, ...args7) {
    if (msg11 instanceof Function) {
        return getLogger("default").error(msg11, ...args7);
    }
    return getLogger("default").error(msg11, ...args7);
}
function critical(msg12, ...args8) {
    if (msg12 instanceof Function) {
        return getLogger("default").critical(msg12, ...args8);
    }
    return getLogger("default").critical(msg12, ...args8);
}
function setup(config) {
    state.config = {
        handlers: {
            ...DEFAULT_CONFIG.handlers,
            ...config.handlers
        },
        loggers: {
            ...DEFAULT_CONFIG.loggers,
            ...config.loggers
        }
    };
    state.handlers.forEach((handler)=>{
        handler.destroy();
    });
    state.handlers.clear();
    const handlers1 = state.config.handlers || {};
    for(const handlerName1 in handlers1){
        const handler = handlers1[handlerName1];
        handler.setup();
        state.handlers.set(handlerName1, handler);
    }
    state.loggers.clear();
    const loggers = state.config.loggers || {};
    for(const loggerName in loggers){
        const loggerConfig = loggers[loggerName];
        const handlerNames = loggerConfig.handlers || [];
        const handlers2 = [];
        handlerNames.forEach((handlerName)=>{
            const handler = state.handlers.get(handlerName);
            if (handler) {
                handlers2.push(handler);
            }
        });
        const levelName = loggerConfig.level || DEFAULT_LEVEL;
        const logger = new Logger(loggerName, levelName, {
            handlers: handlers2
        });
        state.loggers.set(loggerName, logger);
    }
}
setup(DEFAULT_CONFIG);
function filterValues(record, predicate) {
    const ret = {};
    const entries = Object.entries(record);
    for (const [key, value] of entries){
        if (predicate(value)) {
            ret[key] = value;
        }
    }
    return ret;
}
function withoutAll(array, values) {
    const toExclude = new Set(values);
    return array.filter((it)=>!toExclude.has(it));
}
const RE_KeyValue = /^\s*(?:export\s+)?(?<key>[a-zA-Z_]+[a-zA-Z0-9_]*?)\s*=[\ \t]*('\n?(?<notInterpolated>(.|\n)*?)\n?'|"\n?(?<interpolated>(.|\n)*?)\n?"|(?<unquoted>[^\n#]*)) *#*.*$/gm;
const RE_ExpandValue = /(\${(?<inBrackets>.+?)(\:-(?<inBracketsDefault>.+))?}|(?<!\\)\$(?<notInBrackets>\w+)(\:-(?<notInBracketsDefault>.+))?)/g;
function parse(rawDotenv, restrictEnvAccessTo = []) {
    const env = {};
    let match;
    const keysForExpandCheck = [];
    while((match = RE_KeyValue.exec(rawDotenv)) != null){
        const { key , interpolated , notInterpolated , unquoted  } = match?.groups;
        if (unquoted) {
            keysForExpandCheck.push(key);
        }
        env[key] = typeof notInterpolated === "string" ? notInterpolated : typeof interpolated === "string" ? expandCharacters(interpolated) : unquoted.trim();
    }
    const variablesMap = {
        ...env,
        ...readEnv(restrictEnvAccessTo)
    };
    keysForExpandCheck.forEach((key)=>{
        env[key] = expand(env[key], variablesMap);
    });
    return env;
}
async function load({ envPath =".env" , examplePath =".env.example" , defaultsPath =".env.defaults" , export: _export = false , allowEmptyValues =false , restrictEnvAccessTo =[]  } = {}) {
    const conf = await parseFile(envPath, restrictEnvAccessTo);
    if (defaultsPath) {
        const confDefaults = await parseFile(defaultsPath, restrictEnvAccessTo);
        for(const key in confDefaults){
            if (!(key in conf)) {
                conf[key] = confDefaults[key];
            }
        }
    }
    if (examplePath) {
        const confExample = await parseFile(examplePath, restrictEnvAccessTo);
        assertSafe(conf, confExample, allowEmptyValues, restrictEnvAccessTo);
    }
    if (_export) {
        for(const key in conf){
            if (Deno.env.get(key) !== undefined) continue;
            Deno.env.set(key, conf[key]);
        }
    }
    return conf;
}
async function parseFile(filepath, restrictEnvAccessTo = []) {
    try {
        return parse(await Deno.readTextFile(filepath), restrictEnvAccessTo);
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) return {};
        throw e;
    }
}
function expandCharacters(str) {
    const charactersMap = {
        "\\n": "\n",
        "\\r": "\r",
        "\\t": "\t"
    };
    return str.replace(/\\([nrt])/g, ($1)=>charactersMap[$1]);
}
function assertSafe(conf, confExample, allowEmptyValues, restrictEnvAccessTo = []) {
    const currentEnv = readEnv(restrictEnvAccessTo);
    const confWithEnv = Object.assign({}, currentEnv, conf);
    const missing = withoutAll(Object.keys(confExample), Object.keys(allowEmptyValues ? confWithEnv : filterValues(confWithEnv, Boolean)));
    if (missing.length > 0) {
        const errorMessages = [
            `The following variables were defined in the example file but are not present in the environment:\n  ${missing.join(", ")}`,
            `Make sure to add them to your env file.`,
            !allowEmptyValues && `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`, 
        ];
        throw new MissingEnvVarsError(errorMessages.filter(Boolean).join("\n\n"), missing);
    }
}
function readEnv(restrictEnvAccessTo) {
    if (restrictEnvAccessTo && Array.isArray(restrictEnvAccessTo) && restrictEnvAccessTo.length > 0) {
        return restrictEnvAccessTo.reduce((accessedEnvVars, envVarName)=>{
            if (Deno.env.get(envVarName)) {
                accessedEnvVars[envVarName] = Deno.env.get(envVarName);
            }
            return accessedEnvVars;
        }, {});
    }
    return Deno.env.toObject();
}
class MissingEnvVarsError extends Error {
    missing;
    constructor(message, missing){
        super(message);
        this.name = "MissingEnvVarsError";
        this.missing = missing;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
function expand(str, variablesMap) {
    if (RE_ExpandValue.test(str)) {
        return expand(str.replace(RE_ExpandValue, function(...params) {
            const { inBrackets , inBracketsDefault , notInBrackets , notInBracketsDefault ,  } = params[params.length - 1];
            const expandValue = inBrackets || notInBrackets;
            const defaultValue = inBracketsDefault || notInBracketsDefault;
            return variablesMap[expandValue] || expand(defaultValue, variablesMap);
        }), variablesMap);
    } else {
        return str;
    }
}
const { hasOwn  } = Object;
function get(obj, key) {
    if (hasOwn(obj, key)) {
        return obj[key];
    }
}
function getForce(obj, key) {
    const v = get(obj, key);
    assert(v != null);
    return v;
}
function isNumber(x) {
    if (typeof x === "number") return true;
    if (/^0x[0-9a-f]+$/i.test(String(x))) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
function hasKey(obj, keys) {
    let o = obj;
    keys.slice(0, -1).forEach((key)=>{
        o = get(o, key) ?? {};
    });
    const key1 = keys[keys.length - 1];
    return hasOwn(o, key1);
}
function parse1(args9, { "--": doubleDash = false , alias: alias3 = {} , boolean: __boolean = false , default: defaults = {} , stopEarly =false , string =[] , collect: collect1 = [] , negatable =[] , unknown =(i)=>i  } = {}) {
    const aliases = {};
    const flags = {
        bools: {},
        strings: {},
        unknownFn: unknown,
        allBools: false,
        collect: {},
        negatable: {}
    };
    if (alias3 !== undefined) {
        for(const key in alias3){
            const val = getForce(alias3, key);
            if (typeof val === "string") {
                aliases[key] = [
                    val
                ];
            } else {
                aliases[key] = val;
            }
            for (const alias1 of getForce(aliases, key)){
                aliases[alias1] = [
                    key
                ].concat(aliases[key].filter((y)=>alias1 !== y));
            }
        }
    }
    if (__boolean !== undefined) {
        if (typeof __boolean === "boolean") {
            flags.allBools = !!__boolean;
        } else {
            const booleanArgs = typeof __boolean === "string" ? [
                __boolean
            ] : __boolean;
            for (const key of booleanArgs.filter(Boolean)){
                flags.bools[key] = true;
                const alias = get(aliases, key);
                if (alias) {
                    for (const al of alias){
                        flags.bools[al] = true;
                    }
                }
            }
        }
    }
    if (string !== undefined) {
        const stringArgs = typeof string === "string" ? [
            string
        ] : string;
        for (const key of stringArgs.filter(Boolean)){
            flags.strings[key] = true;
            const alias = get(aliases, key);
            if (alias) {
                for (const al of alias){
                    flags.strings[al] = true;
                }
            }
        }
    }
    if (collect1 !== undefined) {
        const collectArgs = typeof collect1 === "string" ? [
            collect1
        ] : collect1;
        for (const key of collectArgs.filter(Boolean)){
            flags.collect[key] = true;
            const alias = get(aliases, key);
            if (alias) {
                for (const al of alias){
                    flags.collect[al] = true;
                }
            }
        }
    }
    if (negatable !== undefined) {
        const negatableArgs = typeof negatable === "string" ? [
            negatable
        ] : negatable;
        for (const key of negatableArgs.filter(Boolean)){
            flags.negatable[key] = true;
            const alias = get(aliases, key);
            if (alias) {
                for (const al of alias){
                    flags.negatable[al] = true;
                }
            }
        }
    }
    const argv = {
        _: []
    };
    function argDefined(key, arg) {
        return flags.allBools && /^--[^=]+$/.test(arg) || get(flags.bools, key) || !!get(flags.strings, key) || !!get(aliases, key);
    }
    function setKey(obj, name, value, collect = true) {
        let o = obj;
        const keys = name.split(".");
        keys.slice(0, -1).forEach(function(key) {
            if (get(o, key) === undefined) {
                o[key] = {};
            }
            o = get(o, key);
        });
        const key5 = keys[keys.length - 1];
        const collectable = collect && !!get(flags.collect, name);
        if (!collectable) {
            o[key5] = value;
        } else if (get(o, key5) === undefined) {
            o[key5] = [
                value
            ];
        } else if (Array.isArray(get(o, key5))) {
            o[key5].push(value);
        } else {
            o[key5] = [
                get(o, key5),
                value
            ];
        }
    }
    function setArg(key, val, arg = undefined, collect) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg, key, val) === false) return;
        }
        const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
        setKey(argv, key, value, collect);
        const alias = get(aliases, key);
        if (alias) {
            for (const x of alias){
                setKey(argv, x, value, collect);
            }
        }
    }
    function aliasIsBoolean(key) {
        return getForce(aliases, key).some((x)=>typeof get(flags.bools, x) === "boolean");
    }
    let notFlags = [];
    if (args9.includes("--")) {
        notFlags = args9.slice(args9.indexOf("--") + 1);
        args9 = args9.slice(0, args9.indexOf("--"));
    }
    for(let i = 0; i < args9.length; i++){
        const arg = args9[i];
        if (/^--.+=/.test(arg)) {
            const m = arg.match(/^--([^=]+)=(.*)$/s);
            assert(m != null);
            const [, key, value] = m;
            if (flags.bools[key]) {
                const booleanValue = value !== "false";
                setArg(key, booleanValue, arg);
            } else {
                setArg(key, value, arg);
            }
        } else if (/^--no-.+/.test(arg) && get(flags.negatable, arg.replace(/^--no-/, ""))) {
            const m = arg.match(/^--no-(.+)/);
            assert(m != null);
            setArg(m[1], false, arg, false);
        } else if (/^--.+/.test(arg)) {
            const m = arg.match(/^--(.+)/);
            assert(m != null);
            const [, key] = m;
            const next = args9[i + 1];
            if (next !== undefined && !/^-/.test(next) && !get(flags.bools, key) && !flags.allBools && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            } else if (/^(true|false)$/.test(next)) {
                setArg(key, next === "true", arg);
                i++;
            } else {
                setArg(key, get(flags.strings, key) ? "" : true, arg);
            }
        } else if (/^-[^-]+/.test(arg)) {
            const letters = arg.slice(1, -1).split("");
            let broken = false;
            for(let j = 0; j < letters.length; j++){
                const next = arg.slice(j + 2);
                if (next === "-") {
                    setArg(letters[j], next, arg);
                    continue;
                }
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split(/=(.+)/)[1], arg);
                    broken = true;
                    break;
                }
                if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j + 2), arg);
                    broken = true;
                    break;
                } else {
                    setArg(letters[j], get(flags.strings, letters[j]) ? "" : true, arg);
                }
            }
            const [key] = arg.slice(-1);
            if (!broken && key !== "-") {
                if (args9[i + 1] && !/^(-|--)[^-]/.test(args9[i + 1]) && !get(flags.bools, key) && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args9[i + 1], arg);
                    i++;
                } else if (args9[i + 1] && /^(true|false)$/.test(args9[i + 1])) {
                    setArg(key, args9[i + 1] === "true", arg);
                    i++;
                } else {
                    setArg(key, get(flags.strings, key) ? "" : true, arg);
                }
            }
        } else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(flags.strings["_"] ?? !isNumber(arg) ? arg : Number(arg));
            }
            if (stopEarly) {
                argv._.push(...args9.slice(i + 1));
                break;
            }
        }
    }
    for (const [key4, value1] of Object.entries(defaults)){
        if (!hasKey(argv, key4.split("."))) {
            setKey(argv, key4, value1);
            if (aliases[key4]) {
                for (const x of aliases[key4]){
                    setKey(argv, x, value1);
                }
            }
        }
    }
    for (const key2 of Object.keys(flags.bools)){
        if (!hasKey(argv, key2.split("."))) {
            const value = get(flags.collect, key2) ? [] : false;
            setKey(argv, key2, value, false);
        }
    }
    for (const key3 of Object.keys(flags.strings)){
        if (!hasKey(argv, key3.split(".")) && get(flags.collect, key3)) {
            setKey(argv, key3, [], false);
        }
    }
    if (doubleDash) {
        argv["--"] = [];
        for (const key of notFlags){
            argv["--"].push(key);
        }
    } else {
        for (const key of notFlags){
            argv._.push(key);
        }
    }
    return argv;
}
const hexTable = new TextEncoder().encode("0123456789abcdef");
function errInvalidByte(__byte) {
    return new TypeError(`Invalid byte '${String.fromCharCode(__byte)}'`);
}
function errLength() {
    return new RangeError("Odd length hex string");
}
function fromHexChar(__byte) {
    if (48 <= __byte && __byte <= 57) return __byte - 48;
    if (97 <= __byte && __byte <= 102) return __byte - 97 + 10;
    if (65 <= __byte && __byte <= 70) return __byte - 65 + 10;
    throw errInvalidByte(__byte);
}
function encode(src) {
    const dst = new Uint8Array(src.length * 2);
    for(let i = 0; i < dst.length; i++){
        const v = src[i];
        dst[i * 2] = hexTable[v >> 4];
        dst[i * 2 + 1] = hexTable[v & 0x0f];
    }
    return dst;
}
function decode(src) {
    const dst = new Uint8Array(src.length / 2);
    for(let i = 0; i < dst.length; i++){
        const a = fromHexChar(src[i * 2]);
        const b = fromHexChar(src[i * 2 + 1]);
        dst[i] = a << 4 | b;
    }
    if (src.length % 2 == 1) {
        fromHexChar(src[dst.length * 2]);
        throw errLength();
    }
    return dst;
}
const cmdArgs = parse1(Deno.args);
try {
    switch(cmdArgs._[0]){
        case 'build':
            await processBuildCmd(cmdArgs);
            break;
        case 'checkout':
            await processCheckoutCmd(cmdArgs);
            break;
        case 'create':
            await processCreateCmd(cmdArgs);
            break;
        case 'cryptokeys':
            await processCryptoKeysCmd();
            break;
        case 'decrypt':
            await processDecryptCmd(cmdArgs);
            break;
        case 'encrypt':
            await processEncryptCmd(cmdArgs);
            break;
        case 'help':
            processHelpCmd();
            break;
        case 'start':
            processStartCmd(cmdArgs);
            break;
        case 'reset':
            await processResetCmd(cmdArgs);
            break;
        case 'run':
            await processRunCmd(cmdArgs);
            break;
        default:
            processHelpCmd();
    }
} catch (e) {
    critical(e.message);
}
function processHelpCmd() {
    console.log('build [-v=<version>] [--no-cache]');
    console.log('checkout <jsphere_config_repo>|<app_config_file_without_json_extension>/<package_name_within_app_config>');
    console.log('create <project|package> <name> [--git-init]');
    console.log('cryptokeys');
    console.log('decrypt <domain_domain>');
    console.log('encrypt <domain_domain>');
    console.log('reset <domain_domain>');
    console.log('run [-v=<version>] [--http=<port_number>] [--debug=<port_number>]');
    console.log('start [-v=<version>] [--reload]');
}
async function processStartCmd(cmdArgs1) {
    try {
        const version = cmdArgs1.v || 'main';
        let process;
        if (typeof cmdArgs1.reload == 'undefined') {
            process = Deno.run({
                cmd: [
                    'deno',
                    'run',
                    '--allow-all',
                    '--no-check',
                    '--inspect=0.0.0.0:9229',
                    `https://raw.githubusercontent.com/GreenAntTech/JSphere/${version}/server.js`
                ]
            });
        } else {
            process = Deno.run({
                cmd: [
                    'deno',
                    'run',
                    '--allow-all',
                    '--no-check',
                    '--reload',
                    '--inspect=0.0.0.0:9229',
                    `https://raw.githubusercontent.com/GreenAntTech/JSphere/${version}/server.js`
                ]
            });
        }
        await process.status();
        process.close();
    } catch (e1) {
        critical(e1.message);
    }
}
async function processBuildCmd(cmdArgs2) {
    try {
        const projectName = Deno.cwd().replaceAll('\\', '/').split('/').pop();
        const version = cmdArgs2.v || 'latest';
        const noCache = typeof cmdArgs2['no-cache'] !== 'undefined' ? '--no-cache' : '';
        info(`docker build ${noCache} --pull --rm -f DockerFile -t ${projectName.toLowerCase()}:${version} .`);
        let process;
        if (typeof cmdArgs2['no-cache'] == 'undefined') {
            process = Deno.run({
                cmd: [
                    'docker',
                    'build',
                    '--pull',
                    '--rm',
                    '-f',
                    'DockerFile',
                    '-t',
                    `${projectName.toLowerCase()}:${version}`,
                    '.'
                ]
            });
        } else {
            process = Deno.run({
                cmd: [
                    'docker',
                    'build',
                    '--no-cache',
                    '--pull',
                    '--rm',
                    '-f',
                    'DockerFile',
                    '-t',
                    `${projectName.toLowerCase()}:${version}`,
                    '.'
                ]
            });
        }
        await process.status();
        process.close();
    } catch (e2) {
        critical(e2.message);
    }
}
async function processRunCmd(cmdArgs3) {
    try {
        const projectName = Deno.cwd().replaceAll('\\', '/').split('/').pop();
        const version = cmdArgs3.v || 'latest';
        const http = cmdArgs3.http || '80';
        const debug = cmdArgs3.debug || '9229';
        info(`docker run --rm -it --mount type=bind,source=${Deno.cwd().replaceAll('\\', '/')}/,target=/${projectName} -p ${http}:80/tcp -p ${debug}:9229/tcp ${projectName.toLowerCase()}:${version}`);
        const process = Deno.run({
            cmd: [
                'docker',
                'run',
                '--rm',
                '-it',
                '--mount',
                `type=bind,source=${Deno.cwd().replaceAll('\\', '/')}/,target=/${projectName}`,
                '-p',
                `${http}:80/tcp`,
                '-p',
                `${debug}:9229/tcp`,
                `${projectName.toLowerCase()}:${version}`
            ]
        });
        await process.status();
        process.close();
    } catch (e3) {
        critical(e3.message);
    }
}
async function processCheckoutCmd(cmdArgs4) {
    try {
        const env = await load({
            envPath: `${Deno.cwd()}/.env`
        });
        let repo = env.REMOTE_CONFIG;
        const provider = env.REMOTE_HOST;
        const owner = env.REMOTE_ROOT;
        const accessToken = env.REMOTE_AUTH;
        const checkout = cmdArgs4._[1].toString();
        if (checkout.startsWith('.')) {
            if (checkout != '.') repo = checkout;
            await cloneRepo({
                provider,
                owner,
                accessToken,
                repo
            });
        } else {
            const parts = checkout.split('/');
            const appId = parts[0];
            const appPackage = parts[1];
            const appFile = await Deno.readFile(`${Deno.cwd()}/${repo}/.applications/${appId}.json`);
            const appConfig = JSON.parse(new TextDecoder().decode(appFile));
            if (appConfig.packages) {
                for(const key in appConfig.packages){
                    if (appPackage == '*' || appPackage == key) {
                        await cloneRepo({
                            provider: appConfig.host.name,
                            owner: appConfig.host.root,
                            accessToken: appConfig.host.auth,
                            repo: key
                        });
                    }
                }
            } else {
                error(`The application '${appId}' does not have the package '${appPackage}' registered.`);
            }
        }
    } catch (e4) {
        critical(e4.message);
    }
}
async function processCreateCmd(cmdArgs5) {
    switch(cmdArgs5._[1]){
        case 'package':
            await processCreatePackageCmd(cmdArgs5);
            break;
        case 'project':
            await processCreateProjectCmd(cmdArgs5);
            break;
        default:
            error(`Missing 'project' or 'package' after create command.`);
    }
}
async function processCreatePackageCmd(cmdArgs6) {
    try {
        const packageName = cmdArgs6._[2];
        if (packageName) {
            await Deno.mkdir(`${Deno.cwd()}/${packageName}/client`, {
                recursive: true
            });
            await Deno.mkdir(`${Deno.cwd()}/${packageName}/server`, {
                recursive: true
            });
            await Deno.mkdir(`${Deno.cwd()}/${packageName}/tests`, {
                recursive: true
            });
            if (cmdArgs6['git-init']) await initRepo(`${Deno.cwd()}/${packageName}`);
        } else error(`Please provide a package name.`);
    } catch (e5) {
        critical(e5.message);
    }
}
async function processCreateProjectCmd(cmdArgs7) {
    try {
        const projectName = cmdArgs7._[2];
        if (projectName) {
            await Deno.mkdir(`${Deno.cwd()}/${projectName}`, {
                recursive: true
            });
            const envSettings = {
                useLocalConfig: 'true',
                localRoot: projectName,
                localConfig: '.jsphere-' + projectName.toLowerCase()
            };
            await Deno.writeFile(`${Deno.cwd()}/${projectName}/.env`, (new TextEncoder).encode(getEnvContent(envSettings)));
            await Deno.writeFile(`${Deno.cwd()}/${projectName}/DockerFile`, (new TextEncoder).encode(getDockerFileContent(projectName)));
            await Deno.mkdir(`${Deno.cwd()}/${projectName}/${envSettings.localConfig}`, {
                recursive: true
            });
            await Deno.writeFile(`${Deno.cwd()}/${projectName}/${envSettings.localConfig}/server.json`, (new TextEncoder).encode('{}'));
            await Deno.mkdir(`${Deno.cwd()}/${projectName}/${envSettings.localConfig}/.domains`, {
                recursive: true
            });
            await Deno.mkdir(`${Deno.cwd()}/${projectName}/${envSettings.localConfig}/.applications`, {
                recursive: true
            });
            await Deno.writeFile(`${Deno.cwd()}/${projectName}/${envSettings.localConfig}/.domains/localhost.json`, (new TextEncoder).encode(getDomainContent()));
            await Deno.writeFile(`${Deno.cwd()}/${projectName}/${envSettings.localConfig}/.applications/app.json`, (new TextEncoder).encode(getApplicationContent()));
            await Deno.mkdir(`${Deno.cwd()}/${projectName}/app/client`, {
                recursive: true
            });
            await Deno.writeFile(`${Deno.cwd()}/${projectName}/app/client/index.html`, (new TextEncoder).encode(getClientIndexContent()));
            await Deno.mkdir(`${Deno.cwd()}/${projectName}/app/server`, {
                recursive: true
            });
            if (cmdArgs7['git-init']) {
                await initRepo(`${Deno.cwd()}/${projectName}/${envSettings.localConfig}`);
                await initRepo(`${Deno.cwd()}/${projectName}/app`);
            }
        } else error(`Please provide a project name.`);
    } catch (e6) {
        critical(e6.message);
    }
}
async function processDecryptCmd(cmdArgs8) {
    try {
        const domain = cmdArgs8._[1];
        if (domain) {
            const env = await load({
                envPath: `${Deno.cwd()}/.env`
            });
            if (env.CRYPTO_PRIVATE_KEY) {
                const keyData = decode(new TextEncoder().encode(env.CRYPTO_PRIVATE_KEY));
                const privateKey = await crypto.subtle.importKey('pkcs8', keyData, {
                    name: "RSA-OAEP",
                    hash: "SHA-512"
                }, true, [
                    'decrypt'
                ]);
                const repo = env.USE_LOCAL_CONFIG == 'true' ? env.LOCAL_CONFIG : env.REMOTE_CONFIG;
                let domainFile = new TextDecoder().decode(await Deno.readFile(`${Deno.cwd()}/${repo}/.domains/${domain}.json`));
                const domainConfig = JSON.parse(domainFile);
                for(const setting in domainConfig.settings){
                    if (domainConfig.settings[setting].startsWith('DECRYPT:')) {
                        const value = domainConfig.settings[setting].replace('DECRYPT:', '');
                        const decBuffer = await crypto.subtle.decrypt({
                            name: "RSA-OAEP"
                        }, privateKey, decode(new TextEncoder().encode(value)));
                        const decData = new Uint8Array(decBuffer);
                        domainFile = domainFile.replace(`"${domainConfig.settings[setting]}"`, `"ENCRYPT:${new TextDecoder().decode(decData)}"`);
                    }
                }
                await Deno.writeFile(`${Deno.cwd()}/${repo}/.domains/${domain}.json`, new TextEncoder().encode(domainFile));
            } else error(`Please set a value for the CRYPTO_PRIVATE_KEY environment variable.`);
        } else error(`Please provide a domain domain.`);
    } catch (e7) {
        critical(e7.message);
    }
}
async function processEncryptCmd(cmdArgs9) {
    try {
        const domain = cmdArgs9._[1];
        if (domain) {
            const env = await load({
                envPath: `${Deno.cwd()}/.env`
            });
            if (env.CRYPTO_PUBLIC_KEY) {
                const keyData = decode(new TextEncoder().encode(env.CRYPTO_PUBLIC_KEY));
                const publicKey = await crypto.subtle.importKey('spki', keyData, {
                    name: "RSA-OAEP",
                    hash: "SHA-512"
                }, true, [
                    'encrypt'
                ]);
                const repo = env.USE_LOCAL_CONFIG == 'true' ? env.LOCAL_CONFIG : env.REMOTE_CONFIG;
                let domainFile = new TextDecoder().decode(await Deno.readFile(`${Deno.cwd()}/${repo}/.domains/${domain}.json`));
                const domainConfig = JSON.parse(domainFile);
                for(const setting in domainConfig.settings){
                    if (domainConfig.settings[setting].startsWith('ENCRYPT:')) {
                        const value = domainConfig.settings[setting].replace('ENCRYPT:', '');
                        const encBuffer = await crypto.subtle.encrypt({
                            name: "RSA-OAEP"
                        }, publicKey, new TextEncoder().encode(value));
                        const encData = new Uint8Array(encBuffer);
                        domainFile = domainFile.replace(`"${domainConfig.settings[setting]}"`, `"DECRYPT:${new TextDecoder().decode(encode(encData))}"`);
                    }
                }
                await Deno.writeFile(`${Deno.cwd()}/${repo}/.domains/${domain}.json`, new TextEncoder().encode(domainFile));
            } else error(`Please set a value for the CRYPTO_PUBLIC_KEY environment variable.`);
        } else error(`Please provide a domain domain.`);
    } catch (e8) {
        critical(e8.message);
    }
}
async function processCryptoKeysCmd() {
    try {
        const keyPair = await crypto.subtle.generateKey({
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([
                1,
                0,
                1
            ]),
            hash: "SHA-512"
        }, true, [
            "encrypt",
            "decrypt"
        ]);
        const exportedPublicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
        const exportedPrivateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        const publicKeyHex = new TextDecoder().decode(encode(new Uint8Array(exportedPublicKeyBuffer)));
        const privateKeyHex = new TextDecoder().decode(encode(new Uint8Array(exportedPrivateKeyBuffer)));
        const env = await load({
            envPath: `${Deno.cwd()}/.env`
        });
        env.CRYPTO_PUBLIC_KEY = publicKeyHex;
        env.CRYPTO_PRIVATE_KEY = privateKeyHex;
        let newEnv = '';
        for(const setting in env){
            newEnv += `${setting}=${env[setting]}\r\n`;
        }
        await Deno.writeFile(`${Deno.cwd()}/.env`, new TextEncoder().encode(newEnv));
    } catch (e9) {
        critical(e9.message);
    }
}
async function processResetCmd(cmdArgs10) {
    try {
        const domain = cmdArgs10._[1];
        if (domain) {
            const response = await fetch(`http://${domain}/~/resetdomain`);
            const result = await response.text();
            info(result);
        } else {
            error(`Please provide a domain.`);
        }
    } catch (e10) {
        critical(e10.message);
    }
}
async function cloneRepo(config) {
    let process;
    const path = `${Deno.cwd()}/${config.repo}`;
    if (config.accessToken) {
        process = Deno.run({
            cmd: [
                'git',
                'clone',
                `https://${config.owner}:${config.accessToken}@github.com/${config.owner}/${config.repo}.git`,
                path
            ]
        });
    } else {
        process = Deno.run({
            cmd: [
                'git',
                'clone',
                `https://github.com/${config.owner}/${config.repo}.git`,
                path
            ]
        });
    }
    await process.status();
    process.close();
}
async function initRepo(path) {
    const process = Deno.run({
        cmd: [
            'git',
            'init',
            path,
            '-b',
            'main'
        ]
    });
    await process.status();
    process.close();
}
function getEnvContent(envSettings) {
    const content = `CONFIG=LOCAL_CONFIG
LOCAL_CONFIG=${envSettings.localConfig || ''}
REMOTE_CONFIG=${envSettings.remoteConfig || ''}
REMOTE_HOST=${envSettings.remoteHost || ''}
REMOTE_ROOT=${envSettings.remoteRoot || ''}
REMOTE_AUTH=${envSettings.remoteAuth || ''}
SERVER_HTTP_PORT=80
`;
    return content;
}
function getDomainContent() {
    const content = `{
    "appId": "",
    "appFile": "app",
    "settings": {
    },
    "contextExtensions": {
    }
}
`;
    return content;
}
function getApplicationContent() {
    const content = `{
    "host": {
        "name": "FileSystem",
        "root": "",
        "auth": ""
    },
    "packages": {
        "app": {
        }
    },
    "routeMappings": [
        { "route": "/", "path": "/app/client/index.html" }
    ],
    "featureFlags": [
    ],
    "settings": {
    }
}
`;
    return content;
}
function getClientIndexContent() {
    const content = `<html lang="en">
    <head>
        <title>JSphere Application Server</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="height:100%; width:100%; background-color:#ffffff; overflow: hidden;">
        <div>
            <svg height="312.5" width="312.5" style="width: 312.5px; height: 312.5px; position: absolute; top: 25%; left: 50%; transform: translate(-50%, -50%) scale(1); z-index: 0; cursor: pointer;"><defs id="SvgjsDefs1001"></defs><g id="SvgjsG1007" featurekey="rootContainer" transform="matrix(3.125,0,0,3.125,0,0)" fill="#ffffff"><path xmlns="http://www.w3.org/2000/svg" d="M0 0h100v100H0z"></path></g><g id="SvgjsG1008" featurekey="symbolFeature-0" transform="matrix(0.8900523382446061,0,0,0.8900523382446061,111.11509448216034,80.4074845557191)" fill="#4B4982"><path xmlns="http://www.w3.org/2000/svg" d="M64.761261,14.0909958c0.1954193-0.0250063,0.4097214-0.0297699,0.6371002-0.01478  c0.2266922,0.0149441,0.4666824,0.0495443,0.7143097,0.1034002c0.2472458,0.053772,0.5024719,0.1268206,0.7601395,0.2188482  c0.2576828,0.0920305,0.5182266,0.2031946,0.7761688,0.3333092c0.3892136,0.1963358,0.7366486,0.4178333,1.0323715,0.6509924  c0.2974701,0.2345362,0.5434265,0.4815159,0.7269135,0.7269697c0.1849976,0.2474728,0.3068314,0.4938469,0.3536606,0.7244511  c0.047287,0.2328243,0.0181503,0.4497795-0.0998383,0.6353855c-0.0399933,0.0626373-0.0888519,0.1196995-0.1458435,0.1711807  c-0.0571671,0.0516415-0.1224976,0.0976543-0.1952362,0.1380329c-0.0729446,0.0404968-0.1533127,0.0753136-0.2403336,0.1044502  c-0.0872498,0.029213-0.18116,0.0527096-0.2809372,0.0704899c-0.1980743,0.0352955-0.419075,0.0480461-0.656723,0.0383396  c-0.2384033-0.009737-0.4932175-0.0420628-0.7579498-0.0967884c-0.2651749-0.0548172-0.5398712-0.132021-0.8174667-0.2312984  c-0.2775726-0.0992737-0.5575409-0.2204399-0.8331833-0.3630466c-0.4142838-0.2140923-0.7782669-0.4555397-1.0810471-0.7080002  c-0.3008957-0.2508907-0.5404968-0.5119534-0.7090874-0.7674513c-0.1671638-0.253335-0.2642174-0.5007563-0.2822914-0.7273264  c-0.0178986-0.2243891,0.0416794-0.4281693,0.1871643-0.5972013c0.0486221-0.0562887,0.1052628-0.1069431,0.1690979-0.1520443  c0.0636444-0.0449648,0.1344681-0.0844231,0.2116623-0.118453c0.0769882-0.0339346,0.1603317-0.0624809,0.2492599-0.0857124  C64.5678787,14.1215687,64.6621628,14.1036758,64.761261,14.0909958z"></path><path xmlns="http://www.w3.org/2000/svg" d="M76.7634277,22.5126152c0.0698776-0.0177231,0.1449661-0.0307636,0.2249374-0.0388966  c0.0798569-0.0081196,0.1646042-0.0113506,0.2539215-0.0094662c0.0892181,0.0018826,0.1830215,0.0088673,0.2811127,0.0211849  c0.0979996,0.0123043,0.2003098,0.0299358,0.306633,0.0531254c0.3136139,0.0682602,0.6331787,0.1785221,0.9431534,0.3196678  c0.3103867,0.1413345,0.6120529,0.3140392,0.8890915,0.5071239c0.2781525,0.1938534,0.5321503,0.4087238,0.7455597,0.633503  c0.2147369,0.2261791,0.3887939,0.4628468,0.5050125,0.698595c0.077774,0.1570683,0.125206,0.3039989,0.1443176,0.4387722  c0.0192108,0.135479,0.0097885,0.2586422-0.026207,0.3674011c-0.036171,0.1092949-0.0991592,0.2039967-0.1868362,0.2819633  c-0.0880585,0.0783081-0.2009659,0.1396828-0.3364716,0.1819649c-0.0696259,0.0217228-0.1451874,0.0384007-0.2263794,0.0497398  c-0.0813141,0.0113583-0.1682587,0.0173588-0.2604904,0.0177174c-0.0923615,0.0003567-0.1900024-0.0049438-0.2925949-0.0161877  c-0.1026993-0.0112553-0.2103195-0.0284615-0.3225174-0.0518951c-0.3316116-0.069252-0.6709366-0.1862049-0.9998703-0.3381348  c-0.328476-0.1517162-0.6455841-0.3378468-0.9336472-0.5455189c-0.28685-0.2068024-0.5441742-0.4344444-0.7549286-0.670208  c-0.2094116-0.234251-0.3724289-0.476059-0.4727859-0.7130737c-0.0656815-0.1554241-0.1001892-0.2990608-0.1063156-0.4291706  c-0.0060959-0.1294327,0.0159073-0.245512,0.0632706-0.34655c0.0471344-0.1005535,0.1194153-0.1862583,0.2142105-0.2554684  C76.5099945,22.5998859,76.6267776,22.5472775,76.7634277,22.5126152z"></path><path xmlns="http://www.w3.org/2000/svg" d="M85.0995331,33.0917969c0.0924225-0.0399933,0.192749-0.0725937,0.3006592-0.0974083  c0.107666-0.0247574,0.2229233-0.0417747,0.3454666-0.0506516c0.1223221-0.0088615,0.2519455-0.0096169,0.3885956-0.0018654  c0.1364517,0.00774,0.2799683,0.0239677,0.4302826,0.0490952c0.4720306,0.0788689,0.9680023,0.2383232,1.4623184,0.4595947  c0.495163,0.2216454,0.9909134,0.5063286,1.4610214,0.8358231c0.4728928,0.3314514,0.9216919,0.7095451,1.3189087,1.1159439  c0.4010315,0.4102936,0.7508087,0.8507957,1.0201645,1.3025131c0.18573,0.3114777,0.3213959,0.6083794,0.408905,0.8857117  c0.0882721,0.2797203,0.127533,0.5394592,0.1197357,0.7739258c-0.0078583,0.2363892-0.0635452,0.4469337-0.1649551,0.6261292  c-0.1021576,0.1805077-0.2506027,0.3290062-0.4429703,0.4398499c-0.0899963,0.0518532-0.1895599,0.0954361-0.2984238,0.1301804  c-0.1091309,0.0348282-0.2275696,0.0607605-0.3550339,0.0772285c-0.1277237,0.0165024-0.2644424,0.0234985-0.4098663,0.0204239  c-0.1456528-0.0030746-0.2999649-0.0162506-0.4626007-0.0400696c-0.5130463-0.075161-1.0583496-0.2486992-1.6032333-0.4976463  c-0.5438766-0.2484856-1.0846176-0.570858-1.5903778-0.9434547c-0.5025177-0.3702049-0.9684219-0.7884598-1.367485-1.2313652  c-0.39505-0.4384499-0.7233047-0.8996201-0.9565582-1.3611031c-0.157402-0.3114357-0.2612686-0.6027184-0.3156281-0.8695641  c-0.053894-0.2645721-0.0591431-0.5052299-0.0196533-0.717926c0.0391769-0.2110138,0.1224136-0.3946724,0.2460251-0.547081  C84.7375793,33.2987251,84.9002838,33.1780205,85.0995331,33.0917969z"></path><path xmlns="http://www.w3.org/2000/svg" d="M52.3659592,9.6736546c0.0833969-0.0058393,0.1702538-0.0080986,0.2601128-0.0066566  c0.0897408,0.001441,0.1824951,0.0065727,0.277832,0.0155201c0.0952301,0.0089378,0.1930542,0.0216846,0.293045,0.0383673  c0.0999069,0.0166674,0.2019997,0.0372696,0.3058586,0.0619354c0.3057556,0.0727196,0.5984688,0.1740456,0.8665314,0.2951946  c0.268383,0.1212969,0.5127602,0.2627831,0.7211113,0.4157267c0.2091103,0.1535006,0.3823929,0.318882,0.5073318,0.4872999  c0.1256523,0.1693735,0.2026329,0.3421249,0.2178764,0.5091705c0.0099945,0.1109505-0.0079269,0.2125006-0.0506172,0.3034897  c-0.0428963,0.0914211-0.1107903,0.1721621-0.2004585,0.2410231c-0.0900726,0.0691681-0.2020874,0.1263218-0.3327179,0.1702356  c-0.1311531,0.0440884-0.2809982,0.0748053-0.4461021,0.0909204c-0.0848541,0.0082827-0.1737099,0.0127068-0.2660904,0.0131083  c-0.092514,0.0004034-0.1885414-0.0032282-0.2875977-0.011054c-0.0991783-0.0078363-0.2013664-0.0198736-0.3060799-0.036273  c-0.104805-0.0164137-0.2121086-0.0371904-0.3214111-0.0624838c-0.3232727-0.0747175-0.6328278-0.1816273-0.9151611-0.3107643  c-0.2819748-0.1289721-0.5360222-0.2797585-0.7491188-0.4423351c-0.2122841-0.1619596-0.3834381-0.3352499-0.5010109-0.5099916  c-0.1168861-0.1737242-0.1805992-0.3485708-0.1792679-0.5149422c0.0012627-0.1091728,0.0304642-0.2078466,0.0838661-0.2950964  c0.0531502-0.0868378,0.1302795-0.1623793,0.2277336-0.2257309c0.097023-0.0630741,0.2142334-0.1140919,0.3480721-0.1521749  C52.0530167,9.7102079,52.2029228,9.6850843,52.3659592,9.6736546z"></path><path xmlns="http://www.w3.org/2000/svg" d="M38.2941284,8.5381756c0.4428024-0.0230265,0.8984795,0.0058737,1.3443985,0.0775547  c0.4443054,0.0714226,0.8806381,0.1855927,1.2864609,0.3339567c0.4059067,0.1483946,0.7828445,0.331563,1.1079025,0.5413342  c0.3263664,0.2106152,0.6016846,0.4488525,0.8021698,0.706749c0.2018929,0.2602844,0.309063,0.516715,0.3290672,0.7580709  c0.0202026,0.2437162-0.0484467,0.4723625-0.1985245,0.6738968c-0.1516495,0.2036428-0.3864479,0.3796091-0.6964645,0.5150957  c-0.3130951,0.1368313-0.7025185,0.2322073-1.1592216,0.2728443c-0.4614716,0.0401707-0.9453583,0.0208702-1.424511-0.0488615  c-0.4810295-0.0700045-0.9552994-0.1905479-1.3954201-0.3518562c-0.4400215-0.161273-0.8440895-0.362628-1.1852951-0.5938082  c-0.3397293-0.2301817-0.615757-0.4889994-0.8022995-0.7659931c-0.1849136-0.2752991-0.2635002-0.5416727-0.2483978-0.7871933  c0.0149536-0.2430725,0.1217232-0.4654474,0.307785-0.6560659c0.1841354-0.1886473,0.445961-0.3462276,0.7737083-0.4623413  C37.4601173,8.636549,37.849865,8.5620632,38.2941284,8.5381756z"></path><path xmlns="http://www.w3.org/2000/svg" d="M59.6179504,17.8341503c0.350174-0.0560379,0.7287827-0.0756493,1.1258049-0.0596008  c0.3950195,0.0159664,0.8091927,0.0672684,1.2329292,0.1533985c0.4226341,0.085907,0.8558655,0.2066822,1.2904167,0.3621216  c0.4345894,0.1554508,0.8717232,0.3460102,1.3023109,0.5718307c0.6504593,0.3413601,1.2275543,0.732708,1.7160645,1.1503639  c0.4934158,0.4218521,0.8987808,0.8725262,1.197998,1.3270359c0.3034363,0.4609165,0.4986801,0.9272556,0.5651093,1.3719063  c0.0675354,0.4520645,0.0020294,0.8824577-0.219017,1.2614574c-0.0750656,0.1285648-0.1656799,0.2470741-0.2705612,0.3554001  c-0.1054535,0.1089191-0.225296,0.2074966-0.3581772,0.2956047c-0.1335602,0.0885544-0.2802353,0.1664925-0.4386597,0.2336979  c-0.1591492,0.0675125-0.3300705,0.1241589-0.5113449,0.1698322c-0.3608856,0.0909309-0.7621765,0.1382294-1.192337,0.1412487  c-0.4325943,0.0030365-0.8932877-0.0387211-1.3698997-0.1255951c-0.4780273-0.0871296-0.9706879-0.219389-1.4653549-0.3966694  c-0.4946251-0.1772652-0.9896736-0.3989773-1.4722862-0.6645164c-0.7234879-0.3975792-1.3466263-0.8537178-1.8519363-1.3352242  c-0.4997559-0.4762135-0.8817978-0.9749088-1.1323051-1.4649258c-0.2467957-0.4827633-0.3651924-0.9556828-0.3437424-1.3903179  c0.0210876-0.4273911,0.1773758-0.817297,0.479351-1.1438789c0.1002007-0.1085587,0.2133141-0.2067299,0.3378677-0.2946777  c0.123909-0.0874882,0.2591934-0.1648979,0.4044304-0.232378c0.1445541-0.0671616,0.2990303-0.1245193,0.4620476-0.1722088  C59.2689896,17.9005661,59.4398689,17.8626385,59.6179504,17.8341503z"></path><path xmlns="http://www.w3.org/2000/svg" d="M42.5893631,14.583106c0.7025986-0.0753918,1.430809-0.055294,2.1485367,0.0445747  c0.7134666,0.0992765,1.4211044,0.2780085,2.0871773,0.522253c0.6663094,0.2443285,1.2951965,0.5557442,1.8501129,0.9215212  c0.5585899,0.3682003,1.045742,0.7938061,1.4227867,1.2649117c0.3821526,0.478096,0.6166153,0.9599934,0.7113266,1.4238434  c0.0962601,0.4714336,0.0483704,0.9252472-0.1365662,1.3369846c-0.1882019,0.4190216-0.5183754,0.7945347-0.9824982,1.0994415  c-0.4719772,0.3100681-1.0815239,0.5464954-1.8178101,0.680233c-0.7492561,0.1348591-1.5520821,0.1509018-2.3602867,0.0627785  c-0.8136864-0.0887203-1.6270103-0.2823868-2.3907166-0.5638008c-0.763401-0.2813015-1.4717712-0.6482697-2.0770912-1.081892  c-0.6008072-0.4303894-1.0959091-0.9234428-1.4406357-1.4593182c-0.3398476-0.5291786-0.4994507-1.0476704-0.5000038-1.5304203  c-0.0005417-0.474596,0.1526451-0.9138508,0.4386101-1.2956219c0.2810097-0.3751526,0.690361-0.6949644,1.2091751-0.9394779  C41.2621078,14.8284607,41.8799896,14.6601696,42.5893631,14.583106z"></path><path xmlns="http://www.w3.org/2000/svg" d="M25.10182,12.2365608c0.4263172-0.0319986,0.8526573-0.0158663,1.2595615,0.0404453  c0.4056282,0.0561352,0.7932987,0.1523857,1.1435146,0.2812757c0.3502808,0.1289129,0.6642551,0.2909031,0.9220333,0.4788094  c0.2586784,0.1885624,0.4616261,0.4038448,0.5881844,0.6388721c0.1274586,0.2366838,0.1653481,0.4716949,0.1239491,0.6944084  c-0.041748,0.2245913-0.1641731,0.4369144-0.3569298,0.6256847c-0.1944942,0.1904726-0.4605942,0.3569679-0.7873669,0.4875927  c-0.3295555,0.1317368-0.7204609,0.2268476-1.1607628,0.2730398c-0.44487,0.0459452-0.8962078,0.0380201-1.3307209-0.0160484  c-0.4359741-0.0542488-0.8534641-0.1547594-1.2291336-0.293231c-0.375597-0.1384439-0.7080593-0.3143454-0.9745255-0.5190144  c-0.2654762-0.2039089-0.4645195-0.4356613-0.575222-0.6863804c-0.1104679-0.2487335-0.1232262-0.4920702-0.0526428-0.7186966  c0.0699787-0.2246847,0.2218151-0.4327364,0.4413853-0.6135321c0.2176132-0.179184,0.5017929-0.3316221,0.8391533-0.4472427  C24.2868843,12.3478737,24.6741791,12.2692852,25.10182,12.2365608z"></path><path xmlns="http://www.w3.org/2000/svg" d="M70.2394943,29.8400097c0.1745148-0.0558147,0.35923-0.1004353,0.553421-0.1333332  c0.1935043-0.0327835,0.3965302-0.0539436,0.6084137-0.0629425c0.2112579-0.0089722,0.4314423-0.0058575,0.6599274,0.009901  c0.2279663,0.0157242,0.4643402,0.0440445,0.7085342,0.0855446c0.7660522,0.1302166,1.5410461,0.3788719,2.2904892,0.7180996  c0.7514191,0.3401203,1.4824677,0.7737007,2.1566925,1.2740879c0.6804657,0.5050182,1.3072281,1.0811901,1.8407516,1.7016315  c0.5415573,0.6297913,0.9899063,1.3085213,1.301384,2.0078735c0.216095,0.485199,0.3526459,0.9495888,0.4139252,1.3852081  c0.0621262,0.4416161,0.0468674,0.8535233-0.0413055,1.2270317c-0.089325,0.3784294-0.2534103,0.7170601-0.4872818,1.0065994  c-0.2366486,0.2929802-0.544342,0.5351906-0.9173203,0.7169647c-0.1749573,0.0852661-0.3641586,0.1571503-0.5669327,0.2146759  c-0.2035828,0.0577507-0.420723,0.1009903-0.6507034,0.128746c-0.230751,0.0278473-0.4742661,0.0400848-0.7297592,0.035759  c-0.2561646-0.0043373-0.5241776-0.025322-0.8031998-0.0638733c-0.8814926-0.1218452-1.7841415-0.4065781-2.6563644-0.8156891  c-0.8695602-0.4078636-1.7017822-0.9360237-2.4480362-1.5441132c-0.7384415-0.6017265-1.3877487-1.2776909-1.9039536-1.9884148  c-0.5077972-0.6991577-0.8841629-1.4283295-1.0902481-2.1508026c-0.1381683-0.4843788-0.1906357-0.9341011-0.1670532-1.3430405  c0.023262-0.4034081,0.1205368-0.7674141,0.2827377-1.0864258c0.1601715-0.3150349,0.3838654-0.5865936,0.6626892-0.8093987  C69.5321121,30.1337109,69.8623657,29.9606209,70.2394943,29.8400097z"></path><path xmlns="http://www.w3.org/2000/svg" d="M50.4649124,24.5203876c0.6613121-0.1385441,1.3601761-0.2076607,2.0791397-0.20858  c0.7127419-0.0009117,1.4480972,0.0651932,2.189743,0.1979198c0.7383423,0.1321373,1.4861488,0.330883,2.2278862,0.5968094  c0.7418327,0.2659607,1.4811592,0.600399,2.2028694,1.005043c1.093586,0.6131592,2.0525208,1.3349628,2.8554459,2.1226177  c0.8168755,0.8013401,1.4790001,1.6774597,1.9567146,2.5819035c0.4895439,0.9268322,0.7883034,1.8888855,0.8589745,2.8329391  c0.0727844,0.9722252-0.0961151,1.9286118-0.5501175,2.8065872c-0.1556854,0.3010635-0.339901,0.5832062-0.5503922,0.8457298  c-0.2126122,0.2651749-0.4518738,0.5101433-0.7153702,0.7341995c-0.2659607,0.2261505-0.5563927,0.4308128-0.8687134,0.6132927  c-0.3149834,0.1840324-0.6519432,0.3453293-1.0081329,0.4832153c-0.7126503,0.2758789-1.5000916,0.4573402-2.3392296,0.5397377  c-0.8481178,0.0832748-1.7450142,0.0649605-2.6653214-0.0583878c-0.9254608-0.1240387-1.8695526-0.353611-2.8053017-0.6903763  c-0.9355888-0.3367043-1.8571739-0.7785263-2.7372055-1.3249168c-1.3135643-0.816124-2.39645-1.7790108-3.2244415-2.8097038  c-0.8110657-1.0096207-1.3703156-2.0753365-1.6658554-3.1265182c-0.2875595-1.0227852-0.3239975-2.0266647-0.1035957-2.9518414  c0.2138329-0.8975964,0.6691017-1.7197094,1.3708649-2.4161587c0.2309494-0.2292042,0.4814453-0.4376869,0.7487183-0.6258202  c0.2648392-0.1864204,0.5463753-0.353014,0.8419647-0.5001087c0.2931633-0.1458836,0.6004105-0.2727146,0.9192276-0.3807697  C49.7992706,24.6799355,50.127449,24.591074,50.4649124,24.5203876z"></path><path xmlns="http://www.w3.org/2000/svg" d="M30.290163,22.9055614c0.2875233-0.0468655,0.5804577-0.0821609,0.8774128-0.105402  c0.2957783-0.0231476,0.5957317-0.0343533,0.8985252-0.0331154c0.301796,0.0012321,0.6066208,0.0148277,0.9131889,0.0413017  c0.3057823,0.0264072,0.6135254,0.0656509,0.9219894,0.1182747c0.9672012,0.1649818,1.8558197,0.4471245,2.6397209,0.817543  c0.7862129,0.3715115,1.4733238,0.8347702,2.0311356,1.3621387c0.5636139,0.532856,0.999115,1.1348515,1.2717018,1.7779865  c0.2772141,0.6540546,0.3875885,1.3545818,0.2910423,2.0718384c-0.0668907,0.4982777-0.2293854,0.9729958-0.475708,1.4162464  c-0.2501602,0.4501648-0.5866928,0.8677101-0.9968987,1.2438946c-0.4163437,0.381815-0.9081154,0.7205887-1.4612961,1.0068893  c-0.5606689,0.2901726-1.1833267,0.5258713-1.8523598,0.6972542c-0.3141441,0.0804749-0.6382408,0.1466751-0.9705658,0.1976051  c-0.3338432,0.0511627-0.6757622,0.0868797-1.0239525,0.106163c-0.3495255,0.0193558-0.7050972,0.0221329-1.0648346,0.0073776  c-0.3608227-0.0148048-0.7255192-0.0472374-1.0921421-0.0982246c-1.1588173-0.1611214-2.2193794-0.490921-3.1376324-0.9474182  c-0.9150429-0.4549065-1.6802349-1.0313892-2.2580128-1.6854286c-0.5708809-0.6462326-0.9544296-1.3632526-1.1199226-2.1083698  c-0.1624279-0.7313156-0.1138401-1.4854145,0.1707668-2.2231312c0.1908512-0.4935169,0.4747829-0.9473724,0.8330956-1.3560181  c0.3528233-0.4023876,0.7780571-0.7612705,1.2583752-1.0716572c0.4735661-0.3060207,1.0013714-0.5653477,1.5675201-0.7732925  C29.0705433,23.162611,29.6683464,23.0069141,30.290163,22.9055614z"></path><path xmlns="http://www.w3.org/2000/svg" d="M88.504631,48.8169708c0.2751465-0.1891937,0.6179428-0.2788124,1.0027008-0.2798462  c0.3832474-0.0010262,0.8097229,0.0858345,1.2545242,0.2508354c0.4449005,0.1650429,0.9099731,0.4089394,1.3705139,0.7229042  c0.4625549,0.3153343,0.9224625,0.7026596,1.3546448,1.1539497c0.4366455,0.4559517,0.8046646,0.9352188,1.0963287,1.412941  c0.2947617,0.4827919,0.5119476,0.9646568,0.6427002,1.4189835c0.1322479,0.4594955,0.1760864,0.8908424,0.1220932,1.2655907  c-0.0545807,0.3787956-0.2090378,0.6992607-0.4725876,0.9314766c-0.2674713,0.2331963-0.6190948,0.3537636-1.0259628,0.370842  c-0.4086075,0.0171509-0.8710861-0.0701523-1.3574142-0.2512398c-0.4862137-0.1810493-0.9940796-0.4550209-1.4933167-0.8100166  c-0.4968948-0.3533249-0.9830399-0.7853508-1.4287567-1.2833176c-0.442009-0.4945488-0.8009644-1.005497-1.0718079-1.5046425  c-0.2679062-0.4937363-0.4492874-0.9753609-0.5401001-1.4186058c-0.0897903-0.4382668-0.0910492-0.8391037,0.0000305-1.1779442  C88.0483627,49.283535,88.2290726,49.0084114,88.504631,48.8169708z"></path><path xmlns="http://www.w3.org/2000/svg" d="M63.8619843,43.4907837c0.8020096-0.3576698,1.6868439-0.5129547,2.6032639-0.491539  c0.9088135,0.0212364,1.856781,0.2164307,2.7946625,0.5652046c0.9383316,0.3489418,1.874794,0.8546715,2.759819,1.500843  c0.8932648,0.6521912,1.7420654,1.4532623,2.4942322,2.3903809c0.7674408,0.955307,1.3668594,1.96772,1.7922134,2.9872932  c0.4352875,1.0433846,0.6896973,2.0976753,0.7531433,3.1050339c0.0650711,1.0331116-0.0706863,2.0173225-0.4186859,2.8855286  c-0.3566132,0.8897018-0.9351196,1.6551437-1.7441635,2.2208939c-0.8300476,0.575737-1.8128662,0.8840141-2.8772278,0.9415245  c-1.0750961,0.0580902-2.2220154-0.1402664-3.3647919-0.5697861c-1.1421127-0.4292679-2.267952-1.0848656-3.3021698-1.9343567  c-1.0228043-0.8401108-1.9454803-1.8612328-2.6984253-3.0266113c-0.7390213-1.1425552-1.2399712-2.3085098-1.5173187-3.43153  c-0.2705612-1.0955429-0.3277092-2.1477585-0.1876259-3.1003685c0.1366081-0.9289474,0.4608803-1.7639351,0.9588356-2.4564934  C62.3945618,44.3997383,63.0490875,43.8563957,63.8619843,43.4907837z"></path><path xmlns="http://www.w3.org/2000/svg" d="M39.9822502,39.7013092c0.6657867-0.2140617,1.3574562-0.3515663,2.0580864-0.4123611  c0.695076-0.0603142,1.4015312-0.0453529,2.1033325,0.0458298c0.6989365,0.0908089,1.3960724,0.2575836,2.0759354,0.502224  c0.6799469,0.2446709,1.3456192,0.5683022,1.9817581,0.9739952c0.9630547,0.6152267,1.7746849,1.3656693,2.4212189,2.2033463  c0.6568184,0.8510017,1.1481819,1.7984467,1.4535637,2.7910614c0.3122826,1.0150414,0.4317398,2.0827332,0.3321609,3.1452293  c-0.1022797,1.09132-0.4359512,2.1804008-1.031002,3.2001495c-0.2037354,0.3487167-0.4315376,0.678093-0.6810722,0.9872131  c-0.2518082,0.3119431-0.5255737,0.6030579-0.818821,0.8724136c-0.295723,0.2716331-0.6110306,0.5209389-0.9433098,0.7469902  c-0.3348312,0.2277832-0.6866074,0.4317627-1.0525742,0.6110229c-0.7315941,0.3583488-1.5179138,0.6171341-2.3361893,0.769783  c-0.8261452,0.1541214-1.681324,0.199398-2.541008,0.1303444c-0.8640137-0.0694008-1.728344-0.2539444-2.5673714-0.557457  c-0.8388977-0.3034668-1.6479378-0.7242241-2.4013176-1.2639351c-1.1270828-0.8070679-2.0125504-1.7956657-2.6456223-2.880825  c-0.6213989-1.065155-0.9945908-2.2147598-1.1182632-3.3712349c-0.1206436-1.1281929-0.0032578-2.2577133,0.3495216-3.3214836  c0.3432198-1.0349426,0.908741-2.0061073,1.6945534-2.8562851c0.2590332-0.2802353,0.5339584-0.5386581,0.8221474-0.7754211  c0.2857971-0.2347946,0.5848541-0.4484634,0.8946609-0.6411247c0.3074837-0.1912117,0.6257935-0.3618774,0.9525299-0.5120735  C39.3097229,39.9395142,39.6428566,39.8103943,39.9822502,39.7013092z"></path><path xmlns="http://www.w3.org/2000/svg" d="M13.5896139,21.2259426c0.2302284-0.0304089,0.4628057-0.0528431,0.6965466-0.0669632  c0.2330856-0.01408,0.467432-0.0198994,0.7018805-0.017107c0.2339029,0.0027847,0.4680214,0.0141411,0.7012234,0.0344276  c0.2327776,0.0202484,0.4647655,0.0494041,0.6948509,0.087841c0.722229,0.1206818,1.3603764,0.3220196,1.8986206,0.5835094  c0.5393753,0.2620392,0.9814625,0.5859566,1.3079834,0.9518299c0.3289242,0.3685665,0.5421734,0.7814999,0.6189537,1.2186184  c0.0776958,0.4423313,0.0159664,0.9112606-0.2085533,1.3856544c-0.1552086,0.3279648-0.3783302,0.6376705-0.6581955,0.9241943  c-0.2828884,0.2896175-0.6236649,0.5554638-1.0105343,0.7922592c-0.3908482,0.2392311-0.8284187,0.4486141-1.3001232,0.6225872  c-0.4760628,0.1755791-0.9862385,0.3148518-1.517066,0.4121113c-0.2486038,0.0455494-0.5015793,0.0818481-0.7574997,0.1083241  c-0.256712,0.026556-0.5162649,0.0432167-0.7771921,0.0494099c-0.2616043,0.0062084-0.5244503,0.0018959-0.7870398-0.0134983  c-0.2631216-0.0154228-0.5258284-0.0419617-0.7865906-0.0801525c-0.8230686-0.1205788-1.5450373-0.3450813-2.1424932-0.6469173  c-0.5960445-0.3011227-1.0644083-0.6773167-1.3850861-1.101181c-0.3180799-0.4204292-0.4891977-0.8855686-0.4965858-1.3685837  c-0.0072947-0.4768944,0.1450491-0.9692688,0.4712133-1.451807c0.2195101-0.3247623,0.5035505-0.6238937,0.8376131-0.89361  c0.3305035-0.2668438,0.7101412-0.5050354,1.1251745-0.7110615c0.4109459-0.2039948,0.8569994-0.3766556,1.3252125-0.514616  C12.6061125,21.3944378,13.092742,21.2915726,13.5896139,21.2259426z"></path><path xmlns="http://www.w3.org/2000/svg" d="M10.6080523,39.6257858c0.23594-0.0603867,0.4739752-0.110218,0.7126999-0.1489067  c0.23806-0.0385742,0.4769201-0.0660858,0.7152033-0.0819206c0.2377415-0.0158043,0.4750357-0.0199966,0.7105331-0.0119591  c0.2350931,0.0080223,0.4685326,0.0282326,0.6989908,0.0612717c0.6788654,0.0979652,1.2700319,0.2982826,1.7600508,0.5774612  c0.4912109,0.2798538,0.8833694,0.6404305,1.1607227,1.0589828c0.2793865,0.4216232,0.4435349,0.9039764,0.4744282,1.4241142  c0.0312519,0.5261421-0.0737305,1.0929337-0.3351669,1.6764297c-0.1744385,0.3898926-0.407959,0.7630997-0.6903954,1.1136131  c-0.2852154,0.3539658-0.6202173,0.6846695-0.9943056,0.9857178c-0.3775797,0.3038559-0.7946835,0.5772705-1.2399702,0.8135376  c-0.4490089,0.2382469-0.9261169,0.438427-1.4192934,0.5936623c-0.2541656,0.0800018-0.512414,0.1480217-0.7730665,0.2031212  c-0.2614489,0.0552711-0.5251837,0.0975151-0.7894802,0.1258049c-0.2649622,0.0283623-0.5303373,0.0426826-0.7943659,0.0420456  c-0.2645321-0.0006371-0.5275431-0.0162888-0.787241-0.0478439c-0.768115-0.0933228-1.4305444-0.3164482-1.9679074-0.6390343  c-0.5359054-0.3217125-0.9442825-0.7404594-1.2088966-1.2248878c-0.2624936-0.480545-0.3822608-1.0234261-0.3458772-1.5978241  c0.0359411-0.5674095,0.2241259-1.1634865,0.5758767-1.7590408c0.2295589-0.3893204,0.5144324-0.7539787,0.8418722-1.0890045  c0.3242602-0.3317795,0.6904345-0.6346741,1.086401-0.9040222c0.3924241-0.2669411,0.8144679-0.5011749,1.2546439-0.6982269  C9.6902437,39.9033661,10.1453915,39.7442017,10.6080523,39.6257858z"></path><circle xmlns="http://www.w3.org/2000/svg" cx="26.3953857" cy="70.7583618" r="7.0366049"></circle><ellipse xmlns="http://www.w3.org/2000/svg" transform="matrix(-0.5179474 -0.8554124 0.8554124 -0.5179474 66.8822403 184.7197571)" cx="85.4888916" cy="73.5147247" rx="7.0366049" ry="5.2096682"></ellipse><ellipse xmlns="http://www.w3.org/2000/svg" transform="matrix(0.9992827 -0.0378701 0.0378701 0.9992827 -3.033412 2.293015)" cx="59.0110168" cy="81.2181702" rx="5.990623" ry="7.1316938"></ellipse></g><g id="SvgjsG1009" featurekey="nameFeature-0" transform="matrix(0.70111474848621,0,0,0.70111474848621,55.046483932029226,171.8205864732439)" fill="#303841"><path d="M1.36 27.759999999999998 c0 3.7333 1.9334 6.48 5.8 8.24 c2.9333 1.3333 6.6932 2 11.28 2 c4.6132 0 8.3868 -0.66668 11.32 -2 c3.8667 -1.76 5.8 -4.5068 5.8 -8.24 l0 -15.52 c0 -0.74668 -0.37332 -1.12 -1.12 -1.12 c-0.72 0 -1.08 0.37332 -1.08 1.12 l0 0 l0 15.52 c0 3.1467 -1.92 5.3868 -5.76 6.72 c-2.5067 0.85332 -5.56 1.28 -9.16 1.28 s-6.64 -0.42668 -9.12 -1.28 c-3.84 -1.3333 -5.76 -3.5733 -5.76 -6.72 l0 0 c0 -0.72 -0.37332 -1.08 -1.12 -1.08 c-0.72 0 -1.08 0.36 -1.08 1.08 z M43.15 28 c0 2.7467 1.6533 5.06 4.96 6.94 s7.36 2.82 12.16 2.82 c4.7732 0 8.6668 -0.52 11.68 -1.56 c3.6267 -1.2533 5.44 -3.0933 5.44 -5.52 c0 -2.5333 -1.5467 -4.36 -4.64 -5.48 c-1.76 -0.64 -5.1868 -1.3067 -10.28 -2 l-3.96 -0.56 c-4.8268 -0.69332 -8.0268 -1.3066 -9.6 -1.84 c-2.3467 -0.8 -3.52 -1.96 -3.52 -3.48 c0 -1.44 1.3867 -2.6133 4.16 -3.52 s6.3468 -1.36 10.72 -1.36 c4.0268 0 7.5132 0.74668 10.46 2.24 s4.42 3.2666 4.42 5.32 l0 0 c0 0.74668 0.37332 1.12 1.12 1.12 s1.12 -0.37332 1.12 -1.12 l0 0 c0 -2.7467 -1.6533 -5.06 -4.96 -6.94 s-7.36 -2.82 -12.16 -2.82 c-4.7732 0 -8.6668 0.52 -11.68 1.56 c-3.6267 1.2533 -5.44 3.0933 -5.44 5.52 c0 2.5333 1.6133 4.3732 4.84 5.52 c1.5467 0.53332 4.96 1.2 10.24 2 l1.88 0.28 l2.04 0.28 c4.88 0.66668 8.12 1.28 9.72 1.84 c2.1867 0.74668 3.28 1.8934 3.28 3.44 c0 1.44 -1.3867 2.6133 -4.16 3.52 s-6.3468 1.36 -10.72 1.36 c-4.0268 0 -7.5132 -0.74668 -10.46 -2.24 s-4.42 -3.2666 -4.42 -5.32 l0 0 c0 -0.74668 -0.37332 -1.12 -1.12 -1.12 s-1.12 0.37332 -1.12 1.12 z M110.3 10.879999999999999 l-25.12 0 l0 25.12 c0 0.74668 0.37332 1.12 1.12 1.12 s1.12 -0.37332 1.12 -1.12 l0 -6.88 l22.88 0 c2.5333 0 4.6868 -0.89332 6.46 -2.68 s2.66 -3.9334 2.66 -6.44 c0 -2.5333 -0.88668 -4.6868 -2.66 -6.46 s-3.9266 -2.66 -6.46 -2.66 z M110.3 26.880000000000003 l-22.88 0 l0 -13.76 l22.88 0 c1.8933 0 3.5133 0.67332 4.86 2.02 s2.02 2.9667 2.02 4.86 s-0.67332 3.5133 -2.02 4.86 s-2.9667 2.02 -4.86 2.02 z M160.25 11.32 c-0.74668 0 -1.12 0.37332 -1.12 1.12 l0 10.88 l-29.76 0 l0 -10.88 c0 -0.74668 -0.37332 -1.12 -1.12 -1.12 s-1.12 0.37332 -1.12 1.12 l0 24 c0 0.74668 0.37332 1.12 1.12 1.12 s1.12 -0.37332 1.12 -1.12 l0 -10.88 l29.76 0 l0 10.88 c0 0.74668 0.37332 1.12 1.12 1.12 s1.12 -0.37332 1.12 -1.12 l0 -24 c0 -0.74668 -0.37332 -1.12 -1.12 -1.12 z M201.64 25.119999999999997 c0.74668 0 1.12 -0.37332 1.12 -1.12 s-0.37332 -1.12 -1.12 -1.12 l-30.88 0 l0 -9.76 l30.88 0 c0.74668 0 1.12 -0.37332 1.12 -1.12 s-0.37332 -1.12 -1.12 -1.12 l-33.12 0 l0 26.24 l33.12 0 c0.74668 0 1.12 -0.37332 1.12 -1.12 s-0.37332 -1.12 -1.12 -1.12 l-30.88 0 l0 -9.76 l30.88 0 z M244.23 35.08 l-8.96 -5.96 l0.32 0 c2.5333 0 4.6868 -0.89332 6.46 -2.68 s2.66 -3.9334 2.66 -6.44 c0 -2.5333 -0.88668 -4.6868 -2.66 -6.46 s-3.9266 -2.66 -6.46 -2.66 l-25.12 0 l0 25.12 c0 0.74668 0.37332 1.12 1.12 1.12 s1.12 -0.37332 1.12 -1.12 l0 -6.88 l18.56 0 l11.72 7.8 c0.18668 0.13332 0.38668 0.2 0.6 0.2 c0.4 0 0.70668 -0.17332 0.92 -0.52 c0.13332 -0.18668 0.2 -0.38668 0.2 -0.6 c0 -0.4 -0.16 -0.70668 -0.48 -0.92 z M212.70999999999998 13.120000000000001 l22.88 0 c1.8933 0 3.5133 0.67332 4.86 2.02 s2.02 2.9667 2.02 4.86 s-0.67332 3.5133 -2.02 4.86 s-2.9667 2.02 -4.86 2.02 l-22.88 0 l0 -13.76 z M285.5 25.119999999999997 c0.74668 0 1.12 -0.37332 1.12 -1.12 s-0.37332 -1.12 -1.12 -1.12 l-30.88 0 l0 -9.76 l30.88 0 c0.74668 0 1.12 -0.37332 1.12 -1.12 s-0.37332 -1.12 -1.12 -1.12 l-33.12 0 l0 26.24 l33.12 0 c0.74668 0 1.12 -0.37332 1.12 -1.12 s-0.37332 -1.12 -1.12 -1.12 l-30.88 0 l0 -9.76 l30.88 0 z"></path></g><g id="SvgjsG1010" featurekey="sloganFeature-0" transform="matrix(0.5624573695188116,0,0,0.5624573695188116,75.49378858199353,212.76914635619482)" fill="#303841"><path d="M7.16 12.34 l-0.84 -2.7 l2.34 0 l2.36 7.6 l2.78 -7.6 l2.2 0 l-3.64 10.36 l-2.78 0 l-1.3 -4.1 l-1.06 4.1 l-2.74 0 l-3.58 -10.36 l2.22 0 l2.68 7.6 z M22.326 16.28 l0 1.64 l6.5 0 l0 2.08 l-8.54 0 l0 -10.36 l8.16 0 l0 2.06 l-6.12 0 l0 2.52 q0.62 -0.36 1.5 -0.5 q0.68 -0.1 1.74 -0.1 l1.52 0 l0 2.06 l-1.52 0 q-1.38 0 -2 0.12 q-0.54 0.1 -1.24 0.48 z M35.772 11.7 l0 2.36 q0.62 -0.36 1.5 -0.5 q0.68 -0.1 1.74 -0.1 l1.06 0 q0.54 0 0.79 -0.22 t0.25 -0.66 t-0.28 -0.66 t-0.76 -0.22 l-4.3 0 z M35.772 16.16 l0 1.76 l4.3 0 q0.74 0 1.12 -0.22 q0.5 -0.3 0.5 -0.98 q0 -0.58 -0.39 -0.87 t-1.23 -0.29 l-1.06 0 q-1.38 0 -2 0.12 q-0.54 0.1 -1.24 0.48 z M43.751999999999995 16.759999999999998 q0 1.52 -0.98 2.38 t-2.7 0.86 l-6.36 0 l0 -10.36 l6.36 0 q0.84 0 1.56 0.37 t1.15 1.04 t0.43 1.51 q0 1.16 -0.68 1.78 q0.58 0.34 0.9 0.99 t0.32 1.43 z M61.104 16.56 l0.28 0 l-2.02 -3.84 l-2.46 4.74 q0.68 -0.36 1.54 -0.58 q1.24 -0.32 2.66 -0.32 z M58.304 10.7 l-0.68 -1.3 l2.22 0 l5.6 10.6 l-2.26 0 l-0.82 -1.56 l-1.24 0 q-1.18 0 -2.5 0.28 q-1.12 0.22 -2.04 0.6 q-0.84 0.32 -1.02 0.56 l-0.06 0.12 l-2.16 0 z M71.67 11.7 l0 3.1 q0.62 -0.36 1.52 -0.5 q0.68 -0.1 1.74 -0.1 l0.92 0 q0.84 0 1.18 -0.24 q0.46 -0.28 0.46 -1.06 q0 -0.7 -0.5 -0.98 q-0.38 -0.22 -1.14 -0.22 l-4.18 0 z M71.67 20 l-2.04 0 l0 -10.36 l6.58 0 q1 0 1.76 0.4 t1.19 1.15 t0.43 1.73 q0 1.54 -1 2.44 t-2.74 0.9 l-0.92 0 q-1.38 0 -2 0.12 q-0.56 0.1 -1.26 0.48 l0 3.14 z M86.21600000000001 11.7 l0 3.1 q0.62 -0.36 1.52 -0.5 q0.68 -0.1 1.74 -0.1 l0.92 0 q0.84 0 1.18 -0.24 q0.46 -0.28 0.46 -1.06 q0 -0.7 -0.5 -0.98 q-0.38 -0.22 -1.14 -0.22 l-4.18 0 z M86.21600000000001 20 l-2.04 0 l0 -10.36 l6.58 0 q1 0 1.76 0.4 t1.19 1.15 t0.43 1.73 q0 1.54 -1 2.44 t-2.74 0.9 l-0.92 0 q-1.38 0 -2 0.12 q-0.56 0.1 -1.26 0.48 l0 3.14 z M106.36200000000002 20 l-7.64 0 l0 -10.36 l2.14 0 l0 8.28 l5.5 0 l0 2.08 z M112.38800000000002 20 l-2.04 0 l0 -10.36 l2.04 0 l0 10.36 z M126.33400000000002 17.12 l1.2 1.72 q-0.84 0.72 -1.95 1.1 t-2.31 0.38 q-1.6 0 -2.98 -0.66 q-1.42 -0.68 -2.24 -1.88 q-0.88 -1.32 -0.88 -3 t0.9 -2.98 q0.82 -1.2 2.26 -1.86 q1.38 -0.64 2.96 -0.64 q1.16 0 2.24 0.33 t1.92 0.97 l-1.38 1.6 q-0.58 -0.4 -1.31 -0.61 t-1.47 -0.21 q-1.04 0 -1.92 0.38 q-0.92 0.38 -1.44 1.12 q-0.58 0.82 -0.58 1.94 t0.58 1.92 q0.54 0.74 1.48 1.14 q0.86 0.36 1.9 0.36 q0.82 0 1.62 -0.29 t1.4 -0.83 z M138.08000000000004 16.56 l0.28 0 l-2.02 -3.84 l-2.46 4.74 q0.68 -0.36 1.54 -0.58 q1.24 -0.32 2.66 -0.32 z M135.28000000000003 10.7 l-0.68 -1.3 l2.22 0 l5.6 10.6 l-2.26 0 l-0.82 -1.56 l-1.24 0 q-1.18 0 -2.5 0.28 q-1.12 0.22 -2.04 0.6 q-0.84 0.32 -1.02 0.56 l-0.06 0.12 l-2.16 0 z M154.72600000000003 11.7 l-3.9 0 l0 8.3 l-2.06 0 l0 -8.3 l-3.76 0 l0 -2.06 l9.72 0 l0 2.06 z M160.95200000000003 20 l-2.04 0 l0 -10.36 l2.04 0 l0 10.36 z M175.818 14.74 q0 -1.1 -0.6 -1.9 q-0.52 -0.7 -1.46 -1.08 q-0.86 -0.34 -1.9 -0.34 t-1.92 0.36 q-0.94 0.38 -1.46 1.12 q-0.58 0.8 -0.58 1.92 t0.6 1.92 q0.52 0.72 1.46 1.12 q0.88 0.36 1.9 0.36 t1.92 -0.4 q0.92 -0.42 1.46 -1.18 q0.58 -0.82 0.58 -1.9 z M177.978 14.719999999999999 q0 1.7 -0.9 3.02 q-0.82 1.22 -2.26 1.92 q-1.38 0.66 -2.98 0.66 t-2.98 -0.66 q-1.42 -0.68 -2.24 -1.88 q-0.88 -1.32 -0.88 -3 t0.9 -2.98 q0.82 -1.2 2.26 -1.86 q1.38 -0.64 2.98 -0.64 t2.96 0.6 q1.42 0.64 2.24 1.82 q0.9 1.28 0.9 3 z M181.46400000000003 9.64 l2.58 0 l6.26 7.2 l0 -7.2 l2.06 0 l0 10.36 l-2.06 0 l-5.76 -6.74 l0 6.74 l-2.06 0 l0 -8.82 z M212.49600000000004 10.6 l-1.38 1.6 q-1.1 -0.9 -3.08 -0.9 q-0.78 0 -1.44 0.34 t-0.66 0.78 q0 0.36 0.14 0.54 q0.18 0.26 0.64 0.36 q0.52 0.14 1.48 0.14 q2.08 0 3.28 0.46 q1.06 0.38 1.48 1.14 q0.34 0.62 0.34 1.58 q0 1.8 -1.5 2.76 q-1.42 0.92 -3.74 0.92 q-1.34 0 -2.59 -0.59 t-2.11 -1.61 l1.48 -1.5 l0.18 0.2 q0.42 0.44 0.68 0.68 q0.46 0.38 0.96 0.58 q0.62 0.24 1.4 0.24 q1.44 0 2.32 -0.44 t0.88 -1.24 q0 -0.68 -0.78 -0.92 q-0.7 -0.22 -2.42 -0.22 q-2 0 -3.06 -0.7 q-1.22 -0.76 -1.22 -2.38 q0 -0.92 0.6 -1.64 q0.56 -0.7 1.54 -1.09 t2.14 -0.39 q1.24 0 2.22 0.26 q1.16 0.3 2.22 1.04 z M219.92200000000003 16.28 l0 1.64 l6.5 0 l0 2.08 l-8.54 0 l0 -10.36 l8.16 0 l0 2.06 l-6.12 0 l0 2.52 q0.62 -0.36 1.5 -0.5 q0.68 -0.1 1.74 -0.1 l1.52 0 l0 2.06 l-1.52 0 q-1.38 0 -2 0.12 q-0.54 0.1 -1.24 0.48 z M238.86800000000002 15.780000000000001 l0.64 1.08 q0.34 0.56 0.86 0.78 q0.36 0.14 0.88 0.14 l0.72 0 l0 2.22 l-0.9 0 q-0.66 0 -1.04 -0.08 q-0.56 -0.12 -1.02 -0.44 q-0.5 -0.38 -0.96 -1.12 l-1.6 -2.6 l-0.14 0 q-1.14 0 -1.74 0.14 q-0.48 0.1 -1.16 0.46 l0 3.64 l-2.1 0 l0 -10.36 l6.68 0 q0.94 0 1.68 0.4 t1.16 1.12 t0.42 1.6 q0 1.16 -0.61 1.91 t-1.77 1.11 z M236.30800000000002 13.7 l1.68 0 q0.5 0 0.83 -0.26 t0.33 -0.74 q0 -0.62 -0.48 -0.84 q-0.34 -0.16 -1.04 -0.16 l-4.22 0 l0 2.6 q1.1 -0.6 2.9 -0.6 z M257.09400000000005 9.64 l-4.58 10.36 l-2.66 0 l-4.5 -10.36 l2.32 0 l3.5 8.26 l3.58 -8.26 l2.34 0 z M263.32000000000005 16.28 l0 1.64 l6.5 0 l0 2.08 l-8.54 0 l0 -10.36 l8.16 0 l0 2.06 l-6.12 0 l0 2.52 q0.62 -0.36 1.5 -0.5 q0.68 -0.1 1.74 -0.1 l1.52 0 l0 2.06 l-1.52 0 q-1.38 0 -2 0.12 q-0.54 0.1 -1.24 0.48 z M282.266 15.780000000000001 l0.64 1.08 q0.34 0.56 0.86 0.78 q0.36 0.14 0.88 0.14 l0.72 0 l0 2.22 l-0.9 0 q-0.66 0 -1.04 -0.08 q-0.56 -0.12 -1.02 -0.44 q-0.5 -0.38 -0.96 -1.12 l-1.6 -2.6 l-0.14 0 q-1.14 0 -1.74 0.14 q-0.48 0.1 -1.16 0.46 l0 3.64 l-2.1 0 l0 -10.36 l6.68 0 q0.94 0 1.68 0.4 t1.16 1.12 t0.42 1.6 q0 1.16 -0.61 1.91 t-1.77 1.11 z M279.706 13.7 l1.68 0 q0.5 0 0.83 -0.26 t0.33 -0.74 q0 -0.62 -0.48 -0.84 q-0.34 -0.16 -1.04 -0.16 l-4.22 0 l0 2.6 q1.1 -0.6 2.9 -0.6 z"></path></g></svg>
        </div>
    </body>
</html>
`;
    return content;
}
function getDockerFileContent(projectName) {
    const content = `FROM --platform=linux/amd64 ubuntu
FROM denoland/deno:ubuntu
WORKDIR /${projectName}
RUN deno cache https://raw.githubusercontent.com/GreenAntTech/JSphere/main/server.js
EXPOSE 80
EXPOSE 9229
ENTRYPOINT ["deno", "run", "--allow-all", "--inspect=0.0.0.0:9229", "--no-check", "https://raw.githubusercontent.com/GreenAntTech/JSphere/main/server.js"]
`;
    return content;
}

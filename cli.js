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
const VERSION = 'V0.0.1-beta.1';
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
        case 'version':
            processVersionCmd();
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
    console.log('version');
}
async function processStartCmd(cmdArgs1) {
    try {
        const version = cmdArgs1.v || VERSION;
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
                const repo = env[env.CONFIG];
                let domainFile = new TextDecoder().decode(await Deno.readFile(`${Deno.cwd()}/${repo}/.domains/${domain}.json`));
                const domainConfig = JSON.parse(domainFile);
                const settings = domainConfig.settings;
                for(const setting in settings){
                    if (typeof settings[setting] === 'object' && settings[setting].encrypt) {
                        const decBuffer = await crypto.subtle.decrypt({
                            name: "RSA-OAEP"
                        }, privateKey, decode(new TextEncoder().encode(settings[setting].value)));
                        const decData = new Uint8Array(decBuffer);
                        domainFile = domainFile.replace(`"${settings[setting].value}"`, `"${new TextDecoder().decode(decData)}"`);
                    }
                }
                for(const extension in domainConfig.contextExtensions){
                    const settings = domainConfig.contextExtensions[extension].settings;
                    for(const setting in settings){
                        if (typeof settings[setting] === 'object' && settings[setting].encrypt) {
                            const decBuffer = await crypto.subtle.decrypt({
                                name: "RSA-OAEP"
                            }, privateKey, decode(new TextEncoder().encode(settings[setting].value)));
                            const decData = new Uint8Array(decBuffer);
                            domainFile = domainFile.replace(`"${settings[setting].value}"`, `"${new TextDecoder().decode(decData)}"`);
                        }
                    }
                }
                await Deno.writeFile(`${Deno.cwd()}/${repo}/.domains/${domain}.json`, new TextEncoder().encode(domainFile));
            } else error(`Please set a value for the CRYPTO_PRIVATE_KEY environment variable.`);
        } else error(`Please provide a domain.`);
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
                const repo = env[env.CONFIG];
                let domainFile = new TextDecoder().decode(await Deno.readFile(`${Deno.cwd()}/${repo}/.domains/${domain}.json`));
                const domainConfig = JSON.parse(domainFile);
                const settings = domainConfig.settings;
                for(const setting in settings){
                    if (typeof settings[setting] === 'object' && settings[setting].encrypt) {
                        const encBuffer = await crypto.subtle.encrypt({
                            name: "RSA-OAEP"
                        }, publicKey, new TextEncoder().encode(settings[setting].value));
                        const encData = new Uint8Array(encBuffer);
                        domainFile = domainFile.replace(`"${settings[setting].value}"`, `"${new TextDecoder().decode(encode(encData))}"`);
                    }
                }
                for(const extension in domainConfig.contextExtensions){
                    const settings = domainConfig.contextExtensions[extension].settings;
                    for(const setting in settings){
                        if (typeof settings[setting] === 'object' && settings[setting].encrypt) {
                            const encBuffer = await crypto.subtle.encrypt({
                                name: "RSA-OAEP"
                            }, publicKey, new TextEncoder().encode(settings[setting].value));
                            const encData = new Uint8Array(encBuffer);
                            domainFile = domainFile.replace(`"${settings[setting].value}"`, `"${new TextDecoder().decode(encode(encData))}"`);
                        }
                    }
                }
                await Deno.writeFile(`${Deno.cwd()}/${repo}/.domains/${domain}.json`, new TextEncoder().encode(domainFile));
            } else error(`Please set a value for the CRYPTO_PUBLIC_KEY environment variable.`);
        } else error(`Please provide a domain.`);
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
function processVersionCmd() {
    console.log(VERSION);
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
            <svg width="293px" height="217px" viewBox="0 0 293 217" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <path d="M0 0L293 0L293 217L0 217L0 0Z" id="path_1" />
                <clipPath id="clip_1">
                <use xlink:href="#path_1" />
                </clipPath>
            </defs>
            <g id="Frame" clip-path="url(#clip_1)">
                <path d="M0 0L293 0L293 217L0 217L0 0Z" id="Frame" fill="#FFFFFF" fill-rule="evenodd" stroke="none" />
                <g id="Group-11" transform="translate(98 22.018188)">
                <path d="M43.4776 19.2088C45.6895 15.6026 52.1413 15.211 57.8882 18.334C63.635 21.457 66.5005 26.9121 64.2886 30.5183C62.0767 34.1244 55.6249 34.5161 49.878 31.3931C44.1313 28.2701 41.2657 22.815 43.4776 19.2088Z" id="Oval-3" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M61.2535 36.9294C64.2882 34.3575 69.8864 35.553 73.7573 39.5996C77.6284 43.6462 78.3063 49.0117 75.2715 51.5836C72.2368 54.1556 66.6387 52.9601 62.7677 48.9135C58.8967 44.8668 58.2187 39.5014 61.2535 36.9294Z" id="Oval-7" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M35.9937 9.42038C36.5677 7.07961 40.1244 5.85379 43.9375 6.68242C47.7506 7.51103 50.3764 10.0803 49.8023 12.4211C49.2281 14.7619 45.6716 15.9877 41.8583 15.159C38.0452 14.3304 35.4195 11.7611 35.9937 9.42038Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M0.211765 38.6725C-0.719297 36.2645 1.50703 33.2912 5.18443 32.0313C8.86183 30.7715 12.5978 31.7022 13.529 34.1101C14.4601 36.5181 12.2338 39.4914 8.55638 40.7513C4.87883 42.0111 1.14297 41.0804 0.211765 38.6725Z" id="Oval-8" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M55.7677 10.6914C56.84 8.87038 60.3634 8.77895 63.6374 10.4871C66.9114 12.1953 68.6961 15.0563 67.6237 16.8772C66.5514 18.6982 63.0279 18.7897 59.7539 17.0815C56.4799 15.3733 54.6952 12.5123 55.7677 10.6914Z" id="Oval-5" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M68.013 23.7147C69.6304 21.4576 73.8005 21.4428 77.3271 23.6817C80.8536 25.9207 82.4011 29.5655 80.7836 31.8226C79.1662 34.0798 74.9961 34.0946 71.4695 31.8557C67.9431 29.6167 66.3955 25.9719 68.013 23.7147Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M84.8167 25.3776C85.9988 24.2256 88.7429 24.915 90.946 26.9176C93.1492 28.9202 93.977 31.4775 92.7951 32.6295C91.6131 33.7816 88.8689 33.0922 86.6658 31.0896C84.4627 29.087 83.6348 26.5297 84.8167 25.3776Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M75.4728 15.1072C76.0138 14.2923 77.8559 14.4573 79.5875 15.4757C81.3191 16.4942 82.2842 17.9804 81.7432 18.7953C81.2022 19.6102 79.36 19.4452 77.6285 18.4268C75.8969 17.4084 74.9318 15.9221 75.4728 15.1072Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M62.6268 6.48073C63.348 5.39418 65.4535 5.40776 67.3294 6.51107C69.2052 7.61437 70.1411 9.3896 69.4197 10.4762C68.6984 11.5627 66.5931 11.5492 64.7171 10.4459C62.8413 9.34254 61.9054 7.5673 62.6268 6.48073Z" id="Oval-10" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M32.8563 1.67049C33.4103 0.156185 35.8156 -0.437362 38.2287 0.344772C40.642 1.12689 42.1492 2.9885 41.5952 4.5028C41.0413 6.0171 38.636 6.61066 36.2227 5.82854C33.8096 5.0464 32.3024 3.18478 32.8563 1.67049Z" id="Oval-12" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M18.1061 6.093C18.3456 4.66933 20.4471 3.79959 22.8001 4.15033C25.1528 4.5011 26.8659 5.93953 26.6264 7.3632C26.3867 8.78686 24.2854 9.65661 21.9324 9.30584C19.5797 8.95509 17.8666 7.51666 18.1061 6.093Z" id="Oval-13" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M49.0443 2.45944C49.4757 1.58854 51.0756 1.43123 52.6177 2.10807C54.1598 2.78491 55.0602 4.03962 54.6287 4.91051C54.1973 5.78141 52.5974 5.93871 51.0553 5.26187C49.5132 4.58502 48.6128 3.33034 49.0443 2.45944Z" id="Oval-11" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M88.3712 41.9136C89.6477 40.6251 92.5992 41.263 94.9636 43.3383C97.3279 45.4136 98.2098 48.1404 96.9333 49.4288C95.6569 50.7172 92.7055 50.0794 90.3412 48.0041C87.9768 45.9288 87.0948 43.202 88.3712 41.9136Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M81.6574 60.0666C84.7202 58.3344 89.1212 59.9349 91.4875 63.6415C93.8536 67.348 93.2888 71.757 90.226 73.4892C87.1632 75.2214 82.7621 73.6209 80.3961 69.9144C78.0299 66.2078 78.5946 61.7988 81.6574 60.0666Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M55.8466 64.4235C59.5535 63.9332 63.0768 67.007 63.7162 71.2891C64.3557 75.5712 61.8688 79.4401 58.162 79.9304C54.4551 80.4208 50.9318 77.347 50.2924 73.0649C49.6531 68.7828 52.1398 64.9139 55.8466 64.4235Z" id="Oval-6" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M33.0787 33.7053C37.3585 30.2652 43.6137 31.4035 47.0503 36.2478C50.4868 41.092 49.8033 47.8078 45.5238 51.2479C41.2442 54.688 34.9889 53.5496 31.5523 48.7054C28.1159 43.8612 28.7991 37.1454 33.0787 33.7053Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M29.5813 15.0506C34.3449 15.1289 38.1581 17.7885 38.0988 20.9912C38.0393 24.1938 34.1299 26.7266 29.3663 26.6483C24.6028 26.57 20.7894 23.9104 20.8489 20.7077C20.9082 17.5051 24.8179 14.9723 29.5813 15.0506Z" id="Oval-9" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M15.7596 59.9798C17.9716 56.3737 23.1095 55.268 27.2354 57.5101C31.3613 59.7523 32.9128 64.4933 30.7009 68.0995C28.4889 71.7057 23.351 72.8114 19.2251 70.5692C15.0992 68.327 13.5477 63.586 15.7596 59.9798Z" id="Oval-3" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                <path d="M2.72475 18.8804C2.27024 16.6794 5.15139 14.3006 9.15995 13.5672C13.1685 12.8338 16.7866 14.0235 17.2411 16.2245C17.6956 18.4255 14.8145 20.8043 10.8059 21.5377C6.79734 22.2711 3.17927 21.0814 2.72475 18.8804Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none" />
                </g>
                <g fill="#686868" stroke="none" id="JSphere" transform="translate(46 102)">
                <path d="M96.4 45.325Q95.075 45.325 95.075 44L95.075 11.95Q95.075 10.65 96.4 10.65Q97.7 10.65 97.7 11.95L97.7 25.4Q100.075 21.7 106.3 21.7L107.7 21.7Q112.375 21.7 114.537 23.8625Q116.7 26.025 116.7 30.7L116.7 44Q116.7 45.325 115.4 45.325Q114.737 45.325 114.406 44.9937Q114.075 44.6625 114.075 44L114.075 30.7Q114.075 27.125 112.662 25.725Q111.25 24.325 107.7 24.325L106.3 24.325Q102.425 24.325 100.2 25.55Q97.975 26.775 97.7 29.375L97.7 44Q97.7 45.325 96.4 45.325ZM10.6 45.325Q6 45.325 3.7625 43.4Q1.525 41.475 1.25 37.275Q1.2 36.625 1.525 36.2625Q1.85 35.9 2.525 35.9Q3.775 35.9 3.875 37.225Q4.075 40.325 5.5875 41.5125Q7.1 42.7 10.6 42.7L12.65 42.7Q15.225 42.7 16.7 42.075Q18.175 41.45 18.8125 39.9625Q19.45 38.475 19.45 35.9L19.45 14.425Q19.45 13.1 20.75 13.1Q22.075 13.1 22.075 14.425L22.075 35.9Q22.075 40.85 19.8375 43.0875Q17.6 45.325 12.65 45.325L10.6 45.325ZM39.45 45.275C36.4667 45.275 34.2542 44.6125 32.8125 43.2875Q30.65 41.3 30.5 37.025Q30.475 36.425 30.8375 36.0625Q31.2 35.7 31.8 35.7Q32.4 35.7 32.75 36.05Q33.1 36.4 33.15 37Q33.25 40.15 34.65 41.4Q36.05 42.65 39.45 42.65L46.65 42.65Q50.2 42.65 51.5875 41.2625Q52.975 39.875 52.975 36.375Q52.975 32.825 51.5875 31.4375Q50.2 30.05 46.65 30.05L39.8 30.05Q35.4 30.05 33.35 28Q31.3 25.95 31.3 21.575Q31.3 17.2 33.3375 15.15Q35.375 13.1 39.75 13.1L46.75 13.1Q50.95 13.1 52.9875 14.975Q55.025 16.85 55.175 20.875Q55.225 21.475 54.8625 21.8375Q54.5 22.2 53.875 22.2Q53.3 22.2 52.95 21.85Q52.6 21.5 52.55 20.9Q52.45 18.025 51.15 16.875Q49.85 15.725 46.75 15.725L39.75 15.725Q36.475 15.725 35.2 17.0125Q33.925 18.3 33.925 21.575Q33.925 24.85 35.2125 26.1375Q36.5 27.425 39.8 27.425L46.65 27.425Q51.3 27.425 53.45 29.5875Q55.6 31.75 55.6 36.375Q55.6 41 53.45 43.1375C52.0167 44.5625 49.75 45.275 46.65 45.275L39.45 45.275ZM127.55 36.35L127.55 34.525L145.75 34.525Q147.05 34.525 147.05 33.2L147.05 30.7Q147.05 26.025 144.887 23.8625Q142.725 21.7 138.05 21.7L133.95 21.7Q129.275 21.65 127.1 23.8125Q124.925 25.975 124.925 30.7L124.925 36.35Q124.925 41 127.1 43.1625Q129.275 45.325 133.95 45.325L138.05 45.325C140.85 45.325 142.983 44.825 144.45 43.825Q146.65 42.325 146.975 39.175Q147.05 38.525 146.712 38.1625Q146.375 37.8 145.725 37.8Q145.075 37.8 144.762 38.125Q144.45 38.45 144.35 39.075Q144.075 41.075 142.637 41.8875Q141.2 42.7 138.05 42.7L133.95 42.7Q130.375 42.7 128.962 41.2875Q127.55 39.875 127.55 36.35ZM176.525 36.35L176.525 34.525L194.725 34.525Q196.025 34.525 196.025 33.2L196.025 30.7Q196.025 26.025 193.862 23.8625Q191.7 21.7 187.025 21.7L182.925 21.7Q178.25 21.65 176.075 23.8125Q173.9 25.975 173.9 30.7L173.9 36.35Q173.9 41 176.075 43.1625Q178.25 45.325 182.925 45.325L187.025 45.325Q191.225 45.325 193.425 43.825Q195.625 42.325 195.95 39.175Q196.025 38.525 195.688 38.1625Q195.35 37.8 194.7 37.8Q194.05 37.8 193.737 38.125Q193.425 38.45 193.325 39.075Q193.05 41.075 191.612 41.8875Q190.175 42.7 187.025 42.7L182.925 42.7Q179.35 42.7 177.938 41.2875Q176.525 39.875 176.525 36.35ZM64.275 54Q64.275 55.325 65.6 55.325Q66.9 55.325 66.9 54L66.9 45.325L77.4 45.325Q82.075 45.325 84.2375 43.15Q86.4 40.975 86.4 36.3L86.4 30.7Q86.4 26.025 84.2375 23.8625Q82.075 21.7 77.4 21.7L75.5 21.7Q72.225 21.7 70.125 22.5875Q68.025 23.475 66.9 25.225L66.9 23Q66.9 21.7 65.6 21.7Q64.275 21.7 64.275 23L64.275 54ZM157.05 45.325Q155.725 45.325 155.725 44L155.725 23Q155.725 21.7 157.05 21.7Q158.35 21.7 158.35 23L158.35 26.85Q159.65 24.35 162.112 23.025Q164.575 21.7 167.95 21.7Q169.275 21.7 169.275 23Q169.275 24.325 167.95 24.325Q163.5 24.325 161.05 26.3375Q158.6 28.35 158.35 32.075L158.35 44Q158.35 45.325 157.05 45.325ZM128.962 25.6875Q130.375 24.275 133.95 24.325L138.05 24.325Q141.625 24.325 143.025 25.725Q144.425 27.125 144.425 30.7L144.425 31.9L127.55 31.9L127.55 30.7Q127.55 27.1 128.962 25.6875ZM177.938 25.6875Q179.35 24.275 182.925 24.325L187.025 24.325Q190.6 24.325 192 25.725Q193.4 27.125 193.4 30.7L193.4 31.9L176.525 31.9L176.525 30.7Q176.525 27.1 177.938 25.6875ZM77.4 42.7L66.9 42.7L66.9 29.425Q67.225 26.825 69.3625 25.575Q71.5 24.325 75.5 24.325L77.4 24.325Q80.975 24.325 82.375 25.725Q83.775 27.125 83.775 30.7L83.775 36.3Q83.775 39.875 82.375 41.2875Q80.975 42.7 77.4 42.7Z" />
                </g>
                <g stroke="#808080" stroke-width="1" id="WEB-APPLICATION-SERVER" fill="#686868" transform="translate(74.00012 161)">
                <path d="M2.472 10.552Q2.55 10.798 2.778 10.798Q2.916 10.798 3.006 10.75Q3.096 10.702 3.138 10.552L5.109 4.21952L7.08 10.552Q7.152 10.798 7.41 10.798L7.434 10.798Q7.686 10.798 7.764 10.552L10.068 3.484Q10.116 3.34 10.041 3.202Q9.966 3.064 9.762 3.064Q9.66 3.064 9.585 3.121Q9.51 3.178 9.468 3.292L7.42127 9.58168L5.484 3.31Q5.454 3.178 5.346 3.118Q5.238 3.058 5.118 3.058Q5.004 3.058 4.899 3.118Q4.794 3.178 4.752 3.31L2.81473 9.58168L0.768 3.292Q0.738 3.178 0.657 3.121Q0.576 3.064 0.474 3.064Q0.294 3.064 0.21 3.205Q0.126 3.346 0.174 3.484L2.472 10.552ZM55.476 10.714Q55.56 10.798 55.71 10.798Q55.854 10.798 55.938 10.714Q56.022 10.63 56.022 10.48L56.022 3.376Q56.022 3.226 55.938 3.142Q55.854 3.058 55.71 3.058Q55.56 3.058 55.476 3.142Q55.392 3.226 55.392 3.376L55.392 10.48Q55.392 10.63 55.476 10.714ZM75.912 10.804Q75.768 10.804 75.681 10.72Q75.594 10.636 75.594 10.492L75.594 3.688L73.044 3.688Q72.9 3.688 72.813 3.604Q72.726 3.52 72.726 3.376Q72.726 3.232 72.813 3.145Q72.9 3.058 73.044 3.058L78.78 3.058Q78.924 3.058 79.008 3.145Q79.092 3.232 79.092 3.376Q79.092 3.52 79.008 3.604Q78.924 3.688 78.78 3.688L76.224 3.688L76.224 10.492Q76.224 10.63 76.137 10.717Q76.05 10.804 75.912 10.804ZM80.52 10.714C80.576 10.77 80.654 10.798 80.754 10.798C80.85 10.798 80.926 10.77 80.982 10.714Q81.066 10.63 81.066 10.48L81.066 3.376Q81.066 3.226 80.982 3.142Q80.898 3.058 80.754 3.058Q80.604 3.058 80.52 3.142Q80.436 3.226 80.436 3.376L80.436 10.48Q80.436 10.63 80.52 10.714ZM85.65 10.798C84.782 10.798 84.148 10.598 83.748 10.198Q83.148 9.598 83.148 8.296L83.148 5.56Q83.148 4.246 83.748 3.649Q84.348 3.052 85.638 3.064L87.09 3.064Q88.392 3.064 88.989 3.664Q89.586 4.264 89.586 5.566L89.586 8.296Q89.586 9.598 88.989 10.198C88.591 10.598 87.958 10.798 87.09 10.798L85.65 10.798ZM11.376 10.48Q11.376 10.798 11.694 10.798L16.188 10.798Q16.506 10.798 16.506 10.48Q16.506 10.168 16.188 10.168L12.006 10.168L12.006 7.198L14.772 7.198Q15.09 7.198 15.09 6.88Q15.09 6.568 14.772 6.568L12.006 6.568L12.006 3.694L16.188 3.694Q16.35 3.694 16.4295 3.613Q16.506 3.53503 16.506 3.382Q16.506 3.064 16.188 3.064L11.694 3.064Q11.376 3.064 11.376 3.382L11.376 10.48ZM18.426 10.798Q18.108 10.798 18.108 10.48L18.108 3.382Q18.108 3.064 18.426 3.064L21.558 3.064Q22.44 3.064 22.893 3.511Q23.346 3.958 23.346 4.822L23.346 5.146Q23.346 6.088 22.74 6.478Q23.79 6.91 23.79 8.35L23.79 8.728Q23.79 9.748 23.265 10.273Q22.74 10.798 21.714 10.798L18.426 10.798ZM27.786 10.348Q27.672 10.642 27.96 10.768Q28.254 10.888 28.374 10.6L29.172 8.71L33.102 8.71L33.9 10.6Q33.9556 10.7405 34.054 10.7839Q34.1574 10.8295 34.308 10.768Q34.596 10.642 34.476 10.348L31.5 3.31Q31.398 3.07 31.152 3.064L31.116 3.064Q30.858 3.064 30.762 3.31L27.786 10.348ZM36.258 10.798Q35.94 10.798 35.94 10.48L35.94 3.382Q35.94 3.064 36.258 3.064L39.066 3.064Q40.092 3.064 40.617 3.592Q41.142 4.12 41.142 5.146L41.142 5.506Q41.142 6.526 40.617 7.054Q40.092 7.582 39.066 7.582L36.57 7.582L36.57 10.48Q36.57 10.798 36.258 10.798ZM42.666 10.48Q42.666 10.798 42.984 10.798Q43.296 10.798 43.296 10.48L43.296 7.582L45.792 7.582Q46.818 7.582 47.343 7.054Q47.868 6.526 47.868 5.506L47.868 5.146Q47.868 4.12 47.343 3.592Q46.818 3.064 45.792 3.064L42.984 3.064Q42.666 3.064 42.666 3.382L42.666 10.48ZM49.71 10.798Q49.392 10.798 49.392 10.48L49.392 3.382Q49.392 3.064 49.71 3.064Q50.022 3.064 50.022 3.382L50.022 10.168L53.67 10.168Q53.988 10.168 53.988 10.48Q53.988 10.798 53.67 10.798L49.71 10.798ZM60.606 10.798C59.738 10.798 59.104 10.598 58.704 10.198Q58.104 9.598 58.104 8.296L58.104 5.566Q58.104 4.252 58.701 3.658Q59.298 3.064 60.594 3.064L62.046 3.064Q63.15 3.064 63.69 3.523Q64.23 3.982 64.284 4.996Q64.302 5.158 64.221 5.242Q64.14 5.326 63.984 5.326Q63.684 5.326 63.654 5.008Q63.612 4.264 63.246 3.979Q62.88 3.694 62.046 3.694L60.594 3.694Q59.904 3.694 59.496 3.871Q59.088 4.048 58.911 4.459Q58.734 4.87 58.734 5.566L58.734 8.296Q58.734 8.992 58.914 9.4Q59.094 9.808 59.502 9.988Q59.91 10.168 60.606 10.168L62.046 10.168Q62.88 10.168 63.246 9.883Q63.612 9.598 63.654 8.854Q63.684 8.536 63.984 8.536Q64.14 8.536 64.221 8.623Q64.302 8.71 64.284 8.866Q64.23 9.88 63.69 10.339Q63.15 10.798 62.046 10.798L60.606 10.798ZM68.448 3.31L65.472 10.348Q65.358 10.642 65.646 10.768Q65.94 10.888 66.06 10.6L66.858 8.71L70.788 8.71L71.586 10.6Q71.6416 10.7405 71.74 10.7839Q71.8434 10.8295 71.994 10.768Q72.282 10.642 72.162 10.348L69.186 3.31Q69.084 3.07 68.838 3.064L68.802 3.064Q68.544 3.064 68.448 3.31ZM91.668 10.48Q91.668 10.798 91.986 10.798Q92.298 10.798 92.298 10.48L92.298 4.26875L97.242 10.612C97.342 10.736 97.45 10.798 97.566 10.798Q97.878 10.798 97.878 10.48L97.878 3.382Q97.878 3.064 97.566 3.064Q97.248 3.064 97.248 3.382L97.248 9.59303L92.31 3.25Q92.154 3.064 91.986 3.064Q91.668 3.064 91.668 3.382L91.668 10.48ZM105.12 10.786C104.404 10.786 103.873 10.627 103.527 10.309Q103.008 9.832 102.972 8.806Q102.966 8.662 103.053 8.575Q103.14 8.488 103.284 8.488Q103.428 8.488 103.512 8.572Q103.596 8.656 103.608 8.8Q103.632 9.556 103.968 9.856Q104.304 10.156 105.12 10.156L106.848 10.156Q107.7 10.156 108.033 9.823Q108.366 9.49 108.366 8.65Q108.366 7.798 108.033 7.465Q107.7 7.132 106.848 7.132L105.204 7.132Q104.148 7.132 103.656 6.64Q103.164 6.148 103.164 5.098Q103.164 4.048 103.653 3.556Q104.142 3.064 105.192 3.064L106.872 3.064Q107.88 3.064 108.369 3.514Q108.858 3.964 108.894 4.93Q108.906 5.074 108.819 5.161Q108.732 5.248 108.582 5.248Q108.444 5.248 108.36 5.164Q108.276 5.08 108.264 4.936Q108.24 4.246 107.928 3.97Q107.616 3.694 106.872 3.694L105.192 3.694Q104.406 3.694 104.1 4.003Q103.794 4.312 103.794 5.098Q103.794 5.884 104.103 6.193Q104.412 6.502 105.204 6.502L106.848 6.502Q107.964 6.502 108.48 7.021Q108.996 7.54 108.996 8.65Q108.996 9.76 108.48 10.273C108.136 10.615 107.592 10.786 106.848 10.786L105.12 10.786ZM111.078 10.48Q111.078 10.798 111.396 10.798L115.89 10.798Q116.208 10.798 116.208 10.48Q116.208 10.168 115.89 10.168L111.708 10.168L111.708 7.198L114.474 7.198Q114.792 7.198 114.792 6.88Q114.792 6.568 114.474 6.568L111.708 6.568L111.708 3.694L115.89 3.694Q116.052 3.694 116.132 3.613Q116.208 3.53503 116.208 3.382Q116.208 3.064 115.89 3.064L111.396 3.064Q111.078 3.064 111.078 3.382L111.078 10.48ZM123.042 10.81Q122.91 10.888 122.802 10.864Q122.694 10.84 122.61 10.714L120.642 7.582L118.44 7.582L118.44 10.48Q118.44 10.798 118.128 10.798Q117.81 10.798 117.81 10.48L117.81 3.382Q117.81 3.064 118.128 3.064L120.936 3.064Q121.962 3.064 122.487 3.592Q123.012 4.12 123.012 5.146L123.012 5.506Q123.012 6.412 122.598 6.928Q122.184 7.444 121.374 7.558L123.144 10.378Q123.231 10.5208 123.201 10.6315Q123.172 10.7347 123.042 10.81ZM132.546 10.798Q132.228 10.798 132.228 10.48L132.228 3.382Q132.228 3.064 132.546 3.064L137.04 3.064Q137.358 3.064 137.358 3.382Q137.358 3.53503 137.281 3.61301Q137.202 3.694 137.04 3.694L132.858 3.694L132.858 6.568L135.624 6.568Q135.942 6.568 135.942 6.88Q135.942 7.198 135.624 7.198L132.858 7.198L132.858 10.168L137.04 10.168Q137.358 10.168 137.358 10.48Q137.358 10.798 137.04 10.798L132.546 10.798ZM143.952 10.864Q144.06 10.888 144.192 10.81Q144.322 10.7347 144.351 10.6315Q144.381 10.5208 144.294 10.378L142.524 7.558Q143.334 7.444 143.748 6.928Q144.162 6.412 144.162 5.506L144.162 5.146Q144.162 4.12 143.637 3.592Q143.112 3.064 142.086 3.064L139.278 3.064Q138.96 3.064 138.96 3.382L138.96 10.48Q138.96 10.798 139.278 10.798Q139.59 10.798 139.59 10.48L139.59 7.582L141.792 7.582L143.76 10.714Q143.844 10.84 143.952 10.864ZM127.116 10.582C127.176 10.726 127.274 10.798 127.41 10.798L127.476 10.798C127.62 10.798 127.722 10.726 127.782 10.582L130.908 3.514Q130.98 3.34 130.908 3.226Q130.836 3.112 130.68 3.082Q130.428 3.022 130.332 3.262L127.461 9.81349L124.572 3.262Q124.476 3.022 124.23 3.082Q124.086 3.112 124.005 3.226Q123.924 3.34 124.002 3.514L127.116 10.582ZM85.65 10.168L87.09 10.168Q87.78 10.168 88.188 9.988Q88.596 9.808 88.776 9.4Q88.956 8.992 88.956 8.296L88.956 5.566Q88.956 4.876 88.776 4.468Q88.596 4.06 88.188 3.877Q87.78 3.694 87.09 3.694L85.638 3.694Q84.948 3.688 84.543 3.865Q84.138 4.042 83.958 4.453Q83.778 4.864 83.778 5.56L83.778 8.296Q83.778 8.992 83.958 9.4Q84.138 9.808 84.546 9.988Q84.954 10.168 85.65 10.168ZM18.738 6.292L21.648 6.292Q22.194 6.292 22.455 6.013Q22.716 5.734 22.716 5.146L22.716 4.822Q22.716 4.222 22.443 3.958Q22.17 3.694 21.558 3.694L18.738 3.694L18.738 6.292ZM36.57 6.952L39.066 6.952Q39.822 6.952 40.167 6.607Q40.512 6.262 40.512 5.506L40.512 5.146Q40.512 4.384 40.167 4.039Q39.822 3.694 39.066 3.694L36.57 3.694L36.57 6.952ZM45.792 6.952L43.296 6.952L43.296 3.694L45.792 3.694Q46.548 3.694 46.893 4.039Q47.238 4.384 47.238 5.146L47.238 5.506Q47.238 6.262 46.893 6.607Q46.548 6.952 45.792 6.952ZM118.44 6.952L120.936 6.952Q121.692 6.952 122.037 6.607Q122.382 6.262 122.382 5.506L122.382 5.146Q122.382 4.384 122.037 4.039Q121.692 3.694 120.936 3.694L118.44 3.694L118.44 6.952ZM142.086 6.952L139.59 6.952L139.59 3.694L142.086 3.694Q142.842 3.694 143.187 4.039Q143.532 4.384 143.532 5.146L143.532 5.506Q143.532 6.262 143.187 6.607Q142.842 6.952 142.086 6.952ZM31.134 4.06L32.838 8.08L29.43 8.08L31.134 4.06ZM70.524 8.08L67.116 8.08L68.82 4.06L70.524 8.08ZM18.738 10.168L21.714 10.168Q22.476 10.168 22.818 9.826Q23.16 9.484 23.16 8.728L23.16 8.35Q23.16 7.594 22.821 7.258Q22.482 6.922 21.714 6.922L18.738 6.922L18.738 10.168Z" />
                </g>
            </g>
            </svg>
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
RUN deno cache https://raw.githubusercontent.com/GreenAntTech/JSphere/${VERSION}/server.js
EXPOSE 80
EXPOSE 9229
ENTRYPOINT ["deno", "run", "--allow-all", "--inspect=0.0.0.0:9229", "--no-check", "https://raw.githubusercontent.com/GreenAntTech/JSphere/${VERSION}/server.js"]
`;
    return content;
}

var LogLevels;
(function(LogLevels) {
    LogLevels[LogLevels["NOTSET"] = 0] = "NOTSET";
    LogLevels[LogLevels["DEBUG"] = 10] = "DEBUG";
    LogLevels[LogLevels["INFO"] = 20] = "INFO";
    LogLevels[LogLevels["WARNING"] = 30] = "WARNING";
    LogLevels[LogLevels["ERROR"] = 40] = "ERROR";
    LogLevels[LogLevels["CRITICAL"] = 50] = "CRITICAL";
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
    debug(msg, ...args) {
        return this.#_log(LogLevels.DEBUG, msg, ...args);
    }
    info(msg, ...args) {
        return this.#_log(LogLevels.INFO, msg, ...args);
    }
    warning(msg, ...args) {
        return this.#_log(LogLevels.WARNING, msg, ...args);
    }
    error(msg, ...args) {
        return this.#_log(LogLevels.ERROR, msg, ...args);
    }
    critical(msg, ...args) {
        return this.#_log(LogLevels.CRITICAL, msg, ...args);
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
function run(str, code) {
    return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
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
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
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
        const msg = this.format(logRecord);
        return this.log(msg);
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
        let msg = super.format(logRecord);
        switch(logRecord.level){
            case LogLevels.INFO:
                msg = blue(msg);
                break;
            case LogLevels.WARNING:
                msg = yellow(msg);
                break;
            case LogLevels.ERROR:
                msg = red(msg);
                break;
            case LogLevels.CRITICAL:
                msg = bold(red(msg));
                break;
            default:
                break;
        }
        return msg;
    }
    log(msg) {
        console.log(msg);
    }
}
class WriterHandler extends BaseHandler {
    _writer;
    #encoder = new TextEncoder();
}
class FileHandler extends WriterHandler {
    _file;
    _buf;
    _filename;
    _mode;
    _openOptions;
    _encoder = new TextEncoder();
    #unloadCallback = (()=>{
        this.destroy();
    }).bind(this);
    constructor(levelName, options){
        super(levelName, options);
        this._filename = options.filename;
        this._mode = options.mode ? options.mode : "a";
        this._openOptions = {
            createNew: this._mode === "x",
            create: this._mode !== "x",
            append: this._mode === "a",
            truncate: this._mode !== "a",
            write: true
        };
    }
    setup() {
        this._file = Deno.openSync(this._filename, this._openOptions);
        this._writer = this._file;
        this._buf = new BufWriterSync(this._file);
        addEventListener("unload", this.#unloadCallback);
    }
    handle(logRecord) {
        super.handle(logRecord);
        if (logRecord.level > LogLevels.ERROR) {
            this.flush();
        }
    }
    log(msg) {
        if (this._encoder.encode(msg).byteLength + 1 > this._buf.available()) {
            this.flush();
        }
        this._buf.writeSync(this._encoder.encode(msg + "\n"));
    }
    flush() {
        if (this._buf?.buffered() > 0) {
            this._buf.flush();
        }
    }
    destroy() {
        this.flush();
        this._file?.close();
        this._file = undefined;
        removeEventListener("unload", this.#unloadCallback);
    }
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
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
function info(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").info(msg, ...args);
    }
    return getLogger("default").info(msg, ...args);
}
function error(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").error(msg, ...args);
    }
    return getLogger("default").error(msg, ...args);
}
function critical(msg, ...args) {
    if (msg instanceof Function) {
        return getLogger("default").critical(msg, ...args);
    }
    return getLogger("default").critical(msg, ...args);
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
    const handlers = state.config.handlers || {};
    for(const handlerName in handlers){
        const handler = handlers[handlerName];
        handler.setup();
        state.handlers.set(handlerName, handler);
    }
    state.loggers.clear();
    const loggers = state.config.loggers || {};
    for(const loggerName in loggers){
        const loggerConfig = loggers[loggerName];
        const handlerNames = loggerConfig.handlers || [];
        const handlers = [];
        handlerNames.forEach((handlerName)=>{
            const handler = state.handlers.get(handlerName);
            if (handler) {
                handlers.push(handler);
            }
        });
        const levelName = loggerConfig.level || DEFAULT_LEVEL;
        const logger = new Logger(loggerName, levelName, {
            handlers: handlers
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
            !allowEmptyValues && `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`
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
            const { inBrackets , inBracketsDefault , notInBrackets , notInBracketsDefault  } = params[params.length - 1];
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
    const key = keys[keys.length - 1];
    return hasOwn(o, key);
}
function parse1(args, { "--": doubleDash = false , alias ={} , boolean: __boolean = false , default: defaults = {} , stopEarly =false , string =[] , collect =[] , negatable =[] , unknown =(i)=>i  } = {}) {
    const aliases = {};
    const flags = {
        bools: {},
        strings: {},
        unknownFn: unknown,
        allBools: false,
        collect: {},
        negatable: {}
    };
    if (alias !== undefined) {
        for(const key in alias){
            const val = getForce(alias, key);
            if (typeof val === "string") {
                aliases[key] = [
                    val
                ];
            } else {
                aliases[key] = val;
            }
            for (const alias of getForce(aliases, key)){
                aliases[alias] = [
                    key
                ].concat(aliases[key].filter((y)=>alias !== y));
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
    if (collect !== undefined) {
        const collectArgs = typeof collect === "string" ? [
            collect
        ] : collect;
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
        const key = keys[keys.length - 1];
        const collectable = collect && !!get(flags.collect, name);
        if (!collectable) {
            o[key] = value;
        } else if (get(o, key) === undefined) {
            o[key] = [
                value
            ];
        } else if (Array.isArray(get(o, key))) {
            o[key].push(value);
        } else {
            o[key] = [
                get(o, key),
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
    if (args.includes("--")) {
        notFlags = args.slice(args.indexOf("--") + 1);
        args = args.slice(0, args.indexOf("--"));
    }
    for(let i = 0; i < args.length; i++){
        const arg = args[i];
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
            const next = args[i + 1];
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
                if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1]) && !get(flags.bools, key) && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args[i + 1], arg);
                    i++;
                } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
                    setArg(key, args[i + 1] === "true", arg);
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
                argv._.push(...args.slice(i + 1));
                break;
            }
        }
    }
    for (const [key, value] of Object.entries(defaults)){
        if (!hasKey(argv, key.split("."))) {
            setKey(argv, key, value);
            if (aliases[key]) {
                for (const x of aliases[key]){
                    setKey(argv, x, value);
                }
            }
        }
    }
    for (const key of Object.keys(flags.bools)){
        if (!hasKey(argv, key.split("."))) {
            const value = get(flags.collect, key) ? [] : false;
            setKey(argv, key, value, false);
        }
    }
    for (const key of Object.keys(flags.strings)){
        if (!hasKey(argv, key.split(".")) && get(flags.collect, key)) {
            setKey(argv, key, [], false);
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
const VERSION = 'v0.0.1-preview.1';
(async function() {
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
})();
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
async function processStartCmd(cmdArgs) {
    try {
        const version = cmdArgs.v || VERSION;
        let command;
        if (typeof cmdArgs.reload == 'undefined') {
            command = new Deno.Command(Deno.execPath(), {
                args: [
                    'run',
                    '--allow-all',
                    '--no-check',
                    '--inspect=0.0.0.0:9229',
                    `https://raw.githubusercontent.com/GreenAntTech/JSphere/${version}/server.js`
                ],
                stdin: 'piped'
            });
        } else {
            command = new Deno.Command(Deno.execPath(), {
                args: [
                    'run',
                    '--allow-all',
                    '--no-check',
                    '--reload',
                    '--inspect=0.0.0.0:9229',
                    `https://raw.githubusercontent.com/GreenAntTech/JSphere/${version}/server.js`
                ],
                stdin: 'piped'
            });
        }
        const child = command.spawn();
        child.stdin.close();
        await child.status;
    } catch (e) {
        critical(e.message);
    }
}
async function processBuildCmd(cmdArgs) {
    try {
        const projectName = Deno.cwd().replaceAll('\\', '/').split('/').pop();
        const version = cmdArgs.v || 'latest';
        const noCache = typeof cmdArgs['no-cache'] !== 'undefined' ? '--no-cache' : '';
        info(`docker build ${noCache} --pull --rm -f DockerFile -t ${projectName.toLowerCase()}:${version} .`);
        let command;
        if (typeof cmdArgs['no-cache'] == 'undefined') {
            command = new Deno.Command('docker', {
                args: [
                    'build',
                    '--pull',
                    '--rm',
                    '-f',
                    'DockerFile',
                    '-t',
                    `${projectName.toLowerCase()}:${version}`,
                    '.'
                ],
                stdin: 'piped'
            });
        } else {
            command = new Deno.Command('docker', {
                args: [
                    'build',
                    '--no-cache',
                    '--pull',
                    '--rm',
                    '-f',
                    'DockerFile',
                    '-t',
                    `${projectName.toLowerCase()}:${version}`,
                    '.'
                ],
                stdin: 'piped'
            });
        }
        const child = command.spawn();
        child.stdin.close();
        await child.status;
    } catch (e) {
        critical(e.message);
    }
}
async function processRunCmd(cmdArgs) {
    try {
        const projectName = Deno.cwd().replaceAll('\\', '/').split('/').pop();
        const version = cmdArgs.v || 'latest';
        const http = cmdArgs.http || '80';
        const debug = cmdArgs.debug || '9229';
        info(`docker run --rm -it --mount type=bind,source=${Deno.cwd().replaceAll('\\', '/')}/,target=/${projectName} -p ${http}:80/tcp -p ${debug}:9229/tcp ${projectName.toLowerCase()}:${version}`);
        const command = new Deno.Command('docker', {
            args: [
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
            ],
            stdin: 'piped'
        });
        const child = command.spawn();
        child.stdin.close();
        await child.status;
    } catch (e) {
        critical(e.message);
    }
}
async function processCheckoutCmd(cmdArgs) {
    try {
        const env = await load({
            envPath: `${Deno.cwd()}/.env`
        });
        let repo = env.REMOTE_CONFIG;
        const provider = env.REMOTE_HOST;
        const owner = env.REMOTE_ROOT;
        const accessToken = env.REMOTE_AUTH;
        const checkout = cmdArgs._[1].toString();
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
    } catch (e) {
        critical(e.message);
    }
}
async function processCreateCmd(cmdArgs) {
    switch(cmdArgs._[1]){
        case 'package':
            await processCreatePackageCmd(cmdArgs);
            break;
        case 'project':
            await processCreateProjectCmd(cmdArgs);
            break;
        default:
            error(`Missing 'project' or 'package' after create command.`);
    }
}
async function processCreatePackageCmd(cmdArgs) {
    try {
        const packageName = cmdArgs._[2];
        if (packageName) {
            await Deno.mkdir(`${Deno.cwd()}/${packageName}/client`, {
                recursive: true
            });
            await Deno.mkdir(`${Deno.cwd()}/${packageName}/server`, {
                recursive: true
            });
            await Deno.mkdir(`${Deno.cwd()}/${packageName}/shared`, {
                recursive: true
            });
            await Deno.mkdir(`${Deno.cwd()}/${packageName}/tests`, {
                recursive: true
            });
            if (cmdArgs['git-init']) await initRepo(`${Deno.cwd()}/${packageName}`);
        } else error(`Please provide a package name.`);
    } catch (e) {
        critical(e.message);
    }
}
async function processCreateProjectCmd(cmdArgs) {
    try {
        const projectName = cmdArgs._[2];
        if (projectName) {
            await Deno.mkdir(`${Deno.cwd()}/${projectName}`, {
                recursive: true
            });
            const envSettings = {
                useLocalConfig: 'true',
                localRoot: projectName,
                localConfig: '.jsphere'
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
            await Deno.writeFile(`${Deno.cwd()}/${projectName}/app/server/datetime.ts`, (new TextEncoder).encode(getServerDateTimeContent()));
            if (cmdArgs['git-init']) {
                await initRepo(`${Deno.cwd()}/${projectName}/${envSettings.localConfig}`);
                await initRepo(`${Deno.cwd()}/${projectName}/app`);
            }
        } else error(`Please provide a project name.`);
    } catch (e) {
        critical(e.message);
    }
}
async function processDecryptCmd(cmdArgs) {
    try {
        const domain = cmdArgs._[1];
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
    } catch (e) {
        critical(e.message);
    }
}
async function processEncryptCmd(cmdArgs) {
    try {
        const domain = cmdArgs._[1];
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
    } catch (e) {
        critical(e.message);
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
    } catch (e) {
        critical(e.message);
    }
}
async function processResetCmd(cmdArgs) {
    try {
        const domain = cmdArgs._[1];
        const token = cmdArgs._[2];
        if (domain) {
            const response = await fetch(`${domain}/~/resetdomain`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`
                }
            });
            const result = await response.text();
            info(result);
        } else {
            error(`Please provide a domain.`);
        }
    } catch (e) {
        critical(e.message);
    }
}
function processVersionCmd() {
    console.log(VERSION);
}
async function cloneRepo(config) {
    let command;
    const path = `${Deno.cwd()}/${config.repo}`;
    if (config.accessToken) {
        command = new Deno.Command('git', {
            args: [
                'clone',
                `https://${config.owner}:${config.accessToken}@github.com/${config.owner}/${config.repo}.git`,
                path
            ],
            stdin: 'piped'
        });
    } else {
        command = new Deno.Command('git', {
            args: [
                'clone',
                `https://github.com/${config.owner}/${config.repo}.git`,
                path
            ],
            stdin: 'piped'
        });
    }
    const child = command.spawn();
    child.stdin.close();
    await child.status;
}
async function initRepo(path) {
    const command = new Deno.Command('git', {
        args: [
            'init',
            path,
            '-b',
            'main'
        ],
        stdin: 'piped'
    });
    const child = command.spawn();
    child.stdin.close();
    await child.status;
}
function getEnvContent(envSettings) {
    const content = `CONFIG=LOCAL_CONFIG
LOCAL_CONFIG=${envSettings.localConfig || ''}
REMOTE_CONFIG=${envSettings.remoteConfig || ''}
REMOTE_HOST=${envSettings.remoteHost || ''}
REMOTE_ROOT=${envSettings.remoteRoot || ''}
REMOTE_AUTH=${envSettings.remoteAuth || ''}
SERVER_HTTP_PORT=80
AUTHORIZATION_TOKEN=
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
        { "route": "/", "path": "/app/client/index.html" },
        { "route": "/api/datetime", "path": "/app/server/datetime.ts" }
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
        <script type="module">
            const response = await fetch('/api/datetime', {
                method:'GET',
            });
            const obj = await response.json();
            document.getElementById('datetime').innerHTML = obj.datetime;
        </script>
    </head>
    <body style="height:100%; width:100%; background-color:#ffffff; overflow: hidden;">
        <div style="text-align: center; margin-top: 10%;">
            <svg width="293px" height="217px" viewBox="0 0 293 217" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><defs><path d="M0 0L293 0L293 217L0 217L0 0Z" id="path_1"/><clipPath id="clip_1"><use xlink:href="#path_1"/></clipPath></defs><g id="Frame" clip-path="url(#clip_1)"><path d="M0 0L293 0L293 217L0 217L0 0Z" id="Frame" fill="#FFFFFF" fill-rule="evenodd" stroke="none"/><g id="Group-11" transform="translate(98 22.018188)"><path d="M43.4776 19.2088C45.6895 15.6026 52.1413 15.211 57.8882 18.334C63.635 21.457 66.5005 26.9121 64.2886 30.5183C62.0767 34.1244 55.6249 34.5161 49.878 31.3931C44.1313 28.2701 41.2657 22.815 43.4776 19.2088Z" id="Oval-3" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M61.2535 36.9294C64.2882 34.3575 69.8864 35.553 73.7573 39.5996C77.6284 43.6462 78.3063 49.0117 75.2715 51.5836C72.2368 54.1556 66.6387 52.9601 62.7677 48.9135C58.8967 44.8668 58.2187 39.5014 61.2535 36.9294Z" id="Oval-7" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M35.9937 9.42038C36.5677 7.07961 40.1244 5.85379 43.9375 6.68242C47.7506 7.51103 50.3764 10.0803 49.8023 12.4211C49.2281 14.7619 45.6716 15.9877 41.8583 15.159C38.0452 14.3304 35.4195 11.7611 35.9937 9.42038Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M0.211765 38.6725C-0.719297 36.2645 1.50703 33.2912 5.18443 32.0313C8.86183 30.7715 12.5978 31.7022 13.529 34.1101C14.4601 36.5181 12.2338 39.4914 8.55638 40.7513C4.87883 42.0111 1.14297 41.0804 0.211765 38.6725Z" id="Oval-8" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M55.7677 10.6914C56.84 8.87038 60.3634 8.77895 63.6374 10.4871C66.9114 12.1953 68.6961 15.0563 67.6237 16.8772C66.5514 18.6982 63.0279 18.7897 59.7539 17.0815C56.4799 15.3733 54.6952 12.5123 55.7677 10.6914Z" id="Oval-5" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M68.013 23.7147C69.6304 21.4576 73.8005 21.4428 77.3271 23.6817C80.8536 25.9207 82.4011 29.5655 80.7836 31.8226C79.1662 34.0798 74.9961 34.0946 71.4695 31.8557C67.9431 29.6167 66.3955 25.9719 68.013 23.7147Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M84.8167 25.3776C85.9988 24.2256 88.7429 24.915 90.946 26.9176C93.1492 28.9202 93.977 31.4775 92.7951 32.6295C91.6131 33.7816 88.8689 33.0922 86.6658 31.0896C84.4627 29.087 83.6348 26.5297 84.8167 25.3776Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M75.4728 15.1072C76.0138 14.2923 77.8559 14.4573 79.5875 15.4757C81.3191 16.4942 82.2842 17.9804 81.7432 18.7953C81.2022 19.6102 79.36 19.4452 77.6285 18.4268C75.8969 17.4084 74.9318 15.9221 75.4728 15.1072Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M62.6268 6.48073C63.348 5.39418 65.4535 5.40776 67.3294 6.51107C69.2052 7.61437 70.1411 9.3896 69.4197 10.4762C68.6984 11.5627 66.5931 11.5492 64.7171 10.4459C62.8413 9.34254 61.9054 7.5673 62.6268 6.48073Z" id="Oval-10" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M32.8563 1.67049C33.4103 0.156185 35.8156 -0.437362 38.2287 0.344772C40.642 1.12689 42.1492 2.9885 41.5952 4.5028C41.0413 6.0171 38.636 6.61066 36.2227 5.82854C33.8096 5.0464 32.3024 3.18478 32.8563 1.67049Z" id="Oval-12" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M18.1061 6.093C18.3456 4.66933 20.4471 3.79959 22.8001 4.15033C25.1528 4.5011 26.8659 5.93953 26.6264 7.3632C26.3867 8.78686 24.2854 9.65661 21.9324 9.30584C19.5797 8.95509 17.8666 7.51666 18.1061 6.093Z" id="Oval-13" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M49.0443 2.45944C49.4757 1.58854 51.0756 1.43123 52.6177 2.10807C54.1598 2.78491 55.0602 4.03962 54.6287 4.91051C54.1973 5.78141 52.5974 5.93871 51.0553 5.26187C49.5132 4.58502 48.6128 3.33034 49.0443 2.45944Z" id="Oval-11" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M88.3712 41.9136C89.6477 40.6251 92.5992 41.263 94.9636 43.3383C97.3279 45.4136 98.2098 48.1404 96.9333 49.4288C95.6569 50.7172 92.7055 50.0794 90.3412 48.0041C87.9768 45.9288 87.0948 43.202 88.3712 41.9136Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M81.6574 60.0666C84.7202 58.3344 89.1212 59.9349 91.4875 63.6415C93.8536 67.348 93.2888 71.757 90.226 73.4892C87.1632 75.2214 82.7621 73.6209 80.3961 69.9144C78.0299 66.2078 78.5946 61.7988 81.6574 60.0666Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M55.8466 64.4235C59.5535 63.9332 63.0768 67.007 63.7162 71.2891C64.3557 75.5712 61.8688 79.4401 58.162 79.9304C54.4551 80.4208 50.9318 77.347 50.2924 73.0649C49.6531 68.7828 52.1398 64.9139 55.8466 64.4235Z" id="Oval-6" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M33.0787 33.7053C37.3585 30.2652 43.6137 31.4035 47.0503 36.2478C50.4868 41.092 49.8033 47.8078 45.5238 51.2479C41.2442 54.688 34.9889 53.5496 31.5523 48.7054C28.1159 43.8612 28.7991 37.1454 33.0787 33.7053Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M29.5813 15.0506C34.3449 15.1289 38.1581 17.7885 38.0988 20.9912C38.0393 24.1938 34.1299 26.7266 29.3663 26.6483C24.6028 26.57 20.7894 23.9104 20.8489 20.7077C20.9082 17.5051 24.8179 14.9723 29.5813 15.0506Z" id="Oval-9" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M15.7596 59.9798C17.9716 56.3737 23.1095 55.268 27.2354 57.5101C31.3613 59.7523 32.9128 64.4933 30.7009 68.0995C28.4889 71.7057 23.351 72.8114 19.2251 70.5692C15.0992 68.327 13.5477 63.586 15.7596 59.9798Z" id="Oval-3" fill="#4B4982" fill-rule="evenodd" stroke="none"/><path d="M2.72475 18.8804C2.27024 16.6794 5.15139 14.3006 9.15995 13.5672C13.1685 12.8338 16.7866 14.0235 17.2411 16.2245C17.6956 18.4255 14.8145 20.8043 10.8059 21.5377C6.79734 22.2711 3.17927 21.0814 2.72475 18.8804Z" id="Oval-2" fill="#4B4982" fill-rule="evenodd" stroke="none"/></g><g fill="#686868" stroke="none" id="JSphere" transform="translate(46 102)"><path d="M96.4 45.325Q95.075 45.325 95.075 44L95.075 11.95Q95.075 10.65 96.4 10.65Q97.7 10.65 97.7 11.95L97.7 25.4Q100.075 21.7 106.3 21.7L107.7 21.7Q112.375 21.7 114.537 23.8625Q116.7 26.025 116.7 30.7L116.7 44Q116.7 45.325 115.4 45.325Q114.737 45.325 114.406 44.9937Q114.075 44.6625 114.075 44L114.075 30.7Q114.075 27.125 112.662 25.725Q111.25 24.325 107.7 24.325L106.3 24.325Q102.425 24.325 100.2 25.55Q97.975 26.775 97.7 29.375L97.7 44Q97.7 45.325 96.4 45.325ZM10.6 45.325Q6 45.325 3.7625 43.4Q1.525 41.475 1.25 37.275Q1.2 36.625 1.525 36.2625Q1.85 35.9 2.525 35.9Q3.775 35.9 3.875 37.225Q4.075 40.325 5.5875 41.5125Q7.1 42.7 10.6 42.7L12.65 42.7Q15.225 42.7 16.7 42.075Q18.175 41.45 18.8125 39.9625Q19.45 38.475 19.45 35.9L19.45 14.425Q19.45 13.1 20.75 13.1Q22.075 13.1 22.075 14.425L22.075 35.9Q22.075 40.85 19.8375 43.0875Q17.6 45.325 12.65 45.325L10.6 45.325ZM39.45 45.275C36.4667 45.275 34.2542 44.6125 32.8125 43.2875Q30.65 41.3 30.5 37.025Q30.475 36.425 30.8375 36.0625Q31.2 35.7 31.8 35.7Q32.4 35.7 32.75 36.05Q33.1 36.4 33.15 37Q33.25 40.15 34.65 41.4Q36.05 42.65 39.45 42.65L46.65 42.65Q50.2 42.65 51.5875 41.2625Q52.975 39.875 52.975 36.375Q52.975 32.825 51.5875 31.4375Q50.2 30.05 46.65 30.05L39.8 30.05Q35.4 30.05 33.35 28Q31.3 25.95 31.3 21.575Q31.3 17.2 33.3375 15.15Q35.375 13.1 39.75 13.1L46.75 13.1Q50.95 13.1 52.9875 14.975Q55.025 16.85 55.175 20.875Q55.225 21.475 54.8625 21.8375Q54.5 22.2 53.875 22.2Q53.3 22.2 52.95 21.85Q52.6 21.5 52.55 20.9Q52.45 18.025 51.15 16.875Q49.85 15.725 46.75 15.725L39.75 15.725Q36.475 15.725 35.2 17.0125Q33.925 18.3 33.925 21.575Q33.925 24.85 35.2125 26.1375Q36.5 27.425 39.8 27.425L46.65 27.425Q51.3 27.425 53.45 29.5875Q55.6 31.75 55.6 36.375Q55.6 41 53.45 43.1375C52.0167 44.5625 49.75 45.275 46.65 45.275L39.45 45.275ZM127.55 36.35L127.55 34.525L145.75 34.525Q147.05 34.525 147.05 33.2L147.05 30.7Q147.05 26.025 144.887 23.8625Q142.725 21.7 138.05 21.7L133.95 21.7Q129.275 21.65 127.1 23.8125Q124.925 25.975 124.925 30.7L124.925 36.35Q124.925 41 127.1 43.1625Q129.275 45.325 133.95 45.325L138.05 45.325C140.85 45.325 142.983 44.825 144.45 43.825Q146.65 42.325 146.975 39.175Q147.05 38.525 146.712 38.1625Q146.375 37.8 145.725 37.8Q145.075 37.8 144.762 38.125Q144.45 38.45 144.35 39.075Q144.075 41.075 142.637 41.8875Q141.2 42.7 138.05 42.7L133.95 42.7Q130.375 42.7 128.962 41.2875Q127.55 39.875 127.55 36.35ZM176.525 36.35L176.525 34.525L194.725 34.525Q196.025 34.525 196.025 33.2L196.025 30.7Q196.025 26.025 193.862 23.8625Q191.7 21.7 187.025 21.7L182.925 21.7Q178.25 21.65 176.075 23.8125Q173.9 25.975 173.9 30.7L173.9 36.35Q173.9 41 176.075 43.1625Q178.25 45.325 182.925 45.325L187.025 45.325Q191.225 45.325 193.425 43.825Q195.625 42.325 195.95 39.175Q196.025 38.525 195.688 38.1625Q195.35 37.8 194.7 37.8Q194.05 37.8 193.737 38.125Q193.425 38.45 193.325 39.075Q193.05 41.075 191.612 41.8875Q190.175 42.7 187.025 42.7L182.925 42.7Q179.35 42.7 177.938 41.2875Q176.525 39.875 176.525 36.35ZM64.275 54Q64.275 55.325 65.6 55.325Q66.9 55.325 66.9 54L66.9 45.325L77.4 45.325Q82.075 45.325 84.2375 43.15Q86.4 40.975 86.4 36.3L86.4 30.7Q86.4 26.025 84.2375 23.8625Q82.075 21.7 77.4 21.7L75.5 21.7Q72.225 21.7 70.125 22.5875Q68.025 23.475 66.9 25.225L66.9 23Q66.9 21.7 65.6 21.7Q64.275 21.7 64.275 23L64.275 54ZM157.05 45.325Q155.725 45.325 155.725 44L155.725 23Q155.725 21.7 157.05 21.7Q158.35 21.7 158.35 23L158.35 26.85Q159.65 24.35 162.112 23.025Q164.575 21.7 167.95 21.7Q169.275 21.7 169.275 23Q169.275 24.325 167.95 24.325Q163.5 24.325 161.05 26.3375Q158.6 28.35 158.35 32.075L158.35 44Q158.35 45.325 157.05 45.325ZM128.962 25.6875Q130.375 24.275 133.95 24.325L138.05 24.325Q141.625 24.325 143.025 25.725Q144.425 27.125 144.425 30.7L144.425 31.9L127.55 31.9L127.55 30.7Q127.55 27.1 128.962 25.6875ZM177.938 25.6875Q179.35 24.275 182.925 24.325L187.025 24.325Q190.6 24.325 192 25.725Q193.4 27.125 193.4 30.7L193.4 31.9L176.525 31.9L176.525 30.7Q176.525 27.1 177.938 25.6875ZM77.4 42.7L66.9 42.7L66.9 29.425Q67.225 26.825 69.3625 25.575Q71.5 24.325 75.5 24.325L77.4 24.325Q80.975 24.325 82.375 25.725Q83.775 27.125 83.775 30.7L83.775 36.3Q83.775 39.875 82.375 41.2875Q80.975 42.7 77.4 42.7Z"/></g><g stroke="#808080" stroke-width="1" id="WEB-APPLICATION-SERVER" fill="#686868" transform="translate(54.000122 161)"><path d="M2.472 10.552Q2.55 10.798 2.778 10.798Q2.916 10.798 3.006 10.75Q3.096 10.702 3.138 10.552L5.109 4.21952L7.08 10.552Q7.152 10.798 7.41 10.798L7.434 10.798Q7.686 10.798 7.764 10.552L10.068 3.484Q10.116 3.34 10.041 3.202Q9.966 3.064 9.762 3.064Q9.66 3.064 9.585 3.121Q9.51 3.178 9.468 3.292L7.42127 9.58168L5.484 3.31Q5.454 3.178 5.346 3.118Q5.238 3.058 5.118 3.058Q5.004 3.058 4.899 3.118Q4.794 3.178 4.752 3.31L2.81473 9.58168L0.768 3.292Q0.738 3.178 0.657 3.121Q0.576 3.064 0.474 3.064Q0.294 3.064 0.21 3.205Q0.126 3.346 0.174 3.484L2.472 10.552ZM69.476 10.714C69.532 10.77 69.61 10.798 69.71 10.798C69.806 10.798 69.882 10.77 69.938 10.714Q70.022 10.63 70.022 10.48L70.022 3.376Q70.022 3.226 69.938 3.142Q69.854 3.058 69.71 3.058Q69.56 3.058 69.476 3.142Q69.392 3.226 69.392 3.376L69.392 10.48Q69.392 10.63 69.476 10.714ZM95.912 10.804Q95.768 10.804 95.681 10.72Q95.594 10.636 95.594 10.492L95.594 3.688L93.044 3.688Q92.9 3.688 92.813 3.604Q92.726 3.52 92.726 3.376Q92.726 3.232 92.813 3.145Q92.9 3.058 93.044 3.058L98.78 3.058Q98.924 3.058 99.008 3.145Q99.092 3.232 99.092 3.376Q99.092 3.52 99.008 3.604Q98.924 3.688 98.78 3.688L96.224 3.688L96.224 10.492Q96.224 10.63 96.137 10.717Q96.05 10.804 95.912 10.804ZM102.52 10.714C102.576 10.77 102.654 10.798 102.754 10.798C102.85 10.798 102.926 10.77 102.982 10.714Q103.066 10.63 103.066 10.48L103.066 3.376Q103.066 3.226 102.982 3.142Q102.898 3.058 102.754 3.058Q102.604 3.058 102.52 3.142Q102.436 3.226 102.436 3.376L102.436 10.48Q102.436 10.63 102.52 10.714ZM109.65 10.798C108.782 10.798 108.148 10.598 107.748 10.198Q107.148 9.598 107.148 8.296L107.148 5.56Q107.148 4.246 107.748 3.649Q108.348 3.052 109.638 3.064L111.09 3.064Q112.392 3.064 112.989 3.664Q113.586 4.264 113.586 5.566L113.586 8.296Q113.586 9.598 112.989 10.198C112.591 10.598 111.958 10.798 111.09 10.798L109.65 10.798ZM13.376 10.48Q13.376 10.798 13.694 10.798L18.188 10.798Q18.506 10.798 18.506 10.48Q18.506 10.168 18.188 10.168L14.006 10.168L14.006 7.198L16.772 7.198Q17.09 7.198 17.09 6.88Q17.09 6.568 16.772 6.568L14.006 6.568L14.006 3.694L18.188 3.694Q18.35 3.694 18.4295 3.613Q18.506 3.53503 18.506 3.382Q18.506 3.064 18.188 3.064L13.694 3.064Q13.376 3.064 13.376 3.382L13.376 10.48ZM22.426 10.798Q22.108 10.798 22.108 10.48L22.108 3.382Q22.108 3.064 22.426 3.064L25.558 3.064Q26.44 3.064 26.893 3.511Q27.346 3.958 27.346 4.822L27.346 5.146Q27.346 6.088 26.74 6.478Q27.79 6.91 27.79 8.35L27.79 8.728Q27.79 9.748 27.265 10.273Q26.74 10.798 25.714 10.798L22.426 10.798ZM33.786 10.348Q33.672 10.642 33.96 10.768Q34.254 10.888 34.374 10.6L35.172 8.71L39.102 8.71L39.9 10.6Q39.9556 10.7405 40.054 10.7839Q40.1574 10.8295 40.308 10.768Q40.596 10.642 40.476 10.348L37.5 3.31Q37.398 3.07 37.152 3.064L37.116 3.064Q36.858 3.064 36.762 3.31L33.786 10.348ZM44.258 10.798Q43.94 10.798 43.94 10.48L43.94 3.382Q43.94 3.064 44.258 3.064L47.066 3.064Q48.092 3.064 48.617 3.592Q49.142 4.12 49.142 5.146L49.142 5.506Q49.142 6.526 48.617 7.054Q48.092 7.582 47.066 7.582L44.57 7.582L44.57 10.48Q44.57 10.798 44.258 10.798ZM52.666 10.48Q52.666 10.798 52.984 10.798Q53.296 10.798 53.296 10.48L53.296 7.582L55.792 7.582Q56.818 7.582 57.343 7.054Q57.868 6.526 57.868 5.506L57.868 5.146Q57.868 4.12 57.343 3.592Q56.818 3.064 55.792 3.064L52.984 3.064Q52.666 3.064 52.666 3.382L52.666 10.48ZM61.71 10.798Q61.392 10.798 61.392 10.48L61.392 3.382Q61.392 3.064 61.71 3.064Q62.022 3.064 62.022 3.382L62.022 10.168L65.67 10.168Q65.988 10.168 65.988 10.48Q65.988 10.798 65.67 10.798L61.71 10.798ZM76.606 10.798C75.738 10.798 75.104 10.598 74.704 10.198Q74.104 9.598 74.104 8.296L74.104 5.566Q74.104 4.252 74.701 3.658Q75.298 3.064 76.594 3.064L78.046 3.064Q79.15 3.064 79.69 3.523Q80.23 3.982 80.284 4.996Q80.302 5.158 80.221 5.242Q80.14 5.326 79.984 5.326Q79.684 5.326 79.654 5.008Q79.612 4.264 79.246 3.979Q78.88 3.694 78.046 3.694L76.594 3.694Q75.904 3.694 75.496 3.871Q75.088 4.048 74.911 4.459Q74.734 4.87 74.734 5.566L74.734 8.296Q74.734 8.992 74.914 9.4Q75.094 9.808 75.502 9.988Q75.91 10.168 76.606 10.168L78.046 10.168Q78.88 10.168 79.246 9.883Q79.612 9.598 79.654 8.854Q79.684 8.536 79.984 8.536Q80.14 8.536 80.221 8.623Q80.302 8.71 80.284 8.866Q80.23 9.88 79.69 10.339Q79.15 10.798 78.046 10.798L76.606 10.798ZM86.448 3.31L83.472 10.348Q83.358 10.642 83.646 10.768Q83.94 10.888 84.06 10.6L84.858 8.71L88.788 8.71L89.586 10.6Q89.6416 10.7405 89.74 10.7839Q89.8434 10.8295 89.994 10.768Q90.282 10.642 90.162 10.348L87.186 3.31Q87.084 3.07 86.838 3.064L86.802 3.064Q86.544 3.064 86.448 3.31ZM117.668 10.48Q117.668 10.798 117.986 10.798Q118.298 10.798 118.298 10.48L118.298 4.26875L123.242 10.612C123.342 10.736 123.45 10.798 123.566 10.798Q123.878 10.798 123.878 10.48L123.878 3.382Q123.878 3.064 123.566 3.064Q123.248 3.064 123.248 3.382L123.248 9.59303L118.31 3.25Q118.154 3.064 117.986 3.064Q117.668 3.064 117.668 3.382L117.668 10.48ZM133.12 10.786C132.404 10.786 131.873 10.627 131.527 10.309Q131.008 9.832 130.972 8.806Q130.966 8.662 131.053 8.575Q131.14 8.488 131.284 8.488Q131.428 8.488 131.512 8.572Q131.596 8.656 131.608 8.8Q131.632 9.556 131.968 9.856Q132.304 10.156 133.12 10.156L134.848 10.156Q135.7 10.156 136.033 9.823Q136.366 9.49 136.366 8.65Q136.366 7.798 136.033 7.465Q135.7 7.132 134.848 7.132L133.204 7.132Q132.148 7.132 131.656 6.64Q131.164 6.148 131.164 5.098Q131.164 4.048 131.653 3.556Q132.142 3.064 133.192 3.064L134.872 3.064Q135.88 3.064 136.369 3.514Q136.858 3.964 136.894 4.93Q136.906 5.074 136.819 5.161Q136.732 5.248 136.582 5.248Q136.444 5.248 136.36 5.164Q136.276 5.08 136.264 4.936Q136.24 4.246 135.928 3.97Q135.616 3.694 134.872 3.694L133.192 3.694Q132.406 3.694 132.1 4.003Q131.794 4.312 131.794 5.098Q131.794 5.884 132.103 6.193Q132.412 6.502 133.204 6.502L134.848 6.502Q135.964 6.502 136.48 7.021Q136.996 7.54 136.996 8.65Q136.996 9.76 136.48 10.273C136.136 10.615 135.592 10.786 134.848 10.786L133.12 10.786ZM141.078 10.48Q141.078 10.798 141.396 10.798L145.89 10.798Q146.208 10.798 146.208 10.48Q146.208 10.168 145.89 10.168L141.708 10.168L141.708 7.198L144.474 7.198Q144.792 7.198 144.792 6.88Q144.792 6.568 144.474 6.568L141.708 6.568L141.708 3.694L145.89 3.694Q146.052 3.694 146.131 3.61301Q146.208 3.53503 146.208 3.382Q146.208 3.064 145.89 3.064L141.396 3.064Q141.078 3.064 141.078 3.382L141.078 10.48ZM155.042 10.81Q154.91 10.888 154.802 10.864Q154.694 10.84 154.61 10.714L152.642 7.582L150.44 7.582L150.44 10.48Q150.44 10.798 150.128 10.798Q149.81 10.798 149.81 10.48L149.81 3.382Q149.81 3.064 150.128 3.064L152.936 3.064Q153.962 3.064 154.487 3.592Q155.012 4.12 155.012 5.146L155.012 5.506Q155.012 6.412 154.598 6.928Q154.184 7.444 153.374 7.558L155.144 10.378Q155.231 10.5208 155.201 10.6315Q155.172 10.7347 155.042 10.81ZM168.546 10.798Q168.228 10.798 168.228 10.48L168.228 3.382Q168.228 3.064 168.546 3.064L173.04 3.064Q173.358 3.064 173.358 3.382Q173.358 3.53503 173.281 3.61301Q173.202 3.694 173.04 3.694L168.858 3.694L168.858 6.568L171.624 6.568Q171.942 6.568 171.942 6.88Q171.942 7.198 171.624 7.198L168.858 7.198L168.858 10.168L173.04 10.168Q173.358 10.168 173.358 10.48Q173.358 10.798 173.04 10.798L168.546 10.798ZM181.952 10.864Q182.06 10.888 182.192 10.81Q182.322 10.7347 182.351 10.6315Q182.381 10.5208 182.294 10.378L180.524 7.558Q181.334 7.444 181.748 6.928Q182.162 6.412 182.162 5.506L182.162 5.146Q182.162 4.12 181.637 3.592Q181.112 3.064 180.086 3.064L177.278 3.064Q176.96 3.064 176.96 3.382L176.96 10.48Q176.96 10.798 177.278 10.798Q177.59 10.798 177.59 10.48L177.59 7.582L179.792 7.582L181.76 10.714Q181.844 10.84 181.952 10.864ZM161.116 10.582C161.176 10.726 161.274 10.798 161.41 10.798L161.476 10.798C161.62 10.798 161.722 10.726 161.782 10.582L164.908 3.514Q164.98 3.34 164.908 3.226Q164.836 3.112 164.68 3.082Q164.428 3.022 164.332 3.262L161.461 9.81349L158.572 3.262Q158.476 3.022 158.23 3.082Q158.086 3.112 158.005 3.226Q157.924 3.34 158.002 3.514L161.116 10.582ZM109.65 10.168L111.09 10.168Q111.78 10.168 112.188 9.988Q112.596 9.808 112.776 9.4Q112.956 8.992 112.956 8.296L112.956 5.566Q112.956 4.876 112.776 4.468Q112.596 4.06 112.188 3.877Q111.78 3.694 111.09 3.694L109.638 3.694Q108.948 3.688 108.543 3.865Q108.138 4.042 107.958 4.453Q107.778 4.864 107.778 5.56L107.778 8.296Q107.778 8.992 107.958 9.4Q108.138 9.808 108.546 9.988Q108.954 10.168 109.65 10.168ZM22.738 6.292L25.648 6.292Q26.194 6.292 26.455 6.013Q26.716 5.734 26.716 5.146L26.716 4.822Q26.716 4.222 26.443 3.958Q26.17 3.694 25.558 3.694L22.738 3.694L22.738 6.292ZM44.57 6.952L47.066 6.952Q47.822 6.952 48.167 6.607Q48.512 6.262 48.512 5.506L48.512 5.146Q48.512 4.384 48.167 4.039Q47.822 3.694 47.066 3.694L44.57 3.694L44.57 6.952ZM55.792 6.952L53.296 6.952L53.296 3.694L55.792 3.694Q56.548 3.694 56.893 4.039Q57.238 4.384 57.238 5.146L57.238 5.506Q57.238 6.262 56.893 6.607Q56.548 6.952 55.792 6.952ZM150.44 6.952L152.936 6.952Q153.692 6.952 154.037 6.607Q154.382 6.262 154.382 5.506L154.382 5.146Q154.382 4.384 154.037 4.039Q153.692 3.694 152.936 3.694L150.44 3.694L150.44 6.952ZM180.086 6.952L177.59 6.952L177.59 3.694L180.086 3.694Q180.842 3.694 181.187 4.039Q181.532 4.384 181.532 5.146L181.532 5.506Q181.532 6.262 181.187 6.607Q180.842 6.952 180.086 6.952ZM38.838 8.08L35.43 8.08L37.134 4.06L38.838 8.08ZM88.524 8.08L85.116 8.08L86.82 4.06L88.524 8.08ZM22.738 10.168L25.714 10.168Q26.476 10.168 26.818 9.826Q27.16 9.484 27.16 8.728L27.16 8.35Q27.16 7.594 26.821 7.258Q26.482 6.922 25.714 6.922L22.738 6.922L22.738 10.168Z"/></g></g></svg>
            <div id="datetime" style="font-family: monospace; color: #686868; font-weight: bold;"></div>
        </div>
    </body>
</html>
`;
    return content;
}
function getServerDateTimeContent() {
    const content = `import type { ServerContext } from "https://raw.githubusercontent.com/GreenAntTech/JSphere/${VERSION}/server.type.ts";

export function onGET (ctx:ServerContext) : Response {
    const date = new Date();
    return ctx.response.json({ datetime: date.toLocaleString() });
}    
`;
    return content;
}
function getDockerFileContent(projectName) {
    const content = `FROM --platform=linux/amd64 ubuntu
FROM denoland/deno:ubuntu
WORKDIR /JSphereProject
RUN deno cache https://raw.githubusercontent.com/GreenAntTech/JSphere/${VERSION}/server.js
EXPOSE 80
EXPOSE 9229
ENTRYPOINT ["deno", "run", "--allow-all", "--inspect=0.0.0.0:9229", "--no-check", "https://raw.githubusercontent.com/GreenAntTech/JSphere/${VERSION}/server.js"]
`;
    return content;
}

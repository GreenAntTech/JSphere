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
const { Deno: Deno1 } = globalThis;
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
        const { key, interpolated, notInterpolated, unquoted } = match?.groups;
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
async function load({ envPath = ".env", examplePath = ".env.example", defaultsPath = ".env.defaults", export: _export = false, allowEmptyValues = false, restrictEnvAccessTo = [] } = {}) {
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
            const { inBrackets, inBracketsDefault, notInBrackets, notInBracketsDefault } = params[params.length - 1];
            const expandValue = inBrackets || notInBrackets;
            const defaultValue = inBracketsDefault || notInBracketsDefault;
            return variablesMap[expandValue] || expand(defaultValue, variablesMap);
        }), variablesMap);
    } else {
        return str;
    }
}
const { hasOwn } = Object;
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
function parse1(args, { "--": doubleDash = false, alias = {}, boolean: __boolean = false, default: defaults = {}, stopEarly = false, string = [], collect = [], negatable = [], unknown = (i)=>i } = {}) {
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
(()=>{
    const { Deno: Deno1 } = globalThis;
    if (typeof Deno1?.build?.os === "string") {
        return Deno1.build.os;
    }
    const { navigator } = globalThis;
    if (navigator?.appVersion?.includes?.("Win")) {
        return "windows";
    }
    return "linux";
})();
Deno.build.os === "windows";
async function exists(path, options) {
    try {
        const stat = await Deno.stat(path);
        if (options && (options.isReadable || options.isDirectory || options.isFile)) {
            if (options.isDirectory && options.isFile) {
                throw new TypeError("ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.");
            }
            if (options.isDirectory && !stat.isDirectory || options.isFile && !stat.isFile) {
                return false;
            }
            if (options.isReadable) {
                if (stat.mode === null) {
                    return true;
                }
                if (Deno.uid() === stat.uid) {
                    return (stat.mode & 0o400) === 0o400;
                } else if (Deno.gid() === stat.gid) {
                    return (stat.mode & 0o040) === 0o040;
                }
                return (stat.mode & 0o004) === 0o004;
            }
        }
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }
        if (error instanceof Deno.errors.PermissionDenied) {
            if ((await Deno.permissions.query({
                name: "read",
                path
            })).state === "granted") {
                return !options?.isReadable;
            }
        }
        throw error;
    }
}
Deno.build.os === "windows";
new Deno.errors.AlreadyExists("dest already exists.");
Deno.build.os === "windows";
const LF = "\n";
const CRLF = "\r\n";
Deno?.build.os === "windows" ? CRLF : LF;
const cmdArgs = parse1(Deno.args);
const JSPHERE_VERSION = 'v1.0.0-preview.18';
const DENO_VERSION = '@DENO_VERSION';
(async function() {
    try {
        switch(cmdArgs._[0]){
            case 'build':
                await buildCmd(cmdArgs);
                break;
            case 'create':
                await createCmd(cmdArgs);
                break;
            case 'checkout':
                await checkoutCmd(cmdArgs);
                break;
            case 'copy':
                await copyCmd(cmdArgs);
                break;
            case 'env':
                await envCmd(cmdArgs);
                break;
            case 'git':
                await gitCmd(cmdArgs);
                break;
            case 'remote':
                await serverCmd(cmdArgs);
                break;
            case 'reset':
                await serverCmd(cmdArgs);
                break;
            case 'load':
                await serverCmd(cmdArgs);
                break;
            case 'start':
                startCmd(cmdArgs);
                break;
            case 'version':
                versionCmd();
                break;
            default:
                helpCmd();
        }
    } catch (e) {
        critical(e.message);
    }
})();
function helpCmd() {
    info('build <project_name>/<app_name> [--version=<version>] [--no-cache]');
    info('create <project_name> [--public]    // creates a private project unless the --public flag is set');
    info('create <project_name>/<app_name>/<package_name>    // creates a package in the specified app');
    info('create <project_name>/<app_name>/<package_name>:<alias>    // creates a package in the specified app with the specified alias');
    info('checkout <project_name>    // checks out the specified project\'s config repo');
    info('checkout <project_name>/<app_name>/<package_name>    // checks out the specified package');
    info('copy <project_name>/<app_name> <new_app_name>    // copies the specified app.json and renames the copied file to app-<new_app_name>.json');
    info('load    // reloads the current project hosted on localhost');
    info('load <project_name>    // reloads the specified project hosted on localhost');
    info('load <domain>/<project_name>    // reloads the specified project hosted on the specified domain');
    info('load <domain>:<port_number>/<project_name>    // reloads the specified project hosted on the specified domain and port number');
    info('reset    // resets localhost');
    info('reset <domain>    // resets the specified local domain');
    info('reset <domain>:<port_number>    // resets the specified local domain and port number');
    info('remote https://<hostname>[:<port_number>]/@cmd/<command>[?param1=value1...] <auth_token>    // sends a command to a remote JSphere server');
    info('start [-version=<version>] [--debug=<port_number>] [--reload]    // starts the server with a project specified in the .env file');
    info('start <project_name>[-version=<version>] [--debug=<port_number>] [--reload]    // starts the server with the specified project located in the current workspace');
    info('version    // displays the current version of JSphere');
}
async function buildCmd(cmdArgs) {
    try {
        const path = cmdArgs._[1] ? cmdArgs._[1].split('/') : [];
        const projectName = path[0];
        const appName = path[1];
        const version = cmdArgs.version || 'latest';
        const noCache = typeof cmdArgs['no-cache'] === 'undefined' ? '' : '--no-cache';
        if (projectName && appName) {
            await Deno.writeFile(Deno.cwd() + `/DockerFile`, (new TextEncoder).encode(getDockerFileContent(projectName, appName)));
            info(`docker build ${noCache} --pull --rm -f DockerFile -t ${projectName.toLowerCase()}:${version} .`);
            let command;
            if (noCache) {
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
            await Deno.remove(Deno.cwd() + `/DockerFile`);
        }
    } catch (e) {
        error(e.message);
    }
}
async function createCmd(cmdArgs) {
    const path = cmdArgs._[1] ? cmdArgs._[1].split('/') : [];
    const projectName = path[0];
    const appName = path[1];
    let packageName = path[2];
    let alias;
    if (packageName) {
        const packageParts = packageName.split(':');
        packageName = packageParts[0];
        alias = packageParts[1];
    }
    const type = cmdArgs.public ? 'public' : 'private';
    let result;
    if (projectName && !appName && !packageName) {
        result = await createProject(projectName, type);
    } else if (projectName && appName && packageName) {
        result = await createPackage(projectName, appName, packageName, alias);
    }
    if (result) info(`Create command completed successfully.`);
    else info(`Create command failed.`);
}
async function checkoutCmd(cmdArgs) {
    const path = cmdArgs._[1] ? cmdArgs._[1].split('/') : [];
    const projectName = path[0];
    const appName = path[1];
    const packageName = path[2];
    let result;
    if (!appName && !packageName) {
        result = await checkoutProject(projectName);
    } else if (projectName && appName && packageName) {
        result = await checkoutPackage(projectName, appName, packageName);
    }
    if (result) info(`Checkout command completed successfully.`);
    else info(`Checkout command failed.`);
}
async function copyCmd(cmdArgs) {
    const path = cmdArgs._[1] ? cmdArgs._[1].split('/') : [];
    const projectName = path[0];
    const appName = path[1];
    const newName = cmdArgs._[2];
    if (projectName && appName && newName) {
        await Deno.copyFile(Deno.cwd() + `/${projectName}/.${projectName}/${appName}.json`, Deno.cwd() + `/${projectName}/.${projectName}/${newName}.json`);
    }
}
async function envCmd(_cmdArgs) {
    await Deno.writeFile(Deno.cwd() + '/.env', (new TextEncoder).encode(getDefaultEnvContent()));
}
async function gitCmd(cmdArgs) {
    try {
        const path = cmdArgs._[1] ? cmdArgs._[1].split('/') : [];
        const projectName = path[0];
        const appName = path[1];
        const packageName = path[2];
        let repoPath;
        if (projectName && !appName && !packageName) {
            if (!projectName.startsWith('.')) repoPath = `${projectName}/.${projectName}`;
            else repoPath = `${projectName.substring(1)}/${projectName}`;
        } else if (projectName && appName && packageName) {
            repoPath = cmdArgs._[1];
        } else return;
        if (!await exists(Deno.cwd() + `/${repoPath}/.git`, {
            isDirectory: true
        })) return;
        let exit = false;
        while(!exit){
            const response = prompt(`js:${repoPath}:git>`);
            if (!response) {
                exit = true;
                continue;
            }
            const args = parseCommand(response);
            args.unshift(`--git-dir=${Deno.cwd()}/${repoPath}/.git`);
            args.unshift(`--work-tree=${Deno.cwd()}/${repoPath}`);
            const command = new Deno.Command('git', {
                args,
                stdin: 'piped'
            });
            const child = command.spawn();
            child.stdin.close();
            await child.status;
        }
    } catch (e) {
        error(e.message);
    }
    function parseCommand(input) {
        return input.match(/(?:[^\s"]+|"[^"]*")+/g)?.map((arg)=>arg.replace(/^"|"$/g, '')) || [];
    }
}
async function serverCmd(cmdArgs) {
    try {
        const cmd = cmdArgs._[0];
        if (cmd === 'remote') {
            const response = await fetch(cmdArgs._[1], {
                method: 'GET',
                headers: {
                    'Authorization': `token ${cmdArgs._[2]}`
                }
            });
            if (!response.ok) error(response.statusText);
        } else {
            const parts = cmdArgs._[1] ? cmdArgs._[1].split('/') : [];
            const token = cmdArgs.token;
            let domain = parts[0] || 'localhost';
            let projectName = parts[1];
            if (!domain.startsWith('localhost') && !domain.startsWith('https://')) {
                domain = 'localhost';
                projectName = parts[0];
            }
            if (cmd === 'reset') {
                if (!domain) domain = 'localhost';
                const response = await fetch(`http://${domain}/@cmd/resetdomain`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${token}`
                    }
                });
                if (!response.ok) error(response.statusText);
            } else if (cmd === 'load' && domain) {
                const response = await fetch(`http://${domain}/@cmd/loadproject?projectName=${projectName || ''}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${token}`
                    }
                });
                if (!response.ok) error(response.statusText);
            }
        }
    } catch (e) {
        critical(e.message);
    }
}
async function startCmd(cmdArgs) {
    try {
        const projectName = cmdArgs._[1];
        const version = cmdArgs.version || JSPHERE_VERSION;
        const debugPort = cmdArgs.debug || '9229';
        const args = [];
        args.push('--allow-all');
        args.push('--no-check');
        if (cmdArgs.reload) args.push('--reload');
        if (cmdArgs.debug) args.push(`--inspect=0.0.0.0:${debugPort}`);
        args.push(`https://raw.githubusercontent.com/GreenAntTech/JSphere/${version}/server.js`);
        if (projectName) args.push(projectName);
        const command = new Deno.Command('deno', {
            args,
            stdin: 'piped'
        });
        const child = command.spawn();
        child.stdin.close();
        await child.status;
    } catch (e) {
        error(e.message);
    }
}
function versionCmd() {
    info('JSphere Version: ' + JSPHERE_VERSION);
}
async function createProject(projectName, type) {
    if (await exists(Deno.cwd() + `/${projectName}`, {
        isDirectory: true
    })) {
        error(`A project directory named ${projectName} already exists`);
        return false;
    }
    info('Please provide the following project environment variables:');
    const projectHost = prompt('PROJECT_HOST:', 'GitHub');
    const projectNamespace = prompt('PROJECT_NAMESPACE:');
    const projectAuthToken = prompt('PROJECT_AUTH_TOKEN:');
    info(`Creating project directory ${projectName} ...`);
    await Deno.mkdir(Deno.cwd() + `/${projectName}`, {
        recursive: true
    });
    await Deno.writeFile(Deno.cwd() + `/${projectName}/.env`, (new TextEncoder).encode(getEnvContent(projectHost, projectNamespace, projectAuthToken)));
    if (!projectAuthToken) {
        error(`Could not create the remote repo .${projectName}. The environment variable PROJECT_AUTH_TOKEN did not provide a value.`);
        return false;
    }
    try {
        const projectConfigName = '.' + projectName;
        await createRepo({
            repoName: projectConfigName,
            authToken: projectAuthToken,
            repoType: type
        });
        await cloneRepo({
            repoName: projectConfigName,
            path: Deno.cwd() + `/${projectName}/${projectConfigName}`,
            host: projectHost,
            namespace: projectNamespace,
            authToken: projectAuthToken
        });
        await createRepo({
            repoName: projectName,
            authToken: projectAuthToken,
            repoType: type
        });
        await cloneRepo({
            repoName: projectName,
            path: Deno.cwd() + `/${projectName}/app/${projectName}`,
            provider: projectHost,
            namespace: projectNamespace,
            authToken: projectAuthToken
        });
        await Deno.writeFile(Deno.cwd() + `/${projectName}/${projectConfigName}/.domains.json`, (new TextEncoder).encode(getDomainsConfig('app')));
        await Deno.writeFile(Deno.cwd() + `/${projectName}/${projectConfigName}/app.json`, (new TextEncoder).encode(getApplicationConfig(projectName, type)));
        await Deno.mkdir(Deno.cwd() + `/${projectName}/app/${projectName}/client`, {
            recursive: true
        });
        await Deno.writeFile(Deno.cwd() + `/${projectName}/app/${projectName}/client/index.html`, (new TextEncoder).encode(getIndexPageContent()));
        await Deno.mkdir(Deno.cwd() + `/${projectName}/app/${projectName}/server`, {
            recursive: true
        });
        await Deno.writeFile(Deno.cwd() + `/${projectName}/app/${projectName}/server/datetime.ts`, (new TextEncoder).encode(getAPIEndpointContent()));
        return true;
    } catch (e) {
        error(e.message);
        return false;
    }
}
async function createPackage(projectName, appName, packageName, alias) {
    if (!await exists(Deno.cwd() + `/${projectName}`, {
        isDirectory: true
    })) {
        error(`Could not find a project directory named ${projectName}`);
        return false;
    }
    if (!await exists(Deno.cwd() + `/${projectName}/.env`, {
        isFile: true
    })) {
        error(`Could not find the project's environment configuration file .env`);
        return false;
    }
    if (!await exists(Deno.cwd() + `/${projectName}/.${projectName}`, {
        isDirectory: true
    })) {
        error(`Could not find the project's config directory named .${projectName}`);
        return false;
    }
    if (!await exists(Deno.cwd() + `/${projectName}/.${projectName}/${appName}.json`, {
        isFile: true
    })) {
        error(`Could not find the project's app config file named ${appName}.json`);
        return false;
    }
    const env = await load({
        envPath: Deno.cwd() + `/${projectName}/.env`
    });
    const projectAuthToken = env.PROJECT_AUTH_TOKEN;
    if (!projectAuthToken) {
        error(`Could not create the remote repo ${packageName}. The environment variable PROJECT_AUTH_TOKEN did not provide a value.`);
        return false;
    }
    const appConfig = JSON.parse((new TextDecoder).decode(await Deno.readFile(Deno.cwd() + `/${projectName}/.${projectName}/${appName}.json`)));
    const repoType = appConfig.type || 'private';
    if (repoType !== 'private' && repoType !== 'public') {
        error(`Could not create the remote repo ${packageName}. Please set the app type in the project's app config file named ${appName}.json to 'private' or 'public'.`);
        return false;
    }
    info(`Creating package ${projectName}/${appName}/${packageName} ...`);
    try {
        await createRepo({
            repoName: packageName,
            authToken: projectAuthToken,
            repoType
        });
        await cloneRepo({
            repoName: packageName,
            path: Deno.cwd() + `/${projectName}/${appName}/${packageName}`,
            provider: env.PROJECT_HOST || '',
            namespace: env.PROJECT_NAMESPACE || '',
            authToken: projectAuthToken
        });
        appConfig.packages[packageName] = {};
        if (alias) appConfig.packages[packageName].alias = alias;
        await Deno.writeFile(Deno.cwd() + `/${projectName}/.${projectName}/${appName}.json`, (new TextEncoder).encode(JSON.stringify(appConfig, null, '\t')));
        return true;
    } catch (e) {
        error(e.message);
        return false;
    }
}
async function checkoutProject(projectName) {
    let env = {};
    if (!projectName) {
        env = await load({
            envPath: Deno.cwd() + `/.env`
        });
        projectName = env.PROJECT_NAME;
    }
    if (await exists(Deno.cwd() + `/${projectName}`, {
        isDirectory: true
    })) {
        error(`A project directory named ${projectName} already exists`);
        return false;
    }
    info('Please provide the following project environment variables:');
    projectName = prompt('PROJECT_NAME:', projectName);
    const projectHost = prompt('PROJECT_HOST:', env['PROJECT_HOST'] || 'GitHub');
    const projectNamespace = prompt('PROJECT_NAMESPACE:', env['PROJECT_NAMESPACE']);
    const projectTag = prompt('PROJECT_TAG:', env['PROJECT_TAG']);
    const projectAuthToken = prompt('PROJECT_AUTH_TOKEN:', env['PROJECT_AUTH_TOKEN']);
    info(`Creating project directory ${projectName} ...`);
    await Deno.mkdir(Deno.cwd() + `/${projectName}`, {
        recursive: true
    });
    await Deno.writeFile(Deno.cwd() + `/${projectName}/.env`, (new TextEncoder).encode(getEnvContent(projectHost, projectNamespace, projectAuthToken)));
    const projectConfigName = '.' + projectName;
    try {
        await cloneRepo({
            repoName: projectConfigName,
            tag: projectTag,
            path: Deno.cwd() + `/${projectName}/${projectConfigName}`,
            host: projectHost,
            namespace: projectNamespace,
            authToken: projectAuthToken
        });
        return true;
    } catch (e) {
        error(e.message);
        return false;
    }
}
async function checkoutPackage(projectName, appName, packageName) {
    if (!await exists(Deno.cwd() + `/${projectName}`, {
        isDirectory: true
    })) {
        error(`Could not find a project directory named ${projectName}`);
        return false;
    }
    if (!await exists(Deno.cwd() + `/${projectName}/.env`, {
        isFile: true
    })) {
        error(`Could not find the project's environment configuration file .env`);
        return false;
    }
    if (!await exists(Deno.cwd() + `/${projectName}/.${projectName}`, {
        isDirectory: true
    })) {
        error(`Could not find the project's config directory named .${projectName}`);
        return false;
    }
    if (!await exists(Deno.cwd() + `/${projectName}/.${projectName}/${appName}.json`, {
        isFile: true
    })) {
        error(`Could not find the project's app config file named ${appName}.json`);
        return false;
    }
    const appConfig = JSON.parse((new TextDecoder).decode(await Deno.readFile(Deno.cwd() + `/${projectName}/.${projectName}/${appName}.json`)));
    if (packageName !== '*' && (!appConfig.packages || !appConfig.packages[packageName])) {
        error(`Could not find the package ${packageName} in the project's app config file named ${appName}.json`);
        return false;
    }
    const env = await load({
        envPath: Deno.cwd() + `/${projectName}/.env`
    });
    if (appConfig.type === 'private' && !env.PROJECT_AUTH_TOKEN) {
        error(`Could not checkout the remote repo .${packageName}. The environment variable PROJECT_AUTH_TOKEN did not provide a value.`);
        return false;
    }
    try {
        for(const key in appConfig.packages){
            if (packageName === '*' || packageName === key) {
                await cloneRepo({
                    repoName: key,
                    tag: appConfig.packages[key].tag,
                    path: Deno.cwd() + `/${projectName}/${appName}/${packageName}`,
                    host: env.PROJECT_HOST,
                    namespace: env.PROJECT_NAMESPACE,
                    authToken: env.PROJECT_AUTH_TOKEN
                });
            }
        }
        return true;
    } catch (e) {
        error(e.message);
        return false;
    }
}
async function createRepo(props) {
    try {
        const repoName = props.repoName;
        const authToken = props.authToken;
        const privateRepo = props.repoType === 'private';
        const response = await fetch(`https://api.github.com/user/repos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                "name": repoName,
                "private": privateRepo,
                "auto_init": true
            })
        });
        if (!response.ok) {
            error(response.statusText);
            return false;
        } else {
            return true;
        }
    } catch (e) {
        error(e.message);
        return false;
    }
}
async function cloneRepo(props) {
    let command;
    const path = props.path;
    const repoName = props.repoName;
    const provider = props.provider || 'GitHub';
    const namespace = props.namespace;
    const authToken = props.authToken;
    const tag = props.tag;
    if (provider === 'GitHub') {
        if (authToken) {
            command = new Deno.Command('git', {
                args: [
                    'clone',
                    `https://${namespace}:${authToken}@github.com/${namespace}/${repoName}.git`,
                    path
                ],
                stdin: 'piped'
            });
        } else {
            command = new Deno.Command('git', {
                args: [
                    'clone',
                    `https://github.com/${namespace}/${repoName}.git`,
                    path
                ],
                stdin: 'piped'
            });
        }
        let child = command.spawn();
        child.stdin.close();
        await child.status;
        if (tag) {
            command = new Deno.Command('git', {
                args: [
                    '--git-dir',
                    `${path}/.git`,
                    '--work-tree',
                    path,
                    'switch',
                    '--track',
                    `origin/${tag}`
                ],
                stdin: 'piped'
            });
            child = command.spawn();
            child.stdin.close();
            await child.status;
        }
    }
}
function getEnvContent(projectHost, projectNamespace, projectAuthToken) {
    const content = `PROJECT_HOST=${projectHost}\nPROJECT_NAMESPACE=${projectNamespace}\nPROJECT_TAG=\nPROJECT_AUTH_TOKEN=${projectAuthToken}\nSERVER_HTTP_PORT=80\nSERVER_DEBUG_PORT=9229`;
    return content;
}
function getDefaultEnvContent() {
    const content = `PROJECT_HOST=GitHub\nPROJECT_NAMESPACE=\nPROJECT_NAME=\nPROJECT_TAG=\nPROJECT_AUTH_TOKEN=\nSERVER_HTTP_PORT=80\nSERVER_DEBUG_PORT=9229`;
    return content;
}
function getDomainsConfig(appName) {
    const json = {
        localhost: {
            application: appName || ''
        }
    };
    return JSON.stringify(json, null, '\t');
}
function getApplicationConfig(projectName, type = 'private') {
    const json = {
        type,
        packages: {
            [projectName]: {
                alias: 'main'
            }
        },
        routes: [
            {
                route: "/api/datetime",
                path: `/${projectName}/server/datetime.ts`
            },
            {
                route: "/*",
                path: `/${projectName}/client/index.html`
            }
        ],
        extensions: {},
        directives: [],
        settings: {},
        featureFlags: []
    };
    return JSON.stringify(json, null, '\t');
}
function getIndexPageContent() {
    const content = `<html lang="en">
    <head>
        <title>Powered By JSphere</title>
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
            <div style="font-family:monospace; font-size:2rem; font-weight:bold; margin-bottom:2rem;">Powered By JSphere</div>
            <div id="datetime" style="font-family:monospace; color:#686868; font-weight:bold;"></div>
        </div>
    </body>
</html>
`;
    return content;
}
function getAPIEndpointContent() {
    const content = `export function onGET (ctx:any) {
    const date = new Date();
    return ctx.response.json({ datetime: date.toLocaleString() });
}    
`;
    return content;
}
function getDockerFileContent(projectName, appName) {
    const content = `FROM --platform=linux/amd64 denoland/deno:${DENO_VERSION}
WORKDIR /JSphere
ENV DENO_DIR=/JSphere/.deno_cache
RUN mkdir -p $DENO_DIR && chmod -R 777 $DENO_DIR
RUN deno cache https://raw.githubusercontent.com/GreenAntTech/JSphere/${JSPHERE_VERSION}/server.js
COPY ${projectName}/.${projectName}/${appName}.json /JSphere/${projectName}/.${projectName}/${appName}.json
COPY ${projectName}/${appName} /JSphere/${projectName}/${appName}
EXPOSE 80
ENTRYPOINT ["deno", "run", "--allow-all", "--no-check", "https://raw.githubusercontent.com/GreenAntTech/JSphere/${JSPHERE_VERSION}/server.js", "${projectName}"]
`;
    return content;
}
export { buildCmd as buildCmd };

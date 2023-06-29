// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const osType = (()=>{
    const { Deno: Deno1  } = globalThis;
    if (typeof Deno1?.build?.os === "string") {
        return Deno1.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win")) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path4) {
    if (typeof path4 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path4)}`);
    }
}
function isPosixPathSeparator(code1) {
    return code1 === 47;
}
function isPathSeparator(code2) {
    return isPosixPathSeparator(code2) || code2 === 92;
}
function isWindowsDeviceRoot(code3) {
    return code3 >= 97 && code3 <= 122 || code3 >= 65 && code3 <= 90;
}
function normalizeString(path5, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code4;
    for(let i5 = 0, len = path5.length; i5 <= len; ++i5){
        if (i5 < len) code4 = path5.charCodeAt(i5);
        else if (isPathSeparator1(code4)) break;
        else code4 = CHAR_FORWARD_SLASH;
        if (isPathSeparator1(code4)) {
            if (lastSlash === i5 - 1 || dots === 1) {} else if (lastSlash !== i5 - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i5;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i5;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path5.slice(lastSlash + 1, i5);
                else res = path5.slice(lastSlash + 1, i5);
                lastSegmentLength = i5 - lastSlash - 1;
            }
            lastSlash = i5;
            dots = 0;
        } else if (code4 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep6, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (base === sep6) return dir;
    if (dir === pathObject.root) return dir + base;
    return dir + sep6 + base;
}
const WHITESPACE_ENCODINGS = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace(string) {
    return string.replaceAll(/[\s]/g, (c6)=>{
        return WHITESPACE_ENCODINGS[c6] ?? c6;
    });
}
function lastPathSegment(path6, isSep, start = 0) {
    let matchedNonSeparator = false;
    let end = path6.length;
    for(let i6 = path6.length - 1; i6 >= start; --i6){
        if (isSep(path6.charCodeAt(i6))) {
            if (matchedNonSeparator) {
                start = i6 + 1;
                break;
            }
        } else if (!matchedNonSeparator) {
            matchedNonSeparator = true;
            end = i6 + 1;
        }
    }
    return path6.slice(start, end);
}
function stripTrailingSeparators(segment, isSep) {
    if (segment.length <= 1) {
        return segment;
    }
    let end = segment.length;
    for(let i7 = segment.length - 1; i7 > 0; i7--){
        if (isSep(segment.charCodeAt(i7))) {
            end = i7;
        } else {
            break;
        }
    }
    return segment.slice(0, end);
}
function stripSuffix(name, suffix) {
    if (suffix.length >= name.length) {
        return name;
    }
    const lenDiff = name.length - suffix.length;
    for(let i8 = suffix.length - 1; i8 >= 0; --i8){
        if (name.charCodeAt(lenDiff + i8) !== suffix.charCodeAt(i8)) {
            return name;
        }
    }
    return name.slice(0, -suffix.length);
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
const sep = "\\";
const delimiter = ";";
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i9 = pathSegments.length - 1; i9 >= -1; i9--){
        let path7;
        const { Deno: Deno2  } = globalThis;
        if (i9 >= 0) {
            path7 = pathSegments[i9];
        } else if (!resolvedDevice) {
            if (typeof Deno2?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path7 = Deno2.cwd();
        } else {
            if (typeof Deno2?.env?.get !== "function" || typeof Deno2?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path7 = Deno2.cwd();
            if (path7 === undefined || path7.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path7 = `${resolvedDevice}\\`;
            }
        }
        assertPath(path7);
        const len = path7.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute1 = false;
        const code5 = path7.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code5)) {
                isAbsolute1 = true;
                if (isPathSeparator(path7.charCodeAt(1))) {
                    let j5 = 2;
                    let last = j5;
                    for(; j5 < len; ++j5){
                        if (isPathSeparator(path7.charCodeAt(j5))) break;
                    }
                    if (j5 < len && j5 !== last) {
                        const firstPart = path7.slice(last, j5);
                        last = j5;
                        for(; j5 < len; ++j5){
                            if (!isPathSeparator(path7.charCodeAt(j5))) break;
                        }
                        if (j5 < len && j5 !== last) {
                            last = j5;
                            for(; j5 < len; ++j5){
                                if (isPathSeparator(path7.charCodeAt(j5))) break;
                            }
                            if (j5 === len) {
                                device = `\\\\${firstPart}\\${path7.slice(last)}`;
                                rootEnd = j5;
                            } else if (j5 !== last) {
                                device = `\\\\${firstPart}\\${path7.slice(last, j5)}`;
                                rootEnd = j5;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code5)) {
                if (path7.charCodeAt(1) === 58) {
                    device = path7.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path7.charCodeAt(2))) {
                            isAbsolute1 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code5)) {
            rootEnd = 1;
            isAbsolute1 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path7.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute1;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path8) {
    assertPath(path8);
    const len = path8.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute2 = false;
    const code6 = path8.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code6)) {
            isAbsolute2 = true;
            if (isPathSeparator(path8.charCodeAt(1))) {
                let j6 = 2;
                let last = j6;
                for(; j6 < len; ++j6){
                    if (isPathSeparator(path8.charCodeAt(j6))) break;
                }
                if (j6 < len && j6 !== last) {
                    const firstPart = path8.slice(last, j6);
                    last = j6;
                    for(; j6 < len; ++j6){
                        if (!isPathSeparator(path8.charCodeAt(j6))) break;
                    }
                    if (j6 < len && j6 !== last) {
                        last = j6;
                        for(; j6 < len; ++j6){
                            if (isPathSeparator(path8.charCodeAt(j6))) break;
                        }
                        if (j6 === len) {
                            return `\\\\${firstPart}\\${path8.slice(last)}\\`;
                        } else if (j6 !== last) {
                            device = `\\\\${firstPart}\\${path8.slice(last, j6)}`;
                            rootEnd = j6;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code6)) {
            if (path8.charCodeAt(1) === 58) {
                device = path8.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path8.charCodeAt(2))) {
                        isAbsolute2 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code6)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path8.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute2) tail = ".";
    if (tail.length > 0 && isPathSeparator(path8.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute2) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute2) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path9) {
    assertPath(path9);
    const len = path9.length;
    if (len === 0) return false;
    const code7 = path9.charCodeAt(0);
    if (isPathSeparator(code7)) {
        return true;
    } else if (isWindowsDeviceRoot(code7)) {
        if (len > 2 && path9.charCodeAt(1) === 58) {
            if (isPathSeparator(path9.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i10 = 0; i10 < pathsCount; ++i10){
        const path10 = paths[i10];
        assertPath(path10);
        if (path10.length > 0) {
            if (joined === undefined) joined = firstPart = path10;
            else joined += `\\${path10}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to1) {
    assertPath(from);
    assertPath(to1);
    if (from === to1) return "";
    const fromOrig = resolve(from);
    const toOrig = resolve(to1);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to1 = toOrig.toLowerCase();
    if (from === to1) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to1.length;
    for(; toStart < toEnd; ++toStart){
        if (to1.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to1.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i11 = 0;
    for(; i11 <= length; ++i11){
        if (i11 === length) {
            if (toLen > length) {
                if (to1.charCodeAt(toStart + i11) === 92) {
                    return toOrig.slice(toStart + i11 + 1);
                } else if (i11 === 2) {
                    return toOrig.slice(toStart + i11);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i11) === 92) {
                    lastCommonSep = i11;
                } else if (i11 === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i11);
        const toCode = to1.charCodeAt(toStart + i11);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i11;
    }
    if (i11 !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i11 = fromStart + lastCommonSep + 1; i11 <= fromEnd; ++i11){
        if (i11 === fromEnd || from.charCodeAt(i11) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path11) {
    if (typeof path11 !== "string") return path11;
    if (path11.length === 0) return "";
    const resolvedPath = resolve(path11);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code8 = resolvedPath.charCodeAt(2);
                if (code8 !== 63 && code8 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path11;
}
function dirname(path12) {
    assertPath(path12);
    const len = path12.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code9 = path12.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code9)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path12.charCodeAt(1))) {
                let j7 = 2;
                let last = j7;
                for(; j7 < len; ++j7){
                    if (isPathSeparator(path12.charCodeAt(j7))) break;
                }
                if (j7 < len && j7 !== last) {
                    last = j7;
                    for(; j7 < len; ++j7){
                        if (!isPathSeparator(path12.charCodeAt(j7))) break;
                    }
                    if (j7 < len && j7 !== last) {
                        last = j7;
                        for(; j7 < len; ++j7){
                            if (isPathSeparator(path12.charCodeAt(j7))) break;
                        }
                        if (j7 === len) {
                            return path12;
                        }
                        if (j7 !== last) {
                            rootEnd = offset = j7 + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code9)) {
            if (path12.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path12.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code9)) {
        return path12;
    }
    for(let i12 = len - 1; i12 >= offset; --i12){
        if (isPathSeparator(path12.charCodeAt(i12))) {
            if (!matchedSlash) {
                end = i12;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return stripTrailingSeparators(path12.slice(0, end), isPosixPathSeparator);
}
function basename(path13, suffix = "") {
    assertPath(path13);
    if (path13.length === 0) return path13;
    if (typeof suffix !== "string") {
        throw new TypeError(`Suffix must be a string. Received ${JSON.stringify(suffix)}`);
    }
    let start = 0;
    if (path13.length >= 2) {
        const drive = path13.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path13.charCodeAt(1) === 58) start = 2;
        }
    }
    const lastSegment = lastPathSegment(path13, isPathSeparator, start);
    const strippedSegment = stripTrailingSeparators(lastSegment, isPathSeparator);
    return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
function extname(path14) {
    assertPath(path14);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path14.length >= 2 && path14.charCodeAt(1) === 58 && isWindowsDeviceRoot(path14.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i13 = path14.length - 1; i13 >= start; --i13){
        const code10 = path14.charCodeAt(i13);
        if (isPathSeparator(code10)) {
            if (!matchedSlash) {
                startPart = i13 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i13 + 1;
        }
        if (code10 === 46) {
            if (startDot === -1) startDot = i13;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path14.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse(path15) {
    assertPath(path15);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path15.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code11 = path15.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code11)) {
            rootEnd = 1;
            if (isPathSeparator(path15.charCodeAt(1))) {
                let j8 = 2;
                let last = j8;
                for(; j8 < len; ++j8){
                    if (isPathSeparator(path15.charCodeAt(j8))) break;
                }
                if (j8 < len && j8 !== last) {
                    last = j8;
                    for(; j8 < len; ++j8){
                        if (!isPathSeparator(path15.charCodeAt(j8))) break;
                    }
                    if (j8 < len && j8 !== last) {
                        last = j8;
                        for(; j8 < len; ++j8){
                            if (isPathSeparator(path15.charCodeAt(j8))) break;
                        }
                        if (j8 === len) {
                            rootEnd = j8;
                        } else if (j8 !== last) {
                            rootEnd = j8 + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code11)) {
            if (path15.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path15.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path15;
                            ret.base = "\\";
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path15;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code11)) {
        ret.root = ret.dir = path15;
        ret.base = "\\";
        return ret;
    }
    if (rootEnd > 0) ret.root = path15.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i14 = path15.length - 1;
    let preDotState = 0;
    for(; i14 >= rootEnd; --i14){
        code11 = path15.charCodeAt(i14);
        if (isPathSeparator(code11)) {
            if (!matchedSlash) {
                startPart = i14 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i14 + 1;
        }
        if (code11 === 46) {
            if (startDot === -1) startDot = i14;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path15.slice(startPart, end);
        }
    } else {
        ret.name = path15.slice(startPart, startDot);
        ret.base = path15.slice(startPart, end);
        ret.ext = path15.slice(startDot, end);
    }
    ret.base = ret.base || "\\";
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path15.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path16 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path16 = `\\\\${url.hostname}${path16}`;
    }
    return path16;
}
function toFileUrl(path17) {
    if (!isAbsolute(path17)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path17.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod = {
    sep: sep,
    delimiter: delimiter,
    resolve: resolve,
    normalize: normalize,
    isAbsolute: isAbsolute,
    join: join,
    relative: relative,
    toNamespacedPath: toNamespacedPath,
    dirname: dirname,
    basename: basename,
    extname: extname,
    format: format,
    parse: parse,
    fromFileUrl: fromFileUrl,
    toFileUrl: toFileUrl
};
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i15 = pathSegments.length - 1; i15 >= -1 && !resolvedAbsolute; i15--){
        let path18;
        if (i15 >= 0) path18 = pathSegments[i15];
        else {
            const { Deno: Deno3  } = globalThis;
            if (typeof Deno3?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path18 = Deno3.cwd();
        }
        assertPath(path18);
        if (path18.length === 0) {
            continue;
        }
        resolvedPath = `${path18}/${resolvedPath}`;
        resolvedAbsolute = isPosixPathSeparator(path18.charCodeAt(0));
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path19) {
    assertPath(path19);
    if (path19.length === 0) return ".";
    const isAbsolute1 = isPosixPathSeparator(path19.charCodeAt(0));
    const trailingSeparator = isPosixPathSeparator(path19.charCodeAt(path19.length - 1));
    path19 = normalizeString(path19, !isAbsolute1, "/", isPosixPathSeparator);
    if (path19.length === 0 && !isAbsolute1) path19 = ".";
    if (path19.length > 0 && trailingSeparator) path19 += "/";
    if (isAbsolute1) return `/${path19}`;
    return path19;
}
function isAbsolute1(path20) {
    assertPath(path20);
    return path20.length > 0 && isPosixPathSeparator(path20.charCodeAt(0));
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i16 = 0, len = paths.length; i16 < len; ++i16){
        const path21 = paths[i16];
        assertPath(path21);
        if (path21.length > 0) {
            if (!joined) joined = path21;
            else joined += `/${path21}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to2) {
    assertPath(from);
    assertPath(to2);
    if (from === to2) return "";
    from = resolve1(from);
    to2 = resolve1(to2);
    if (from === to2) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (!isPosixPathSeparator(from.charCodeAt(fromStart))) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to2.length;
    for(; toStart < toEnd; ++toStart){
        if (!isPosixPathSeparator(to2.charCodeAt(toStart))) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i17 = 0;
    for(; i17 <= length; ++i17){
        if (i17 === length) {
            if (toLen > length) {
                if (isPosixPathSeparator(to2.charCodeAt(toStart + i17))) {
                    return to2.slice(toStart + i17 + 1);
                } else if (i17 === 0) {
                    return to2.slice(toStart + i17);
                }
            } else if (fromLen > length) {
                if (isPosixPathSeparator(from.charCodeAt(fromStart + i17))) {
                    lastCommonSep = i17;
                } else if (i17 === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i17);
        const toCode = to2.charCodeAt(toStart + i17);
        if (fromCode !== toCode) break;
        else if (isPosixPathSeparator(fromCode)) lastCommonSep = i17;
    }
    let out = "";
    for(i17 = fromStart + lastCommonSep + 1; i17 <= fromEnd; ++i17){
        if (i17 === fromEnd || isPosixPathSeparator(from.charCodeAt(i17))) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to2.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (isPosixPathSeparator(to2.charCodeAt(toStart))) ++toStart;
        return to2.slice(toStart);
    }
}
function toNamespacedPath1(path22) {
    return path22;
}
function dirname1(path23) {
    if (path23.length === 0) return ".";
    let end = -1;
    let matchedNonSeparator = false;
    for(let i18 = path23.length - 1; i18 >= 1; --i18){
        if (isPosixPathSeparator(path23.charCodeAt(i18))) {
            if (matchedNonSeparator) {
                end = i18;
                break;
            }
        } else {
            matchedNonSeparator = true;
        }
    }
    if (end === -1) {
        return isPosixPathSeparator(path23.charCodeAt(0)) ? "/" : ".";
    }
    return stripTrailingSeparators(path23.slice(0, end), isPosixPathSeparator);
}
function basename1(path24, suffix = "") {
    assertPath(path24);
    if (path24.length === 0) return path24;
    if (typeof suffix !== "string") {
        throw new TypeError(`Suffix must be a string. Received ${JSON.stringify(suffix)}`);
    }
    const lastSegment = lastPathSegment(path24, isPosixPathSeparator);
    const strippedSegment = stripTrailingSeparators(lastSegment, isPosixPathSeparator);
    return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
function extname1(path25) {
    assertPath(path25);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i19 = path25.length - 1; i19 >= 0; --i19){
        const code12 = path25.charCodeAt(i19);
        if (isPosixPathSeparator(code12)) {
            if (!matchedSlash) {
                startPart = i19 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i19 + 1;
        }
        if (code12 === 46) {
            if (startDot === -1) startDot = i19;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path25.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse1(path26) {
    assertPath(path26);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path26.length === 0) return ret;
    const isAbsolute2 = isPosixPathSeparator(path26.charCodeAt(0));
    let start;
    if (isAbsolute2) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i20 = path26.length - 1;
    let preDotState = 0;
    for(; i20 >= start; --i20){
        const code13 = path26.charCodeAt(i20);
        if (isPosixPathSeparator(code13)) {
            if (!matchedSlash) {
                startPart = i20 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i20 + 1;
        }
        if (code13 === 46) {
            if (startDot === -1) startDot = i20;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute2) {
                ret.base = ret.name = path26.slice(1, end);
            } else {
                ret.base = ret.name = path26.slice(startPart, end);
            }
        }
        ret.base = ret.base || "/";
    } else {
        if (startPart === 0 && isAbsolute2) {
            ret.name = path26.slice(1, startDot);
            ret.base = path26.slice(1, end);
        } else {
            ret.name = path26.slice(startPart, startDot);
            ret.base = path26.slice(startPart, end);
        }
        ret.ext = path26.slice(startDot, end);
    }
    if (startPart > 0) {
        ret.dir = stripTrailingSeparators(path26.slice(0, startPart - 1), isPosixPathSeparator);
    } else if (isAbsolute2) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path27) {
    if (!isAbsolute1(path27)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path27.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod1 = {
    sep: sep1,
    delimiter: delimiter1,
    resolve: resolve1,
    normalize: normalize1,
    isAbsolute: isAbsolute1,
    join: join1,
    relative: relative1,
    toNamespacedPath: toNamespacedPath1,
    dirname: dirname1,
    basename: basename1,
    extname: extname1,
    format: format1,
    parse: parse1,
    fromFileUrl: fromFileUrl1,
    toFileUrl: toFileUrl1
};
const path = isWindows ? mod : mod1;
const { join: join2 , normalize: normalize2  } = path;
const path1 = isWindows ? mod : mod1;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join3 , normalize: normalize3 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2 ,  } = path1;
const osType1 = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator = globalThis.navigator;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows1 = osType1 === "windows";
const CHAR_FORWARD_SLASH1 = 47;
function assertPath1(path28) {
    if (typeof path28 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path28)}`);
    }
}
function isPosixPathSeparator1(code14) {
    return code14 === 47;
}
function isPathSeparator1(code15) {
    return isPosixPathSeparator1(code15) || code15 === 92;
}
function isWindowsDeviceRoot1(code16) {
    return code16 >= 97 && code16 <= 122 || code16 >= 65 && code16 <= 90;
}
function normalizeString1(path29, allowAboveRoot, separator, isPathSeparator11) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code17;
    for(let i21 = 0, len = path29.length; i21 <= len; ++i21){
        if (i21 < len) code17 = path29.charCodeAt(i21);
        else if (isPathSeparator11(code17)) break;
        else code17 = CHAR_FORWARD_SLASH1;
        if (isPathSeparator11(code17)) {
            if (lastSlash === i21 - 1 || dots === 1) {} else if (lastSlash !== i21 - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i21;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i21;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path29.slice(lastSlash + 1, i21);
                else res = path29.slice(lastSlash + 1, i21);
                lastSegmentLength = i21 - lastSlash - 1;
            }
            lastSlash = i21;
            dots = 0;
        } else if (code17 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format1(sep7, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep7 + base;
}
const WHITESPACE_ENCODINGS1 = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace1(string) {
    return string.replaceAll(/[\s]/g, (c7)=>{
        return WHITESPACE_ENCODINGS1[c7] ?? c7;
    });
}
class DenoStdInternalError1 extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert1(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError1(msg);
    }
}
const sep3 = "\\";
const delimiter3 = ";";
function resolve3(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i22 = pathSegments.length - 1; i22 >= -1; i22--){
        let path30;
        if (i22 >= 0) {
            path30 = pathSegments[i22];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path30 = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path30 = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path30 === undefined || path30.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path30 = `${resolvedDevice}\\`;
            }
        }
        assertPath1(path30);
        const len = path30.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute11 = false;
        const code18 = path30.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator1(code18)) {
                isAbsolute11 = true;
                if (isPathSeparator1(path30.charCodeAt(1))) {
                    let j9 = 2;
                    let last = j9;
                    for(; j9 < len; ++j9){
                        if (isPathSeparator1(path30.charCodeAt(j9))) break;
                    }
                    if (j9 < len && j9 !== last) {
                        const firstPart = path30.slice(last, j9);
                        last = j9;
                        for(; j9 < len; ++j9){
                            if (!isPathSeparator1(path30.charCodeAt(j9))) break;
                        }
                        if (j9 < len && j9 !== last) {
                            last = j9;
                            for(; j9 < len; ++j9){
                                if (isPathSeparator1(path30.charCodeAt(j9))) break;
                            }
                            if (j9 === len) {
                                device = `\\\\${firstPart}\\${path30.slice(last)}`;
                                rootEnd = j9;
                            } else if (j9 !== last) {
                                device = `\\\\${firstPart}\\${path30.slice(last, j9)}`;
                                rootEnd = j9;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot1(code18)) {
                if (path30.charCodeAt(1) === 58) {
                    device = path30.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator1(path30.charCodeAt(2))) {
                            isAbsolute11 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator1(code18)) {
            rootEnd = 1;
            isAbsolute11 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path30.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute11;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString1(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator1);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize4(path31) {
    assertPath1(path31);
    const len = path31.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute21 = false;
    const code19 = path31.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code19)) {
            isAbsolute21 = true;
            if (isPathSeparator1(path31.charCodeAt(1))) {
                let j10 = 2;
                let last = j10;
                for(; j10 < len; ++j10){
                    if (isPathSeparator1(path31.charCodeAt(j10))) break;
                }
                if (j10 < len && j10 !== last) {
                    const firstPart = path31.slice(last, j10);
                    last = j10;
                    for(; j10 < len; ++j10){
                        if (!isPathSeparator1(path31.charCodeAt(j10))) break;
                    }
                    if (j10 < len && j10 !== last) {
                        last = j10;
                        for(; j10 < len; ++j10){
                            if (isPathSeparator1(path31.charCodeAt(j10))) break;
                        }
                        if (j10 === len) {
                            return `\\\\${firstPart}\\${path31.slice(last)}\\`;
                        } else if (j10 !== last) {
                            device = `\\\\${firstPart}\\${path31.slice(last, j10)}`;
                            rootEnd = j10;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot1(code19)) {
            if (path31.charCodeAt(1) === 58) {
                device = path31.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path31.charCodeAt(2))) {
                        isAbsolute21 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator1(code19)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString1(path31.slice(rootEnd), !isAbsolute21, "\\", isPathSeparator1);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute21) tail = ".";
    if (tail.length > 0 && isPathSeparator1(path31.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute21) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute21) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute3(path32) {
    assertPath1(path32);
    const len = path32.length;
    if (len === 0) return false;
    const code20 = path32.charCodeAt(0);
    if (isPathSeparator1(code20)) {
        return true;
    } else if (isWindowsDeviceRoot1(code20)) {
        if (len > 2 && path32.charCodeAt(1) === 58) {
            if (isPathSeparator1(path32.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join4(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i23 = 0; i23 < pathsCount; ++i23){
        const path33 = paths[i23];
        assertPath1(path33);
        if (path33.length > 0) {
            if (joined === undefined) joined = firstPart = path33;
            else joined += `\\${path33}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert1(firstPart != null);
    if (isPathSeparator1(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator1(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator1(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator1(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize4(joined);
}
function relative3(from, to3) {
    assertPath1(from);
    assertPath1(to3);
    if (from === to3) return "";
    const fromOrig = resolve3(from);
    const toOrig = resolve3(to3);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to3 = toOrig.toLowerCase();
    if (from === to3) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to3.length;
    for(; toStart < toEnd; ++toStart){
        if (to3.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to3.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i24 = 0;
    for(; i24 <= length; ++i24){
        if (i24 === length) {
            if (toLen > length) {
                if (to3.charCodeAt(toStart + i24) === 92) {
                    return toOrig.slice(toStart + i24 + 1);
                } else if (i24 === 2) {
                    return toOrig.slice(toStart + i24);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i24) === 92) {
                    lastCommonSep = i24;
                } else if (i24 === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i24);
        const toCode = to3.charCodeAt(toStart + i24);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i24;
    }
    if (i24 !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i24 = fromStart + lastCommonSep + 1; i24 <= fromEnd; ++i24){
        if (i24 === fromEnd || from.charCodeAt(i24) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath3(path34) {
    if (typeof path34 !== "string") return path34;
    if (path34.length === 0) return "";
    const resolvedPath = resolve3(path34);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code21 = resolvedPath.charCodeAt(2);
                if (code21 !== 63 && code21 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot1(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path34;
}
function dirname3(path35) {
    assertPath1(path35);
    const len = path35.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code22 = path35.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code22)) {
            rootEnd = offset = 1;
            if (isPathSeparator1(path35.charCodeAt(1))) {
                let j11 = 2;
                let last = j11;
                for(; j11 < len; ++j11){
                    if (isPathSeparator1(path35.charCodeAt(j11))) break;
                }
                if (j11 < len && j11 !== last) {
                    last = j11;
                    for(; j11 < len; ++j11){
                        if (!isPathSeparator1(path35.charCodeAt(j11))) break;
                    }
                    if (j11 < len && j11 !== last) {
                        last = j11;
                        for(; j11 < len; ++j11){
                            if (isPathSeparator1(path35.charCodeAt(j11))) break;
                        }
                        if (j11 === len) {
                            return path35;
                        }
                        if (j11 !== last) {
                            rootEnd = offset = j11 + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code22)) {
            if (path35.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator1(path35.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator1(code22)) {
        return path35;
    }
    for(let i25 = len - 1; i25 >= offset; --i25){
        if (isPathSeparator1(path35.charCodeAt(i25))) {
            if (!matchedSlash) {
                end = i25;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path35.slice(0, end);
}
function basename3(path36, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path36);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i26;
    if (path36.length >= 2) {
        const drive = path36.charCodeAt(0);
        if (isWindowsDeviceRoot1(drive)) {
            if (path36.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path36.length) {
        if (ext.length === path36.length && ext === path36) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i26 = path36.length - 1; i26 >= start; --i26){
            const code23 = path36.charCodeAt(i26);
            if (isPathSeparator1(code23)) {
                if (!matchedSlash) {
                    start = i26 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i26 + 1;
                }
                if (extIdx >= 0) {
                    if (code23 === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i26;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path36.length;
        return path36.slice(start, end);
    } else {
        for(i26 = path36.length - 1; i26 >= start; --i26){
            if (isPathSeparator1(path36.charCodeAt(i26))) {
                if (!matchedSlash) {
                    start = i26 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i26 + 1;
            }
        }
        if (end === -1) return "";
        return path36.slice(start, end);
    }
}
function extname3(path37) {
    assertPath1(path37);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path37.length >= 2 && path37.charCodeAt(1) === 58 && isWindowsDeviceRoot1(path37.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i27 = path37.length - 1; i27 >= start; --i27){
        const code24 = path37.charCodeAt(i27);
        if (isPathSeparator1(code24)) {
            if (!matchedSlash) {
                startPart = i27 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i27 + 1;
        }
        if (code24 === 46) {
            if (startDot === -1) startDot = i27;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path37.slice(startDot, end);
}
function format3(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format1("\\", pathObject);
}
function parse3(path38) {
    assertPath1(path38);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path38.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code25 = path38.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code25)) {
            rootEnd = 1;
            if (isPathSeparator1(path38.charCodeAt(1))) {
                let j12 = 2;
                let last = j12;
                for(; j12 < len; ++j12){
                    if (isPathSeparator1(path38.charCodeAt(j12))) break;
                }
                if (j12 < len && j12 !== last) {
                    last = j12;
                    for(; j12 < len; ++j12){
                        if (!isPathSeparator1(path38.charCodeAt(j12))) break;
                    }
                    if (j12 < len && j12 !== last) {
                        last = j12;
                        for(; j12 < len; ++j12){
                            if (isPathSeparator1(path38.charCodeAt(j12))) break;
                        }
                        if (j12 === len) {
                            rootEnd = j12;
                        } else if (j12 !== last) {
                            rootEnd = j12 + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code25)) {
            if (path38.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path38.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path38;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path38;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator1(code25)) {
        ret.root = ret.dir = path38;
        return ret;
    }
    if (rootEnd > 0) ret.root = path38.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i28 = path38.length - 1;
    let preDotState = 0;
    for(; i28 >= rootEnd; --i28){
        code25 = path38.charCodeAt(i28);
        if (isPathSeparator1(code25)) {
            if (!matchedSlash) {
                startPart = i28 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i28 + 1;
        }
        if (code25 === 46) {
            if (startDot === -1) startDot = i28;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path38.slice(startPart, end);
        }
    } else {
        ret.name = path38.slice(startPart, startDot);
        ret.base = path38.slice(startPart, end);
        ret.ext = path38.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path38.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl3(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path39 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path39 = `\\\\${url.hostname}${path39}`;
    }
    return path39;
}
function toFileUrl3(path40) {
    if (!isAbsolute3(path40)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path40.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace1(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod2 = {
    sep: sep3,
    delimiter: delimiter3,
    resolve: resolve3,
    normalize: normalize4,
    isAbsolute: isAbsolute3,
    join: join4,
    relative: relative3,
    toNamespacedPath: toNamespacedPath3,
    dirname: dirname3,
    basename: basename3,
    extname: extname3,
    format: format3,
    parse: parse3,
    fromFileUrl: fromFileUrl3,
    toFileUrl: toFileUrl3
};
const sep4 = "/";
const delimiter4 = ":";
function resolve4(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i29 = pathSegments.length - 1; i29 >= -1 && !resolvedAbsolute; i29--){
        let path41;
        if (i29 >= 0) path41 = pathSegments[i29];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path41 = Deno.cwd();
        }
        assertPath1(path41);
        if (path41.length === 0) {
            continue;
        }
        resolvedPath = `${path41}/${resolvedPath}`;
        resolvedAbsolute = path41.charCodeAt(0) === CHAR_FORWARD_SLASH1;
    }
    resolvedPath = normalizeString1(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator1);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize5(path42) {
    assertPath1(path42);
    if (path42.length === 0) return ".";
    const isAbsolute12 = path42.charCodeAt(0) === 47;
    const trailingSeparator = path42.charCodeAt(path42.length - 1) === 47;
    path42 = normalizeString1(path42, !isAbsolute12, "/", isPosixPathSeparator1);
    if (path42.length === 0 && !isAbsolute12) path42 = ".";
    if (path42.length > 0 && trailingSeparator) path42 += "/";
    if (isAbsolute12) return `/${path42}`;
    return path42;
}
function isAbsolute4(path43) {
    assertPath1(path43);
    return path43.length > 0 && path43.charCodeAt(0) === 47;
}
function join5(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i30 = 0, len = paths.length; i30 < len; ++i30){
        const path44 = paths[i30];
        assertPath1(path44);
        if (path44.length > 0) {
            if (!joined) joined = path44;
            else joined += `/${path44}`;
        }
    }
    if (!joined) return ".";
    return normalize5(joined);
}
function relative4(from, to4) {
    assertPath1(from);
    assertPath1(to4);
    if (from === to4) return "";
    from = resolve4(from);
    to4 = resolve4(to4);
    if (from === to4) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to4.length;
    for(; toStart < toEnd; ++toStart){
        if (to4.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i31 = 0;
    for(; i31 <= length; ++i31){
        if (i31 === length) {
            if (toLen > length) {
                if (to4.charCodeAt(toStart + i31) === 47) {
                    return to4.slice(toStart + i31 + 1);
                } else if (i31 === 0) {
                    return to4.slice(toStart + i31);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i31) === 47) {
                    lastCommonSep = i31;
                } else if (i31 === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i31);
        const toCode = to4.charCodeAt(toStart + i31);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i31;
    }
    let out = "";
    for(i31 = fromStart + lastCommonSep + 1; i31 <= fromEnd; ++i31){
        if (i31 === fromEnd || from.charCodeAt(i31) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to4.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to4.charCodeAt(toStart) === 47) ++toStart;
        return to4.slice(toStart);
    }
}
function toNamespacedPath4(path45) {
    return path45;
}
function dirname4(path46) {
    assertPath1(path46);
    if (path46.length === 0) return ".";
    const hasRoot = path46.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i32 = path46.length - 1; i32 >= 1; --i32){
        if (path46.charCodeAt(i32) === 47) {
            if (!matchedSlash) {
                end = i32;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path46.slice(0, end);
}
function basename4(path47, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path47);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i33;
    if (ext !== undefined && ext.length > 0 && ext.length <= path47.length) {
        if (ext.length === path47.length && ext === path47) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i33 = path47.length - 1; i33 >= 0; --i33){
            const code26 = path47.charCodeAt(i33);
            if (code26 === 47) {
                if (!matchedSlash) {
                    start = i33 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i33 + 1;
                }
                if (extIdx >= 0) {
                    if (code26 === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i33;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path47.length;
        return path47.slice(start, end);
    } else {
        for(i33 = path47.length - 1; i33 >= 0; --i33){
            if (path47.charCodeAt(i33) === 47) {
                if (!matchedSlash) {
                    start = i33 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i33 + 1;
            }
        }
        if (end === -1) return "";
        return path47.slice(start, end);
    }
}
function extname4(path48) {
    assertPath1(path48);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i34 = path48.length - 1; i34 >= 0; --i34){
        const code27 = path48.charCodeAt(i34);
        if (code27 === 47) {
            if (!matchedSlash) {
                startPart = i34 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i34 + 1;
        }
        if (code27 === 46) {
            if (startDot === -1) startDot = i34;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path48.slice(startDot, end);
}
function format4(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format1("/", pathObject);
}
function parse4(path49) {
    assertPath1(path49);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path49.length === 0) return ret;
    const isAbsolute22 = path49.charCodeAt(0) === 47;
    let start;
    if (isAbsolute22) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i35 = path49.length - 1;
    let preDotState = 0;
    for(; i35 >= start; --i35){
        const code28 = path49.charCodeAt(i35);
        if (code28 === 47) {
            if (!matchedSlash) {
                startPart = i35 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i35 + 1;
        }
        if (code28 === 46) {
            if (startDot === -1) startDot = i35;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute22) {
                ret.base = ret.name = path49.slice(1, end);
            } else {
                ret.base = ret.name = path49.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute22) {
            ret.name = path49.slice(1, startDot);
            ret.base = path49.slice(1, end);
        } else {
            ret.name = path49.slice(startPart, startDot);
            ret.base = path49.slice(startPart, end);
        }
        ret.ext = path49.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path49.slice(0, startPart - 1);
    else if (isAbsolute22) ret.dir = "/";
    return ret;
}
function fromFileUrl4(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl4(path50) {
    if (!isAbsolute4(path50)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace1(path50.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod3 = {
    sep: sep4,
    delimiter: delimiter4,
    resolve: resolve4,
    normalize: normalize5,
    isAbsolute: isAbsolute4,
    join: join5,
    relative: relative4,
    toNamespacedPath: toNamespacedPath4,
    dirname: dirname4,
    basename: basename4,
    extname: extname4,
    format: format4,
    parse: parse4,
    fromFileUrl: fromFileUrl4,
    toFileUrl: toFileUrl4
};
const path2 = isWindows1 ? mod2 : mod3;
const { join: join6 , normalize: normalize6  } = path2;
const path3 = isWindows1 ? mod2 : mod3;
const { basename: basename5 , delimiter: delimiter5 , dirname: dirname5 , extname: extname5 , format: format5 , fromFileUrl: fromFileUrl5 , isAbsolute: isAbsolute5 , join: join7 , normalize: normalize7 , parse: parse5 , relative: relative5 , resolve: resolve5 , sep: sep5 , toFileUrl: toFileUrl5 , toNamespacedPath: toNamespacedPath5 ,  } = path3;
const MIME_DB_URL = 'https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json';
const db = await (await fetch(MIME_DB_URL)).json();
function lookup(path51) {
    if (!path51 || typeof path51 !== 'string') {
        return false;
    }
    const extension1 = extname5('x.' + path51).toLowerCase().substr(1);
    if (!extension1) {
        return false;
    }
    return types[extension1] || false;
}
function populateMaps(extensions1, types1) {
    const preference = [
        'nginx',
        'apache',
        undefined,
        'iana'
    ];
    Object.keys(db).forEach(function forEachMimeType(type) {
        const mime = db[type];
        const exts = mime.extensions;
        if (!exts || !exts.length) {
            return;
        }
        extensions1[type] = exts;
        for(let i36 = 0; i36 < exts.length; i36++){
            const extension2 = exts[i36];
            if (types1[extension2]) {
                const from = preference.indexOf(db[types1[extension2]].source);
                const to5 = preference.indexOf(mime.source);
                if (types1[extension2] !== 'application/octet-stream' && (from > to5 || from === to5 && types1[extension2].substr(0, 12) === 'application/')) {
                    continue;
                }
            }
            types1[extension2] = type;
        }
    });
}
const extensions = Object.create(null);
const types = Object.create(null);
populateMaps(extensions, types);
function getInstance(_config, _utils) {
    return new Cache();
}
class Cache {
    cache = {};
    constructor(){}
    get = (key1)=>{
        const item = this.cache[key1];
        if (item && item.expires !== 0 && Date.now() >= item.expires) {
            this.remove(key1);
        }
        return this.cache[key1] ? this.cache[key1].value : null;
    };
    set = (key2, value, expires)=>{
        expires = typeof expires == 'number' && expires > 0 ? Date.now() + expires * 1000 : 0;
        this.cache[key2] = {
            value,
            expires
        };
    };
    setExpires = (key3, expires)=>{
        const value = this.get(key3);
        if (value) this.set(key3, value, expires);
        return value;
    };
    remove = (key4)=>{
        delete this.cache[key4];
    };
}
const mod4 = {
    getInstance: getInstance
};
function getInstance1(config1, _utils) {
    return new Feature(config1.appConfig.featureFlags);
}
class Feature {
    featureFlags;
    constructor(flags){
        this.featureFlags = flags;
    }
    async flag(obj) {
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
const mod5 = {
    getInstance: getInstance1
};
var LogLevels;
(function(LogLevels1) {
    LogLevels1[LogLevels1["NOTSET"] = 0] = "NOTSET";
    LogLevels1[LogLevels1["DEBUG"] = 10] = "DEBUG";
    LogLevels1[LogLevels1["INFO"] = 20] = "INFO";
    LogLevels1[LogLevels1["WARNING"] = 30] = "WARNING";
    LogLevels1[LogLevels1["ERROR"] = 40] = "ERROR";
    LogLevels1[LogLevels1["CRITICAL"] = 50] = "CRITICAL";
})(LogLevels || (LogLevels = {}));
Object.keys(LogLevels).filter((key5)=>isNaN(Number(key5)));
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
const { Deno: Deno4  } = globalThis;
const noColor = typeof Deno4?.noColor === "boolean" ? Deno4.noColor : true;
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
async function exists(filePath) {
    try {
        await Deno.lstat(filePath);
        return true;
    } catch (error1) {
        if (error1 instanceof Deno.errors.NotFound) {
            return false;
        }
        throw error1;
    }
}
function existsSync(filePath) {
    try {
        Deno.lstatSync(filePath);
        return true;
    } catch (error2) {
        if (error2 instanceof Deno.errors.NotFound) {
            return false;
        }
        throw error2;
    }
}
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
    reset(w3) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w3;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p9 = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p9.length){
                nwritten += await this.#writer.write(p9.subarray(nwritten));
            }
        } catch (e2) {
            if (e2 instanceof Error) {
                this.err = e2;
            }
            throw e2;
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
                } catch (e3) {
                    if (e3 instanceof Error) {
                        this.err = e3;
                    }
                    throw e3;
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
    reset(w4) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w4;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p10 = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p10.length){
                nwritten += this.#writer.writeSync(p10.subarray(nwritten));
            }
        } catch (e4) {
            if (e4 instanceof Error) {
                this.err = e4;
            }
            throw e4;
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
                } catch (e5) {
                    if (e5 instanceof Error) {
                        this.err = e5;
                    }
                    throw e5;
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
    log(msg9) {
        if (this._encoder.encode(msg9).byteLength + 1 > this._buf.available()) {
            this.flush();
        }
        this._buf.writeSync(this._encoder.encode(msg9 + "\n"));
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
class RotatingFileHandler extends FileHandler {
    #maxBytes;
    #maxBackupCount;
    #currentFileSize = 0;
    constructor(levelName, options){
        super(levelName, options);
        this.#maxBytes = options.maxBytes;
        this.#maxBackupCount = options.maxBackupCount;
    }
    async setup() {
        if (this.#maxBytes < 1) {
            this.destroy();
            throw new Error("maxBytes cannot be less than 1");
        }
        if (this.#maxBackupCount < 1) {
            this.destroy();
            throw new Error("maxBackupCount cannot be less than 1");
        }
        await super.setup();
        if (this._mode === "w") {
            for(let i37 = 1; i37 <= this.#maxBackupCount; i37++){
                try {
                    await Deno.remove(this._filename + "." + i37);
                } catch (error3) {
                    if (!(error3 instanceof Deno.errors.NotFound)) {
                        throw error3;
                    }
                }
            }
        } else if (this._mode === "x") {
            for(let i38 = 1; i38 <= this.#maxBackupCount; i38++){
                if (await exists(this._filename + "." + i38)) {
                    this.destroy();
                    throw new Deno.errors.AlreadyExists("Backup log file " + this._filename + "." + i38 + " already exists");
                }
            }
        } else {
            this.#currentFileSize = (await Deno.stat(this._filename)).size;
        }
    }
    log(msg10) {
        const msgByteLength = this._encoder.encode(msg10).byteLength + 1;
        if (this.#currentFileSize + msgByteLength > this.#maxBytes) {
            this.rotateLogFiles();
            this.#currentFileSize = 0;
        }
        super.log(msg10);
        this.#currentFileSize += msgByteLength;
    }
    rotateLogFiles() {
        this._buf.flush();
        this._file.close();
        for(let i39 = this.#maxBackupCount - 1; i39 >= 0; i39--){
            const source = this._filename + (i39 === 0 ? "" : "." + i39);
            const dest = this._filename + "." + (i39 + 1);
            if (existsSync(source)) {
                Deno.renameSync(source, dest);
            }
        }
        this._file = Deno.openSync(this._filename, this._openOptions);
        this._writer = this._file;
        this._buf = new BufWriterSync(this._file);
    }
}
class LoggerConfig {
    level;
    handlers;
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
const handlers = {
    BaseHandler,
    ConsoleHandler,
    WriterHandler,
    FileHandler,
    RotatingFileHandler
};
function getLogger(name) {
    if (!name) {
        const d5 = state.loggers.get("default");
        assert(d5 != null, `"default" logger must be set for getting logger without name`);
        return d5;
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
function debug(msg11, ...args6) {
    if (msg11 instanceof Function) {
        return getLogger("default").debug(msg11, ...args6);
    }
    return getLogger("default").debug(msg11, ...args6);
}
function info(msg12, ...args7) {
    if (msg12 instanceof Function) {
        return getLogger("default").info(msg12, ...args7);
    }
    return getLogger("default").info(msg12, ...args7);
}
function warning(msg13, ...args8) {
    if (msg13 instanceof Function) {
        return getLogger("default").warning(msg13, ...args8);
    }
    return getLogger("default").warning(msg13, ...args8);
}
function error(msg14, ...args9) {
    if (msg14 instanceof Function) {
        return getLogger("default").error(msg14, ...args9);
    }
    return getLogger("default").error(msg14, ...args9);
}
function critical(msg15, ...args10) {
    if (msg15 instanceof Function) {
        return getLogger("default").critical(msg15, ...args10);
    }
    return getLogger("default").critical(msg15, ...args10);
}
function setup(config2) {
    state.config = {
        handlers: {
            ...DEFAULT_CONFIG.handlers,
            ...config2.handlers
        },
        loggers: {
            ...DEFAULT_CONFIG.loggers,
            ...config2.loggers
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
const mod6 = {
    LogLevels: LogLevels,
    Logger: Logger,
    LoggerConfig: LoggerConfig,
    handlers: handlers,
    getLogger: getLogger,
    debug: debug,
    info: info,
    warning: warning,
    error: error,
    critical: critical,
    setup: setup
};
function delay(ms1, options = {}) {
    const { signal , persistent  } = options;
    if (signal?.aborted) {
        return Promise.reject(new DOMException("Delay was aborted.", "AbortError"));
    }
    return new Promise((resolve6, reject)=>{
        const abort = ()=>{
            clearTimeout(i40);
            reject(new DOMException("Delay was aborted.", "AbortError"));
        };
        const done = ()=>{
            signal?.removeEventListener("abort", abort);
            resolve6();
        };
        const i40 = setTimeout(done, ms1);
        signal?.addEventListener("abort", abort, {
            once: true
        });
        if (persistent === false) {
            try {
                Deno.unrefTimer(i40);
            } catch (error4) {
                if (!(error4 instanceof ReferenceError)) {
                    throw error4;
                }
                console.error("`persistent` option is only available in Deno");
            }
        }
    });
}
const ERROR_SERVER_CLOSED = "Server closed";
const INITIAL_ACCEPT_BACKOFF_DELAY = 5;
const MAX_ACCEPT_BACKOFF_DELAY = 1000;
class Server {
    #port;
    #host;
    #handler;
    #closed = false;
    #listeners = new Set();
    #acceptBackoffDelayAbortController = new AbortController();
    #httpConnections = new Set();
    #onError;
    constructor(serverInit){
        this.#port = serverInit.port;
        this.#host = serverInit.hostname;
        this.#handler = serverInit.handler;
        this.#onError = serverInit.onError ?? function(error5) {
            console.error(error5);
            return new Response("Internal Server Error", {
                status: 500
            });
        };
    }
    async serve(listener) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#trackListener(listener);
        try {
            return await this.#accept(listener);
        } finally{
            this.#untrackListener(listener);
            try {
                listener.close();
            } catch  {}
        }
    }
    async listenAndServe() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listen({
            port: this.#port ?? 80,
            hostname: this.#host ?? "0.0.0.0",
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    async listenAndServeTls(certFile, keyFile) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listenTls({
            port: this.#port ?? 443,
            hostname: this.#host ?? "0.0.0.0",
            certFile,
            keyFile,
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    close() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#closed = true;
        for (const listener of this.#listeners){
            try {
                listener.close();
            } catch  {}
        }
        this.#listeners.clear();
        this.#acceptBackoffDelayAbortController.abort();
        for (const httpConn of this.#httpConnections){
            this.#closeHttpConn(httpConn);
        }
        this.#httpConnections.clear();
    }
    get closed() {
        return this.#closed;
    }
    get addrs() {
        return Array.from(this.#listeners).map((listener)=>listener.addr);
    }
    async #respond(requestEvent, connInfo) {
        let response;
        try {
            response = await this.#handler(requestEvent.request, connInfo);
            if (response.bodyUsed && response.body !== null) {
                throw new TypeError("Response body already consumed.");
            }
        } catch (error) {
            response = await this.#onError(error);
        }
        try {
            await requestEvent.respondWith(response);
        } catch  {}
    }
    async #serveHttp(httpConn, connInfo1) {
        while(!this.#closed){
            let requestEvent;
            try {
                requestEvent = await httpConn.nextRequest();
            } catch  {
                break;
            }
            if (requestEvent === null) {
                break;
            }
            this.#respond(requestEvent, connInfo1);
        }
        this.#closeHttpConn(httpConn);
    }
    async #accept(listener) {
        let acceptBackoffDelay;
        while(!this.#closed){
            let conn;
            try {
                conn = await listener.accept();
            } catch (error) {
                if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
                    if (!acceptBackoffDelay) {
                        acceptBackoffDelay = INITIAL_ACCEPT_BACKOFF_DELAY;
                    } else {
                        acceptBackoffDelay *= 2;
                    }
                    if (acceptBackoffDelay >= 1000) {
                        acceptBackoffDelay = MAX_ACCEPT_BACKOFF_DELAY;
                    }
                    try {
                        await delay(acceptBackoffDelay, {
                            signal: this.#acceptBackoffDelayAbortController.signal
                        });
                    } catch (err) {
                        if (!(err instanceof DOMException && err.name === "AbortError")) {
                            throw err;
                        }
                    }
                    continue;
                }
                throw error;
            }
            acceptBackoffDelay = undefined;
            let httpConn;
            try {
                httpConn = Deno.serveHttp(conn);
            } catch  {
                continue;
            }
            this.#trackHttpConnection(httpConn);
            const connInfo = {
                localAddr: conn.localAddr,
                remoteAddr: conn.remoteAddr
            };
            this.#serveHttp(httpConn, connInfo);
        }
    }
     #closeHttpConn(httpConn1) {
        this.#untrackHttpConnection(httpConn1);
        try {
            httpConn1.close();
        } catch  {}
    }
     #trackListener(listener1) {
        this.#listeners.add(listener1);
    }
     #untrackListener(listener2) {
        this.#listeners.delete(listener2);
    }
     #trackHttpConnection(httpConn2) {
        this.#httpConnections.add(httpConn2);
    }
     #untrackHttpConnection(httpConn3) {
        this.#httpConnections.delete(httpConn3);
    }
}
function hostnameForDisplay(hostname) {
    return hostname === "0.0.0.0" ? "localhost" : hostname;
}
async function serve(handler, options = {}) {
    let port = options.port ?? 8000;
    const hostname = options.hostname ?? "0.0.0.0";
    const server = new Server({
        port,
        hostname,
        handler,
        onError: options.onError
    });
    options?.signal?.addEventListener("abort", ()=>server.close(), {
        once: true
    });
    const s5 = server.listenAndServe();
    port = server.addrs[0].port;
    if ("onListen" in options) {
        options.onListen?.({
            port,
            hostname
        });
    } else {
        console.log(`Listening on http://${hostnameForDisplay(hostname)}:${port}/`);
    }
    return await s5;
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
    for(let i41 = 0; i41 < dst.length; i41++){
        const v8 = src[i41];
        dst[i41 * 2] = hexTable[v8 >> 4];
        dst[i41 * 2 + 1] = hexTable[v8 & 0x0f];
    }
    return dst;
}
function decode(src) {
    const dst = new Uint8Array(src.length / 2);
    for(let i42 = 0; i42 < dst.length; i42++){
        const a6 = fromHexChar(src[i42 * 2]);
        const b8 = fromHexChar(src[i42 * 2 + 1]);
        dst[i42] = a6 << 4 | b8;
    }
    if (src.length % 2 == 1) {
        fromHexChar(src[dst.length * 2]);
        throw errLength();
    }
    return dst;
}
function toIMF(date) {
    function dtPad(v9, lPad = 2) {
        return v9.padStart(lPad, "0");
    }
    const d6 = dtPad(date.getUTCDate().toString());
    const h6 = dtPad(date.getUTCHours().toString());
    const min = dtPad(date.getUTCMinutes().toString());
    const s6 = dtPad(date.getUTCSeconds().toString());
    const y7 = date.getUTCFullYear();
    const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec", 
    ];
    return `${days[date.getUTCDay()]}, ${d6} ${months[date.getUTCMonth()]} ${y7} ${h6}:${min}:${s6} GMT`;
}
const FIELD_CONTENT_REGEXP = /^(?=[\x20-\x7E]*$)[^()@<>,;:\\"\[\]?={}\s]+$/;
function toString(cookie) {
    if (!cookie.name) {
        return "";
    }
    const out = [];
    validateName(cookie.name);
    validateValue(cookie.name, cookie.value);
    out.push(`${cookie.name}=${cookie.value}`);
    if (cookie.name.startsWith("__Secure")) {
        cookie.secure = true;
    }
    if (cookie.name.startsWith("__Host")) {
        cookie.path = "/";
        cookie.secure = true;
        delete cookie.domain;
    }
    if (cookie.secure) {
        out.push("Secure");
    }
    if (cookie.httpOnly) {
        out.push("HttpOnly");
    }
    if (typeof cookie.maxAge === "number" && Number.isInteger(cookie.maxAge)) {
        assert(cookie.maxAge >= 0, "Max-Age must be an integer superior or equal to 0");
        out.push(`Max-Age=${cookie.maxAge}`);
    }
    if (cookie.domain) {
        validateDomain(cookie.domain);
        out.push(`Domain=${cookie.domain}`);
    }
    if (cookie.sameSite) {
        out.push(`SameSite=${cookie.sameSite}`);
    }
    if (cookie.path) {
        validatePath(cookie.path);
        out.push(`Path=${cookie.path}`);
    }
    if (cookie.expires) {
        const { expires  } = cookie;
        const dateString = toIMF(typeof expires === "number" ? new Date(expires) : expires);
        out.push(`Expires=${dateString}`);
    }
    if (cookie.unparsed) {
        out.push(cookie.unparsed.join("; "));
    }
    return out.join("; ");
}
function validateName(name) {
    if (name && !FIELD_CONTENT_REGEXP.test(name)) {
        throw new TypeError(`Invalid cookie name: "${name}".`);
    }
}
function validatePath(path52) {
    if (path52 == null) {
        return;
    }
    for(let i43 = 0; i43 < path52.length; i43++){
        const c8 = path52.charAt(i43);
        if (c8 < String.fromCharCode(0x20) || c8 > String.fromCharCode(0x7E) || c8 == ";") {
            throw new Error(path52 + ": Invalid cookie path char '" + c8 + "'");
        }
    }
}
function validateValue(name, value) {
    if (value == null || name == null) return;
    for(let i44 = 0; i44 < value.length; i44++){
        const c9 = value.charAt(i44);
        if (c9 < String.fromCharCode(0x21) || c9 == String.fromCharCode(0x22) || c9 == String.fromCharCode(0x2c) || c9 == String.fromCharCode(0x3b) || c9 == String.fromCharCode(0x5c) || c9 == String.fromCharCode(0x7f)) {
            throw new Error("RFC2616 cookie '" + name + "' cannot contain character '" + c9 + "'");
        }
        if (c9 > String.fromCharCode(0x80)) {
            throw new Error("RFC2616 cookie '" + name + "' can only have US-ASCII chars as value" + c9.charCodeAt(0).toString(16));
        }
    }
}
function validateDomain(domain) {
    if (domain == null) {
        return;
    }
    const char1 = domain.charAt(0);
    const charN = domain.charAt(domain.length - 1);
    if (char1 == "-" || charN == "." || charN == "-") {
        throw new Error("Invalid first/last char in cookie domain: " + domain);
    }
}
function getCookies(headers) {
    const cookie = headers.get("Cookie");
    if (cookie != null) {
        const out = {};
        const c10 = cookie.split(";");
        for (const kv of c10){
            const [cookieKey, ...cookieVal] = kv.split("=");
            assert(cookieKey != null);
            const key6 = cookieKey.trim();
            out[key6] = cookieVal.join("=");
        }
        return out;
    }
    return {};
}
function setCookie(headers, cookie) {
    const v10 = toString(cookie);
    if (v10) {
        headers.append("Set-Cookie", v10);
    }
}
function deleteCookie(headers, name, attributes) {
    setCookie(headers, {
        name: name,
        value: "",
        expires: new Date(0),
        ...attributes
    });
}
function parseSetCookie(value) {
    const attrs = value.split(";").map((attr)=>{
        const [key7, ...values] = attr.trim().split("=");
        return [
            key7,
            values.join("=")
        ];
    });
    const cookie = {
        name: attrs[0][0],
        value: attrs[0][1]
    };
    for (const [key1, value1] of attrs.slice(1)){
        switch(key1.toLocaleLowerCase()){
            case "expires":
                cookie.expires = new Date(value1);
                break;
            case "max-age":
                cookie.maxAge = Number(value1);
                if (cookie.maxAge < 0) {
                    console.warn("Max-Age must be an integer superior or equal to 0. Cookie ignored.");
                    return null;
                }
                break;
            case "domain":
                cookie.domain = value1;
                break;
            case "path":
                cookie.path = value1;
                break;
            case "secure":
                cookie.secure = true;
                break;
            case "httponly":
                cookie.httpOnly = true;
                break;
            case "samesite":
                cookie.sameSite = value1;
                break;
            default:
                if (!Array.isArray(cookie.unparsed)) {
                    cookie.unparsed = [];
                }
                cookie.unparsed.push([
                    key1,
                    value1
                ].join("="));
        }
    }
    if (cookie.name.startsWith("__Secure-")) {
        if (!cookie.secure) {
            console.warn("Cookies with names starting with `__Secure-` must be set with the secure flag. Cookie ignored.");
            return null;
        }
    }
    if (cookie.name.startsWith("__Host-")) {
        if (!cookie.secure) {
            console.warn("Cookies with names starting with `__Host-` must be set with the secure flag. Cookie ignored.");
            return null;
        }
        if (cookie.domain !== undefined) {
            console.warn("Cookies with names starting with `__Host-` must not have a domain specified. Cookie ignored.");
            return null;
        }
        if (cookie.path !== "/") {
            console.warn("Cookies with names starting with `__Host-` must have path be `/`. Cookie has been ignored.");
            return null;
        }
    }
    return cookie;
}
function getSetCookies(headers) {
    if (!headers.has("set-cookie")) {
        return [];
    }
    return [
        ...headers.entries()
    ].filter(([key8])=>key8 === "set-cookie").map(([_, value])=>value).map(parseSetCookie).filter(Boolean);
}
const mod7 = {
    getCookies: getCookies,
    setCookie: setCookie,
    deleteCookie: deleteCookie,
    getSetCookies: getSetCookies
};
const { hasOwn  } = Object;
function filterValues(record, predicate) {
    const ret = {};
    const entries = Object.entries(record);
    for (const [key9, value] of entries){
        if (predicate(value)) {
            ret[key9] = value;
        }
    }
    return ret;
}
function withoutAll(array, values) {
    const toExclude = new Set(values);
    return array.filter((it3)=>!toExclude.has(it3));
}
const RE_KeyValue = /^\s*(?:export\s+)?(?<key>[a-zA-Z_]+[a-zA-Z0-9_]*?)\s*=[\ \t]*('\n?(?<notInterpolated>(.|\n)*?)\n?'|"\n?(?<interpolated>(.|\n)*?)\n?"|(?<unquoted>[^\n#]*)) *#*.*$/gm;
const RE_ExpandValue = /(\${(?<inBrackets>.+?)(\:-(?<inBracketsDefault>.+))?}|(?<!\\)\$(?<notInBrackets>\w+)(\:-(?<notInBracketsDefault>.+))?)/g;
function parse6(rawDotenv, restrictEnvAccessTo = []) {
    const env1 = {};
    let match;
    const keysForExpandCheck = [];
    while((match = RE_KeyValue.exec(rawDotenv)) != null){
        const { key: key10 , interpolated , notInterpolated , unquoted  } = match?.groups;
        if (unquoted) {
            keysForExpandCheck.push(key10);
        }
        env1[key10] = typeof notInterpolated === "string" ? notInterpolated : typeof interpolated === "string" ? expandCharacters(interpolated) : unquoted.trim();
    }
    const variablesMap = {
        ...env1,
        ...readEnv(restrictEnvAccessTo)
    };
    keysForExpandCheck.forEach((key11)=>{
        env1[key11] = expand(env1[key11], variablesMap);
    });
    return env1;
}
async function load({ envPath: envPath1 = ".env" , examplePath =".env.example" , defaultsPath =".env.defaults" , export: _export = false , allowEmptyValues =false , restrictEnvAccessTo =[]  } = {}) {
    const conf = await parseFile(envPath1, restrictEnvAccessTo);
    if (defaultsPath) {
        const confDefaults = await parseFile(defaultsPath, restrictEnvAccessTo);
        for(const key12 in confDefaults){
            if (!(key12 in conf)) {
                conf[key12] = confDefaults[key12];
            }
        }
    }
    if (examplePath) {
        const confExample = await parseFile(examplePath, restrictEnvAccessTo);
        assertSafe(conf, confExample, allowEmptyValues, restrictEnvAccessTo);
    }
    if (_export) {
        for(const key13 in conf){
            if (Deno.env.get(key13) !== undefined) continue;
            Deno.env.set(key13, conf[key13]);
        }
    }
    return conf;
}
async function parseFile(filepath, restrictEnvAccessTo = []) {
    try {
        return parse6(await Deno.readTextFile(filepath), restrictEnvAccessTo);
    } catch (e6) {
        if (e6 instanceof Deno.errors.NotFound) return {};
        throw e6;
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
var R = Object.create;
var d = Object.defineProperty;
var z = Object.getOwnPropertyDescriptor;
var F = Object.getOwnPropertyNames;
var I = Object.getPrototypeOf, k = Object.prototype.hasOwnProperty;
var x = (t1, e7)=>()=>(e7 || t1((e7 = {
            exports: {}
        }).exports, e7), e7.exports), E = (t2, e8)=>{
    for(var n4 in e8)d(t2, n4, {
        get: e8[n4],
        enumerable: !0
    });
}, m = (t3, e9, n5, r2)=>{
    if (e9 && typeof e9 == "object" || typeof e9 == "function") for (let a7 of F(e9))!k.call(t3, a7) && a7 !== n5 && d(t3, a7, {
        get: ()=>e9[a7],
        enumerable: !(r2 = z(e9, a7)) || r2.enumerable
    });
    return t3;
}, i = (t4, e10, n6)=>(m(t4, e10, "default"), n6 && m(n6, e10, "default")), f = (t5, e11, n7)=>(n7 = t5 != null ? R(I(t5)) : {}, m(e11 || !t5 || !t5.__esModule ? d(n7, "default", {
        value: t5,
        enumerable: !0
    }) : n7, t5));
var b = x((xe, w5)=>{
    "use strict";
    var C5 = "bold|bolder|lighter|[1-9]00", y8 = "italic|oblique", $3 = "small-caps", P4 = "ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded", V6 = "px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q", h7 = `'([^']+)'|"([^"]+)"|[\\w\\s-]+`, _6 = new RegExp(`(${C5}) +`, "i"), q5 = new RegExp(`(${y8}) +`, "i"), O3 = new RegExp(`(${$3}) +`, "i"), j13 = new RegExp(`(${P4}) +`, "i"), G5 = new RegExp(`([\\d\\.]+)(${V6}) *((?:${h7})( *, *(?:${h7}))*)`), g5 = {}, M5 = 16;
    w5.exports = (t6)=>{
        if (g5[t6]) return g5[t6];
        let e12 = G5.exec(t6);
        if (!e12) return;
        let n8 = {
            weight: "normal",
            style: "normal",
            stretch: "normal",
            variant: "normal",
            size: parseFloat(e12[1]),
            unit: e12[2],
            family: e12[3].replace(/["']/g, "").replace(/ *, */g, ",")
        }, r3, a8, c11, p11, l5 = t6.substring(0, e12.index);
        switch((r3 = _6.exec(l5)) && (n8.weight = r3[1]), (a8 = q5.exec(l5)) && (n8.style = a8[1]), (c11 = O3.exec(l5)) && (n8.variant = c11[1]), (p11 = j13.exec(l5)) && (n8.stretch = p11[1]), n8.unit){
            case "pt":
                n8.size /= .75;
                break;
            case "pc":
                n8.size *= 16;
                break;
            case "in":
                n8.size *= 96;
                break;
            case "cm":
                n8.size *= 96 / 2.54;
                break;
            case "mm":
                n8.size *= 96 / 25.4;
                break;
            case "%":
                break;
            case "em":
            case "rem":
                n8.size *= M5 / .75;
                break;
            case "q":
                n8.size *= 96 / 25.4 / 4;
                break;
        }
        return g5[t6] = n8;
    };
});
var u = x((o3)=>{
    var S5 = b();
    o3.parseFont = S5;
    o3.createCanvas = function(t7, e13) {
        return Object.assign(document.createElement("canvas"), {
            width: t7,
            height: e13
        });
    };
    o3.createImageData = function(t8, e14, n9) {
        switch(arguments.length){
            case 0:
                return new ImageData;
            case 1:
                return new ImageData(t8);
            case 2:
                return new ImageData(t8, e14);
            default:
                return new ImageData(t8, e14, n9);
        }
    };
    o3.loadImage = function(t9, e15) {
        return new Promise(function(n10, r4) {
            let a9 = Object.assign(document.createElement("img"), e15);
            function c12() {
                a9.onload = null, a9.onerror = null;
            }
            a9.onload = function() {
                c12(), n10(a9);
            }, a9.onerror = function() {
                c12(), r4(new Error('Failed to load the image "' + t9 + '"'));
            }, a9.src = t9;
        });
    };
});
var s = {};
E(s, {
    Canvas: ()=>A,
    CanvasGradient: ()=>N,
    CanvasPattern: ()=>B,
    CanvasRenderingContext2D: ()=>J,
    Context2d: ()=>H,
    DOMMatrix: ()=>W,
    DOMPoint: ()=>X,
    Image: ()=>K,
    ImageData: ()=>L,
    JPEGStream: ()=>U,
    PDFStream: ()=>T,
    PNGStream: ()=>Q,
    backends: ()=>se,
    cairoVersion: ()=>ie,
    createCanvas: ()=>te,
    createImageData: ()=>ne,
    default: ()=>ue,
    deregisterAllFonts: ()=>Z,
    freetypeVersion: ()=>le,
    gifVersion: ()=>oe,
    jpegVersion: ()=>ce,
    loadImage: ()=>ae,
    pangoVersion: ()=>de,
    parseFont: ()=>ee,
    registerFont: ()=>Y,
    rsvgVersion: ()=>me,
    version: ()=>re
});
var D = f(u());
i(s, f(u()));
var { Canvas: A , Context2d: H , CanvasRenderingContext2D: J , CanvasGradient: N , CanvasPattern: B , Image: K , ImageData: L , PNGStream: Q , PDFStream: T , JPEGStream: U , DOMMatrix: W , DOMPoint: X , registerFont: Y , deregisterAllFonts: Z , parseFont: ee , createCanvas: te , createImageData: ne , loadImage: ae , backends: se , version: re , cairoVersion: ie , jpegVersion: ce , gifVersion: oe , freetypeVersion: le , rsvgVersion: me , pangoVersion: de  } = D, { default: v , ...ge } = D, ue = v !== void 0 ? v : ge;
const mod8 = {
    Canvas: A,
    CanvasGradient: N,
    CanvasPattern: B,
    CanvasRenderingContext2D: J,
    Context2d: H,
    DOMMatrix: W,
    DOMPoint: X,
    Image: K,
    ImageData: L,
    JPEGStream: U,
    PDFStream: T,
    PNGStream: Q,
    backends: se,
    cairoVersion: ie,
    createCanvas: te,
    createImageData: ne,
    default: ue,
    deregisterAllFonts: Z,
    freetypeVersion: le,
    gifVersion: oe,
    jpegVersion: ce,
    loadImage: ae,
    pangoVersion: de,
    parseFont: ee,
    registerFont: Y,
    rsvgVersion: me,
    version: re
};
class DenoStdInternalError2 extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function unreachable() {
    throw new DenoStdInternalError2("unreachable");
}
const osType2 = (()=>{
    const { Deno  } = globalThis;
    if (typeof Deno?.build?.os === "string") {
        return Deno.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win")) {
        return "windows";
    }
    return "linux";
})();
const codeToErrorWindows = [
    [
        -4093,
        [
            "E2BIG",
            "argument list too long"
        ]
    ],
    [
        -4092,
        [
            "EACCES",
            "permission denied"
        ]
    ],
    [
        -4091,
        [
            "EADDRINUSE",
            "address already in use"
        ]
    ],
    [
        -4090,
        [
            "EADDRNOTAVAIL",
            "address not available"
        ]
    ],
    [
        -4089,
        [
            "EAFNOSUPPORT",
            "address family not supported"
        ]
    ],
    [
        -4088,
        [
            "EAGAIN",
            "resource temporarily unavailable"
        ]
    ],
    [
        -3000,
        [
            "EAI_ADDRFAMILY",
            "address family not supported"
        ]
    ],
    [
        -3001,
        [
            "EAI_AGAIN",
            "temporary failure"
        ]
    ],
    [
        -3002,
        [
            "EAI_BADFLAGS",
            "bad ai_flags value"
        ]
    ],
    [
        -3013,
        [
            "EAI_BADHINTS",
            "invalid value for hints"
        ]
    ],
    [
        -3003,
        [
            "EAI_CANCELED",
            "request canceled"
        ]
    ],
    [
        -3004,
        [
            "EAI_FAIL",
            "permanent failure"
        ]
    ],
    [
        -3005,
        [
            "EAI_FAMILY",
            "ai_family not supported"
        ]
    ],
    [
        -3006,
        [
            "EAI_MEMORY",
            "out of memory"
        ]
    ],
    [
        -3007,
        [
            "EAI_NODATA",
            "no address"
        ]
    ],
    [
        -3008,
        [
            "EAI_NONAME",
            "unknown node or service"
        ]
    ],
    [
        -3009,
        [
            "EAI_OVERFLOW",
            "argument buffer overflow"
        ]
    ],
    [
        -3014,
        [
            "EAI_PROTOCOL",
            "resolved protocol is unknown"
        ]
    ],
    [
        -3010,
        [
            "EAI_SERVICE",
            "service not available for socket type"
        ]
    ],
    [
        -3011,
        [
            "EAI_SOCKTYPE",
            "socket type not supported"
        ]
    ],
    [
        -4084,
        [
            "EALREADY",
            "connection already in progress"
        ]
    ],
    [
        -4083,
        [
            "EBADF",
            "bad file descriptor"
        ]
    ],
    [
        -4082,
        [
            "EBUSY",
            "resource busy or locked"
        ]
    ],
    [
        -4081,
        [
            "ECANCELED",
            "operation canceled"
        ]
    ],
    [
        -4080,
        [
            "ECHARSET",
            "invalid Unicode character"
        ]
    ],
    [
        -4079,
        [
            "ECONNABORTED",
            "software caused connection abort"
        ]
    ],
    [
        -4078,
        [
            "ECONNREFUSED",
            "connection refused"
        ]
    ],
    [
        -4077,
        [
            "ECONNRESET",
            "connection reset by peer"
        ]
    ],
    [
        -4076,
        [
            "EDESTADDRREQ",
            "destination address required"
        ]
    ],
    [
        -4075,
        [
            "EEXIST",
            "file already exists"
        ]
    ],
    [
        -4074,
        [
            "EFAULT",
            "bad address in system call argument"
        ]
    ],
    [
        -4036,
        [
            "EFBIG",
            "file too large"
        ]
    ],
    [
        -4073,
        [
            "EHOSTUNREACH",
            "host is unreachable"
        ]
    ],
    [
        -4072,
        [
            "EINTR",
            "interrupted system call"
        ]
    ],
    [
        -4071,
        [
            "EINVAL",
            "invalid argument"
        ]
    ],
    [
        -4070,
        [
            "EIO",
            "i/o error"
        ]
    ],
    [
        -4069,
        [
            "EISCONN",
            "socket is already connected"
        ]
    ],
    [
        -4068,
        [
            "EISDIR",
            "illegal operation on a directory"
        ]
    ],
    [
        -4067,
        [
            "ELOOP",
            "too many symbolic links encountered"
        ]
    ],
    [
        -4066,
        [
            "EMFILE",
            "too many open files"
        ]
    ],
    [
        -4065,
        [
            "EMSGSIZE",
            "message too long"
        ]
    ],
    [
        -4064,
        [
            "ENAMETOOLONG",
            "name too long"
        ]
    ],
    [
        -4063,
        [
            "ENETDOWN",
            "network is down"
        ]
    ],
    [
        -4062,
        [
            "ENETUNREACH",
            "network is unreachable"
        ]
    ],
    [
        -4061,
        [
            "ENFILE",
            "file table overflow"
        ]
    ],
    [
        -4060,
        [
            "ENOBUFS",
            "no buffer space available"
        ]
    ],
    [
        -4059,
        [
            "ENODEV",
            "no such device"
        ]
    ],
    [
        -4058,
        [
            "ENOENT",
            "no such file or directory"
        ]
    ],
    [
        -4057,
        [
            "ENOMEM",
            "not enough memory"
        ]
    ],
    [
        -4056,
        [
            "ENONET",
            "machine is not on the network"
        ]
    ],
    [
        -4035,
        [
            "ENOPROTOOPT",
            "protocol not available"
        ]
    ],
    [
        -4055,
        [
            "ENOSPC",
            "no space left on device"
        ]
    ],
    [
        -4054,
        [
            "ENOSYS",
            "function not implemented"
        ]
    ],
    [
        -4053,
        [
            "ENOTCONN",
            "socket is not connected"
        ]
    ],
    [
        -4052,
        [
            "ENOTDIR",
            "not a directory"
        ]
    ],
    [
        -4051,
        [
            "ENOTEMPTY",
            "directory not empty"
        ]
    ],
    [
        -4050,
        [
            "ENOTSOCK",
            "socket operation on non-socket"
        ]
    ],
    [
        -4049,
        [
            "ENOTSUP",
            "operation not supported on socket"
        ]
    ],
    [
        -4048,
        [
            "EPERM",
            "operation not permitted"
        ]
    ],
    [
        -4047,
        [
            "EPIPE",
            "broken pipe"
        ]
    ],
    [
        -4046,
        [
            "EPROTO",
            "protocol error"
        ]
    ],
    [
        -4045,
        [
            "EPROTONOSUPPORT",
            "protocol not supported"
        ]
    ],
    [
        -4044,
        [
            "EPROTOTYPE",
            "protocol wrong type for socket"
        ]
    ],
    [
        -4034,
        [
            "ERANGE",
            "result too large"
        ]
    ],
    [
        -4043,
        [
            "EROFS",
            "read-only file system"
        ]
    ],
    [
        -4042,
        [
            "ESHUTDOWN",
            "cannot send after transport endpoint shutdown"
        ]
    ],
    [
        -4041,
        [
            "ESPIPE",
            "invalid seek"
        ]
    ],
    [
        -4040,
        [
            "ESRCH",
            "no such process"
        ]
    ],
    [
        -4039,
        [
            "ETIMEDOUT",
            "connection timed out"
        ]
    ],
    [
        -4038,
        [
            "ETXTBSY",
            "text file is busy"
        ]
    ],
    [
        -4037,
        [
            "EXDEV",
            "cross-device link not permitted"
        ]
    ],
    [
        -4094,
        [
            "UNKNOWN",
            "unknown error"
        ]
    ],
    [
        -4095,
        [
            "EOF",
            "end of file"
        ]
    ],
    [
        -4033,
        [
            "ENXIO",
            "no such device or address"
        ]
    ],
    [
        -4032,
        [
            "EMLINK",
            "too many links"
        ]
    ],
    [
        -4031,
        [
            "EHOSTDOWN",
            "host is down"
        ]
    ],
    [
        -4030,
        [
            "EREMOTEIO",
            "remote I/O error"
        ]
    ],
    [
        -4029,
        [
            "ENOTTY",
            "inappropriate ioctl for device"
        ]
    ],
    [
        -4028,
        [
            "EFTYPE",
            "inappropriate file type or format"
        ]
    ],
    [
        -4027,
        [
            "EILSEQ",
            "illegal byte sequence"
        ]
    ], 
];
const errorToCodeWindows = codeToErrorWindows.map(([status, [error6]])=>[
        error6,
        status
    ]);
const codeToErrorDarwin = [
    [
        -7,
        [
            "E2BIG",
            "argument list too long"
        ]
    ],
    [
        -13,
        [
            "EACCES",
            "permission denied"
        ]
    ],
    [
        -48,
        [
            "EADDRINUSE",
            "address already in use"
        ]
    ],
    [
        -49,
        [
            "EADDRNOTAVAIL",
            "address not available"
        ]
    ],
    [
        -47,
        [
            "EAFNOSUPPORT",
            "address family not supported"
        ]
    ],
    [
        -35,
        [
            "EAGAIN",
            "resource temporarily unavailable"
        ]
    ],
    [
        -3000,
        [
            "EAI_ADDRFAMILY",
            "address family not supported"
        ]
    ],
    [
        -3001,
        [
            "EAI_AGAIN",
            "temporary failure"
        ]
    ],
    [
        -3002,
        [
            "EAI_BADFLAGS",
            "bad ai_flags value"
        ]
    ],
    [
        -3013,
        [
            "EAI_BADHINTS",
            "invalid value for hints"
        ]
    ],
    [
        -3003,
        [
            "EAI_CANCELED",
            "request canceled"
        ]
    ],
    [
        -3004,
        [
            "EAI_FAIL",
            "permanent failure"
        ]
    ],
    [
        -3005,
        [
            "EAI_FAMILY",
            "ai_family not supported"
        ]
    ],
    [
        -3006,
        [
            "EAI_MEMORY",
            "out of memory"
        ]
    ],
    [
        -3007,
        [
            "EAI_NODATA",
            "no address"
        ]
    ],
    [
        -3008,
        [
            "EAI_NONAME",
            "unknown node or service"
        ]
    ],
    [
        -3009,
        [
            "EAI_OVERFLOW",
            "argument buffer overflow"
        ]
    ],
    [
        -3014,
        [
            "EAI_PROTOCOL",
            "resolved protocol is unknown"
        ]
    ],
    [
        -3010,
        [
            "EAI_SERVICE",
            "service not available for socket type"
        ]
    ],
    [
        -3011,
        [
            "EAI_SOCKTYPE",
            "socket type not supported"
        ]
    ],
    [
        -37,
        [
            "EALREADY",
            "connection already in progress"
        ]
    ],
    [
        -9,
        [
            "EBADF",
            "bad file descriptor"
        ]
    ],
    [
        -16,
        [
            "EBUSY",
            "resource busy or locked"
        ]
    ],
    [
        -89,
        [
            "ECANCELED",
            "operation canceled"
        ]
    ],
    [
        -4080,
        [
            "ECHARSET",
            "invalid Unicode character"
        ]
    ],
    [
        -53,
        [
            "ECONNABORTED",
            "software caused connection abort"
        ]
    ],
    [
        -61,
        [
            "ECONNREFUSED",
            "connection refused"
        ]
    ],
    [
        -54,
        [
            "ECONNRESET",
            "connection reset by peer"
        ]
    ],
    [
        -39,
        [
            "EDESTADDRREQ",
            "destination address required"
        ]
    ],
    [
        -17,
        [
            "EEXIST",
            "file already exists"
        ]
    ],
    [
        -14,
        [
            "EFAULT",
            "bad address in system call argument"
        ]
    ],
    [
        -27,
        [
            "EFBIG",
            "file too large"
        ]
    ],
    [
        -65,
        [
            "EHOSTUNREACH",
            "host is unreachable"
        ]
    ],
    [
        -4,
        [
            "EINTR",
            "interrupted system call"
        ]
    ],
    [
        -22,
        [
            "EINVAL",
            "invalid argument"
        ]
    ],
    [
        -5,
        [
            "EIO",
            "i/o error"
        ]
    ],
    [
        -56,
        [
            "EISCONN",
            "socket is already connected"
        ]
    ],
    [
        -21,
        [
            "EISDIR",
            "illegal operation on a directory"
        ]
    ],
    [
        -62,
        [
            "ELOOP",
            "too many symbolic links encountered"
        ]
    ],
    [
        -24,
        [
            "EMFILE",
            "too many open files"
        ]
    ],
    [
        -40,
        [
            "EMSGSIZE",
            "message too long"
        ]
    ],
    [
        -63,
        [
            "ENAMETOOLONG",
            "name too long"
        ]
    ],
    [
        -50,
        [
            "ENETDOWN",
            "network is down"
        ]
    ],
    [
        -51,
        [
            "ENETUNREACH",
            "network is unreachable"
        ]
    ],
    [
        -23,
        [
            "ENFILE",
            "file table overflow"
        ]
    ],
    [
        -55,
        [
            "ENOBUFS",
            "no buffer space available"
        ]
    ],
    [
        -19,
        [
            "ENODEV",
            "no such device"
        ]
    ],
    [
        -2,
        [
            "ENOENT",
            "no such file or directory"
        ]
    ],
    [
        -12,
        [
            "ENOMEM",
            "not enough memory"
        ]
    ],
    [
        -4056,
        [
            "ENONET",
            "machine is not on the network"
        ]
    ],
    [
        -42,
        [
            "ENOPROTOOPT",
            "protocol not available"
        ]
    ],
    [
        -28,
        [
            "ENOSPC",
            "no space left on device"
        ]
    ],
    [
        -78,
        [
            "ENOSYS",
            "function not implemented"
        ]
    ],
    [
        -57,
        [
            "ENOTCONN",
            "socket is not connected"
        ]
    ],
    [
        -20,
        [
            "ENOTDIR",
            "not a directory"
        ]
    ],
    [
        -66,
        [
            "ENOTEMPTY",
            "directory not empty"
        ]
    ],
    [
        -38,
        [
            "ENOTSOCK",
            "socket operation on non-socket"
        ]
    ],
    [
        -45,
        [
            "ENOTSUP",
            "operation not supported on socket"
        ]
    ],
    [
        -1,
        [
            "EPERM",
            "operation not permitted"
        ]
    ],
    [
        -32,
        [
            "EPIPE",
            "broken pipe"
        ]
    ],
    [
        -100,
        [
            "EPROTO",
            "protocol error"
        ]
    ],
    [
        -43,
        [
            "EPROTONOSUPPORT",
            "protocol not supported"
        ]
    ],
    [
        -41,
        [
            "EPROTOTYPE",
            "protocol wrong type for socket"
        ]
    ],
    [
        -34,
        [
            "ERANGE",
            "result too large"
        ]
    ],
    [
        -30,
        [
            "EROFS",
            "read-only file system"
        ]
    ],
    [
        -58,
        [
            "ESHUTDOWN",
            "cannot send after transport endpoint shutdown"
        ]
    ],
    [
        -29,
        [
            "ESPIPE",
            "invalid seek"
        ]
    ],
    [
        -3,
        [
            "ESRCH",
            "no such process"
        ]
    ],
    [
        -60,
        [
            "ETIMEDOUT",
            "connection timed out"
        ]
    ],
    [
        -26,
        [
            "ETXTBSY",
            "text file is busy"
        ]
    ],
    [
        -18,
        [
            "EXDEV",
            "cross-device link not permitted"
        ]
    ],
    [
        -4094,
        [
            "UNKNOWN",
            "unknown error"
        ]
    ],
    [
        -4095,
        [
            "EOF",
            "end of file"
        ]
    ],
    [
        -6,
        [
            "ENXIO",
            "no such device or address"
        ]
    ],
    [
        -31,
        [
            "EMLINK",
            "too many links"
        ]
    ],
    [
        -64,
        [
            "EHOSTDOWN",
            "host is down"
        ]
    ],
    [
        -4030,
        [
            "EREMOTEIO",
            "remote I/O error"
        ]
    ],
    [
        -25,
        [
            "ENOTTY",
            "inappropriate ioctl for device"
        ]
    ],
    [
        -79,
        [
            "EFTYPE",
            "inappropriate file type or format"
        ]
    ],
    [
        -92,
        [
            "EILSEQ",
            "illegal byte sequence"
        ]
    ], 
];
const errorToCodeDarwin = codeToErrorDarwin.map(([status, [code29]])=>[
        code29,
        status
    ]);
const codeToErrorLinux = [
    [
        -7,
        [
            "E2BIG",
            "argument list too long"
        ]
    ],
    [
        -13,
        [
            "EACCES",
            "permission denied"
        ]
    ],
    [
        -98,
        [
            "EADDRINUSE",
            "address already in use"
        ]
    ],
    [
        -99,
        [
            "EADDRNOTAVAIL",
            "address not available"
        ]
    ],
    [
        -97,
        [
            "EAFNOSUPPORT",
            "address family not supported"
        ]
    ],
    [
        -11,
        [
            "EAGAIN",
            "resource temporarily unavailable"
        ]
    ],
    [
        -3000,
        [
            "EAI_ADDRFAMILY",
            "address family not supported"
        ]
    ],
    [
        -3001,
        [
            "EAI_AGAIN",
            "temporary failure"
        ]
    ],
    [
        -3002,
        [
            "EAI_BADFLAGS",
            "bad ai_flags value"
        ]
    ],
    [
        -3013,
        [
            "EAI_BADHINTS",
            "invalid value for hints"
        ]
    ],
    [
        -3003,
        [
            "EAI_CANCELED",
            "request canceled"
        ]
    ],
    [
        -3004,
        [
            "EAI_FAIL",
            "permanent failure"
        ]
    ],
    [
        -3005,
        [
            "EAI_FAMILY",
            "ai_family not supported"
        ]
    ],
    [
        -3006,
        [
            "EAI_MEMORY",
            "out of memory"
        ]
    ],
    [
        -3007,
        [
            "EAI_NODATA",
            "no address"
        ]
    ],
    [
        -3008,
        [
            "EAI_NONAME",
            "unknown node or service"
        ]
    ],
    [
        -3009,
        [
            "EAI_OVERFLOW",
            "argument buffer overflow"
        ]
    ],
    [
        -3014,
        [
            "EAI_PROTOCOL",
            "resolved protocol is unknown"
        ]
    ],
    [
        -3010,
        [
            "EAI_SERVICE",
            "service not available for socket type"
        ]
    ],
    [
        -3011,
        [
            "EAI_SOCKTYPE",
            "socket type not supported"
        ]
    ],
    [
        -114,
        [
            "EALREADY",
            "connection already in progress"
        ]
    ],
    [
        -9,
        [
            "EBADF",
            "bad file descriptor"
        ]
    ],
    [
        -16,
        [
            "EBUSY",
            "resource busy or locked"
        ]
    ],
    [
        -125,
        [
            "ECANCELED",
            "operation canceled"
        ]
    ],
    [
        -4080,
        [
            "ECHARSET",
            "invalid Unicode character"
        ]
    ],
    [
        -103,
        [
            "ECONNABORTED",
            "software caused connection abort"
        ]
    ],
    [
        -111,
        [
            "ECONNREFUSED",
            "connection refused"
        ]
    ],
    [
        -104,
        [
            "ECONNRESET",
            "connection reset by peer"
        ]
    ],
    [
        -89,
        [
            "EDESTADDRREQ",
            "destination address required"
        ]
    ],
    [
        -17,
        [
            "EEXIST",
            "file already exists"
        ]
    ],
    [
        -14,
        [
            "EFAULT",
            "bad address in system call argument"
        ]
    ],
    [
        -27,
        [
            "EFBIG",
            "file too large"
        ]
    ],
    [
        -113,
        [
            "EHOSTUNREACH",
            "host is unreachable"
        ]
    ],
    [
        -4,
        [
            "EINTR",
            "interrupted system call"
        ]
    ],
    [
        -22,
        [
            "EINVAL",
            "invalid argument"
        ]
    ],
    [
        -5,
        [
            "EIO",
            "i/o error"
        ]
    ],
    [
        -106,
        [
            "EISCONN",
            "socket is already connected"
        ]
    ],
    [
        -21,
        [
            "EISDIR",
            "illegal operation on a directory"
        ]
    ],
    [
        -40,
        [
            "ELOOP",
            "too many symbolic links encountered"
        ]
    ],
    [
        -24,
        [
            "EMFILE",
            "too many open files"
        ]
    ],
    [
        -90,
        [
            "EMSGSIZE",
            "message too long"
        ]
    ],
    [
        -36,
        [
            "ENAMETOOLONG",
            "name too long"
        ]
    ],
    [
        -100,
        [
            "ENETDOWN",
            "network is down"
        ]
    ],
    [
        -101,
        [
            "ENETUNREACH",
            "network is unreachable"
        ]
    ],
    [
        -23,
        [
            "ENFILE",
            "file table overflow"
        ]
    ],
    [
        -105,
        [
            "ENOBUFS",
            "no buffer space available"
        ]
    ],
    [
        -19,
        [
            "ENODEV",
            "no such device"
        ]
    ],
    [
        -2,
        [
            "ENOENT",
            "no such file or directory"
        ]
    ],
    [
        -12,
        [
            "ENOMEM",
            "not enough memory"
        ]
    ],
    [
        -64,
        [
            "ENONET",
            "machine is not on the network"
        ]
    ],
    [
        -92,
        [
            "ENOPROTOOPT",
            "protocol not available"
        ]
    ],
    [
        -28,
        [
            "ENOSPC",
            "no space left on device"
        ]
    ],
    [
        -38,
        [
            "ENOSYS",
            "function not implemented"
        ]
    ],
    [
        -107,
        [
            "ENOTCONN",
            "socket is not connected"
        ]
    ],
    [
        -20,
        [
            "ENOTDIR",
            "not a directory"
        ]
    ],
    [
        -39,
        [
            "ENOTEMPTY",
            "directory not empty"
        ]
    ],
    [
        -88,
        [
            "ENOTSOCK",
            "socket operation on non-socket"
        ]
    ],
    [
        -95,
        [
            "ENOTSUP",
            "operation not supported on socket"
        ]
    ],
    [
        -1,
        [
            "EPERM",
            "operation not permitted"
        ]
    ],
    [
        -32,
        [
            "EPIPE",
            "broken pipe"
        ]
    ],
    [
        -71,
        [
            "EPROTO",
            "protocol error"
        ]
    ],
    [
        -93,
        [
            "EPROTONOSUPPORT",
            "protocol not supported"
        ]
    ],
    [
        -91,
        [
            "EPROTOTYPE",
            "protocol wrong type for socket"
        ]
    ],
    [
        -34,
        [
            "ERANGE",
            "result too large"
        ]
    ],
    [
        -30,
        [
            "EROFS",
            "read-only file system"
        ]
    ],
    [
        -108,
        [
            "ESHUTDOWN",
            "cannot send after transport endpoint shutdown"
        ]
    ],
    [
        -29,
        [
            "ESPIPE",
            "invalid seek"
        ]
    ],
    [
        -3,
        [
            "ESRCH",
            "no such process"
        ]
    ],
    [
        -110,
        [
            "ETIMEDOUT",
            "connection timed out"
        ]
    ],
    [
        -26,
        [
            "ETXTBSY",
            "text file is busy"
        ]
    ],
    [
        -18,
        [
            "EXDEV",
            "cross-device link not permitted"
        ]
    ],
    [
        -4094,
        [
            "UNKNOWN",
            "unknown error"
        ]
    ],
    [
        -4095,
        [
            "EOF",
            "end of file"
        ]
    ],
    [
        -6,
        [
            "ENXIO",
            "no such device or address"
        ]
    ],
    [
        -31,
        [
            "EMLINK",
            "too many links"
        ]
    ],
    [
        -112,
        [
            "EHOSTDOWN",
            "host is down"
        ]
    ],
    [
        -121,
        [
            "EREMOTEIO",
            "remote I/O error"
        ]
    ],
    [
        -25,
        [
            "ENOTTY",
            "inappropriate ioctl for device"
        ]
    ],
    [
        -4028,
        [
            "EFTYPE",
            "inappropriate file type or format"
        ]
    ],
    [
        -84,
        [
            "EILSEQ",
            "illegal byte sequence"
        ]
    ], 
];
const errorToCodeLinux = codeToErrorLinux.map(([status, [code30]])=>[
        code30,
        status
    ]);
const codeToErrorFreebsd = [
    [
        -7,
        [
            "E2BIG",
            "argument list too long"
        ]
    ],
    [
        -13,
        [
            "EACCES",
            "permission denied"
        ]
    ],
    [
        -48,
        [
            "EADDRINUSE",
            "address already in use"
        ]
    ],
    [
        -49,
        [
            "EADDRNOTAVAIL",
            "address not available"
        ]
    ],
    [
        -47,
        [
            "EAFNOSUPPORT",
            "address family not supported"
        ]
    ],
    [
        -35,
        [
            "EAGAIN",
            "resource temporarily unavailable"
        ]
    ],
    [
        -3000,
        [
            "EAI_ADDRFAMILY",
            "address family not supported"
        ]
    ],
    [
        -3001,
        [
            "EAI_AGAIN",
            "temporary failure"
        ]
    ],
    [
        -3002,
        [
            "EAI_BADFLAGS",
            "bad ai_flags value"
        ]
    ],
    [
        -3013,
        [
            "EAI_BADHINTS",
            "invalid value for hints"
        ]
    ],
    [
        -3003,
        [
            "EAI_CANCELED",
            "request canceled"
        ]
    ],
    [
        -3004,
        [
            "EAI_FAIL",
            "permanent failure"
        ]
    ],
    [
        -3005,
        [
            "EAI_FAMILY",
            "ai_family not supported"
        ]
    ],
    [
        -3006,
        [
            "EAI_MEMORY",
            "out of memory"
        ]
    ],
    [
        -3007,
        [
            "EAI_NODATA",
            "no address"
        ]
    ],
    [
        -3008,
        [
            "EAI_NONAME",
            "unknown node or service"
        ]
    ],
    [
        -3009,
        [
            "EAI_OVERFLOW",
            "argument buffer overflow"
        ]
    ],
    [
        -3014,
        [
            "EAI_PROTOCOL",
            "resolved protocol is unknown"
        ]
    ],
    [
        -3010,
        [
            "EAI_SERVICE",
            "service not available for socket type"
        ]
    ],
    [
        -3011,
        [
            "EAI_SOCKTYPE",
            "socket type not supported"
        ]
    ],
    [
        -37,
        [
            "EALREADY",
            "connection already in progress"
        ]
    ],
    [
        -9,
        [
            "EBADF",
            "bad file descriptor"
        ]
    ],
    [
        -16,
        [
            "EBUSY",
            "resource busy or locked"
        ]
    ],
    [
        -85,
        [
            "ECANCELED",
            "operation canceled"
        ]
    ],
    [
        -4080,
        [
            "ECHARSET",
            "invalid Unicode character"
        ]
    ],
    [
        -53,
        [
            "ECONNABORTED",
            "software caused connection abort"
        ]
    ],
    [
        -61,
        [
            "ECONNREFUSED",
            "connection refused"
        ]
    ],
    [
        -54,
        [
            "ECONNRESET",
            "connection reset by peer"
        ]
    ],
    [
        -39,
        [
            "EDESTADDRREQ",
            "destination address required"
        ]
    ],
    [
        -17,
        [
            "EEXIST",
            "file already exists"
        ]
    ],
    [
        -14,
        [
            "EFAULT",
            "bad address in system call argument"
        ]
    ],
    [
        -27,
        [
            "EFBIG",
            "file too large"
        ]
    ],
    [
        -65,
        [
            "EHOSTUNREACH",
            "host is unreachable"
        ]
    ],
    [
        -4,
        [
            "EINTR",
            "interrupted system call"
        ]
    ],
    [
        -22,
        [
            "EINVAL",
            "invalid argument"
        ]
    ],
    [
        -5,
        [
            "EIO",
            "i/o error"
        ]
    ],
    [
        -56,
        [
            "EISCONN",
            "socket is already connected"
        ]
    ],
    [
        -21,
        [
            "EISDIR",
            "illegal operation on a directory"
        ]
    ],
    [
        -62,
        [
            "ELOOP",
            "too many symbolic links encountered"
        ]
    ],
    [
        -24,
        [
            "EMFILE",
            "too many open files"
        ]
    ],
    [
        -40,
        [
            "EMSGSIZE",
            "message too long"
        ]
    ],
    [
        -63,
        [
            "ENAMETOOLONG",
            "name too long"
        ]
    ],
    [
        -50,
        [
            "ENETDOWN",
            "network is down"
        ]
    ],
    [
        -51,
        [
            "ENETUNREACH",
            "network is unreachable"
        ]
    ],
    [
        -23,
        [
            "ENFILE",
            "file table overflow"
        ]
    ],
    [
        -55,
        [
            "ENOBUFS",
            "no buffer space available"
        ]
    ],
    [
        -19,
        [
            "ENODEV",
            "no such device"
        ]
    ],
    [
        -2,
        [
            "ENOENT",
            "no such file or directory"
        ]
    ],
    [
        -12,
        [
            "ENOMEM",
            "not enough memory"
        ]
    ],
    [
        -4056,
        [
            "ENONET",
            "machine is not on the network"
        ]
    ],
    [
        -42,
        [
            "ENOPROTOOPT",
            "protocol not available"
        ]
    ],
    [
        -28,
        [
            "ENOSPC",
            "no space left on device"
        ]
    ],
    [
        -78,
        [
            "ENOSYS",
            "function not implemented"
        ]
    ],
    [
        -57,
        [
            "ENOTCONN",
            "socket is not connected"
        ]
    ],
    [
        -20,
        [
            "ENOTDIR",
            "not a directory"
        ]
    ],
    [
        -66,
        [
            "ENOTEMPTY",
            "directory not empty"
        ]
    ],
    [
        -38,
        [
            "ENOTSOCK",
            "socket operation on non-socket"
        ]
    ],
    [
        -45,
        [
            "ENOTSUP",
            "operation not supported on socket"
        ]
    ],
    [
        -84,
        [
            "EOVERFLOW",
            "value too large for defined data type"
        ]
    ],
    [
        -1,
        [
            "EPERM",
            "operation not permitted"
        ]
    ],
    [
        -32,
        [
            "EPIPE",
            "broken pipe"
        ]
    ],
    [
        -92,
        [
            "EPROTO",
            "protocol error"
        ]
    ],
    [
        -43,
        [
            "EPROTONOSUPPORT",
            "protocol not supported"
        ]
    ],
    [
        -41,
        [
            "EPROTOTYPE",
            "protocol wrong type for socket"
        ]
    ],
    [
        -34,
        [
            "ERANGE",
            "result too large"
        ]
    ],
    [
        -30,
        [
            "EROFS",
            "read-only file system"
        ]
    ],
    [
        -58,
        [
            "ESHUTDOWN",
            "cannot send after transport endpoint shutdown"
        ]
    ],
    [
        -29,
        [
            "ESPIPE",
            "invalid seek"
        ]
    ],
    [
        -3,
        [
            "ESRCH",
            "no such process"
        ]
    ],
    [
        -60,
        [
            "ETIMEDOUT",
            "connection timed out"
        ]
    ],
    [
        -26,
        [
            "ETXTBSY",
            "text file is busy"
        ]
    ],
    [
        -18,
        [
            "EXDEV",
            "cross-device link not permitted"
        ]
    ],
    [
        -4094,
        [
            "UNKNOWN",
            "unknown error"
        ]
    ],
    [
        -4095,
        [
            "EOF",
            "end of file"
        ]
    ],
    [
        -6,
        [
            "ENXIO",
            "no such device or address"
        ]
    ],
    [
        -31,
        [
            "EMLINK",
            "too many links"
        ]
    ],
    [
        -64,
        [
            "EHOSTDOWN",
            "host is down"
        ]
    ],
    [
        -4030,
        [
            "EREMOTEIO",
            "remote I/O error"
        ]
    ],
    [
        -25,
        [
            "ENOTTY",
            "inappropriate ioctl for device"
        ]
    ],
    [
        -79,
        [
            "EFTYPE",
            "inappropriate file type or format"
        ]
    ],
    [
        -86,
        [
            "EILSEQ",
            "illegal byte sequence"
        ]
    ],
    [
        -44,
        [
            "ESOCKTNOSUPPORT",
            "socket type not supported"
        ]
    ], 
];
const errorToCodeFreebsd = codeToErrorFreebsd.map(([status, [code31]])=>[
        code31,
        status
    ]);
new Map(osType2 === "windows" ? codeToErrorWindows : osType2 === "darwin" ? codeToErrorDarwin : osType2 === "linux" ? codeToErrorLinux : osType2 === "freebsd" ? codeToErrorFreebsd : unreachable());
const codeMap = new Map(osType2 === "windows" ? errorToCodeWindows : osType2 === "darwin" ? errorToCodeDarwin : osType2 === "linux" ? errorToCodeLinux : osType2 === "freebsd" ? errorToCodeFreebsd : unreachable());
codeMap.get("EAI_MEMORY");
codeMap.get("EBADF");
codeMap.get("EEXIST");
codeMap.get("EINVAL");
codeMap.get("ENOENT");
codeMap.get("ENOTSOCK");
codeMap.get("UNKNOWN");
function notImplemented(msg16) {
    const message = msg16 ? `Not implemented: ${msg16}` : "Not implemented";
    throw new Error(message);
}
TextDecoder;
TextEncoder;
Number.isSafeInteger;
const { PerformanceObserver , PerformanceEntry , performance: shimPerformance  } = globalThis;
const constants = {};
const performance = {
    clearMarks: (markName)=>shimPerformance.clearMarks(markName),
    eventLoopUtilization: ()=>notImplemented("eventLoopUtilization from performance"),
    mark: (markName)=>shimPerformance.mark(markName),
    measure: (measureName, startMark, endMark)=>{
        if (endMark) {
            return shimPerformance.measure(measureName, startMark, endMark);
        } else {
            return shimPerformance.measure(measureName, startMark);
        }
    },
    nodeTiming: {},
    now: ()=>shimPerformance.now(),
    timerify: ()=>notImplemented("timerify from performance"),
    timeOrigin: shimPerformance.timeOrigin,
    toJSON: ()=>shimPerformance.toJSON(),
    addEventListener: (...args11)=>shimPerformance.addEventListener(...args11),
    removeEventListener: (...args12)=>shimPerformance.removeEventListener(...args12),
    dispatchEvent: (...args13)=>shimPerformance.dispatchEvent(...args13)
};
const monitorEventLoopDelay = ()=>notImplemented("monitorEventLoopDelay from performance");
const __default = {
    performance,
    PerformanceObserver,
    PerformanceEntry,
    monitorEventLoopDelay,
    constants
};
var y = new Uint16Array('\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map((u6)=>u6.charCodeAt(0)));
var q = new Uint16Array("\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map((u7)=>u7.charCodeAt(0)));
var m1, v1 = new Map([
    [
        0,
        65533
    ],
    [
        128,
        8364
    ],
    [
        130,
        8218
    ],
    [
        131,
        402
    ],
    [
        132,
        8222
    ],
    [
        133,
        8230
    ],
    [
        134,
        8224
    ],
    [
        135,
        8225
    ],
    [
        136,
        710
    ],
    [
        137,
        8240
    ],
    [
        138,
        352
    ],
    [
        139,
        8249
    ],
    [
        140,
        338
    ],
    [
        142,
        381
    ],
    [
        145,
        8216
    ],
    [
        146,
        8217
    ],
    [
        147,
        8220
    ],
    [
        148,
        8221
    ],
    [
        149,
        8226
    ],
    [
        150,
        8211
    ],
    [
        151,
        8212
    ],
    [
        152,
        732
    ],
    [
        153,
        8482
    ],
    [
        154,
        353
    ],
    [
        155,
        8250
    ],
    [
        156,
        339
    ],
    [
        158,
        382
    ],
    [
        159,
        376
    ]
]), n = (m1 = String.fromCodePoint) !== null && m1 !== void 0 ? m1 : function(u8) {
    let e16 = "";
    return u8 > 65535 && (u8 -= 65536, e16 += String.fromCharCode(u8 >>> 10 & 1023 | 55296), u8 = 56320 | u8 & 1023), e16 += String.fromCharCode(u8), e16;
};
function p(u9) {
    var e17;
    return u9 >= 55296 && u9 <= 57343 || u9 > 1114111 ? 65533 : (e17 = v1.get(u9)) !== null && e17 !== void 0 ? e17 : u9;
}
var f1;
(function(u10) {
    u10[u10.NUM = 35] = "NUM", u10[u10.SEMI = 59] = "SEMI", u10[u10.EQUALS = 61] = "EQUALS", u10[u10.ZERO = 48] = "ZERO", u10[u10.NINE = 57] = "NINE", u10[u10.LOWER_A = 97] = "LOWER_A", u10[u10.LOWER_F = 102] = "LOWER_F", u10[u10.LOWER_X = 120] = "LOWER_X", u10[u10.LOWER_Z = 122] = "LOWER_Z", u10[u10.UPPER_A = 65] = "UPPER_A", u10[u10.UPPER_F = 70] = "UPPER_F", u10[u10.UPPER_Z = 90] = "UPPER_Z";
})(f1 || (f1 = {}));
var N1 = 32, s1;
(function(u11) {
    u11[u11.VALUE_LENGTH = 49152] = "VALUE_LENGTH", u11[u11.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", u11[u11.JUMP_TABLE = 127] = "JUMP_TABLE";
})(s1 || (s1 = {}));
function h(u12) {
    return u12 >= f1.ZERO && u12 <= f1.NINE;
}
function L1(u13) {
    return u13 >= f1.UPPER_A && u13 <= f1.UPPER_F || u13 >= f1.LOWER_A && u13 <= f1.LOWER_F;
}
function R1(u14) {
    return u14 >= f1.UPPER_A && u14 <= f1.UPPER_Z || u14 >= f1.LOWER_A && u14 <= f1.LOWER_Z || h(u14);
}
function T1(u15) {
    return u15 === f1.EQUALS || R1(u15);
}
var b1;
(function(u16) {
    u16[u16.EntityStart = 0] = "EntityStart", u16[u16.NumericStart = 1] = "NumericStart", u16[u16.NumericDecimal = 2] = "NumericDecimal", u16[u16.NumericHex = 3] = "NumericHex", u16[u16.NamedEntity = 4] = "NamedEntity";
})(b1 || (b1 = {}));
var x1;
(function(u17) {
    u17[u17.Legacy = 0] = "Legacy", u17[u17.Strict = 1] = "Strict", u17[u17.Attribute = 2] = "Attribute";
})(x1 || (x1 = {}));
var g = class {
    constructor(e18, a10, c13){
        this.decodeTree = e18, this.emitCodePoint = a10, this.errors = c13, this.state = b1.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = x1.Strict;
    }
    startEntity(e19) {
        this.decodeMode = e19, this.state = b1.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1;
    }
    write(e20, a11) {
        switch(this.state){
            case b1.EntityStart:
                return e20.charCodeAt(a11) === f1.NUM ? (this.state = b1.NumericStart, this.consumed += 1, this.stateNumericStart(e20, a11 + 1)) : (this.state = b1.NamedEntity, this.stateNamedEntity(e20, a11));
            case b1.NumericStart:
                return this.stateNumericStart(e20, a11);
            case b1.NumericDecimal:
                return this.stateNumericDecimal(e20, a11);
            case b1.NumericHex:
                return this.stateNumericHex(e20, a11);
            case b1.NamedEntity:
                return this.stateNamedEntity(e20, a11);
        }
    }
    stateNumericStart(e21, a12) {
        return a12 >= e21.length ? -1 : (e21.charCodeAt(a12) | N1) === f1.LOWER_X ? (this.state = b1.NumericHex, this.consumed += 1, this.stateNumericHex(e21, a12 + 1)) : (this.state = b1.NumericDecimal, this.stateNumericDecimal(e21, a12));
    }
    addToNumericResult(e22, a13, c14, d7) {
        if (a13 !== c14) {
            let r5 = c14 - a13;
            this.result = this.result * Math.pow(d7, r5) + parseInt(e22.substr(a13, r5), d7), this.consumed += r5;
        }
    }
    stateNumericHex(e23, a14) {
        let c15 = a14;
        for(; a14 < e23.length;){
            let d8 = e23.charCodeAt(a14);
            if (h(d8) || L1(d8)) a14 += 1;
            else return this.addToNumericResult(e23, c15, a14, 16), this.emitNumericEntity(d8, 3);
        }
        return this.addToNumericResult(e23, c15, a14, 16), -1;
    }
    stateNumericDecimal(e24, a15) {
        let c16 = a15;
        for(; a15 < e24.length;){
            let d9 = e24.charCodeAt(a15);
            if (h(d9)) a15 += 1;
            else return this.addToNumericResult(e24, c16, a15, 10), this.emitNumericEntity(d9, 2);
        }
        return this.addToNumericResult(e24, c16, a15, 10), -1;
    }
    emitNumericEntity(e25, a16) {
        var c17;
        if (this.consumed <= a16) return (c17 = this.errors) === null || c17 === void 0 || c17.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
        if (e25 === f1.SEMI) this.consumed += 1;
        else if (this.decodeMode === x1.Strict) return 0;
        return this.emitCodePoint(p(this.result), this.consumed), this.errors && (e25 !== f1.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
    }
    stateNamedEntity(e26, a17) {
        let { decodeTree: c18  } = this, d10 = c18[this.treeIndex], r6 = (d10 & s1.VALUE_LENGTH) >> 14;
        for(; a17 < e26.length; a17++, this.excess++){
            let t10 = e26.charCodeAt(a17);
            if (this.treeIndex = k1(c18, d10, this.treeIndex + Math.max(1, r6), t10), this.treeIndex < 0) return this.result === 0 || this.decodeMode === x1.Attribute && (r6 === 0 || T1(t10)) ? 0 : this.emitNotTerminatedNamedEntity();
            if (d10 = c18[this.treeIndex], r6 = (d10 & s1.VALUE_LENGTH) >> 14, r6 !== 0) {
                if (t10 === f1.SEMI) return this.emitNamedEntityData(this.treeIndex, r6, this.consumed + this.excess);
                this.decodeMode !== x1.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
            }
        }
        return -1;
    }
    emitNotTerminatedNamedEntity() {
        var e27;
        let { result: a18 , decodeTree: c19  } = this, d11 = (c19[a18] & s1.VALUE_LENGTH) >> 14;
        return this.emitNamedEntityData(a18, d11, this.consumed), (e27 = this.errors) === null || e27 === void 0 || e27.missingSemicolonAfterCharacterReference(), this.consumed;
    }
    emitNamedEntityData(e28, a19, c20) {
        let { decodeTree: d12  } = this;
        return this.emitCodePoint(a19 === 1 ? d12[e28] & ~s1.VALUE_LENGTH : d12[e28 + 1], c20), a19 === 3 && this.emitCodePoint(d12[e28 + 2], c20), c20;
    }
    end() {
        var e29;
        switch(this.state){
            case b1.NamedEntity:
                return this.result !== 0 && (this.decodeMode !== x1.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
            case b1.NumericDecimal:
                return this.emitNumericEntity(0, 2);
            case b1.NumericHex:
                return this.emitNumericEntity(0, 3);
            case b1.NumericStart:
                return (e29 = this.errors) === null || e29 === void 0 || e29.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
            case b1.EntityStart:
                return 0;
        }
    }
};
function A1(u18) {
    let e30 = "", a20 = new g(u18, (c21)=>e30 += n(c21));
    return function(d13, r7) {
        let t11 = 0, i45 = 0;
        for(; (i45 = d13.indexOf("&", i45)) >= 0;){
            e30 += d13.slice(t11, i45), a20.startEntity(r7);
            let l6 = a20.write(d13, i45 + 1);
            if (l6 < 0) {
                t11 = i45 + a20.end();
                break;
            }
            t11 = i45 + l6, i45 = l6 === 0 ? t11 + 1 : t11;
        }
        let o4 = e30 + d13.slice(t11);
        return e30 = "", o4;
    };
}
function k1(u19, e31, a21, c22) {
    let d14 = (e31 & s1.BRANCH_LENGTH) >> 7, r8 = e31 & s1.JUMP_TABLE;
    if (d14 === 0) return r8 !== 0 && c22 === r8 ? a21 : -1;
    if (r8) {
        let o5 = c22 - r8;
        return o5 < 0 || o5 >= d14 ? -1 : u19[a21 + o5] - 1;
    }
    let t12 = a21, i46 = t12 + d14 - 1;
    for(; t12 <= i46;){
        let o6 = t12 + i46 >>> 1, l7 = u19[o6];
        if (l7 < c22) t12 = o6 + 1;
        else if (l7 > c22) i46 = o6 - 1;
        else return u19[o6 + d14];
    }
    return -1;
}
A1(y), A1(q);
var t;
(function(o7) {
    o7.Root = "root", o7.Text = "text", o7.Directive = "directive", o7.Comment = "comment", o7.Script = "script", o7.Style = "style", o7.Tag = "tag", o7.CDATA = "cdata", o7.Doctype = "doctype";
})(t || (t = {}));
function c(o8) {
    return o8.type === t.Tag || o8.type === t.Script || o8.type === t.Style;
}
var r133 = t.Root, i1 = t.Text, p1 = t.Directive, e = t.Comment, x2 = t.Script, s2 = t.Style, n1 = t.Tag, a = t.CDATA, D1 = t.Doctype;
const mod9 = {
    CDATA: a,
    Comment: e,
    Directive: p1,
    Doctype: D1,
    ElementType: t,
    Root: r133,
    Script: x2,
    Style: s2,
    Tag: n1,
    Text: i1,
    isTag: c
};
var f2 = class {
    constructor(){
        this.parent = null, this.prev = null, this.next = null, this.startIndex = null, this.endIndex = null;
    }
    get parentNode() {
        return this.parent;
    }
    set parentNode(t13) {
        this.parent = t13;
    }
    get previousSibling() {
        return this.prev;
    }
    set previousSibling(t14) {
        this.prev = t14;
    }
    get nextSibling() {
        return this.next;
    }
    set nextSibling(t15) {
        this.next = t15;
    }
    cloneNode(t16 = !1) {
        return N2(this, t16);
    }
}, h1 = class extends f2 {
    constructor(t17){
        super(), this.data = t17;
    }
    get nodeValue() {
        return this.data;
    }
    set nodeValue(t18) {
        this.data = t18;
    }
}, o = class extends h1 {
    constructor(){
        super(...arguments), this.type = t.Text;
    }
    get nodeType() {
        return 3;
    }
}, c1 = class extends h1 {
    constructor(){
        super(...arguments), this.type = t.Comment;
    }
    get nodeType() {
        return 8;
    }
}, d1 = class extends h1 {
    constructor(t19, s7){
        super(s7), this.name = t19, this.type = t.Directive;
    }
    get nodeType() {
        return 1;
    }
}, u1 = class extends f2 {
    constructor(t20){
        super(), this.children = t20;
    }
    get firstChild() {
        var t21;
        return (t21 = this.children[0]) !== null && t21 !== void 0 ? t21 : null;
    }
    get lastChild() {
        return this.children.length > 0 ? this.children[this.children.length - 1] : null;
    }
    get childNodes() {
        return this.children;
    }
    set childNodes(t22) {
        this.children = t22;
    }
}, p2 = class extends u1 {
    constructor(){
        super(...arguments), this.type = t.CDATA;
    }
    get nodeType() {
        return 4;
    }
}, a1 = class extends u1 {
    constructor(){
        super(...arguments), this.type = t.Root;
    }
    get nodeType() {
        return 9;
    }
}, x3 = class extends u1 {
    constructor(t23, s8, n11 = [], i47 = t23 === "script" ? t.Script : t23 === "style" ? t.Style : t.Tag){
        super(n11), this.name = t23, this.attribs = s8, this.type = i47;
    }
    get nodeType() {
        return 1;
    }
    get tagName() {
        return this.name;
    }
    set tagName(t24) {
        this.name = t24;
    }
    get attributes() {
        return Object.keys(this.attribs).map((t25)=>{
            var s9, n12;
            return {
                name: t25,
                value: this.attribs[t25],
                namespace: (s9 = this["x-attribsNamespace"]) === null || s9 === void 0 ? void 0 : s9[t25],
                prefix: (n12 = this["x-attribsPrefix"]) === null || n12 === void 0 ? void 0 : n12[t25]
            };
        });
    }
};
function I1(e32) {
    return c(e32);
}
function v2(e33) {
    return e33.type === t.CDATA;
}
function T2(e34) {
    return e34.type === t.Text;
}
function C(e35) {
    return e35.type === t.Comment;
}
function S(e36) {
    return e36.type === t.Directive;
}
function E1(e37) {
    return e37.type === t.Root;
}
function A2(e38) {
    return Object.prototype.hasOwnProperty.call(e38, "children");
}
function N2(e39, t26 = !1) {
    let s10;
    if (T2(e39)) s10 = new o(e39.data);
    else if (C(e39)) s10 = new c1(e39.data);
    else if (I1(e39)) {
        let n13 = t26 ? m2(e39.children) : [], i48 = new x3(e39.name, {
            ...e39.attribs
        }, n13);
        n13.forEach((l8)=>l8.parent = i48), e39.namespace != null && (i48.namespace = e39.namespace), e39["x-attribsNamespace"] && (i48["x-attribsNamespace"] = {
            ...e39["x-attribsNamespace"]
        }), e39["x-attribsPrefix"] && (i48["x-attribsPrefix"] = {
            ...e39["x-attribsPrefix"]
        }), s10 = i48;
    } else if (v2(e39)) {
        let n14 = t26 ? m2(e39.children) : [], i49 = new p2(n14);
        n14.forEach((l9)=>l9.parent = i49), s10 = i49;
    } else if (E1(e39)) {
        let n15 = t26 ? m2(e39.children) : [], i50 = new a1(n15);
        n15.forEach((l10)=>l10.parent = i50), e39["x-mode"] && (i50["x-mode"] = e39["x-mode"]), s10 = i50;
    } else if (S(e39)) {
        let n16 = new d1(e39.name, e39.data);
        e39["x-name"] != null && (n16["x-name"] = e39["x-name"], n16["x-publicId"] = e39["x-publicId"], n16["x-systemId"] = e39["x-systemId"]), s10 = n16;
    } else throw new Error(`Not implemented yet: ${e39.type}`);
    return s10.startIndex = e39.startIndex, s10.endIndex = e39.endIndex, e39.sourceCodeLocation != null && (s10.sourceCodeLocation = e39.sourceCodeLocation), s10;
}
function m2(e40) {
    let t27 = e40.map((s11)=>N2(s11, !0));
    for(let s12 = 1; s12 < t27.length; s12++)t27[s12].prev = t27[s12 - 1], t27[s12 - 1].next = t27[s12];
    return t27;
}
var b2 = {
    withStartIndices: !1,
    withEndIndices: !1,
    xmlMode: !1
}, y1 = class {
    constructor(t28, s13, n17){
        this.dom = [], this.root = new a1(this.dom), this.done = !1, this.tagStack = [
            this.root
        ], this.lastNode = null, this.parser = null, typeof s13 == "function" && (n17 = s13, s13 = b2), typeof t28 == "object" && (s13 = t28, t28 = void 0), this.callback = t28 ?? null, this.options = s13 ?? b2, this.elementCB = n17 ?? null;
    }
    onparserinit(t29) {
        this.parser = t29;
    }
    onreset() {
        this.dom = [], this.root = new a1(this.dom), this.done = !1, this.tagStack = [
            this.root
        ], this.lastNode = null, this.parser = null;
    }
    onend() {
        this.done || (this.done = !0, this.parser = null, this.handleCallback(null));
    }
    onerror(t30) {
        this.handleCallback(t30);
    }
    onclosetag() {
        this.lastNode = null;
        let t31 = this.tagStack.pop();
        this.options.withEndIndices && (t31.endIndex = this.parser.endIndex), this.elementCB && this.elementCB(t31);
    }
    onopentag(t32, s14) {
        let n18 = this.options.xmlMode ? t.Tag : void 0, i51 = new x3(t32, s14, void 0, n18);
        this.addNode(i51), this.tagStack.push(i51);
    }
    ontext(t33) {
        let { lastNode: s15  } = this;
        if (s15 && s15.type === t.Text) s15.data += t33, this.options.withEndIndices && (s15.endIndex = this.parser.endIndex);
        else {
            let n19 = new o(t33);
            this.addNode(n19), this.lastNode = n19;
        }
    }
    oncomment(t34) {
        if (this.lastNode && this.lastNode.type === t.Comment) {
            this.lastNode.data += t34;
            return;
        }
        let s16 = new c1(t34);
        this.addNode(s16), this.lastNode = s16;
    }
    oncommentend() {
        this.lastNode = null;
    }
    oncdatastart() {
        let t35 = new o(""), s17 = new p2([
            t35
        ]);
        this.addNode(s17), t35.parent = s17, this.lastNode = t35;
    }
    oncdataend() {
        this.lastNode = null;
    }
    onprocessinginstruction(t36, s18) {
        let n20 = new d1(t36, s18);
        this.addNode(n20);
    }
    handleCallback(t37) {
        if (typeof this.callback == "function") this.callback(t37, this.dom);
        else if (t37) throw t37;
    }
    addNode(t38) {
        let s19 = this.tagStack[this.tagStack.length - 1], n21 = s19.children[s19.children.length - 1];
        this.options.withStartIndices && (t38.startIndex = this.parser.startIndex), this.options.withEndIndices && (t38.endIndex = this.parser.endIndex), s19.children.push(t38), n21 && (t38.prev = n21, n21.next = t38), t38.parent = s19, this.lastNode = null;
    }
};
var V = new Uint16Array('\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map((u20)=>u20.charCodeAt(0)));
var B1 = new Uint16Array("\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map((u21)=>u21.charCodeAt(0)));
var q1, G = new Map([
    [
        0,
        65533
    ],
    [
        128,
        8364
    ],
    [
        130,
        8218
    ],
    [
        131,
        402
    ],
    [
        132,
        8222
    ],
    [
        133,
        8230
    ],
    [
        134,
        8224
    ],
    [
        135,
        8225
    ],
    [
        136,
        710
    ],
    [
        137,
        8240
    ],
    [
        138,
        352
    ],
    [
        139,
        8249
    ],
    [
        140,
        338
    ],
    [
        142,
        381
    ],
    [
        145,
        8216
    ],
    [
        146,
        8217
    ],
    [
        147,
        8220
    ],
    [
        148,
        8221
    ],
    [
        149,
        8226
    ],
    [
        150,
        8211
    ],
    [
        151,
        8212
    ],
    [
        152,
        732
    ],
    [
        153,
        8482
    ],
    [
        154,
        353
    ],
    [
        155,
        8250
    ],
    [
        156,
        339
    ],
    [
        158,
        382
    ],
    [
        159,
        376
    ]
]), A3 = (q1 = String.fromCodePoint) !== null && q1 !== void 0 ? q1 : function(u22) {
    let e41 = "";
    return u22 > 65535 && (u22 -= 65536, e41 += String.fromCharCode(u22 >>> 10 & 1023 | 55296), u22 = 56320 | u22 & 1023), e41 += String.fromCharCode(u22), e41;
};
function L2(u23) {
    var e42;
    return u23 >= 55296 && u23 <= 57343 || u23 > 1114111 ? 65533 : (e42 = G.get(u23)) !== null && e42 !== void 0 ? e42 : u23;
}
var o1;
(function(u24) {
    u24[u24.NUM = 35] = "NUM", u24[u24.SEMI = 59] = "SEMI", u24[u24.EQUALS = 61] = "EQUALS", u24[u24.ZERO = 48] = "ZERO", u24[u24.NINE = 57] = "NINE", u24[u24.LOWER_A = 97] = "LOWER_A", u24[u24.LOWER_F = 102] = "LOWER_F", u24[u24.LOWER_X = 120] = "LOWER_X", u24[u24.LOWER_Z = 122] = "LOWER_Z", u24[u24.UPPER_A = 65] = "UPPER_A", u24[u24.UPPER_F = 70] = "UPPER_F", u24[u24.UPPER_Z = 90] = "UPPER_Z";
})(o1 || (o1 = {}));
var _ = 32, l;
(function(u25) {
    u25[u25.VALUE_LENGTH = 49152] = "VALUE_LENGTH", u25[u25.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", u25[u25.JUMP_TABLE = 127] = "JUMP_TABLE";
})(l || (l = {}));
function T3(u26) {
    return u26 >= o1.ZERO && u26 <= o1.NINE;
}
function F1(u27) {
    return u27 >= o1.UPPER_A && u27 <= o1.UPPER_F || u27 >= o1.LOWER_A && u27 <= o1.LOWER_F;
}
function j(u28) {
    return u28 >= o1.UPPER_A && u28 <= o1.UPPER_Z || u28 >= o1.LOWER_A && u28 <= o1.LOWER_Z || T3(u28);
}
function z1(u29) {
    return u29 === o1.EQUALS || j(u29);
}
var f3;
(function(u30) {
    u30[u30.EntityStart = 0] = "EntityStart", u30[u30.NumericStart = 1] = "NumericStart", u30[u30.NumericDecimal = 2] = "NumericDecimal", u30[u30.NumericHex = 3] = "NumericHex", u30[u30.NamedEntity = 4] = "NamedEntity";
})(f3 || (f3 = {}));
var s3;
(function(u31) {
    u31[u31.Legacy = 0] = "Legacy", u31[u31.Strict = 1] = "Strict", u31[u31.Attribute = 2] = "Attribute";
})(s3 || (s3 = {}));
var g1 = class {
    constructor(e43, a22, c23){
        this.decodeTree = e43, this.emitCodePoint = a22, this.errors = c23, this.state = f3.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = s3.Strict;
    }
    startEntity(e44) {
        this.decodeMode = e44, this.state = f3.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1;
    }
    write(e45, a23) {
        switch(this.state){
            case f3.EntityStart:
                return e45.charCodeAt(a23) === o1.NUM ? (this.state = f3.NumericStart, this.consumed += 1, this.stateNumericStart(e45, a23 + 1)) : (this.state = f3.NamedEntity, this.stateNamedEntity(e45, a23));
            case f3.NumericStart:
                return this.stateNumericStart(e45, a23);
            case f3.NumericDecimal:
                return this.stateNumericDecimal(e45, a23);
            case f3.NumericHex:
                return this.stateNumericHex(e45, a23);
            case f3.NamedEntity:
                return this.stateNamedEntity(e45, a23);
        }
    }
    stateNumericStart(e46, a24) {
        return a24 >= e46.length ? -1 : (e46.charCodeAt(a24) | _) === o1.LOWER_X ? (this.state = f3.NumericHex, this.consumed += 1, this.stateNumericHex(e46, a24 + 1)) : (this.state = f3.NumericDecimal, this.stateNumericDecimal(e46, a24));
    }
    addToNumericResult(e47, a25, c24, r9) {
        if (a25 !== c24) {
            let d15 = c24 - a25;
            this.result = this.result * Math.pow(r9, d15) + parseInt(e47.substr(a25, d15), r9), this.consumed += d15;
        }
    }
    stateNumericHex(e48, a26) {
        let c25 = a26;
        for(; a26 < e48.length;){
            let r10 = e48.charCodeAt(a26);
            if (T3(r10) || F1(r10)) a26 += 1;
            else return this.addToNumericResult(e48, c25, a26, 16), this.emitNumericEntity(r10, 3);
        }
        return this.addToNumericResult(e48, c25, a26, 16), -1;
    }
    stateNumericDecimal(e49, a27) {
        let c26 = a27;
        for(; a27 < e49.length;){
            let r11 = e49.charCodeAt(a27);
            if (T3(r11)) a27 += 1;
            else return this.addToNumericResult(e49, c26, a27, 10), this.emitNumericEntity(r11, 2);
        }
        return this.addToNumericResult(e49, c26, a27, 10), -1;
    }
    emitNumericEntity(e50, a28) {
        var c27;
        if (this.consumed <= a28) return (c27 = this.errors) === null || c27 === void 0 || c27.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
        if (e50 === o1.SEMI) this.consumed += 1;
        else if (this.decodeMode === s3.Strict) return 0;
        return this.emitCodePoint(L2(this.result), this.consumed), this.errors && (e50 !== o1.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
    }
    stateNamedEntity(e51, a29) {
        let { decodeTree: c28  } = this, r12 = c28[this.treeIndex], d16 = (r12 & l.VALUE_LENGTH) >> 14;
        for(; a29 < e51.length; a29++, this.excess++){
            let t39 = e51.charCodeAt(a29);
            if (this.treeIndex = J1(c28, r12, this.treeIndex + Math.max(1, d16), t39), this.treeIndex < 0) return this.result === 0 || this.decodeMode === s3.Attribute && (d16 === 0 || z1(t39)) ? 0 : this.emitNotTerminatedNamedEntity();
            if (r12 = c28[this.treeIndex], d16 = (r12 & l.VALUE_LENGTH) >> 14, d16 !== 0) {
                if (t39 === o1.SEMI) return this.emitNamedEntityData(this.treeIndex, d16, this.consumed + this.excess);
                this.decodeMode !== s3.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
            }
        }
        return -1;
    }
    emitNotTerminatedNamedEntity() {
        var e52;
        let { result: a30 , decodeTree: c29  } = this, r13 = (c29[a30] & l.VALUE_LENGTH) >> 14;
        return this.emitNamedEntityData(a30, r13, this.consumed), (e52 = this.errors) === null || e52 === void 0 || e52.missingSemicolonAfterCharacterReference(), this.consumed;
    }
    emitNamedEntityData(e53, a31, c30) {
        let { decodeTree: r14  } = this;
        return this.emitCodePoint(a31 === 1 ? r14[e53] & ~l.VALUE_LENGTH : r14[e53 + 1], c30), a31 === 3 && this.emitCodePoint(r14[e53 + 2], c30), c30;
    }
    end() {
        var e54;
        switch(this.state){
            case f3.NamedEntity:
                return this.result !== 0 && (this.decodeMode !== s3.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
            case f3.NumericDecimal:
                return this.emitNumericEntity(0, 2);
            case f3.NumericHex:
                return this.emitNumericEntity(0, 3);
            case f3.NumericStart:
                return (e54 = this.errors) === null || e54 === void 0 || e54.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
            case f3.EntityStart:
                return 0;
        }
    }
};
function I2(u32) {
    let e55 = "", a32 = new g1(u32, (c31)=>e55 += A3(c31));
    return function(r15, d17) {
        let t40 = 0, b9 = 0;
        for(; (b9 = r15.indexOf("&", b9)) >= 0;){
            e55 += r15.slice(t40, b9), a32.startEntity(d17);
            let n22 = a32.write(r15, b9 + 1);
            if (n22 < 0) {
                t40 = b9 + a32.end();
                break;
            }
            t40 = b9 + n22, b9 = n22 === 0 ? t40 + 1 : t40;
        }
        let i52 = e55 + r15.slice(t40);
        return e55 = "", i52;
    };
}
function J1(u33, e56, a33, c32) {
    let r16 = (e56 & l.BRANCH_LENGTH) >> 7, d18 = e56 & l.JUMP_TABLE;
    if (r16 === 0) return d18 !== 0 && c32 === d18 ? a33 : -1;
    if (d18) {
        let i53 = c32 - d18;
        return i53 < 0 || i53 >= r16 ? -1 : u33[a33 + i53] - 1;
    }
    let t41 = a33, b10 = t41 + r16 - 1;
    for(; t41 <= b10;){
        let i54 = t41 + b10 >>> 1, n23 = u33[i54];
        if (n23 < c32) t41 = i54 + 1;
        else if (n23 > c32) b10 = i54 - 1;
        else return u33[i54 + r16];
    }
    return -1;
}
I2(V), I2(B1);
function v3(u34) {
    for(let e57 = 1; e57 < u34.length; e57++)u34[e57][0] += u34[e57 - 1][0] + 1;
    return u34;
}
new Map(v3([
    [
        9,
        "&Tab;"
    ],
    [
        0,
        "&NewLine;"
    ],
    [
        22,
        "&excl;"
    ],
    [
        0,
        "&quot;"
    ],
    [
        0,
        "&num;"
    ],
    [
        0,
        "&dollar;"
    ],
    [
        0,
        "&percnt;"
    ],
    [
        0,
        "&amp;"
    ],
    [
        0,
        "&apos;"
    ],
    [
        0,
        "&lpar;"
    ],
    [
        0,
        "&rpar;"
    ],
    [
        0,
        "&ast;"
    ],
    [
        0,
        "&plus;"
    ],
    [
        0,
        "&comma;"
    ],
    [
        1,
        "&period;"
    ],
    [
        0,
        "&sol;"
    ],
    [
        10,
        "&colon;"
    ],
    [
        0,
        "&semi;"
    ],
    [
        0,
        {
            v: "&lt;",
            n: 8402,
            o: "&nvlt;"
        }
    ],
    [
        0,
        {
            v: "&equals;",
            n: 8421,
            o: "&bne;"
        }
    ],
    [
        0,
        {
            v: "&gt;",
            n: 8402,
            o: "&nvgt;"
        }
    ],
    [
        0,
        "&quest;"
    ],
    [
        0,
        "&commat;"
    ],
    [
        26,
        "&lbrack;"
    ],
    [
        0,
        "&bsol;"
    ],
    [
        0,
        "&rbrack;"
    ],
    [
        0,
        "&Hat;"
    ],
    [
        0,
        "&lowbar;"
    ],
    [
        0,
        "&DiacriticalGrave;"
    ],
    [
        5,
        {
            n: 106,
            o: "&fjlig;"
        }
    ],
    [
        20,
        "&lbrace;"
    ],
    [
        0,
        "&verbar;"
    ],
    [
        0,
        "&rbrace;"
    ],
    [
        34,
        "&nbsp;"
    ],
    [
        0,
        "&iexcl;"
    ],
    [
        0,
        "&cent;"
    ],
    [
        0,
        "&pound;"
    ],
    [
        0,
        "&curren;"
    ],
    [
        0,
        "&yen;"
    ],
    [
        0,
        "&brvbar;"
    ],
    [
        0,
        "&sect;"
    ],
    [
        0,
        "&die;"
    ],
    [
        0,
        "&copy;"
    ],
    [
        0,
        "&ordf;"
    ],
    [
        0,
        "&laquo;"
    ],
    [
        0,
        "&not;"
    ],
    [
        0,
        "&shy;"
    ],
    [
        0,
        "&circledR;"
    ],
    [
        0,
        "&macr;"
    ],
    [
        0,
        "&deg;"
    ],
    [
        0,
        "&PlusMinus;"
    ],
    [
        0,
        "&sup2;"
    ],
    [
        0,
        "&sup3;"
    ],
    [
        0,
        "&acute;"
    ],
    [
        0,
        "&micro;"
    ],
    [
        0,
        "&para;"
    ],
    [
        0,
        "&centerdot;"
    ],
    [
        0,
        "&cedil;"
    ],
    [
        0,
        "&sup1;"
    ],
    [
        0,
        "&ordm;"
    ],
    [
        0,
        "&raquo;"
    ],
    [
        0,
        "&frac14;"
    ],
    [
        0,
        "&frac12;"
    ],
    [
        0,
        "&frac34;"
    ],
    [
        0,
        "&iquest;"
    ],
    [
        0,
        "&Agrave;"
    ],
    [
        0,
        "&Aacute;"
    ],
    [
        0,
        "&Acirc;"
    ],
    [
        0,
        "&Atilde;"
    ],
    [
        0,
        "&Auml;"
    ],
    [
        0,
        "&angst;"
    ],
    [
        0,
        "&AElig;"
    ],
    [
        0,
        "&Ccedil;"
    ],
    [
        0,
        "&Egrave;"
    ],
    [
        0,
        "&Eacute;"
    ],
    [
        0,
        "&Ecirc;"
    ],
    [
        0,
        "&Euml;"
    ],
    [
        0,
        "&Igrave;"
    ],
    [
        0,
        "&Iacute;"
    ],
    [
        0,
        "&Icirc;"
    ],
    [
        0,
        "&Iuml;"
    ],
    [
        0,
        "&ETH;"
    ],
    [
        0,
        "&Ntilde;"
    ],
    [
        0,
        "&Ograve;"
    ],
    [
        0,
        "&Oacute;"
    ],
    [
        0,
        "&Ocirc;"
    ],
    [
        0,
        "&Otilde;"
    ],
    [
        0,
        "&Ouml;"
    ],
    [
        0,
        "&times;"
    ],
    [
        0,
        "&Oslash;"
    ],
    [
        0,
        "&Ugrave;"
    ],
    [
        0,
        "&Uacute;"
    ],
    [
        0,
        "&Ucirc;"
    ],
    [
        0,
        "&Uuml;"
    ],
    [
        0,
        "&Yacute;"
    ],
    [
        0,
        "&THORN;"
    ],
    [
        0,
        "&szlig;"
    ],
    [
        0,
        "&agrave;"
    ],
    [
        0,
        "&aacute;"
    ],
    [
        0,
        "&acirc;"
    ],
    [
        0,
        "&atilde;"
    ],
    [
        0,
        "&auml;"
    ],
    [
        0,
        "&aring;"
    ],
    [
        0,
        "&aelig;"
    ],
    [
        0,
        "&ccedil;"
    ],
    [
        0,
        "&egrave;"
    ],
    [
        0,
        "&eacute;"
    ],
    [
        0,
        "&ecirc;"
    ],
    [
        0,
        "&euml;"
    ],
    [
        0,
        "&igrave;"
    ],
    [
        0,
        "&iacute;"
    ],
    [
        0,
        "&icirc;"
    ],
    [
        0,
        "&iuml;"
    ],
    [
        0,
        "&eth;"
    ],
    [
        0,
        "&ntilde;"
    ],
    [
        0,
        "&ograve;"
    ],
    [
        0,
        "&oacute;"
    ],
    [
        0,
        "&ocirc;"
    ],
    [
        0,
        "&otilde;"
    ],
    [
        0,
        "&ouml;"
    ],
    [
        0,
        "&div;"
    ],
    [
        0,
        "&oslash;"
    ],
    [
        0,
        "&ugrave;"
    ],
    [
        0,
        "&uacute;"
    ],
    [
        0,
        "&ucirc;"
    ],
    [
        0,
        "&uuml;"
    ],
    [
        0,
        "&yacute;"
    ],
    [
        0,
        "&thorn;"
    ],
    [
        0,
        "&yuml;"
    ],
    [
        0,
        "&Amacr;"
    ],
    [
        0,
        "&amacr;"
    ],
    [
        0,
        "&Abreve;"
    ],
    [
        0,
        "&abreve;"
    ],
    [
        0,
        "&Aogon;"
    ],
    [
        0,
        "&aogon;"
    ],
    [
        0,
        "&Cacute;"
    ],
    [
        0,
        "&cacute;"
    ],
    [
        0,
        "&Ccirc;"
    ],
    [
        0,
        "&ccirc;"
    ],
    [
        0,
        "&Cdot;"
    ],
    [
        0,
        "&cdot;"
    ],
    [
        0,
        "&Ccaron;"
    ],
    [
        0,
        "&ccaron;"
    ],
    [
        0,
        "&Dcaron;"
    ],
    [
        0,
        "&dcaron;"
    ],
    [
        0,
        "&Dstrok;"
    ],
    [
        0,
        "&dstrok;"
    ],
    [
        0,
        "&Emacr;"
    ],
    [
        0,
        "&emacr;"
    ],
    [
        2,
        "&Edot;"
    ],
    [
        0,
        "&edot;"
    ],
    [
        0,
        "&Eogon;"
    ],
    [
        0,
        "&eogon;"
    ],
    [
        0,
        "&Ecaron;"
    ],
    [
        0,
        "&ecaron;"
    ],
    [
        0,
        "&Gcirc;"
    ],
    [
        0,
        "&gcirc;"
    ],
    [
        0,
        "&Gbreve;"
    ],
    [
        0,
        "&gbreve;"
    ],
    [
        0,
        "&Gdot;"
    ],
    [
        0,
        "&gdot;"
    ],
    [
        0,
        "&Gcedil;"
    ],
    [
        1,
        "&Hcirc;"
    ],
    [
        0,
        "&hcirc;"
    ],
    [
        0,
        "&Hstrok;"
    ],
    [
        0,
        "&hstrok;"
    ],
    [
        0,
        "&Itilde;"
    ],
    [
        0,
        "&itilde;"
    ],
    [
        0,
        "&Imacr;"
    ],
    [
        0,
        "&imacr;"
    ],
    [
        2,
        "&Iogon;"
    ],
    [
        0,
        "&iogon;"
    ],
    [
        0,
        "&Idot;"
    ],
    [
        0,
        "&imath;"
    ],
    [
        0,
        "&IJlig;"
    ],
    [
        0,
        "&ijlig;"
    ],
    [
        0,
        "&Jcirc;"
    ],
    [
        0,
        "&jcirc;"
    ],
    [
        0,
        "&Kcedil;"
    ],
    [
        0,
        "&kcedil;"
    ],
    [
        0,
        "&kgreen;"
    ],
    [
        0,
        "&Lacute;"
    ],
    [
        0,
        "&lacute;"
    ],
    [
        0,
        "&Lcedil;"
    ],
    [
        0,
        "&lcedil;"
    ],
    [
        0,
        "&Lcaron;"
    ],
    [
        0,
        "&lcaron;"
    ],
    [
        0,
        "&Lmidot;"
    ],
    [
        0,
        "&lmidot;"
    ],
    [
        0,
        "&Lstrok;"
    ],
    [
        0,
        "&lstrok;"
    ],
    [
        0,
        "&Nacute;"
    ],
    [
        0,
        "&nacute;"
    ],
    [
        0,
        "&Ncedil;"
    ],
    [
        0,
        "&ncedil;"
    ],
    [
        0,
        "&Ncaron;"
    ],
    [
        0,
        "&ncaron;"
    ],
    [
        0,
        "&napos;"
    ],
    [
        0,
        "&ENG;"
    ],
    [
        0,
        "&eng;"
    ],
    [
        0,
        "&Omacr;"
    ],
    [
        0,
        "&omacr;"
    ],
    [
        2,
        "&Odblac;"
    ],
    [
        0,
        "&odblac;"
    ],
    [
        0,
        "&OElig;"
    ],
    [
        0,
        "&oelig;"
    ],
    [
        0,
        "&Racute;"
    ],
    [
        0,
        "&racute;"
    ],
    [
        0,
        "&Rcedil;"
    ],
    [
        0,
        "&rcedil;"
    ],
    [
        0,
        "&Rcaron;"
    ],
    [
        0,
        "&rcaron;"
    ],
    [
        0,
        "&Sacute;"
    ],
    [
        0,
        "&sacute;"
    ],
    [
        0,
        "&Scirc;"
    ],
    [
        0,
        "&scirc;"
    ],
    [
        0,
        "&Scedil;"
    ],
    [
        0,
        "&scedil;"
    ],
    [
        0,
        "&Scaron;"
    ],
    [
        0,
        "&scaron;"
    ],
    [
        0,
        "&Tcedil;"
    ],
    [
        0,
        "&tcedil;"
    ],
    [
        0,
        "&Tcaron;"
    ],
    [
        0,
        "&tcaron;"
    ],
    [
        0,
        "&Tstrok;"
    ],
    [
        0,
        "&tstrok;"
    ],
    [
        0,
        "&Utilde;"
    ],
    [
        0,
        "&utilde;"
    ],
    [
        0,
        "&Umacr;"
    ],
    [
        0,
        "&umacr;"
    ],
    [
        0,
        "&Ubreve;"
    ],
    [
        0,
        "&ubreve;"
    ],
    [
        0,
        "&Uring;"
    ],
    [
        0,
        "&uring;"
    ],
    [
        0,
        "&Udblac;"
    ],
    [
        0,
        "&udblac;"
    ],
    [
        0,
        "&Uogon;"
    ],
    [
        0,
        "&uogon;"
    ],
    [
        0,
        "&Wcirc;"
    ],
    [
        0,
        "&wcirc;"
    ],
    [
        0,
        "&Ycirc;"
    ],
    [
        0,
        "&ycirc;"
    ],
    [
        0,
        "&Yuml;"
    ],
    [
        0,
        "&Zacute;"
    ],
    [
        0,
        "&zacute;"
    ],
    [
        0,
        "&Zdot;"
    ],
    [
        0,
        "&zdot;"
    ],
    [
        0,
        "&Zcaron;"
    ],
    [
        0,
        "&zcaron;"
    ],
    [
        19,
        "&fnof;"
    ],
    [
        34,
        "&imped;"
    ],
    [
        63,
        "&gacute;"
    ],
    [
        65,
        "&jmath;"
    ],
    [
        142,
        "&circ;"
    ],
    [
        0,
        "&caron;"
    ],
    [
        16,
        "&breve;"
    ],
    [
        0,
        "&DiacriticalDot;"
    ],
    [
        0,
        "&ring;"
    ],
    [
        0,
        "&ogon;"
    ],
    [
        0,
        "&DiacriticalTilde;"
    ],
    [
        0,
        "&dblac;"
    ],
    [
        51,
        "&DownBreve;"
    ],
    [
        127,
        "&Alpha;"
    ],
    [
        0,
        "&Beta;"
    ],
    [
        0,
        "&Gamma;"
    ],
    [
        0,
        "&Delta;"
    ],
    [
        0,
        "&Epsilon;"
    ],
    [
        0,
        "&Zeta;"
    ],
    [
        0,
        "&Eta;"
    ],
    [
        0,
        "&Theta;"
    ],
    [
        0,
        "&Iota;"
    ],
    [
        0,
        "&Kappa;"
    ],
    [
        0,
        "&Lambda;"
    ],
    [
        0,
        "&Mu;"
    ],
    [
        0,
        "&Nu;"
    ],
    [
        0,
        "&Xi;"
    ],
    [
        0,
        "&Omicron;"
    ],
    [
        0,
        "&Pi;"
    ],
    [
        0,
        "&Rho;"
    ],
    [
        1,
        "&Sigma;"
    ],
    [
        0,
        "&Tau;"
    ],
    [
        0,
        "&Upsilon;"
    ],
    [
        0,
        "&Phi;"
    ],
    [
        0,
        "&Chi;"
    ],
    [
        0,
        "&Psi;"
    ],
    [
        0,
        "&ohm;"
    ],
    [
        7,
        "&alpha;"
    ],
    [
        0,
        "&beta;"
    ],
    [
        0,
        "&gamma;"
    ],
    [
        0,
        "&delta;"
    ],
    [
        0,
        "&epsi;"
    ],
    [
        0,
        "&zeta;"
    ],
    [
        0,
        "&eta;"
    ],
    [
        0,
        "&theta;"
    ],
    [
        0,
        "&iota;"
    ],
    [
        0,
        "&kappa;"
    ],
    [
        0,
        "&lambda;"
    ],
    [
        0,
        "&mu;"
    ],
    [
        0,
        "&nu;"
    ],
    [
        0,
        "&xi;"
    ],
    [
        0,
        "&omicron;"
    ],
    [
        0,
        "&pi;"
    ],
    [
        0,
        "&rho;"
    ],
    [
        0,
        "&sigmaf;"
    ],
    [
        0,
        "&sigma;"
    ],
    [
        0,
        "&tau;"
    ],
    [
        0,
        "&upsi;"
    ],
    [
        0,
        "&phi;"
    ],
    [
        0,
        "&chi;"
    ],
    [
        0,
        "&psi;"
    ],
    [
        0,
        "&omega;"
    ],
    [
        7,
        "&thetasym;"
    ],
    [
        0,
        "&Upsi;"
    ],
    [
        2,
        "&phiv;"
    ],
    [
        0,
        "&piv;"
    ],
    [
        5,
        "&Gammad;"
    ],
    [
        0,
        "&digamma;"
    ],
    [
        18,
        "&kappav;"
    ],
    [
        0,
        "&rhov;"
    ],
    [
        3,
        "&epsiv;"
    ],
    [
        0,
        "&backepsilon;"
    ],
    [
        10,
        "&IOcy;"
    ],
    [
        0,
        "&DJcy;"
    ],
    [
        0,
        "&GJcy;"
    ],
    [
        0,
        "&Jukcy;"
    ],
    [
        0,
        "&DScy;"
    ],
    [
        0,
        "&Iukcy;"
    ],
    [
        0,
        "&YIcy;"
    ],
    [
        0,
        "&Jsercy;"
    ],
    [
        0,
        "&LJcy;"
    ],
    [
        0,
        "&NJcy;"
    ],
    [
        0,
        "&TSHcy;"
    ],
    [
        0,
        "&KJcy;"
    ],
    [
        1,
        "&Ubrcy;"
    ],
    [
        0,
        "&DZcy;"
    ],
    [
        0,
        "&Acy;"
    ],
    [
        0,
        "&Bcy;"
    ],
    [
        0,
        "&Vcy;"
    ],
    [
        0,
        "&Gcy;"
    ],
    [
        0,
        "&Dcy;"
    ],
    [
        0,
        "&IEcy;"
    ],
    [
        0,
        "&ZHcy;"
    ],
    [
        0,
        "&Zcy;"
    ],
    [
        0,
        "&Icy;"
    ],
    [
        0,
        "&Jcy;"
    ],
    [
        0,
        "&Kcy;"
    ],
    [
        0,
        "&Lcy;"
    ],
    [
        0,
        "&Mcy;"
    ],
    [
        0,
        "&Ncy;"
    ],
    [
        0,
        "&Ocy;"
    ],
    [
        0,
        "&Pcy;"
    ],
    [
        0,
        "&Rcy;"
    ],
    [
        0,
        "&Scy;"
    ],
    [
        0,
        "&Tcy;"
    ],
    [
        0,
        "&Ucy;"
    ],
    [
        0,
        "&Fcy;"
    ],
    [
        0,
        "&KHcy;"
    ],
    [
        0,
        "&TScy;"
    ],
    [
        0,
        "&CHcy;"
    ],
    [
        0,
        "&SHcy;"
    ],
    [
        0,
        "&SHCHcy;"
    ],
    [
        0,
        "&HARDcy;"
    ],
    [
        0,
        "&Ycy;"
    ],
    [
        0,
        "&SOFTcy;"
    ],
    [
        0,
        "&Ecy;"
    ],
    [
        0,
        "&YUcy;"
    ],
    [
        0,
        "&YAcy;"
    ],
    [
        0,
        "&acy;"
    ],
    [
        0,
        "&bcy;"
    ],
    [
        0,
        "&vcy;"
    ],
    [
        0,
        "&gcy;"
    ],
    [
        0,
        "&dcy;"
    ],
    [
        0,
        "&iecy;"
    ],
    [
        0,
        "&zhcy;"
    ],
    [
        0,
        "&zcy;"
    ],
    [
        0,
        "&icy;"
    ],
    [
        0,
        "&jcy;"
    ],
    [
        0,
        "&kcy;"
    ],
    [
        0,
        "&lcy;"
    ],
    [
        0,
        "&mcy;"
    ],
    [
        0,
        "&ncy;"
    ],
    [
        0,
        "&ocy;"
    ],
    [
        0,
        "&pcy;"
    ],
    [
        0,
        "&rcy;"
    ],
    [
        0,
        "&scy;"
    ],
    [
        0,
        "&tcy;"
    ],
    [
        0,
        "&ucy;"
    ],
    [
        0,
        "&fcy;"
    ],
    [
        0,
        "&khcy;"
    ],
    [
        0,
        "&tscy;"
    ],
    [
        0,
        "&chcy;"
    ],
    [
        0,
        "&shcy;"
    ],
    [
        0,
        "&shchcy;"
    ],
    [
        0,
        "&hardcy;"
    ],
    [
        0,
        "&ycy;"
    ],
    [
        0,
        "&softcy;"
    ],
    [
        0,
        "&ecy;"
    ],
    [
        0,
        "&yucy;"
    ],
    [
        0,
        "&yacy;"
    ],
    [
        1,
        "&iocy;"
    ],
    [
        0,
        "&djcy;"
    ],
    [
        0,
        "&gjcy;"
    ],
    [
        0,
        "&jukcy;"
    ],
    [
        0,
        "&dscy;"
    ],
    [
        0,
        "&iukcy;"
    ],
    [
        0,
        "&yicy;"
    ],
    [
        0,
        "&jsercy;"
    ],
    [
        0,
        "&ljcy;"
    ],
    [
        0,
        "&njcy;"
    ],
    [
        0,
        "&tshcy;"
    ],
    [
        0,
        "&kjcy;"
    ],
    [
        1,
        "&ubrcy;"
    ],
    [
        0,
        "&dzcy;"
    ],
    [
        7074,
        "&ensp;"
    ],
    [
        0,
        "&emsp;"
    ],
    [
        0,
        "&emsp13;"
    ],
    [
        0,
        "&emsp14;"
    ],
    [
        1,
        "&numsp;"
    ],
    [
        0,
        "&puncsp;"
    ],
    [
        0,
        "&ThinSpace;"
    ],
    [
        0,
        "&hairsp;"
    ],
    [
        0,
        "&NegativeMediumSpace;"
    ],
    [
        0,
        "&zwnj;"
    ],
    [
        0,
        "&zwj;"
    ],
    [
        0,
        "&lrm;"
    ],
    [
        0,
        "&rlm;"
    ],
    [
        0,
        "&dash;"
    ],
    [
        2,
        "&ndash;"
    ],
    [
        0,
        "&mdash;"
    ],
    [
        0,
        "&horbar;"
    ],
    [
        0,
        "&Verbar;"
    ],
    [
        1,
        "&lsquo;"
    ],
    [
        0,
        "&CloseCurlyQuote;"
    ],
    [
        0,
        "&lsquor;"
    ],
    [
        1,
        "&ldquo;"
    ],
    [
        0,
        "&CloseCurlyDoubleQuote;"
    ],
    [
        0,
        "&bdquo;"
    ],
    [
        1,
        "&dagger;"
    ],
    [
        0,
        "&Dagger;"
    ],
    [
        0,
        "&bull;"
    ],
    [
        2,
        "&nldr;"
    ],
    [
        0,
        "&hellip;"
    ],
    [
        9,
        "&permil;"
    ],
    [
        0,
        "&pertenk;"
    ],
    [
        0,
        "&prime;"
    ],
    [
        0,
        "&Prime;"
    ],
    [
        0,
        "&tprime;"
    ],
    [
        0,
        "&backprime;"
    ],
    [
        3,
        "&lsaquo;"
    ],
    [
        0,
        "&rsaquo;"
    ],
    [
        3,
        "&oline;"
    ],
    [
        2,
        "&caret;"
    ],
    [
        1,
        "&hybull;"
    ],
    [
        0,
        "&frasl;"
    ],
    [
        10,
        "&bsemi;"
    ],
    [
        7,
        "&qprime;"
    ],
    [
        7,
        {
            v: "&MediumSpace;",
            n: 8202,
            o: "&ThickSpace;"
        }
    ],
    [
        0,
        "&NoBreak;"
    ],
    [
        0,
        "&af;"
    ],
    [
        0,
        "&InvisibleTimes;"
    ],
    [
        0,
        "&ic;"
    ],
    [
        72,
        "&euro;"
    ],
    [
        46,
        "&tdot;"
    ],
    [
        0,
        "&DotDot;"
    ],
    [
        37,
        "&complexes;"
    ],
    [
        2,
        "&incare;"
    ],
    [
        4,
        "&gscr;"
    ],
    [
        0,
        "&hamilt;"
    ],
    [
        0,
        "&Hfr;"
    ],
    [
        0,
        "&Hopf;"
    ],
    [
        0,
        "&planckh;"
    ],
    [
        0,
        "&hbar;"
    ],
    [
        0,
        "&imagline;"
    ],
    [
        0,
        "&Ifr;"
    ],
    [
        0,
        "&lagran;"
    ],
    [
        0,
        "&ell;"
    ],
    [
        1,
        "&naturals;"
    ],
    [
        0,
        "&numero;"
    ],
    [
        0,
        "&copysr;"
    ],
    [
        0,
        "&weierp;"
    ],
    [
        0,
        "&Popf;"
    ],
    [
        0,
        "&Qopf;"
    ],
    [
        0,
        "&realine;"
    ],
    [
        0,
        "&real;"
    ],
    [
        0,
        "&reals;"
    ],
    [
        0,
        "&rx;"
    ],
    [
        3,
        "&trade;"
    ],
    [
        1,
        "&integers;"
    ],
    [
        2,
        "&mho;"
    ],
    [
        0,
        "&zeetrf;"
    ],
    [
        0,
        "&iiota;"
    ],
    [
        2,
        "&bernou;"
    ],
    [
        0,
        "&Cayleys;"
    ],
    [
        1,
        "&escr;"
    ],
    [
        0,
        "&Escr;"
    ],
    [
        0,
        "&Fouriertrf;"
    ],
    [
        1,
        "&Mellintrf;"
    ],
    [
        0,
        "&order;"
    ],
    [
        0,
        "&alefsym;"
    ],
    [
        0,
        "&beth;"
    ],
    [
        0,
        "&gimel;"
    ],
    [
        0,
        "&daleth;"
    ],
    [
        12,
        "&CapitalDifferentialD;"
    ],
    [
        0,
        "&dd;"
    ],
    [
        0,
        "&ee;"
    ],
    [
        0,
        "&ii;"
    ],
    [
        10,
        "&frac13;"
    ],
    [
        0,
        "&frac23;"
    ],
    [
        0,
        "&frac15;"
    ],
    [
        0,
        "&frac25;"
    ],
    [
        0,
        "&frac35;"
    ],
    [
        0,
        "&frac45;"
    ],
    [
        0,
        "&frac16;"
    ],
    [
        0,
        "&frac56;"
    ],
    [
        0,
        "&frac18;"
    ],
    [
        0,
        "&frac38;"
    ],
    [
        0,
        "&frac58;"
    ],
    [
        0,
        "&frac78;"
    ],
    [
        49,
        "&larr;"
    ],
    [
        0,
        "&ShortUpArrow;"
    ],
    [
        0,
        "&rarr;"
    ],
    [
        0,
        "&darr;"
    ],
    [
        0,
        "&harr;"
    ],
    [
        0,
        "&updownarrow;"
    ],
    [
        0,
        "&nwarr;"
    ],
    [
        0,
        "&nearr;"
    ],
    [
        0,
        "&LowerRightArrow;"
    ],
    [
        0,
        "&LowerLeftArrow;"
    ],
    [
        0,
        "&nlarr;"
    ],
    [
        0,
        "&nrarr;"
    ],
    [
        1,
        {
            v: "&rarrw;",
            n: 824,
            o: "&nrarrw;"
        }
    ],
    [
        0,
        "&Larr;"
    ],
    [
        0,
        "&Uarr;"
    ],
    [
        0,
        "&Rarr;"
    ],
    [
        0,
        "&Darr;"
    ],
    [
        0,
        "&larrtl;"
    ],
    [
        0,
        "&rarrtl;"
    ],
    [
        0,
        "&LeftTeeArrow;"
    ],
    [
        0,
        "&mapstoup;"
    ],
    [
        0,
        "&map;"
    ],
    [
        0,
        "&DownTeeArrow;"
    ],
    [
        1,
        "&hookleftarrow;"
    ],
    [
        0,
        "&hookrightarrow;"
    ],
    [
        0,
        "&larrlp;"
    ],
    [
        0,
        "&looparrowright;"
    ],
    [
        0,
        "&harrw;"
    ],
    [
        0,
        "&nharr;"
    ],
    [
        1,
        "&lsh;"
    ],
    [
        0,
        "&rsh;"
    ],
    [
        0,
        "&ldsh;"
    ],
    [
        0,
        "&rdsh;"
    ],
    [
        1,
        "&crarr;"
    ],
    [
        0,
        "&cularr;"
    ],
    [
        0,
        "&curarr;"
    ],
    [
        2,
        "&circlearrowleft;"
    ],
    [
        0,
        "&circlearrowright;"
    ],
    [
        0,
        "&leftharpoonup;"
    ],
    [
        0,
        "&DownLeftVector;"
    ],
    [
        0,
        "&RightUpVector;"
    ],
    [
        0,
        "&LeftUpVector;"
    ],
    [
        0,
        "&rharu;"
    ],
    [
        0,
        "&DownRightVector;"
    ],
    [
        0,
        "&dharr;"
    ],
    [
        0,
        "&dharl;"
    ],
    [
        0,
        "&RightArrowLeftArrow;"
    ],
    [
        0,
        "&udarr;"
    ],
    [
        0,
        "&LeftArrowRightArrow;"
    ],
    [
        0,
        "&leftleftarrows;"
    ],
    [
        0,
        "&upuparrows;"
    ],
    [
        0,
        "&rightrightarrows;"
    ],
    [
        0,
        "&ddarr;"
    ],
    [
        0,
        "&leftrightharpoons;"
    ],
    [
        0,
        "&Equilibrium;"
    ],
    [
        0,
        "&nlArr;"
    ],
    [
        0,
        "&nhArr;"
    ],
    [
        0,
        "&nrArr;"
    ],
    [
        0,
        "&DoubleLeftArrow;"
    ],
    [
        0,
        "&DoubleUpArrow;"
    ],
    [
        0,
        "&DoubleRightArrow;"
    ],
    [
        0,
        "&dArr;"
    ],
    [
        0,
        "&DoubleLeftRightArrow;"
    ],
    [
        0,
        "&DoubleUpDownArrow;"
    ],
    [
        0,
        "&nwArr;"
    ],
    [
        0,
        "&neArr;"
    ],
    [
        0,
        "&seArr;"
    ],
    [
        0,
        "&swArr;"
    ],
    [
        0,
        "&lAarr;"
    ],
    [
        0,
        "&rAarr;"
    ],
    [
        1,
        "&zigrarr;"
    ],
    [
        6,
        "&larrb;"
    ],
    [
        0,
        "&rarrb;"
    ],
    [
        15,
        "&DownArrowUpArrow;"
    ],
    [
        7,
        "&loarr;"
    ],
    [
        0,
        "&roarr;"
    ],
    [
        0,
        "&hoarr;"
    ],
    [
        0,
        "&forall;"
    ],
    [
        0,
        "&comp;"
    ],
    [
        0,
        {
            v: "&part;",
            n: 824,
            o: "&npart;"
        }
    ],
    [
        0,
        "&exist;"
    ],
    [
        0,
        "&nexist;"
    ],
    [
        0,
        "&empty;"
    ],
    [
        1,
        "&Del;"
    ],
    [
        0,
        "&Element;"
    ],
    [
        0,
        "&NotElement;"
    ],
    [
        1,
        "&ni;"
    ],
    [
        0,
        "&notni;"
    ],
    [
        2,
        "&prod;"
    ],
    [
        0,
        "&coprod;"
    ],
    [
        0,
        "&sum;"
    ],
    [
        0,
        "&minus;"
    ],
    [
        0,
        "&MinusPlus;"
    ],
    [
        0,
        "&dotplus;"
    ],
    [
        1,
        "&Backslash;"
    ],
    [
        0,
        "&lowast;"
    ],
    [
        0,
        "&compfn;"
    ],
    [
        1,
        "&radic;"
    ],
    [
        2,
        "&prop;"
    ],
    [
        0,
        "&infin;"
    ],
    [
        0,
        "&angrt;"
    ],
    [
        0,
        {
            v: "&ang;",
            n: 8402,
            o: "&nang;"
        }
    ],
    [
        0,
        "&angmsd;"
    ],
    [
        0,
        "&angsph;"
    ],
    [
        0,
        "&mid;"
    ],
    [
        0,
        "&nmid;"
    ],
    [
        0,
        "&DoubleVerticalBar;"
    ],
    [
        0,
        "&NotDoubleVerticalBar;"
    ],
    [
        0,
        "&and;"
    ],
    [
        0,
        "&or;"
    ],
    [
        0,
        {
            v: "&cap;",
            n: 65024,
            o: "&caps;"
        }
    ],
    [
        0,
        {
            v: "&cup;",
            n: 65024,
            o: "&cups;"
        }
    ],
    [
        0,
        "&int;"
    ],
    [
        0,
        "&Int;"
    ],
    [
        0,
        "&iiint;"
    ],
    [
        0,
        "&conint;"
    ],
    [
        0,
        "&Conint;"
    ],
    [
        0,
        "&Cconint;"
    ],
    [
        0,
        "&cwint;"
    ],
    [
        0,
        "&ClockwiseContourIntegral;"
    ],
    [
        0,
        "&awconint;"
    ],
    [
        0,
        "&there4;"
    ],
    [
        0,
        "&becaus;"
    ],
    [
        0,
        "&ratio;"
    ],
    [
        0,
        "&Colon;"
    ],
    [
        0,
        "&dotminus;"
    ],
    [
        1,
        "&mDDot;"
    ],
    [
        0,
        "&homtht;"
    ],
    [
        0,
        {
            v: "&sim;",
            n: 8402,
            o: "&nvsim;"
        }
    ],
    [
        0,
        {
            v: "&backsim;",
            n: 817,
            o: "&race;"
        }
    ],
    [
        0,
        {
            v: "&ac;",
            n: 819,
            o: "&acE;"
        }
    ],
    [
        0,
        "&acd;"
    ],
    [
        0,
        "&VerticalTilde;"
    ],
    [
        0,
        "&NotTilde;"
    ],
    [
        0,
        {
            v: "&eqsim;",
            n: 824,
            o: "&nesim;"
        }
    ],
    [
        0,
        "&sime;"
    ],
    [
        0,
        "&NotTildeEqual;"
    ],
    [
        0,
        "&cong;"
    ],
    [
        0,
        "&simne;"
    ],
    [
        0,
        "&ncong;"
    ],
    [
        0,
        "&ap;"
    ],
    [
        0,
        "&nap;"
    ],
    [
        0,
        "&ape;"
    ],
    [
        0,
        {
            v: "&apid;",
            n: 824,
            o: "&napid;"
        }
    ],
    [
        0,
        "&backcong;"
    ],
    [
        0,
        {
            v: "&asympeq;",
            n: 8402,
            o: "&nvap;"
        }
    ],
    [
        0,
        {
            v: "&bump;",
            n: 824,
            o: "&nbump;"
        }
    ],
    [
        0,
        {
            v: "&bumpe;",
            n: 824,
            o: "&nbumpe;"
        }
    ],
    [
        0,
        {
            v: "&doteq;",
            n: 824,
            o: "&nedot;"
        }
    ],
    [
        0,
        "&doteqdot;"
    ],
    [
        0,
        "&efDot;"
    ],
    [
        0,
        "&erDot;"
    ],
    [
        0,
        "&Assign;"
    ],
    [
        0,
        "&ecolon;"
    ],
    [
        0,
        "&ecir;"
    ],
    [
        0,
        "&circeq;"
    ],
    [
        1,
        "&wedgeq;"
    ],
    [
        0,
        "&veeeq;"
    ],
    [
        1,
        "&triangleq;"
    ],
    [
        2,
        "&equest;"
    ],
    [
        0,
        "&ne;"
    ],
    [
        0,
        {
            v: "&Congruent;",
            n: 8421,
            o: "&bnequiv;"
        }
    ],
    [
        0,
        "&nequiv;"
    ],
    [
        1,
        {
            v: "&le;",
            n: 8402,
            o: "&nvle;"
        }
    ],
    [
        0,
        {
            v: "&ge;",
            n: 8402,
            o: "&nvge;"
        }
    ],
    [
        0,
        {
            v: "&lE;",
            n: 824,
            o: "&nlE;"
        }
    ],
    [
        0,
        {
            v: "&gE;",
            n: 824,
            o: "&ngE;"
        }
    ],
    [
        0,
        {
            v: "&lnE;",
            n: 65024,
            o: "&lvertneqq;"
        }
    ],
    [
        0,
        {
            v: "&gnE;",
            n: 65024,
            o: "&gvertneqq;"
        }
    ],
    [
        0,
        {
            v: "&ll;",
            n: new Map(v3([
                [
                    824,
                    "&nLtv;"
                ],
                [
                    7577,
                    "&nLt;"
                ]
            ]))
        }
    ],
    [
        0,
        {
            v: "&gg;",
            n: new Map(v3([
                [
                    824,
                    "&nGtv;"
                ],
                [
                    7577,
                    "&nGt;"
                ]
            ]))
        }
    ],
    [
        0,
        "&between;"
    ],
    [
        0,
        "&NotCupCap;"
    ],
    [
        0,
        "&nless;"
    ],
    [
        0,
        "&ngt;"
    ],
    [
        0,
        "&nle;"
    ],
    [
        0,
        "&nge;"
    ],
    [
        0,
        "&lesssim;"
    ],
    [
        0,
        "&GreaterTilde;"
    ],
    [
        0,
        "&nlsim;"
    ],
    [
        0,
        "&ngsim;"
    ],
    [
        0,
        "&LessGreater;"
    ],
    [
        0,
        "&gl;"
    ],
    [
        0,
        "&NotLessGreater;"
    ],
    [
        0,
        "&NotGreaterLess;"
    ],
    [
        0,
        "&pr;"
    ],
    [
        0,
        "&sc;"
    ],
    [
        0,
        "&prcue;"
    ],
    [
        0,
        "&sccue;"
    ],
    [
        0,
        "&PrecedesTilde;"
    ],
    [
        0,
        {
            v: "&scsim;",
            n: 824,
            o: "&NotSucceedsTilde;"
        }
    ],
    [
        0,
        "&NotPrecedes;"
    ],
    [
        0,
        "&NotSucceeds;"
    ],
    [
        0,
        {
            v: "&sub;",
            n: 8402,
            o: "&NotSubset;"
        }
    ],
    [
        0,
        {
            v: "&sup;",
            n: 8402,
            o: "&NotSuperset;"
        }
    ],
    [
        0,
        "&nsub;"
    ],
    [
        0,
        "&nsup;"
    ],
    [
        0,
        "&sube;"
    ],
    [
        0,
        "&supe;"
    ],
    [
        0,
        "&NotSubsetEqual;"
    ],
    [
        0,
        "&NotSupersetEqual;"
    ],
    [
        0,
        {
            v: "&subne;",
            n: 65024,
            o: "&varsubsetneq;"
        }
    ],
    [
        0,
        {
            v: "&supne;",
            n: 65024,
            o: "&varsupsetneq;"
        }
    ],
    [
        1,
        "&cupdot;"
    ],
    [
        0,
        "&UnionPlus;"
    ],
    [
        0,
        {
            v: "&sqsub;",
            n: 824,
            o: "&NotSquareSubset;"
        }
    ],
    [
        0,
        {
            v: "&sqsup;",
            n: 824,
            o: "&NotSquareSuperset;"
        }
    ],
    [
        0,
        "&sqsube;"
    ],
    [
        0,
        "&sqsupe;"
    ],
    [
        0,
        {
            v: "&sqcap;",
            n: 65024,
            o: "&sqcaps;"
        }
    ],
    [
        0,
        {
            v: "&sqcup;",
            n: 65024,
            o: "&sqcups;"
        }
    ],
    [
        0,
        "&CirclePlus;"
    ],
    [
        0,
        "&CircleMinus;"
    ],
    [
        0,
        "&CircleTimes;"
    ],
    [
        0,
        "&osol;"
    ],
    [
        0,
        "&CircleDot;"
    ],
    [
        0,
        "&circledcirc;"
    ],
    [
        0,
        "&circledast;"
    ],
    [
        1,
        "&circleddash;"
    ],
    [
        0,
        "&boxplus;"
    ],
    [
        0,
        "&boxminus;"
    ],
    [
        0,
        "&boxtimes;"
    ],
    [
        0,
        "&dotsquare;"
    ],
    [
        0,
        "&RightTee;"
    ],
    [
        0,
        "&dashv;"
    ],
    [
        0,
        "&DownTee;"
    ],
    [
        0,
        "&bot;"
    ],
    [
        1,
        "&models;"
    ],
    [
        0,
        "&DoubleRightTee;"
    ],
    [
        0,
        "&Vdash;"
    ],
    [
        0,
        "&Vvdash;"
    ],
    [
        0,
        "&VDash;"
    ],
    [
        0,
        "&nvdash;"
    ],
    [
        0,
        "&nvDash;"
    ],
    [
        0,
        "&nVdash;"
    ],
    [
        0,
        "&nVDash;"
    ],
    [
        0,
        "&prurel;"
    ],
    [
        1,
        "&LeftTriangle;"
    ],
    [
        0,
        "&RightTriangle;"
    ],
    [
        0,
        {
            v: "&LeftTriangleEqual;",
            n: 8402,
            o: "&nvltrie;"
        }
    ],
    [
        0,
        {
            v: "&RightTriangleEqual;",
            n: 8402,
            o: "&nvrtrie;"
        }
    ],
    [
        0,
        "&origof;"
    ],
    [
        0,
        "&imof;"
    ],
    [
        0,
        "&multimap;"
    ],
    [
        0,
        "&hercon;"
    ],
    [
        0,
        "&intcal;"
    ],
    [
        0,
        "&veebar;"
    ],
    [
        1,
        "&barvee;"
    ],
    [
        0,
        "&angrtvb;"
    ],
    [
        0,
        "&lrtri;"
    ],
    [
        0,
        "&bigwedge;"
    ],
    [
        0,
        "&bigvee;"
    ],
    [
        0,
        "&bigcap;"
    ],
    [
        0,
        "&bigcup;"
    ],
    [
        0,
        "&diam;"
    ],
    [
        0,
        "&sdot;"
    ],
    [
        0,
        "&sstarf;"
    ],
    [
        0,
        "&divideontimes;"
    ],
    [
        0,
        "&bowtie;"
    ],
    [
        0,
        "&ltimes;"
    ],
    [
        0,
        "&rtimes;"
    ],
    [
        0,
        "&leftthreetimes;"
    ],
    [
        0,
        "&rightthreetimes;"
    ],
    [
        0,
        "&backsimeq;"
    ],
    [
        0,
        "&curlyvee;"
    ],
    [
        0,
        "&curlywedge;"
    ],
    [
        0,
        "&Sub;"
    ],
    [
        0,
        "&Sup;"
    ],
    [
        0,
        "&Cap;"
    ],
    [
        0,
        "&Cup;"
    ],
    [
        0,
        "&fork;"
    ],
    [
        0,
        "&epar;"
    ],
    [
        0,
        "&lessdot;"
    ],
    [
        0,
        "&gtdot;"
    ],
    [
        0,
        {
            v: "&Ll;",
            n: 824,
            o: "&nLl;"
        }
    ],
    [
        0,
        {
            v: "&Gg;",
            n: 824,
            o: "&nGg;"
        }
    ],
    [
        0,
        {
            v: "&leg;",
            n: 65024,
            o: "&lesg;"
        }
    ],
    [
        0,
        {
            v: "&gel;",
            n: 65024,
            o: "&gesl;"
        }
    ],
    [
        2,
        "&cuepr;"
    ],
    [
        0,
        "&cuesc;"
    ],
    [
        0,
        "&NotPrecedesSlantEqual;"
    ],
    [
        0,
        "&NotSucceedsSlantEqual;"
    ],
    [
        0,
        "&NotSquareSubsetEqual;"
    ],
    [
        0,
        "&NotSquareSupersetEqual;"
    ],
    [
        2,
        "&lnsim;"
    ],
    [
        0,
        "&gnsim;"
    ],
    [
        0,
        "&precnsim;"
    ],
    [
        0,
        "&scnsim;"
    ],
    [
        0,
        "&nltri;"
    ],
    [
        0,
        "&NotRightTriangle;"
    ],
    [
        0,
        "&nltrie;"
    ],
    [
        0,
        "&NotRightTriangleEqual;"
    ],
    [
        0,
        "&vellip;"
    ],
    [
        0,
        "&ctdot;"
    ],
    [
        0,
        "&utdot;"
    ],
    [
        0,
        "&dtdot;"
    ],
    [
        0,
        "&disin;"
    ],
    [
        0,
        "&isinsv;"
    ],
    [
        0,
        "&isins;"
    ],
    [
        0,
        {
            v: "&isindot;",
            n: 824,
            o: "&notindot;"
        }
    ],
    [
        0,
        "&notinvc;"
    ],
    [
        0,
        "&notinvb;"
    ],
    [
        1,
        {
            v: "&isinE;",
            n: 824,
            o: "&notinE;"
        }
    ],
    [
        0,
        "&nisd;"
    ],
    [
        0,
        "&xnis;"
    ],
    [
        0,
        "&nis;"
    ],
    [
        0,
        "&notnivc;"
    ],
    [
        0,
        "&notnivb;"
    ],
    [
        6,
        "&barwed;"
    ],
    [
        0,
        "&Barwed;"
    ],
    [
        1,
        "&lceil;"
    ],
    [
        0,
        "&rceil;"
    ],
    [
        0,
        "&LeftFloor;"
    ],
    [
        0,
        "&rfloor;"
    ],
    [
        0,
        "&drcrop;"
    ],
    [
        0,
        "&dlcrop;"
    ],
    [
        0,
        "&urcrop;"
    ],
    [
        0,
        "&ulcrop;"
    ],
    [
        0,
        "&bnot;"
    ],
    [
        1,
        "&profline;"
    ],
    [
        0,
        "&profsurf;"
    ],
    [
        1,
        "&telrec;"
    ],
    [
        0,
        "&target;"
    ],
    [
        5,
        "&ulcorn;"
    ],
    [
        0,
        "&urcorn;"
    ],
    [
        0,
        "&dlcorn;"
    ],
    [
        0,
        "&drcorn;"
    ],
    [
        2,
        "&frown;"
    ],
    [
        0,
        "&smile;"
    ],
    [
        9,
        "&cylcty;"
    ],
    [
        0,
        "&profalar;"
    ],
    [
        7,
        "&topbot;"
    ],
    [
        6,
        "&ovbar;"
    ],
    [
        1,
        "&solbar;"
    ],
    [
        60,
        "&angzarr;"
    ],
    [
        51,
        "&lmoustache;"
    ],
    [
        0,
        "&rmoustache;"
    ],
    [
        2,
        "&OverBracket;"
    ],
    [
        0,
        "&bbrk;"
    ],
    [
        0,
        "&bbrktbrk;"
    ],
    [
        37,
        "&OverParenthesis;"
    ],
    [
        0,
        "&UnderParenthesis;"
    ],
    [
        0,
        "&OverBrace;"
    ],
    [
        0,
        "&UnderBrace;"
    ],
    [
        2,
        "&trpezium;"
    ],
    [
        4,
        "&elinters;"
    ],
    [
        59,
        "&blank;"
    ],
    [
        164,
        "&circledS;"
    ],
    [
        55,
        "&boxh;"
    ],
    [
        1,
        "&boxv;"
    ],
    [
        9,
        "&boxdr;"
    ],
    [
        3,
        "&boxdl;"
    ],
    [
        3,
        "&boxur;"
    ],
    [
        3,
        "&boxul;"
    ],
    [
        3,
        "&boxvr;"
    ],
    [
        7,
        "&boxvl;"
    ],
    [
        7,
        "&boxhd;"
    ],
    [
        7,
        "&boxhu;"
    ],
    [
        7,
        "&boxvh;"
    ],
    [
        19,
        "&boxH;"
    ],
    [
        0,
        "&boxV;"
    ],
    [
        0,
        "&boxdR;"
    ],
    [
        0,
        "&boxDr;"
    ],
    [
        0,
        "&boxDR;"
    ],
    [
        0,
        "&boxdL;"
    ],
    [
        0,
        "&boxDl;"
    ],
    [
        0,
        "&boxDL;"
    ],
    [
        0,
        "&boxuR;"
    ],
    [
        0,
        "&boxUr;"
    ],
    [
        0,
        "&boxUR;"
    ],
    [
        0,
        "&boxuL;"
    ],
    [
        0,
        "&boxUl;"
    ],
    [
        0,
        "&boxUL;"
    ],
    [
        0,
        "&boxvR;"
    ],
    [
        0,
        "&boxVr;"
    ],
    [
        0,
        "&boxVR;"
    ],
    [
        0,
        "&boxvL;"
    ],
    [
        0,
        "&boxVl;"
    ],
    [
        0,
        "&boxVL;"
    ],
    [
        0,
        "&boxHd;"
    ],
    [
        0,
        "&boxhD;"
    ],
    [
        0,
        "&boxHD;"
    ],
    [
        0,
        "&boxHu;"
    ],
    [
        0,
        "&boxhU;"
    ],
    [
        0,
        "&boxHU;"
    ],
    [
        0,
        "&boxvH;"
    ],
    [
        0,
        "&boxVh;"
    ],
    [
        0,
        "&boxVH;"
    ],
    [
        19,
        "&uhblk;"
    ],
    [
        3,
        "&lhblk;"
    ],
    [
        3,
        "&block;"
    ],
    [
        8,
        "&blk14;"
    ],
    [
        0,
        "&blk12;"
    ],
    [
        0,
        "&blk34;"
    ],
    [
        13,
        "&square;"
    ],
    [
        8,
        "&blacksquare;"
    ],
    [
        0,
        "&EmptyVerySmallSquare;"
    ],
    [
        1,
        "&rect;"
    ],
    [
        0,
        "&marker;"
    ],
    [
        2,
        "&fltns;"
    ],
    [
        1,
        "&bigtriangleup;"
    ],
    [
        0,
        "&blacktriangle;"
    ],
    [
        0,
        "&triangle;"
    ],
    [
        2,
        "&blacktriangleright;"
    ],
    [
        0,
        "&rtri;"
    ],
    [
        3,
        "&bigtriangledown;"
    ],
    [
        0,
        "&blacktriangledown;"
    ],
    [
        0,
        "&dtri;"
    ],
    [
        2,
        "&blacktriangleleft;"
    ],
    [
        0,
        "&ltri;"
    ],
    [
        6,
        "&loz;"
    ],
    [
        0,
        "&cir;"
    ],
    [
        32,
        "&tridot;"
    ],
    [
        2,
        "&bigcirc;"
    ],
    [
        8,
        "&ultri;"
    ],
    [
        0,
        "&urtri;"
    ],
    [
        0,
        "&lltri;"
    ],
    [
        0,
        "&EmptySmallSquare;"
    ],
    [
        0,
        "&FilledSmallSquare;"
    ],
    [
        8,
        "&bigstar;"
    ],
    [
        0,
        "&star;"
    ],
    [
        7,
        "&phone;"
    ],
    [
        49,
        "&female;"
    ],
    [
        1,
        "&male;"
    ],
    [
        29,
        "&spades;"
    ],
    [
        2,
        "&clubs;"
    ],
    [
        1,
        "&hearts;"
    ],
    [
        0,
        "&diamondsuit;"
    ],
    [
        3,
        "&sung;"
    ],
    [
        2,
        "&flat;"
    ],
    [
        0,
        "&natural;"
    ],
    [
        0,
        "&sharp;"
    ],
    [
        163,
        "&check;"
    ],
    [
        3,
        "&cross;"
    ],
    [
        8,
        "&malt;"
    ],
    [
        21,
        "&sext;"
    ],
    [
        33,
        "&VerticalSeparator;"
    ],
    [
        25,
        "&lbbrk;"
    ],
    [
        0,
        "&rbbrk;"
    ],
    [
        84,
        "&bsolhsub;"
    ],
    [
        0,
        "&suphsol;"
    ],
    [
        28,
        "&LeftDoubleBracket;"
    ],
    [
        0,
        "&RightDoubleBracket;"
    ],
    [
        0,
        "&lang;"
    ],
    [
        0,
        "&rang;"
    ],
    [
        0,
        "&Lang;"
    ],
    [
        0,
        "&Rang;"
    ],
    [
        0,
        "&loang;"
    ],
    [
        0,
        "&roang;"
    ],
    [
        7,
        "&longleftarrow;"
    ],
    [
        0,
        "&longrightarrow;"
    ],
    [
        0,
        "&longleftrightarrow;"
    ],
    [
        0,
        "&DoubleLongLeftArrow;"
    ],
    [
        0,
        "&DoubleLongRightArrow;"
    ],
    [
        0,
        "&DoubleLongLeftRightArrow;"
    ],
    [
        1,
        "&longmapsto;"
    ],
    [
        2,
        "&dzigrarr;"
    ],
    [
        258,
        "&nvlArr;"
    ],
    [
        0,
        "&nvrArr;"
    ],
    [
        0,
        "&nvHarr;"
    ],
    [
        0,
        "&Map;"
    ],
    [
        6,
        "&lbarr;"
    ],
    [
        0,
        "&bkarow;"
    ],
    [
        0,
        "&lBarr;"
    ],
    [
        0,
        "&dbkarow;"
    ],
    [
        0,
        "&drbkarow;"
    ],
    [
        0,
        "&DDotrahd;"
    ],
    [
        0,
        "&UpArrowBar;"
    ],
    [
        0,
        "&DownArrowBar;"
    ],
    [
        2,
        "&Rarrtl;"
    ],
    [
        2,
        "&latail;"
    ],
    [
        0,
        "&ratail;"
    ],
    [
        0,
        "&lAtail;"
    ],
    [
        0,
        "&rAtail;"
    ],
    [
        0,
        "&larrfs;"
    ],
    [
        0,
        "&rarrfs;"
    ],
    [
        0,
        "&larrbfs;"
    ],
    [
        0,
        "&rarrbfs;"
    ],
    [
        2,
        "&nwarhk;"
    ],
    [
        0,
        "&nearhk;"
    ],
    [
        0,
        "&hksearow;"
    ],
    [
        0,
        "&hkswarow;"
    ],
    [
        0,
        "&nwnear;"
    ],
    [
        0,
        "&nesear;"
    ],
    [
        0,
        "&seswar;"
    ],
    [
        0,
        "&swnwar;"
    ],
    [
        8,
        {
            v: "&rarrc;",
            n: 824,
            o: "&nrarrc;"
        }
    ],
    [
        1,
        "&cudarrr;"
    ],
    [
        0,
        "&ldca;"
    ],
    [
        0,
        "&rdca;"
    ],
    [
        0,
        "&cudarrl;"
    ],
    [
        0,
        "&larrpl;"
    ],
    [
        2,
        "&curarrm;"
    ],
    [
        0,
        "&cularrp;"
    ],
    [
        7,
        "&rarrpl;"
    ],
    [
        2,
        "&harrcir;"
    ],
    [
        0,
        "&Uarrocir;"
    ],
    [
        0,
        "&lurdshar;"
    ],
    [
        0,
        "&ldrushar;"
    ],
    [
        2,
        "&LeftRightVector;"
    ],
    [
        0,
        "&RightUpDownVector;"
    ],
    [
        0,
        "&DownLeftRightVector;"
    ],
    [
        0,
        "&LeftUpDownVector;"
    ],
    [
        0,
        "&LeftVectorBar;"
    ],
    [
        0,
        "&RightVectorBar;"
    ],
    [
        0,
        "&RightUpVectorBar;"
    ],
    [
        0,
        "&RightDownVectorBar;"
    ],
    [
        0,
        "&DownLeftVectorBar;"
    ],
    [
        0,
        "&DownRightVectorBar;"
    ],
    [
        0,
        "&LeftUpVectorBar;"
    ],
    [
        0,
        "&LeftDownVectorBar;"
    ],
    [
        0,
        "&LeftTeeVector;"
    ],
    [
        0,
        "&RightTeeVector;"
    ],
    [
        0,
        "&RightUpTeeVector;"
    ],
    [
        0,
        "&RightDownTeeVector;"
    ],
    [
        0,
        "&DownLeftTeeVector;"
    ],
    [
        0,
        "&DownRightTeeVector;"
    ],
    [
        0,
        "&LeftUpTeeVector;"
    ],
    [
        0,
        "&LeftDownTeeVector;"
    ],
    [
        0,
        "&lHar;"
    ],
    [
        0,
        "&uHar;"
    ],
    [
        0,
        "&rHar;"
    ],
    [
        0,
        "&dHar;"
    ],
    [
        0,
        "&luruhar;"
    ],
    [
        0,
        "&ldrdhar;"
    ],
    [
        0,
        "&ruluhar;"
    ],
    [
        0,
        "&rdldhar;"
    ],
    [
        0,
        "&lharul;"
    ],
    [
        0,
        "&llhard;"
    ],
    [
        0,
        "&rharul;"
    ],
    [
        0,
        "&lrhard;"
    ],
    [
        0,
        "&udhar;"
    ],
    [
        0,
        "&duhar;"
    ],
    [
        0,
        "&RoundImplies;"
    ],
    [
        0,
        "&erarr;"
    ],
    [
        0,
        "&simrarr;"
    ],
    [
        0,
        "&larrsim;"
    ],
    [
        0,
        "&rarrsim;"
    ],
    [
        0,
        "&rarrap;"
    ],
    [
        0,
        "&ltlarr;"
    ],
    [
        1,
        "&gtrarr;"
    ],
    [
        0,
        "&subrarr;"
    ],
    [
        1,
        "&suplarr;"
    ],
    [
        0,
        "&lfisht;"
    ],
    [
        0,
        "&rfisht;"
    ],
    [
        0,
        "&ufisht;"
    ],
    [
        0,
        "&dfisht;"
    ],
    [
        5,
        "&lopar;"
    ],
    [
        0,
        "&ropar;"
    ],
    [
        4,
        "&lbrke;"
    ],
    [
        0,
        "&rbrke;"
    ],
    [
        0,
        "&lbrkslu;"
    ],
    [
        0,
        "&rbrksld;"
    ],
    [
        0,
        "&lbrksld;"
    ],
    [
        0,
        "&rbrkslu;"
    ],
    [
        0,
        "&langd;"
    ],
    [
        0,
        "&rangd;"
    ],
    [
        0,
        "&lparlt;"
    ],
    [
        0,
        "&rpargt;"
    ],
    [
        0,
        "&gtlPar;"
    ],
    [
        0,
        "&ltrPar;"
    ],
    [
        3,
        "&vzigzag;"
    ],
    [
        1,
        "&vangrt;"
    ],
    [
        0,
        "&angrtvbd;"
    ],
    [
        6,
        "&ange;"
    ],
    [
        0,
        "&range;"
    ],
    [
        0,
        "&dwangle;"
    ],
    [
        0,
        "&uwangle;"
    ],
    [
        0,
        "&angmsdaa;"
    ],
    [
        0,
        "&angmsdab;"
    ],
    [
        0,
        "&angmsdac;"
    ],
    [
        0,
        "&angmsdad;"
    ],
    [
        0,
        "&angmsdae;"
    ],
    [
        0,
        "&angmsdaf;"
    ],
    [
        0,
        "&angmsdag;"
    ],
    [
        0,
        "&angmsdah;"
    ],
    [
        0,
        "&bemptyv;"
    ],
    [
        0,
        "&demptyv;"
    ],
    [
        0,
        "&cemptyv;"
    ],
    [
        0,
        "&raemptyv;"
    ],
    [
        0,
        "&laemptyv;"
    ],
    [
        0,
        "&ohbar;"
    ],
    [
        0,
        "&omid;"
    ],
    [
        0,
        "&opar;"
    ],
    [
        1,
        "&operp;"
    ],
    [
        1,
        "&olcross;"
    ],
    [
        0,
        "&odsold;"
    ],
    [
        1,
        "&olcir;"
    ],
    [
        0,
        "&ofcir;"
    ],
    [
        0,
        "&olt;"
    ],
    [
        0,
        "&ogt;"
    ],
    [
        0,
        "&cirscir;"
    ],
    [
        0,
        "&cirE;"
    ],
    [
        0,
        "&solb;"
    ],
    [
        0,
        "&bsolb;"
    ],
    [
        3,
        "&boxbox;"
    ],
    [
        3,
        "&trisb;"
    ],
    [
        0,
        "&rtriltri;"
    ],
    [
        0,
        {
            v: "&LeftTriangleBar;",
            n: 824,
            o: "&NotLeftTriangleBar;"
        }
    ],
    [
        0,
        {
            v: "&RightTriangleBar;",
            n: 824,
            o: "&NotRightTriangleBar;"
        }
    ],
    [
        11,
        "&iinfin;"
    ],
    [
        0,
        "&infintie;"
    ],
    [
        0,
        "&nvinfin;"
    ],
    [
        4,
        "&eparsl;"
    ],
    [
        0,
        "&smeparsl;"
    ],
    [
        0,
        "&eqvparsl;"
    ],
    [
        5,
        "&blacklozenge;"
    ],
    [
        8,
        "&RuleDelayed;"
    ],
    [
        1,
        "&dsol;"
    ],
    [
        9,
        "&bigodot;"
    ],
    [
        0,
        "&bigoplus;"
    ],
    [
        0,
        "&bigotimes;"
    ],
    [
        1,
        "&biguplus;"
    ],
    [
        1,
        "&bigsqcup;"
    ],
    [
        5,
        "&iiiint;"
    ],
    [
        0,
        "&fpartint;"
    ],
    [
        2,
        "&cirfnint;"
    ],
    [
        0,
        "&awint;"
    ],
    [
        0,
        "&rppolint;"
    ],
    [
        0,
        "&scpolint;"
    ],
    [
        0,
        "&npolint;"
    ],
    [
        0,
        "&pointint;"
    ],
    [
        0,
        "&quatint;"
    ],
    [
        0,
        "&intlarhk;"
    ],
    [
        10,
        "&pluscir;"
    ],
    [
        0,
        "&plusacir;"
    ],
    [
        0,
        "&simplus;"
    ],
    [
        0,
        "&plusdu;"
    ],
    [
        0,
        "&plussim;"
    ],
    [
        0,
        "&plustwo;"
    ],
    [
        1,
        "&mcomma;"
    ],
    [
        0,
        "&minusdu;"
    ],
    [
        2,
        "&loplus;"
    ],
    [
        0,
        "&roplus;"
    ],
    [
        0,
        "&Cross;"
    ],
    [
        0,
        "&timesd;"
    ],
    [
        0,
        "&timesbar;"
    ],
    [
        1,
        "&smashp;"
    ],
    [
        0,
        "&lotimes;"
    ],
    [
        0,
        "&rotimes;"
    ],
    [
        0,
        "&otimesas;"
    ],
    [
        0,
        "&Otimes;"
    ],
    [
        0,
        "&odiv;"
    ],
    [
        0,
        "&triplus;"
    ],
    [
        0,
        "&triminus;"
    ],
    [
        0,
        "&tritime;"
    ],
    [
        0,
        "&intprod;"
    ],
    [
        2,
        "&amalg;"
    ],
    [
        0,
        "&capdot;"
    ],
    [
        1,
        "&ncup;"
    ],
    [
        0,
        "&ncap;"
    ],
    [
        0,
        "&capand;"
    ],
    [
        0,
        "&cupor;"
    ],
    [
        0,
        "&cupcap;"
    ],
    [
        0,
        "&capcup;"
    ],
    [
        0,
        "&cupbrcap;"
    ],
    [
        0,
        "&capbrcup;"
    ],
    [
        0,
        "&cupcup;"
    ],
    [
        0,
        "&capcap;"
    ],
    [
        0,
        "&ccups;"
    ],
    [
        0,
        "&ccaps;"
    ],
    [
        2,
        "&ccupssm;"
    ],
    [
        2,
        "&And;"
    ],
    [
        0,
        "&Or;"
    ],
    [
        0,
        "&andand;"
    ],
    [
        0,
        "&oror;"
    ],
    [
        0,
        "&orslope;"
    ],
    [
        0,
        "&andslope;"
    ],
    [
        1,
        "&andv;"
    ],
    [
        0,
        "&orv;"
    ],
    [
        0,
        "&andd;"
    ],
    [
        0,
        "&ord;"
    ],
    [
        1,
        "&wedbar;"
    ],
    [
        6,
        "&sdote;"
    ],
    [
        3,
        "&simdot;"
    ],
    [
        2,
        {
            v: "&congdot;",
            n: 824,
            o: "&ncongdot;"
        }
    ],
    [
        0,
        "&easter;"
    ],
    [
        0,
        "&apacir;"
    ],
    [
        0,
        {
            v: "&apE;",
            n: 824,
            o: "&napE;"
        }
    ],
    [
        0,
        "&eplus;"
    ],
    [
        0,
        "&pluse;"
    ],
    [
        0,
        "&Esim;"
    ],
    [
        0,
        "&Colone;"
    ],
    [
        0,
        "&Equal;"
    ],
    [
        1,
        "&ddotseq;"
    ],
    [
        0,
        "&equivDD;"
    ],
    [
        0,
        "&ltcir;"
    ],
    [
        0,
        "&gtcir;"
    ],
    [
        0,
        "&ltquest;"
    ],
    [
        0,
        "&gtquest;"
    ],
    [
        0,
        {
            v: "&leqslant;",
            n: 824,
            o: "&nleqslant;"
        }
    ],
    [
        0,
        {
            v: "&geqslant;",
            n: 824,
            o: "&ngeqslant;"
        }
    ],
    [
        0,
        "&lesdot;"
    ],
    [
        0,
        "&gesdot;"
    ],
    [
        0,
        "&lesdoto;"
    ],
    [
        0,
        "&gesdoto;"
    ],
    [
        0,
        "&lesdotor;"
    ],
    [
        0,
        "&gesdotol;"
    ],
    [
        0,
        "&lap;"
    ],
    [
        0,
        "&gap;"
    ],
    [
        0,
        "&lne;"
    ],
    [
        0,
        "&gne;"
    ],
    [
        0,
        "&lnap;"
    ],
    [
        0,
        "&gnap;"
    ],
    [
        0,
        "&lEg;"
    ],
    [
        0,
        "&gEl;"
    ],
    [
        0,
        "&lsime;"
    ],
    [
        0,
        "&gsime;"
    ],
    [
        0,
        "&lsimg;"
    ],
    [
        0,
        "&gsiml;"
    ],
    [
        0,
        "&lgE;"
    ],
    [
        0,
        "&glE;"
    ],
    [
        0,
        "&lesges;"
    ],
    [
        0,
        "&gesles;"
    ],
    [
        0,
        "&els;"
    ],
    [
        0,
        "&egs;"
    ],
    [
        0,
        "&elsdot;"
    ],
    [
        0,
        "&egsdot;"
    ],
    [
        0,
        "&el;"
    ],
    [
        0,
        "&eg;"
    ],
    [
        2,
        "&siml;"
    ],
    [
        0,
        "&simg;"
    ],
    [
        0,
        "&simlE;"
    ],
    [
        0,
        "&simgE;"
    ],
    [
        0,
        {
            v: "&LessLess;",
            n: 824,
            o: "&NotNestedLessLess;"
        }
    ],
    [
        0,
        {
            v: "&GreaterGreater;",
            n: 824,
            o: "&NotNestedGreaterGreater;"
        }
    ],
    [
        1,
        "&glj;"
    ],
    [
        0,
        "&gla;"
    ],
    [
        0,
        "&ltcc;"
    ],
    [
        0,
        "&gtcc;"
    ],
    [
        0,
        "&lescc;"
    ],
    [
        0,
        "&gescc;"
    ],
    [
        0,
        "&smt;"
    ],
    [
        0,
        "&lat;"
    ],
    [
        0,
        {
            v: "&smte;",
            n: 65024,
            o: "&smtes;"
        }
    ],
    [
        0,
        {
            v: "&late;",
            n: 65024,
            o: "&lates;"
        }
    ],
    [
        0,
        "&bumpE;"
    ],
    [
        0,
        {
            v: "&PrecedesEqual;",
            n: 824,
            o: "&NotPrecedesEqual;"
        }
    ],
    [
        0,
        {
            v: "&sce;",
            n: 824,
            o: "&NotSucceedsEqual;"
        }
    ],
    [
        2,
        "&prE;"
    ],
    [
        0,
        "&scE;"
    ],
    [
        0,
        "&precneqq;"
    ],
    [
        0,
        "&scnE;"
    ],
    [
        0,
        "&prap;"
    ],
    [
        0,
        "&scap;"
    ],
    [
        0,
        "&precnapprox;"
    ],
    [
        0,
        "&scnap;"
    ],
    [
        0,
        "&Pr;"
    ],
    [
        0,
        "&Sc;"
    ],
    [
        0,
        "&subdot;"
    ],
    [
        0,
        "&supdot;"
    ],
    [
        0,
        "&subplus;"
    ],
    [
        0,
        "&supplus;"
    ],
    [
        0,
        "&submult;"
    ],
    [
        0,
        "&supmult;"
    ],
    [
        0,
        "&subedot;"
    ],
    [
        0,
        "&supedot;"
    ],
    [
        0,
        {
            v: "&subE;",
            n: 824,
            o: "&nsubE;"
        }
    ],
    [
        0,
        {
            v: "&supE;",
            n: 824,
            o: "&nsupE;"
        }
    ],
    [
        0,
        "&subsim;"
    ],
    [
        0,
        "&supsim;"
    ],
    [
        2,
        {
            v: "&subnE;",
            n: 65024,
            o: "&varsubsetneqq;"
        }
    ],
    [
        0,
        {
            v: "&supnE;",
            n: 65024,
            o: "&varsupsetneqq;"
        }
    ],
    [
        2,
        "&csub;"
    ],
    [
        0,
        "&csup;"
    ],
    [
        0,
        "&csube;"
    ],
    [
        0,
        "&csupe;"
    ],
    [
        0,
        "&subsup;"
    ],
    [
        0,
        "&supsub;"
    ],
    [
        0,
        "&subsub;"
    ],
    [
        0,
        "&supsup;"
    ],
    [
        0,
        "&suphsub;"
    ],
    [
        0,
        "&supdsub;"
    ],
    [
        0,
        "&forkv;"
    ],
    [
        0,
        "&topfork;"
    ],
    [
        0,
        "&mlcp;"
    ],
    [
        8,
        "&Dashv;"
    ],
    [
        1,
        "&Vdashl;"
    ],
    [
        0,
        "&Barv;"
    ],
    [
        0,
        "&vBar;"
    ],
    [
        0,
        "&vBarv;"
    ],
    [
        1,
        "&Vbar;"
    ],
    [
        0,
        "&Not;"
    ],
    [
        0,
        "&bNot;"
    ],
    [
        0,
        "&rnmid;"
    ],
    [
        0,
        "&cirmid;"
    ],
    [
        0,
        "&midcir;"
    ],
    [
        0,
        "&topcir;"
    ],
    [
        0,
        "&nhpar;"
    ],
    [
        0,
        "&parsim;"
    ],
    [
        9,
        {
            v: "&parsl;",
            n: 8421,
            o: "&nparsl;"
        }
    ],
    [
        44343,
        {
            n: new Map(v3([
                [
                    56476,
                    "&Ascr;"
                ],
                [
                    1,
                    "&Cscr;"
                ],
                [
                    0,
                    "&Dscr;"
                ],
                [
                    2,
                    "&Gscr;"
                ],
                [
                    2,
                    "&Jscr;"
                ],
                [
                    0,
                    "&Kscr;"
                ],
                [
                    2,
                    "&Nscr;"
                ],
                [
                    0,
                    "&Oscr;"
                ],
                [
                    0,
                    "&Pscr;"
                ],
                [
                    0,
                    "&Qscr;"
                ],
                [
                    1,
                    "&Sscr;"
                ],
                [
                    0,
                    "&Tscr;"
                ],
                [
                    0,
                    "&Uscr;"
                ],
                [
                    0,
                    "&Vscr;"
                ],
                [
                    0,
                    "&Wscr;"
                ],
                [
                    0,
                    "&Xscr;"
                ],
                [
                    0,
                    "&Yscr;"
                ],
                [
                    0,
                    "&Zscr;"
                ],
                [
                    0,
                    "&ascr;"
                ],
                [
                    0,
                    "&bscr;"
                ],
                [
                    0,
                    "&cscr;"
                ],
                [
                    0,
                    "&dscr;"
                ],
                [
                    1,
                    "&fscr;"
                ],
                [
                    1,
                    "&hscr;"
                ],
                [
                    0,
                    "&iscr;"
                ],
                [
                    0,
                    "&jscr;"
                ],
                [
                    0,
                    "&kscr;"
                ],
                [
                    0,
                    "&lscr;"
                ],
                [
                    0,
                    "&mscr;"
                ],
                [
                    0,
                    "&nscr;"
                ],
                [
                    1,
                    "&pscr;"
                ],
                [
                    0,
                    "&qscr;"
                ],
                [
                    0,
                    "&rscr;"
                ],
                [
                    0,
                    "&sscr;"
                ],
                [
                    0,
                    "&tscr;"
                ],
                [
                    0,
                    "&uscr;"
                ],
                [
                    0,
                    "&vscr;"
                ],
                [
                    0,
                    "&wscr;"
                ],
                [
                    0,
                    "&xscr;"
                ],
                [
                    0,
                    "&yscr;"
                ],
                [
                    0,
                    "&zscr;"
                ],
                [
                    52,
                    "&Afr;"
                ],
                [
                    0,
                    "&Bfr;"
                ],
                [
                    1,
                    "&Dfr;"
                ],
                [
                    0,
                    "&Efr;"
                ],
                [
                    0,
                    "&Ffr;"
                ],
                [
                    0,
                    "&Gfr;"
                ],
                [
                    2,
                    "&Jfr;"
                ],
                [
                    0,
                    "&Kfr;"
                ],
                [
                    0,
                    "&Lfr;"
                ],
                [
                    0,
                    "&Mfr;"
                ],
                [
                    0,
                    "&Nfr;"
                ],
                [
                    0,
                    "&Ofr;"
                ],
                [
                    0,
                    "&Pfr;"
                ],
                [
                    0,
                    "&Qfr;"
                ],
                [
                    1,
                    "&Sfr;"
                ],
                [
                    0,
                    "&Tfr;"
                ],
                [
                    0,
                    "&Ufr;"
                ],
                [
                    0,
                    "&Vfr;"
                ],
                [
                    0,
                    "&Wfr;"
                ],
                [
                    0,
                    "&Xfr;"
                ],
                [
                    0,
                    "&Yfr;"
                ],
                [
                    1,
                    "&afr;"
                ],
                [
                    0,
                    "&bfr;"
                ],
                [
                    0,
                    "&cfr;"
                ],
                [
                    0,
                    "&dfr;"
                ],
                [
                    0,
                    "&efr;"
                ],
                [
                    0,
                    "&ffr;"
                ],
                [
                    0,
                    "&gfr;"
                ],
                [
                    0,
                    "&hfr;"
                ],
                [
                    0,
                    "&ifr;"
                ],
                [
                    0,
                    "&jfr;"
                ],
                [
                    0,
                    "&kfr;"
                ],
                [
                    0,
                    "&lfr;"
                ],
                [
                    0,
                    "&mfr;"
                ],
                [
                    0,
                    "&nfr;"
                ],
                [
                    0,
                    "&ofr;"
                ],
                [
                    0,
                    "&pfr;"
                ],
                [
                    0,
                    "&qfr;"
                ],
                [
                    0,
                    "&rfr;"
                ],
                [
                    0,
                    "&sfr;"
                ],
                [
                    0,
                    "&tfr;"
                ],
                [
                    0,
                    "&ufr;"
                ],
                [
                    0,
                    "&vfr;"
                ],
                [
                    0,
                    "&wfr;"
                ],
                [
                    0,
                    "&xfr;"
                ],
                [
                    0,
                    "&yfr;"
                ],
                [
                    0,
                    "&zfr;"
                ],
                [
                    0,
                    "&Aopf;"
                ],
                [
                    0,
                    "&Bopf;"
                ],
                [
                    1,
                    "&Dopf;"
                ],
                [
                    0,
                    "&Eopf;"
                ],
                [
                    0,
                    "&Fopf;"
                ],
                [
                    0,
                    "&Gopf;"
                ],
                [
                    1,
                    "&Iopf;"
                ],
                [
                    0,
                    "&Jopf;"
                ],
                [
                    0,
                    "&Kopf;"
                ],
                [
                    0,
                    "&Lopf;"
                ],
                [
                    0,
                    "&Mopf;"
                ],
                [
                    1,
                    "&Oopf;"
                ],
                [
                    3,
                    "&Sopf;"
                ],
                [
                    0,
                    "&Topf;"
                ],
                [
                    0,
                    "&Uopf;"
                ],
                [
                    0,
                    "&Vopf;"
                ],
                [
                    0,
                    "&Wopf;"
                ],
                [
                    0,
                    "&Xopf;"
                ],
                [
                    0,
                    "&Yopf;"
                ],
                [
                    1,
                    "&aopf;"
                ],
                [
                    0,
                    "&bopf;"
                ],
                [
                    0,
                    "&copf;"
                ],
                [
                    0,
                    "&dopf;"
                ],
                [
                    0,
                    "&eopf;"
                ],
                [
                    0,
                    "&fopf;"
                ],
                [
                    0,
                    "&gopf;"
                ],
                [
                    0,
                    "&hopf;"
                ],
                [
                    0,
                    "&iopf;"
                ],
                [
                    0,
                    "&jopf;"
                ],
                [
                    0,
                    "&kopf;"
                ],
                [
                    0,
                    "&lopf;"
                ],
                [
                    0,
                    "&mopf;"
                ],
                [
                    0,
                    "&nopf;"
                ],
                [
                    0,
                    "&oopf;"
                ],
                [
                    0,
                    "&popf;"
                ],
                [
                    0,
                    "&qopf;"
                ],
                [
                    0,
                    "&ropf;"
                ],
                [
                    0,
                    "&sopf;"
                ],
                [
                    0,
                    "&topf;"
                ],
                [
                    0,
                    "&uopf;"
                ],
                [
                    0,
                    "&vopf;"
                ],
                [
                    0,
                    "&wopf;"
                ],
                [
                    0,
                    "&xopf;"
                ],
                [
                    0,
                    "&yopf;"
                ],
                [
                    0,
                    "&zopf;"
                ]
            ]))
        }
    ],
    [
        8906,
        "&fflig;"
    ],
    [
        0,
        "&filig;"
    ],
    [
        0,
        "&fllig;"
    ],
    [
        0,
        "&ffilig;"
    ],
    [
        0,
        "&ffllig;"
    ]
]));
var w = /["&'<>$\x80-\uFFFF]/g, C1 = new Map([
    [
        34,
        "&quot;"
    ],
    [
        38,
        "&amp;"
    ],
    [
        39,
        "&apos;"
    ],
    [
        60,
        "&lt;"
    ],
    [
        62,
        "&gt;"
    ]
]), D2 = String.prototype.codePointAt != null ? (u35, e58)=>u35.codePointAt(e58) : (u36, e59)=>(u36.charCodeAt(e59) & 64512) === 55296 ? (u36.charCodeAt(e59) - 55296) * 1024 + u36.charCodeAt(e59 + 1) - 56320 + 65536 : u36.charCodeAt(e59);
function E2(u37) {
    let e60 = "", a34 = 0, c33;
    for(; (c33 = w.exec(u37)) !== null;){
        let r17 = c33.index, d19 = u37.charCodeAt(r17), t42 = C1.get(d19);
        t42 !== void 0 ? (e60 += u37.substring(a34, r17) + t42, a34 = r17 + 1) : (e60 += `${u37.substring(a34, r17)}&#x${D2(u37, r17).toString(16)};`, a34 = w.lastIndex += +((d19 & 64512) === 55296));
    }
    return e60 + u37.substr(a34);
}
function S1(u38, e61) {
    return function(c34) {
        let r18, d20 = 0, t43 = "";
        for(; r18 = u38.exec(c34);)d20 !== r18.index && (t43 += c34.substring(d20, r18.index)), t43 += e61.get(r18[0].charCodeAt(0)), d20 = r18.index + 1;
        return t43 + c34.substring(d20);
    };
}
var R2 = S1(/[&<>'"]/g, C1), H1 = S1(/["&\u00A0]/g, new Map([
    [
        34,
        "&quot;"
    ],
    [
        38,
        "&amp;"
    ],
    [
        160,
        "&nbsp;"
    ]
])), U1 = S1(/[&<>\u00A0]/g, new Map([
    [
        38,
        "&amp;"
    ],
    [
        60,
        "&lt;"
    ],
    [
        62,
        "&gt;"
    ],
    [
        160,
        "&nbsp;"
    ]
]));
var p3;
(function(u39) {
    u39[u39.XML = 0] = "XML", u39[u39.HTML = 1] = "HTML";
})(p3 || (p3 = {}));
var x4;
(function(u40) {
    u40[u40.UTF8 = 0] = "UTF8", u40[u40.ASCII = 1] = "ASCII", u40[u40.Extensive = 2] = "Extensive", u40[u40.Attribute = 3] = "Attribute", u40[u40.Text = 4] = "Text";
})(x4 || (x4 = {}));
var c2 = new Map([
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "clipPath",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "foreignObject",
    "glyphRef",
    "linearGradient",
    "radialGradient",
    "textPath"
].map((e62)=>[
        e62.toLowerCase(),
        e62
    ])), m3 = new Map([
    "definitionURL",
    "attributeName",
    "attributeType",
    "baseFrequency",
    "baseProfile",
    "calcMode",
    "clipPathUnits",
    "diffuseConstant",
    "edgeMode",
    "filterUnits",
    "glyphRef",
    "gradientTransform",
    "gradientUnits",
    "kernelMatrix",
    "kernelUnitLength",
    "keyPoints",
    "keySplines",
    "keyTimes",
    "lengthAdjust",
    "limitingConeAngle",
    "markerHeight",
    "markerUnits",
    "markerWidth",
    "maskContentUnits",
    "maskUnits",
    "numOctaves",
    "pathLength",
    "patternContentUnits",
    "patternTransform",
    "patternUnits",
    "pointsAtX",
    "pointsAtY",
    "pointsAtZ",
    "preserveAlpha",
    "preserveAspectRatio",
    "primitiveUnits",
    "refX",
    "refY",
    "repeatCount",
    "repeatDur",
    "requiredExtensions",
    "requiredFeatures",
    "specularConstant",
    "specularExponent",
    "spreadMethod",
    "startOffset",
    "stdDeviation",
    "stitchTiles",
    "surfaceScale",
    "systemLanguage",
    "tableValues",
    "targetX",
    "targetY",
    "textLength",
    "viewBox",
    "viewTarget",
    "xChannelSelector",
    "yChannelSelector",
    "zoomAndPan"
].map((e63)=>[
        e63.toLowerCase(),
        e63
    ]));
var h2 = new Set([
    "style",
    "script",
    "xmp",
    "iframe",
    "noembed",
    "noframes",
    "plaintext",
    "noscript"
]);
function x5(e64) {
    return e64.replace(/"/g, "&quot;");
}
function T4(e65, t44) {
    var a35;
    if (!e65) return;
    let r19 = ((a35 = t44.encodeEntities) !== null && a35 !== void 0 ? a35 : t44.decodeEntities) === !1 ? x5 : t44.xmlMode || t44.encodeEntities !== "utf8" ? E2 : H1;
    return Object.keys(e65).map((i55)=>{
        var o9, s20;
        let f5 = (o9 = e65[i55]) !== null && o9 !== void 0 ? o9 : "";
        return t44.xmlMode === "foreign" && (i55 = (s20 = m3.get(i55)) !== null && s20 !== void 0 ? s20 : i55), !t44.emptyAttrs && !t44.xmlMode && f5 === "" ? i55 : `${i55}="${r19(f5)}"`;
    }).join(" ");
}
var d2 = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
]);
function l1(e66, t45 = {}) {
    let a36 = "length" in e66 ? e66 : [
        e66
    ], r20 = "";
    for(let i56 = 0; i56 < a36.length; i56++)r20 += M(a36[i56], t45);
    return r20;
}
var U2 = l1;
function M(e67, t46) {
    switch(e67.type){
        case r133:
            return l1(e67.children, t46);
        case D1:
        case p1:
            return v4(e67);
        case e:
            return w1(e67);
        case a:
            return A4(e67);
        case x2:
        case s2:
        case n1:
            return b3(e67, t46);
        case i1:
            return E3(e67, t46);
    }
}
var y2 = new Set([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext",
    "annotation-xml",
    "foreignObject",
    "desc",
    "title"
]), C2 = new Set([
    "svg",
    "math"
]);
function b3(e68, t47) {
    var a37;
    t47.xmlMode === "foreign" && (e68.name = (a37 = c2.get(e68.name)) !== null && a37 !== void 0 ? a37 : e68.name, e68.parent && y2.has(e68.parent.name) && (t47 = {
        ...t47,
        xmlMode: !1
    })), !t47.xmlMode && C2.has(e68.name) && (t47 = {
        ...t47,
        xmlMode: "foreign"
    });
    let r21 = `<${e68.name}`, i57 = T4(e68.attribs, t47);
    return i57 && (r21 += ` ${i57}`), e68.children.length === 0 && (t47.xmlMode ? t47.selfClosingTags !== !1 : t47.selfClosingTags && d2.has(e68.name)) ? (t47.xmlMode || (r21 += " "), r21 += "/>") : (r21 += ">", e68.children.length > 0 && (r21 += l1(e68.children, t47)), (t47.xmlMode || !d2.has(e68.name)) && (r21 += `</${e68.name}>`)), r21;
}
function v4(e69) {
    return `<${e69.data}>`;
}
function E3(e70, t48) {
    var a38;
    let r22 = e70.data || "";
    return ((a38 = t48.encodeEntities) !== null && a38 !== void 0 ? a38 : t48.decodeEntities) !== !1 && !(!t48.xmlMode && e70.parent && h2.has(e70.parent.name)) && (r22 = t48.xmlMode || t48.encodeEntities !== "utf8" ? E2(r22) : U1(r22)), r22;
}
function A4(e71) {
    return `<![CDATA[${e71.children[0].data}]]>`;
}
function w1(e72) {
    return `<!--${e72.data}-->`;
}
function Y1(t49, n24) {
    return U2(t49, n24);
}
function et(t50, n25) {
    return A2(t50) ? t50.children.map((r23)=>Y1(r23, n25)).join("") : "";
}
function O(t51) {
    return Array.isArray(t51) ? t51.map(O).join("") : I1(t51) ? t51.name === "br" ? `
` : O(t51.children) : v2(t51) ? O(t51.children) : T2(t51) ? t51.data : "";
}
function g2(t52) {
    return Array.isArray(t52) ? t52.map(g2).join("") : A2(t52) && !C(t52) ? g2(t52.children) : T2(t52) ? t52.data : "";
}
function A5(t53) {
    return Array.isArray(t53) ? t53.map(A5).join("") : A2(t53) && (t53.type === t.Tag || v2(t53)) ? A5(t53.children) : T2(t53) ? t53.data : "";
}
function P(t54) {
    return A2(t54) ? t54.children : [];
}
function H2(t55) {
    return t55.parent || null;
}
function ft(t56) {
    let n26 = H2(t56);
    if (n26 != null) return P(n26);
    let r24 = [
        t56
    ], { prev: e73 , next: i58  } = t56;
    for(; e73 != null;)r24.unshift(e73), { prev: e73  } = e73;
    for(; i58 != null;)r24.push(i58), { next: i58  } = i58;
    return r24;
}
function ot(t57, n27) {
    var r25;
    return (r25 = t57.attribs) === null || r25 === void 0 ? void 0 : r25[n27];
}
function st(t58, n28) {
    return t58.attribs != null && Object.prototype.hasOwnProperty.call(t58.attribs, n28) && t58.attribs[n28] != null;
}
function ct(t59) {
    return t59.name;
}
function lt(t60) {
    let { next: n29  } = t60;
    for(; n29 !== null && !I1(n29);)({ next: n29  } = n29);
    return n29;
}
function at(t61) {
    let { prev: n30  } = t61;
    for(; n30 !== null && !I1(n30);)({ prev: n30  } = n30);
    return n30;
}
function m4(t62) {
    if (t62.prev && (t62.prev.next = t62.next), t62.next && (t62.next.prev = t62.prev), t62.parent) {
        let n31 = t62.parent.children, r26 = n31.lastIndexOf(t62);
        r26 >= 0 && n31.splice(r26, 1);
    }
    t62.next = null, t62.prev = null, t62.parent = null;
}
function ht(t63, n32) {
    let r27 = n32.prev = t63.prev;
    r27 && (r27.next = n32);
    let e74 = n32.next = t63.next;
    e74 && (e74.prev = n32);
    let i59 = n32.parent = t63.parent;
    if (i59) {
        let u41 = i59.children;
        u41[u41.lastIndexOf(t63)] = n32, t63.parent = null;
    }
}
function dt(t64, n33) {
    if (m4(n33), n33.next = null, n33.parent = t64, t64.children.push(n33) > 1) {
        let r28 = t64.children[t64.children.length - 2];
        r28.next = n33, n33.prev = r28;
    } else n33.prev = null;
}
function xt(t65, n34) {
    m4(n34);
    let { parent: r29  } = t65, e75 = t65.next;
    if (n34.next = e75, n34.prev = t65, t65.next = n34, n34.parent = r29, e75) {
        if (e75.prev = n34, r29) {
            let i60 = r29.children;
            i60.splice(i60.lastIndexOf(e75), 0, n34);
        }
    } else r29 && r29.children.push(n34);
}
function gt(t66, n35) {
    if (m4(n35), n35.parent = t66, n35.prev = null, t66.children.unshift(n35) !== 1) {
        let r30 = t66.children[1];
        r30.prev = n35, n35.next = r30;
    } else n35.next = null;
}
function mt(t67, n36) {
    m4(n36);
    let { parent: r31  } = t67;
    if (r31) {
        let e76 = r31.children;
        e76.splice(e76.indexOf(t67), 0, n36);
    }
    t67.prev && (t67.prev.next = n36), n36.parent = r31, n36.prev = t67.prev, n36.next = t67, t67.prev = n36;
}
function b4(t68, n37, r32 = !0, e77 = 1 / 0) {
    return V1(t68, Array.isArray(n37) ? n37 : [
        n37
    ], r32, e77);
}
function V1(t69, n38, r33, e78) {
    let i61 = [], u42 = [
        n38
    ], o10 = [
        0
    ];
    for(;;){
        if (o10[0] >= u42[0].length) {
            if (o10.length === 1) return i61;
            u42.shift(), o10.shift();
            continue;
        }
        let f6 = u42[0][o10[0]++];
        if (t69(f6) && (i61.push(f6), --e78 <= 0)) return i61;
        r33 && A2(f6) && f6.children.length > 0 && (o10.unshift(0), u42.unshift(f6.children));
    }
}
function Et(t70, n39) {
    return n39.find(t70);
}
function T5(t71, n40, r34 = !0) {
    let e79 = null;
    for(let i62 = 0; i62 < n40.length && !e79; i62++){
        let u43 = n40[i62];
        if (I1(u43)) t71(u43) ? e79 = u43 : r34 && u43.children.length > 0 && (e79 = T5(t71, u43.children, !0));
        else continue;
    }
    return e79;
}
function q2(t72, n41) {
    return n41.some((r35)=>I1(r35) && (t72(r35) || q2(t72, r35.children)));
}
function Ot(t73, n42) {
    let r36 = [], e80 = [
        n42
    ], i63 = [
        0
    ];
    for(;;){
        if (i63[0] >= e80[0].length) {
            if (e80.length === 1) return r36;
            e80.shift(), i63.shift();
            continue;
        }
        let u44 = e80[0][i63[0]++];
        I1(u44) && (t73(u44) && r36.push(u44), u44.children.length > 0 && (i63.unshift(0), e80.unshift(u44.children)));
    }
}
var y3 = {
    tag_name (t74) {
        return typeof t74 == "function" ? (n43)=>I1(n43) && t74(n43.name) : t74 === "*" ? I1 : (n44)=>I1(n44) && n44.name === t74;
    },
    tag_type (t75) {
        return typeof t75 == "function" ? (n45)=>t75(n45.type) : (n46)=>n46.type === t75;
    },
    tag_contains (t76) {
        return typeof t76 == "function" ? (n47)=>T2(n47) && t76(n47.data) : (n48)=>T2(n48) && n48.data === t76;
    }
};
function L3(t77, n49) {
    return typeof n49 == "function" ? (r37)=>I1(r37) && n49(r37.attribs[t77]) : (r38)=>I1(r38) && r38.attribs[t77] === n49;
}
function z2(t78, n50) {
    return (r39)=>t78(r39) || n50(r39);
}
function k2(t79) {
    let n51 = Object.keys(t79).map((r40)=>{
        let e81 = t79[r40];
        return Object.prototype.hasOwnProperty.call(y3, r40) ? y3[r40](e81) : L3(r40, e81);
    });
    return n51.length === 0 ? null : n51.reduce(z2);
}
function Tt(t80, n52) {
    let r41 = k2(t80);
    return r41 ? r41(n52) : !0;
}
function vt(t81, n53, r42, e82 = 1 / 0) {
    let i64 = k2(t81);
    return i64 ? b4(i64, n53, r42, e82) : [];
}
function Dt(t82, n54, r43 = !0) {
    return Array.isArray(n54) || (n54 = [
        n54
    ]), T5(L3("id", t82), n54, r43);
}
function h3(t83, n55, r44 = !0, e83 = 1 / 0) {
    return b4(y3.tag_name(t83), n55, r44, e83);
}
function At(t84, n56, r45 = !0, e84 = 1 / 0) {
    return b4(y3.tag_type(t84), n56, r45, e84);
}
function wt(t85) {
    let n57 = t85.length;
    for(; --n57 >= 0;){
        let r46 = t85[n57];
        if (n57 > 0 && t85.lastIndexOf(r46, n57 - 1) >= 0) {
            t85.splice(n57, 1);
            continue;
        }
        for(let e85 = r46.parent; e85; e85 = e85.parent)if (t85.includes(e85)) {
            t85.splice(n57, 1);
            break;
        }
    }
    return t85;
}
var a2;
(function(t86) {
    t86[t86.DISCONNECTED = 1] = "DISCONNECTED", t86[t86.PRECEDING = 2] = "PRECEDING", t86[t86.FOLLOWING = 4] = "FOLLOWING", t86[t86.CONTAINS = 8] = "CONTAINS", t86[t86.CONTAINED_BY = 16] = "CONTAINED_BY";
})(a2 || (a2 = {}));
function J2(t87, n58) {
    let r47 = [], e86 = [];
    if (t87 === n58) return 0;
    let i65 = A2(t87) ? t87 : t87.parent;
    for(; i65;)r47.unshift(i65), i65 = i65.parent;
    for(i65 = A2(n58) ? n58 : n58.parent; i65;)e86.unshift(i65), i65 = i65.parent;
    let u45 = Math.min(r47.length, e86.length), o11 = 0;
    for(; o11 < u45 && r47[o11] === e86[o11];)o11++;
    if (o11 === 0) return a2.DISCONNECTED;
    let f7 = r47[o11 - 1], s21 = f7.children, l11 = r47[o11], x8 = e86[o11];
    return s21.indexOf(l11) > s21.indexOf(x8) ? f7 === n58 ? a2.FOLLOWING | a2.CONTAINED_BY : a2.FOLLOWING : f7 === t87 ? a2.PRECEDING | a2.CONTAINS : a2.PRECEDING;
}
function Lt(t88) {
    return t88 = t88.filter((n59, r48, e87)=>!e87.includes(n59, r48 + 1)), t88.sort((n60, r49)=>{
        let e88 = J2(n60, r49);
        return e88 & a2.PRECEDING ? -1 : e88 & a2.FOLLOWING ? 1 : 0;
    }), t88;
}
function jt(t89) {
    let n61 = E4($, t89);
    return n61 ? n61.name === "feed" ? Q1(n61) : U3(n61) : null;
}
function Q1(t90) {
    var n62;
    let r50 = t90.children, e89 = {
        type: "atom",
        items: h3("entry", r50).map((o12)=>{
            var f8;
            let { children: s22  } = o12, l12 = {
                media: G1(s22)
            };
            c3(l12, "id", "id", s22), c3(l12, "title", "title", s22);
            let x9 = (f8 = E4("link", s22)) === null || f8 === void 0 ? void 0 : f8.attribs.href;
            x9 && (l12.link = x9);
            let v11 = p4("summary", s22) || p4("content", s22);
            v11 && (l12.description = v11);
            let D7 = p4("updated", s22);
            return D7 && (l12.pubDate = new Date(D7)), l12;
        })
    };
    c3(e89, "id", "id", r50), c3(e89, "title", "title", r50);
    let i66 = (n62 = E4("link", r50)) === null || n62 === void 0 ? void 0 : n62.attribs.href;
    i66 && (e89.link = i66), c3(e89, "description", "subtitle", r50);
    let u46 = p4("updated", r50);
    return u46 && (e89.updated = new Date(u46)), c3(e89, "author", "email", r50, !0), e89;
}
function U3(t91) {
    var n63, r51;
    let e90 = (r51 = (n63 = E4("channel", t91.children)) === null || n63 === void 0 ? void 0 : n63.children) !== null && r51 !== void 0 ? r51 : [], i67 = {
        type: t91.name.substr(0, 3),
        id: "",
        items: h3("item", t91.children).map((o13)=>{
            let { children: f9  } = o13, s23 = {
                media: G1(f9)
            };
            c3(s23, "id", "guid", f9), c3(s23, "title", "title", f9), c3(s23, "link", "link", f9), c3(s23, "description", "description", f9);
            let l13 = p4("pubDate", f9) || p4("dc:date", f9);
            return l13 && (s23.pubDate = new Date(l13)), s23;
        })
    };
    c3(i67, "title", "title", e90), c3(i67, "link", "link", e90), c3(i67, "description", "description", e90);
    let u47 = p4("lastBuildDate", e90);
    return u47 && (i67.updated = new Date(u47)), c3(i67, "author", "managingEditor", e90, !0), i67;
}
var X1 = [
    "url",
    "type",
    "lang"
], Z1 = [
    "fileSize",
    "bitrate",
    "framerate",
    "samplingrate",
    "channels",
    "duration",
    "height",
    "width"
];
function G1(t92) {
    return h3("media:content", t92).map((n64)=>{
        let { attribs: r52  } = n64, e91 = {
            medium: r52.medium,
            isDefault: !!r52.isDefault
        };
        for (let i68 of X1)r52[i68] && (e91[i68] = r52[i68]);
        for (let i110 of Z1)r52[i110] && (e91[i110] = parseInt(r52[i110], 10));
        return r52.expression && (e91.expression = r52.expression), e91;
    });
}
function E4(t93, n65) {
    return h3(t93, n65, !0, 1)[0];
}
function p4(t94, n66, r53 = !1) {
    return g2(h3(t94, n66, r53, 1)).trim();
}
function c3(t95, n67, r54, e92, i69 = !1) {
    let u48 = p4(r54, e92, i69);
    u48 && (t95[n67] = u48);
}
function $(t96) {
    return t96 === "rss" || t96 === "feed" || t96 === "rdf:RDF";
}
const mod10 = {
    DocumentPosition: a2,
    append: xt,
    appendChild: dt,
    compareDocumentPosition: J2,
    existsOne: q2,
    filter: b4,
    find: V1,
    findAll: Ot,
    findOne: T5,
    findOneChild: Et,
    getAttributeValue: ot,
    getChildren: P,
    getElementById: Dt,
    getElements: vt,
    getElementsByTagName: h3,
    getElementsByTagType: At,
    getFeed: jt,
    getInnerHTML: et,
    getName: ct,
    getOuterHTML: Y1,
    getParent: H2,
    getSiblings: ft,
    getText: O,
    hasAttrib: st,
    hasChildren: A2,
    innerText: A5,
    isCDATA: v2,
    isComment: C,
    isDocument: E1,
    isTag: I1,
    isText: T2,
    nextElementSibling: lt,
    prepend: mt,
    prependChild: gt,
    prevElementSibling: at,
    removeElement: m4,
    removeSubsets: wt,
    replaceElement: ht,
    testElement: Tt,
    textContent: g2,
    uniqueSort: Lt
};
var a3;
(function(e93) {
    e93[e93.Tab = 9] = "Tab", e93[e93.NewLine = 10] = "NewLine", e93[e93.FormFeed = 12] = "FormFeed", e93[e93.CarriageReturn = 13] = "CarriageReturn", e93[e93.Space = 32] = "Space", e93[e93.ExclamationMark = 33] = "ExclamationMark", e93[e93.Number = 35] = "Number", e93[e93.Amp = 38] = "Amp", e93[e93.SingleQuote = 39] = "SingleQuote", e93[e93.DoubleQuote = 34] = "DoubleQuote", e93[e93.Dash = 45] = "Dash", e93[e93.Slash = 47] = "Slash", e93[e93.Zero = 48] = "Zero", e93[e93.Nine = 57] = "Nine", e93[e93.Semi = 59] = "Semi", e93[e93.Lt = 60] = "Lt", e93[e93.Eq = 61] = "Eq", e93[e93.Gt = 62] = "Gt", e93[e93.Questionmark = 63] = "Questionmark", e93[e93.UpperA = 65] = "UpperA", e93[e93.LowerA = 97] = "LowerA", e93[e93.UpperF = 70] = "UpperF", e93[e93.LowerF = 102] = "LowerF", e93[e93.UpperZ = 90] = "UpperZ", e93[e93.LowerZ = 122] = "LowerZ", e93[e93.LowerX = 120] = "LowerX", e93[e93.OpeningSquareBracket = 91] = "OpeningSquareBracket";
})(a3 || (a3 = {}));
var i2;
(function(e94) {
    e94[e94.Text = 1] = "Text", e94[e94.BeforeTagName = 2] = "BeforeTagName", e94[e94.InTagName = 3] = "InTagName", e94[e94.InSelfClosingTag = 4] = "InSelfClosingTag", e94[e94.BeforeClosingTagName = 5] = "BeforeClosingTagName", e94[e94.InClosingTagName = 6] = "InClosingTagName", e94[e94.AfterClosingTagName = 7] = "AfterClosingTagName", e94[e94.BeforeAttributeName = 8] = "BeforeAttributeName", e94[e94.InAttributeName = 9] = "InAttributeName", e94[e94.AfterAttributeName = 10] = "AfterAttributeName", e94[e94.BeforeAttributeValue = 11] = "BeforeAttributeValue", e94[e94.InAttributeValueDq = 12] = "InAttributeValueDq", e94[e94.InAttributeValueSq = 13] = "InAttributeValueSq", e94[e94.InAttributeValueNq = 14] = "InAttributeValueNq", e94[e94.BeforeDeclaration = 15] = "BeforeDeclaration", e94[e94.InDeclaration = 16] = "InDeclaration", e94[e94.InProcessingInstruction = 17] = "InProcessingInstruction", e94[e94.BeforeComment = 18] = "BeforeComment", e94[e94.CDATASequence = 19] = "CDATASequence", e94[e94.InSpecialComment = 20] = "InSpecialComment", e94[e94.InCommentLike = 21] = "InCommentLike", e94[e94.BeforeSpecialS = 22] = "BeforeSpecialS", e94[e94.SpecialStartSequence = 23] = "SpecialStartSequence", e94[e94.InSpecialTag = 24] = "InSpecialTag", e94[e94.BeforeEntity = 25] = "BeforeEntity", e94[e94.BeforeNumericEntity = 26] = "BeforeNumericEntity", e94[e94.InNamedEntity = 27] = "InNamedEntity", e94[e94.InNumericEntity = 28] = "InNumericEntity", e94[e94.InHexEntity = 29] = "InHexEntity";
})(i2 || (i2 = {}));
function m5(e95) {
    return e95 === a3.Space || e95 === a3.NewLine || e95 === a3.Tab || e95 === a3.FormFeed || e95 === a3.CarriageReturn;
}
function T6(e96) {
    return e96 === a3.Slash || e96 === a3.Gt || m5(e96);
}
function w2(e97) {
    return e97 >= a3.Zero && e97 <= a3.Nine;
}
function G2(e98) {
    return e98 >= a3.LowerA && e98 <= a3.LowerZ || e98 >= a3.UpperA && e98 <= a3.UpperZ;
}
function M1(e99) {
    return e99 >= a3.UpperA && e99 <= a3.UpperF || e99 >= a3.LowerA && e99 <= a3.LowerF;
}
var d3;
(function(e100) {
    e100[e100.NoValue = 0] = "NoValue", e100[e100.Unquoted = 1] = "Unquoted", e100[e100.Single = 2] = "Single", e100[e100.Double = 3] = "Double";
})(d3 || (d3 = {}));
var u2 = {
    Cdata: new Uint8Array([
        67,
        68,
        65,
        84,
        65,
        91
    ]),
    CdataEnd: new Uint8Array([
        93,
        93,
        62
    ]),
    CommentEnd: new Uint8Array([
        45,
        45,
        62
    ]),
    ScriptEnd: new Uint8Array([
        60,
        47,
        115,
        99,
        114,
        105,
        112,
        116
    ]),
    StyleEnd: new Uint8Array([
        60,
        47,
        115,
        116,
        121,
        108,
        101
    ]),
    TitleEnd: new Uint8Array([
        60,
        47,
        116,
        105,
        116,
        108,
        101
    ])
}, I3 = class {
    constructor({ xmlMode: t97 = !1 , decodeEntities: s24 = !0  }, n68){
        this.cbs = n68, this.state = i2.Text, this.buffer = "", this.sectionStart = 0, this.index = 0, this.baseState = i2.Text, this.isSpecial = !1, this.running = !0, this.offset = 0, this.currentSequence = void 0, this.sequenceIndex = 0, this.trieIndex = 0, this.trieCurrent = 0, this.entityResult = 0, this.entityExcess = 0, this.xmlMode = t97, this.decodeEntities = s24, this.entityTrie = t97 ? q : y;
    }
    reset() {
        this.state = i2.Text, this.buffer = "", this.sectionStart = 0, this.index = 0, this.baseState = i2.Text, this.currentSequence = void 0, this.running = !0, this.offset = 0;
    }
    write(t98) {
        this.offset += this.buffer.length, this.buffer = t98, this.parse();
    }
    end() {
        this.running && this.finish();
    }
    pause() {
        this.running = !1;
    }
    resume() {
        this.running = !0, this.index < this.buffer.length + this.offset && this.parse();
    }
    getIndex() {
        return this.index;
    }
    getSectionStart() {
        return this.sectionStart;
    }
    stateText(t99) {
        t99 === a3.Lt || !this.decodeEntities && this.fastForwardTo(a3.Lt) ? (this.index > this.sectionStart && this.cbs.ontext(this.sectionStart, this.index), this.state = i2.BeforeTagName, this.sectionStart = this.index) : this.decodeEntities && t99 === a3.Amp && (this.state = i2.BeforeEntity);
    }
    stateSpecialStartSequence(t100) {
        let s25 = this.sequenceIndex === this.currentSequence.length;
        if (!(s25 ? T6(t100) : (t100 | 32) === this.currentSequence[this.sequenceIndex])) this.isSpecial = !1;
        else if (!s25) {
            this.sequenceIndex++;
            return;
        }
        this.sequenceIndex = 0, this.state = i2.InTagName, this.stateInTagName(t100);
    }
    stateInSpecialTag(t101) {
        if (this.sequenceIndex === this.currentSequence.length) {
            if (t101 === a3.Gt || m5(t101)) {
                let s26 = this.index - this.currentSequence.length;
                if (this.sectionStart < s26) {
                    let n69 = this.index;
                    this.index = s26, this.cbs.ontext(this.sectionStart, s26), this.index = n69;
                }
                this.isSpecial = !1, this.sectionStart = s26 + 2, this.stateInClosingTagName(t101);
                return;
            }
            this.sequenceIndex = 0;
        }
        (t101 | 32) === this.currentSequence[this.sequenceIndex] ? this.sequenceIndex += 1 : this.sequenceIndex === 0 ? this.currentSequence === u2.TitleEnd ? this.decodeEntities && t101 === a3.Amp && (this.state = i2.BeforeEntity) : this.fastForwardTo(a3.Lt) && (this.sequenceIndex = 1) : this.sequenceIndex = +(t101 === a3.Lt);
    }
    stateCDATASequence(t102) {
        t102 === u2.Cdata[this.sequenceIndex] ? ++this.sequenceIndex === u2.Cdata.length && (this.state = i2.InCommentLike, this.currentSequence = u2.CdataEnd, this.sequenceIndex = 0, this.sectionStart = this.index + 1) : (this.sequenceIndex = 0, this.state = i2.InDeclaration, this.stateInDeclaration(t102));
    }
    fastForwardTo(t103) {
        for(; ++this.index < this.buffer.length + this.offset;)if (this.buffer.charCodeAt(this.index - this.offset) === t103) return !0;
        return this.index = this.buffer.length + this.offset - 1, !1;
    }
    stateInCommentLike(t104) {
        t104 === this.currentSequence[this.sequenceIndex] ? ++this.sequenceIndex === this.currentSequence.length && (this.currentSequence === u2.CdataEnd ? this.cbs.oncdata(this.sectionStart, this.index, 2) : this.cbs.oncomment(this.sectionStart, this.index, 2), this.sequenceIndex = 0, this.sectionStart = this.index + 1, this.state = i2.Text) : this.sequenceIndex === 0 ? this.fastForwardTo(this.currentSequence[0]) && (this.sequenceIndex = 1) : t104 !== this.currentSequence[this.sequenceIndex - 1] && (this.sequenceIndex = 0);
    }
    isTagStartChar(t105) {
        return this.xmlMode ? !T6(t105) : G2(t105);
    }
    startSpecial(t106, s27) {
        this.isSpecial = !0, this.currentSequence = t106, this.sequenceIndex = s27, this.state = i2.SpecialStartSequence;
    }
    stateBeforeTagName(t107) {
        if (t107 === a3.ExclamationMark) this.state = i2.BeforeDeclaration, this.sectionStart = this.index + 1;
        else if (t107 === a3.Questionmark) this.state = i2.InProcessingInstruction, this.sectionStart = this.index + 1;
        else if (this.isTagStartChar(t107)) {
            let s28 = t107 | 32;
            this.sectionStart = this.index, !this.xmlMode && s28 === u2.TitleEnd[2] ? this.startSpecial(u2.TitleEnd, 3) : this.state = !this.xmlMode && s28 === u2.ScriptEnd[2] ? i2.BeforeSpecialS : i2.InTagName;
        } else t107 === a3.Slash ? this.state = i2.BeforeClosingTagName : (this.state = i2.Text, this.stateText(t107));
    }
    stateInTagName(t108) {
        T6(t108) && (this.cbs.onopentagname(this.sectionStart, this.index), this.sectionStart = -1, this.state = i2.BeforeAttributeName, this.stateBeforeAttributeName(t108));
    }
    stateBeforeClosingTagName(t109) {
        m5(t109) || (t109 === a3.Gt ? this.state = i2.Text : (this.state = this.isTagStartChar(t109) ? i2.InClosingTagName : i2.InSpecialComment, this.sectionStart = this.index));
    }
    stateInClosingTagName(t110) {
        (t110 === a3.Gt || m5(t110)) && (this.cbs.onclosetag(this.sectionStart, this.index), this.sectionStart = -1, this.state = i2.AfterClosingTagName, this.stateAfterClosingTagName(t110));
    }
    stateAfterClosingTagName(t111) {
        (t111 === a3.Gt || this.fastForwardTo(a3.Gt)) && (this.state = i2.Text, this.baseState = i2.Text, this.sectionStart = this.index + 1);
    }
    stateBeforeAttributeName(t112) {
        t112 === a3.Gt ? (this.cbs.onopentagend(this.index), this.isSpecial ? (this.state = i2.InSpecialTag, this.sequenceIndex = 0) : this.state = i2.Text, this.baseState = this.state, this.sectionStart = this.index + 1) : t112 === a3.Slash ? this.state = i2.InSelfClosingTag : m5(t112) || (this.state = i2.InAttributeName, this.sectionStart = this.index);
    }
    stateInSelfClosingTag(t113) {
        t113 === a3.Gt ? (this.cbs.onselfclosingtag(this.index), this.state = i2.Text, this.baseState = i2.Text, this.sectionStart = this.index + 1, this.isSpecial = !1) : m5(t113) || (this.state = i2.BeforeAttributeName, this.stateBeforeAttributeName(t113));
    }
    stateInAttributeName(t114) {
        (t114 === a3.Eq || T6(t114)) && (this.cbs.onattribname(this.sectionStart, this.index), this.sectionStart = -1, this.state = i2.AfterAttributeName, this.stateAfterAttributeName(t114));
    }
    stateAfterAttributeName(t115) {
        t115 === a3.Eq ? this.state = i2.BeforeAttributeValue : t115 === a3.Slash || t115 === a3.Gt ? (this.cbs.onattribend(d3.NoValue, this.index), this.state = i2.BeforeAttributeName, this.stateBeforeAttributeName(t115)) : m5(t115) || (this.cbs.onattribend(d3.NoValue, this.index), this.state = i2.InAttributeName, this.sectionStart = this.index);
    }
    stateBeforeAttributeValue(t116) {
        t116 === a3.DoubleQuote ? (this.state = i2.InAttributeValueDq, this.sectionStart = this.index + 1) : t116 === a3.SingleQuote ? (this.state = i2.InAttributeValueSq, this.sectionStart = this.index + 1) : m5(t116) || (this.sectionStart = this.index, this.state = i2.InAttributeValueNq, this.stateInAttributeValueNoQuotes(t116));
    }
    handleInAttributeValue(t117, s29) {
        t117 === s29 || !this.decodeEntities && this.fastForwardTo(s29) ? (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = -1, this.cbs.onattribend(s29 === a3.DoubleQuote ? d3.Double : d3.Single, this.index), this.state = i2.BeforeAttributeName) : this.decodeEntities && t117 === a3.Amp && (this.baseState = this.state, this.state = i2.BeforeEntity);
    }
    stateInAttributeValueDoubleQuotes(t118) {
        this.handleInAttributeValue(t118, a3.DoubleQuote);
    }
    stateInAttributeValueSingleQuotes(t119) {
        this.handleInAttributeValue(t119, a3.SingleQuote);
    }
    stateInAttributeValueNoQuotes(t120) {
        m5(t120) || t120 === a3.Gt ? (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = -1, this.cbs.onattribend(d3.Unquoted, this.index), this.state = i2.BeforeAttributeName, this.stateBeforeAttributeName(t120)) : this.decodeEntities && t120 === a3.Amp && (this.baseState = this.state, this.state = i2.BeforeEntity);
    }
    stateBeforeDeclaration(t121) {
        t121 === a3.OpeningSquareBracket ? (this.state = i2.CDATASequence, this.sequenceIndex = 0) : this.state = t121 === a3.Dash ? i2.BeforeComment : i2.InDeclaration;
    }
    stateInDeclaration(t122) {
        (t122 === a3.Gt || this.fastForwardTo(a3.Gt)) && (this.cbs.ondeclaration(this.sectionStart, this.index), this.state = i2.Text, this.sectionStart = this.index + 1);
    }
    stateInProcessingInstruction(t123) {
        (t123 === a3.Gt || this.fastForwardTo(a3.Gt)) && (this.cbs.onprocessinginstruction(this.sectionStart, this.index), this.state = i2.Text, this.sectionStart = this.index + 1);
    }
    stateBeforeComment(t124) {
        t124 === a3.Dash ? (this.state = i2.InCommentLike, this.currentSequence = u2.CommentEnd, this.sequenceIndex = 2, this.sectionStart = this.index + 1) : this.state = i2.InDeclaration;
    }
    stateInSpecialComment(t125) {
        (t125 === a3.Gt || this.fastForwardTo(a3.Gt)) && (this.cbs.oncomment(this.sectionStart, this.index, 0), this.state = i2.Text, this.sectionStart = this.index + 1);
    }
    stateBeforeSpecialS(t126) {
        let s30 = t126 | 32;
        s30 === u2.ScriptEnd[3] ? this.startSpecial(u2.ScriptEnd, 4) : s30 === u2.StyleEnd[3] ? this.startSpecial(u2.StyleEnd, 4) : (this.state = i2.InTagName, this.stateInTagName(t126));
    }
    stateBeforeEntity(t127) {
        this.entityExcess = 1, this.entityResult = 0, t127 === a3.Number ? this.state = i2.BeforeNumericEntity : t127 === a3.Amp || (this.trieIndex = 0, this.trieCurrent = this.entityTrie[0], this.state = i2.InNamedEntity, this.stateInNamedEntity(t127));
    }
    stateInNamedEntity(t128) {
        if (this.entityExcess += 1, this.trieIndex = k1(this.entityTrie, this.trieCurrent, this.trieIndex + 1, t128), this.trieIndex < 0) {
            this.emitNamedEntity(), this.index--;
            return;
        }
        this.trieCurrent = this.entityTrie[this.trieIndex];
        let s31 = this.trieCurrent & s1.VALUE_LENGTH;
        if (s31) {
            let n70 = (s31 >> 14) - 1;
            if (!this.allowLegacyEntity() && t128 !== a3.Semi) this.trieIndex += n70;
            else {
                let r55 = this.index - this.entityExcess + 1;
                r55 > this.sectionStart && this.emitPartial(this.sectionStart, r55), this.entityResult = this.trieIndex, this.trieIndex += n70, this.entityExcess = 0, this.sectionStart = this.index + 1, n70 === 0 && this.emitNamedEntity();
            }
        }
    }
    emitNamedEntity() {
        if (this.state = this.baseState, this.entityResult === 0) return;
        switch((this.entityTrie[this.entityResult] & s1.VALUE_LENGTH) >> 14){
            case 1:
                {
                    this.emitCodePoint(this.entityTrie[this.entityResult] & ~s1.VALUE_LENGTH);
                    break;
                }
            case 2:
                {
                    this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
                    break;
                }
            case 3:
                this.emitCodePoint(this.entityTrie[this.entityResult + 1]), this.emitCodePoint(this.entityTrie[this.entityResult + 2]);
        }
    }
    stateBeforeNumericEntity(t129) {
        (t129 | 32) === a3.LowerX ? (this.entityExcess++, this.state = i2.InHexEntity) : (this.state = i2.InNumericEntity, this.stateInNumericEntity(t129));
    }
    emitNumericEntity(t130) {
        let s32 = this.index - this.entityExcess - 1;
        s32 + 2 + +(this.state === i2.InHexEntity) !== this.index && (s32 > this.sectionStart && this.emitPartial(this.sectionStart, s32), this.sectionStart = this.index + Number(t130), this.emitCodePoint(p(this.entityResult))), this.state = this.baseState;
    }
    stateInNumericEntity(t131) {
        t131 === a3.Semi ? this.emitNumericEntity(!0) : w2(t131) ? (this.entityResult = this.entityResult * 10 + (t131 - a3.Zero), this.entityExcess++) : (this.allowLegacyEntity() ? this.emitNumericEntity(!1) : this.state = this.baseState, this.index--);
    }
    stateInHexEntity(t132) {
        t132 === a3.Semi ? this.emitNumericEntity(!0) : w2(t132) ? (this.entityResult = this.entityResult * 16 + (t132 - a3.Zero), this.entityExcess++) : M1(t132) ? (this.entityResult = this.entityResult * 16 + ((t132 | 32) - a3.LowerA + 10), this.entityExcess++) : (this.allowLegacyEntity() ? this.emitNumericEntity(!1) : this.state = this.baseState, this.index--);
    }
    allowLegacyEntity() {
        return !this.xmlMode && (this.baseState === i2.Text || this.baseState === i2.InSpecialTag);
    }
    cleanup() {
        this.running && this.sectionStart !== this.index && (this.state === i2.Text || this.state === i2.InSpecialTag && this.sequenceIndex === 0 ? (this.cbs.ontext(this.sectionStart, this.index), this.sectionStart = this.index) : (this.state === i2.InAttributeValueDq || this.state === i2.InAttributeValueSq || this.state === i2.InAttributeValueNq) && (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = this.index));
    }
    shouldContinue() {
        return this.index < this.buffer.length + this.offset && this.running;
    }
    parse() {
        for(; this.shouldContinue();){
            let t133 = this.buffer.charCodeAt(this.index - this.offset);
            switch(this.state){
                case i2.Text:
                    {
                        this.stateText(t133);
                        break;
                    }
                case i2.SpecialStartSequence:
                    {
                        this.stateSpecialStartSequence(t133);
                        break;
                    }
                case i2.InSpecialTag:
                    {
                        this.stateInSpecialTag(t133);
                        break;
                    }
                case i2.CDATASequence:
                    {
                        this.stateCDATASequence(t133);
                        break;
                    }
                case i2.InAttributeValueDq:
                    {
                        this.stateInAttributeValueDoubleQuotes(t133);
                        break;
                    }
                case i2.InAttributeName:
                    {
                        this.stateInAttributeName(t133);
                        break;
                    }
                case i2.InCommentLike:
                    {
                        this.stateInCommentLike(t133);
                        break;
                    }
                case i2.InSpecialComment:
                    {
                        this.stateInSpecialComment(t133);
                        break;
                    }
                case i2.BeforeAttributeName:
                    {
                        this.stateBeforeAttributeName(t133);
                        break;
                    }
                case i2.InTagName:
                    {
                        this.stateInTagName(t133);
                        break;
                    }
                case i2.InClosingTagName:
                    {
                        this.stateInClosingTagName(t133);
                        break;
                    }
                case i2.BeforeTagName:
                    {
                        this.stateBeforeTagName(t133);
                        break;
                    }
                case i2.AfterAttributeName:
                    {
                        this.stateAfterAttributeName(t133);
                        break;
                    }
                case i2.InAttributeValueSq:
                    {
                        this.stateInAttributeValueSingleQuotes(t133);
                        break;
                    }
                case i2.BeforeAttributeValue:
                    {
                        this.stateBeforeAttributeValue(t133);
                        break;
                    }
                case i2.BeforeClosingTagName:
                    {
                        this.stateBeforeClosingTagName(t133);
                        break;
                    }
                case i2.AfterClosingTagName:
                    {
                        this.stateAfterClosingTagName(t133);
                        break;
                    }
                case i2.BeforeSpecialS:
                    {
                        this.stateBeforeSpecialS(t133);
                        break;
                    }
                case i2.InAttributeValueNq:
                    {
                        this.stateInAttributeValueNoQuotes(t133);
                        break;
                    }
                case i2.InSelfClosingTag:
                    {
                        this.stateInSelfClosingTag(t133);
                        break;
                    }
                case i2.InDeclaration:
                    {
                        this.stateInDeclaration(t133);
                        break;
                    }
                case i2.BeforeDeclaration:
                    {
                        this.stateBeforeDeclaration(t133);
                        break;
                    }
                case i2.BeforeComment:
                    {
                        this.stateBeforeComment(t133);
                        break;
                    }
                case i2.InProcessingInstruction:
                    {
                        this.stateInProcessingInstruction(t133);
                        break;
                    }
                case i2.InNamedEntity:
                    {
                        this.stateInNamedEntity(t133);
                        break;
                    }
                case i2.BeforeEntity:
                    {
                        this.stateBeforeEntity(t133);
                        break;
                    }
                case i2.InHexEntity:
                    {
                        this.stateInHexEntity(t133);
                        break;
                    }
                case i2.InNumericEntity:
                    {
                        this.stateInNumericEntity(t133);
                        break;
                    }
                default:
                    this.stateBeforeNumericEntity(t133);
            }
            this.index++;
        }
        this.cleanup();
    }
    finish() {
        this.state === i2.InNamedEntity && this.emitNamedEntity(), this.sectionStart < this.index && this.handleTrailingData(), this.cbs.onend();
    }
    handleTrailingData() {
        let t134 = this.buffer.length + this.offset;
        this.state === i2.InCommentLike ? this.currentSequence === u2.CdataEnd ? this.cbs.oncdata(this.sectionStart, t134, 0) : this.cbs.oncomment(this.sectionStart, t134, 0) : this.state === i2.InNumericEntity && this.allowLegacyEntity() ? this.emitNumericEntity(!1) : this.state === i2.InHexEntity && this.allowLegacyEntity() ? this.emitNumericEntity(!1) : this.state === i2.InTagName || this.state === i2.BeforeAttributeName || this.state === i2.BeforeAttributeValue || this.state === i2.AfterAttributeName || this.state === i2.InAttributeName || this.state === i2.InAttributeValueSq || this.state === i2.InAttributeValueDq || this.state === i2.InAttributeValueNq || this.state === i2.InClosingTagName || this.cbs.ontext(this.sectionStart, t134);
    }
    emitPartial(t135, s33) {
        this.baseState !== i2.Text && this.baseState !== i2.InSpecialTag ? this.cbs.onattribdata(t135, s33) : this.cbs.ontext(t135, s33);
    }
    emitCodePoint(t136) {
        this.baseState !== i2.Text && this.baseState !== i2.InSpecialTag ? this.cbs.onattribentity(t136) : this.cbs.ontextentity(t136);
    }
};
var S2 = new Set([
    "input",
    "option",
    "optgroup",
    "select",
    "button",
    "datalist",
    "textarea"
]), h4 = new Set([
    "p"
]), k3 = new Set([
    "thead",
    "tbody"
]), v5 = new Set([
    "dd",
    "dt"
]), B2 = new Set([
    "rt",
    "rp"
]), P1 = new Map([
    [
        "tr",
        new Set([
            "tr",
            "th",
            "td"
        ])
    ],
    [
        "th",
        new Set([
            "th"
        ])
    ],
    [
        "td",
        new Set([
            "thead",
            "th",
            "td"
        ])
    ],
    [
        "body",
        new Set([
            "head",
            "link",
            "script"
        ])
    ],
    [
        "li",
        new Set([
            "li"
        ])
    ],
    [
        "p",
        h4
    ],
    [
        "h1",
        h4
    ],
    [
        "h2",
        h4
    ],
    [
        "h3",
        h4
    ],
    [
        "h4",
        h4
    ],
    [
        "h5",
        h4
    ],
    [
        "h6",
        h4
    ],
    [
        "select",
        S2
    ],
    [
        "input",
        S2
    ],
    [
        "output",
        S2
    ],
    [
        "button",
        S2
    ],
    [
        "datalist",
        S2
    ],
    [
        "textarea",
        S2
    ],
    [
        "option",
        new Set([
            "option"
        ])
    ],
    [
        "optgroup",
        new Set([
            "optgroup",
            "option"
        ])
    ],
    [
        "dd",
        v5
    ],
    [
        "dt",
        v5
    ],
    [
        "address",
        h4
    ],
    [
        "article",
        h4
    ],
    [
        "aside",
        h4
    ],
    [
        "blockquote",
        h4
    ],
    [
        "details",
        h4
    ],
    [
        "div",
        h4
    ],
    [
        "dl",
        h4
    ],
    [
        "fieldset",
        h4
    ],
    [
        "figcaption",
        h4
    ],
    [
        "figure",
        h4
    ],
    [
        "footer",
        h4
    ],
    [
        "form",
        h4
    ],
    [
        "header",
        h4
    ],
    [
        "hr",
        h4
    ],
    [
        "main",
        h4
    ],
    [
        "nav",
        h4
    ],
    [
        "ol",
        h4
    ],
    [
        "pre",
        h4
    ],
    [
        "section",
        h4
    ],
    [
        "table",
        h4
    ],
    [
        "ul",
        h4
    ],
    [
        "rt",
        B2
    ],
    [
        "rp",
        B2
    ],
    [
        "tbody",
        k3
    ],
    [
        "tfoot",
        k3
    ]
]), R3 = new Set([
    "area",
    "base",
    "basefont",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
]), D3 = new Set([
    "math",
    "svg"
]), _1 = new Set([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext",
    "annotation-xml",
    "foreignobject",
    "desc",
    "title"
]), H3 = /\s|\//, p5 = class {
    constructor(t137, s34 = {}){
        var n71, r56, o14, c35, l14;
        this.options = s34, this.startIndex = 0, this.endIndex = 0, this.openTagStart = 0, this.tagname = "", this.attribname = "", this.attribvalue = "", this.attribs = null, this.stack = [], this.foreignContext = [], this.buffers = [], this.bufferOffset = 0, this.writeIndex = 0, this.ended = !1, this.cbs = t137 ?? {}, this.lowerCaseTagNames = (n71 = s34.lowerCaseTags) !== null && n71 !== void 0 ? n71 : !s34.xmlMode, this.lowerCaseAttributeNames = (r56 = s34.lowerCaseAttributeNames) !== null && r56 !== void 0 ? r56 : !s34.xmlMode, this.tokenizer = new ((o14 = s34.Tokenizer) !== null && o14 !== void 0 ? o14 : I3)(this.options, this), (l14 = (c35 = this.cbs).onparserinit) === null || l14 === void 0 || l14.call(c35, this);
    }
    ontext(t138, s35) {
        var n72, r57;
        let o15 = this.getSlice(t138, s35);
        this.endIndex = s35 - 1, (r57 = (n72 = this.cbs).ontext) === null || r57 === void 0 || r57.call(n72, o15), this.startIndex = s35;
    }
    ontextentity(t139) {
        var s36, n73;
        let r58 = this.tokenizer.getSectionStart();
        this.endIndex = r58 - 1, (n73 = (s36 = this.cbs).ontext) === null || n73 === void 0 || n73.call(s36, n(t139)), this.startIndex = r58;
    }
    isVoidElement(t140) {
        return !this.options.xmlMode && R3.has(t140);
    }
    onopentagname(t141, s37) {
        this.endIndex = s37;
        let n74 = this.getSlice(t141, s37);
        this.lowerCaseTagNames && (n74 = n74.toLowerCase()), this.emitOpenTag(n74);
    }
    emitOpenTag(t142) {
        var s38, n75, r59, o16;
        this.openTagStart = this.startIndex, this.tagname = t142;
        let c36 = !this.options.xmlMode && P1.get(t142);
        if (c36) for(; this.stack.length > 0 && c36.has(this.stack[this.stack.length - 1]);){
            let l15 = this.stack.pop();
            (n75 = (s38 = this.cbs).onclosetag) === null || n75 === void 0 || n75.call(s38, l15, !0);
        }
        this.isVoidElement(t142) || (this.stack.push(t142), D3.has(t142) ? this.foreignContext.push(!0) : _1.has(t142) && this.foreignContext.push(!1)), (o16 = (r59 = this.cbs).onopentagname) === null || o16 === void 0 || o16.call(r59, t142), this.cbs.onopentag && (this.attribs = {});
    }
    endOpenTag(t143) {
        var s39, n76;
        this.startIndex = this.openTagStart, this.attribs && ((n76 = (s39 = this.cbs).onopentag) === null || n76 === void 0 || n76.call(s39, this.tagname, this.attribs, t143), this.attribs = null), this.cbs.onclosetag && this.isVoidElement(this.tagname) && this.cbs.onclosetag(this.tagname, !0), this.tagname = "";
    }
    onopentagend(t144) {
        this.endIndex = t144, this.endOpenTag(!1), this.startIndex = t144 + 1;
    }
    onclosetag(t145, s40) {
        var n77, r60, o17, c37, l16, b11;
        this.endIndex = s40;
        let f10 = this.getSlice(t145, s40);
        if (this.lowerCaseTagNames && (f10 = f10.toLowerCase()), (D3.has(f10) || _1.has(f10)) && this.foreignContext.pop(), this.isVoidElement(f10)) !this.options.xmlMode && f10 === "br" && ((r60 = (n77 = this.cbs).onopentagname) === null || r60 === void 0 || r60.call(n77, "br"), (c37 = (o17 = this.cbs).onopentag) === null || c37 === void 0 || c37.call(o17, "br", {}, !0), (b11 = (l16 = this.cbs).onclosetag) === null || b11 === void 0 || b11.call(l16, "br", !1));
        else {
            let x10 = this.stack.lastIndexOf(f10);
            if (x10 !== -1) if (this.cbs.onclosetag) {
                let g6 = this.stack.length - x10;
                for(; g6--;)this.cbs.onclosetag(this.stack.pop(), g6 !== 0);
            } else this.stack.length = x10;
            else !this.options.xmlMode && f10 === "p" && (this.emitOpenTag("p"), this.closeCurrentTag(!0));
        }
        this.startIndex = s40 + 1;
    }
    onselfclosingtag(t146) {
        this.endIndex = t146, this.options.xmlMode || this.options.recognizeSelfClosing || this.foreignContext[this.foreignContext.length - 1] ? (this.closeCurrentTag(!1), this.startIndex = t146 + 1) : this.onopentagend(t146);
    }
    closeCurrentTag(t147) {
        var s41, n78;
        let r61 = this.tagname;
        this.endOpenTag(t147), this.stack[this.stack.length - 1] === r61 && ((n78 = (s41 = this.cbs).onclosetag) === null || n78 === void 0 || n78.call(s41, r61, !t147), this.stack.pop());
    }
    onattribname(t148, s42) {
        this.startIndex = t148;
        let n79 = this.getSlice(t148, s42);
        this.attribname = this.lowerCaseAttributeNames ? n79.toLowerCase() : n79;
    }
    onattribdata(t149, s43) {
        this.attribvalue += this.getSlice(t149, s43);
    }
    onattribentity(t150) {
        this.attribvalue += n(t150);
    }
    onattribend(t151, s44) {
        var n80, r62;
        this.endIndex = s44, (r62 = (n80 = this.cbs).onattribute) === null || r62 === void 0 || r62.call(n80, this.attribname, this.attribvalue, t151 === d3.Double ? '"' : t151 === d3.Single ? "'" : t151 === d3.NoValue ? void 0 : null), this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname) && (this.attribs[this.attribname] = this.attribvalue), this.attribvalue = "";
    }
    getInstructionName(t152) {
        let s45 = t152.search(H3), n81 = s45 < 0 ? t152 : t152.substr(0, s45);
        return this.lowerCaseTagNames && (n81 = n81.toLowerCase()), n81;
    }
    ondeclaration(t153, s46) {
        this.endIndex = s46;
        let n82 = this.getSlice(t153, s46);
        if (this.cbs.onprocessinginstruction) {
            let r63 = this.getInstructionName(n82);
            this.cbs.onprocessinginstruction(`!${r63}`, `!${n82}`);
        }
        this.startIndex = s46 + 1;
    }
    onprocessinginstruction(t154, s47) {
        this.endIndex = s47;
        let n83 = this.getSlice(t154, s47);
        if (this.cbs.onprocessinginstruction) {
            let r64 = this.getInstructionName(n83);
            this.cbs.onprocessinginstruction(`?${r64}`, `?${n83}`);
        }
        this.startIndex = s47 + 1;
    }
    oncomment(t155, s48, n84) {
        var r65, o18, c38, l17;
        this.endIndex = s48, (o18 = (r65 = this.cbs).oncomment) === null || o18 === void 0 || o18.call(r65, this.getSlice(t155, s48 - n84)), (l17 = (c38 = this.cbs).oncommentend) === null || l17 === void 0 || l17.call(c38), this.startIndex = s48 + 1;
    }
    oncdata(t156, s49, n85) {
        var r66, o19, c39, l18, b12, f11, x11, g7, E7, N6;
        this.endIndex = s49;
        let y9 = this.getSlice(t156, s49 - n85);
        this.options.xmlMode || this.options.recognizeCDATA ? ((o19 = (r66 = this.cbs).oncdatastart) === null || o19 === void 0 || o19.call(r66), (l18 = (c39 = this.cbs).ontext) === null || l18 === void 0 || l18.call(c39, y9), (f11 = (b12 = this.cbs).oncdataend) === null || f11 === void 0 || f11.call(b12)) : ((g7 = (x11 = this.cbs).oncomment) === null || g7 === void 0 || g7.call(x11, `[CDATA[${y9}]]`), (N6 = (E7 = this.cbs).oncommentend) === null || N6 === void 0 || N6.call(E7)), this.startIndex = s49 + 1;
    }
    onend() {
        var t157, s50;
        if (this.cbs.onclosetag) {
            this.endIndex = this.startIndex;
            for(let n86 = this.stack.length; n86 > 0; this.cbs.onclosetag(this.stack[--n86], !0));
        }
        (s50 = (t157 = this.cbs).onend) === null || s50 === void 0 || s50.call(t157);
    }
    reset() {
        var t158, s51, n87, r67;
        (s51 = (t158 = this.cbs).onreset) === null || s51 === void 0 || s51.call(t158), this.tokenizer.reset(), this.tagname = "", this.attribname = "", this.attribs = null, this.stack.length = 0, this.startIndex = 0, this.endIndex = 0, (r67 = (n87 = this.cbs).onparserinit) === null || r67 === void 0 || r67.call(n87, this), this.buffers.length = 0, this.bufferOffset = 0, this.writeIndex = 0, this.ended = !1;
    }
    parseComplete(t159) {
        this.reset(), this.end(t159);
    }
    getSlice(t160, s52) {
        for(; t160 - this.bufferOffset >= this.buffers[0].length;)this.shiftBuffer();
        let n88 = this.buffers[0].slice(t160 - this.bufferOffset, s52 - this.bufferOffset);
        for(; s52 - this.bufferOffset > this.buffers[0].length;)this.shiftBuffer(), n88 += this.buffers[0].slice(0, s52 - this.bufferOffset);
        return n88;
    }
    shiftBuffer() {
        this.bufferOffset += this.buffers[0].length, this.writeIndex--, this.buffers.shift();
    }
    write(t161) {
        var s53, n89;
        if (this.ended) {
            (n89 = (s53 = this.cbs).onerror) === null || n89 === void 0 || n89.call(s53, new Error(".write() after done!"));
            return;
        }
        this.buffers.push(t161), this.tokenizer.running && (this.tokenizer.write(t161), this.writeIndex++);
    }
    end(t162) {
        var s54, n90;
        if (this.ended) {
            (n90 = (s54 = this.cbs).onerror) === null || n90 === void 0 || n90.call(s54, new Error(".end() after done!"));
            return;
        }
        t162 && this.write(t162), this.ended = !0, this.tokenizer.end();
    }
    pause() {
        this.tokenizer.pause();
    }
    resume() {
        for(this.tokenizer.resume(); this.tokenizer.running && this.writeIndex < this.buffers.length;)this.tokenizer.write(this.buffers[this.writeIndex++]);
        this.ended && this.tokenizer.end();
    }
    parseChunk(t163) {
        this.write(t163);
    }
    done(t164) {
        this.end(t164);
    }
};
function z3(e101, t165) {
    let s55 = new y1(void 0, t165);
    return new p5(s55, t165).end(e101), s55.root;
}
function Q2(e102, t166) {
    return z3(e102, t166).children;
}
function tt(e103, t167, s56) {
    let n91 = new y1(e103, t167, s56);
    return new p5(n91, t167);
}
var Z2 = {
    xmlMode: !0
};
function it(e104, t168 = Z2) {
    return jt(Q2(e104, t168));
}
const mod11 = {
    DefaultHandler: y1,
    DomHandler: y1,
    DomUtils: mod10,
    ElementType: mod9,
    Parser: p5,
    Tokenizer: I3,
    createDomStream: tt,
    getFeed: jt,
    parseDOM: Q2,
    parseDocument: z3,
    parseFeed: it
};
var p6 = Object.create;
var c4 = Object.defineProperty;
var i3 = Object.getOwnPropertyDescriptor;
var m6 = Object.getOwnPropertyNames;
var x6 = Object.getPrototypeOf, b5 = Object.prototype.hasOwnProperty;
var g3 = (t169, e105)=>()=>(e105 || t169((e105 = {
            exports: {}
        }).exports, e105), e105.exports), h5 = (t170, e106)=>{
    for(var u49 in e106)c4(t170, u49, {
        get: e106[u49],
        enumerable: !0
    });
}, o2 = (t171, e107, u50, a39)=>{
    if (e107 && typeof e107 == "object" || typeof e107 == "function") for (let f12 of m6(e107))!b5.call(t171, f12) && f12 !== u50 && c4(t171, f12, {
        get: ()=>e107[f12],
        enumerable: !(a39 = i3(e107, f12)) || a39.enumerable
    });
    return t171;
}, r1 = (t172, e108, u51)=>(o2(t172, e108, "default"), u51 && o2(u51, e108, "default")), l2 = (t173, e109, u52)=>(u52 = t173 != null ? p6(x6(t173)) : {}, o2(e109 || !t173 || !t173.__esModule ? c4(u52, "default", {
        value: t173,
        enumerable: !0
    }) : u52, t173));
var s4 = g3((y, d21)=>{
    d21.exports = {
        trueFunc: function() {
            return !0;
        },
        falseFunc: function() {
            return !1;
        }
    };
});
var n2 = {};
h5(n2, {
    default: ()=>v6,
    falseFunc: ()=>k4,
    trueFunc: ()=>j1
});
var _2 = l2(s4());
r1(n2, l2(s4()));
var { trueFunc: j1 , falseFunc: k4  } = _2, { default: F2 , ...q3 } = _2, v6 = F2 !== void 0 ? F2 : q3;
var e1;
(function(a40) {
    a40.Attribute = "attribute", a40.Pseudo = "pseudo", a40.PseudoElement = "pseudo-element", a40.Tag = "tag", a40.Universal = "universal", a40.Adjacent = "adjacent", a40.Child = "child", a40.Descendant = "descendant", a40.Parent = "parent", a40.Sibling = "sibling", a40.ColumnCombinator = "column-combinator";
})(e1 || (e1 = {}));
var u3;
(function(a41) {
    a41.Any = "any", a41.Element = "element", a41.End = "end", a41.Equals = "equals", a41.Exists = "exists", a41.Hyphen = "hyphen", a41.Not = "not", a41.Start = "start";
})(u3 || (u3 = {}));
var N3 = /^[^\\#]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/, L4 = /\\([\da-f]{1,6}\s?|(\s)|.)/gi, z4 = new Map([
    [
        126,
        u3.Element
    ],
    [
        94,
        u3.Start
    ],
    [
        36,
        u3.End
    ],
    [
        42,
        u3.Any
    ],
    [
        33,
        u3.Not
    ],
    [
        124,
        u3.Hyphen
    ]
]), O1 = new Set([
    "has",
    "not",
    "matches",
    "is",
    "where",
    "host",
    "host-context"
]);
function j2(a42) {
    switch(a42.type){
        case e1.Adjacent:
        case e1.Child:
        case e1.Descendant:
        case e1.Parent:
        case e1.Sibling:
        case e1.ColumnCombinator:
            return !0;
        default:
            return !1;
    }
}
var _3 = new Set([
    "contains",
    "icontains"
]);
function B3(a, n92, t174) {
    let i70 = parseInt(n92, 16) - 65536;
    return i70 !== i70 || t174 ? n92 : i70 < 0 ? String.fromCharCode(i70 + 65536) : String.fromCharCode(i70 >> 10 | 55296, i70 & 1023 | 56320);
}
function d4(a43) {
    return a43.replace(L4, B3);
}
function b6(a44) {
    return a44 === 39 || a44 === 34;
}
function D4(a45) {
    return a45 === 32 || a45 === 9 || a45 === 10 || a45 === 12 || a45 === 13;
}
function G3(a46) {
    let n93 = [], t175 = V2(n93, `${a46}`, 0);
    if (t175 < a46.length) throw new Error(`Unmatched selector: ${a46.slice(t175)}`);
    return n93;
}
function V2(a47, n94, t176) {
    let i71 = [];
    function c40(h8) {
        let r68 = n94.slice(t176 + h8).match(N3);
        if (!r68) throw new Error(`Expected name, found ${n94.slice(t176)}`);
        let [s57] = r68;
        return t176 += h8 + s57.length, d4(s57);
    }
    function f13(h9) {
        for(t176 += h9; t176 < n94.length && D4(n94.charCodeAt(t176));)t176++;
    }
    function $4() {
        t176 += 1;
        let h10 = t176, r69 = 1;
        for(; r69 > 0 && t176 < n94.length; t176++)n94.charCodeAt(t176) === 40 && !l19(t176) ? r69++ : n94.charCodeAt(t176) === 41 && !l19(t176) && r69--;
        if (r69) throw new Error("Parenthesis not matched");
        return d4(n94.slice(h10, t176 - 1));
    }
    function l19(h11) {
        let r70 = 0;
        for(; n94.charCodeAt(--h11) === 92;)r70++;
        return (r70 & 1) === 1;
    }
    function v12() {
        if (i71.length > 0 && j2(i71[i71.length - 1])) throw new Error("Did not expect successive traversals.");
    }
    function g8(h12) {
        if (i71.length > 0 && i71[i71.length - 1].type === e1.Descendant) {
            i71[i71.length - 1].type = h12;
            return;
        }
        v12(), i71.push({
            type: h12
        });
    }
    function y10(h13, r71) {
        i71.push({
            type: e1.Attribute,
            name: h13,
            action: r71,
            value: c40(1),
            namespace: null,
            ignoreCase: "quirks"
        });
    }
    function P5() {
        if (i71.length && i71[i71.length - 1].type === e1.Descendant && i71.pop(), i71.length === 0) throw new Error("Empty sub-selector");
        a47.push(i71);
    }
    if (f13(0), n94.length === t176) return t176;
    a: for(; t176 < n94.length;){
        let h14 = n94.charCodeAt(t176);
        switch(h14){
            case 32:
            case 9:
            case 10:
            case 12:
            case 13:
                {
                    (i71.length === 0 || i71[0].type !== e1.Descendant) && (v12(), i71.push({
                        type: e1.Descendant
                    })), f13(1);
                    break;
                }
            case 62:
                {
                    g8(e1.Child), f13(1);
                    break;
                }
            case 60:
                {
                    g8(e1.Parent), f13(1);
                    break;
                }
            case 126:
                {
                    g8(e1.Sibling), f13(1);
                    break;
                }
            case 43:
                {
                    g8(e1.Adjacent), f13(1);
                    break;
                }
            case 46:
                {
                    y10("class", u3.Element);
                    break;
                }
            case 35:
                {
                    y10("id", u3.Equals);
                    break;
                }
            case 91:
                {
                    f13(1);
                    let r72, s58 = null;
                    n94.charCodeAt(t176) === 124 ? r72 = c40(1) : n94.startsWith("*|", t176) ? (s58 = "*", r72 = c40(2)) : (r72 = c40(0), n94.charCodeAt(t176) === 124 && n94.charCodeAt(t176 + 1) !== 61 && (s58 = r72, r72 = c40(1))), f13(0);
                    let o20 = u3.Exists, S6 = z4.get(n94.charCodeAt(t176));
                    if (S6) {
                        if (o20 = S6, n94.charCodeAt(t176 + 1) !== 61) throw new Error("Expected `=`");
                        f13(2);
                    } else n94.charCodeAt(t176) === 61 && (o20 = u3.Equals, f13(1));
                    let A9 = "", E8 = null;
                    if (o20 !== "exists") {
                        if (b6(n94.charCodeAt(t176))) {
                            let w6 = n94.charCodeAt(t176), m7 = t176 + 1;
                            for(; m7 < n94.length && (n94.charCodeAt(m7) !== w6 || l19(m7));)m7 += 1;
                            if (n94.charCodeAt(m7) !== w6) throw new Error("Attribute value didn't end");
                            A9 = d4(n94.slice(t176 + 1, m7)), t176 = m7 + 1;
                        } else {
                            let w7 = t176;
                            for(; t176 < n94.length && (!D4(n94.charCodeAt(t176)) && n94.charCodeAt(t176) !== 93 || l19(t176));)t176 += 1;
                            A9 = d4(n94.slice(w7, t176));
                        }
                        f13(0);
                        let q6 = n94.charCodeAt(t176) | 32;
                        q6 === 115 ? (E8 = !1, f13(1)) : q6 === 105 && (E8 = !0, f13(1));
                    }
                    if (n94.charCodeAt(t176) !== 93) throw new Error("Attribute selector didn't terminate");
                    t176 += 1;
                    let Q5 = {
                        type: e1.Attribute,
                        name: r72,
                        action: o20,
                        value: A9,
                        namespace: s58,
                        ignoreCase: E8
                    };
                    i71.push(Q5);
                    break;
                }
            case 58:
                {
                    if (n94.charCodeAt(t176 + 1) === 58) {
                        i71.push({
                            type: e1.PseudoElement,
                            name: c40(2).toLowerCase(),
                            data: n94.charCodeAt(t176) === 40 ? $4() : null
                        });
                        continue;
                    }
                    let r73 = c40(1).toLowerCase(), s59 = null;
                    if (n94.charCodeAt(t176) === 40) if (O1.has(r73)) {
                        if (b6(n94.charCodeAt(t176 + 1))) throw new Error(`Pseudo-selector ${r73} cannot be quoted`);
                        if (s59 = [], t176 = V2(s59, n94, t176 + 1), n94.charCodeAt(t176) !== 41) throw new Error(`Missing closing parenthesis in :${r73} (${n94})`);
                        t176 += 1;
                    } else {
                        if (s59 = $4(), _3.has(r73)) {
                            let o21 = s59.charCodeAt(0);
                            o21 === s59.charCodeAt(s59.length - 1) && b6(o21) && (s59 = s59.slice(1, -1));
                        }
                        s59 = d4(s59);
                    }
                    i71.push({
                        type: e1.Pseudo,
                        name: r73,
                        data: s59
                    });
                    break;
                }
            case 44:
                {
                    P5(), i71 = [], f13(1);
                    break;
                }
            default:
                {
                    if (n94.startsWith("/*", t176)) {
                        let o22 = n94.indexOf("*/", t176 + 2);
                        if (o22 < 0) throw new Error("Comment was not terminated");
                        t176 = o22 + 2, i71.length === 0 && f13(0);
                        break;
                    }
                    let r74 = null, s60;
                    if (h14 === 42) t176 += 1, s60 = "*";
                    else if (h14 === 124) {
                        if (s60 = "", n94.charCodeAt(t176 + 1) === 124) {
                            g8(e1.ColumnCombinator), f13(2);
                            break;
                        }
                    } else if (N3.test(n94.slice(t176))) s60 = c40(0);
                    else break a;
                    n94.charCodeAt(t176) === 124 && n94.charCodeAt(t176 + 1) !== 124 && (r74 = s60, n94.charCodeAt(t176 + 1) === 42 ? (s60 = "*", t176 += 2) : s60 = c40(1)), i71.push(s60 === "*" ? {
                        type: e1.Universal,
                        namespace: r74
                    } : {
                        type: e1.Tag,
                        name: s60,
                        namespace: r74
                    });
                }
        }
    }
    return P5(), t176;
}
var U4 = [
    "\\",
    '"'
], W1 = [
    ...U4,
    "(",
    ")"
], J3 = new Set(U4.map((a48)=>a48.charCodeAt(0))), F3 = new Set(W1.map((a49)=>a49.charCodeAt(0))), C3 = new Set([
    ...W1,
    "~",
    "^",
    "$",
    "*",
    "+",
    "!",
    "|",
    ":",
    "[",
    "]",
    " ",
    "."
].map((a50)=>a50.charCodeAt(0)));
function M2(a51) {
    return a51.map((n95)=>n95.map(K1).join("")).join(", ");
}
function K1(a52, n96, t177) {
    switch(a52.type){
        case e1.Child:
            return n96 === 0 ? "> " : " > ";
        case e1.Parent:
            return n96 === 0 ? "< " : " < ";
        case e1.Sibling:
            return n96 === 0 ? "~ " : " ~ ";
        case e1.Adjacent:
            return n96 === 0 ? "+ " : " + ";
        case e1.Descendant:
            return " ";
        case e1.ColumnCombinator:
            return n96 === 0 ? "|| " : " || ";
        case e1.Universal:
            return a52.namespace === "*" && n96 + 1 < t177.length && "name" in t177[n96 + 1] ? "" : `${H4(a52.namespace)}*`;
        case e1.Tag:
            return T7(a52);
        case e1.PseudoElement:
            return `::${p7(a52.name, C3)}${a52.data === null ? "" : `(${p7(a52.data, F3)})`}`;
        case e1.Pseudo:
            return `:${p7(a52.name, C3)}${a52.data === null ? "" : `(${typeof a52.data == "string" ? p7(a52.data, F3) : M2(a52.data)})`}`;
        case e1.Attribute:
            {
                if (a52.name === "id" && a52.action === u3.Equals && a52.ignoreCase === "quirks" && !a52.namespace) return `#${p7(a52.value, C3)}`;
                if (a52.name === "class" && a52.action === u3.Element && a52.ignoreCase === "quirks" && !a52.namespace) return `.${p7(a52.value, C3)}`;
                let i72 = T7(a52);
                return a52.action === u3.Exists ? `[${i72}]` : `[${i72}${R4(a52.action)}="${p7(a52.value, J3)}"${a52.ignoreCase === null ? "" : a52.ignoreCase ? " i" : " s"}]`;
            }
    }
}
function R4(a53) {
    switch(a53){
        case u3.Equals:
            return "";
        case u3.Element:
            return "~";
        case u3.Start:
            return "^";
        case u3.End:
            return "$";
        case u3.Any:
            return "*";
        case u3.Not:
            return "!";
        case u3.Hyphen:
            return "|";
        case u3.Exists:
            throw new Error("Shouldn't be here");
    }
}
function T7(a54) {
    return `${H4(a54.namespace)}${p7(a54.name, C3)}`;
}
function H4(a55) {
    return a55 !== null ? `${a55 === "*" ? "*" : p7(a55, C3)}|` : "";
}
function p7(a56, n97) {
    let t178 = 0, i73 = "";
    for(let c41 = 0; c41 < a56.length; c41++)n97.has(a56.charCodeAt(c41)) && (i73 += `${a56.slice(t178, c41)}\\${a56.charAt(c41)}`, t178 = c41 + 1);
    return i73.length > 0 ? i73 + a56.slice(t178) : a56;
}
var b7 = new Set([
    9,
    10,
    12,
    13,
    32
]), l3 = "0".charCodeAt(0), A6 = "9".charCodeAt(0);
function u4(e110) {
    if (e110 = e110.trim().toLowerCase(), e110 === "even") return [
        2,
        0
    ];
    if (e110 === "odd") return [
        2,
        1
    ];
    let t179 = 0, n98 = 0, i74 = r75(), c42 = o23();
    if (t179 < e110.length && e110.charAt(t179) === "n" && (t179++, n98 = i74 * (c42 ?? 1), h15(), t179 < e110.length ? (i74 = r75(), h15(), c42 = o23()) : i74 = c42 = 0), c42 === null || t179 < e110.length) throw new Error(`n-th rule couldn't be parsed ('${e110}')`);
    return [
        n98,
        i74 * c42
    ];
    function r75() {
        return e110.charAt(t179) === "-" ? (t179++, -1) : (e110.charAt(t179) === "+" && t179++, 1);
    }
    function o23() {
        let f14 = t179, s61 = 0;
        for(; t179 < e110.length && e110.charCodeAt(t179) >= l3 && e110.charCodeAt(t179) <= A6;)s61 = s61 * 10 + (e110.charCodeAt(t179) - l3), t179++;
        return t179 === f14 ? null : s61;
    }
    function h15() {
        for(; t179 < e110.length && b7.has(e110.charCodeAt(t179));)t179++;
    }
}
function p8(e111) {
    let t180 = e111[0], n99 = e111[1] - 1;
    if (n99 < 0 && t180 <= 0) return v6.falseFunc;
    if (t180 === -1) return (r76)=>r76 <= n99;
    if (t180 === 0) return (r77)=>r77 === n99;
    if (t180 === 1) return n99 < 0 ? v6.trueFunc : (r78)=>r78 >= n99;
    let i75 = Math.abs(t180), c43 = (n99 % i75 + i75) % i75;
    return t180 > 1 ? (r79)=>r79 >= n99 && r79 % i75 === c43 : (r80)=>r80 <= n99 && r80 % i75 === c43;
}
function g4(e112) {
    return p8(u4(e112));
}
var W2 = new Map([
    [
        e1.Universal,
        50
    ],
    [
        e1.Tag,
        30
    ],
    [
        e1.Attribute,
        1
    ],
    [
        e1.Pseudo,
        0
    ]
]);
function A7(e113) {
    return !W2.has(e113.type);
}
var te1 = new Map([
    [
        u3.Exists,
        10
    ],
    [
        u3.Equals,
        8
    ],
    [
        u3.Not,
        7
    ],
    [
        u3.Start,
        6
    ],
    [
        u3.End,
        6
    ],
    [
        u3.Any,
        5
    ]
]);
function _4(e114) {
    let t181 = e114.map(H5);
    for(let n100 = 1; n100 < e114.length; n100++){
        let r81 = t181[n100];
        if (!(r81 < 0)) for(let i76 = n100 - 1; i76 >= 0 && r81 < t181[i76]; i76--){
            let s62 = e114[i76 + 1];
            e114[i76 + 1] = e114[i76], e114[i76] = s62, t181[i76 + 1] = t181[i76], t181[i76] = r81;
        }
    }
}
function H5(e115) {
    var t182, n101;
    let r82 = (t182 = W2.get(e115.type)) !== null && t182 !== void 0 ? t182 : -1;
    return e115.type === e1.Attribute ? (r82 = (n101 = te1.get(e115.action)) !== null && n101 !== void 0 ? n101 : 4, e115.action === u3.Equals && e115.name === "id" && (r82 = 9), e115.ignoreCase && (r82 >>= 1)) : e115.type === e1.Pseudo && (e115.data ? e115.name === "has" || e115.name === "contains" ? r82 = 0 : Array.isArray(e115.data) ? (r82 = Math.min(...e115.data.map((i77)=>Math.min(...i77.map(H5)))), r82 < 0 && (r82 = 0)) : r82 = 2 : r82 = 3), r82;
}
var ne1 = /[-[\]{}()*+?.,\\^$|#\s]/g;
function K2(e116) {
    return e116.replace(ne1, "\\$&");
}
var re1 = new Set([
    "accept",
    "accept-charset",
    "align",
    "alink",
    "axis",
    "bgcolor",
    "charset",
    "checked",
    "clear",
    "codetype",
    "color",
    "compact",
    "declare",
    "defer",
    "dir",
    "direction",
    "disabled",
    "enctype",
    "face",
    "frame",
    "hreflang",
    "http-equiv",
    "lang",
    "language",
    "link",
    "media",
    "method",
    "multiple",
    "nohref",
    "noresize",
    "noshade",
    "nowrap",
    "readonly",
    "rel",
    "rev",
    "rules",
    "scope",
    "scrolling",
    "selected",
    "shape",
    "target",
    "text",
    "type",
    "valign",
    "valuetype",
    "vlink"
]);
function y4(e117, t183) {
    return typeof e117.ignoreCase == "boolean" ? e117.ignoreCase : e117.ignoreCase === "quirks" ? !!t183.quirksMode : !t183.xmlMode && re1.has(e117.name);
}
var z5 = {
    equals (e118, t184, n102) {
        let { adapter: r83  } = n102, { name: i78  } = t184, { value: s63  } = t184;
        return y4(t184, n102) ? (s63 = s63.toLowerCase(), (o24)=>{
            let a57 = r83.getAttributeValue(o24, i78);
            return a57 != null && a57.length === s63.length && a57.toLowerCase() === s63 && e118(o24);
        }) : (o25)=>r83.getAttributeValue(o25, i78) === s63 && e118(o25);
    },
    hyphen (e119, t185, n103) {
        let { adapter: r84  } = n103, { name: i79  } = t185, { value: s64  } = t185, o26 = s64.length;
        return y4(t185, n103) ? (s64 = s64.toLowerCase(), function(u53) {
            let l20 = r84.getAttributeValue(u53, i79);
            return l20 != null && (l20.length === o26 || l20.charAt(o26) === "-") && l20.substr(0, o26).toLowerCase() === s64 && e119(u53);
        }) : function(u54) {
            let l21 = r84.getAttributeValue(u54, i79);
            return l21 != null && (l21.length === o26 || l21.charAt(o26) === "-") && l21.substr(0, o26) === s64 && e119(u54);
        };
    },
    element (e120, t186, n104) {
        let { adapter: r85  } = n104, { name: i80 , value: s65  } = t186;
        if (/\s/.test(s65)) return v6.falseFunc;
        let o27 = new RegExp(`(?:^|\\s)${K2(s65)}(?:$|\\s)`, y4(t186, n104) ? "i" : "");
        return function(u55) {
            let l22 = r85.getAttributeValue(u55, i80);
            return l22 != null && l22.length >= s65.length && o27.test(l22) && e120(u55);
        };
    },
    exists (e121, { name: t187  }, { adapter: n105  }) {
        return (r86)=>n105.hasAttrib(r86, t187) && e121(r86);
    },
    start (e122, t188, n106) {
        let { adapter: r87  } = n106, { name: i81  } = t188, { value: s66  } = t188, o28 = s66.length;
        return o28 === 0 ? v6.falseFunc : y4(t188, n106) ? (s66 = s66.toLowerCase(), (a58)=>{
            let u56 = r87.getAttributeValue(a58, i81);
            return u56 != null && u56.length >= o28 && u56.substr(0, o28).toLowerCase() === s66 && e122(a58);
        }) : (a59)=>{
            var u57;
            return !!(!((u57 = r87.getAttributeValue(a59, i81)) === null || u57 === void 0) && u57.startsWith(s66)) && e122(a59);
        };
    },
    end (e123, t189, n107) {
        let { adapter: r88  } = n107, { name: i82  } = t189, { value: s67  } = t189, o29 = -s67.length;
        return o29 === 0 ? v6.falseFunc : y4(t189, n107) ? (s67 = s67.toLowerCase(), (a60)=>{
            var u58;
            return ((u58 = r88.getAttributeValue(a60, i82)) === null || u58 === void 0 ? void 0 : u58.substr(o29).toLowerCase()) === s67 && e123(a60);
        }) : (a61)=>{
            var u59;
            return !!(!((u59 = r88.getAttributeValue(a61, i82)) === null || u59 === void 0) && u59.endsWith(s67)) && e123(a61);
        };
    },
    any (e124, t190, n108) {
        let { adapter: r89  } = n108, { name: i83 , value: s68  } = t190;
        if (s68 === "") return v6.falseFunc;
        if (y4(t190, n108)) {
            let o30 = new RegExp(K2(s68), "i");
            return function(u60) {
                let l23 = r89.getAttributeValue(u60, i83);
                return l23 != null && l23.length >= s68.length && o30.test(l23) && e124(u60);
            };
        }
        return (o31)=>{
            var a62;
            return !!(!((a62 = r89.getAttributeValue(o31, i83)) === null || a62 === void 0) && a62.includes(s68)) && e124(o31);
        };
    },
    not (e125, t191, n109) {
        let { adapter: r90  } = n109, { name: i84  } = t191, { value: s69  } = t191;
        return s69 === "" ? (o32)=>!!r90.getAttributeValue(o32, i84) && e125(o32) : y4(t191, n109) ? (s69 = s69.toLowerCase(), (o33)=>{
            let a63 = r90.getAttributeValue(o33, i84);
            return (a63 == null || a63.length !== s69.length || a63.toLowerCase() !== s69) && e125(o33);
        }) : (o34)=>r90.getAttributeValue(o34, i84) !== s69 && e125(o34);
    }
};
function E5(e126, t192) {
    return (n110)=>{
        let r91 = t192.getParent(n110);
        return r91 != null && t192.isTag(r91) && e126(n110);
    };
}
var S3 = {
    contains (e127, t193, { adapter: n111  }) {
        return function(i85) {
            return e127(i85) && n111.getText(i85).includes(t193);
        };
    },
    icontains (e128, t194, { adapter: n112  }) {
        let r92 = t194.toLowerCase();
        return function(s70) {
            return e128(s70) && n112.getText(s70).toLowerCase().includes(r92);
        };
    },
    "nth-child" (e129, t195, { adapter: n113 , equals: r93  }) {
        let i86 = g4(t195);
        return i86 === v6.falseFunc ? v6.falseFunc : i86 === v6.trueFunc ? E5(e129, n113) : function(o35) {
            let a64 = n113.getSiblings(o35), u61 = 0;
            for(let l24 = 0; l24 < a64.length && !r93(o35, a64[l24]); l24++)n113.isTag(a64[l24]) && u61++;
            return i86(u61) && e129(o35);
        };
    },
    "nth-last-child" (e130, t196, { adapter: n114 , equals: r94  }) {
        let i87 = g4(t196);
        return i87 === v6.falseFunc ? v6.falseFunc : i87 === v6.trueFunc ? E5(e130, n114) : function(o36) {
            let a65 = n114.getSiblings(o36), u62 = 0;
            for(let l25 = a65.length - 1; l25 >= 0 && !r94(o36, a65[l25]); l25--)n114.isTag(a65[l25]) && u62++;
            return i87(u62) && e130(o36);
        };
    },
    "nth-of-type" (e131, t197, { adapter: n115 , equals: r95  }) {
        let i88 = g4(t197);
        return i88 === v6.falseFunc ? v6.falseFunc : i88 === v6.trueFunc ? E5(e131, n115) : function(o37) {
            let a66 = n115.getSiblings(o37), u63 = 0;
            for(let l26 = 0; l26 < a66.length; l26++){
                let c44 = a66[l26];
                if (r95(o37, c44)) break;
                n115.isTag(c44) && n115.getName(c44) === n115.getName(o37) && u63++;
            }
            return i88(u63) && e131(o37);
        };
    },
    "nth-last-of-type" (e132, t198, { adapter: n116 , equals: r96  }) {
        let i89 = g4(t198);
        return i89 === v6.falseFunc ? v6.falseFunc : i89 === v6.trueFunc ? E5(e132, n116) : function(o38) {
            let a67 = n116.getSiblings(o38), u64 = 0;
            for(let l27 = a67.length - 1; l27 >= 0; l27--){
                let c45 = a67[l27];
                if (r96(o38, c45)) break;
                n116.isTag(c45) && n116.getName(c45) === n116.getName(o38) && u64++;
            }
            return i89(u64) && e132(o38);
        };
    },
    root (e133, t, { adapter: n117  }) {
        return (r97)=>{
            let i90 = n117.getParent(r97);
            return (i90 == null || !n117.isTag(i90)) && e133(r97);
        };
    },
    scope (e134, t199, n118, r98) {
        let { equals: i91  } = n118;
        return !r98 || r98.length === 0 ? S3.root(e134, t199, n118) : r98.length === 1 ? (s71)=>i91(r98[0], s71) && e134(s71) : (s72)=>r98.includes(s72) && e134(s72);
    },
    hover: L5("isHovered"),
    visited: L5("isVisited"),
    active: L5("isActive")
};
function L5(e135) {
    return function(n119, r, { adapter: i92  }) {
        let s73 = i92[e135];
        return typeof s73 != "function" ? v6.falseFunc : function(a68) {
            return s73(a68) && n119(a68);
        };
    };
}
var F4 = {
    empty (e136, { adapter: t200  }) {
        return !t200.getChildren(e136).some((n120)=>t200.isTag(n120) || t200.getText(n120) !== "");
    },
    "first-child" (e137, { adapter: t201 , equals: n121  }) {
        if (t201.prevElementSibling) return t201.prevElementSibling(e137) == null;
        let r99 = t201.getSiblings(e137).find((i93)=>t201.isTag(i93));
        return r99 != null && n121(e137, r99);
    },
    "last-child" (e138, { adapter: t202 , equals: n122  }) {
        let r100 = t202.getSiblings(e138);
        for(let i94 = r100.length - 1; i94 >= 0; i94--){
            if (n122(e138, r100[i94])) return !0;
            if (t202.isTag(r100[i94])) break;
        }
        return !1;
    },
    "first-of-type" (e139, { adapter: t203 , equals: n123  }) {
        let r101 = t203.getSiblings(e139), i95 = t203.getName(e139);
        for(let s74 = 0; s74 < r101.length; s74++){
            let o39 = r101[s74];
            if (n123(e139, o39)) return !0;
            if (t203.isTag(o39) && t203.getName(o39) === i95) break;
        }
        return !1;
    },
    "last-of-type" (e140, { adapter: t204 , equals: n124  }) {
        let r102 = t204.getSiblings(e140), i96 = t204.getName(e140);
        for(let s75 = r102.length - 1; s75 >= 0; s75--){
            let o40 = r102[s75];
            if (n124(e140, o40)) return !0;
            if (t204.isTag(o40) && t204.getName(o40) === i96) break;
        }
        return !1;
    },
    "only-of-type" (e141, { adapter: t205 , equals: n125  }) {
        let r103 = t205.getName(e141);
        return t205.getSiblings(e141).every((i97)=>n125(e141, i97) || !t205.isTag(i97) || t205.getName(i97) !== r103);
    },
    "only-child" (e142, { adapter: t206 , equals: n126  }) {
        return t206.getSiblings(e142).every((r104)=>n126(e142, r104) || !t206.isTag(r104));
    }
};
function k5(e143, t207, n127, r105) {
    if (n127 === null) {
        if (e143.length > r105) throw new Error(`Pseudo-class :${t207} requires an argument`);
    } else if (e143.length === r105) throw new Error(`Pseudo-class :${t207} doesn't have any arguments`);
}
var O2 = {
    "any-link": ":is(a, area, link)[href]",
    link: ":any-link:not(:visited)",
    disabled: `:is(
        :is(button, input, select, textarea, optgroup, option)[disabled],
        optgroup[disabled] > option,
        fieldset[disabled]:not(fieldset[disabled] legend:first-of-type *)
    )`,
    enabled: ":not(:disabled)",
    checked: ":is(:is(input[type=radio], input[type=checkbox])[checked], option:selected)",
    required: ":is(input, select, textarea)[required]",
    optional: ":is(input, select, textarea):not([required])",
    selected: "option:is([selected], select:not([multiple]):not(:has(> option[selected])) > :first-of-type)",
    checkbox: "[type=checkbox]",
    file: "[type=file]",
    password: "[type=password]",
    radio: "[type=radio]",
    reset: "[type=reset]",
    image: "[type=image]",
    submit: "[type=submit]",
    parent: ":not(:empty)",
    header: ":is(h1, h2, h3, h4, h5, h6)",
    button: ":is(button, input[type=button])",
    input: ":is(input, textarea, select, button)",
    text: "input:is(:not([type!='']), [type=text])"
};
var V3 = {};
function q4(e144, t208) {
    return e144 === v6.falseFunc ? v6.falseFunc : (n128)=>t208.isTag(n128) && e144(n128);
}
function M3(e145, t209) {
    let n129 = t209.getSiblings(e145);
    if (n129.length <= 1) return [];
    let r106 = n129.indexOf(e145);
    return r106 < 0 || r106 === n129.length - 1 ? [] : n129.slice(r106 + 1).filter(t209.isTag);
}
function R5(e146) {
    return {
        xmlMode: !!e146.xmlMode,
        lowerCaseAttributeNames: !!e146.lowerCaseAttributeNames,
        lowerCaseTags: !!e146.lowerCaseTags,
        quirksMode: !!e146.quirksMode,
        cacheResults: !!e146.cacheResults,
        pseudos: e146.pseudos,
        adapter: e146.adapter,
        equals: e146.equals
    };
}
var D5 = (e147, t210, n130, r107, i98)=>{
    let s76 = i98(t210, R5(n130), r107);
    return s76 === v6.trueFunc ? e147 : s76 === v6.falseFunc ? v6.falseFunc : (o41)=>s76(o41) && e147(o41);
}, N4 = {
    is: D5,
    matches: D5,
    where: D5,
    not (e148, t211, n131, r108, i99) {
        let s77 = i99(t211, R5(n131), r108);
        return s77 === v6.falseFunc ? e148 : s77 === v6.trueFunc ? v6.falseFunc : (o42)=>!s77(o42) && e148(o42);
    },
    has (e149, t212, n132, r, i100) {
        let { adapter: s78  } = n132, o43 = R5(n132);
        o43.relativeSelector = !0;
        let a69 = t212.some((c46)=>c46.some(A7)) ? [
            V3
        ] : void 0, u65 = i100(t212, o43, a69);
        if (u65 === v6.falseFunc) return v6.falseFunc;
        let l28 = q4(u65, s78);
        if (a69 && u65 !== v6.trueFunc) {
            let { shouldTestNextSiblings: c47 = !1  } = u65;
            return (f15)=>{
                if (!e149(f15)) return !1;
                a69[0] = f15;
                let v13 = s78.getChildren(f15), ee2 = c47 ? [
                    ...v13,
                    ...M3(f15, s78)
                ] : v13;
                return s78.existsOne(l28, ee2);
            };
        }
        return (c48)=>e149(c48) && s78.existsOne(l28, s78.getChildren(c48));
    }
};
function B4(e150, t213, n133, r109, i101) {
    var s79;
    let { name: o44 , data: a70  } = t213;
    if (Array.isArray(a70)) {
        if (!(o44 in N4)) throw new Error(`Unknown pseudo-class :${o44}(${a70})`);
        return N4[o44](e150, a70, n133, r109, i101);
    }
    let u66 = (s79 = n133.pseudos) === null || s79 === void 0 ? void 0 : s79[o44], l29 = typeof u66 == "string" ? u66 : O2[o44];
    if (typeof l29 == "string") {
        if (a70 != null) throw new Error(`Pseudo ${o44} doesn't have any arguments`);
        let c49 = G3(l29);
        return N4.is(e150, c49, n133, r109, i101);
    }
    if (typeof u66 == "function") return k5(u66, o44, a70, 1), (c50)=>u66(c50, a70) && e150(c50);
    if (o44 in S3) return S3[o44](e150, a70, n133, r109);
    if (o44 in F4) {
        let c51 = F4[o44];
        return k5(c51, o44, a70, 2), (f16)=>c51(f16, n133, a70) && e150(f16);
    }
    throw new Error(`Unknown pseudo-class :${o44}`);
}
function $1(e151, t214) {
    let n134 = t214.getParent(e151);
    return n134 && t214.isTag(n134) ? n134 : null;
}
function G4(e152, t215, n135, r110, i102) {
    let { adapter: s80 , equals: o45  } = n135;
    switch(t215.type){
        case e1.PseudoElement:
            throw new Error("Pseudo-elements are not supported by css-select");
        case e1.ColumnCombinator:
            throw new Error("Column combinators are not yet supported by css-select");
        case e1.Attribute:
            {
                if (t215.namespace != null) throw new Error("Namespaced attributes are not yet supported by css-select");
                return (!n135.xmlMode || n135.lowerCaseAttributeNames) && (t215.name = t215.name.toLowerCase()), z5[t215.action](e152, t215, n135);
            }
        case e1.Pseudo:
            return B4(e152, t215, n135, r110, i102);
        case e1.Tag:
            {
                if (t215.namespace != null) throw new Error("Namespaced tag names are not yet supported by css-select");
                let { name: a71  } = t215;
                return (!n135.xmlMode || n135.lowerCaseTags) && (a71 = a71.toLowerCase()), function(l30) {
                    return s80.getName(l30) === a71 && e152(l30);
                };
            }
        case e1.Descendant:
            {
                if (n135.cacheResults === !1 || typeof WeakSet > "u") return function(l31) {
                    let c52 = l31;
                    for(; c52 = $1(c52, s80);)if (e152(c52)) return !0;
                    return !1;
                };
                let a72 = new WeakSet;
                return function(l32) {
                    let c53 = l32;
                    for(; c53 = $1(c53, s80);)if (!a72.has(c53)) {
                        if (s80.isTag(c53) && e152(c53)) return !0;
                        a72.add(c53);
                    }
                    return !1;
                };
            }
        case "_flexibleDescendant":
            return function(u67) {
                let l33 = u67;
                do if (e152(l33)) return !0;
                while (l33 = $1(l33, s80))
                return !1;
            };
        case e1.Parent:
            return function(u68) {
                return s80.getChildren(u68).some((l34)=>s80.isTag(l34) && e152(l34));
            };
        case e1.Child:
            return function(u69) {
                let l35 = s80.getParent(u69);
                return l35 != null && s80.isTag(l35) && e152(l35);
            };
        case e1.Sibling:
            return function(u70) {
                let l36 = s80.getSiblings(u70);
                for(let c54 = 0; c54 < l36.length; c54++){
                    let f17 = l36[c54];
                    if (o45(u70, f17)) break;
                    if (s80.isTag(f17) && e152(f17)) return !0;
                }
                return !1;
            };
        case e1.Adjacent:
            return s80.prevElementSibling ? function(u71) {
                let l37 = s80.prevElementSibling(u71);
                return l37 != null && e152(l37);
            } : function(u72) {
                let l38 = s80.getSiblings(u72), c55;
                for(let f18 = 0; f18 < l38.length; f18++){
                    let v14 = l38[f18];
                    if (o45(u72, v14)) break;
                    s80.isTag(v14) && (c55 = v14);
                }
                return !!c55 && e152(c55);
            };
        case e1.Universal:
            {
                if (t215.namespace != null && t215.namespace !== "*") throw new Error("Namespaced universal selectors are not yet supported by css-select");
                return e152;
            }
    }
}
function U5(e153, t216, n136) {
    let r111 = P2(e153, t216, n136);
    return q4(r111, t216.adapter);
}
function P2(e154, t217, n137) {
    let r112 = typeof e154 == "string" ? G3(e154) : e154;
    return x7(r112, t217, n137);
}
function X2(e155) {
    return e155.type === e1.Pseudo && (e155.name === "scope" || Array.isArray(e155.data) && e155.data.some((t218)=>t218.some(X2)));
}
var oe1 = {
    type: e1.Descendant
}, ue1 = {
    type: "_flexibleDescendant"
}, ae1 = {
    type: e1.Pseudo,
    name: "scope",
    data: null
};
function le1(e156, { adapter: t219  }, n138) {
    let r113 = !!n138?.every((i103)=>{
        let s81 = t219.isTag(i103) && t219.getParent(i103);
        return i103 === V3 || s81 && t219.isTag(s81);
    });
    for (let i111 of e156){
        if (!(i111.length > 0 && A7(i111[0]) && i111[0].type !== e1.Descendant)) if (r113 && !i111.some(X2)) i111.unshift(oe1);
        else continue;
        i111.unshift(ae1);
    }
}
function x7(e157, t220, n139) {
    var r114;
    e157.forEach(_4), n139 = (r114 = t220.context) !== null && r114 !== void 0 ? r114 : n139;
    let i104 = Array.isArray(n139), s82 = n139 && (Array.isArray(n139) ? n139 : [
        n139
    ]);
    if (t220.relativeSelector !== !1) le1(e157, t220, s82);
    else if (e157.some((u73)=>u73.length > 0 && A7(u73[0]))) throw new Error("Relative selectors are not allowed when the `relativeSelector` option is disabled");
    let o46 = !1, a73 = e157.map((u74)=>{
        if (u74.length >= 2) {
            let [l39, c56] = u74;
            l39.type !== e1.Pseudo || l39.name !== "scope" || (i104 && c56.type === e1.Descendant ? u74[1] = ue1 : (c56.type === e1.Adjacent || c56.type === e1.Sibling) && (o46 = !0));
        }
        return ce1(u74, t220, s82);
    }).reduce(fe, v6.falseFunc);
    return a73.shouldTestNextSiblings = o46, a73;
}
function ce1(e158, t221, n140) {
    var r115;
    return e158.reduce((i105, s83)=>i105 === v6.falseFunc ? v6.falseFunc : G4(i105, s83, t221, n140, x7), (r115 = t221.rootFunc) !== null && r115 !== void 0 ? r115 : v6.trueFunc);
}
function fe(e159, t222) {
    return t222 === v6.falseFunc || e159 === v6.trueFunc ? e159 : e159 === v6.falseFunc || t222 === v6.trueFunc ? t222 : function(r116) {
        return e159(r116) || t222(r116);
    };
}
var Y2 = (e160, t223)=>e160 === t223, ge1 = {
    adapter: mod10,
    equals: Y2
};
function I4(e161) {
    var t224, n141, r117, i106;
    let s84 = e161 ?? ge1;
    return (t224 = s84.adapter) !== null && t224 !== void 0 || (s84.adapter = mod10), (n141 = s84.equals) !== null && n141 !== void 0 || (s84.equals = (i106 = (r117 = s84.adapter) === null || r117 === void 0 ? void 0 : r117.equals) !== null && i106 !== void 0 ? i106 : Y2), s84;
}
function j3(e162) {
    return function(n142, r118, i107) {
        let s85 = I4(r118);
        return e162(n142, s85, i107);
    };
}
var Be = j3(U5), Ge = j3(P2), Xe = j3(x7);
function Z3(e163) {
    return function(n143, r119, i108) {
        let s86 = I4(i108);
        typeof n143 != "function" && (n143 = P2(n143, s86, r119));
        let o47 = pe(r119, s86.adapter, n143.shouldTestNextSiblings);
        return e163(n143, o47, s86);
    };
}
function pe(e164, t225, n144 = !1) {
    return n144 && (e164 = de1(e164, t225)), Array.isArray(e164) ? t225.removeSubsets(e164) : t225.getChildren(e164);
}
function de1(e165, t226) {
    let n145 = Array.isArray(e165) ? e165.slice(0) : [
        e165
    ], r120 = n145.length;
    for(let i109 = 0; i109 < r120; i109++){
        let s87 = M3(n145[i109], t226);
        n145.push(...s87);
    }
    return n145;
}
Z3((e166, t227, n146)=>e166 === v6.falseFunc || !t227 || t227.length === 0 ? [] : n146.adapter.findAll(e166, t227)), Z3((e167, t228, n147)=>e167 === v6.falseFunc || !t228 || t228.length === 0 ? null : n147.adapter.findOne(e167, t228));
function Qe(e168, t229, n148) {
    let r121 = I4(n148);
    return (typeof t229 == "function" ? t229 : U5(t229, r121))(e168);
}
var a4 = (e169)=>e169.replace(/(([A-Z0-9])([A-Z0-9][a-z]))|(([a-z0-9]+)([A-Z]))/g, "$2$5-$3$6").toLowerCase();
var Qe1 = Object.create;
var pe1 = Object.defineProperty;
var et1 = Object.getOwnPropertyDescriptor;
var tt1 = Object.getOwnPropertyNames;
var rt = Object.getPrototypeOf, St = Object.prototype.hasOwnProperty;
var c5 = (r122, e170)=>()=>(e170 || r122((e170 = {
            exports: {}
        }).exports, e170), e170.exports), st1 = (r123, e171)=>{
    for(var t230 in e171)pe1(r123, t230, {
        get: e171[t230],
        enumerable: !0
    });
}, ae2 = (r124, e172, t231, S7)=>{
    if (e172 && typeof e172 == "object" || typeof e172 == "function") for (let i112 of tt1(e172))!St.call(r124, i112) && i112 !== t231 && pe1(r124, i112, {
        get: ()=>e172[i112],
        enumerable: !(S7 = et1(e172, i112)) || S7.enumerable
    });
    return r124;
}, F5 = (r125, e173, t232)=>(ae2(r125, e173, "default"), t232 && ae2(t232, e173, "default")), Ee = (r126, e174, t233)=>(t233 = r126 != null ? Qe1(rt(r126)) : {}, ae2(e174 || !r126 || !r126.__esModule ? pe1(t233, "default", {
        value: r126,
        enumerable: !0
    }) : t233, r126));
var ce2 = c5((Oe1)=>{
    var we1 = {};
    we1.StyleSheet = function() {
        this.parentStyleSheet = null;
    };
    Oe1.StyleSheet = we1.StyleSheet;
});
var y5 = c5((qe1)=>{
    var C6 = {};
    C6.CSSRule = function() {
        this.parentRule = null, this.parentStyleSheet = null;
    };
    C6.CSSRule.UNKNOWN_RULE = 0;
    C6.CSSRule.STYLE_RULE = 1;
    C6.CSSRule.CHARSET_RULE = 2;
    C6.CSSRule.IMPORT_RULE = 3;
    C6.CSSRule.MEDIA_RULE = 4;
    C6.CSSRule.FONT_FACE_RULE = 5;
    C6.CSSRule.PAGE_RULE = 6;
    C6.CSSRule.KEYFRAMES_RULE = 7;
    C6.CSSRule.KEYFRAME_RULE = 8;
    C6.CSSRule.MARGIN_RULE = 9;
    C6.CSSRule.NAMESPACE_RULE = 10;
    C6.CSSRule.COUNTER_STYLE_RULE = 11;
    C6.CSSRule.SUPPORTS_RULE = 12;
    C6.CSSRule.DOCUMENT_RULE = 13;
    C6.CSSRule.FONT_FEATURE_VALUES_RULE = 14;
    C6.CSSRule.VIEWPORT_RULE = 15;
    C6.CSSRule.REGION_STYLE_RULE = 16;
    C6.CSSRule.prototype = {
        constructor: C6.CSSRule
    };
    qe1.CSSRule = C6.CSSRule;
});
var B5 = c5((Te1)=>{
    var m8 = {
        CSSStyleDeclaration: I5().CSSStyleDeclaration,
        CSSRule: y5().CSSRule
    };
    m8.CSSStyleRule = function() {
        m8.CSSRule.call(this), this.selectorText = "", this.style = new m8.CSSStyleDeclaration, this.style.parentRule = this;
    };
    m8.CSSStyleRule.prototype = new m8.CSSRule;
    m8.CSSStyleRule.prototype.constructor = m8.CSSStyleRule;
    m8.CSSStyleRule.prototype.type = 1;
    Object.defineProperty(m8.CSSStyleRule.prototype, "cssText", {
        get: function() {
            var r127;
            return this.selectorText ? r127 = this.selectorText + " {" + this.style.cssText + "}" : r127 = "", r127;
        },
        set: function(r128) {
            var e175 = m8.CSSStyleRule.parse(r128);
            this.style = e175.style, this.selectorText = e175.selectorText;
        }
    });
    m8.CSSStyleRule.parse = function(r129) {
        for(var e176 = 0, t234 = "selector", S8, i113 = e176, s88 = "", l40 = {
            selector: !0,
            value: !0
        }, p12 = new m8.CSSStyleRule, n149, a74 = "", u75; u75 = r129.charAt(e176); e176++)switch(u75){
            case " ":
            case "	":
            case "\r":
            case `
`:
            case "\f":
                if (l40[t234]) switch(r129.charAt(e176 - 1)){
                    case " ":
                    case "	":
                    case "\r":
                    case `
`:
                    case "\f":
                        break;
                    default:
                        s88 += " ";
                        break;
                }
                break;
            case '"':
                if (i113 = e176 + 1, S8 = r129.indexOf('"', i113) + 1, !S8) throw '" is missing';
                s88 += r129.slice(e176, S8), e176 = S8 - 1;
                break;
            case "'":
                if (i113 = e176 + 1, S8 = r129.indexOf("'", i113) + 1, !S8) throw "' is missing";
                s88 += r129.slice(e176, S8), e176 = S8 - 1;
                break;
            case "/":
                if (r129.charAt(e176 + 1) === "*") {
                    if (e176 += 2, S8 = r129.indexOf("*/", e176), S8 === -1) throw new SyntaxError("Missing */");
                    e176 = S8 + 1;
                } else s88 += u75;
                break;
            case "{":
                t234 === "selector" && (p12.selectorText = s88.trim(), s88 = "", t234 = "name");
                break;
            case ":":
                t234 === "name" ? (n149 = s88.trim(), s88 = "", t234 = "value") : s88 += u75;
                break;
            case "!":
                t234 === "value" && r129.indexOf("!important", e176) === e176 ? (a74 = "important", e176 += 9) : s88 += u75;
                break;
            case ";":
                t234 === "value" ? (p12.style.setProperty(n149, s88.trim(), a74), a74 = "", s88 = "", t234 = "name") : s88 += u75;
                break;
            case "}":
                if (t234 === "value") p12.style.setProperty(n149, s88.trim(), a74), a74 = "", s88 = "";
                else {
                    if (t234 === "name") break;
                    s88 += u75;
                }
                t234 = "selector";
                break;
            default:
                s88 += u75;
                break;
        }
        return p12;
    };
    Te1.CSSStyleRule = m8.CSSStyleRule;
});
var Y3 = c5((ke1)=>{
    var d22 = {
        StyleSheet: ce2().StyleSheet,
        CSSStyleRule: B5().CSSStyleRule
    };
    d22.CSSStyleSheet = function() {
        d22.StyleSheet.call(this), this.cssRules = [];
    };
    d22.CSSStyleSheet.prototype = new d22.StyleSheet;
    d22.CSSStyleSheet.prototype.constructor = d22.CSSStyleSheet;
    d22.CSSStyleSheet.prototype.insertRule = function(r130, e177) {
        if (e177 < 0 || e177 > this.cssRules.length) throw new RangeError("INDEX_SIZE_ERR");
        var t235 = d22.parse(r130).cssRules[0];
        return t235.parentStyleSheet = this, this.cssRules.splice(e177, 0, t235), e177;
    };
    d22.CSSStyleSheet.prototype.deleteRule = function(r131) {
        if (r131 < 0 || r131 >= this.cssRules.length) throw new RangeError("INDEX_SIZE_ERR");
        this.cssRules.splice(r131, 1);
    };
    d22.CSSStyleSheet.prototype.toString = function() {
        for(var r132 = "", e178 = this.cssRules, t236 = 0; t236 < e178.length; t236++)r132 += e178[t236].cssText + `
`;
        return r132;
    };
    ke1.CSSStyleSheet = d22.CSSStyleSheet;
    d22.parse = Q3().parse;
});
var te2 = c5((Le1)=>{
    var ee3 = {};
    ee3.MediaList = function() {
        this.length = 0;
    };
    ee3.MediaList.prototype = {
        constructor: ee3.MediaList,
        get mediaText () {
            return Array.prototype.join.call(this, ", ");
        },
        set mediaText (r){
            for(var e179 = r.split(","), t237 = this.length = e179.length, S9 = 0; S9 < t237; S9++)this[S9] = e179[S9].trim();
        },
        appendMedium: function(r) {
            Array.prototype.indexOf.call(this, r) === -1 && (this[this.length] = r, this.length++);
        },
        deleteMedium: function(r) {
            var e180 = Array.prototype.indexOf.call(this, r);
            e180 !== -1 && Array.prototype.splice.call(this, e180, 1);
        }
    };
    Le1.MediaList = ee3.MediaList;
});
var Re = c5((De1)=>{
    var v15 = {
        CSSRule: y5().CSSRule,
        CSSStyleSheet: Y3().CSSStyleSheet,
        MediaList: te2().MediaList
    };
    v15.CSSImportRule = function() {
        v15.CSSRule.call(this), this.href = "", this.media = new v15.MediaList, this.styleSheet = new v15.CSSStyleSheet;
    };
    v15.CSSImportRule.prototype = new v15.CSSRule;
    v15.CSSImportRule.prototype.constructor = v15.CSSImportRule;
    v15.CSSImportRule.prototype.type = 3;
    Object.defineProperty(v15.CSSImportRule.prototype, "cssText", {
        get: function() {
            var r = this.media.mediaText;
            return "@import url(" + this.href + ")" + (r ? " " + r : "") + ";";
        },
        set: function(r) {
            for(var e181 = 0, t238 = "", S10 = "", i114, s89; s89 = r.charAt(e181); e181++)switch(s89){
                case " ":
                case "	":
                case "\r":
                case `
`:
                case "\f":
                    t238 === "after-import" ? t238 = "url" : S10 += s89;
                    break;
                case "@":
                    !t238 && r.indexOf("@import", e181) === e181 && (t238 = "after-import", e181 += 6, S10 = "");
                    break;
                case "u":
                    if (t238 === "url" && r.indexOf("url(", e181) === e181) {
                        if (i114 = r.indexOf(")", e181 + 1), i114 === -1) throw e181 + ': ")" not found';
                        e181 += 4;
                        var l41 = r.slice(e181, i114);
                        l41[0] === l41[l41.length - 1] && (l41[0] === '"' || l41[0] === "'") && (l41 = l41.slice(1, -1)), this.href = l41, e181 = i114, t238 = "media";
                    }
                    break;
                case '"':
                    if (t238 === "url") {
                        if (i114 = r.indexOf('"', e181 + 1), !i114) throw e181 + `: '"' not found`;
                        this.href = r.slice(e181 + 1, i114), e181 = i114, t238 = "media";
                    }
                    break;
                case "'":
                    if (t238 === "url") {
                        if (i114 = r.indexOf("'", e181 + 1), !i114) throw e181 + `: "'" not found`;
                        this.href = r.slice(e181 + 1, i114), e181 = i114, t238 = "media";
                    }
                    break;
                case ";":
                    t238 === "media" && S10 && (this.media.mediaText = S10.trim());
                    break;
                default:
                    t238 === "media" && (S10 += s89);
                    break;
            }
        }
    });
    De1.CSSImportRule = v15.CSSImportRule;
});
var V4 = c5((Pe1)=>{
    var b13 = {
        CSSRule: y5().CSSRule
    };
    b13.CSSGroupingRule = function() {
        b13.CSSRule.call(this), this.cssRules = [];
    };
    b13.CSSGroupingRule.prototype = new b13.CSSRule;
    b13.CSSGroupingRule.prototype.constructor = b13.CSSGroupingRule;
    b13.CSSGroupingRule.prototype.insertRule = function(e182, t239) {
        if (t239 < 0 || t239 > this.cssRules.length) throw new RangeError("INDEX_SIZE_ERR");
        var S11 = b13.parse(e182).cssRules[0];
        return S11.parentRule = this, this.cssRules.splice(t239, 0, S11), t239;
    };
    b13.CSSGroupingRule.prototype.deleteRule = function(e183) {
        if (e183 < 0 || e183 >= this.cssRules.length) throw new RangeError("INDEX_SIZE_ERR");
        this.cssRules.splice(e183, 1)[0].parentRule = null;
    };
    Pe1.CSSGroupingRule = b13.CSSGroupingRule;
});
var K3 = c5((Fe1)=>{
    var O4 = {
        CSSRule: y5().CSSRule,
        CSSGroupingRule: V4().CSSGroupingRule
    };
    O4.CSSConditionRule = function() {
        O4.CSSGroupingRule.call(this), this.cssRules = [];
    };
    O4.CSSConditionRule.prototype = new O4.CSSGroupingRule;
    O4.CSSConditionRule.prototype.constructor = O4.CSSConditionRule;
    O4.CSSConditionRule.prototype.conditionText = "";
    O4.CSSConditionRule.prototype.cssText = "";
    Fe1.CSSConditionRule = O4.CSSConditionRule;
});
var re2 = c5((Ie1)=>{
    var _7 = {
        CSSRule: y5().CSSRule,
        CSSGroupingRule: V4().CSSGroupingRule,
        CSSConditionRule: K3().CSSConditionRule,
        MediaList: te2().MediaList
    };
    _7.CSSMediaRule = function() {
        _7.CSSConditionRule.call(this), this.media = new _7.MediaList;
    };
    _7.CSSMediaRule.prototype = new _7.CSSConditionRule;
    _7.CSSMediaRule.prototype.constructor = _7.CSSMediaRule;
    _7.CSSMediaRule.prototype.type = 4;
    Object.defineProperties(_7.CSSMediaRule.prototype, {
        conditionText: {
            get: function() {
                return this.media.mediaText;
            },
            set: function(r) {
                this.media.mediaText = r;
            },
            configurable: !0,
            enumerable: !0
        },
        cssText: {
            get: function() {
                for(var r = [], e184 = 0, t240 = this.cssRules.length; e184 < t240; e184++)r.push(this.cssRules[e184].cssText);
                return "@media " + this.media.mediaText + " {" + r.join("") + "}";
            },
            configurable: !0,
            enumerable: !0
        }
    });
    Ie1.CSSMediaRule = _7.CSSMediaRule;
});
var Se = c5((Ve1)=>{
    var q7 = {
        CSSRule: y5().CSSRule,
        CSSGroupingRule: V4().CSSGroupingRule,
        CSSConditionRule: K3().CSSConditionRule
    };
    q7.CSSSupportsRule = function() {
        q7.CSSConditionRule.call(this);
    };
    q7.CSSSupportsRule.prototype = new q7.CSSConditionRule;
    q7.CSSSupportsRule.prototype.constructor = q7.CSSSupportsRule;
    q7.CSSSupportsRule.prototype.type = 12;
    Object.defineProperty(q7.CSSSupportsRule.prototype, "cssText", {
        get: function() {
            for(var r = [], e185 = 0, t241 = this.cssRules.length; e185 < t241; e185++)r.push(this.cssRules[e185].cssText);
            return "@supports " + this.conditionText + " {" + r.join("") + "}";
        }
    });
    Ve1.CSSSupportsRule = q7.CSSSupportsRule;
});
var Ce = c5((Ae1)=>{
    var M6 = {
        CSSStyleDeclaration: I5().CSSStyleDeclaration,
        CSSRule: y5().CSSRule
    };
    M6.CSSFontFaceRule = function() {
        M6.CSSRule.call(this), this.style = new M6.CSSStyleDeclaration, this.style.parentRule = this;
    };
    M6.CSSFontFaceRule.prototype = new M6.CSSRule;
    M6.CSSFontFaceRule.prototype.constructor = M6.CSSFontFaceRule;
    M6.CSSFontFaceRule.prototype.type = 5;
    Object.defineProperty(M6.CSSFontFaceRule.prototype, "cssText", {
        get: function() {
            return "@font-face {" + this.style.cssText + "}";
        }
    });
    Ae1.CSSFontFaceRule = M6.CSSFontFaceRule;
});
var fe1 = c5((Ke1)=>{
    var T9 = {
        CSSRule: y5().CSSRule
    };
    T9.CSSHostRule = function() {
        T9.CSSRule.call(this), this.cssRules = [];
    };
    T9.CSSHostRule.prototype = new T9.CSSRule;
    T9.CSSHostRule.prototype.constructor = T9.CSSHostRule;
    T9.CSSHostRule.prototype.type = 1001;
    Object.defineProperty(T9.CSSHostRule.prototype, "cssText", {
        get: function() {
            for(var r = [], e186 = 0, t242 = this.cssRules.length; e186 < t242; e186++)r.push(this.cssRules[e186].cssText);
            return "@host {" + r.join("") + "}";
        }
    });
    Ke1.CSSHostRule = T9.CSSHostRule;
});
var se1 = c5((Ge2)=>{
    var E9 = {
        CSSRule: y5().CSSRule,
        CSSStyleDeclaration: I5().CSSStyleDeclaration
    };
    E9.CSSKeyframeRule = function() {
        E9.CSSRule.call(this), this.keyText = "", this.style = new E9.CSSStyleDeclaration, this.style.parentRule = this;
    };
    E9.CSSKeyframeRule.prototype = new E9.CSSRule;
    E9.CSSKeyframeRule.prototype.constructor = E9.CSSKeyframeRule;
    E9.CSSKeyframeRule.prototype.type = 8;
    Object.defineProperty(E9.CSSKeyframeRule.prototype, "cssText", {
        get: function() {
            return this.keyText + " {" + this.style.cssText + "} ";
        }
    });
    Ge2.CSSKeyframeRule = E9.CSSKeyframeRule;
});
var ie1 = c5((Ue1)=>{
    var k6 = {
        CSSRule: y5().CSSRule
    };
    k6.CSSKeyframesRule = function() {
        k6.CSSRule.call(this), this.name = "", this.cssRules = [];
    };
    k6.CSSKeyframesRule.prototype = new k6.CSSRule;
    k6.CSSKeyframesRule.prototype.constructor = k6.CSSKeyframesRule;
    k6.CSSKeyframesRule.prototype.type = 7;
    Object.defineProperty(k6.CSSKeyframesRule.prototype, "cssText", {
        get: function() {
            for(var r = [], e187 = 0, t243 = this.cssRules.length; e187 < t243; e187++)r.push("  " + this.cssRules[e187].cssText);
            return "@" + (this._vendorPrefix || "") + "keyframes " + this.name + ` { 
` + r.join(`
`) + `
}`;
        }
    });
    Ue1.CSSKeyframesRule = k6.CSSKeyframesRule;
});
var he = c5(($e1)=>{
    var le3 = {};
    le3.CSSValue = function() {};
    le3.CSSValue.prototype = {
        constructor: le3.CSSValue,
        set cssText (r){
            var e188 = this._getConstructorName();
            throw new Error('DOMException: property "cssText" of "' + e188 + '" is readonly and can not be replaced with "' + r + '"!');
        },
        get cssText () {
            var r134 = this._getConstructorName();
            throw new Error('getter "cssText" of "' + r134 + '" is not implemented!');
        },
        _getConstructorName: function() {
            var r = this.constructor.toString(), e189 = r.match(/function\s([^\(]+)/), t244 = e189[1];
            return t244;
        }
    };
    $e1.CSSValue = le3.CSSValue;
});
var ye = c5((Ne1)=>{
    var x12 = {
        CSSValue: he().CSSValue
    };
    x12.CSSValueExpression = function(e190, t245) {
        this._token = e190, this._idx = t245;
    };
    x12.CSSValueExpression.prototype = new x12.CSSValue;
    x12.CSSValueExpression.prototype.constructor = x12.CSSValueExpression;
    x12.CSSValueExpression.prototype.parse = function() {
        for(var r = this._token, e191 = this._idx, t246 = "", S12 = "", i115 = "", s90, l42 = [];; ++e191){
            if (t246 = r.charAt(e191), t246 === "") {
                i115 = "css expression error: unfinished expression!";
                break;
            }
            switch(t246){
                case "(":
                    l42.push(t246), S12 += t246;
                    break;
                case ")":
                    l42.pop(t246), S12 += t246;
                    break;
                case "/":
                    (s90 = this._parseJSComment(r, e191)) ? s90.error ? i115 = "css expression error: unfinished comment in expression!" : e191 = s90.idx : (s90 = this._parseJSRexExp(r, e191)) ? (e191 = s90.idx, S12 += s90.text) : S12 += t246;
                    break;
                case "'":
                case '"':
                    s90 = this._parseJSString(r, e191, t246), s90 ? (e191 = s90.idx, S12 += s90.text) : S12 += t246;
                    break;
                default:
                    S12 += t246;
                    break;
            }
            if (i115 || l42.length === 0) break;
        }
        var p13;
        return i115 ? p13 = {
            error: i115
        } : p13 = {
            idx: e191,
            expression: S12
        }, p13;
    };
    x12.CSSValueExpression.prototype._parseJSComment = function(r, e192) {
        var t247 = r.charAt(e192 + 1), S13;
        if (t247 === "/" || t247 === "*") {
            var i116 = e192, s91, l43;
            if (t247 === "/" ? l43 = `
` : t247 === "*" && (l43 = "*/"), s91 = r.indexOf(l43, i116 + 1 + 1), s91 !== -1) return s91 = s91 + l43.length - 1, S13 = r.substring(e192, s91 + 1), {
                idx: s91,
                text: S13
            };
            var p14 = "css expression error: unfinished comment in expression!";
            return {
                error: p14
            };
        } else return !1;
    };
    x12.CSSValueExpression.prototype._parseJSString = function(r, e193, t248) {
        var S14 = this._findMatchedIdx(r, e193, t248), i117;
        return S14 === -1 ? !1 : (i117 = r.substring(e193, S14 + t248.length), {
            idx: S14,
            text: i117
        });
    };
    x12.CSSValueExpression.prototype._parseJSRexExp = function(r, e194) {
        var t249 = r.substring(0, e194).replace(/\s+$/, ""), S15 = [
            /^$/,
            /\($/,
            /\[$/,
            /\!$/,
            /\+$/,
            /\-$/,
            /\*$/,
            /\/\s+/,
            /\%$/,
            /\=$/,
            /\>$/,
            /<$/,
            /\&$/,
            /\|$/,
            /\^$/,
            /\~$/,
            /\?$/,
            /\,$/,
            /delete$/,
            /in$/,
            /instanceof$/,
            /new$/,
            /typeof$/,
            /void$/
        ], i118 = S15.some(function(l44) {
            return l44.test(t249);
        });
        if (i118) {
            var s92 = "/";
            return this._parseJSString(r, e194, s92);
        } else return !1;
    };
    x12.CSSValueExpression.prototype._findMatchedIdx = function(r, e195, t250) {
        for(var S16 = e195, i119, s93 = -1;;)if (i119 = r.indexOf(t250, S16 + 1), i119 === -1) {
            i119 = s93;
            break;
        } else {
            var l45 = r.substring(e195 + 1, i119), p15 = l45.match(/\\+$/);
            if (!p15 || p15[0] % 2 === 0) break;
            S16 = i119;
        }
        var n150 = r.indexOf(`
`, e195 + 1);
        return n150 < i119 && (i119 = s93), i119;
    };
    Ne1.CSSValueExpression = x12.CSSValueExpression;
});
var me1 = c5((He1)=>{
    var ue3 = {};
    ue3.MatcherList = function() {
        this.length = 0;
    };
    ue3.MatcherList.prototype = {
        constructor: ue3.MatcherList,
        get matcherText () {
            return Array.prototype.join.call(this, ", ");
        },
        set matcherText (r){
            for(var e196 = r.split(","), t251 = this.length = e196.length, S17 = 0; S17 < t251; S17++)this[S17] = e196[S17].trim();
        },
        appendMatcher: function(r) {
            Array.prototype.indexOf.call(this, r) === -1 && (this[this.length] = r, this.length++);
        },
        deleteMatcher: function(r) {
            var e197 = Array.prototype.indexOf.call(this, r);
            e197 !== -1 && Array.prototype.splice.call(this, e197, 1);
        }
    };
    He1.MatcherList = ue3.MatcherList;
});
var de2 = c5((je1)=>{
    var w8 = {
        CSSRule: y5().CSSRule,
        MatcherList: me1().MatcherList
    };
    w8.CSSDocumentRule = function() {
        w8.CSSRule.call(this), this.matcher = new w8.MatcherList, this.cssRules = [];
    };
    w8.CSSDocumentRule.prototype = new w8.CSSRule;
    w8.CSSDocumentRule.prototype.constructor = w8.CSSDocumentRule;
    w8.CSSDocumentRule.prototype.type = 10;
    Object.defineProperty(w8.CSSDocumentRule.prototype, "cssText", {
        get: function() {
            for(var r = [], e198 = 0, t252 = this.cssRules.length; e198 < t252; e198++)r.push(this.cssRules[e198].cssText);
            return "@-moz-document " + this.matcher.matcherText + " {" + r.join("") + "}";
        }
    });
    je1.CSSDocumentRule = w8.CSSDocumentRule;
});
var Q3 = c5((Je1)=>{
    var o48 = {};
    o48.parse = function(e199) {
        for(var t253 = 0, S18 = "before-selector", i120, s94 = "", l46 = 0, p16 = {
            selector: !0,
            value: !0,
            "value-parenthesis": !0,
            atRule: !0,
            "importRule-begin": !0,
            importRule: !0,
            atBlock: !0,
            conditionBlock: !0,
            "documentRule-begin": !0
        }, n151 = new o48.CSSStyleSheet, a75 = n151, u76, g9 = [], L7 = !1, ve1, ne3, U7 = "", f19, $5, N7, H7, j14, P6, A10, W3, xe1 = /@(-(?:\w+-)+)?keyframes/g, J5 = function(ze1) {
            var be1 = e199.substring(0, t253).split(`
`), _e1 = be1.length, Me1 = be1.pop().length + 1, z7 = new Error(ze1 + " (line " + _e1 + ", char " + Me1 + ")");
            throw z7.line = _e1, z7.char = Me1, z7.styleSheet = n151, z7;
        }, h16; h16 = e199.charAt(t253); t253++)switch(h16){
            case " ":
            case "	":
            case "\r":
            case `
`:
            case "\f":
                p16[S18] && (s94 += h16);
                break;
            case '"':
                i120 = t253 + 1;
                do i120 = e199.indexOf('"', i120) + 1, i120 || J5('Unmatched "');
                while (e199[i120 - 2] === "\\")
                switch(s94 += e199.slice(t253, i120), t253 = i120 - 1, S18){
                    case "before-value":
                        S18 = "value";
                        break;
                    case "importRule-begin":
                        S18 = "importRule";
                        break;
                }
                break;
            case "'":
                i120 = t253 + 1;
                do i120 = e199.indexOf("'", i120) + 1, i120 || J5("Unmatched '");
                while (e199[i120 - 2] === "\\")
                switch(s94 += e199.slice(t253, i120), t253 = i120 - 1, S18){
                    case "before-value":
                        S18 = "value";
                        break;
                    case "importRule-begin":
                        S18 = "importRule";
                        break;
                }
                break;
            case "/":
                e199.charAt(t253 + 1) === "*" ? (t253 += 2, i120 = e199.indexOf("*/", t253), i120 === -1 ? J5("Missing */") : t253 = i120 + 1) : s94 += h16, S18 === "importRule-begin" && (s94 += " ", S18 = "importRule");
                break;
            case "@":
                if (e199.indexOf("@-moz-document", t253) === t253) {
                    S18 = "documentRule-begin", A10 = new o48.CSSDocumentRule, A10.__starts = t253, t253 += 13, s94 = "";
                    break;
                } else if (e199.indexOf("@media", t253) === t253) {
                    S18 = "atBlock", $5 = new o48.CSSMediaRule, $5.__starts = t253, t253 += 5, s94 = "";
                    break;
                } else if (e199.indexOf("@supports", t253) === t253) {
                    S18 = "conditionBlock", N7 = new o48.CSSSupportsRule, N7.__starts = t253, t253 += 8, s94 = "";
                    break;
                } else if (e199.indexOf("@host", t253) === t253) {
                    S18 = "hostRule-begin", t253 += 4, W3 = new o48.CSSHostRule, W3.__starts = t253, s94 = "";
                    break;
                } else if (e199.indexOf("@import", t253) === t253) {
                    S18 = "importRule-begin", t253 += 6, s94 += "@import";
                    break;
                } else if (e199.indexOf("@font-face", t253) === t253) {
                    S18 = "fontFaceRule-begin", t253 += 9, j14 = new o48.CSSFontFaceRule, j14.__starts = t253, s94 = "";
                    break;
                } else {
                    xe1.lastIndex = t253;
                    var X4 = xe1.exec(e199);
                    if (X4 && X4.index === t253) {
                        S18 = "keyframesRule-begin", P6 = new o48.CSSKeyframesRule, P6.__starts = t253, P6._vendorPrefix = X4[1], t253 += X4[0].length - 1, s94 = "";
                        break;
                    } else S18 === "selector" && (S18 = "atRule");
                }
                s94 += h16;
                break;
            case "{":
                S18 === "selector" || S18 === "atRule" ? (f19.selectorText = s94.trim(), f19.style.__starts = t253, s94 = "", S18 = "before-name") : S18 === "atBlock" ? ($5.media.mediaText = s94.trim(), u76 && g9.push(u76), a75 = u76 = $5, $5.parentStyleSheet = n151, s94 = "", S18 = "before-selector") : S18 === "conditionBlock" ? (N7.conditionText = s94.trim(), u76 && g9.push(u76), a75 = u76 = N7, N7.parentStyleSheet = n151, s94 = "", S18 = "before-selector") : S18 === "hostRule-begin" ? (u76 && g9.push(u76), a75 = u76 = W3, W3.parentStyleSheet = n151, s94 = "", S18 = "before-selector") : S18 === "fontFaceRule-begin" ? (u76 && (j14.parentRule = u76), j14.parentStyleSheet = n151, f19 = j14, s94 = "", S18 = "before-name") : S18 === "keyframesRule-begin" ? (P6.name = s94.trim(), u76 && (g9.push(u76), P6.parentRule = u76), P6.parentStyleSheet = n151, a75 = u76 = P6, s94 = "", S18 = "keyframeRule-begin") : S18 === "keyframeRule-begin" ? (f19 = new o48.CSSKeyframeRule, f19.keyText = s94.trim(), f19.__starts = t253, s94 = "", S18 = "before-name") : S18 === "documentRule-begin" && (A10.matcher.matcherText = s94.trim(), u76 && (g9.push(u76), A10.parentRule = u76), a75 = u76 = A10, A10.parentStyleSheet = n151, s94 = "", S18 = "before-selector");
                break;
            case ":":
                S18 === "name" ? (ne3 = s94.trim(), s94 = "", S18 = "before-value") : s94 += h16;
                break;
            case "(":
                if (S18 === "value") if (s94.trim() === "expression") {
                    var Z5 = new o48.CSSValueExpression(e199, t253).parse();
                    Z5.error ? J5(Z5.error) : (s94 += Z5.expression, t253 = Z5.idx);
                } else S18 = "value-parenthesis", l46 = 1, s94 += h16;
                else S18 === "value-parenthesis" && l46++, s94 += h16;
                break;
            case ")":
                S18 === "value-parenthesis" && (l46--, l46 === 0 && (S18 = "value")), s94 += h16;
                break;
            case "!":
                S18 === "value" && e199.indexOf("!important", t253) === t253 ? (U7 = "important", t253 += 9) : s94 += h16;
                break;
            case ";":
                switch(S18){
                    case "value":
                        f19.style.setProperty(ne3, s94.trim(), U7), U7 = "", s94 = "", S18 = "before-name";
                        break;
                    case "atRule":
                        s94 = "", S18 = "before-selector";
                        break;
                    case "importRule":
                        H7 = new o48.CSSImportRule, H7.parentStyleSheet = H7.styleSheet.parentStyleSheet = n151, H7.cssText = s94 + h16, n151.cssRules.push(H7), s94 = "", S18 = "before-selector";
                        break;
                    default:
                        s94 += h16;
                        break;
                }
                break;
            case "}":
                switch(S18){
                    case "value":
                        f19.style.setProperty(ne3, s94.trim(), U7), U7 = "";
                    case "before-name":
                    case "name":
                        f19.__ends = t253 + 1, u76 && (f19.parentRule = u76), f19.parentStyleSheet = n151, a75.cssRules.push(f19), s94 = "", a75.constructor === o48.CSSKeyframesRule ? S18 = "keyframeRule-begin" : S18 = "before-selector";
                        break;
                    case "keyframeRule-begin":
                    case "before-selector":
                    case "selector":
                        for(u76 || J5("Unexpected }"), L7 = g9.length > 0; g9.length > 0;){
                            if (u76 = g9.pop(), u76.constructor.name === "CSSMediaRule" || u76.constructor.name === "CSSSupportsRule") {
                                ve1 = a75, a75 = u76, a75.cssRules.push(ve1);
                                break;
                            }
                            g9.length === 0 && (L7 = !1);
                        }
                        L7 || (a75.__ends = t253 + 1, n151.cssRules.push(a75), a75 = n151, u76 = null), s94 = "", S18 = "before-selector";
                        break;
                }
                break;
            default:
                switch(S18){
                    case "before-selector":
                        S18 = "selector", f19 = new o48.CSSStyleRule, f19.__starts = t253;
                        break;
                    case "before-name":
                        S18 = "name";
                        break;
                    case "before-value":
                        S18 = "value";
                        break;
                    case "importRule-begin":
                        S18 = "importRule";
                        break;
                }
                s94 += h16;
                break;
        }
        return n151;
    };
    Je1.parse = o48.parse;
    o48.CSSStyleSheet = Y3().CSSStyleSheet;
    o48.CSSStyleRule = B5().CSSStyleRule;
    o48.CSSImportRule = Re().CSSImportRule;
    o48.CSSGroupingRule = V4().CSSGroupingRule;
    o48.CSSMediaRule = re2().CSSMediaRule;
    o48.CSSConditionRule = K3().CSSConditionRule;
    o48.CSSSupportsRule = Se().CSSSupportsRule;
    o48.CSSFontFaceRule = Ce().CSSFontFaceRule;
    o48.CSSHostRule = fe1().CSSHostRule;
    o48.CSSStyleDeclaration = I5().CSSStyleDeclaration;
    o48.CSSKeyframeRule = se1().CSSKeyframeRule;
    o48.CSSKeyframesRule = ie1().CSSKeyframesRule;
    o48.CSSValueExpression = ye().CSSValueExpression;
    o48.CSSDocumentRule = de2().CSSDocumentRule;
});
var I5 = c5((Be2)=>{
    var G6 = {};
    G6.CSSStyleDeclaration = function() {
        this.length = 0, this.parentRule = null, this._importants = {};
    };
    G6.CSSStyleDeclaration.prototype = {
        constructor: G6.CSSStyleDeclaration,
        getPropertyValue: function(r) {
            return this[r] || "";
        },
        setProperty: function(r, e200, t254) {
            if (this[r]) {
                var S19 = Array.prototype.indexOf.call(this, r);
                S19 < 0 && (this[this.length] = r, this.length++);
            } else this[this.length] = r, this.length++;
            this[r] = e200 + "", this._importants[r] = t254;
        },
        removeProperty: function(r) {
            if (!(r in this)) return "";
            var e201 = Array.prototype.indexOf.call(this, r);
            if (e201 < 0) return "";
            var t255 = this[r];
            return this[r] = "", Array.prototype.splice.call(this, e201, 1), t255;
        },
        getPropertyCSSValue: function() {},
        getPropertyPriority: function(r) {
            return this._importants[r] || "";
        },
        getPropertyShorthand: function() {},
        isPropertyImplicit: function() {},
        get cssText () {
            for(var r2 = [], e2 = 0, t2 = this.length; e2 < t2; ++e2){
                var S21 = this[e2], i121 = this.getPropertyValue(S21), s95 = this.getPropertyPriority(S21);
                s95 && (s95 = " !" + s95), r2[e2] = S21 + ": " + i121 + s95 + ";";
            }
            return r2.join(" ");
        },
        set cssText (r){
            var e1100, t1;
            for(e1100 = this.length; e1100--;)t1 = this[e1100], this[t1] = "";
            Array.prototype.splice.call(this, 0, this.length), this._importants = {};
            var S110 = G6.parse("#bogus{" + r + "}").cssRules[0].style, i122 = S110.length;
            for(e1100 = 0; e1100 < i122; ++e1100)t1 = S110[e1100], this.setProperty(S110[e1100], S110.getPropertyValue(t1), S110.getPropertyPriority(t1));
        }
    };
    Be2.CSSStyleDeclaration = G6.CSSStyleDeclaration;
    G6.parse = Q3().parse;
});
var We = c5((Ye1)=>{
    var oe3 = {
        CSSStyleSheet: Y3().CSSStyleSheet,
        CSSRule: y5().CSSRule,
        CSSStyleRule: B5().CSSStyleRule,
        CSSGroupingRule: V4().CSSGroupingRule,
        CSSConditionRule: K3().CSSConditionRule,
        CSSMediaRule: re2().CSSMediaRule,
        CSSSupportsRule: Se().CSSSupportsRule,
        CSSStyleDeclaration: I5().CSSStyleDeclaration,
        CSSKeyframeRule: se1().CSSKeyframeRule,
        CSSKeyframesRule: ie1().CSSKeyframesRule
    };
    oe3.clone = function r(e202) {
        var t256 = new oe3.CSSStyleSheet, S20 = e202.cssRules;
        if (!S20) return t256;
        for(var i123 = 0, s96 = S20.length; i123 < s96; i123++){
            var l47 = S20[i123], p17 = t256.cssRules[i123] = new l47.constructor, n152 = l47.style;
            if (n152) {
                for(var a76 = p17.style = new oe3.CSSStyleDeclaration, u77 = 0, g10 = n152.length; u77 < g10; u77++){
                    var L8 = a76[u77] = n152[u77];
                    a76[L8] = n152[L8], a76._importants[L8] = n152.getPropertyPriority(L8);
                }
                a76.length = n152.length;
            }
            l47.hasOwnProperty("keyText") && (p17.keyText = l47.keyText), l47.hasOwnProperty("selectorText") && (p17.selectorText = l47.selectorText), l47.hasOwnProperty("mediaText") && (p17.mediaText = l47.mediaText), l47.hasOwnProperty("conditionText") && (p17.conditionText = l47.conditionText), l47.hasOwnProperty("cssRules") && (p17.cssRules = r(l47).cssRules);
        }
        return t256;
    };
    Ye1.clone = oe3.clone;
});
var ge2 = c5((R7)=>{
    "use strict";
    R7.CSSStyleDeclaration = I5().CSSStyleDeclaration;
    R7.CSSRule = y5().CSSRule;
    R7.CSSGroupingRule = V4().CSSGroupingRule;
    R7.CSSConditionRule = K3().CSSConditionRule;
    R7.CSSStyleRule = B5().CSSStyleRule;
    R7.MediaList = te2().MediaList;
    R7.CSSMediaRule = re2().CSSMediaRule;
    R7.CSSSupportsRule = Se().CSSSupportsRule;
    R7.CSSImportRule = Re().CSSImportRule;
    R7.CSSFontFaceRule = Ce().CSSFontFaceRule;
    R7.CSSHostRule = fe1().CSSHostRule;
    R7.StyleSheet = ce2().StyleSheet;
    R7.CSSStyleSheet = Y3().CSSStyleSheet;
    R7.CSSKeyframesRule = ie1().CSSKeyframesRule;
    R7.CSSKeyframeRule = se1().CSSKeyframeRule;
    R7.MatcherList = me1().MatcherList;
    R7.CSSDocumentRule = de2().CSSDocumentRule;
    R7.CSSValue = he().CSSValue;
    R7.CSSValueExpression = ye().CSSValueExpression;
    R7.parse = Q3().parse;
    R7.clone = We().clone;
});
var D6 = {};
st1(D6, {
    CSSConditionRule: ()=>ot1,
    CSSDocumentRule: ()=>vt1,
    CSSFontFaceRule: ()=>Ct,
    CSSGroupingRule: ()=>ut,
    CSSHostRule: ()=>ft1,
    CSSImportRule: ()=>Rt,
    CSSKeyframeRule: ()=>dt1,
    CSSKeyframesRule: ()=>mt1,
    CSSMediaRule: ()=>pt,
    CSSRule: ()=>lt1,
    CSSStyleDeclaration: ()=>it1,
    CSSStyleRule: ()=>nt,
    CSSStyleSheet: ()=>yt,
    CSSSupportsRule: ()=>ct1,
    CSSValue: ()=>xt1,
    CSSValueExpression: ()=>bt,
    MatcherList: ()=>gt1,
    MediaList: ()=>at1,
    StyleSheet: ()=>ht1,
    clone: ()=>Mt,
    default: ()=>wt1,
    parse: ()=>_t
});
var Ze = Ee(ge2());
F5(D6, Ee(ge2()));
var { CSSStyleDeclaration: it1 , CSSRule: lt1 , CSSGroupingRule: ut , CSSConditionRule: ot1 , CSSStyleRule: nt , MediaList: at1 , CSSMediaRule: pt , CSSSupportsRule: ct1 , CSSImportRule: Rt , CSSFontFaceRule: Ct , CSSHostRule: ft1 , StyleSheet: ht1 , CSSStyleSheet: yt , CSSKeyframesRule: mt1 , CSSKeyframeRule: dt1 , MatcherList: gt1 , CSSDocumentRule: vt1 , CSSValue: xt1 , CSSValueExpression: bt , parse: _t , clone: Mt  } = Ze, { default: Xe1 , ...Et1 } = Ze, wt1 = Xe1 !== void 0 ? Xe1 : Et1;
const __2$ = mod8.default ?? mod8;
var So = Object.create;
var hs = Object.defineProperty;
var yo = Object.getOwnPropertyDescriptor;
var Mo = Object.getOwnPropertyNames;
var Oo = Object.getPrototypeOf, Do = Object.prototype.hasOwnProperty;
((r)=>typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(r, {
        get: (t257, e203)=>(typeof require < "u" ? require : t257)[e203]
    }) : r)(function(r) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + r + '" is not supported');
});
var Pr = (r, t258)=>()=>(t258 || r((t258 = {
            exports: {}
        }).exports, t258), t258.exports);
var Lo = (r, t259, e204, s97)=>{
    if (t259 && typeof t259 == "object" || typeof t259 == "function") for (let o49 of Mo(t259))!Do.call(r, o49) && o49 !== e204 && hs(r, o49, {
        get: ()=>t259[o49],
        enumerable: !(s97 = yo(t259, o49)) || s97.enumerable
    });
    return r;
};
var gs = (r, t260, e205)=>(e205 = r != null ? So(Oo(r)) : {}, Lo(t260 || !r || !r.__esModule ? hs(e205, "default", {
        value: r,
        enumerable: !0
    }) : e205, r));
var vs = Pr((Br)=>{
    try {
        let { performance: r  } = __default;
        Br.performance = r;
    } catch  {
        Br.performance = {
            now () {
                return +new Date;
            }
        };
    }
});
var ro = Pr((Bl, eo)=>{
    var ls = class {
        constructor(t261, e206){
            this.width = t261, this.height = e206;
        }
        getContext() {
            return null;
        }
        toDataURL() {
            return "";
        }
    };
    eo.exports = {
        createCanvas: (r, t262)=>new ls(r, t262)
    };
});
var so = Pr((Gl, us)=>{
    try {
        us.exports = __2$;
    } catch  {
        us.exports = ro();
    }
});
var Nt = Symbol("changed"), ot2 = Symbol("classList"), L6 = Symbol("CustomElements"), vt2 = Symbol("content"), ce3 = Symbol("dataset"), nt1 = Symbol("doctype"), Ht = Symbol("DOMParser"), u5 = Symbol("end"), xt2 = Symbol("EventTarget"), bt1 = Symbol("globals"), U6 = Symbol("image"), X3 = Symbol("mime"), K4 = Symbol("MutationObserver"), l4 = Symbol("next"), Ir = Symbol("ownerElement"), N5 = Symbol("prev"), C4 = Symbol("private"), pt1 = Symbol("sheet"), y6 = Symbol("start"), ae3 = Symbol("style"), it2 = Symbol("upgrade"), E6 = Symbol("value");
var fs = new Set([
    "ARTICLE",
    "ASIDE",
    "BLOCKQUOTE",
    "BODY",
    "BR",
    "BUTTON",
    "CANVAS",
    "CAPTION",
    "COL",
    "COLGROUP",
    "DD",
    "DIV",
    "DL",
    "DT",
    "EMBED",
    "FIELDSET",
    "FIGCAPTION",
    "FIGURE",
    "FOOTER",
    "FORM",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "LI",
    "UL",
    "OL",
    "P"
]), le2 = -1, ue2 = 1, me2 = 4, pe2 = 128, Es = 1, Rr = 2, Ur = 4, Ts = 8, Ns = 16, xs = 32, ht2 = "http://www.w3.org/2000/svg";
var { assign: bs , create: ws , defineProperties: Cs , entries: As , getOwnPropertyDescriptors: Tn , keys: Ss , setPrototypeOf: A8  } = Object;
var dt2 = String;
var M4 = (r)=>r.nodeType === 1 ? r[u5] : r, ct2 = ({ ownerDocument: r  })=>r[X3].ignoreCase, P3 = (r, t263)=>{
    r[l4] = t263, t263[N5] = r;
}, wt2 = (r, t264, e207)=>{
    P3(r, t264), P3(M4(t264), e207);
}, ys = (r, t265, e208, s98)=>{
    P3(r, t265), P3(M4(e208), s98);
}, $2 = (r, t266, e209)=>{
    P3(r, t266), P3(t266, e209);
}, kt = ({ localName: r , ownerDocument: t267  })=>t267[X3].ignoreCase ? r.toUpperCase() : r, he1 = (r, t268)=>{
    r && (r[l4] = t268), t268 && (t268[N5] = r);
};
var Q4 = new WeakMap;
var ge3 = !1, Pt = new WeakMap, tt2 = new WeakMap, gt2 = (r, t269, e210, s99)=>{
    ge3 && tt2.has(r) && r.attributeChangedCallback && r.constructor.observedAttributes.includes(t269) && r.attributeChangedCallback(t269, e210, s99);
}, Ds = (r, t270)=>(e211)=>{
        if (tt2.has(e211)) {
            let s100 = tt2.get(e211);
            s100.connected !== t270 && e211.isConnected === t270 && (s100.connected = t270, r in e211 && e211[r]());
        }
    }, Ms = Ds("connectedCallback", !0), It = (r)=>{
    if (ge3) {
        Ms(r), Q4.has(r) && (r = Q4.get(r).shadowRoot);
        let { [l4]: t271 , [u5]: e212  } = r;
        for(; t271 !== e212;)t271.nodeType === 1 && Ms(t271), t271 = t271[l4];
    }
}, Os = Ds("disconnectedCallback", !1), Ls = (r)=>{
    if (ge3) {
        Os(r), Q4.has(r) && (r = Q4.get(r).shadowRoot);
        let { [l4]: t272 , [u5]: e213  } = r;
        for(; t272 !== e213;)t272.nodeType === 1 && Os(t272), t272 = t272[l4];
    }
}, de3 = class {
    constructor(t273){
        this.ownerDocument = t273, this.registry = new Map, this.waiting = new Map, this.active = !1;
    }
    define(t274, e214, s101 = {}) {
        let { ownerDocument: o50 , registry: c57 , waiting: m9  } = this;
        if (c57.has(t274)) throw new Error("unable to redefine " + t274);
        if (Pt.has(e214)) throw new Error("unable to redefine the same class: " + e214);
        this.active = ge3 = !0;
        let { extends: p18  } = s101;
        Pt.set(e214, {
            ownerDocument: o50,
            options: {
                is: p18 ? t274 : ""
            },
            localName: p18 || t274
        });
        let h17 = p18 ? (g11)=>g11.localName === p18 && g11.getAttribute("is") === t274 : (g12)=>g12.localName === t274;
        if (c57.set(t274, {
            Class: e214,
            check: h17
        }), m9.has(t274)) {
            for (let g13 of m9.get(t274))g13(e214);
            m9.delete(t274);
        }
        o50.querySelectorAll(p18 ? `${p18}[is="${t274}"]` : t274).forEach(this.upgrade, this);
    }
    upgrade(t275) {
        if (tt2.has(t275)) return;
        let { ownerDocument: e215 , registry: s102  } = this, o51 = t275.getAttribute("is") || t275.localName;
        if (s102.has(o51)) {
            let { Class: c58 , check: m10  } = s102.get(o51);
            if (m10(t275)) {
                let { attributes: p19 , isConnected: h18  } = t275;
                for (let x13 of p19)t275.removeAttributeNode(x13);
                let g14 = As(t275);
                for (let [x14] of g14)delete t275[x14];
                A8(t275, c58.prototype), e215[it2] = {
                    element: t275,
                    values: g14
                }, new c58(e215, o51), tt2.set(t275, {
                    connected: h18
                });
                for (let x21 of p19)t275.setAttributeNode(x21);
                h18 && t275.connectedCallback && t275.connectedCallback();
            }
        }
    }
    whenDefined(t276) {
        let { registry: e216 , waiting: s103  } = this;
        return new Promise((o52)=>{
            e216.has(t276) ? o52(e216.get(t276).Class) : (s103.has(t276) || s103.set(t276, []), s103.get(t276).push(o52));
        });
    }
    get(t277) {
        let e217 = this.registry.get(t277);
        return e217 && e217.Class;
    }
};
var { Parser: vo  } = mod11, Ct1 = (r, t278, e218)=>{
    let s104 = r[u5];
    return t278.parentNode = r, wt2(s104[N5], t278, s104), e218 && t278.nodeType === 1 && It(t278), t278;
}, Ho = (r, t279, e219, s105, o53)=>{
    e219[E6] = s105, e219.ownerElement = r, $2(t279[N5], e219, t279), e219.name === "class" && (r.className = s105), o53 && gt2(r, e219.name, null, s105);
};
var fe2 = (r, t280, e220)=>{
    let { active: s106 , registry: o54  } = r[L6], c59 = r, m11 = null;
    let p20 = new vo({
        onprocessinginstruction (h19, g15) {
            h19.toLowerCase() === "!doctype" && (r.doctype = g15.slice(h19.length).trim());
        },
        onopentag (h20, g16) {
            let x15 = !0;
            if (t280) {
                if (m11) c59 = Ct1(c59, r.createElementNS(ht2, h20), s106), c59.ownerSVGElement = m11, x15 = !1;
                else if (h20 === "svg" || h20 === "SVG") m11 = r.createElementNS(ht2, h20), c59 = Ct1(c59, m11, s106), x15 = !1;
                else if (s106) {
                    let W4 = h20.includes("-") ? h20 : g16.is || "";
                    if (W4 && o54.has(W4)) {
                        let { Class: Ao  } = o54.get(W4);
                        c59 = Ct1(c59, new Ao, s106), delete g16.is, x15 = !1;
                    }
                }
            }
            x15 && (c59 = Ct1(c59, r.createElement(h20), !1));
            let k7 = c59[u5];
            for (let W5 of Ss(g16))Ho(c59, k7, r.createAttribute(W5), g16[W5], s106);
        },
        oncomment (h21) {
            Ct1(c59, r.createComment(h21), s106);
        },
        ontext (h22) {
            Ct1(c59, r.createTextNode(h22), s106);
        },
        onclosetag () {
            t280 && c59 === m11 && (m11 = null), c59 = c59.parentNode;
        }
    }, {
        lowerCaseAttributeNames: !1,
        decodeEntities: !0,
        xmlMode: !t280
    });
    return p20.write(e220), p20.end(), !0, r;
};
var at2 = new Map, T8 = (r, t281)=>{
    for (let e221 of [].concat(r))at2.set(e221, t281), at2.set(e221.toUpperCase(), t281);
};
var wo = gs(vs(), 1);
var Hs = ({ [l4]: r , [u5]: t282  }, e222)=>{
    for(; r !== t282;){
        switch(r.nodeType){
            case 2:
                Gr(r, e222);
                break;
            case 3:
            case 8:
                Vr(r, e222);
                break;
            case 1:
                Wr(r, e222), r = M4(r);
                break;
            case 10:
                Fr(r, e222);
                break;
        }
        r = r[l4];
    }
    let s107 = e222.length - 1, o55 = e222[s107];
    typeof o55 == "number" && o55 < 0 ? e222[s107] += -1 : e222.push(-1);
}, Gr = (r, t283)=>{
    t283.push(2, r.name);
    let e223 = r[E6].trim();
    e223 && t283.push(e223);
}, Vr = (r, t284)=>{
    let e224 = r[E6];
    e224.trim() && t284.push(r.nodeType, e224);
}, ks = (r, t285)=>{
    t285.push(r.nodeType), Hs(r, t285);
}, Fr = ({ name: r , publicId: t286 , systemId: e225  }, s108)=>{
    s108.push(10, r), t286 && s108.push(t286), e225 && s108.push(e225);
}, Wr = (r, t287)=>{
    t287.push(1, r.localName), Hs(r, t287);
};
var Is = (r, t288, e226, s109, o56, c60)=>({
        type: r,
        target: t288,
        addedNodes: e226,
        removedNodes: s109,
        attributeName: o56,
        oldValue: c60
    }), Ps = (r, t289, e227, s110, o57, c61)=>{
    if (!s110 || s110.includes(e227)) {
        let { callback: m12 , records: p21 , scheduled: h23  } = r;
        p21.push(Is("attributes", t289, [], [], e227, o57 ? c61 : void 0)), h23 || (r.scheduled = !0, Promise.resolve().then(()=>{
            r.scheduled = !1, m12(p21.splice(0), r);
        }));
    }
}, Rt1 = (r, t290, e228)=>{
    let { ownerDocument: s111  } = r, { active: o58 , observers: c62  } = s111[K4];
    if (o58) {
        for (let m13 of c62)for (let [p22, { childList: h24 , subtree: g17 , attributes: x16 , attributeFilter: k8 , attributeOldValue: W6  }] of m13.nodes)if (h24) {
            if (g17 && (p22 === s111 || p22.contains(r)) || !g17 && p22.children.includes(r)) {
                Ps(m13, r, t290, k8, W6, e228);
                break;
            }
        } else if (x16 && p22 === r) {
            Ps(m13, r, t290, k8, W6, e228);
            break;
        }
    }
}, lt2 = (r, t291)=>{
    let { ownerDocument: e229  } = r, { active: s112 , observers: o59  } = e229[K4];
    if (s112) {
        for (let c63 of o59)for (let [m14, { subtree: p23 , childList: h25 , characterData: g18  }] of c63.nodes)if (h25 && (t291 && (m14 === t291 || p23 && m14.contains(t291)) || !t291 && (p23 && (m14 === e229 || m14.contains(r)) || !p23 && m14[g18 ? "childNodes" : "children"].includes(r)))) {
            let { callback: x17 , records: k9 , scheduled: W7  } = c63;
            k9.push(Is("childList", m14, t291 ? [] : [
                r
            ], t291 ? [
                r
            ] : [])), W7 || (c63.scheduled = !0, Promise.resolve().then(()=>{
                c63.scheduled = !1, x17(k9.splice(0), c63);
            }));
            break;
        }
    }
}, Ee1 = class {
    constructor(t292){
        let e230 = new Set;
        this.observers = e230, this.active = !1, this.class = class {
            constructor(o60){
                this.callback = o60, this.nodes = new Map, this.records = [], this.scheduled = !1;
            }
            disconnect() {
                this.records.splice(0), this.nodes.clear(), e230.delete(this), t292[K4].active = !!e230.size;
            }
            observe(o61, c64 = {
                subtree: !1,
                childList: !1,
                attributes: !1,
                attributeFilter: null,
                attributeOldValue: !1,
                characterData: !1
            }) {
                ("attributeOldValue" in c64 || "attributeFilter" in c64) && (c64.attributes = !0), c64.childList = !!c64.childList, c64.subtree = !!c64.subtree, this.nodes.set(o61, c64), e230.add(this), t292[K4].active = !0;
            }
            takeRecords() {
                return this.records.splice(0);
            }
        };
    }
};
var Rs = new Set([
    "allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "class",
    "contenteditable",
    "controls",
    "default",
    "defer",
    "disabled",
    "draggable",
    "formnovalidate",
    "hidden",
    "id",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected",
    "style",
    "truespeed"
]), Ut = (r, t293)=>{
    let { [E6]: e231 , name: s113  } = t293;
    t293.ownerElement = r, $2(r, t293, r[l4]), s113 === "class" && (r.className = e231), Rt1(r, s113, null), gt2(r, s113, null, e231);
}, Xr = (r, t294)=>{
    let { [E6]: e232 , name: s114  } = t294;
    P3(t294[N5], t294[l4]), t294.ownerElement = t294[N5] = t294[l4] = null, s114 === "class" && (r[ot2] = null), Rt1(r, s114, e232), gt2(r, s114, e232, null);
}, f4 = {
    get (r, t295) {
        return r.hasAttribute(t295);
    },
    set (r, t296, e233) {
        e233 ? r.setAttribute(t296, "") : r.removeAttribute(t296);
    }
}, z6 = {
    get (r, t297) {
        return parseFloat(r.getAttribute(t297) || 0);
    },
    set (r, t298, e234) {
        r.setAttribute(t298, e234);
    }
}, a5 = {
    get (r, t299) {
        return r.getAttribute(t299) || "";
    },
    set (r, t300, e235) {
        r.setAttribute(t300, e235);
    }
};
var Te = new WeakMap;
function ko(r, t301) {
    return typeof t301 == "function" ? t301.call(r.target, r) : t301.handleEvent(r), r._stopImmediatePropagationFlag;
}
function Po({ currentTarget: r , target: t302  }) {
    let e236 = Te.get(r);
    if (e236 && e236.has(this.type)) {
        let s115 = e236.get(this.type);
        r === t302 ? this.eventPhase = this.AT_TARGET : this.eventPhase = this.BUBBLING_PHASE, this.currentTarget = r, this.target = t302;
        for (let [o62, c65] of s115)if (c65 && c65.once && s115.delete(o62), ko(this, o62)) break;
        return delete this.currentTarget, delete this.target, this.cancelBubble;
    }
}
var ut1 = class {
    constructor(){
        Te.set(this, new Map);
    }
    _getParent() {
        return null;
    }
    addEventListener(t303, e237, s116) {
        let o63 = Te.get(this);
        o63.has(t303) || o63.set(t303, new Map), o63.get(t303).set(e237, s116);
    }
    removeEventListener(t304, e238) {
        let s117 = Te.get(this);
        if (s117.has(t304)) {
            let o64 = s117.get(t304);
            o64.delete(e238) && !o64.size && s117.delete(t304);
        }
    }
    dispatchEvent(t305) {
        let e239 = this;
        for(t305.eventPhase = t305.CAPTURING_PHASE; e239;)e239.dispatchEvent && t305._path.push({
            currentTarget: e239,
            target: this
        }), e239 = t305.bubbles && e239._getParent && e239._getParent();
        return t305._path.some(Po, t305), t305._path = [], t305.eventPhase = t305.NONE, !t305.defaultPrevented;
    }
};
var S4 = class extends Array {
    item(t306) {
        return t306 < this.length ? this[t306] : null;
    }
};
var Us = ({ parentNode: r  })=>{
    let t307 = 0;
    for(; r;)t307++, r = r.parentNode;
    return t307;
}, I6 = class extends ut1 {
    static get ELEMENT_NODE() {
        return 1;
    }
    static get ATTRIBUTE_NODE() {
        return 2;
    }
    static get TEXT_NODE() {
        return 3;
    }
    static get COMMENT_NODE() {
        return 8;
    }
    static get DOCUMENT_NODE() {
        return 9;
    }
    static get DOCUMENT_FRAGMENT_NODE() {
        return 11;
    }
    static get DOCUMENT_TYPE_NODE() {
        return 10;
    }
    constructor(t308, e240, s118){
        super(), this.ownerDocument = t308, this.localName = e240, this.nodeType = s118, this.parentNode = null, this[l4] = null, this[N5] = null;
    }
    get ELEMENT_NODE() {
        return 1;
    }
    get ATTRIBUTE_NODE() {
        return 2;
    }
    get TEXT_NODE() {
        return 3;
    }
    get COMMENT_NODE() {
        return 8;
    }
    get DOCUMENT_NODE() {
        return 9;
    }
    get DOCUMENT_FRAGMENT_NODE() {
        return 11;
    }
    get DOCUMENT_TYPE_NODE() {
        return 10;
    }
    get baseURI() {
        let t309 = this.nodeType === 9 ? this : this.ownerDocument;
        if (t309) {
            let e241 = t309.querySelector("base");
            if (e241) return e241.getAttribute("href");
            let { location: s119  } = t309.defaultView;
            if (s119) return s119.href;
        }
        return null;
    }
    get isConnected() {
        return !1;
    }
    get nodeName() {
        return this.localName;
    }
    get parentElement() {
        return null;
    }
    get previousSibling() {
        return null;
    }
    get previousElementSibling() {
        return null;
    }
    get nextSibling() {
        return null;
    }
    get nextElementSibling() {
        return null;
    }
    get childNodes() {
        return new S4;
    }
    get firstChild() {
        return null;
    }
    get lastChild() {
        return null;
    }
    get nodeValue() {
        return null;
    }
    set nodeValue(t) {}
    get textContent() {
        return null;
    }
    set textContent(t) {}
    normalize() {}
    cloneNode() {
        return null;
    }
    contains() {
        return !1;
    }
    insertBefore(t310, e) {
        return t310;
    }
    appendChild(t311) {
        return t311;
    }
    replaceChild(t, e242) {
        return e242;
    }
    removeChild(t312) {
        return t312;
    }
    toString() {
        return "";
    }
    hasChildNodes() {
        return !!this.lastChild;
    }
    isSameNode(t313) {
        return this === t313;
    }
    compareDocumentPosition(t314) {
        let e243 = 0;
        if (this !== t314) {
            let s120 = Us(this), o65 = Us(t314);
            if (s120 < o65) e243 += Ur, this.contains(t314) && (e243 += Ns);
            else if (o65 < s120) e243 += Rr, t314.contains(this) && (e243 += Ts);
            else if (s120 && o65) {
                let { childNodes: c66  } = this.parentNode;
                c66.indexOf(this) < c66.indexOf(t314) ? e243 += Ur : e243 += Rr;
            }
            (!s120 || !o65) && (e243 += xs, e243 += Es);
        }
        return e243;
    }
    isEqualNode(t315) {
        if (this === t315) return !0;
        if (this.nodeType === t315.nodeType) {
            switch(this.nodeType){
                case 9:
                case 11:
                    {
                        let e244 = this.childNodes, s121 = t315.childNodes;
                        return e244.length === s121.length && e244.every((o66, c67)=>o66.isEqualNode(s121[c67]));
                    }
            }
            return this.toString() === t315.toString();
        }
        return !1;
    }
    _getParent() {
        return this.parentNode;
    }
    getRootNode() {
        let t316 = this;
        for(; t316.parentNode;)t316 = t316.parentNode;
        return t316.nodeType === 9 ? t316.documentElement : t316;
    }
};
var Io = /"/g, _5 = class extends I6 {
    constructor(t317, e245, s122 = ""){
        super(t317, "#attribute", 2), this.ownerElement = null, this.name = dt2(e245), this[E6] = dt2(s122), this[Nt] = !1;
    }
    get value() {
        return this[E6];
    }
    set value(t318) {
        let { [E6]: e246 , name: s123 , ownerElement: o67  } = this;
        this[E6] = dt2(t318), this[Nt] = !0, o67 && (Rt1(o67, s123, e246), gt2(o67, s123, e246, this[E6]));
    }
    cloneNode() {
        let { ownerDocument: t319 , name: e247 , [E6]: s124  } = this;
        return new _5(t319, e247, s124);
    }
    toString() {
        let { name: t320 , [E6]: e248  } = this;
        return Rs.has(t320) && !e248 ? t320 : `${t320}="${e248.replace(Io, "&quot;")}"`;
    }
    toJSON() {
        let t321 = [];
        return Gr(this, t321), t321;
    }
};
var Ne = ({ ownerDocument: r , parentNode: t322  })=>{
    for(; t322;){
        if (t322 === r) return !0;
        t322 = t322.parentNode || t322.host;
    }
    return !1;
}, xe = ({ parentNode: r  })=>{
    if (r) switch(r.nodeType){
        case 9:
        case 11:
            return null;
    }
    return r;
}, et2 = ({ [N5]: r  })=>{
    switch(r ? r.nodeType : 0){
        case -1:
            return r[y6];
        case 3:
        case 8:
            return r;
    }
    return null;
}, J4 = (r)=>{
    let t323 = M4(r)[l4];
    return t323 && (t323.nodeType === -1 ? null : t323);
};
var At1 = (r)=>{
    let t324 = J4(r);
    for(; t324 && t324.nodeType !== 1;)t324 = J4(t324);
    return t324;
}, be = (r)=>{
    let t325 = et2(r);
    for(; t325 && t325.nodeType !== 1;)t325 = et2(t325);
    return t325;
};
var $r = (r, t326)=>{
    let e249 = r.createDocumentFragment();
    return e249.append(...t326), e249;
}, we = (r, t327)=>{
    let { ownerDocument: e250 , parentNode: s125  } = r;
    s125 && s125.insertBefore($r(e250, t327), r);
}, Ce1 = (r, t328)=>{
    let { ownerDocument: e251 , parentNode: s126  } = r;
    s126 && s126.insertBefore($r(e251, t328), M4(r)[l4]);
}, Ae = (r, t329)=>{
    let { ownerDocument: e252 , parentNode: s127  } = r;
    s127 && (s127.insertBefore($r(e252, t329), r), r.remove());
}, Se1 = (r, t330, e253)=>{
    let { parentNode: s128 , nodeType: o68  } = t330;
    (r || e253) && (he1(r, e253), t330[N5] = null, M4(t330)[l4] = null), s128 && (t330.parentNode = null, lt2(t330, s128), o68 === 1 && Ls(t330));
};
var rt1 = class extends I6 {
    constructor(t331, e254, s129, o69){
        super(t331, e254, s129), this[E6] = dt2(o69);
    }
    get isConnected() {
        return Ne(this);
    }
    get parentElement() {
        return xe(this);
    }
    get previousSibling() {
        return et2(this);
    }
    get nextSibling() {
        return J4(this);
    }
    get previousElementSibling() {
        return be(this);
    }
    get nextElementSibling() {
        return At1(this);
    }
    before(...t332) {
        we(this, t332);
    }
    after(...t333) {
        Ce1(this, t333);
    }
    replaceWith(...t334) {
        Ae(this, t334);
    }
    remove() {
        Se1(this[N5], this, this[l4]);
    }
    get data() {
        return this[E6];
    }
    set data(t335) {
        this[E6] = dt2(t335), lt2(this, this.parentNode);
    }
    get nodeValue() {
        return this.data;
    }
    set nodeValue(t336) {
        this.data = t336;
    }
    get textContent() {
        return this.data;
    }
    set textContent(t337) {
        this.data = t337;
    }
    get length() {
        return this.data.length;
    }
    substringData(t338, e255) {
        return this.data.substr(t338, e255);
    }
    appendData(t339) {
        this.data += t339;
    }
    insertData(t340, e256) {
        let { data: s130  } = this;
        this.data = s130.slice(0, t340) + e256 + s130.slice(t340);
    }
    deleteData(t341, e257) {
        let { data: s131  } = this;
        this.data = s131.slice(0, t341) + s131.slice(t341 + e257);
    }
    replaceData(t342, e258, s132) {
        let { data: o70  } = this;
        this.data = o70.slice(0, t342) + s132 + o70.slice(t342 + e258);
    }
    toJSON() {
        let t343 = [];
        return Vr(this, t343), t343;
    }
};
var j4 = class extends rt1 {
    constructor(t344, e259 = ""){
        super(t344, "#comment", 8, e259);
    }
    cloneNode() {
        let { ownerDocument: t345 , [E6]: e260  } = this;
        return new j4(t345, e260);
    }
    toString() {
        return `<!--${this[E6]}-->`;
    }
};
var { isArray: Ro  } = Array, Me = ({ nodeType: r  })=>r === 1, Bs = (r, t346)=>t346.some((e261)=>Me(e261) && (r(e261) || Bs(r, St1(e261)))), Uo = (r, t347)=>t347 === "class" ? r.classList.value : r.getAttribute(t347), St1 = ({ childNodes: r  })=>r, Bo = (r)=>{
    let { localName: t348  } = r;
    return ct2(r) ? t348.toLowerCase() : t348;
}, Go = ({ parentNode: r  })=>r, Vo = (r)=>{
    let { parentNode: t349  } = r;
    return t349 ? St1(t349) : r;
}, qr = (r)=>Ro(r) ? r.map(qr).join("") : Me(r) ? qr(St1(r)) : r.nodeType === 3 ? r.data : "", Fo = (r, t350)=>r.hasAttribute(t350), Wo = (r)=>{
    let { length: t351  } = r;
    for(; t351--;){
        let e262 = r[t351];
        if (t351 && -1 < r.lastIndexOf(e262, t351 - 1)) {
            r.splice(t351, 1);
            continue;
        }
        for(let { parentNode: s133  } = e262; s133; s133 = s133.parentNode)if (r.includes(s133)) {
            r.splice(t351, 1);
            break;
        }
    }
    return r;
}, Gs = (r, t352)=>{
    let e263 = [];
    for (let s134 of t352)Me(s134) && (r(s134) && e263.push(s134), e263.push(...Gs(r, St1(s134))));
    return e263;
}, Vs = (r, t353)=>{
    for (let e264 of t353)if (r(e264) || (e264 = Vs(r, St1(e264)))) return e264;
    return null;
}, Fs = {
    isTag: Me,
    existsOne: Bs,
    getAttributeValue: Uo,
    getChildren: St1,
    getName: Bo,
    getParent: Go,
    getSiblings: Vo,
    getText: qr,
    hasAttrib: Fo,
    removeSubsets: Wo,
    findAll: Gs,
    findOne: Vs
}, Bt = (r, t354)=>Be(t354, {
        context: t354.includes(":scope") ? r : void 0,
        xmlMode: !ct2(r),
        adapter: Fs
    }), Ws = (r, t355)=>Qe(r, t355, {
        strict: !0,
        context: t355.includes(":scope") ? r : void 0,
        xmlMode: !ct2(r),
        adapter: Fs
    });
var { replace: Xo  } = "", $o = /[<>&\xA0]/g, qo = {
    "\xA0": "&nbsp;",
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
}, zo = (r)=>qo[r], Xs = (r)=>Xo.call(r, $o, zo);
var v7 = class extends rt1 {
    constructor(t356, e265 = ""){
        super(t356, "#text", 3, e265);
    }
    get wholeText() {
        let t357 = [], { previousSibling: e266 , nextSibling: s135  } = this;
        for(; e266 && e266.nodeType === 3;){
            t357.unshift(e266[E6]);
            e266 = e266.previousSibling;
        }
        for(t357.push(this[E6]); s135 && s135.nodeType === 3;){
            t357.push(s135[E6]);
            s135 = s135.nextSibling;
        }
        return t357.join("");
    }
    cloneNode() {
        let { ownerDocument: t358 , [E6]: e267  } = this;
        return new v7(t358, e267);
    }
    toString() {
        return Xs(this[E6]);
    }
};
var Jo = (r)=>r instanceof I6, zr = (r, t359, e268)=>{
    let { ownerDocument: s136  } = r;
    for (let o71 of e268)r.insertBefore(Jo(o71) ? o71 : new v7(s136, o71), t359);
}, yt1 = class extends I6 {
    constructor(t360, e269, s137){
        super(t360, e269, s137), this[C4] = null, this[l4] = this[u5] = {
            [l4]: null,
            [N5]: this,
            [y6]: this,
            nodeType: -1,
            ownerDocument: this.ownerDocument,
            parentNode: null
        };
    }
    get childNodes() {
        let t361 = new S4, { firstChild: e270  } = this;
        for(; e270;)t361.push(e270), e270 = J4(e270);
        return t361;
    }
    get children() {
        let t362 = new S4, { firstElementChild: e271  } = this;
        for(; e271;)t362.push(e271), e271 = At1(e271);
        return t362;
    }
    get firstChild() {
        let { [l4]: t363 , [u5]: e272  } = this;
        for(; t363.nodeType === 2;)t363 = t363[l4];
        return t363 === e272 ? null : t363;
    }
    get firstElementChild() {
        let { firstChild: t364  } = this;
        for(; t364;){
            if (t364.nodeType === 1) return t364;
            t364 = J4(t364);
        }
        return null;
    }
    get lastChild() {
        let t365 = this[u5][N5];
        switch(t365.nodeType){
            case -1:
                return t365[y6];
            case 2:
                return null;
        }
        return t365 === this ? null : t365;
    }
    get lastElementChild() {
        let { lastChild: t366  } = this;
        for(; t366;){
            if (t366.nodeType === 1) return t366;
            t366 = et2(t366);
        }
        return null;
    }
    get childElementCount() {
        return this.children.length;
    }
    prepend(...t367) {
        zr(this, this.firstChild, t367);
    }
    append(...t368) {
        zr(this, this[u5], t368);
    }
    replaceChildren(...t369) {
        let { [l4]: e273 , [u5]: s138  } = this;
        for(; e273 !== s138 && e273.nodeType === 2;)e273 = e273[l4];
        for(; e273 !== s138;){
            let o72 = M4(e273)[l4];
            e273.remove(), e273 = o72;
        }
        t369.length && zr(this, s138, t369);
    }
    getElementsByClassName(t370) {
        let e274 = new S4, { [l4]: s139 , [u5]: o73  } = this;
        for(; s139 !== o73;)s139.nodeType === 1 && s139.hasAttribute("class") && s139.classList.has(t370) && e274.push(s139), s139 = s139[l4];
        return e274;
    }
    getElementsByTagName(t371) {
        let e275 = new S4, { [l4]: s140 , [u5]: o74  } = this;
        for(; s140 !== o74;)s140.nodeType === 1 && (s140.localName === t371 || kt(s140) === t371) && e275.push(s140), s140 = s140[l4];
        return e275;
    }
    querySelector(t372) {
        let e276 = Bt(this, t372), { [l4]: s141 , [u5]: o75  } = this;
        for(; s141 !== o75;){
            if (s141.nodeType === 1 && e276(s141)) return s141;
            s141 = s141[l4];
        }
        return null;
    }
    querySelectorAll(t373) {
        let e277 = Bt(this, t373), s142 = new S4, { [l4]: o76 , [u5]: c68  } = this;
        for(; o76 !== c68;)o76.nodeType === 1 && e277(o76) && s142.push(o76), o76 = o76[l4];
        return s142;
    }
    appendChild(t374) {
        return this.insertBefore(t374, this[u5]);
    }
    contains(t375) {
        let e278 = t375;
        for(; e278 && e278 !== this;)e278 = e278.parentNode;
        return e278 === this;
    }
    insertBefore(t376, e279 = null) {
        if (t376 === e279) return t376;
        if (t376 === this) throw new Error("unable to append a node to itself");
        let s143 = e279 || this[u5];
        switch(t376.nodeType){
            case 1:
                t376.remove(), t376.parentNode = this, wt2(s143[N5], t376, s143), lt2(t376, null), It(t376);
                break;
            case 11:
                {
                    let { [C4]: o77 , firstChild: c69 , lastChild: m15  } = t376;
                    if (c69) {
                        ys(s143[N5], c69, m15, s143), P3(t376, t376[u5]), o77 && o77.replaceChildren();
                        do c69.parentNode = this, lt2(c69, null), c69.nodeType === 1 && It(c69);
                        while (c69 !== m15 && (c69 = J4(c69)))
                    }
                    break;
                }
            case 3:
            case 8:
                t376.remove();
            default:
                t376.parentNode = this, $2(s143[N5], t376, s143), lt2(t376, null);
                break;
        }
        return t376;
    }
    normalize() {
        let { [l4]: t377 , [u5]: e280  } = this;
        for(; t377 !== e280;){
            let { [l4]: s144 , [N5]: o78 , nodeType: c70  } = t377;
            c70 === 3 && (t377[E6] ? o78 && o78.nodeType === 3 && (o78.textContent += t377.textContent, t377.remove()) : t377.remove()), t377 = s144;
        }
    }
    removeChild(t378) {
        if (t378.parentNode !== this) throw new Error("node is not a child");
        return t378.remove(), t378;
    }
    replaceChild(t379, e281) {
        let s145 = M4(e281)[l4];
        return e281.remove(), this.insertBefore(t379, s145), e281;
    }
};
var mt2 = class extends yt1 {
    getElementById(t380) {
        let { [l4]: e282 , [u5]: s146  } = this;
        for(; e282 !== s146;){
            if (e282.nodeType === 1 && e282.id === t380) return e282;
            e282 = e282[l4];
        }
        return null;
    }
    cloneNode(t381) {
        let { ownerDocument: e283 , constructor: s147  } = this, o79 = new s147(e283);
        if (t381) {
            let { [u5]: c71  } = o79;
            for (let m16 of this.childNodes)o79.insertBefore(m16.cloneNode(t381), c71);
        }
        return o79;
    }
    toString() {
        let { childNodes: t382 , localName: e284  } = this;
        return `<${e284}>${t382.join("")}</${e284}>`;
    }
    toJSON() {
        let t383 = [];
        return ks(this, t383), t383;
    }
};
var ft2 = class extends mt2 {
    constructor(t384){
        super(t384, "#document-fragment", 11);
    }
};
var F6 = class extends I6 {
    constructor(t385, e285, s148 = "", o80 = ""){
        super(t385, "#document-type", 10), this.name = e285, this.publicId = s148, this.systemId = o80;
    }
    cloneNode() {
        let { ownerDocument: t386 , name: e286 , publicId: s149 , systemId: o81  } = this;
        return new F6(t386, e286, s149, o81);
    }
    toString() {
        let { name: t387 , publicId: e287 , systemId: s150  } = this, o82 = 0 < e287.length, c72 = [
            t387
        ];
        return o82 && c72.push("PUBLIC", `"${e287}"`), s150.length && (o82 || c72.push("SYSTEM"), c72.push(`"${s150}"`)), `<!DOCTYPE ${c72.join(" ")}>`;
    }
    toJSON() {
        let t388 = [];
        return Fr(this, t388), t388;
    }
};
var Oe = (r)=>r.childNodes.join(""), De = (r, t389)=>{
    let { ownerDocument: e288  } = r, { constructor: s151  } = e288, o83 = new s151;
    o83[L6] = e288[L6];
    let { childNodes: c73  } = fe2(o83, ct2(r), t389);
    r.replaceChildren(...c73.map($s, e288));
};
function $s(r) {
    switch(r.ownerDocument = this, r.nodeType){
        case 1:
        case 11:
            r.childNodes.forEach($s, this);
            break;
    }
    return r;
}
var Le = new WeakMap, Jr = (r)=>`data-${a4(r)}`, Yo = (r)=>r.slice(5).replace(/-([a-z])/g, (t, e289)=>e289.toUpperCase()), Ko = {
    get (r, t390) {
        if (t390 in r) return Le.get(r).getAttribute(Jr(t390));
    },
    set (r, t391, e290) {
        return r[t391] = e290, Le.get(r).setAttribute(Jr(t391), e290), !0;
    },
    deleteProperty (r, t392) {
        return t392 in r && Le.get(r).removeAttribute(Jr(t392)), delete r[t392];
    }
}, Gt = class {
    constructor(t393){
        for (let { name: e291 , value: s152  } of t393.attributes)/^data-/.test(e291) && (this[Yo(e291)] = s152);
        return Le.set(this, t393), new Proxy(this, Ko);
    }
};
A8(Gt.prototype, null);
var { add: Qo  } = Set.prototype, qs = (r, t394)=>{
    for (let e292 of t394)e292 && Qo.call(r, e292);
}, Vt = ({ [Ir]: r , value: t395  })=>{
    let e293 = r.getAttributeNode("class");
    e293 ? e293.value = t395 : Ut(r, new _5(r.ownerDocument, "class", t395));
}, _e = class extends Set {
    constructor(t396){
        super(), this[Ir] = t396;
        let e294 = t396.getAttributeNode("class");
        e294 && qs(this, e294.value.split(/\s+/));
    }
    get length() {
        return this.size;
    }
    get value() {
        return [
            ...this
        ].join(" ");
    }
    add(...t397) {
        qs(this, t397), Vt(this);
    }
    contains(t398) {
        return this.has(t398);
    }
    remove(...t399) {
        for (let e295 of t399)this.delete(e295);
        Vt(this);
    }
    toggle(t400, e296) {
        if (this.has(t400)) {
            if (e296) return !0;
            this.delete(t400), Vt(this);
        } else if (e296 || arguments.length === 1) return super.add(t400), Vt(this), !0;
        return !1;
    }
    replace(t401, e297) {
        return this.has(t401) ? (this.delete(t401), super.add(e297), Vt(this), !0) : !1;
    }
    supports() {
        return !0;
    }
};
var He = new WeakMap, Yr = (r)=>[
        ...r.keys()
    ].filter((t402)=>t402 !== C4), Kr = (r)=>{
    let t403 = He.get(r).getAttributeNode("style");
    if ((!t403 || t403[Nt] || r.get(C4) !== t403) && (r.clear(), t403)) {
        r.set(C4, t403);
        for (let e298 of t403[E6].split(/\s*;\s*/)){
            let [s153, ...o84] = e298.split(":");
            if (o84.length > 0) {
                s153 = s153.trim();
                let c74 = o84.join(":").trim();
                s153 && c74 && r.set(s153, c74);
            }
        }
    }
    return t403;
}, ve = {
    get (r, t404) {
        return t404 in Zo ? r[t404] : (Kr(r), t404 === "length" ? Yr(r).length : /^\d+$/.test(t404) ? Yr(r)[t404] : r.get(a4(t404)));
    },
    set (r, t405, e299) {
        if (t405 === "cssText") r[t405] = e299;
        else {
            let s154 = Kr(r);
            if (e299 == null ? r.delete(a4(t405)) : r.set(a4(t405), e299), !s154) {
                let o85 = He.get(r);
                s154 = o85.ownerDocument.createAttribute("style"), o85.setAttributeNode(s154), r.set(C4, s154);
            }
            s154[Nt] = !1, s154[E6] = r.toString();
        }
        return !0;
    }
}, Ft = class extends Map {
    constructor(t406){
        return super(), He.set(this, t406), new Proxy(this, ve);
    }
    get cssText() {
        return this.toString();
    }
    set cssText(t407) {
        He.get(this).setAttribute("style", t407);
    }
    getPropertyValue(t408) {
        let e300 = this[C4];
        return ve.get(e300, t408);
    }
    setProperty(t409, e301) {
        let s155 = this[C4];
        ve.set(s155, t409, e301);
    }
    removeProperty(t410) {
        let e302 = this[C4];
        ve.set(e302, t410, null);
    }
    [Symbol.iterator]() {
        let t411 = Yr(this[C4]), { length: e303  } = t411, s156 = 0;
        return {
            next () {
                let o86 = s156 === e303;
                return {
                    done: o86,
                    value: o86 ? null : t411[s156++]
                };
            }
        };
    }
    get [C4]() {
        return this;
    }
    toString() {
        let t412 = this[C4];
        Kr(t412);
        let e304 = [];
        return t412.forEach(tn, e304), e304.join(";");
    }
}, { prototype: Zo  } = Ft;
function tn(r, t413) {
    t413 !== C4 && this.push(`${t413}:${r}`);
}
var H6 = class {
    static get BUBBLING_PHASE() {
        return 3;
    }
    static get AT_TARGET() {
        return 2;
    }
    static get CAPTURING_PHASE() {
        return 1;
    }
    static get NONE() {
        return 0;
    }
    constructor(t414, e305 = {}){
        this.type = t414, this.bubbles = !!e305.bubbles, this.cancelBubble = !1, this._stopImmediatePropagationFlag = !1, this.cancelable = !!e305.cancelable, this.eventPhase = this.NONE, this.timeStamp = Date.now(), this.defaultPrevented = !1, this.originalTarget = null, this.returnValue = null, this.srcElement = null, this.target = null, this._path = [];
    }
    get BUBBLING_PHASE() {
        return 3;
    }
    get AT_TARGET() {
        return 2;
    }
    get CAPTURING_PHASE() {
        return 1;
    }
    get NONE() {
        return 0;
    }
    preventDefault() {
        this.defaultPrevented = !0;
    }
    composedPath() {
        return this._path;
    }
    stopPropagation() {
        this.cancelBubble = !0;
    }
    stopImmediatePropagation() {
        this.stopPropagation(), this._stopImmediatePropagationFlag = !0;
    }
};
var Mt1 = class extends Array {
    constructor(t415){
        super(), this.ownerElement = t415;
    }
    getNamedItem(t416) {
        return this.ownerElement.getAttributeNode(t416);
    }
    setNamedItem(t417) {
        this.ownerElement.setAttributeNode(t417), this.unshift(t417);
    }
    removeNamedItem(t418) {
        let e306 = this.getNamedItem(t418);
        this.ownerElement.removeAttribute(t418), this.splice(this.indexOf(e306), 1);
    }
    item(t419) {
        return t419 < this.length ? this[t419] : null;
    }
    getNamedItemNS(t, e307) {
        return this.getNamedItem(e307);
    }
    setNamedItemNS(t, e308) {
        return this.setNamedItem(e308);
    }
    removeNamedItemNS(t, e309) {
        return this.removeNamedItem(e309);
    }
};
var Et2 = class extends mt2 {
    constructor(t420){
        super(t420.ownerDocument, "#shadow-root", 11), this.host = t420;
    }
    get innerHTML() {
        return Oe(this);
    }
    set innerHTML(t421) {
        De(this, t421);
    }
};
var en = {
    get (r, t422) {
        return t422 in r ? r[t422] : r.find(({ name: e310  })=>e310 === t422);
    }
}, zs = (r, t423, e311)=>{
    if ("ownerSVGElement" in t423) {
        let s157 = r.createElementNS(ht2, e311);
        return s157.ownerSVGElement = t423.ownerSVGElement, s157;
    }
    return r.createElement(e311);
}, rn = ({ localName: r , ownerDocument: t424  })=>t424[X3].voidElements.test(r), Y4 = class extends yt1 {
    constructor(t425, e312){
        super(t425, e312, 1), this[ot2] = null, this[ce3] = null, this[ae3] = null;
    }
    get isConnected() {
        return Ne(this);
    }
    get parentElement() {
        return xe(this);
    }
    get previousSibling() {
        return et2(this);
    }
    get nextSibling() {
        return J4(this);
    }
    get namespaceURI() {
        return "http://www.w3.org/1999/xhtml";
    }
    get previousElementSibling() {
        return be(this);
    }
    get nextElementSibling() {
        return At1(this);
    }
    before(...t426) {
        we(this, t426);
    }
    after(...t427) {
        Ce1(this, t427);
    }
    replaceWith(...t428) {
        Ae(this, t428);
    }
    remove() {
        Se1(this[N5], this, this[u5][l4]);
    }
    get id() {
        return a5.get(this, "id");
    }
    set id(t429) {
        a5.set(this, "id", t429);
    }
    get className() {
        return this.classList.value;
    }
    set className(t430) {
        let { classList: e313  } = this;
        e313.clear(), e313.add(...t430.split(/\s+/));
    }
    get nodeName() {
        return kt(this);
    }
    get tagName() {
        return kt(this);
    }
    get classList() {
        return this[ot2] || (this[ot2] = new _e(this));
    }
    get dataset() {
        return this[ce3] || (this[ce3] = new Gt(this));
    }
    get nonce() {
        return a5.get(this, "nonce");
    }
    set nonce(t431) {
        a5.set(this, "nonce", t431);
    }
    get style() {
        return this[ae3] || (this[ae3] = new Ft(this));
    }
    get tabIndex() {
        return z6.get(this, "tabindex") || -1;
    }
    set tabIndex(t432) {
        z6.set(this, "tabindex", t432);
    }
    get innerText() {
        let t433 = [], { [l4]: e314 , [u5]: s158  } = this;
        for(; e314 !== s158;)e314.nodeType === 3 ? t433.push(e314.textContent.replace(/\s+/g, " ")) : t433.length && e314[l4] != s158 && fs.has(e314.tagName) && t433.push(`
`), e314 = e314[l4];
        return t433.join("");
    }
    get textContent() {
        let t434 = [], { [l4]: e315 , [u5]: s159  } = this;
        for(; e315 !== s159;)e315.nodeType === 3 && t434.push(e315.textContent), e315 = e315[l4];
        return t434.join("");
    }
    set textContent(t435) {
        this.replaceChildren(), t435 && this.appendChild(new v7(this.ownerDocument, t435));
    }
    get innerHTML() {
        return Oe(this);
    }
    set innerHTML(t436) {
        De(this, t436);
    }
    get outerHTML() {
        return this.toString();
    }
    set outerHTML(t437) {
        let e316 = this.ownerDocument.createElement("");
        e316.innerHTML = t437, this.replaceWith(...e316.childNodes);
    }
    get attributes() {
        let t438 = new Mt1(this), e317 = this[l4];
        for(; e317.nodeType === 2;)t438.push(e317), e317 = e317[l4];
        return new Proxy(t438, en);
    }
    focus() {
        this.dispatchEvent(new H6("focus"));
    }
    getAttribute(t439) {
        if (t439 === "class") return this.className;
        let e318 = this.getAttributeNode(t439);
        return e318 && e318.value;
    }
    getAttributeNode(t440) {
        let e319 = this[l4];
        for(; e319.nodeType === 2;){
            if (e319.name === t440) return e319;
            e319 = e319[l4];
        }
        return null;
    }
    getAttributeNames() {
        let t441 = new S4, e320 = this[l4];
        for(; e320.nodeType === 2;)t441.push(e320.name), e320 = e320[l4];
        return t441;
    }
    hasAttribute(t442) {
        return !!this.getAttributeNode(t442);
    }
    hasAttributes() {
        return this[l4].nodeType === 2;
    }
    removeAttribute(t443) {
        t443 === "class" && this[ot2] && this[ot2].clear();
        let e321 = this[l4];
        for(; e321.nodeType === 2;){
            if (e321.name === t443) {
                Xr(this, e321);
                return;
            }
            e321 = e321[l4];
        }
    }
    removeAttributeNode(t444) {
        let e322 = this[l4];
        for(; e322.nodeType === 2;){
            if (e322 === t444) {
                Xr(this, e322);
                return;
            }
            e322 = e322[l4];
        }
    }
    setAttribute(t445, e323) {
        if (t445 === "class") this.className = e323;
        else {
            let s160 = this.getAttributeNode(t445);
            s160 ? s160.value = e323 : Ut(this, new _5(this.ownerDocument, t445, e323));
        }
    }
    setAttributeNode(t446) {
        let { name: e324  } = t446, s161 = this.getAttributeNode(e324);
        if (s161 !== t446) {
            s161 && this.removeAttributeNode(s161);
            let { ownerElement: o87  } = t446;
            o87 && o87.removeAttributeNode(t446), Ut(this, t446);
        }
        return s161;
    }
    toggleAttribute(t447, e325) {
        return this.hasAttribute(t447) ? e325 ? !0 : (this.removeAttribute(t447), !1) : e325 || arguments.length === 1 ? (this.setAttribute(t447, ""), !0) : !1;
    }
    get shadowRoot() {
        if (Q4.has(this)) {
            let { mode: t448 , shadowRoot: e326  } = Q4.get(this);
            if (t448 === "open") return e326;
        }
        return null;
    }
    attachShadow(t449) {
        if (Q4.has(this)) throw new Error("operation not supported");
        let e327 = new Et2(this);
        return e327.append(...this.childNodes), Q4.set(this, {
            mode: t449.mode,
            shadowRoot: e327
        }), e327;
    }
    matches(t450) {
        return Ws(this, t450);
    }
    closest(t451) {
        let e328 = this, s162 = Bt(e328, t451);
        for(; e328 && !s162(e328);)e328 = e328.parentElement;
        return e328;
    }
    insertAdjacentElement(t452, e329) {
        let { parentElement: s163  } = this;
        switch(t452){
            case "beforebegin":
                if (s163) {
                    s163.insertBefore(e329, this);
                    break;
                }
                return null;
            case "afterbegin":
                this.insertBefore(e329, this.firstChild);
                break;
            case "beforeend":
                this.insertBefore(e329, null);
                break;
            case "afterend":
                if (s163) {
                    s163.insertBefore(e329, this.nextSibling);
                    break;
                }
                return null;
        }
        return e329;
    }
    insertAdjacentHTML(t453, e330) {
        let s164 = this.ownerDocument.createElement("template");
        s164.innerHTML = e330, this.insertAdjacentElement(t453, s164.content);
    }
    insertAdjacentText(t454, e331) {
        let s165 = this.ownerDocument.createTextNode(e331);
        this.insertAdjacentElement(t454, s165);
    }
    cloneNode(t455 = !1) {
        let { ownerDocument: e332 , localName: s166  } = this, o88 = (x18)=>{
            x18.parentNode = m17, P3(p24, x18), p24 = x18;
        }, c75 = zs(e332, this, s166), m17 = c75, p24 = c75, { [l4]: h26 , [u5]: g19  } = this;
        for(; h26 !== g19 && (t455 || h26.nodeType === 2);){
            switch(h26.nodeType){
                case -1:
                    P3(p24, m17[u5]), p24 = m17[u5], m17 = m17.parentNode;
                    break;
                case 1:
                    {
                        let x19 = zs(e332, h26, h26.localName);
                        o88(x19), m17 = x19;
                        break;
                    }
                case 2:
                    {
                        let x20 = h26.cloneNode(t455);
                        x20.ownerElement = m17, o88(x20);
                        break;
                    }
                case 3:
                case 8:
                    o88(h26.cloneNode(t455));
                    break;
            }
            h26 = h26[l4];
        }
        return P3(p24, c75[u5]), c75;
    }
    toString() {
        let t456 = [], { [u5]: e333  } = this, s167 = {
            [l4]: this
        }, o89 = !1;
        do switch(s167 = s167[l4], s167.nodeType){
            case 2:
                {
                    let c76 = " " + s167;
                    switch(c76){
                        case " id":
                        case " class":
                        case " style":
                            break;
                        default:
                            t456.push(c76);
                    }
                    break;
                }
            case -1:
                {
                    let c77 = s167[y6];
                    o89 ? ("ownerSVGElement" in c77 ? t456.push(" />") : rn(c77) ? t456.push(ct2(c77) ? ">" : " />") : t456.push(`></${c77.localName}>`), o89 = !1) : t456.push(`</${c77.localName}>`);
                    break;
                }
            case 1:
                o89 && t456.push(">"), s167.toString !== this.toString ? (t456.push(s167.toString()), s167 = s167[u5], o89 = !1) : (t456.push(`<${s167.localName}`), o89 = !0);
                break;
            case 3:
            case 8:
                t456.push((o89 ? ">" : "") + s167), o89 = !1;
                break;
        }
        while (s167 !== e333)
        return t456.join("");
    }
    toJSON() {
        let t457 = [];
        return Wr(this, t457), t457;
    }
    getAttributeNS(t, e334) {
        return this.getAttribute(e334);
    }
    getElementsByTagNameNS(t, e335) {
        return this.getElementsByTagName(e335);
    }
    hasAttributeNS(t, e336) {
        return this.hasAttribute(e336);
    }
    removeAttributeNS(t, e337) {
        this.removeAttribute(e337);
    }
    setAttributeNS(t, e338, s168) {
        this.setAttribute(e338, s168);
    }
    setAttributeNodeNS(t458) {
        return this.setAttributeNode(t458);
    }
};
var Qr = new WeakMap, sn = {
    get (r, t459) {
        return r[t459];
    },
    set (r, t460, e339) {
        return r[t460] = e339, !0;
    }
}, st2 = class extends Y4 {
    constructor(t461, e340, s169 = null){
        super(t461, e340), this.ownerSVGElement = s169;
    }
    get className() {
        return Qr.has(this) || Qr.set(this, new Proxy({
            baseVal: "",
            animVal: ""
        }, sn)), Qr.get(this);
    }
    set className(t462) {
        let { classList: e341  } = this;
        e341.clear(), e341.add(...t462.split(/\s+/));
    }
    get namespaceURI() {
        return "http://www.w3.org/2000/svg";
    }
    getAttribute(t463) {
        return t463 === "class" ? [
            ...this.classList
        ].join(" ") : super.getAttribute(t463);
    }
    setAttribute(t464, e342) {
        if (t464 === "class") this.className = e342;
        else if (t464 === "style") {
            let { className: s170  } = this;
            s170.baseVal = s170.animVal = e342;
        }
        super.setAttribute(t464, e342);
    }
};
var R6 = ()=>{
    throw new TypeError("Illegal constructor");
};
function Zr() {
    R6();
}
A8(Zr, _5);
Zr.prototype = _5.prototype;
function ts() {
    R6();
}
A8(ts, rt1);
ts.prototype = rt1.prototype;
function es() {
    R6();
}
A8(es, j4);
es.prototype = j4.prototype;
function rs() {
    R6();
}
A8(rs, ft2);
rs.prototype = ft2.prototype;
function ss() {
    R6();
}
A8(ss, F6);
ss.prototype = F6.prototype;
function os() {
    R6();
}
A8(os, Y4);
os.prototype = Y4.prototype;
function ns() {
    R6();
}
A8(ns, I6);
ns.prototype = I6.prototype;
function is() {
    R6();
}
A8(is, Et2);
is.prototype = Et2.prototype;
function cs() {
    R6();
}
A8(cs, v7);
cs.prototype = v7.prototype;
function as() {
    R6();
}
A8(as, st2);
as.prototype = st2.prototype;
var Js = {
    Attr: Zr,
    CharacterData: ts,
    Comment: es,
    DocumentFragment: rs,
    DocumentType: ss,
    Element: os,
    Node: ns,
    ShadowRoot: is,
    Text: cs,
    SVGElement: as
};
var Wt = new WeakMap, n3 = {
    get (r, t465) {
        return Wt.has(r) && Wt.get(r)[t465] || null;
    },
    set (r, t466, e343) {
        Wt.has(r) || Wt.set(r, {});
        let s171 = Wt.get(r), o90 = t466.slice(2);
        s171[t466] && r.removeEventListener(o90, s171[t466], !1), (s171[t466] = e343) && r.addEventListener(o90, e343, !1);
    }
}, i4 = class extends Y4 {
    static get observedAttributes() {
        return [];
    }
    constructor(t467 = null, e344 = ""){
        super(t467, e344);
        let s172 = !t467, o91;
        if (s172) {
            let { constructor: c78  } = this;
            if (!Pt.has(c78)) throw new Error("unable to initialize this Custom Element");
            ({ ownerDocument: t467 , localName: e344 , options: o91  } = Pt.get(c78));
        }
        if (t467[it2]) {
            let { element: c79 , values: m18  } = t467[it2];
            t467[it2] = null;
            for (let [p25, h27] of m18)c79[p25] = h27;
            return c79;
        }
        s172 && (this.ownerDocument = this[u5].ownerDocument = t467, this.localName = e344, tt2.set(this, {
            connected: !1
        }), o91.is && this.setAttribute("is", o91.is));
    }
    blur() {
        this.dispatchEvent(new H6("blur"));
    }
    click() {
        this.dispatchEvent(new H6("click"));
    }
    get accessKeyLabel() {
        let { accessKey: t468  } = this;
        return t468 && `Alt+Shift+${t468}`;
    }
    get isContentEditable() {
        return this.hasAttribute("contenteditable");
    }
    get contentEditable() {
        return f4.get(this, "contenteditable");
    }
    set contentEditable(t469) {
        f4.set(this, "contenteditable", t469);
    }
    get draggable() {
        return f4.get(this, "draggable");
    }
    set draggable(t470) {
        f4.set(this, "draggable", t470);
    }
    get hidden() {
        return f4.get(this, "hidden");
    }
    set hidden(t471) {
        f4.set(this, "hidden", t471);
    }
    get spellcheck() {
        return f4.get(this, "spellcheck");
    }
    set spellcheck(t472) {
        f4.set(this, "spellcheck", t472);
    }
    get accessKey() {
        return a5.get(this, "accesskey");
    }
    set accessKey(t473) {
        a5.set(this, "accesskey", t473);
    }
    get dir() {
        return a5.get(this, "dir");
    }
    set dir(t474) {
        a5.set(this, "dir", t474);
    }
    get lang() {
        return a5.get(this, "lang");
    }
    set lang(t475) {
        a5.set(this, "lang", t475);
    }
    get title() {
        return a5.get(this, "title");
    }
    set title(t476) {
        a5.set(this, "title", t476);
    }
    get onabort() {
        return n3.get(this, "onabort");
    }
    set onabort(t477) {
        n3.set(this, "onabort", t477);
    }
    get onblur() {
        return n3.get(this, "onblur");
    }
    set onblur(t478) {
        n3.set(this, "onblur", t478);
    }
    get oncancel() {
        return n3.get(this, "oncancel");
    }
    set oncancel(t479) {
        n3.set(this, "oncancel", t479);
    }
    get oncanplay() {
        return n3.get(this, "oncanplay");
    }
    set oncanplay(t480) {
        n3.set(this, "oncanplay", t480);
    }
    get oncanplaythrough() {
        return n3.get(this, "oncanplaythrough");
    }
    set oncanplaythrough(t481) {
        n3.set(this, "oncanplaythrough", t481);
    }
    get onchange() {
        return n3.get(this, "onchange");
    }
    set onchange(t482) {
        n3.set(this, "onchange", t482);
    }
    get onclick() {
        return n3.get(this, "onclick");
    }
    set onclick(t483) {
        n3.set(this, "onclick", t483);
    }
    get onclose() {
        return n3.get(this, "onclose");
    }
    set onclose(t484) {
        n3.set(this, "onclose", t484);
    }
    get oncontextmenu() {
        return n3.get(this, "oncontextmenu");
    }
    set oncontextmenu(t485) {
        n3.set(this, "oncontextmenu", t485);
    }
    get oncuechange() {
        return n3.get(this, "oncuechange");
    }
    set oncuechange(t486) {
        n3.set(this, "oncuechange", t486);
    }
    get ondblclick() {
        return n3.get(this, "ondblclick");
    }
    set ondblclick(t487) {
        n3.set(this, "ondblclick", t487);
    }
    get ondrag() {
        return n3.get(this, "ondrag");
    }
    set ondrag(t488) {
        n3.set(this, "ondrag", t488);
    }
    get ondragend() {
        return n3.get(this, "ondragend");
    }
    set ondragend(t489) {
        n3.set(this, "ondragend", t489);
    }
    get ondragenter() {
        return n3.get(this, "ondragenter");
    }
    set ondragenter(t490) {
        n3.set(this, "ondragenter", t490);
    }
    get ondragleave() {
        return n3.get(this, "ondragleave");
    }
    set ondragleave(t491) {
        n3.set(this, "ondragleave", t491);
    }
    get ondragover() {
        return n3.get(this, "ondragover");
    }
    set ondragover(t492) {
        n3.set(this, "ondragover", t492);
    }
    get ondragstart() {
        return n3.get(this, "ondragstart");
    }
    set ondragstart(t493) {
        n3.set(this, "ondragstart", t493);
    }
    get ondrop() {
        return n3.get(this, "ondrop");
    }
    set ondrop(t494) {
        n3.set(this, "ondrop", t494);
    }
    get ondurationchange() {
        return n3.get(this, "ondurationchange");
    }
    set ondurationchange(t495) {
        n3.set(this, "ondurationchange", t495);
    }
    get onemptied() {
        return n3.get(this, "onemptied");
    }
    set onemptied(t496) {
        n3.set(this, "onemptied", t496);
    }
    get onended() {
        return n3.get(this, "onended");
    }
    set onended(t497) {
        n3.set(this, "onended", t497);
    }
    get onerror() {
        return n3.get(this, "onerror");
    }
    set onerror(t498) {
        n3.set(this, "onerror", t498);
    }
    get onfocus() {
        return n3.get(this, "onfocus");
    }
    set onfocus(t499) {
        n3.set(this, "onfocus", t499);
    }
    get oninput() {
        return n3.get(this, "oninput");
    }
    set oninput(t500) {
        n3.set(this, "oninput", t500);
    }
    get oninvalid() {
        return n3.get(this, "oninvalid");
    }
    set oninvalid(t501) {
        n3.set(this, "oninvalid", t501);
    }
    get onkeydown() {
        return n3.get(this, "onkeydown");
    }
    set onkeydown(t502) {
        n3.set(this, "onkeydown", t502);
    }
    get onkeypress() {
        return n3.get(this, "onkeypress");
    }
    set onkeypress(t503) {
        n3.set(this, "onkeypress", t503);
    }
    get onkeyup() {
        return n3.get(this, "onkeyup");
    }
    set onkeyup(t504) {
        n3.set(this, "onkeyup", t504);
    }
    get onload() {
        return n3.get(this, "onload");
    }
    set onload(t505) {
        n3.set(this, "onload", t505);
    }
    get onloadeddata() {
        return n3.get(this, "onloadeddata");
    }
    set onloadeddata(t506) {
        n3.set(this, "onloadeddata", t506);
    }
    get onloadedmetadata() {
        return n3.get(this, "onloadedmetadata");
    }
    set onloadedmetadata(t507) {
        n3.set(this, "onloadedmetadata", t507);
    }
    get onloadstart() {
        return n3.get(this, "onloadstart");
    }
    set onloadstart(t508) {
        n3.set(this, "onloadstart", t508);
    }
    get onmousedown() {
        return n3.get(this, "onmousedown");
    }
    set onmousedown(t509) {
        n3.set(this, "onmousedown", t509);
    }
    get onmouseenter() {
        return n3.get(this, "onmouseenter");
    }
    set onmouseenter(t510) {
        n3.set(this, "onmouseenter", t510);
    }
    get onmouseleave() {
        return n3.get(this, "onmouseleave");
    }
    set onmouseleave(t511) {
        n3.set(this, "onmouseleave", t511);
    }
    get onmousemove() {
        return n3.get(this, "onmousemove");
    }
    set onmousemove(t512) {
        n3.set(this, "onmousemove", t512);
    }
    get onmouseout() {
        return n3.get(this, "onmouseout");
    }
    set onmouseout(t513) {
        n3.set(this, "onmouseout", t513);
    }
    get onmouseover() {
        return n3.get(this, "onmouseover");
    }
    set onmouseover(t514) {
        n3.set(this, "onmouseover", t514);
    }
    get onmouseup() {
        return n3.get(this, "onmouseup");
    }
    set onmouseup(t515) {
        n3.set(this, "onmouseup", t515);
    }
    get onmousewheel() {
        return n3.get(this, "onmousewheel");
    }
    set onmousewheel(t516) {
        n3.set(this, "onmousewheel", t516);
    }
    get onpause() {
        return n3.get(this, "onpause");
    }
    set onpause(t517) {
        n3.set(this, "onpause", t517);
    }
    get onplay() {
        return n3.get(this, "onplay");
    }
    set onplay(t518) {
        n3.set(this, "onplay", t518);
    }
    get onplaying() {
        return n3.get(this, "onplaying");
    }
    set onplaying(t519) {
        n3.set(this, "onplaying", t519);
    }
    get onprogress() {
        return n3.get(this, "onprogress");
    }
    set onprogress(t520) {
        n3.set(this, "onprogress", t520);
    }
    get onratechange() {
        return n3.get(this, "onratechange");
    }
    set onratechange(t521) {
        n3.set(this, "onratechange", t521);
    }
    get onreset() {
        return n3.get(this, "onreset");
    }
    set onreset(t522) {
        n3.set(this, "onreset", t522);
    }
    get onresize() {
        return n3.get(this, "onresize");
    }
    set onresize(t523) {
        n3.set(this, "onresize", t523);
    }
    get onscroll() {
        return n3.get(this, "onscroll");
    }
    set onscroll(t524) {
        n3.set(this, "onscroll", t524);
    }
    get onseeked() {
        return n3.get(this, "onseeked");
    }
    set onseeked(t525) {
        n3.set(this, "onseeked", t525);
    }
    get onseeking() {
        return n3.get(this, "onseeking");
    }
    set onseeking(t526) {
        n3.set(this, "onseeking", t526);
    }
    get onselect() {
        return n3.get(this, "onselect");
    }
    set onselect(t527) {
        n3.set(this, "onselect", t527);
    }
    get onshow() {
        return n3.get(this, "onshow");
    }
    set onshow(t528) {
        n3.set(this, "onshow", t528);
    }
    get onstalled() {
        return n3.get(this, "onstalled");
    }
    set onstalled(t529) {
        n3.set(this, "onstalled", t529);
    }
    get onsubmit() {
        return n3.get(this, "onsubmit");
    }
    set onsubmit(t530) {
        n3.set(this, "onsubmit", t530);
    }
    get onsuspend() {
        return n3.get(this, "onsuspend");
    }
    set onsuspend(t531) {
        n3.set(this, "onsuspend", t531);
    }
    get ontimeupdate() {
        return n3.get(this, "ontimeupdate");
    }
    set ontimeupdate(t532) {
        n3.set(this, "ontimeupdate", t532);
    }
    get ontoggle() {
        return n3.get(this, "ontoggle");
    }
    set ontoggle(t533) {
        n3.set(this, "ontoggle", t533);
    }
    get onvolumechange() {
        return n3.get(this, "onvolumechange");
    }
    set onvolumechange(t534) {
        n3.set(this, "onvolumechange", t534);
    }
    get onwaiting() {
        return n3.get(this, "onwaiting");
    }
    set onwaiting(t535) {
        n3.set(this, "onwaiting", t535);
    }
    get onauxclick() {
        return n3.get(this, "onauxclick");
    }
    set onauxclick(t536) {
        n3.set(this, "onauxclick", t536);
    }
    get ongotpointercapture() {
        return n3.get(this, "ongotpointercapture");
    }
    set ongotpointercapture(t537) {
        n3.set(this, "ongotpointercapture", t537);
    }
    get onlostpointercapture() {
        return n3.get(this, "onlostpointercapture");
    }
    set onlostpointercapture(t538) {
        n3.set(this, "onlostpointercapture", t538);
    }
    get onpointercancel() {
        return n3.get(this, "onpointercancel");
    }
    set onpointercancel(t539) {
        n3.set(this, "onpointercancel", t539);
    }
    get onpointerdown() {
        return n3.get(this, "onpointerdown");
    }
    set onpointerdown(t540) {
        n3.set(this, "onpointerdown", t540);
    }
    get onpointerenter() {
        return n3.get(this, "onpointerenter");
    }
    set onpointerenter(t541) {
        n3.set(this, "onpointerenter", t541);
    }
    get onpointerleave() {
        return n3.get(this, "onpointerleave");
    }
    set onpointerleave(t542) {
        n3.set(this, "onpointerleave", t542);
    }
    get onpointermove() {
        return n3.get(this, "onpointermove");
    }
    set onpointermove(t543) {
        n3.set(this, "onpointermove", t543);
    }
    get onpointerout() {
        return n3.get(this, "onpointerout");
    }
    set onpointerout(t544) {
        n3.set(this, "onpointerout", t544);
    }
    get onpointerover() {
        return n3.get(this, "onpointerover");
    }
    set onpointerover(t545) {
        n3.set(this, "onpointerover", t545);
    }
    get onpointerup() {
        return n3.get(this, "onpointerup");
    }
    set onpointerup(t546) {
        n3.set(this, "onpointerup", t546);
    }
};
var js = "template", Xt = class extends i4 {
    constructor(t547){
        super(t547, js);
        let e345 = this.ownerDocument.createDocumentFragment();
        (this[vt2] = e345)[C4] = this;
    }
    get content() {
        if (this.hasChildNodes() && !this[vt2].hasChildNodes()) for (let t548 of this.childNodes)this[vt2].appendChild(t548.cloneNode(!0));
        return this[vt2];
    }
};
T8(js, Xt);
var ke = class extends i4 {
    constructor(t549, e346 = "html"){
        super(t549, e346);
    }
};
var { toString: on  } = i4.prototype, Z4 = class extends i4 {
    get innerHTML() {
        return this.textContent;
    }
    set innerHTML(t550) {
        this.textContent = t550;
    }
    toString() {
        return on.call(this.cloneNode()).replace(/></, `>${this.textContent}<`);
    }
};
var Ys = "script", $t = class extends Z4 {
    constructor(t551, e347 = Ys){
        super(t551, e347);
    }
    get type() {
        return a5.get(this, "type");
    }
    set type(t552) {
        a5.set(this, "type", t552);
    }
    get src() {
        return a5.get(this, "src");
    }
    set src(t553) {
        a5.set(this, "src", t553);
    }
    get defer() {
        return f4.get(this, "defer");
    }
    set defer(t554) {
        f4.set(this, "defer", t554);
    }
    get crossOrigin() {
        return a5.get(this, "crossorigin");
    }
    set crossOrigin(t555) {
        a5.set(this, "crossorigin", t555);
    }
    get nomodule() {
        return f4.get(this, "nomodule");
    }
    set nomodule(t556) {
        f4.set(this, "nomodule", t556);
    }
    get referrerPolicy() {
        return a5.get(this, "referrerpolicy");
    }
    set referrerPolicy(t557) {
        a5.set(this, "referrerpolicy", t557);
    }
    get nonce() {
        return a5.get(this, "nonce");
    }
    set nonce(t558) {
        a5.set(this, "nonce", t558);
    }
    get async() {
        return f4.get(this, "async");
    }
    set async(t559) {
        f4.set(this, "async", t559);
    }
    get text() {
        return this.textContent;
    }
    set text(t560) {
        this.textContent = t560;
    }
};
T8(Ys, $t);
var Pe = class extends i4 {
    constructor(t561, e348 = "frame"){
        super(t561, e348);
    }
};
var Ks = "iframe", qt = class extends i4 {
    constructor(t562, e349 = Ks){
        super(t562, e349);
    }
    get src() {
        return a5.get(this, "src");
    }
    set src(t563) {
        a5.set(this, "src", t563);
    }
    get srcdoc() {
        return a5.get(this, "srcdoc");
    }
    set srcdoc(t564) {
        a5.set(this, "srcdoc", t564);
    }
    get name() {
        return a5.get(this, "name");
    }
    set name(t565) {
        a5.set(this, "name", t565);
    }
    get allow() {
        return a5.get(this, "allow");
    }
    set allow(t566) {
        a5.set(this, "allow", t566);
    }
    get allowFullscreen() {
        return f4.get(this, "allowfullscreen");
    }
    set allowFullscreen(t567) {
        f4.set(this, "allowfullscreen", t567);
    }
    get referrerPolicy() {
        return a5.get(this, "referrerpolicy");
    }
    set referrerPolicy(t568) {
        a5.set(this, "referrerpolicy", t568);
    }
    get loading() {
        return a5.get(this, "loading");
    }
    set loading(t569) {
        a5.set(this, "loading", t569);
    }
};
T8(Ks, qt);
var Ie = class extends i4 {
    constructor(t570, e350 = "object"){
        super(t570, e350);
    }
};
var Re1 = class extends i4 {
    constructor(t571, e351 = "head"){
        super(t571, e351);
    }
};
var Ue = class extends i4 {
    constructor(t572, e352 = "body"){
        super(t572, e352);
    }
};
var Qs = "style", zt = class extends Z4 {
    constructor(t573, e353 = Qs){
        super(t573, e353), this[pt1] = null;
    }
    get sheet() {
        let t574 = this[pt1];
        return t574 !== null ? t574 : this[pt1] = _t(this.textContent);
    }
    get innerHTML() {
        return super.innerHTML || "";
    }
    set innerHTML(t575) {
        super.textContent = t575, this[pt1] = null;
    }
    get innerText() {
        return super.innerText || "";
    }
    set innerText(t576) {
        super.textContent = t576, this[pt1] = null;
    }
    get textContent() {
        return super.textContent || "";
    }
    set textContent(t577) {
        super.textContent = t577, this[pt1] = null;
    }
};
T8(Qs, zt);
var Be1 = class extends i4 {
    constructor(t578, e354 = "time"){
        super(t578, e354);
    }
};
var Ge1 = class extends i4 {
    constructor(t579, e355 = "fieldset"){
        super(t579, e355);
    }
};
var Ve = class extends i4 {
    constructor(t580, e356 = "embed"){
        super(t580, e356);
    }
};
var Fe = class extends i4 {
    constructor(t581, e357 = "hr"){
        super(t581, e357);
    }
};
var We1 = class extends i4 {
    constructor(t582, e358 = "progress"){
        super(t582, e358);
    }
};
var Xe2 = class extends i4 {
    constructor(t583, e359 = "p"){
        super(t583, e359);
    }
};
var $e = class extends i4 {
    constructor(t584, e360 = "table"){
        super(t584, e360);
    }
};
var qe = class extends i4 {
    constructor(t585, e361 = "frameset"){
        super(t585, e361);
    }
};
var ze = class extends i4 {
    constructor(t586, e362 = "li"){
        super(t586, e362);
    }
};
var Je = class extends i4 {
    constructor(t587, e363 = "base"){
        super(t587, e363);
    }
};
var je = class extends i4 {
    constructor(t588, e364 = "datalist"){
        super(t588, e364);
    }
};
var Zs = "input", Jt = class extends i4 {
    constructor(t589, e365 = Zs){
        super(t589, e365);
    }
    get autofocus() {
        return f4.get(this, "autofocus") || -1;
    }
    set autofocus(t590) {
        f4.set(this, "autofocus", t590);
    }
    get disabled() {
        return f4.get(this, "disabled");
    }
    set disabled(t591) {
        f4.set(this, "disabled", t591);
    }
    get name() {
        return this.getAttribute("name");
    }
    set name(t592) {
        this.setAttribute("name", t592);
    }
    get placeholder() {
        return this.getAttribute("placeholder");
    }
    set placeholder(t593) {
        this.setAttribute("placeholder", t593);
    }
    get type() {
        return this.getAttribute("type");
    }
    set type(t594) {
        this.setAttribute("type", t594);
    }
    get value() {
        return a5.get(this, "value");
    }
    set value(t595) {
        a5.set(this, "value", t595);
    }
};
T8(Zs, Jt);
var Ye = class extends i4 {
    constructor(t596, e366 = "param"){
        super(t596, e366);
    }
};
var Ke = class extends i4 {
    constructor(t597, e367 = "media"){
        super(t597, e367);
    }
};
var Qe2 = class extends i4 {
    constructor(t598, e368 = "audio"){
        super(t598, e368);
    }
};
var to = "h1", jt1 = class extends i4 {
    constructor(t599, e369 = to){
        super(t599, e369);
    }
};
T8([
    to,
    "h2",
    "h3",
    "h4",
    "h5",
    "h6"
], jt1);
var Ze1 = class extends i4 {
    constructor(t600, e370 = "dir"){
        super(t600, e370);
    }
};
var tr = class extends i4 {
    constructor(t601, e371 = "quote"){
        super(t601, e371);
    }
};
var oo = gs(so(), 1);
var { createCanvas: cn  } = oo.default, no = "canvas", Yt = class extends i4 {
    constructor(t602, e372 = no){
        super(t602, e372), this[U6] = cn(300, 150);
    }
    get width() {
        return this[U6].width;
    }
    set width(t603) {
        z6.set(this, "width", t603), this[U6].width = t603;
    }
    get height() {
        return this[U6].height;
    }
    set height(t604) {
        z6.set(this, "height", t604), this[U6].height = t604;
    }
    getContext(t605) {
        return this[U6].getContext(t605);
    }
    toDataURL(...t606) {
        return this[U6].toDataURL(...t606);
    }
};
T8(no, Yt);
var er = class extends i4 {
    constructor(t607, e373 = "legend"){
        super(t607, e373);
    }
};
var io = "option", Kt = class extends i4 {
    constructor(t608, e374 = io){
        super(t608, e374);
    }
    get value() {
        return a5.get(this, "value");
    }
    set value(t609) {
        a5.set(this, "value", t609);
    }
    get selected() {
        return f4.get(this, "selected");
    }
    set selected(t610) {
        let e375 = this.parentElement?.querySelector("option[selected]");
        e375 && e375 !== this && (e375.selected = !1), f4.set(this, "selected", t610);
    }
};
T8(io, Kt);
var rr = class extends i4 {
    constructor(t611, e376 = "span"){
        super(t611, e376);
    }
};
var sr = class extends i4 {
    constructor(t612, e377 = "meter"){
        super(t612, e377);
    }
};
var or = class extends i4 {
    constructor(t613, e378 = "video"){
        super(t613, e378);
    }
};
var nr = class extends i4 {
    constructor(t614, e379 = "td"){
        super(t614, e379);
    }
};
var co = "title", Qt = class extends Z4 {
    constructor(t615, e380 = co){
        super(t615, e380);
    }
};
T8(co, Qt);
var ir = class extends i4 {
    constructor(t616, e381 = "output"){
        super(t616, e381);
    }
};
var cr = class extends i4 {
    constructor(t617, e382 = "tr"){
        super(t617, e382);
    }
};
var ar = class extends i4 {
    constructor(t618, e383 = "data"){
        super(t618, e383);
    }
};
var lr = class extends i4 {
    constructor(t619, e384 = "menu"){
        super(t619, e384);
    }
};
var ao = "select", Zt = class extends i4 {
    constructor(t620, e385 = ao){
        super(t620, e385);
    }
    get options() {
        let t621 = new S4, { firstElementChild: e386  } = this;
        for(; e386;)e386.tagName === "OPTGROUP" ? t621.push(...e386.children) : t621.push(e386), e386 = e386.nextElementSibling;
        return t621;
    }
    get disabled() {
        return f4.get(this, "disabled");
    }
    set disabled(t622) {
        f4.set(this, "disabled", t622);
    }
    get name() {
        return this.getAttribute("name");
    }
    set name(t623) {
        this.setAttribute("name", t623);
    }
    get value() {
        return this.querySelector("option[selected]")?.value;
    }
};
T8(ao, Zt);
var ur = class extends i4 {
    constructor(t624, e387 = "br"){
        super(t624, e387);
    }
};
var lo = "button", te3 = class extends i4 {
    constructor(t625, e388 = lo){
        super(t625, e388);
    }
    get disabled() {
        return f4.get(this, "disabled");
    }
    set disabled(t626) {
        f4.set(this, "disabled", t626);
    }
    get name() {
        return this.getAttribute("name");
    }
    set name(t627) {
        this.setAttribute("name", t627);
    }
    get type() {
        return this.getAttribute("type");
    }
    set type(t628) {
        this.setAttribute("type", t628);
    }
};
T8(lo, te3);
var mr = class extends i4 {
    constructor(t629, e389 = "map"){
        super(t629, e389);
    }
};
var pr = class extends i4 {
    constructor(t630, e390 = "optgroup"){
        super(t630, e390);
    }
};
var hr = class extends i4 {
    constructor(t631, e391 = "dl"){
        super(t631, e391);
    }
};
var uo = "textarea", ee1 = class extends Z4 {
    constructor(t632, e392 = uo){
        super(t632, e392);
    }
    get disabled() {
        return f4.get(this, "disabled");
    }
    set disabled(t633) {
        f4.set(this, "disabled", t633);
    }
    get name() {
        return this.getAttribute("name");
    }
    set name(t634) {
        this.setAttribute("name", t634);
    }
    get placeholder() {
        return this.getAttribute("placeholder");
    }
    set placeholder(t635) {
        this.setAttribute("placeholder", t635);
    }
    get type() {
        return this.getAttribute("type");
    }
    set type(t636) {
        this.setAttribute("type", t636);
    }
    get value() {
        return this.textContent;
    }
    set value(t637) {
        this.textContent = t637;
    }
};
T8(uo, ee1);
var dr = class extends i4 {
    constructor(t638, e393 = "font"){
        super(t638, e393);
    }
};
var gr = class extends i4 {
    constructor(t639, e394 = "div"){
        super(t639, e394);
    }
};
var mo = "link", re3 = class extends i4 {
    constructor(t640, e395 = mo){
        super(t640, e395);
    }
    get disabled() {
        return f4.get(this, "disabled");
    }
    set disabled(t641) {
        f4.set(this, "disabled", t641);
    }
    get href() {
        return a5.get(this, "href");
    }
    set href(t642) {
        a5.set(this, "href", t642);
    }
    get hreflang() {
        return a5.get(this, "hreflang");
    }
    set hreflang(t643) {
        a5.set(this, "hreflang", t643);
    }
    get media() {
        return a5.get(this, "media");
    }
    set media(t644) {
        a5.set(this, "media", t644);
    }
    get rel() {
        return a5.get(this, "rel");
    }
    set rel(t645) {
        a5.set(this, "rel", t645);
    }
    get type() {
        return a5.get(this, "type");
    }
    set type(t646) {
        a5.set(this, "type", t646);
    }
};
T8(mo, re3);
var fr = class extends i4 {
    constructor(t647, e396 = "slot"){
        super(t647, e396);
    }
};
var Er = class extends i4 {
    constructor(t648, e397 = "form"){
        super(t648, e397);
    }
};
var po = "img", Tt1 = class extends i4 {
    constructor(t649, e398 = po){
        super(t649, e398);
    }
    get alt() {
        return a5.get(this, "alt");
    }
    set alt(t650) {
        a5.set(this, "alt", t650);
    }
    get sizes() {
        return a5.get(this, "sizes");
    }
    set sizes(t651) {
        a5.set(this, "sizes", t651);
    }
    get src() {
        return a5.get(this, "src");
    }
    set src(t652) {
        a5.set(this, "src", t652);
    }
    get srcset() {
        return a5.get(this, "srcset");
    }
    set srcset(t653) {
        a5.set(this, "srcset", t653);
    }
    get title() {
        return a5.get(this, "title");
    }
    set title(t654) {
        a5.set(this, "title", t654);
    }
    get width() {
        return z6.get(this, "width");
    }
    set width(t655) {
        z6.set(this, "width", t655);
    }
    get height() {
        return z6.get(this, "height");
    }
    set height(t656) {
        z6.set(this, "height", t656);
    }
};
T8(po, Tt1);
var Tr = class extends i4 {
    constructor(t657, e399 = "pre"){
        super(t657, e399);
    }
};
var Nr = class extends i4 {
    constructor(t658, e400 = "ul"){
        super(t658, e400);
    }
};
var ho = "meta", se2 = class extends i4 {
    constructor(t659, e401 = ho){
        super(t659, e401);
    }
    get name() {
        return a5.get(this, "name");
    }
    set name(t660) {
        a5.set(this, "name", t660);
    }
    get httpEquiv() {
        return a5.get(this, "http-equiv");
    }
    set httpEquiv(t661) {
        a5.set(this, "http-equiv", t661);
    }
    get content() {
        return a5.get(this, "content");
    }
    set content(t662) {
        a5.set(this, "content", t662);
    }
    get charset() {
        return a5.get(this, "charset");
    }
    set charset(t663) {
        a5.set(this, "charset", t663);
    }
    get media() {
        return a5.get(this, "media");
    }
    set media(t664) {
        a5.set(this, "media", t664);
    }
};
T8(ho, se2);
var xr = class extends i4 {
    constructor(t665, e402 = "picture"){
        super(t665, e402);
    }
};
var br = class extends i4 {
    constructor(t666, e403 = "area"){
        super(t666, e403);
    }
};
var wr = class extends i4 {
    constructor(t667, e404 = "ol"){
        super(t667, e404);
    }
};
var Cr = class extends i4 {
    constructor(t668, e405 = "caption"){
        super(t668, e405);
    }
};
var go = "a", oe2 = class extends i4 {
    constructor(t669, e406 = go){
        super(t669, e406);
    }
    get href() {
        return encodeURI(a5.get(this, "href"));
    }
    set href(t670) {
        a5.set(this, "href", decodeURI(t670));
    }
    get download() {
        return encodeURI(a5.get(this, "download"));
    }
    set download(t671) {
        a5.set(this, "download", decodeURI(t671));
    }
    get target() {
        return a5.get(this, "target");
    }
    set target(t672) {
        a5.set(this, "target", t672);
    }
    get type() {
        return a5.get(this, "type");
    }
    set type(t673) {
        a5.set(this, "type", t673);
    }
};
T8(go, oe2);
var Ar = class extends i4 {
    constructor(t674, e407 = "label"){
        super(t674, e407);
    }
};
var Sr = class extends i4 {
    constructor(t675, e408 = "unknown"){
        super(t675, e408);
    }
};
var yr = class extends i4 {
    constructor(t676, e409 = "mod"){
        super(t676, e409);
    }
};
var Mr = class extends i4 {
    constructor(t677, e410 = "details"){
        super(t677, e410);
    }
};
var fo = "source", ne2 = class extends i4 {
    constructor(t678, e411 = fo){
        super(t678, e411);
    }
    get src() {
        return a5.get(this, "src");
    }
    set src(t679) {
        a5.set(this, "src", t679);
    }
    get srcset() {
        return a5.get(this, "srcset");
    }
    set srcset(t680) {
        a5.set(this, "srcset", t680);
    }
    get sizes() {
        return a5.get(this, "sizes");
    }
    set sizes(t681) {
        a5.set(this, "sizes", t681);
    }
    get type() {
        return a5.get(this, "type");
    }
    set type(t682) {
        a5.set(this, "type", t682);
    }
};
T8(fo, ne2);
var Or = class extends i4 {
    constructor(t683, e412 = "track"){
        super(t683, e412);
    }
};
var Dr = class extends i4 {
    constructor(t684, e413 = "marquee"){
        super(t684, e413);
    }
};
var Eo = {
    HTMLElement: i4,
    HTMLTemplateElement: Xt,
    HTMLHtmlElement: ke,
    HTMLScriptElement: $t,
    HTMLFrameElement: Pe,
    HTMLIFrameElement: qt,
    HTMLObjectElement: Ie,
    HTMLHeadElement: Re1,
    HTMLBodyElement: Ue,
    HTMLStyleElement: zt,
    HTMLTimeElement: Be1,
    HTMLFieldSetElement: Ge1,
    HTMLEmbedElement: Ve,
    HTMLHRElement: Fe,
    HTMLProgressElement: We1,
    HTMLParagraphElement: Xe2,
    HTMLTableElement: $e,
    HTMLFrameSetElement: qe,
    HTMLLIElement: ze,
    HTMLBaseElement: Je,
    HTMLDataListElement: je,
    HTMLInputElement: Jt,
    HTMLParamElement: Ye,
    HTMLMediaElement: Ke,
    HTMLAudioElement: Qe2,
    HTMLHeadingElement: jt1,
    HTMLDirectoryElement: Ze1,
    HTMLQuoteElement: tr,
    HTMLCanvasElement: Yt,
    HTMLLegendElement: er,
    HTMLOptionElement: Kt,
    HTMLSpanElement: rr,
    HTMLMeterElement: sr,
    HTMLVideoElement: or,
    HTMLTableCellElement: nr,
    HTMLTitleElement: Qt,
    HTMLOutputElement: ir,
    HTMLTableRowElement: cr,
    HTMLDataElement: ar,
    HTMLMenuElement: lr,
    HTMLSelectElement: Zt,
    HTMLBRElement: ur,
    HTMLButtonElement: te3,
    HTMLMapElement: mr,
    HTMLOptGroupElement: pr,
    HTMLDListElement: hr,
    HTMLTextAreaElement: ee1,
    HTMLFontElement: dr,
    HTMLDivElement: gr,
    HTMLLinkElement: re3,
    HTMLSlotElement: fr,
    HTMLFormElement: Er,
    HTMLImageElement: Tt1,
    HTMLPreElement: Tr,
    HTMLUListElement: Nr,
    HTMLMetaElement: se2,
    HTMLPictureElement: xr,
    HTMLAreaElement: br,
    HTMLOListElement: wr,
    HTMLTableCaptionElement: Cr,
    HTMLAnchorElement: oe2,
    HTMLLabelElement: Ar,
    HTMLUnknownElement: Sr,
    HTMLModElement: yr,
    HTMLDetailsElement: Mr,
    HTMLSourceElement: ne2,
    HTMLTrackElement: Or,
    HTMLMarqueeElement: Dr
};
var Lr = {
    test: ()=>!0
}, To = {
    "text/html": {
        docType: "<!DOCTYPE html>",
        ignoreCase: !0,
        voidElements: /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i
    },
    "image/svg+xml": {
        docType: '<?xml version="1.0" encoding="utf-8"?>',
        ignoreCase: !1,
        voidElements: Lr
    },
    "text/xml": {
        docType: '<?xml version="1.0" encoding="utf-8"?>',
        ignoreCase: !1,
        voidElements: Lr
    },
    "application/xml": {
        docType: '<?xml version="1.0" encoding="utf-8"?>',
        ignoreCase: !1,
        voidElements: Lr
    },
    "application/xhtml+xml": {
        docType: '<?xml version="1.0" encoding="utf-8"?>',
        ignoreCase: !1,
        voidElements: Lr
    }
};
var Ot1 = class extends H6 {
    constructor(t685, e414 = {}){
        super(t685, e414), this.detail = e414.detail;
    }
};
var ie2 = class extends H6 {
    constructor(t686, e415 = {}){
        super(t686, e415), this.inputType = e415.inputType, this.data = e415.data, this.dataTransfer = e415.dataTransfer, this.isComposing = e415.isComposing || !1, this.ranges = e415.ranges;
    }
};
var No = (r)=>class extends Tt1 {
        constructor(e416, s173){
            switch(super(r), arguments.length){
                case 1:
                    this.height = e416, this.width = e416;
                    break;
                case 2:
                    this.height = s173, this.width = e416;
                    break;
            }
        }
    };
var xo = ({ [y6]: r , [u5]: t687  }, e417 = null)=>{
    he1(r[N5], t687[l4]);
    do {
        let s174 = M4(r), o92 = s174 === t687 ? s174 : s174[l4];
        e417 ? e417.insertBefore(r, e417[u5]) : r.remove(), r = o92;
    }while (r !== t687)
}, Dt1 = class {
    constructor(){
        this[y6] = null, this[u5] = null, this.commonAncestorContainer = null;
    }
    insertNode(t688) {
        this[u5].parentNode.insertBefore(t688, this[y6]);
    }
    selectNode(t689) {
        this[y6] = t689, this[u5] = M4(t689);
    }
    surroundContents(t690) {
        t690.replaceChildren(this.extractContents());
    }
    setStartBefore(t691) {
        this[y6] = t691;
    }
    setStartAfter(t692) {
        this[y6] = t692.nextSibling;
    }
    setEndBefore(t693) {
        this[u5] = M4(t693.previousSibling);
    }
    setEndAfter(t694) {
        this[u5] = M4(t694);
    }
    cloneContents() {
        let { [y6]: t695 , [u5]: e418  } = this, s175 = t695.ownerDocument.createDocumentFragment();
        for(; t695 !== e418;)s175.insertBefore(t695.cloneNode(!0), s175[u5]), t695 = M4(t695), t695 !== e418 && (t695 = t695[l4]);
        return s175;
    }
    deleteContents() {
        xo(this);
    }
    extractContents() {
        let t696 = this[y6].ownerDocument.createDocumentFragment();
        return xo(this, t696), t696;
    }
    createContextualFragment(t697) {
        let e419 = this.commonAncestorContainer.createElement("template");
        return e419.innerHTML = t697, this.selectNode(e419.content), e419.content;
    }
    cloneRange() {
        let t698 = new Dt1;
        return t698[y6] = this[y6], t698[u5] = this[u5], t698;
    }
};
var an = ({ nodeType: r  }, t699)=>{
    switch(r){
        case 1:
            return t699 & ue2;
        case 3:
            return t699 & me2;
        case 8:
            return t699 & pe2;
    }
    return 0;
}, _r = class {
    constructor(t700, e420 = le2){
        this.root = t700, this.currentNode = t700, this.whatToShow = e420;
        let { [l4]: s176 , [u5]: o93  } = t700;
        if (t700.nodeType === 9) {
            let { documentElement: m19  } = t700;
            s176 = m19, o93 = m19[u5];
        }
        let c80 = [];
        for(; s176 !== o93;)an(s176, e420) && c80.push(s176), s176 = s176[l4];
        this[C4] = {
            i: 0,
            nodes: c80
        };
    }
    nextNode() {
        let t701 = this[C4];
        return this.currentNode = t701.i < t701.nodes.length ? t701.nodes[t701.i++] : null, this.currentNode;
    }
};
var bo = (r, t702, e421)=>{
    let { [l4]: s177 , [u5]: o94  } = t702;
    return r.call({
        ownerDocument: t702,
        [l4]: s177,
        [u5]: o94
    }, e421);
}, Co = bs({}, Js, Eo, {
    CustomEvent: Ot1,
    Event: H6,
    EventTarget: ut1,
    InputEvent: ie2,
    NamedNodeMap: Mt1,
    NodeList: S4
}), vr = new WeakMap, V5 = class extends mt2 {
    constructor(t703){
        super(null, "#document", 9), this[L6] = {
            active: !1,
            registry: null
        }, this[K4] = {
            active: !1,
            class: null
        }, this[X3] = To[t703], this[nt1] = null, this[Ht] = null, this[bt1] = null, this[U6] = null, this[it2] = null;
    }
    get defaultView() {
        return vr.has(this) || vr.set(this, new Proxy(globalThis, {
            set: (t704, e422, s178)=>{
                switch(e422){
                    case "addEventListener":
                    case "removeEventListener":
                    case "dispatchEvent":
                        this[xt2][e422] = s178;
                        break;
                    default:
                        t704[e422] = s178;
                        break;
                }
                return !0;
            },
            get: (t705, e423)=>{
                switch(e423){
                    case "addEventListener":
                    case "removeEventListener":
                    case "dispatchEvent":
                        if (!this[xt2]) {
                            let s179 = this[xt2] = new ut1;
                            s179.dispatchEvent = s179.dispatchEvent.bind(s179), s179.addEventListener = s179.addEventListener.bind(s179), s179.removeEventListener = s179.removeEventListener.bind(s179);
                        }
                        return this[xt2][e423];
                    case "document":
                        return this;
                    case "navigator":
                        return {
                            userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
                        };
                    case "window":
                        return vr.get(this);
                    case "customElements":
                        return this[L6].registry || (this[L6] = new de3(this)), this[L6];
                    case "performance":
                        return wo.performance;
                    case "DOMParser":
                        return this[Ht];
                    case "Image":
                        return this[U6] || (this[U6] = No(this)), this[U6];
                    case "MutationObserver":
                        return this[K4].class || (this[K4] = new Ee1(this)), this[K4].class;
                }
                return this[bt1] && this[bt1][e423] || Co[e423] || t705[e423];
            }
        })), vr.get(this);
    }
    get doctype() {
        let t706 = this[nt1];
        if (t706) return t706;
        let { firstChild: e424  } = this;
        return e424 && e424.nodeType === 10 ? this[nt1] = e424 : null;
    }
    set doctype(t707) {
        if (/^([a-z:]+)(\s+system|\s+public(\s+"([^"]+)")?)?(\s+"([^"]+)")?/i.test(t707)) {
            let { $1: e425 , $4: s180 , $6: o95  } = RegExp;
            this[nt1] = new F6(this, e425, s180, o95), $2(this, this[nt1], this[l4]);
        }
    }
    get documentElement() {
        return this.firstElementChild;
    }
    get isConnected() {
        return !0;
    }
    _getParent() {
        return this[xt2];
    }
    createAttribute(t708) {
        return new _5(this, t708);
    }
    createComment(t709) {
        return new j4(this, t709);
    }
    createDocumentFragment() {
        return new ft2(this);
    }
    createDocumentType(t710, e426, s181) {
        return new F6(this, t710, e426, s181);
    }
    createElement(t711) {
        return new Y4(this, t711);
    }
    createRange() {
        let t712 = new Dt1;
        return t712.commonAncestorContainer = this, t712;
    }
    createTextNode(t713) {
        return new v7(this, t713);
    }
    createTreeWalker(t714, e427 = -1) {
        return new _r(t714, e427);
    }
    createNodeIterator(t715, e428 = -1) {
        return this.createTreeWalker(t715, e428);
    }
    createEvent(t716) {
        let e429 = ws(t716 === "Event" ? new H6("") : new Ot1(""));
        return e429.initEvent = e429.initCustomEvent = (s182, o96 = !1, c81 = !1, m20)=>{
            Cs(e429, {
                type: {
                    value: s182
                },
                canBubble: {
                    value: o96
                },
                cancelable: {
                    value: c81
                },
                detail: {
                    value: m20
                }
            });
        }, e429;
    }
    cloneNode(t717 = !1) {
        let { constructor: e430 , [L6]: s183 , [nt1]: o97  } = this, c82 = new e430;
        if (c82[L6] = s183, t717) {
            let m21 = c82[u5], { childNodes: p26  } = this;
            for(let { length: h28  } = p26, g20 = 0; g20 < h28; g20++)c82.insertBefore(p26[g20].cloneNode(!0), m21);
            o97 && (c82[nt1] = p26[0]);
        }
        return c82;
    }
    importNode(t718) {
        let e431 = 1 < arguments.length && !!arguments[1], s184 = t718.cloneNode(e431), { [L6]: o98  } = this, { active: c83  } = o98, m22 = (p27)=>{
            let { ownerDocument: h29 , nodeType: g21  } = p27;
            p27.ownerDocument = this, c83 && h29 !== this && g21 === 1 && o98.upgrade(p27);
        };
        if (m22(s184), e431) switch(s184.nodeType){
            case 1:
            case 11:
                {
                    let { [l4]: p28 , [u5]: h30  } = s184;
                    for(; p28 !== h30;)p28.nodeType === 1 && m22(p28), p28 = p28[l4];
                    break;
                }
        }
        return s184;
    }
    toString() {
        return this.childNodes.join("");
    }
    querySelector(t719) {
        return bo(super.querySelector, this, t719);
    }
    querySelectorAll(t720) {
        return bo(super.querySelectorAll, this, t720);
    }
    getElementsByTagNameNS(t, e432) {
        return this.getElementsByTagName(e432);
    }
    createAttributeNS(t, e433) {
        return this.createAttribute(e433);
    }
    createElementNS(t721, e434, s185) {
        return t721 === ht2 ? new st2(this, e434, null) : this.createElement(e434, s185);
    }
};
A8(Co.Document = function() {
    R6();
}, V5).prototype = V5.prototype;
var ln = (r, t722, e435, s186)=>{
    if (!t722 && at2.has(e435)) {
        let m23 = at2.get(e435);
        return new m23(r, e435);
    }
    let { [L6]: { active: o99 , registry: c84  }  } = r;
    if (o99) {
        let m24 = t722 ? s186.is : e435;
        if (c84.has(m24)) {
            let { Class: p29  } = c84.get(m24), h31 = new p29(r, e435);
            return tt2.set(h31, {
                connected: !1
            }), h31;
        }
    }
    return new i4(r, e435);
}, Lt1 = class extends V5 {
    constructor(){
        super("text/html");
    }
    get all() {
        let t723 = new S4, { [l4]: e436 , [u5]: s187  } = this;
        for(; e436 !== s187;){
            switch(e436.nodeType){
                case 1:
                    t723.push(e436);
                    break;
            }
            e436 = e436[l4];
        }
        return t723;
    }
    get head() {
        let { documentElement: t724  } = this, { firstElementChild: e437  } = t724;
        return (!e437 || e437.tagName !== "HEAD") && (e437 = this.createElement("head"), t724.prepend(e437)), e437;
    }
    get body() {
        let { head: t725  } = this, { nextElementSibling: e438  } = t725;
        return (!e438 || e438.tagName !== "BODY") && (e438 = this.createElement("body"), t725.after(e438)), e438;
    }
    get title() {
        let { head: t726  } = this, e439 = t726.getElementsByTagName("title").shift();
        return e439 ? e439.textContent : "";
    }
    set title(t727) {
        let { head: e440  } = this, s188 = e440.getElementsByTagName("title").shift();
        s188 ? s188.textContent = t727 : e440.insertBefore(this.createElement("title"), e440.firstChild).textContent = t727;
    }
    createElement(t728, e441) {
        let s189 = !!(e441 && e441.is), o100 = ln(this, s189, t728, e441);
        return s189 && o100.setAttribute("is", e441.is), o100;
    }
};
var Hr = class extends V5 {
    constructor(){
        super("image/svg+xml");
    }
    toString() {
        return this[X3].docType + super.toString();
    }
};
var kr = class extends V5 {
    constructor(){
        super("text/xml");
    }
    toString() {
        return this[X3].docType + super.toString();
    }
};
var _t1 = class {
    parseFromString(t729, e442, s190 = null) {
        let o101 = !1, c85;
        return e442 === "text/html" ? (o101 = !0, c85 = new Lt1) : e442 === "image/svg+xml" ? c85 = new Hr : c85 = new kr, c85[Ht] = _t1, s190 && (c85[bt1] = s190), o101 && t729 === "..." && (t729 = "<!doctype html><html><head></head><body></body></html>"), t729 ? fe2(c85, o101, t729) : c85;
    }
};
var { parse: un  } = JSON, ms = (r, t730, e443)=>{
    t730.parentNode = r, $2(e443[N5], t730, e443);
}, mn = (r, t731)=>{
    if (at2.has(t731)) {
        let e444 = at2.get(t731);
        return new e444(r, t731);
    }
    return new i4(r, t731);
}, pn = (r)=>{
    let t732 = typeof r == "string" ? un(r) : r, { length: e445  } = t732, s191 = new Lt1, o102 = s191, c86 = o102[u5], m25 = !1, p30 = 0;
    for(; p30 < e445;){
        let h32 = t732[p30++];
        switch(h32){
            case 1:
                {
                    let g22 = t732[p30++], x22 = m25 || g22 === "svg" || g22 === "SVG", k10 = x22 ? new st2(s191, g22, o102.ownerSVGElement || null) : mn(s191, g22);
                    wt2(c86[N5], k10, c86), k10.parentNode = o102, o102 = k10, c86 = o102[u5], m25 = x22;
                    break;
                }
            case 2:
                {
                    let g23 = t732[p30++], x23 = typeof t732[p30] == "string" ? t732[p30++] : "", k11 = new _5(s191, g23, x23);
                    k11.ownerElement = o102, $2(c86[N5], k11, c86);
                    break;
                }
            case 3:
                ms(o102, new v7(s191, t732[p30++]), c86);
                break;
            case 8:
                ms(o102, new j4(s191, t732[p30++]), c86);
                break;
            case 10:
                {
                    let g24 = [
                        s191
                    ];
                    for(; typeof t732[p30] == "string";)g24.push(t732[p30++]);
                    g24.length === 3 && /\.dtd$/i.test(g24[2]) && g24.splice(2, 0, ""), ms(o102, new F6(...g24), c86);
                    break;
                }
            case 11:
                o102 = s191.createDocumentFragment(), c86 = o102[u5];
            case 9:
                break;
            default:
                do h32 -= -1, m25 && !o102.ownerSVGElement && (m25 = !1), o102 = o102.parentNode || o102;
                while (h32 < 0)
                c86 = o102[u5];
                break;
        }
    }
    switch(p30 && t732[0]){
        case 1:
            return s191.firstElementChild;
        case 11:
            return o102;
    }
    return s191;
}, hn = (r)=>r.toJSON();
var ps = class {
    static get SHOW_ALL() {
        return le2;
    }
    static get SHOW_ELEMENT() {
        return ue2;
    }
    static get SHOW_COMMENT() {
        return pe2;
    }
    static get SHOW_TEXT() {
        return me2;
    }
};
var wd = (r, t733 = null)=>new _t1().parseFromString(r, "text/html", t733).defaultView;
function dn() {
    R6();
}
A8(dn, V5).prototype = V5.prototype;
const mod12 = {
    Attr: Zr,
    CharacterData: ts,
    Comment: es,
    CustomEvent: Ot1,
    DOMParser: _t1,
    Document: dn,
    DocumentFragment: rs,
    DocumentType: ss,
    Element: os,
    Event: H6,
    EventTarget: ut1,
    Facades: Js,
    HTMLAnchorElement: oe2,
    HTMLAreaElement: br,
    HTMLAudioElement: Qe2,
    HTMLBRElement: ur,
    HTMLBaseElement: Je,
    HTMLBodyElement: Ue,
    HTMLButtonElement: te3,
    HTMLCanvasElement: Yt,
    HTMLClasses: Eo,
    HTMLDListElement: hr,
    HTMLDataElement: ar,
    HTMLDataListElement: je,
    HTMLDetailsElement: Mr,
    HTMLDirectoryElement: Ze1,
    HTMLDivElement: gr,
    HTMLElement: i4,
    HTMLEmbedElement: Ve,
    HTMLFieldSetElement: Ge1,
    HTMLFontElement: dr,
    HTMLFormElement: Er,
    HTMLFrameElement: Pe,
    HTMLFrameSetElement: qe,
    HTMLHRElement: Fe,
    HTMLHeadElement: Re1,
    HTMLHeadingElement: jt1,
    HTMLHtmlElement: ke,
    HTMLIFrameElement: qt,
    HTMLImageElement: Tt1,
    HTMLInputElement: Jt,
    HTMLLIElement: ze,
    HTMLLabelElement: Ar,
    HTMLLegendElement: er,
    HTMLLinkElement: re3,
    HTMLMapElement: mr,
    HTMLMarqueeElement: Dr,
    HTMLMediaElement: Ke,
    HTMLMenuElement: lr,
    HTMLMetaElement: se2,
    HTMLMeterElement: sr,
    HTMLModElement: yr,
    HTMLOListElement: wr,
    HTMLObjectElement: Ie,
    HTMLOptGroupElement: pr,
    HTMLOptionElement: Kt,
    HTMLOutputElement: ir,
    HTMLParagraphElement: Xe2,
    HTMLParamElement: Ye,
    HTMLPictureElement: xr,
    HTMLPreElement: Tr,
    HTMLProgressElement: We1,
    HTMLQuoteElement: tr,
    HTMLScriptElement: $t,
    HTMLSelectElement: Zt,
    HTMLSlotElement: fr,
    HTMLSourceElement: ne2,
    HTMLSpanElement: rr,
    HTMLStyleElement: zt,
    HTMLTableCaptionElement: Cr,
    HTMLTableCellElement: nr,
    HTMLTableElement: $e,
    HTMLTableRowElement: cr,
    HTMLTemplateElement: Xt,
    HTMLTextAreaElement: ee1,
    HTMLTimeElement: Be1,
    HTMLTitleElement: Qt,
    HTMLTrackElement: Or,
    HTMLUListElement: Nr,
    HTMLUnknownElement: Sr,
    HTMLVideoElement: or,
    InputEvent: ie2,
    Node: ns,
    NodeFilter: ps,
    NodeList: S4,
    SVGElement: as,
    ShadowRoot: is,
    Text: cs,
    illegalConstructor: R6,
    parseHTML: wd,
    parseJSON: pn,
    toJSON: hn
};
class FileSystemProvider {
    config;
    constructor(config3){
        this.config = config3;
    }
    async getFile(path53, repo) {
        path53 = `${this.config.root}/${repo}/${path53.split('?')[0]}`;
        try {
            const result = await Deno.readFile(path53);
            return {
                name: path53.split('/').pop(),
                content: result
            };
        } catch (e446) {
            error(e446.message);
            return null;
        }
    }
    async getConfigFile(path54) {
        path54 = `${this.config.root}/${this.config.repo}/${path54.split('?')[0]}`;
        try {
            const result = await Deno.readFile(path54);
            const content = (new TextDecoder).decode(result);
            return content;
        } catch (e447) {
            error(e447.message);
            return null;
        }
    }
    get name() {
        return this.config.name;
    }
}
function decode1(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i124 = 0; i124 < size; i124++){
        bytes[i124] = binString.charCodeAt(i124);
    }
    return bytes;
}
class GitHubProvider {
    config;
    constructor(config4){
        this.config = config4;
    }
    async getFile(path55, repo) {
        let url;
        try {
            if (this.config.auth) {
                url = `https://api.github.com/repos/${this.config.root}/${repo}/contents/${path55}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${this.config.auth}`
                    }
                });
                const result = await response.json();
                if (result.sha) {
                    const content = decode1(result.content);
                    result.content = content;
                    return result;
                } else warning(`${url} - ${result.message}`);
            } else {
                const parts = path55.split('?');
                const ref = parts[1] ? parts[1].split('=')[1] : 'main';
                if (parts[1]) path55 = parts[0];
                url = `https://raw.githubusercontent.com/${this.config.root}/${repo}/${ref}/${path55}`;
                const response = await fetch(url, {
                    method: 'GET'
                });
                const result = await response.text();
                return {
                    name: path55.split('/').pop(),
                    content: new TextEncoder().encode(result)
                };
            }
        } catch (e448) {
            console.log(e448);
        }
        return null;
    }
    async getConfigFile(path56) {
        try {
            let repo = this.config.repo;
            let ref = 'main';
            const parts = repo.split(':');
            if (parts.length === 2) {
                repo = parts[0];
                ref = parts[1];
            }
            if (this.config.auth) {
                const url = `https://api.github.com/repos/${this.config.root}/${repo}/contents/${path56}?ref=${ref}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${this.config.auth}`
                    }
                });
                const result = await response.json();
                if (result.sha) {
                    const content = (new TextDecoder).decode(decode1(result.content));
                    return content;
                } else warning(`${url} - ${result.message}`);
            } else {
                const url = `https://raw.githubusercontent.com/${this.config.root}/${repo}/${ref}/${path56}`;
                const response = await fetch(url, {
                    method: 'GET'
                });
                if (response.ok) {
                    const result = await response.text();
                    return result;
                }
            }
        } catch (e449) {
            console.log(e449);
        }
        return null;
    }
    get name() {
        return this.config.name;
    }
}
const handlers1 = [];
class Utils {
    constructor(){}
    createId = ()=>{
        return crypto.randomUUID();
    };
    createHash = async (value)=>{
        const cryptoData = new TextEncoder().encode(value);
        const hash = new TextDecoder().decode(encode(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData))));
        return hash;
    };
    compareWithHash = async (value, hash)=>{
        const cryptoData = new TextEncoder().encode(value);
        const valueHash = new TextDecoder().decode(encode(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData))));
        return valueHash === hash;
    };
    decrypt = async (data)=>{
        const keyData = decode(new TextEncoder().encode(Deno.env.get('CRYPTO_PRIVATE_KEY')));
        const privateKey = await crypto.subtle.importKey('pkcs8', keyData, {
            name: "RSA-OAEP",
            hash: "SHA-512"
        }, true, [
            'decrypt'
        ]);
        const decBuffer = await crypto.subtle.decrypt({
            name: "RSA-OAEP"
        }, privateKey, decode(new TextEncoder().encode(data)));
        const decData = new Uint8Array(decBuffer);
        const decString = new TextDecoder().decode(decData);
        return decString;
    };
    encrypt = async (data)=>{
        const keyData = decode(new TextEncoder().encode(Deno.env.get('CRYPTO_PUBLIC_KEY')));
        const publicKey = await crypto.subtle.importKey('spki', keyData, {
            name: "RSA-OAEP",
            hash: "SHA-512"
        }, true, [
            'encrypt'
        ]);
        const encBuffer = await crypto.subtle.encrypt({
            name: "RSA-OAEP"
        }, publicKey, new TextEncoder().encode(data));
        const encData = new Uint8Array(encBuffer);
        const encString = new TextDecoder().decode(encode(encData));
        return encString;
    };
}
async function handleRequest(request) {
    let response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    if (url.pathname == '/~/healthcheck' && request.method == 'GET') {
        return new Response('OK', {
            status: 200
        });
    } else if (mod13.isDomainInitialized(domainHostname) === false) {
        response = new Response('Oops.  Your application is initializing. Please wait, then try your request again.', {
            status: 503,
            headers: {
                'content-type': 'text/plain'
            }
        });
    } else if (mod13.isDomainInitialized(domainHostname) === true) {
        const domain = mod13.getDomain(domainHostname);
        const cache = domain.contextExtensions['cache'].instance;
        const currentCacheDTS = await cache.get(`${domainHostname}::currentCacheDTS`);
        if (currentCacheDTS > domain.currentCacheDTS) {
            mod13.initializeDomain(domainHostname, false);
            const file = await mod13.getProjectHost().getConfigFile(`.applications/${domain.appFile}.json`);
            if (file === null) throw new Error('Domain Application Not Registered');
            const appConfig = JSON.parse(file);
            if (!appConfig.host) appConfig.host = {};
            if (!appConfig.packages) appConfig.packages = {};
            if (!appConfig.routeMappings) appConfig.routeMappings = [];
            if (!appConfig.featureFlags) appConfig.featureFlags = [];
            if (!appConfig.settings) appConfig.settings = {};
            const appProvider = mod13.getHostProvider({
                name: appConfig.host.name,
                root: appConfig.host.name == 'FileSystem' ? Deno.cwd().replaceAll('\\', '/') : appConfig.host.root,
                auth: appConfig.host.auth
            });
            if (appProvider) {
                domain.appProvider = appProvider;
                domain.appConfig = appConfig;
                domain.currentCacheDTS = currentCacheDTS, domain.packageItemCache = {};
                let module;
                const contextExtension = domain.contextExtensions['feature'];
                if (contextExtension.uri === 'jsphere://Feature') module = mod5;
                else module = await import(contextExtension.uri);
                contextExtension.instance = module.getInstance({
                    extension: 'feature',
                    domain: domainHostname,
                    appId: domain.appId,
                    settings: contextExtension.settings || {},
                    appConfig: domain.appConfig
                }, new Utils());
            } else throw new Error(`Repo provider '${appConfig.host.name}' is not a registered provider.`);
            mod13.initializeDomain(domainHostname, true);
        }
    }
    return response;
}
async function handleRequest1(request) {
    let response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const isInit = mod13.isDomainInitialized(domainHostname);
    if (!url.pathname.startsWith('/~/') && domainHostname != '127.0.0.1' && !isInit) {
        mod13.initializeDomain(domainHostname, false);
        try {
            let file = await mod13.getProjectHost().getConfigFile(`.domains/${domainHostname}.json`);
            if (file === null) throw new Error('Domain Not Registered');
            const domainConfig = JSON.parse(file);
            file = await mod13.getProjectHost().getConfigFile(`.applications/${domainConfig.appFile}.json`);
            if (file === null) throw new Error('Domain Application Not Registered');
            const appConfig = JSON.parse(file);
            if (!appConfig.host) appConfig.host = {};
            if (!appConfig.packages) appConfig.packages = {};
            if (!appConfig.routeMappings) appConfig.routeMappings = [];
            if (!appConfig.featureFlags) appConfig.featureFlags = [];
            if (!appConfig.settings) appConfig.settings = {};
            const appProvider = mod13.getHostProvider({
                name: appConfig.host.name,
                root: appConfig.host.name == 'FileSystem' ? Deno.cwd().replaceAll('\\', '/') : appConfig.host.root,
                auth: appConfig.host.auth
            });
            if (appProvider) {
                mod13.setDomain(domainHostname, {
                    initialized: true,
                    appId: domainConfig.appId,
                    appFile: domainConfig.appFile,
                    settings: domainConfig.settings || {},
                    contextExtensions: Object.assign({
                        cache: {
                            uri: 'jsphere://Cache',
                            settings: {}
                        },
                        feature: {
                            uri: 'jsphere://Feature',
                            settings: {}
                        }
                    }, domainConfig.contextExtensions),
                    state: {},
                    appConfig,
                    appProvider,
                    currentCacheDTS: Date.now(),
                    packageItemCache: {}
                });
                const domain = mod13.getDomain(domainHostname);
                const utils = new Utils();
                for(const prop in domain.contextExtensions){
                    const contextExtension = domain.contextExtensions[prop];
                    let module;
                    if (prop === 'cache' && contextExtension.uri === 'jsphere://Cache') module = mod4;
                    else if (prop === 'feature' && contextExtension.uri === 'jsphere://Feature') module = mod5;
                    else module = await import(contextExtension.uri);
                    contextExtension.instance = await module.getInstance({
                        extension: prop,
                        domain: domainHostname,
                        appId: domain.appId,
                        settings: contextExtension.settings || {},
                        appConfig: domain.appConfig
                    }, utils);
                }
                const cache = domain.contextExtensions['cache'].instance;
                const currentCacheDTS = await cache.get(`${domainHostname}::currentCacheDTS`);
                if (currentCacheDTS === null) await cache.set(`${domainHostname}::currentCacheDTS`, domain.currentCacheDTS);
                else domain.currentCacheDTS = currentCacheDTS;
            } else throw new Error(`Repo provider '${appConfig.host.name}' is not a registered provider.`);
            mod13.initializeDomain(domainHostname, true);
        } catch (e450) {
            mod13.initializeDomain(domainHostname, undefined);
            error(`DomainInitHandler[${domainHostname}]: ${e450.message}`);
            response = new Response(`${e450.message}`, {
                status: 500
            });
        }
    }
    return response;
}
async function handleRequest2(request) {
    let response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = mod13.getDomain(domainHostname);
    if (url.pathname == '/~/resetdomain' && request.method == 'GET' && domain) {
        try {
            mod13.resetDomain(domainHostname, domain);
            response = new Response('Domain application was reset.', {
                status: 200
            });
        } catch (e451) {
            response = new Response(e451.message, {
                status: 500
            });
        }
    }
    return response;
}
async function handleRequest3(request) {
    let response = false;
    const url = new URL(request.url);
    if (url.hostname == '127.0.0.1' && request.method == 'GET' && request.HTTPRequest.headers.get('user-agent')?.startsWith('Deno')) {
        try {
            const eTag = url.searchParams.get('eTag');
            if (!eTag) return new Response('Not Found [Missing eTag]', {
                status: 404
            });
            const domain = eTag.split(':')[0];
            const item = await mod13.getPackageItem(domain, request.routePath);
            if (item) {
                const content = parseContent(item.content, eTag);
                response = new Response(content, {
                    status: 200,
                    headers: {
                        'content-type': item.contentType || ''
                    }
                });
            } else {
                response = new Response('Not Found', {
                    status: 404
                });
            }
        } catch (e452) {
            response = new Response(e452.message, {
                status: 500
            });
        }
    }
    return response;
}
async function handleRequest4(request) {
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = mod13.getDomain(domainHostname);
    const extension = extname2(request.routePath);
    if (domain.appConfig.routeMappings && !lookup(extension)) {
        for (const entry of domain.appConfig.routeMappings){
            const mapping = {
                route: entry.route,
                path: entry.path
            };
            const pattern = new URLPattern({
                pathname: mapping.route
            });
            if (pattern.test(url.href)) {
                const folder = mapping.path.split('/')[2];
                if (folder == 'server') {
                    request.routeParams = pattern.exec(url.href)?.pathname.groups || {};
                }
                request.routePath = mapping.path;
                break;
            }
        }
    }
    return false;
}
async function handleRequest5(request) {
    let response = false;
    const httpRequest = request.HTTPRequest;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const folder = request.routePath.split('/')[2];
    if ((folder == 'client' || folder == 'shared') && request.method == 'GET') {
        try {
            const item = await mod13.getPackageItem(domainHostname, request.routePath);
            if (item) {
                let eTag = httpRequest.headers.get('if-none-match');
                if (eTag && eTag.startsWith('W/')) eTag = eTag.substring(2);
                if (eTag == item.eTag) {
                    response = new Response(null, {
                        status: 304,
                        headers: item.headers
                    });
                } else {
                    const headers = Object.assign({
                        'eTag': item.eTag,
                        'content-type': item.contentType
                    }, item.headers);
                    response = new Response(item.content, {
                        status: 200,
                        headers
                    });
                }
            } else {
                response = new Response('Not Found', {
                    status: 404
                });
            }
        } catch (e453) {
            response = new Response(e453.message, {
                status: 500
            });
        }
    }
    return response;
}
async function handleRequest6(request) {
    let response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = mod13.getDomain(domainHostname);
    const folder = request.routePath.split('/')[2];
    if (folder == 'server') {
        let module;
        try {
            let routePath = request.routePath;
            if (!routePath.endsWith('.ts') && !routePath.endsWith('.js')) routePath += '.js';
            module = await import(`http://127.0.0.1${routePath}?eTag=${domainHostname}:${domain.currentCacheDTS}`);
        } catch (e454) {
            console.log(e454);
            if (e454.message.startsWith('Module not found')) {
                return response = new Response('Either the requested resource or one of its dependencies was not found.', {
                    status: 404
                });
            }
        }
        const func = module[`on${request.method}`];
        if (func) {
            const serverContext = await getServerContext(request.HTTPRequest, request.routeParams);
            response = await func(serverContext);
            if (!response) {
                response = new Response(null, {
                    status: 204
                });
            }
        } else {
            response = new Response('Method Not Allowed', {
                status: 405
            });
        }
    }
    return response;
}
async function handleRequest7(request) {
    let response = false;
    const httpRequest = request.HTTPRequest;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const folder = request.routePath.split('/')[2];
    if (folder == 'tests' && request.method == 'GET') {
        try {
            const item = await mod13.getPackageItem(domainHostname, request.routePath);
            if (item) {
                let eTag = httpRequest.headers.get('if-none-match');
                if (eTag && eTag.startsWith('W/')) eTag = eTag.substring(2);
                if (eTag == item.eTag) {
                    response = new Response(null, {
                        status: 304
                    });
                } else {
                    const headers = Object.assign({
                        'eTag': item.eTag,
                        'content-type': item.contentType
                    }, item.headers);
                    response = new Response(item.content, {
                        status: 200,
                        headers
                    });
                }
            } else {
                response = new Response('Not Found', {
                    status: 404
                });
            }
        } catch (e455) {
            response = new Response(e455.message, {
                status: 500
            });
        }
    }
    return response;
}
const config = {};
const domains = {};
let host;
async function init() {
    setProjectHost();
    await setServerConfig();
    setRequestHandlers();
}
function getHostProvider(config1) {
    switch(config1.name){
        case 'FileSystem':
            return new FileSystemProvider(config1);
        case 'GitHub':
            return new GitHubProvider(config1);
        default:
            return null;
    }
}
function getProjectHost() {
    return host;
}
function getDomain(domainHostname) {
    return domains[domainHostname];
}
function setDomain(domainHostname, domain) {
    domains[domainHostname] = domain;
}
async function resetDomain(domainHostname, domain) {
    const cache = domain.contextExtensions['cache'].instance;
    await cache.set(`${domainHostname}::currentCacheDTS`, Date.now());
}
function isDomainInitialized(domainHostname) {
    if (domains[domainHostname]) return domains[domainHostname].initialized;
}
function initializeDomain(domainHostname, value) {
    if (domains[domainHostname]) domains[domainHostname].initialized = value;
}
async function handleRequest8(request) {
    let response = false;
    let handlerIndex = 0;
    if (handlers1.length > 0) {
        const url = new URL(request.url);
        const jsRequest = {
            HTTPRequest: request,
            method: request.method,
            url: request.url,
            routePath: url.pathname,
            routeParams: {}
        };
        while((response = await handlers1[handlerIndex].handleRequest(jsRequest)) === false){
            if (++handlerIndex == handlers1.length) break;
        }
    }
    if (response === false) return new Response('Request Handler Not Found.', {
        status: 404
    });
    else {
        const url = new URL(request.url);
        const domainHostname = url.hostname;
        const domain = domains[domainHostname];
        if (domain && response.status == 200) response.headers.append('set-cookie', `featureFlags=${domain.appConfig.featureFlags.join(',')};domain=${domainHostname};path=/`);
        return response;
    }
}
async function getPackageItem(domainHostname, path57) {
    const domain = domains[domainHostname];
    const item = domain.packageItemCache[path57];
    if (item) return item;
    const packageKey = path57.split('/')[1];
    if (!domain.appConfig.packages[packageKey]) return null;
    const ref = domain.appConfig.packages[packageKey].tag || 'main';
    const useLocalRepo = domain.appConfig.packages[packageKey].useLocalRepo;
    let file;
    if (useLocalRepo === true) {
        file = await host.getFile(path57.substring(packageKey.length + 2) + (ref ? `?ref=${ref}` : ''), packageKey);
    } else {
        file = await domain.appProvider.getFile(path57.substring(packageKey.length + 2) + (ref ? `?ref=${ref}` : ''), packageKey);
    }
    if (file !== null) {
        const extension = extname2(file.name);
        const contentType = (extension == '.ts' ? 'application/typescript' : lookup(extension) || 'text/plain') + '; charset=utf-8';
        const cryptoData = new TextEncoder().encode(file.content);
        const eTag = file.sha || new TextDecoder().decode(encode(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData))));
        const packageItem = {
            contentType,
            content: file.content,
            eTag
        };
        for(const entry in domain.appConfig.packages[packageKey].packageItemConfig){
            if (path57.startsWith(`/${packageKey}${entry}`)) {
                Object.assign(packageItem, domain.appConfig.packages[packageKey].packageItemConfig[entry]);
            }
        }
        domain.packageItemCache[path57] = packageItem;
        return packageItem;
    } else {
        return null;
    }
}
const mod13 = {
    init: init,
    getHostProvider: getHostProvider,
    getProjectHost: getProjectHost,
    getDomain: getDomain,
    setDomain: setDomain,
    resetDomain: resetDomain,
    isDomainInitialized: isDomainInitialized,
    initializeDomain: initializeDomain,
    handleRequest: handleRequest8,
    getPackageItem: getPackageItem
};
const mod14 = {
    handleRequest: handleRequest
};
const mod15 = {
    handleRequest: handleRequest1
};
const mod16 = {
    handleRequest: handleRequest2
};
const mod17 = {
    handleRequest: handleRequest3
};
const mod18 = {
    handleRequest: handleRequest4
};
const mod19 = {
    handleRequest: handleRequest5
};
const mod20 = {
    handleRequest: handleRequest6
};
const mod21 = {
    handleRequest: handleRequest7
};
function setProjectHost() {
    let envHostName = '', envHostRoot = '', envHostAuth = '', envServerConfig = '';
    const config2 = Deno.env.get('CONFIG');
    if (config2 == 'LOCAL_CONFIG') {
        envHostName = 'FileSystem';
        envHostRoot = Deno.cwd();
        envServerConfig = Deno.env.get('LOCAL_CONFIG');
        if (!envServerConfig || !envHostRoot) {
            error('Local host is not properly configured. Please check that your environment variables are set correctly.');
            Deno.exit(0);
        }
    } else if (config2 == 'REMOTE_CONFIG') {
        envHostName = Deno.env.get('REMOTE_HOST');
        envHostRoot = Deno.env.get('REMOTE_ROOT');
        envHostAuth = Deno.env.get('REMOTE_AUTH');
        envServerConfig = Deno.env.get('REMOTE_CONFIG');
        if (!envHostName || !envHostRoot || !envServerConfig) {
            error('Remote host is not properly configured. Please check that your environment variables are set correctly.');
            Deno.exit(0);
        }
    } else {
        error('Could not determine a host configuration. Please check that your environment variables are set correctly.');
        Deno.exit(0);
    }
    host = getHostProvider({
        name: envHostName,
        root: envHostRoot,
        auth: envHostAuth,
        repo: envServerConfig
    });
    if (host == null) {
        warning(`Unsupported host '${envHostName}'. Defaulting to FileSystem.`);
        Deno.exit(0);
    }
    info(`Host Name: ${envHostName}`);
    info(`Host Root: ${envHostRoot}`);
}
async function setServerConfig() {
    let envServerConfig;
    const path58 = `server.json`;
    if (host.name == 'FileSystem') {
        envServerConfig = Deno.env.get('LOCAL_CONFIG');
    } else {
        envServerConfig = Deno.env.get('REMOTE_CONFIG');
    }
    const content = await host.getConfigFile(path58);
    if (content) {
        const serverConfig = JSON.parse(content);
        Object.assign(config, serverConfig);
        info(`Server Config: ${envServerConfig}/${path58}`);
    } else warning(`Could not retrieve server configuration '${envServerConfig}/${path58}'.`);
}
function setRequestHandlers() {
    handlers1.push(mod14);
    handlers1.push(mod15);
    handlers1.push(mod16);
    handlers1.push(mod17);
    handlers1.push(mod18);
    handlers1.push(mod19);
    handlers1.push(mod20);
    handlers1.push(mod21);
}
function parseContent(content, eTag) {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    let parsedContent = textDecoder.decode(content);
    const found = parsedContent.match(/((import[ ]+)|(from[ ]+))(\(|"|')(?<path>[a-zA-Z0-9\/.\-_]+)("|'|\))/gi);
    if (found) {
        for (const entry of found){
            let temp;
            if (entry.endsWith(`.ts"`)) temp = entry.replace(`.ts"`, `.ts?eTag=${eTag}"`);
            else if (entry.endsWith(`.ts'`)) temp = entry.replace(`.ts'`, `.ts?eTag=${eTag}'`);
            else if (entry.endsWith(`.js"`)) temp = entry.replace(`.js"`, `.js?eTag=${eTag}"`);
            else if (entry.endsWith(`.js'`)) temp = entry.replace(`.js'`, `.js?eTag=${eTag}'`);
            else if (entry.endsWith(`)`)) temp = entry.replace(`)`, ` + '?eTag=${eTag}')`);
            if (temp) parsedContent = parsedContent.replace(entry, temp);
        }
    }
    return textEncoder.encode(parsedContent);
}
async function getServerContext(request, routeParams) {
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = mod13.getDomain(domainHostname);
    const serverContext = {
        domain: await getDomainContext(request),
        request: await getRequestContext(request, routeParams),
        response: getResponseContext(request),
        settings: Object.assign(domain.appConfig.settings || {}, domain.settings),
        utils: new Utils(),
        parser: new mod12.DOMParser(),
        getPackageItem: async (path59)=>{
            const packageItem = await mod13.getPackageItem(domainHostname, path59);
            return packageItem;
        },
        user: {}
    };
    for(const prop in domain.contextExtensions){
        serverContext[prop] = domain.contextExtensions[prop].instance;
    }
    return serverContext;
}
async function getDomainContext(request) {
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = mod13.getDomain(domainHostname);
    const domainContext = {
        appId: domain.appId,
        hostname: domainHostname,
        cacheDTS: domain.currentCacheDTS
    };
    return domainContext;
}
async function getRequestContext(request, routeParams) {
    const url = new URL(request.url);
    const contentType = request.headers.get('content-type');
    const requestContext = {
        path: url.pathname,
        headers: request.headers,
        cookies: mod7.getCookies(request.headers),
        params: routeParams || {},
        data: {},
        files: []
    };
    url.searchParams.forEach((value, key14)=>{
        requestContext.params[key14] = value;
    });
    if (contentType?.startsWith('application/json')) {
        requestContext.data = await request.json();
    } else if (contentType?.startsWith('multipart/form-data') || contentType?.startsWith('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        for await (const [key15, value] of formData){
            if (value instanceof File) {
                requestContext.files.push({
                    content: new Uint8Array(await value.arrayBuffer()),
                    filename: value.name,
                    size: value.size,
                    type: value.type
                });
            } else {
                const data = requestContext.data;
                data[key15] = value;
            }
        }
    } else {
        requestContext.data = await request.blob();
    }
    return requestContext;
}
function getResponseContext(request) {
    return new ResponseObject();
}
class ResponseObject {
    constructor(){}
    redirect = (url, status)=>{
        return Response.redirect(url, status);
    };
    send = (body, init1)=>{
        return new Response(body, init1);
    };
    json = (body, status)=>{
        return new Response(JSON.stringify(body), {
            status: status || 200,
            headers: {
                'content-type': 'application/json'
            }
        });
    };
    text = (body, status)=>{
        return new Response(body, {
            status: status || 200,
            headers: {
                'content-type': 'text/plain'
            }
        });
    };
    html = (body, status)=>{
        return new Response(body, {
            status: status || 200,
            headers: {
                'content-type': 'text/html'
            }
        });
    };
}
const envPath = `${Deno.cwd()}/.env`;
const env = await load({
    envPath
});
mod6.info(`Environment (${envPath}):`, env);
for(const key in env){
    if (!Deno.env.get(key)) Deno.env.set(key, env[key]);
}
await mod13.init();
const serverPort = parseInt(Deno.env.get('SERVER_HTTP_PORT') || '80');
mod6.info(`JSphere Application Server is running.`);
serve(mod13.handleRequest, {
    port: serverPort
});

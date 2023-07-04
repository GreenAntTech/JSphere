(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // client/urlpattern.min.js
  var urlpattern_min_exports = {};
  __export(urlpattern_min_exports, {
    URLPattern: () => URLPattern
  });
  function isASCII(str, extended) {
    return (extended ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(str);
  }
  function lexer(str, lenient = false) {
    const tokens = [];
    let i = 0;
    for (; i < str.length; ) {
      const char = str[i], ErrorOrInvalid = function(msg) {
        if (!lenient)
          throw new TypeError(msg);
        tokens.push({ type: "INVALID_CHAR", index: i, value: str[i++] });
      };
      if ("*" !== char)
        if ("+" !== char && "?" !== char)
          if ("\\" !== char)
            if ("{" !== char)
              if ("}" !== char)
                if (":" !== char)
                  if ("(" !== char)
                    tokens.push({ type: "CHAR", index: i, value: str[i++] });
                  else {
                    let count = 1, pattern = "", j = i + 1, error = false;
                    if ("?" === str[j]) {
                      ErrorOrInvalid(`Pattern cannot start with "?" at ${j}`);
                      continue;
                    }
                    for (; j < str.length; ) {
                      if (!isASCII(str[j], false)) {
                        ErrorOrInvalid(`Invalid character '${str[j]}' at ${j}.`), error = true;
                        break;
                      }
                      if ("\\" !== str[j]) {
                        if (")" === str[j]) {
                          if (count--, 0 === count) {
                            j++;
                            break;
                          }
                        } else if ("(" === str[j] && (count++, "?" !== str[j + 1])) {
                          ErrorOrInvalid(`Capturing groups are not allowed at ${j}`), error = true;
                          break;
                        }
                        pattern += str[j++];
                      } else
                        pattern += str[j++] + str[j++];
                    }
                    if (error)
                      continue;
                    if (count) {
                      ErrorOrInvalid(`Unbalanced pattern at ${i}`);
                      continue;
                    }
                    if (!pattern) {
                      ErrorOrInvalid(`Missing pattern at ${i}`);
                      continue;
                    }
                    tokens.push({ type: "PATTERN", index: i, value: pattern }), i = j;
                  }
                else {
                  let name = "", j = i + 1;
                  for (; j < str.length; ) {
                    const code = str.substr(j, 1);
                    if (!(j === i + 1 && regexIdentifierStart.test(code) || j !== i + 1 && regexIdentifierPart.test(code)))
                      break;
                    name += str[j++];
                  }
                  if (!name) {
                    ErrorOrInvalid(`Missing parameter name at ${i}`);
                    continue;
                  }
                  tokens.push({ type: "NAME", index: i, value: name }), i = j;
                }
              else
                tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            else
              tokens.push({ type: "OPEN", index: i, value: str[i++] });
          else
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
        else
          tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      else
        tokens.push({ type: "ASTERISK", index: i, value: str[i++] });
    }
    return tokens.push({ type: "END", index: i, value: "" }), tokens;
  }
  function parse(str, options = {}) {
    const tokens = lexer(str), { prefixes = "./" } = options, defaultPattern = `[^${escapeString(options.delimiter || "/#?")}]+?`, result = [];
    let key = 0, i = 0, path = "", nameSet = /* @__PURE__ */ new Set();
    const tryConsume = (type) => {
      if (i < tokens.length && tokens[i].type === type)
        return tokens[i++].value;
    }, tryConsumeModifier = () => {
      const r = tryConsume("MODIFIER");
      return r || tryConsume("ASTERISK");
    }, mustConsume = (type) => {
      const value = tryConsume(type);
      if (void 0 !== value)
        return value;
      const { type: nextType, index } = tokens[i];
      throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`);
    }, consumeText = () => {
      let result2 = "", value;
      for (; value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"); )
        result2 += value;
      return result2;
    }, DefaultEncodePart = (value) => value, encodePart = options.encodePart || DefaultEncodePart;
    for (; i < tokens.length; ) {
      const char = tryConsume("CHAR"), name = tryConsume("NAME");
      let pattern = tryConsume("PATTERN");
      if (name || pattern || !tryConsume("ASTERISK") || (pattern = ".*"), name || pattern) {
        let prefix = char || "";
        -1 === prefixes.indexOf(prefix) && (path += prefix, prefix = ""), path && (result.push(encodePart(path)), path = "");
        const finalName = name || key++;
        if (nameSet.has(finalName))
          throw new TypeError(`Duplicate name '${finalName}'.`);
        nameSet.add(finalName), result.push({ name: finalName, prefix: encodePart(prefix), suffix: "", pattern: pattern || defaultPattern, modifier: tryConsumeModifier() || "" });
        continue;
      }
      const value = char || tryConsume("ESCAPED_CHAR");
      if (value) {
        path += value;
        continue;
      }
      const open = tryConsume("OPEN");
      if (open) {
        const prefix = consumeText(), name2 = tryConsume("NAME") || "";
        let pattern2 = tryConsume("PATTERN") || "";
        name2 || pattern2 || !tryConsume("ASTERISK") || (pattern2 = ".*");
        const suffix = consumeText();
        mustConsume("CLOSE");
        const modifier = tryConsumeModifier() || "";
        if (!name2 && !pattern2 && !modifier) {
          path += prefix;
          continue;
        }
        if (!name2 && !pattern2 && !prefix)
          continue;
        path && (result.push(encodePart(path)), path = ""), result.push({ name: name2 || (pattern2 ? key++ : ""), pattern: name2 && !pattern2 ? defaultPattern : pattern2, prefix: encodePart(prefix), suffix: encodePart(suffix), modifier });
      } else
        path && (result.push(encodePart(path)), path = ""), mustConsume("END");
    }
    return result;
  }
  function escapeString(str) {
    return str.replace(/([.+*?^${}()[\]|/\\])/g, "\\$1");
  }
  function flags(options) {
    return options && options.sensitive ? "u" : "ui";
  }
  function regexpToRegexp(path, keys) {
    if (!keys)
      return path;
    const groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
    let index = 0, execResult = groupsRegex.exec(path.source);
    for (; execResult; )
      keys.push({ name: execResult[1] || index++, prefix: "", suffix: "", modifier: "", pattern: "" }), execResult = groupsRegex.exec(path.source);
    return path;
  }
  function arrayToRegexp(paths, keys, options) {
    const parts = paths.map((path) => pathToRegexp(path, keys, options).source);
    return new RegExp(`(?:${parts.join("|")})`, flags(options));
  }
  function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
  }
  function tokensToRegexp(tokens, keys, options = {}) {
    const { strict = false, start = true, end = true, encode = (x) => x } = options, endsWith = `[${escapeString(options.endsWith || "")}]|$`, delimiter = `[${escapeString(options.delimiter || "/#?")}]`;
    let route = start ? "^" : "";
    for (const token of tokens)
      if ("string" == typeof token)
        route += escapeString(encode(token));
      else {
        const prefix = escapeString(encode(token.prefix)), suffix = escapeString(encode(token.suffix));
        if (token.pattern)
          if (keys && keys.push(token), prefix || suffix)
            if ("+" === token.modifier || "*" === token.modifier) {
              const mod = "*" === token.modifier ? "?" : "";
              route += `(?:${prefix}((?:${token.pattern})(?:${suffix}${prefix}(?:${token.pattern}))*)${suffix})${mod}`;
            } else
              route += `(?:${prefix}(${token.pattern})${suffix})${token.modifier}`;
          else
            "+" === token.modifier || "*" === token.modifier ? route += `((?:${token.pattern})${token.modifier})` : route += `(${token.pattern})${token.modifier}`;
        else
          route += `(?:${prefix}${suffix})${token.modifier}`;
      }
    if (end)
      strict || (route += `${delimiter}?`), route += options.endsWith ? `(?=${endsWith})` : "$";
    else {
      const endToken = tokens[tokens.length - 1], isEndDelimited = "string" == typeof endToken ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : void 0 === endToken;
      strict || (route += `(?:${delimiter}(?=${endsWith}))?`), isEndDelimited || (route += `(?=${delimiter}|${endsWith})`);
    }
    return new RegExp(route, flags(options));
  }
  function pathToRegexp(path, keys, options) {
    return path instanceof RegExp ? regexpToRegexp(path, keys) : Array.isArray(path) ? arrayToRegexp(path, keys, options) : stringToRegexp(path, keys, options);
  }
  function isAbsolutePathname(pathname, isPattern) {
    return !!pathname.length && ("/" === pathname[0] || !!isPattern && (!(pathname.length < 2) && (("\\" == pathname[0] || "{" == pathname[0]) && "/" == pathname[1])));
  }
  function maybeStripPrefix(value, prefix) {
    return value.startsWith(prefix) ? value.substring(prefix.length, value.length) : value;
  }
  function maybeStripSuffix(value, suffix) {
    return value.endsWith(suffix) ? value.substr(0, value.length - suffix.length) : value;
  }
  function treatAsIPv6Hostname(value) {
    return !(!value || value.length < 2) && ("[" === value[0] || ("\\" === value[0] || "{" === value[0]) && "[" === value[1]);
  }
  function isSpecialScheme(protocol_regexp) {
    if (!protocol_regexp)
      return true;
    for (const scheme of SPECIAL_SCHEMES)
      if (protocol_regexp.test(scheme))
        return true;
    return false;
  }
  function canonicalizeHash(hash, isPattern) {
    if (hash = maybeStripPrefix(hash, "#"), isPattern || "" === hash)
      return hash;
    const url = new URL("https://example.com");
    return url.hash = hash, url.hash ? url.hash.substring(1, url.hash.length) : "";
  }
  function canonicalizeSearch(search, isPattern) {
    if (search = maybeStripPrefix(search, "?"), isPattern || "" === search)
      return search;
    const url = new URL("https://example.com");
    return url.search = search, url.search ? url.search.substring(1, url.search.length) : "";
  }
  function canonicalizeHostname(hostname, isPattern) {
    return isPattern || "" === hostname ? hostname : treatAsIPv6Hostname(hostname) ? ipv6HostnameEncodeCallback(hostname) : hostnameEncodeCallback(hostname);
  }
  function canonicalizePassword(password, isPattern) {
    if (isPattern || "" === password)
      return password;
    const url = new URL("https://example.com");
    return url.password = password, url.password;
  }
  function canonicalizeUsername(username, isPattern) {
    if (isPattern || "" === username)
      return username;
    const url = new URL("https://example.com");
    return url.username = username, url.username;
  }
  function canonicalizePathname(pathname, protocol, isPattern) {
    if (isPattern || "" === pathname)
      return pathname;
    if (protocol && !SPECIAL_SCHEMES.includes(protocol)) {
      const url = new URL(`${protocol}:${pathname}`);
      return url.pathname;
    }
    const leadingSlash = "/" == pathname[0];
    return pathname = new URL(leadingSlash ? pathname : "/-" + pathname, "https://example.com").pathname, leadingSlash || (pathname = pathname.substring(2, pathname.length)), pathname;
  }
  function canonicalizePort(port, protocol, isPattern) {
    return defaultPortForProtocol(protocol) === port && (port = ""), isPattern || "" === port ? port : portEncodeCallback(port);
  }
  function canonicalizeProtocol(protocol, isPattern) {
    return protocol = maybeStripSuffix(protocol, ":"), isPattern || "" === protocol ? protocol : protocolEncodeCallback(protocol);
  }
  function defaultPortForProtocol(protocol) {
    switch (protocol) {
      case "ws":
      case "http":
        return "80";
      case "wws":
      case "https":
        return "443";
      case "ftp":
        return "21";
      default:
        return "";
    }
  }
  function protocolEncodeCallback(input) {
    if ("" === input)
      return input;
    if (/^[-+.A-Za-z0-9]*$/.test(input))
      return input.toLowerCase();
    throw new TypeError(`Invalid protocol '${input}'.`);
  }
  function usernameEncodeCallback(input) {
    if ("" === input)
      return input;
    const url = new URL("https://example.com");
    return url.username = input, url.username;
  }
  function passwordEncodeCallback(input) {
    if ("" === input)
      return input;
    const url = new URL("https://example.com");
    return url.password = input, url.password;
  }
  function hostnameEncodeCallback(input) {
    if ("" === input)
      return input;
    if (/[\t\n\r #%/:<>?@[\]^\\|]/g.test(input))
      throw new TypeError(`Invalid hostname '${input}'`);
    const url = new URL("https://example.com");
    return url.hostname = input, url.hostname;
  }
  function ipv6HostnameEncodeCallback(input) {
    if ("" === input)
      return input;
    if (/[^0-9a-fA-F[\]:]/g.test(input))
      throw new TypeError(`Invalid IPv6 hostname '${input}'`);
    return input.toLowerCase();
  }
  function portEncodeCallback(input) {
    if ("" === input)
      return input;
    if (/^[0-9]*$/.test(input) && parseInt(input) <= 65535)
      return input;
    throw new TypeError(`Invalid port '${input}'.`);
  }
  function standardURLPathnameEncodeCallback(input) {
    if ("" === input)
      return input;
    const url = new URL("https://example.com");
    return url.pathname = "/" !== input[0] ? "/-" + input : input, "/" !== input[0] ? url.pathname.substring(2, url.pathname.length) : url.pathname;
  }
  function pathURLPathnameEncodeCallback(input) {
    if ("" === input)
      return input;
    const url = new URL(`data:${input}`);
    return url.pathname;
  }
  function searchEncodeCallback(input) {
    if ("" === input)
      return input;
    const url = new URL("https://example.com");
    return url.search = input, url.search.substring(1, url.search.length);
  }
  function hashEncodeCallback(input) {
    if ("" === input)
      return input;
    const url = new URL("https://example.com");
    return url.hash = input, url.hash.substring(1, url.hash.length);
  }
  function extractValues(url, baseURL) {
    if ("string" != typeof url)
      throw new TypeError("parameter 1 is not of type 'string'.");
    const o = new URL(url, baseURL);
    return { protocol: o.protocol.substring(0, o.protocol.length - 1), username: o.username, password: o.password, hostname: o.hostname, port: o.port, pathname: o.pathname, search: "" != o.search ? o.search.substring(1, o.search.length) : void 0, hash: "" != o.hash ? o.hash.substring(1, o.hash.length) : void 0 };
  }
  function applyInit(o, init, isPattern) {
    let baseURL;
    if ("string" == typeof init.baseURL)
      try {
        baseURL = new URL(init.baseURL), o.protocol = baseURL.protocol ? baseURL.protocol.substring(0, baseURL.protocol.length - 1) : "", o.username = baseURL.username, o.password = baseURL.password, o.hostname = baseURL.hostname, o.port = baseURL.port, o.pathname = baseURL.pathname, o.search = baseURL.search ? baseURL.search.substring(1, baseURL.search.length) : "", o.hash = baseURL.hash ? baseURL.hash.substring(1, baseURL.hash.length) : "";
      } catch {
        throw new TypeError(`invalid baseURL '${init.baseURL}'.`);
      }
    if ("string" == typeof init.protocol && (o.protocol = canonicalizeProtocol(init.protocol, isPattern)), "string" == typeof init.username && (o.username = canonicalizeUsername(init.username, isPattern)), "string" == typeof init.password && (o.password = canonicalizePassword(init.password, isPattern)), "string" == typeof init.hostname && (o.hostname = canonicalizeHostname(init.hostname, isPattern)), "string" == typeof init.port && (o.port = canonicalizePort(init.port, o.protocol, isPattern)), "string" == typeof init.pathname) {
      if (o.pathname = init.pathname, baseURL && !isAbsolutePathname(o.pathname, isPattern)) {
        const slashIndex = baseURL.pathname.lastIndexOf("/");
        slashIndex >= 0 && (o.pathname = baseURL.pathname.substring(0, slashIndex + 1) + o.pathname);
      }
      o.pathname = canonicalizePathname(o.pathname, o.protocol, isPattern);
    }
    return "string" == typeof init.search && (o.search = canonicalizeSearch(init.search, isPattern)), "string" == typeof init.hash && (o.hash = canonicalizeHash(init.hash, isPattern)), o;
  }
  function escapePatternString(value) {
    return value.replace(/([+*?:{}()\\])/g, "\\$1");
  }
  function escapeRegexpString(value) {
    return value.replace(/([.+*?^${}()[\]|/\\])/g, "\\$1");
  }
  function tokensToPattern(tokens, options) {
    const wildcardPattern = ".*", segmentWildcardPattern = `[^${escapeRegexpString(options.delimiter || "/#?")}]+?`, regexIdentifierPart2 = /[$_\u200C\u200D\p{ID_Continue}]/u;
    let result = "";
    for (let i = 0; i < tokens.length; ++i) {
      const token = tokens[i], lastToken = i > 0 ? tokens[i - 1] : null, nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;
      if ("string" == typeof token) {
        result += escapePatternString(token);
        continue;
      }
      if ("" === token.pattern) {
        if ("" === token.modifier) {
          result += escapePatternString(token.prefix);
          continue;
        }
        result += `{${escapePatternString(token.prefix)}}${token.modifier}`;
        continue;
      }
      const customName = "number" != typeof token.name, optionsPrefixes = void 0 !== options.prefixes ? options.prefixes : "./";
      let needsGrouping = "" !== token.suffix || "" !== token.prefix && (1 !== token.prefix.length || !optionsPrefixes.includes(token.prefix));
      if (!needsGrouping && customName && token.pattern === segmentWildcardPattern && "" === token.modifier && nextToken && !nextToken.prefix && !nextToken.suffix)
        if ("string" == typeof nextToken) {
          const code = nextToken.length > 0 ? nextToken[0] : "";
          needsGrouping = regexIdentifierPart2.test(code);
        } else
          needsGrouping = "number" == typeof nextToken.name;
      if (!needsGrouping && "" === token.prefix && lastToken && "string" == typeof lastToken && lastToken.length > 0) {
        const code = lastToken[lastToken.length - 1];
        needsGrouping = optionsPrefixes.includes(code);
      }
      needsGrouping && (result += "{"), result += escapePatternString(token.prefix), customName && (result += `:${token.name}`), ".*" === token.pattern ? customName || lastToken && "string" != typeof lastToken && !lastToken.modifier && !needsGrouping && "" === token.prefix ? result += "(.*)" : result += "*" : token.pattern === segmentWildcardPattern ? customName || (result += `(${segmentWildcardPattern})`) : result += `(${token.pattern})`, token.pattern === segmentWildcardPattern && customName && "" !== token.suffix && regexIdentifierPart2.test(token.suffix[0]) && (result += "\\"), result += escapePatternString(token.suffix), needsGrouping && (result += "}"), result += token.modifier;
    }
    return result;
  }
  var regexIdentifierStart, regexIdentifierPart, DEFAULT_OPTIONS, HOSTNAME_OPTIONS, PATHNAME_OPTIONS, SPECIAL_SCHEMES, Parser, COMPONENTS, DEFAULT_PATTERN, URLPattern;
  var init_urlpattern_min = __esm({
    "client/urlpattern.min.js"() {
      regexIdentifierStart = /[$_\p{ID_Start}]/u;
      regexIdentifierPart = /[$_\u200C\u200D\p{ID_Continue}]/u;
      DEFAULT_OPTIONS = { delimiter: "", prefixes: "", sensitive: true, strict: true };
      HOSTNAME_OPTIONS = { delimiter: ".", prefixes: "", sensitive: true, strict: true };
      PATHNAME_OPTIONS = { delimiter: "/", prefixes: "/", sensitive: true, strict: true };
      SPECIAL_SCHEMES = ["ftp", "file", "http", "https", "ws", "wss"];
      Parser = class {
        constructor(input) {
          this.tokenList = [], this.internalResult = {}, this.tokenIndex = 0, this.tokenIncrement = 1, this.componentStart = 0, this.state = 0, this.groupDepth = 0, this.hostnameIPv6BracketDepth = 0, this.shouldTreatAsStandardURL = false, this.input = input;
        }
        get result() {
          return this.internalResult;
        }
        parse() {
          for (this.tokenList = lexer(this.input, true); this.tokenIndex < this.tokenList.length; this.tokenIndex += this.tokenIncrement) {
            if (this.tokenIncrement = 1, "END" === this.tokenList[this.tokenIndex].type) {
              if (0 === this.state) {
                this.rewind(), this.isHashPrefix() ? this.changeState(9, 1) : this.isSearchPrefix() ? (this.changeState(8, 1), this.internalResult.hash = "") : (this.changeState(7, 0), this.internalResult.search = "", this.internalResult.hash = "");
                continue;
              }
              if (2 === this.state) {
                this.rewindAndSetState(5);
                continue;
              }
              this.changeState(10, 0);
              break;
            }
            if (this.groupDepth > 0) {
              if (!this.isGroupClose())
                continue;
              this.groupDepth -= 1;
            }
            if (this.isGroupOpen())
              this.groupDepth += 1;
            else
              switch (this.state) {
                case 0:
                  this.isProtocolSuffix() && (this.internalResult.username = "", this.internalResult.password = "", this.internalResult.hostname = "", this.internalResult.port = "", this.internalResult.pathname = "", this.internalResult.search = "", this.internalResult.hash = "", this.rewindAndSetState(1));
                  break;
                case 1:
                  if (this.isProtocolSuffix()) {
                    this.computeShouldTreatAsStandardURL();
                    let nextState = 7, skip = 1;
                    this.shouldTreatAsStandardURL && (this.internalResult.pathname = "/"), this.nextIsAuthoritySlashes() ? (nextState = 2, skip = 3) : this.shouldTreatAsStandardURL && (nextState = 2), this.changeState(nextState, skip);
                  }
                  break;
                case 2:
                  this.isIdentityTerminator() ? this.rewindAndSetState(3) : (this.isPathnameStart() || this.isSearchPrefix() || this.isHashPrefix()) && this.rewindAndSetState(5);
                  break;
                case 3:
                  this.isPasswordPrefix() ? this.changeState(4, 1) : this.isIdentityTerminator() && this.changeState(5, 1);
                  break;
                case 4:
                  this.isIdentityTerminator() && this.changeState(5, 1);
                  break;
                case 5:
                  this.isIPv6Open() ? this.hostnameIPv6BracketDepth += 1 : this.isIPv6Close() && (this.hostnameIPv6BracketDepth -= 1), this.isPortPrefix() && !this.hostnameIPv6BracketDepth ? this.changeState(6, 1) : this.isPathnameStart() ? this.changeState(7, 0) : this.isSearchPrefix() ? this.changeState(8, 1) : this.isHashPrefix() && this.changeState(9, 1);
                  break;
                case 6:
                  this.isPathnameStart() ? this.changeState(7, 0) : this.isSearchPrefix() ? this.changeState(8, 1) : this.isHashPrefix() && this.changeState(9, 1);
                  break;
                case 7:
                  this.isSearchPrefix() ? this.changeState(8, 1) : this.isHashPrefix() && this.changeState(9, 1);
                  break;
                case 8:
                  this.isHashPrefix() && this.changeState(9, 1);
              }
          }
        }
        changeState(newState, skip) {
          switch (this.state) {
            case 0:
              break;
            case 1:
              this.internalResult.protocol = this.makeComponentString();
              break;
            case 2:
              break;
            case 3:
              this.internalResult.username = this.makeComponentString();
              break;
            case 4:
              this.internalResult.password = this.makeComponentString();
              break;
            case 5:
              this.internalResult.hostname = this.makeComponentString();
              break;
            case 6:
              this.internalResult.port = this.makeComponentString();
              break;
            case 7:
              this.internalResult.pathname = this.makeComponentString();
              break;
            case 8:
              this.internalResult.search = this.makeComponentString();
              break;
            case 9:
              this.internalResult.hash = this.makeComponentString();
          }
          this.changeStateWithoutSettingComponent(newState, skip);
        }
        changeStateWithoutSettingComponent(newState, skip) {
          this.state = newState, this.componentStart = this.tokenIndex + skip, this.tokenIndex += skip, this.tokenIncrement = 0;
        }
        rewind() {
          this.tokenIndex = this.componentStart, this.tokenIncrement = 0;
        }
        rewindAndSetState(newState) {
          this.rewind(), this.state = newState;
        }
        safeToken(index) {
          return index < 0 && (index = this.tokenList.length - index), index < this.tokenList.length ? this.tokenList[index] : this.tokenList[this.tokenList.length - 1];
        }
        isNonSpecialPatternChar(index, value) {
          const token = this.safeToken(index);
          return token.value === value && ("CHAR" === token.type || "ESCAPED_CHAR" === token.type || "INVALID_CHAR" === token.type);
        }
        isProtocolSuffix() {
          return this.isNonSpecialPatternChar(this.tokenIndex, ":");
        }
        nextIsAuthoritySlashes() {
          return this.isNonSpecialPatternChar(this.tokenIndex + 1, "/") && this.isNonSpecialPatternChar(this.tokenIndex + 2, "/");
        }
        isIdentityTerminator() {
          return this.isNonSpecialPatternChar(this.tokenIndex, "@");
        }
        isPasswordPrefix() {
          return this.isNonSpecialPatternChar(this.tokenIndex, ":");
        }
        isPortPrefix() {
          return this.isNonSpecialPatternChar(this.tokenIndex, ":");
        }
        isPathnameStart() {
          return this.isNonSpecialPatternChar(this.tokenIndex, "/");
        }
        isSearchPrefix() {
          if (this.isNonSpecialPatternChar(this.tokenIndex, "?"))
            return true;
          if ("?" !== this.tokenList[this.tokenIndex].value)
            return false;
          const previousToken = this.safeToken(this.tokenIndex - 1);
          return "NAME" !== previousToken.type && "PATTERN" !== previousToken.type && "CLOSE" !== previousToken.type && "ASTERISK" !== previousToken.type;
        }
        isHashPrefix() {
          return this.isNonSpecialPatternChar(this.tokenIndex, "#");
        }
        isGroupOpen() {
          return "OPEN" == this.tokenList[this.tokenIndex].type;
        }
        isGroupClose() {
          return "CLOSE" == this.tokenList[this.tokenIndex].type;
        }
        isIPv6Open() {
          return this.isNonSpecialPatternChar(this.tokenIndex, "[");
        }
        isIPv6Close() {
          return this.isNonSpecialPatternChar(this.tokenIndex, "]");
        }
        makeComponentString() {
          const token = this.tokenList[this.tokenIndex], componentCharStart = this.safeToken(this.componentStart).index;
          return this.input.substring(componentCharStart, token.index);
        }
        computeShouldTreatAsStandardURL() {
          const options = {};
          Object.assign(options, DEFAULT_OPTIONS), options.encodePart = protocolEncodeCallback;
          const regexp = pathToRegexp(this.makeComponentString(), void 0, options);
          this.shouldTreatAsStandardURL = isSpecialScheme(regexp);
        }
      };
      COMPONENTS = ["protocol", "username", "password", "hostname", "port", "pathname", "search", "hash"];
      DEFAULT_PATTERN = "*";
      URLPattern = class {
        constructor(init = {}, baseURL) {
          this.regexp = {}, this.keys = {}, this.component_pattern = {};
          try {
            if ("string" == typeof init) {
              const parser = new Parser(init);
              if (parser.parse(), init = parser.result, baseURL) {
                if ("string" != typeof baseURL)
                  throw new TypeError("'baseURL' parameter is not of type 'string'.");
                init.baseURL = baseURL;
              } else if ("string" != typeof init.protocol)
                throw new TypeError("A base URL must be provided for a relative constructor string.");
            } else if (baseURL)
              throw new TypeError("parameter 1 is not of type 'string'.");
            if (!init || "object" != typeof init)
              throw new TypeError("parameter 1 is not of type 'string' and cannot convert to dictionary.");
            const defaults = { pathname: DEFAULT_PATTERN, protocol: DEFAULT_PATTERN, username: DEFAULT_PATTERN, password: DEFAULT_PATTERN, hostname: DEFAULT_PATTERN, port: DEFAULT_PATTERN, search: DEFAULT_PATTERN, hash: DEFAULT_PATTERN };
            let component;
            for (component of (this.pattern = applyInit(defaults, init, true), defaultPortForProtocol(this.pattern.protocol) === this.pattern.port && (this.pattern.port = ""), COMPONENTS)) {
              if (!(component in this.pattern))
                continue;
              const options = {}, pattern = this.pattern[component];
              switch (this.keys[component] = [], component) {
                case "protocol":
                  Object.assign(options, DEFAULT_OPTIONS), options.encodePart = protocolEncodeCallback;
                  break;
                case "username":
                  Object.assign(options, DEFAULT_OPTIONS), options.encodePart = usernameEncodeCallback;
                  break;
                case "password":
                  Object.assign(options, DEFAULT_OPTIONS), options.encodePart = passwordEncodeCallback;
                  break;
                case "hostname":
                  Object.assign(options, HOSTNAME_OPTIONS), treatAsIPv6Hostname(pattern) ? options.encodePart = ipv6HostnameEncodeCallback : options.encodePart = hostnameEncodeCallback;
                  break;
                case "port":
                  Object.assign(options, DEFAULT_OPTIONS), options.encodePart = portEncodeCallback;
                  break;
                case "pathname":
                  isSpecialScheme(this.regexp.protocol) ? (Object.assign(options, PATHNAME_OPTIONS), options.encodePart = standardURLPathnameEncodeCallback) : (Object.assign(options, DEFAULT_OPTIONS), options.encodePart = pathURLPathnameEncodeCallback);
                  break;
                case "search":
                  Object.assign(options, DEFAULT_OPTIONS), options.encodePart = searchEncodeCallback;
                  break;
                case "hash":
                  Object.assign(options, DEFAULT_OPTIONS), options.encodePart = hashEncodeCallback;
              }
              try {
                const tokens = parse(pattern, options);
                this.regexp[component] = tokensToRegexp(tokens, this.keys[component], options), this.component_pattern[component] = tokensToPattern(tokens, options);
              } catch {
                throw new TypeError(`invalid ${component} pattern '${this.pattern[component]}'.`);
              }
            }
          } catch (err) {
            throw new TypeError(`Failed to construct 'URLPattern': ${err.message}`);
          }
        }
        test(input = {}, baseURL) {
          let values = { pathname: "", protocol: "", username: "", password: "", hostname: "", port: "", search: "", hash: "" }, component;
          if ("string" != typeof input && baseURL)
            throw new TypeError("parameter 1 is not of type 'string'.");
          if (void 0 === input)
            return false;
          try {
            values = applyInit(values, "object" == typeof input ? input : extractValues(input, baseURL), false);
          } catch (err) {
            return false;
          }
          for (component in this.pattern)
            if (!this.regexp[component].exec(values[component]))
              return false;
          return true;
        }
        exec(input = {}, baseURL) {
          let values = { pathname: "", protocol: "", username: "", password: "", hostname: "", port: "", search: "", hash: "" };
          if ("string" != typeof input && baseURL)
            throw new TypeError("parameter 1 is not of type 'string'.");
          if (void 0 === input)
            return;
          try {
            values = applyInit(values, "object" == typeof input ? input : extractValues(input, baseURL), false);
          } catch (err) {
            return null;
          }
          let result = {}, component;
          for (component in result.inputs = baseURL ? [input, baseURL] : [input], this.pattern) {
            let match = this.regexp[component].exec(values[component]);
            if (!match)
              return null;
            let groups = {};
            for (let [i, key] of this.keys[component].entries())
              if ("string" == typeof key.name || "number" == typeof key.name) {
                let value = match[i + 1];
                groups[key.name] = value;
              }
            result[component] = { input: values[component] || "", groups };
          }
          return result;
        }
        get protocol() {
          return this.component_pattern.protocol;
        }
        get username() {
          return this.component_pattern.username;
        }
        get password() {
          return this.component_pattern.password;
        }
        get hostname() {
          return this.component_pattern.hostname;
        }
        get port() {
          return this.component_pattern.port;
        }
        get pathname() {
          return this.component_pattern.pathname;
        }
        get search() {
          return this.component_pattern.search;
        }
        get hash() {
          return this.component_pattern.hash;
        }
      };
      globalThis.URLPattern || (globalThis.URLPattern = URLPattern);
    }
  });

  // client/element.ts
  (async function() {
    if (!window.URLPattern)
      await Promise.resolve().then(() => (init_urlpattern_min(), urlpattern_min_exports));
  })();
  var allowedOrigins = [""];
  if (window.location)
    allowedOrigins.push(window.location.origin);
  function registerAllowedOrigin(uri) {
    allowedOrigins.push(uri);
  }
  var scriptHost = { server: globalThis.Deno ? true : false, client: globalThis.Deno ? false : true };
  var registeredMessages = {};
  var registeredDeviceMessages = {};
  globalThis.addEventListener("message", (event) => {
    const thisEvent = event;
    if (!thisEvent.data) {
      console.warn("An invalid message structure was received:", thisEvent.data);
      return;
    }
    const eventData = thisEvent.data;
    const eventOrigin = thisEvent.origin;
    const message = eventData ? eventData.split("::") : "";
    const subject = message[0];
    const data = message[1];
    let listenerFound = false;
    if (!subject) {
      console.warn("Missing message subject:", message);
      return;
    }
    if (!allowedOrigins.includes(eventOrigin)) {
      console.warn("Message origin not registered:", eventOrigin);
      return;
    }
    if (registeredDeviceMessages[subject]) {
      listenerFound = true;
      const deviceWindow = window;
      if (deviceWindow.webkit) {
        deviceWindow.webkit.messageHandlers.Device.postMessage(eventData);
      } else {
        deviceWindow.Device.postMessage(eventData);
      }
    }
    if (registeredMessages[subject]) {
      listenerFound = true;
      const jsonData = data ? JSON.parse(data) : {};
      registeredMessages[subject](jsonData);
    }
    const children = document.querySelectorAll(`[data-listening]`);
    for (const childElement of children) {
      if (childElement._subscribedTo(subject)) {
        listenerFound = true;
        setTimeout(() => {
          const jsonData = data ? JSON.parse(data) : {};
          childElement._onMessageReceived(subject, jsonData);
        }, 0);
      }
    }
    if (!listenerFound) {
      console.warn(`No message listener was found for the subject '${subject}'`);
    }
  }, false);
  function subscribeTo(subject, func) {
    if (!subject || typeof subject != "string") {
      console.warn("A subject must be specified when subscribing to a message:", subject);
      return;
    }
    registeredMessages[subject] = func;
  }
  function deviceSubscribesTo(subject) {
    if (!subject || typeof subject != "string") {
      console.warn("A subject must be specified when subscribing to a message:", subject);
      return;
    }
    registeredDeviceMessages[subject] = true;
  }
  function postMessage(subject, data, target) {
    if (target === void 0)
      target = window;
    if (data === void 0)
      data = {};
    if (typeof target.postMessage != "function")
      throw "target: Must be a window object";
    target.postMessage(`${subject}::${JSON.stringify(data)}`);
  }
  var registeredRoutes = {};
  function registerRoute(path, handler) {
    if (path === void 0 || typeof path != "string") {
      console.warn("A path must be specified when registering a route:", path);
      return;
    }
    if (typeof handler != "function") {
      console.warn("A valid hanlder must be specified when registering a route:", handler);
      return;
    }
    registeredRoutes[path] = handler;
  }
  globalThis.addEventListener("popstate", async () => {
    const path = window.location.href;
    for (const routePath in registeredRoutes) {
      const route = { path: routePath, handler: registeredRoutes[routePath] };
      const pattern = new window.URLPattern({ pathname: route.path });
      if (pattern.test(path)) {
        let params = pattern.exec(path).pathname.groups;
        if (params[0])
          params = { path: params[0] };
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }
        await route.handler(params);
        break;
      }
    }
  }, false);
  function navigateTo(path) {
    if (path === void 0)
      globalThis.dispatchEvent(new Event("popstate"));
    else if (path == window.location.pathname)
      return;
    else {
      if (typeof path != "string") {
        console.warn("Provided path must of type string:", path);
        return;
      }
      window.history.pushState({}, "", path);
      dispatchEvent(new Event("popstate"));
    }
  }
  var Feature = class {
    featureFlags = [];
    constructor(flags2) {
      this.featureFlags = flags2;
    }
    flag(obj) {
      for (const prop in obj) {
        let found = false;
        const flags2 = prop.split(",");
        for (const flag of flags2) {
          if (this.featureFlags.includes(flag) || flag == "default") {
            obj[prop]();
            found = true;
            break;
          }
        }
        if (found)
          break;
      }
    }
  };
  var featureFlags = function() {
    if (scriptHost.client) {
      const featureFlags2 = window.document.cookie.split("; ").find((row) => row.startsWith("featureFlags="));
      if (featureFlags2)
        return featureFlags2.split("=")[1].split(":");
    }
    return [];
  }();
  var feature = new Feature(featureFlags);
  var RenderingStatus = class {
    rootElement = null;
    set document(value) {
      this.rootElement = value;
    }
    get atClient() {
      return this.rootElement.getAttribute("data-rendering-status") === "client";
    }
    get atServer() {
      return this.rootElement.getAttribute("data-rendering-status") === "server";
    }
    get loaded() {
      return this.rootElement.getAttribute("data-rendering-status") === null;
    }
  };
  var renderingStatus = new RenderingStatus();
  async function runAtClient(fn) {
    if (renderingStatus.atClient || renderingStatus.loaded)
      await fn();
  }
  async function runOnLoaded(fn) {
    if (renderingStatus.loaded)
      await fn();
  }
  async function runOnce(fn) {
    if (renderingStatus.atServer || renderingStatus.loaded)
      await fn();
  }
  var componentFactory = {};
  function registerComponent(type, initFunction) {
    componentFactory[type] = initFunction;
  }
  async function createDocumentFromFile(path, ctx, config) {
    if (scriptHost.server) {
      const file = await ctx.getPackageItem(path);
      if (file) {
        const content = new TextDecoder().decode(file.content);
        return await createDocument(content, ctx, config);
      } else
        throw "File Not Found";
    } else {
      return "";
    }
  }
  async function createDocument(html, ctx, config) {
    if (scriptHost.server) {
      const document2 = ctx.parser.parseFromString(html, "text/html");
      const appContext = {
        _componentTemplates: [],
        document: document2,
        getResource: async (path) => {
          const file = await ctx.getPackageItem(path);
          if (file) {
            const content = new TextDecoder().decode(file.content);
            return content;
          } else
            throw "File Not Found";
        },
        importModule: async (url) => {
          return await import(url + `?eTag=${ctx.domain.hostname}:${ctx.domain.cacheDTS}`);
        },
        loadCaptions: async (url) => {
          const module = await import(url + `?eTag=${ctx.domain.hostname}:${ctx.domain.cacheDTS}`);
          const captions = module["captions"];
          return (value, ...args) => {
            let caption = captions[value] || value;
            if (args && args.length > 0) {
              for (let i = 0; i < args.length; i++) {
                caption = caption.replaceAll("$" + (i + 1), args[i]);
              }
            }
            return caption;
          };
        }
      };
      document2.documentElement.setAttribute("data-rendering-status", "server");
      await render(config, document2.documentElement, appContext);
      for (const item of appContext._componentTemplates) {
        item.parent.insertBefore(item.template, item.parent.children[0]);
      }
      return document2.documentElement.outerHTML;
    } else {
      return "";
    }
  }
  async function render(config, element, ctx) {
    if (!element) {
      element = document.documentElement;
      renderingStatus.document = element;
    } else {
      renderingStatus.document = element.ownerDocument.documentElement;
    }
    if (!ctx)
      ctx = {
        _componentTemplates: [],
        document: renderingStatus.document,
        getResource: async (path) => {
          const response = await fetch(path);
          if (response.status === 200) {
            const content = await response.text();
            return content;
          } else
            throw "File Not Found";
        },
        importModule: async (url) => {
          return await import(url);
        },
        loadCaptions: async (url) => {
          const module = await import(url);
          const captions = module["captions"];
          return (value, ...args) => {
            let caption = captions[value] || value;
            if (args && args.length > 0) {
              for (let i = 0; i < args.length; i++) {
                caption = caption.replaceAll("$" + (i + 1), args[i]);
              }
            }
            return caption;
          };
        }
      };
    createComponent(element, ctx);
    if (renderingStatus.atServer) {
      element.setAttribute("data-id", "root");
      const children = element.querySelectorAll("[data-id]");
      for (const childElement of children) {
        childElement.setAttribute("data-parent", "root");
        createComponent(childElement, ctx);
        if (childElement._render)
          await childElement._render(config);
        element._components[childElement.getAttribute("data-id")] = childElement;
      }
      element.setAttribute("data-rendering-status", "client");
    } else if (renderingStatus.atClient) {
      const children = element.querySelectorAll('[data-parent="root"]');
      for (const childElement of children) {
        createComponent(childElement, ctx);
        if (childElement._render)
          await childElement._render(config);
        element._components[childElement.getAttribute("data-id")] = childElement;
      }
      element.removeAttribute("data-rendering-status");
    } else {
      element.setAttribute("data-id", "root");
      const children = element.querySelectorAll("[data-id]");
      for (const childElement of children) {
        childElement.setAttribute("data-parent", "root");
        createComponent(childElement, ctx);
        if (childElement._render)
          await childElement._render(config);
        element._components[childElement.getAttribute("data-id")] = childElement;
      }
      navigateTo();
    }
    return element._components;
  }
  function createComponent(element, ctx) {
    if (element._extend)
      return;
    const _messageListeners = {};
    let _childComponents = {};
    let _state = {};
    let _template = null;
    Object.defineProperties(element, {
      "_extend": {
        value: (obj) => {
          const props = {};
          for (const prop in obj) {
            if (prop == "render") {
              props["_" + prop] = {
                value: async (props2) => {
                  if (typeof props2 !== "object")
                    props2 = {};
                  if (element._renderAtClient && scriptHost.server)
                    return;
                  const propObject = obj[prop];
                  const attrs = {};
                  for (const attr of element.attributes) {
                    if (attr.name.startsWith("data-is-")) {
                      attrs[attr.name.substring(8)] = attr.value || true;
                    }
                  }
                  props2 = Object.assign(attrs, props2);
                  await propObject(Object.freeze(props2));
                  if (renderingStatus.atServer) {
                    element.setAttribute("data-is-state", JSON.stringify(_state));
                  }
                }
              };
            } else if (typeof obj[prop] === "function") {
              props["_" + prop] = { value: obj[prop] };
            } else
              props["_" + prop] = obj[prop];
          }
          Object.defineProperties(element, props);
        }
      },
      "_components": {
        get: () => {
          return _childComponents;
        }
      },
      "_onMessageReceived": {
        value: (subject, data) => {
          if (_messageListeners[subject])
            _messageListeners[subject](data);
        }
      },
      "_renderAtClient": {
        get: () => {
          return element.getAttribute("data-render-at") === "client";
        }
      },
      "_subscribedTo": {
        value: (subject) => {
          return _messageListeners[subject] ? true : false;
        }
      },
      "_subscribeTo": {
        value: (subject, func) => {
          _messageListeners[subject] = func;
          element.setAttribute("data-listening", "true");
        }
      },
      "_template": {
        set: (value) => {
          _template = value;
        },
        get: () => {
          return _template;
        }
      },
      "_unsubscribeTo": {
        value: (subject) => {
          delete _messageListeners[subject];
          if (Object.keys(_messageListeners).length === 0)
            element.removeAttribute("data-listening");
        }
      },
      "_useState": {
        value: (state, obj) => {
          if (renderingStatus.atClient) {
            if (element.hasAttribute("data-is-state")) {
              Object.assign(state, obj);
              Object.assign(state, JSON.parse(element.getAttribute("data-is-state")));
              element.removeAttribute("data-is-state");
            }
          } else {
            Object.assign(state, obj);
            _state = state;
          }
          return state;
        }
      },
      "_useTemplate": {
        value: (template, func) => {
          if (renderingStatus.atServer) {
            template = sanitize(template);
            _childComponents = {};
            loadTemplate(element, template);
            parseTemplate(element, ctx);
          } else if (renderingStatus.atClient) {
            if (element._renderAtClient) {
              _childComponents = {};
              loadTemplate(element, template);
            }
            parseTemplate(element, ctx);
          } else {
            if (func) {
              setTimeout(() => {
                if (template.startsWith("/") && template === element.getAttribute("data-view-template"))
                  return;
                _childComponents = {};
                loadTemplate(element, template);
                parseTemplate(element, ctx);
                func();
              }, 0);
            } else {
              _childComponents = {};
              loadTemplate(element, template);
              parseTemplate(element, ctx);
            }
          }
          return element._components;
        }
      },
      "_useTemplateUrl": {
        value: async (url, func) => {
          if (renderingStatus.atServer) {
            _childComponents = {};
            await loadTemplateUrl(element, ctx, url);
            parseTemplate(element, ctx);
          } else if (renderingStatus.atClient) {
            if (element._renderAtClient) {
              _childComponents = {};
              await loadTemplateUrl(element, ctx, url);
            }
            parseTemplate(element, ctx);
          } else {
            if (func) {
              setTimeout(async () => {
                if (url === element.getAttribute("data-view-template"))
                  return;
                _childComponents = {};
                await loadTemplateUrl(element, ctx, url);
                parseTemplate(element, ctx);
                func();
              }, 0);
            } else {
              if (url === element.getAttribute("data-view-template"))
                return;
              _childComponents = {};
              await loadTemplateUrl(element, ctx, url);
              parseTemplate(element, ctx);
            }
          }
          return element._components;
        }
      }
    });
    const type = element.getAttribute("data-is");
    if (type) {
      if (componentFactory[type])
        componentFactory[type](element, ctx);
      else
        console.warn(`The component type '${type}' is not registered.`);
    }
  }
  function loadTemplate(element, template) {
    if (!template)
      return;
    if (renderingStatus.atClient && element.getAttribute("data-view-template") !== null)
      return;
    element.setAttribute("data-view-template", "component");
    element.innerHTML = template;
  }
  async function loadTemplateUrl(element, ctx, url) {
    if (!url)
      return;
    if (renderingStatus.atClient && element.getAttribute("data-view-template") !== null)
      return;
    element.setAttribute("data-view-template", url);
    const template = await ctx.getResource(url);
    element.innerHTML = template;
  }
  function parseTemplate(element, ctx) {
    if (renderingStatus.atServer) {
      const templates = element.querySelectorAll("template");
      for (const template of templates) {
        ctx._componentTemplates.push({ parent: template.parentElement, template });
        template.parentElement._template = template.parentElement.removeChild(template);
      }
      const children = element.querySelectorAll("[data-id]");
      for (const childElement of children) {
        childElement.setAttribute("data-parent", element.getAttribute("data-id"));
        createComponent(childElement, ctx);
        element._components[childElement.getAttribute("data-id")] = childElement;
      }
    } else if (renderingStatus.atClient) {
      const templates = element.querySelectorAll("template");
      for (const template of templates) {
        template.parentElement._template = template;
      }
      if (element._renderAtClient) {
        const children = element.querySelectorAll("[data-id]");
        for (const childElement of children) {
          childElement.setAttribute("data-parent", element.getAttribute("data-id"));
          createComponent(childElement, ctx);
          element._components[childElement.getAttribute("data-id")] = childElement;
        }
      } else {
        const children = element.querySelectorAll(`[data-parent="${element.getAttribute("data-id")}"]`);
        for (const childElement of children) {
          createComponent(childElement, ctx);
          element._components[childElement.getAttribute("data-id")] = childElement;
        }
      }
    } else {
      const templates = element.querySelectorAll("template");
      for (const template of templates) {
        template.parentElement._template = template;
      }
      const children = element.querySelectorAll("[data-id]");
      for (const childElement of children) {
        createComponent(childElement, ctx);
        element._components[childElement.getAttribute("data-id")] = childElement;
      }
    }
  }
  function sanitize(code) {
    const sanitizedCode = code.replaceAll(/\?eTag=[a-zA-Z0-9:]+[\"]/g, '"').replaceAll(/\?eTag=[a-zA-Z0-9:]+[\']/g, "'");
    return sanitizedCode;
  }
  registerComponent("Repeater", (element, ctx) => {
    element._extend({
      render: {
        value: (props) => {
          element._useTemplate("");
          element._visible = props.visible || true;
        }
      },
      add: {
        value: (id) => {
          let clone;
          let children;
          if (!element._components[id]) {
            clone = element._template.content.firstElementChild.cloneNode(true);
            clone.setAttribute("data-id", id);
            clone.setAttribute("data-parent", element.getAttribute("data-id"));
            element.appendChild(clone);
            createComponent(clone, ctx);
            element._components[id] = clone;
            children = clone.querySelectorAll("[data-id]");
          } else {
            clone = element._components[id];
            children = clone.querySelectorAll(`[data-parent="${id}"]`);
          }
          for (const childElement of children) {
            childElement.setAttribute("data-parent", id);
            createComponent(childElement, ctx);
            clone._components[childElement.getAttribute("data-id")] = childElement;
          }
          return clone._components;
        }
      },
      removeAll: {
        value: () => {
          if (renderingStatus.loaded) {
            element.innerHTML = "";
            for (const item in element._components) {
              delete element._components[item];
            }
          }
        }
      },
      visible: {
        set: (value) => {
          element.style.display = value ? "" : "none";
        },
        get: () => {
          return element.style.display === "";
        }
      }
    });
  });
  registerComponent("Link", (element) => {
    element._extend({
      render: {
        value: (props) => {
          if (typeof props.onclick !== "function" && element.hasAttribute("onclick"))
            props.onclick = element.onclick;
          element._disabled = props.disabled ? true : false;
          element._hidden = props.hidden ? true : false;
          element._href = props.href;
          element._onclick = props.onclick || (() => {
          });
          element._value = props.value;
        }
      },
      click: {
        value: () => {
          element.click();
        }
      },
      disabled: {
        set: (value) => {
          if (typeof value != "boolean")
            return;
          if (value) {
            element.setAttribute("disabled", "true");
          } else {
            element.removeAttribute("disabled");
          }
        },
        get: () => {
          return element.getAttribute("disabled") ? true : false;
        }
      },
      hidden: {
        set: (value) => {
          if (typeof value != "boolean")
            return;
          element.style.display = value ? "none" : "inline-block";
        },
        get: () => {
          return element.style.display == "none";
        }
      },
      href: {
        set: (value) => {
          if (typeof value != "string")
            return;
          element.href = value;
        },
        get: () => {
          return element.href;
        }
      },
      onclick: {
        set: (value) => {
          if (typeof value != "function")
            return;
          element.onclick = (event) => {
            if (element._disabled || element._hidden)
              return;
            if (value() === false)
              return;
            navigateTo(element._href);
            event.preventDefault();
          };
        }
      },
      value: {
        set: (value) => {
          if (typeof value != "string")
            return;
          element.innerHTML = value;
        },
        get: () => {
          return element.innerHTML;
        }
      }
    });
  });
})();

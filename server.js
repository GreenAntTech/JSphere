(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // deps.ts
  var import_server = __require("https://deno.land/std@0.179.0/http/server.ts");
  var Base642 = __toESM(__require("https://deno.land/std@0.119.0/encoding/base64.ts"));
  var import_hex = __require("https://deno.land/std@0.179.0/encoding/hex.ts");
  var Cookies = __toESM(__require("https://deno.land/std@0.179.0/http/cookie.ts"));
  var import_mod3 = __require("https://deno.land/std@0.179.0/flags/mod.ts");
  var import_mod4 = __require("https://deno.land/std@0.179.0/dotenv/mod.ts");
  var log5 = __toESM(__require("https://deno.land/std@0.179.0/log/mod.ts"));
  var DenoDOM = __toESM(__require("https://esm.sh/linkedom@0.14.25"));

  // jsphere.ts
  var jsphere_exports = {};
  __export(jsphere_exports, {
    getDomain: () => getDomain,
    getHostProvider: () => getHostProvider,
    getPackageItem: () => getPackageItem,
    getProjectHost: () => getProjectHost,
    handleRequest: () => handleRequest,
    init: () => init,
    initializeDomain: () => initializeDomain,
    isDomainInitialized: () => isDomainInitialized,
    resetDomain: () => resetDomain,
    setDomain: () => setDomain
  });
  var log = __toESM(__require("https://deno.land/std@0.179.0/log/mod.ts"));
  var mime = __toESM(__require("https://deno.land/x/mime_types@1.0.0/mod.ts"));
  var import_mod = __require("https://deno.land/std@0.179.0/path/mod.ts");
  var handlers = [];
  var config = {};
  var domains = {};
  var host;
  async function init() {
    setProjectHost();
    await setServerConfig();
    setRequestHandlers();
  }
  function getHostProvider(config2) {
    switch (config2.name) {
      case "FileSystem":
        return new FileSystemProvider(config2);
      case "GitHub":
        return new GitHubProvider(config2);
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
    const cache = domain.contextExtensions["cache"].instance;
    await cache.set(`${domainHostname}::currentCacheDTS`, Date.now());
  }
  function isDomainInitialized(domainHostname) {
    if (domains[domainHostname])
      return domains[domainHostname].initialized;
  }
  function initializeDomain(domainHostname, value) {
    if (domains[domainHostname])
      domains[domainHostname].initialized = value;
  }
  async function handleRequest(request) {
    let response = false;
    let handlerIndex = 0;
    if (handlers.length > 0) {
      const url = new URL(request.url);
      const jsRequest = {
        HTTPRequest: request,
        method: request.method,
        url: request.url,
        routePath: url.pathname,
        routeParams: {}
      };
      while ((response = await handlers[handlerIndex].handleRequest(jsRequest)) === false) {
        if (++handlerIndex == handlers.length)
          break;
      }
    }
    if (response === false)
      return new Response("Request Handler Not Found.", { status: 404 });
    else {
      const url = new URL(request.url);
      const domainHostname = url.hostname;
      const domain = domains[domainHostname];
      if (domain && response.status == 200)
        response.headers.append("set-cookie", `featureFlags=${domain.appConfig.featureFlags.join(",")};domain=${domainHostname};path=/`);
      return response;
    }
  }
  async function getPackageItem(domainHostname, path) {
    const domain = domains[domainHostname];
    const item = domain.packageItemCache[path];
    if (item)
      return item;
    const packageKey = path.split("/")[1];
    if (!domain.appConfig.packages[packageKey])
      return null;
    const ref = domain.appConfig.packages[packageKey].tag || "main";
    const useLocalRepo = domain.appConfig.packages[packageKey].useLocalRepo;
    let file;
    if (useLocalRepo === true) {
      file = await host.getFile(path.substring(packageKey.length + 2) + (ref ? `?ref=${ref}` : ""), packageKey);
    } else {
      file = await domain.appProvider.getFile(path.substring(packageKey.length + 2) + (ref ? `?ref=${ref}` : ""), packageKey);
    }
    if (file !== null) {
      const extension = (0, import_mod.extname)(file.name);
      const contentType = (extension == ".ts" ? "application/typescript" : mime.lookup(extension) || "text/plain") + "; charset=utf-8";
      const cryptoData = new TextEncoder().encode(file.content);
      const eTag = file.sha || new TextDecoder().decode((0, import_hex.encode)(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData))));
      const packageItem = {
        contentType,
        content: file.content,
        eTag
      };
      for (const entry in domain.appConfig.packages[packageKey].packageItemConfig) {
        if (path.startsWith(`/${packageKey}${entry}`)) {
          Object.assign(packageItem, domain.appConfig.packages[packageKey].packageItemConfig[entry]);
        }
      }
      domain.packageItemCache[path] = packageItem;
      return packageItem;
    } else {
      return null;
    }
  }
  function setProjectHost() {
    let envHostName = "", envHostRoot = "", envHostAuth = "", envServerConfig = "";
    const config2 = Deno.env.get("CONFIG");
    if (config2 == "LOCAL_CONFIG") {
      envHostName = "FileSystem";
      envHostRoot = Deno.cwd();
      envServerConfig = Deno.env.get("LOCAL_CONFIG");
      if (!envServerConfig || !envHostRoot) {
        log.error("Local host is not properly configured. Please check that your environment variables are set correctly.");
        Deno.exit(0);
      }
    } else if (config2 == "REMOTE_CONFIG") {
      envHostName = Deno.env.get("REMOTE_HOST");
      envHostRoot = Deno.env.get("REMOTE_ROOT");
      envHostAuth = Deno.env.get("REMOTE_AUTH");
      envServerConfig = Deno.env.get("REMOTE_CONFIG");
      if (!envHostName || !envHostRoot || !envServerConfig) {
        log.error("Remote host is not properly configured. Please check that your environment variables are set correctly.");
        Deno.exit(0);
      }
    } else {
      log.error("Could not determine a host configuration. Please check that your environment variables are set correctly.");
      Deno.exit(0);
    }
    host = getHostProvider({ name: envHostName, root: envHostRoot, auth: envHostAuth, repo: envServerConfig });
    if (host == null) {
      log.warning(`Unsupported host '${envHostName}'. Defaulting to FileSystem.`);
      Deno.exit(0);
    }
    log.info(`Host Name: ${envHostName}`);
    log.info(`Host Root: ${envHostRoot}`);
  }
  async function setServerConfig() {
    let envServerConfig;
    const path = `server.json`;
    if (host.name == "FileSystem") {
      envServerConfig = Deno.env.get("LOCAL_CONFIG");
    } else {
      envServerConfig = Deno.env.get("REMOTE_CONFIG");
    }
    const content = await host.getConfigFile(path);
    if (content) {
      const serverConfig = JSON.parse(content);
      Object.assign(config, serverConfig);
      log.info(`Server Config: ${envServerConfig}/${path}`);
    } else
      log.warning(`Could not retrieve server configuration '${envServerConfig}/${path}'.`);
  }
  function setRequestHandlers() {
    handlers.push(server_state_handler_exports);
    handlers.push(domain_init_handler_exports);
    handlers.push(command_request_handler_exports);
    handlers.push(internal_request_handler_exports);
    handlers.push(routes_mapping_handler_exports);
    handlers.push(client_request_handler_exports);
    handlers.push(server_request_handler_exports);
    handlers.push(test_request_handler_exports);
  }

  // handlers/00-server-state-handler.ts
  var server_state_handler_exports = {};
  __export(server_state_handler_exports, {
    handleRequest: () => handleRequest2
  });

  // helpers/feature.ts
  var feature_exports = {};
  __export(feature_exports, {
    getInstance: () => getInstance
  });
  function getInstance(config2, _utils) {
    return new Feature(config2.appConfig.featureFlags);
  }
  var Feature = class {
    featureFlags;
    constructor(flags) {
      this.featureFlags = flags;
    }
    async flag(obj) {
      for (const prop in obj) {
        const flags = prop.split(",");
        for (const flag of flags) {
          if (this.featureFlags.includes(flag) || flag == "default") {
            return await obj[prop]();
          }
        }
      }
    }
  };

  // handlers/00-server-state-handler.ts
  async function handleRequest2(request) {
    let response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    if (url.pathname == "/~/healthcheck" && request.method == "GET") {
      return new Response("OK", { status: 200 });
    } else if (jsphere_exports.isDomainInitialized(domainHostname) === false) {
      response = new Response("Oops.  Your application is initializing. Please wait, then try your request again.", {
        status: 503,
        headers: {
          "content-type": "text/plain"
        }
      });
    } else if (jsphere_exports.isDomainInitialized(domainHostname) === true) {
      const domain = jsphere_exports.getDomain(domainHostname);
      const cache = domain.contextExtensions["cache"].instance;
      const currentCacheDTS = await cache.get(`${domainHostname}::currentCacheDTS`);
      if (currentCacheDTS > domain.currentCacheDTS) {
        jsphere_exports.initializeDomain(domainHostname, false);
        const file = await jsphere_exports.getProjectHost().getConfigFile(`.applications/${domain.appFile}.json`);
        if (file === null)
          throw new Error("Domain Application Not Registered");
        const appConfig = JSON.parse(file);
        if (!appConfig.host)
          appConfig.host = {};
        if (!appConfig.packages)
          appConfig.packages = {};
        if (!appConfig.routeMappings)
          appConfig.routeMappings = [];
        if (!appConfig.featureFlags)
          appConfig.featureFlags = [];
        if (!appConfig.settings)
          appConfig.settings = {};
        const appProvider = jsphere_exports.getHostProvider({
          name: appConfig.host.name,
          root: appConfig.host.name == "FileSystem" ? Deno.cwd().replaceAll("\\", "/") : appConfig.host.root,
          auth: appConfig.host.auth
        });
        if (appProvider) {
          domain.appProvider = appProvider;
          domain.appConfig = appConfig;
          domain.currentCacheDTS = currentCacheDTS, domain.packageItemCache = {};
          let module;
          const contextExtension = domain.contextExtensions["feature"];
          if (contextExtension.uri === "jsphere://Feature")
            module = feature_exports;
          else
            module = await import(contextExtension.uri);
          contextExtension.instance = module.getInstance({
            extension: "feature",
            domain: domainHostname,
            appId: domain.appId,
            settings: contextExtension.settings || {},
            appConfig: domain.appConfig
          }, new Utils());
        } else
          throw new Error(`Repo provider '${appConfig.host.name}' is not a registered provider.`);
        jsphere_exports.initializeDomain(domainHostname, true);
      }
    }
    return response;
  }

  // handlers/01-domain-init-handler.ts
  var domain_init_handler_exports = {};
  __export(domain_init_handler_exports, {
    handleRequest: () => handleRequest3
  });

  // helpers/cache.ts
  var cache_exports = {};
  __export(cache_exports, {
    getInstance: () => getInstance2
  });
  function getInstance2(_config, _utils) {
    return new Cache();
  }
  var Cache = class {
    cache = {};
    constructor() {
    }
    get = (key) => {
      const item = this.cache[key];
      if (item && item.expires !== 0 && Date.now() >= item.expires) {
        this.remove(key);
      }
      return this.cache[key] ? this.cache[key].value : null;
    };
    set = (key, value, expires) => {
      expires = typeof expires == "number" && expires > 0 ? Date.now() + expires * 1e3 : 0;
      this.cache[key] = { value, expires };
    };
    setExpires = (key, expires) => {
      const value = this.get(key);
      if (value)
        this.set(key, value, expires);
      return value;
    };
    remove = (key) => {
      delete this.cache[key];
    };
  };

  // handlers/01-domain-init-handler.ts
  var log2 = __toESM(__require("https://deno.land/std@0.179.0/log/mod.ts"));
  async function handleRequest3(request) {
    let response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const isInit = jsphere_exports.isDomainInitialized(domainHostname);
    if (!url.pathname.startsWith("/~/") && domainHostname != "127.0.0.1" && !isInit) {
      jsphere_exports.initializeDomain(domainHostname, false);
      try {
        let file = await jsphere_exports.getProjectHost().getConfigFile(`.domains/${domainHostname}.json`);
        if (file === null)
          throw new Error("Domain Not Registered");
        const domainConfig = JSON.parse(file);
        file = await jsphere_exports.getProjectHost().getConfigFile(`.applications/${domainConfig.appFile}.json`);
        if (file === null)
          throw new Error("Domain Application Not Registered");
        const appConfig = JSON.parse(file);
        if (!appConfig.host)
          appConfig.host = {};
        if (!appConfig.packages)
          appConfig.packages = {};
        if (!appConfig.routeMappings)
          appConfig.routeMappings = [];
        if (!appConfig.featureFlags)
          appConfig.featureFlags = [];
        if (!appConfig.settings)
          appConfig.settings = {};
        const appProvider = jsphere_exports.getHostProvider({
          name: appConfig.host.name,
          root: appConfig.host.name == "FileSystem" ? Deno.cwd().replaceAll("\\", "/") : appConfig.host.root,
          auth: appConfig.host.auth
        });
        if (appProvider) {
          jsphere_exports.setDomain(domainHostname, {
            initialized: true,
            appId: domainConfig.appId,
            appFile: domainConfig.appFile,
            settings: domainConfig.settings || {},
            contextExtensions: Object.assign({
              cache: { uri: "jsphere://Cache", settings: {} },
              feature: { uri: "jsphere://Feature", settings: {} }
            }, domainConfig.contextExtensions),
            state: {},
            appConfig,
            appProvider,
            currentCacheDTS: Date.now(),
            packageItemCache: {}
          });
          const domain = jsphere_exports.getDomain(domainHostname);
          const utils = new Utils();
          for (const prop in domain.contextExtensions) {
            const contextExtension = domain.contextExtensions[prop];
            let module;
            if (prop === "cache" && contextExtension.uri === "jsphere://Cache")
              module = cache_exports;
            else if (prop === "feature" && contextExtension.uri === "jsphere://Feature")
              module = feature_exports;
            else
              module = await import(contextExtension.uri);
            contextExtension.instance = await module.getInstance({
              extension: prop,
              domain: domainHostname,
              appId: domain.appId,
              settings: contextExtension.settings || {},
              appConfig: domain.appConfig
            }, utils);
          }
          const cache = domain.contextExtensions["cache"].instance;
          const currentCacheDTS = await cache.get(`${domainHostname}::currentCacheDTS`);
          if (currentCacheDTS === null)
            await cache.set(`${domainHostname}::currentCacheDTS`, domain.currentCacheDTS);
          else
            domain.currentCacheDTS = currentCacheDTS;
        } else
          throw new Error(`Repo provider '${appConfig.host.name}' is not a registered provider.`);
        jsphere_exports.initializeDomain(domainHostname, true);
      } catch (e) {
        jsphere_exports.initializeDomain(domainHostname, void 0);
        log2.error(`DomainInitHandler[${domainHostname}]: ${e.message}`);
        response = new Response(`${e.message}`, { status: 500 });
      }
    }
    return response;
  }

  // handlers/02-command-request-handler.ts
  var command_request_handler_exports = {};
  __export(command_request_handler_exports, {
    handleRequest: () => handleRequest4
  });
  async function handleRequest4(request) {
    let response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = jsphere_exports.getDomain(domainHostname);
    if (url.pathname == "/~/resetdomain" && request.method == "GET" && domain) {
      try {
        jsphere_exports.resetDomain(domainHostname, domain);
        response = new Response("Domain application was reset.", { status: 200 });
      } catch (e) {
        response = new Response(e.message, { status: 500 });
      }
    }
    return response;
  }

  // handlers/03-internal-request-handler.ts
  var internal_request_handler_exports = {};
  __export(internal_request_handler_exports, {
    handleRequest: () => handleRequest5
  });
  async function handleRequest5(request) {
    let response = false;
    const url = new URL(request.url);
    if (url.hostname == "127.0.0.1" && request.method == "GET" && request.HTTPRequest.headers.get("user-agent")?.startsWith("Deno")) {
      try {
        const eTag = url.searchParams.get("eTag");
        if (!eTag)
          return new Response("Not Found [Missing eTag]", { status: 404 });
        const domain = eTag.split(":")[0];
        const item = await jsphere_exports.getPackageItem(domain, request.routePath);
        if (item) {
          const content = parseContent(item.content, eTag);
          response = new Response(content, {
            status: 200,
            headers: {
              "content-type": item.contentType || ""
            }
          });
        } else {
          response = new Response("Not Found", { status: 404 });
        }
      } catch (e) {
        response = new Response(e.message, { status: 500 });
      }
    }
    return response;
  }
  function parseContent(content, eTag) {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    let parsedContent = textDecoder.decode(content);
    const found = parsedContent.match(/((import[ ]+)|(from[ ]+))(\(|"|')(?<path>[a-zA-Z0-9\/.\-_]+)("|'|\))/gi);
    if (found) {
      for (const entry of found) {
        let temp;
        if (entry.endsWith(`.ts"`))
          temp = entry.replace(`.ts"`, `.ts?eTag=${eTag}"`);
        else if (entry.endsWith(`.ts'`))
          temp = entry.replace(`.ts'`, `.ts?eTag=${eTag}'`);
        else if (entry.endsWith(`.js"`))
          temp = entry.replace(`.js"`, `.js?eTag=${eTag}"`);
        else if (entry.endsWith(`.js'`))
          temp = entry.replace(`.js'`, `.js?eTag=${eTag}'`);
        else if (entry.endsWith(`)`))
          temp = entry.replace(`)`, ` + '?eTag=${eTag}')`);
        if (temp)
          parsedContent = parsedContent.replace(entry, temp);
      }
    }
    return textEncoder.encode(parsedContent);
  }

  // handlers/04-routes-mapping-handler.ts
  var routes_mapping_handler_exports = {};
  __export(routes_mapping_handler_exports, {
    handleRequest: () => handleRequest6
  });
  var import_mod2 = __require("https://deno.land/std@0.179.0/path/mod.ts");
  var mime2 = __toESM(__require("https://deno.land/x/mime_types@1.0.0/mod.ts"));
  async function handleRequest6(request) {
    const response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = jsphere_exports.getDomain(domainHostname);
    const extension = (0, import_mod2.extname)(request.routePath);
    if (domain.appConfig.routeMappings && !mime2.lookup(extension)) {
      for (const entry of domain.appConfig.routeMappings) {
        const mapping = { route: entry.route, path: entry.path };
        const pattern = new URLPattern({ pathname: mapping.route });
        if (pattern.test(url.href)) {
          const folder = mapping.path.split("/")[2];
          if (folder == "server") {
            request.routeParams = pattern.exec(url.href)?.pathname.groups || {};
          }
          request.routePath = mapping.path;
          break;
        }
      }
    }
    return response;
  }

  // handlers/05-client-request-handler.ts
  var client_request_handler_exports = {};
  __export(client_request_handler_exports, {
    handleRequest: () => handleRequest7
  });
  async function handleRequest7(request) {
    let response = false;
    const httpRequest = request.HTTPRequest;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const folder = request.routePath.split("/")[2];
    if ((folder == "client" || folder == "shared") && request.method == "GET") {
      try {
        const item = await jsphere_exports.getPackageItem(domainHostname, request.routePath);
        if (item) {
          let eTag = httpRequest.headers.get("if-none-match");
          if (eTag && eTag.startsWith("W/"))
            eTag = eTag.substring(2);
          if (eTag == item.eTag) {
            response = new Response(null, { status: 304, headers: item.headers });
          } else {
            const headers = Object.assign({ "eTag": item.eTag, "content-type": item.contentType }, item.headers);
            response = new Response(item.content, {
              status: 200,
              headers
            });
          }
        } else {
          response = new Response("Not Found", { status: 404 });
        }
      } catch (e) {
        response = new Response(e.message, { status: 500 });
      }
    }
    return response;
  }

  // handlers/06-server-request-handler.ts
  var server_request_handler_exports = {};
  __export(server_request_handler_exports, {
    handleRequest: () => handleRequest8
  });
  async function handleRequest8(request) {
    let response = false;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = jsphere_exports.getDomain(domainHostname);
    const folder = request.routePath.split("/")[2];
    if (folder == "server") {
      let module;
      try {
        let routePath = request.routePath;
        if (!routePath.endsWith(".ts") && !routePath.endsWith(".js"))
          routePath += ".js";
        module = await import(`http://127.0.0.1${routePath}?eTag=${domainHostname}:${domain.currentCacheDTS}`);
      } catch (e) {
        console.log(e);
        if (e.message.startsWith("Module not found")) {
          return response = new Response("Either the requested resource or one of its dependencies was not found.", { status: 404 });
        }
      }
      const func = module[`on${request.method}`];
      if (func) {
        const serverContext = await getServerContext(request.HTTPRequest, request.routeParams);
        response = await func(serverContext);
        if (!response) {
          response = new Response(null, { status: 204 });
        }
      } else {
        response = new Response("Method Not Allowed", { status: 405 });
      }
    }
    return response;
  }
  async function getServerContext(request, routeParams) {
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = jsphere_exports.getDomain(domainHostname);
    const serverContext = {
      domain: await getDomainContext(request),
      request: await getRequestContext(request, routeParams),
      response: getResponseContext(request),
      settings: Object.assign(domain.appConfig.settings || {}, domain.settings),
      utils: new Utils(),
      parseHTML: DenoDOM.parseHTML,
      parser: new DenoDOM.DOMParser(),
      getPackageItem: async (path) => {
        const packageItem = await jsphere_exports.getPackageItem(domainHostname, path);
        return packageItem;
      },
      user: {}
    };
    for (const prop in domain.contextExtensions) {
      serverContext[prop] = domain.contextExtensions[prop].instance;
    }
    return serverContext;
  }
  async function getDomainContext(request) {
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const domain = jsphere_exports.getDomain(domainHostname);
    const domainContext = {
      appId: domain.appId,
      hostname: domainHostname,
      cacheDTS: domain.currentCacheDTS
    };
    return domainContext;
  }
  async function getRequestContext(request, routeParams) {
    const url = new URL(request.url);
    const contentType = request.headers.get("content-type");
    const requestContext = {
      path: url.pathname,
      headers: request.headers,
      cookies: Cookies.getCookies(request.headers),
      params: routeParams || {},
      data: {},
      files: []
    };
    url.searchParams.forEach((value, key) => {
      requestContext.params[key] = value;
    });
    if (contentType?.startsWith("application/json")) {
      requestContext.data = await request.json();
    } else if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      for await (const [key, value] of formData) {
        if (value instanceof File) {
          requestContext.files.push({
            content: new Uint8Array(await value.arrayBuffer()),
            filename: value.name,
            size: value.size,
            type: value.type
          });
        } else {
          const data = requestContext.data;
          data[key] = value;
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
  var ResponseObject = class {
    constructor() {
    }
    redirect = (url, status) => {
      return Response.redirect(url, status);
    };
    send = (body, init2) => {
      return new Response(body, init2);
    };
    json = (body, status) => {
      return new Response(JSON.stringify(body), {
        status: status || 200,
        headers: {
          "content-type": "application/json"
        }
      });
    };
    text = (body, status) => {
      return new Response(body, {
        status: status || 200,
        headers: {
          "content-type": "text/plain"
        }
      });
    };
    html = (body, status) => {
      return new Response(body, {
        status: status || 200,
        headers: {
          "content-type": "text/html"
        }
      });
    };
  };

  // handlers/07-test-request-handler.ts
  var test_request_handler_exports = {};
  __export(test_request_handler_exports, {
    handleRequest: () => handleRequest9
  });
  async function handleRequest9(request) {
    let response = false;
    const httpRequest = request.HTTPRequest;
    const url = new URL(request.url);
    const domainHostname = url.hostname;
    const folder = request.routePath.split("/")[2];
    if (folder == "tests" && request.method == "GET") {
      try {
        const item = await jsphere_exports.getPackageItem(domainHostname, request.routePath);
        if (item) {
          let eTag = httpRequest.headers.get("if-none-match");
          if (eTag && eTag.startsWith("W/"))
            eTag = eTag.substring(2);
          if (eTag == item.eTag) {
            response = new Response(null, { status: 304 });
          } else {
            const headers = Object.assign({ "eTag": item.eTag, "content-type": item.contentType }, item.headers);
            response = new Response(item.content, {
              status: 200,
              headers
            });
          }
        } else {
          response = new Response("Not Found", { status: 404 });
        }
      } catch (e) {
        response = new Response(e.message, { status: 500 });
      }
    }
    return response;
  }

  // helpers/utils.ts
  var Utils = class {
    constructor() {
    }
    createId = () => {
      return crypto.randomUUID();
    };
    createHash = async (value) => {
      const cryptoData = new TextEncoder().encode(value);
      const hash = new TextDecoder().decode((0, import_hex.encode)(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData))));
      return hash;
    };
    compareWithHash = async (value, hash) => {
      const cryptoData = new TextEncoder().encode(value);
      const valueHash = new TextDecoder().decode((0, import_hex.encode)(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData))));
      return valueHash === hash;
    };
    decrypt = async (data) => {
      const keyData = (0, import_hex.decode)(new TextEncoder().encode(Deno.env.get("CRYPTO_PRIVATE_KEY")));
      const privateKey = await crypto.subtle.importKey("pkcs8", keyData, { name: "RSA-OAEP", hash: "SHA-512" }, true, ["decrypt"]);
      const decBuffer = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        (0, import_hex.decode)(new TextEncoder().encode(data))
      );
      const decData = new Uint8Array(decBuffer);
      const decString = new TextDecoder().decode(decData);
      return decString;
    };
    encrypt = async (data) => {
      const keyData = (0, import_hex.decode)(new TextEncoder().encode(Deno.env.get("CRYPTO_PUBLIC_KEY")));
      const publicKey = await crypto.subtle.importKey("spki", keyData, { name: "RSA-OAEP", hash: "SHA-512" }, true, ["encrypt"]);
      const encBuffer = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        new TextEncoder().encode(data)
      );
      const encData = new Uint8Array(encBuffer);
      const encString = new TextDecoder().decode((0, import_hex.encode)(encData));
      return encString;
    };
  };

  // repos/filesystem.ts
  var log3 = __toESM(__require("https://deno.land/std@0.179.0/log/mod.ts"));
  var FileSystemProvider = class {
    config;
    constructor(config2) {
      this.config = config2;
    }
    async getFile(path, repo) {
      path = `${this.config.root}/${repo}/${path.split("?")[0]}`;
      try {
        const result = await Deno.readFile(path);
        return {
          name: path.split("/").pop(),
          content: result
        };
      } catch (e) {
        log3.error(e.message);
        return null;
      }
    }
    async getConfigFile(path) {
      path = `${this.config.root}/${this.config.repo}/${path.split("?")[0]}`;
      try {
        const result = await Deno.readFile(path);
        const content = new TextDecoder().decode(result);
        return content;
      } catch (e) {
        log3.error(e.message);
        return null;
      }
    }
    get name() {
      return this.config.name;
    }
  };

  // repos/github.ts
  var log4 = __toESM(__require("https://deno.land/std@0.179.0/log/mod.ts"));
  var Base64 = __toESM(__require("https://deno.land/std@0.179.0/encoding/base64.ts"));
  var GitHubProvider = class {
    config;
    constructor(config2) {
      this.config = config2;
    }
    async getFile(path, repo) {
      let url;
      try {
        if (this.config.auth) {
          url = `https://api.github.com/repos/${this.config.root}/${repo}/contents/${path}`;
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": `token ${this.config.auth}`
            }
          });
          const result = await response.json();
          if (result.sha) {
            const content = Base64.decode(result.content);
            result.content = content;
            return result;
          } else
            log4.warning(`${url} - ${result.message}`);
        } else {
          const parts = path.split("?");
          const ref = parts[1] ? parts[1].split("=")[1] : "main";
          if (parts[1])
            path = parts[0];
          url = `https://raw.githubusercontent.com/${this.config.root}/${repo}/${ref}/${path}`;
          const response = await fetch(url, { method: "GET" });
          const result = await response.text();
          return {
            name: path.split("/").pop(),
            content: new TextEncoder().encode(result)
          };
        }
      } catch (e) {
        console.log(e);
      }
      return null;
    }
    async getConfigFile(path) {
      try {
        let repo = this.config.repo;
        let ref = "main";
        const parts = repo.split(":");
        if (parts.length === 2) {
          repo = parts[0];
          ref = parts[1];
        }
        if (this.config.auth) {
          const url = `https://api.github.com/repos/${this.config.root}/${repo}/contents/${path}?ref=${ref}`;
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": `token ${this.config.auth}`
            }
          });
          const result = await response.json();
          if (result.sha) {
            const content = new TextDecoder().decode(Base64.decode(result.content));
            return content;
          } else
            log4.warning(`${url} - ${result.message}`);
        } else {
          const url = `https://raw.githubusercontent.com/${this.config.root}/${repo}/${ref}/${path}`;
          const response = await fetch(url, { method: "GET" });
          if (response.ok) {
            const result = await response.text();
            return result;
          }
        }
      } catch (e) {
        console.log(e);
      }
      return null;
    }
    get name() {
      return this.config.name;
    }
  };

  // server.ts
  (async function() {
    const envPath = `${Deno.cwd()}/.env`;
    const env = await (0, import_mod4.load)({ envPath });
    log5.info(`Environment (${envPath}):`, env);
    for (const key in env) {
      if (!Deno.env.get(key))
        Deno.env.set(key, env[key]);
    }
    await jsphere_exports.init();
    const serverPort = parseInt(Deno.env.get("SERVER_HTTP_PORT") || "80");
    log5.info(`JSphere Application Server is running.`);
    (0, import_server.serve)(jsphere_exports.handleRequest, { port: serverPort });
  })();
})();

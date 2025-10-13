import { Document } from "https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts";

export type ContextExtensionConfig = {
    extension: string
    settings: Record<string, unknown>
    appConfig: AppConfig
}

type AppConfig = {
    settings: Record<string, unknown>;
    featureFlags: string[];
}

export type ServerContext = {
    request: RequestContext
    response: ResponseContext
    settings: Record<string, unknown>
    utils: Utils
    cache: Cache
    feature: Feature
    parser: IParser
    getPackageItem: (path: string) => Promise<PackageItem | null>
}

type PackageItem = {
    eTag: string
    contentType: string
    content: Uint8Array
    headers?: Record<string, string>
}

interface IParser {
    parseFromString: (markupLanguage: string, mimeType: "text/html" | "image/svg+xml" | "text/xml", globals?: unknown) => Document
}

type RequestContext = {
    url: URL;
    method: string;
    routePath: string;
    headers: Headers;
    cookies: Record<string, string>;
    params: Record<string, string>;
    data: unknown;
    files: FileUpload[];
}

type Headers = {
    append (name: string, value: string): void
    delete (name: string): void
    get (name: string): string | null
    has (name: string): boolean
    set (name: string, value: string): void
    forEach (callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: unknown): void
}

type FileUpload = {
    content: Uint8Array;
    filename: string;
    size: number;
    type: string;
}

type Utils = {
    createId: () =>  string
    createHash: (value: string) =>  Promise<string>
    compareWithHash: (value: string, hash: string) => Promise<boolean>
    decrypt: (data: string) =>  Promise<string>
    encrypt: (data: string) =>  Promise<string>
}

type Feature = {
    flag: (obj: Record<string, () => void>) => void
}

type Cache = {
    get: (key: string) => unknown|Promise<unknown>
    set: (key: string, value: unknown, expires?: number) => void|Promise<void>
    delete: (key: string) => boolean|Promise<boolean>
}

type ResponseContext = {
    redirect: (url: string, status: number) => Response
    send: (body: Uint8Array|Record<string,unknown>|string|null, init: ResponseInit) => Response
    json: (body: Record<string,unknown>, status?: number) => Response
    text: (body: string, status?: number) => Response
    html: (body: string, status?: number) => Response
    stream: (fn: StreamFunction, init: ResponseInit) => Response;
}

export type StreamFunction = (
    push: (data: unknown, onClose?: () => void) => void | Promise<void>
) => void;
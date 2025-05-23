import { Document } from "https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts";

export * from "https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts";

export interface IObject {
    [name:string]: unknown
}

export type ContextExtensionConfig = {
    extension: string
    domain: string, 
    settings: Record<string, unknown|IObject>
    appConfig: IObject
}

export type ServerContext = {
    domain: DomainContext
    request: RequestContext
    response: ResponseContext
    settings: IObject
    user: IObject
    utils: Utils
    db: IDataStore
    cache: ICache
    storage: IStorage
    feature: Feature
    parser: IParser
    getPackageItem: (path: string) => Promise<PackageItem | null>
    [key: string] : unknown
}

export type DomainContext = {
    hostname: string
    cacheDTS: number
}

export type RequestContext = {
    url: URL
    headers: Headers
    cookies: Record<string, string>
    params: Record<string, string>
    data: IObject|Blob
    files: Array<RequestFile>
}

export type ResponseContext = {
    redirect: (url: string, status: number) => Response
    send: (body: Uint8Array|IObject|string|null, init: IObject) => Response
    json: (body: IObject, status?: number) => Response
    text: (body: string, status?: number) => Response
    html: (body: string, status?: number) => Response
}

export type PackageItem = {
    eTag: string
    contentType: string
    content: Uint8Array
    headers?: Record<string, string>
}

export type Headers = {
    append (name: string, value: string): void
    delete (name: string): void
    get (name: string): string | null
    has (name: string): boolean
    set (name: string, value: string): void
    forEach (callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: unknown): void
}

export type RequestFile = {
    content: Uint8Array
    filename: string
    size: number
    type: string
}

export type Utils = {
    createId: () =>  string
    createHash: (value: string) =>  Promise<string>
    compareWithHash: (value: string, hash: string) => Promise<boolean>
    decrypt: (data: string) =>  Promise<string>
    encrypt: (data: string) =>  Promise<string>
}

export type Feature = {
    flag: (obj: Record<string, () => void>) => void
}

export interface ICache {
    get: (key: string) => unknown|Promise<unknown>
    set: (key: string, value: unknown, expires?: number) => void|Promise<void>
    setExpires: (key: string, expires?: number) => unknown|Promise<unknown>
    remove: (key: string) => void|Promise<void>
}

export interface IMail {
    send: (config: IObject) => Promise<void>
}

export interface IStorage {
    create: () =>  Promise<void>
    put: (key: string, file: Uint8Array, contentType: string) =>  Promise<void>
    get: (key: string) => Promise<Uint8Array>
    delete: (key: string) =>  Promise<void>
    copy: (source: string, key: string) => Promise<void>
}

export interface ITransaction {
    run: (query:string, parameters:IObject, config?:IObject) =>  Promise<unknown>
    commit: () => void
    rollback: () => void
}

export interface IDataStore {
    run: (query:string, parameters:IObject, config?:IObject) =>  Promise<unknown>
    readTransaction: (fn: (tx:ITransaction) => Promise<unknown>, config?:IObject) => Promise<unknown>
    writeTransaction: (fn: (tx:ITransaction) => Promise<unknown>, config?:IObject) => Promise<unknown>
}

export interface IParser {
    parseFromString: (markupLanguage: string, mimeType: "text/html" | "image/svg+xml" | "text/xml", globals?: unknown) => Document
}

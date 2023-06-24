export { HTMLElement, HTMLTemplateElement } from "https://esm.sh/v125/linkedom@0.14.25/types/esm/index";
export { Document } from "https://esm.sh/v125/linkedom@0.14.25/types/esm/interface/document";
export { XMLDocument } from "https://esm.sh/v125/linkedom@0.14.25/types/esm/xml/document";

export interface IObject {
    [name:string]: unknown
}

export interface IComponent extends HTMLElement {
    _addMessageListener: (subject:string, func:(config: IObject) => void) => void
    _components: Record<string, IComponent>
    _defineProperties: (props:IPropertiesObject) => void
    _render: (props?:IObject) => Promise<void>|void
    _renderAtClient: boolean
    _onMessageReceived: (subject:string, data:IObject) => void
    _subscribedTo: (subject:string) => boolean
    _removeMessageListener: (subject:string) => void
    _reset: () => void
    _template: HTMLElement
    _useState: (state:IObject, obj:IObject) => IObject
    _useTemplate: (template:string, func?:(config:IObject) => void) => Promise<Record<string, IComponent>>
    _useTemplateUrl: (url:string, func?:(config:IObject) => void) => Promise<Record<string, IComponent>>
}

export interface IComponentMethod {
    value: (value: unknown) => Promise<unknown> | unknown
}

export interface IComponentGetter {
    get: () => unknown
}

export interface IComponentSetter {
    set: (value:  unknown) => void
}

export interface IPropertiesObject {
    [name:string]: IComponentGetter | IComponentMethod | IComponentSetter
}

export type ServerContext = {
    domain: IDomainContext
    request: IRequestContext
    response: IResponseContext
    settings: IObject
    user: IObject
    utils: IUtils
    db: IDataStore
    cache: ICache
    storage: IStorage
    feature: IFeature
    parser: IParser
    getPackageItem: (path: string) => Promise<PackageItem | null>
    [key: string] : unknown
}

export type AppContext = {
    document: Document
    getResource: (path: string) => Promise<string>
    importModule: (url: string) => unknown
    loadCaptions: (url: string) => Promise<(value: string, ...args: string[]) => string>
    [key: string] : unknown
}

export interface IDomainContext {
    appId?: string
    hostname: string
    cacheDTS: number
}

export interface IRequestContext {
    path: string
    headers: IHeaders
    cookies: Record<string, string>
    params: Record<string, string>
    data: IObject|Blob
    files: Array<IRequestFile>
}

export interface IResponseContext {
    redirect: (url: string, status: number) => Response
    send: (body: Uint8Array|IObject|string, init: IObject) => Response
    json: (body: IObject, status?: number) => Response
    text: (body: string, status?: number) => Response
    html: (body: string, status?: number) => Response
}

export interface PackageItem {
    eTag: string
    contentType: string
    content: Uint8Array
    headers?: Record<string, string>
}

export interface IHeaders {
    append (name: string, value: string): void
    delete (name: string): void
    get (name: string): string | null
    has (name: string): boolean
    set (name: string, value: string): void
    forEach (callbackfn: (value: string, key: string, parent: IHeaders) => void, thisArg?: unknown): void
}

export interface IRequestFile {
    content: Uint8Array
    filename: string
    size: number
    type: string
}

export interface IUtils {
    createId: () =>  string
    createHash: (value: string) =>  Promise<string>
    compareWithHash: (value: string, hash: string) => Promise<boolean>
    decrypt: (data: string) =>  Promise<string>
    encrypt: (data: string) =>  Promise<string>
}

export interface IFeature {
    flag: (obj: Record<string, () => void>) => void
}

export interface ICache {
    get: (key: string) => unknown|Promise<unknown>
    set: (key: string, value: unknown, expires?: number) => void|Promise<void>
    setExpires: (key: string, expires?: number) => unknown|Promise<unknown>
    remove: (key: string) => void|Promise<void>
}

export interface IStorage {
    create: () =>  Promise<void>
    put: (key: string, file: Uint8Array, contentType: string) =>  Promise<void>
    get: (key: string) => Promise<Uint8Array>
    delete: (key: string) =>  Promise<void>
    copy: (source: string, key: string) => Promise<void>
}

export interface ITransaction {
    run: (query:string, parameters:Record<string, unknown>, config?:Record<string, unknown>) =>  Promise<unknown>
    commit: () => void
    rollback: () => void
}

export interface IDataStore {
    run: (query:string, parameters:Record<string, unknown>, config?:Record<string, unknown>) =>  Promise<unknown>
    readTransaction: (fn: (tx:ITransaction) => Promise<unknown>, config?:Record<string, unknown>) => Promise<unknown>
    writeTransaction: (fn: (tx:ITransaction) => Promise<unknown>, config?:Record<string, unknown>) => Promise<unknown>
}

export interface IParser {
    parseFromString: (markupLanguage: string, mimeType: "text/html" | "image/svg+xml" | "text/xml", globals?: unknown) => Document | XMLDocument
}

export interface IRepeater extends IComponent {
    _add: (id: string) => Promise<Record<string, IComponent>>
    _removeAll: () => void
    _visible: boolean
}

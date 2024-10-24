export const appState$: IObject
export const feature$: Feature
export function createComponent$ (name:string, handler:(el:Component) => void) : string
export function createComponent$ (handler:(el:Component) => void) : string
export function renderDocument$ (html:string, config:IObject) : Promise<string>
export function deviceSubscribesTo$ (subject:string) : void
export function emitMessage$ (subject:string, data?:IObject, target?: Window & typeof globalThis) : void
export function navigateTo$ (path:string) : void
export function registerAllowedOrigin$ (uri:string) : void
export function registerCaptions$ (name:string, captions:Record<string, string>) : void
export function registerDependencies$ (dependencies:Record<string, string>) : Promise<void>
export function registerRoute$ (path:string, handler:(path:string, params:IObject) => Promise<void> | void) : void
export function subscribeTo$ (subject:string, handler:(data:IObject) => Promise<void>) : void

export interface IObject {
    [name:string]: unknown
}

export type RouteHandlers = {
    [name:string]: (path:string, params:IObject) => Promise<void>
}

export type FeatureHandlers = {
    [name:string]: () => Promise<void>
}

export type MessageHandlers = {
    [name:string]: (data:IObject, ctx:unknown) => Promise<void>
}

export type DeviceMessageHandlers = {
    [name:string]: boolean
}

export type ComponentHandlers = {
    [name:string]: (el:Component) => void
}

export type Component = HTMLElement & {
    addAfter$: (type:string, elId:string, tagName?:string) => Promise<Component>
    addBefore$: (type:string, elId:string, tagName?:string) => Promise<Component>
    addFirst$: (type:string, elId:string, tagName?:string) => Promise<Component>
    addLast$: (type:string, elId:string, tagName?:string) => Promise<Component>
    captions$: (name:string) => (value:string, ...args:Array<string>) => void
    children$: Record<string, Component|Array<Component>>
    define$: (props:PropertiesObject) => void
    hidden$: boolean
    id$: string
    is$: string
    onMessageReceived$: (subject:string, data:IObject) => Promise<void>
    onRender$: (props?:unknown) => Promise<void>|void
    onHydrate$: (props?:unknown) => Promise<void>|void
    parent$: Component
    remove$: () => void
    removeChild$: () => void
    removeChildren$: () => void
    template$: (props:IObject) => unknown 
    render$: (props?:unknown) => Promise<void>|void
    hydrate$: (props?:unknown) => Promise<void>|void
    renderAtClient$: boolean
    renderAtServer$: boolean
    subscribeTo$: (subject:string, func:(config:IObject) => void) => void
    listensFor$: (subject:string) => boolean
    unsubscribeTo$: (subject:string) => void
    use$: () => Array<string>
    // Link Properties
    disabled$: boolean
    href$: string
    text$: string
    src$: (props:IObject) => unknown
}

type ComponentMethod = {
    value: (value:unknown) => Promise<unknown> | unknown
}

type ComponentGetter = {
    get: () => unknown
}

type ComponentSetter = {
    set: (value:unknown) => void
}

type PropertiesObject = {
    [name:string]: ComponentGetter | ComponentMethod | ComponentSetter | ((...args: any[]) => Promise<unknown> | unknown)
}

export type Link = Component & {
    disabled$: boolean
    href$: string
    text$: string
}

export type ServerContext = {
    domain: DomainContext
    request: RequestContext
    parser: IParser
    getPackageItem: (path: string) => Promise<PackageItem | null>
}

type DomainContext = {
    hostname: string
    cacheDTS: number
}

export type RequestContext = {
    url: URL
    params: Record<string, string>
}

interface IParser {
    parseFromString: (markupLanguage: string, mimeType: "text/html" | "image/svg+xml" | "text/xml", globals?: unknown) => Document | XMLDocument
}

type PackageItem = {
    eTag: string
    contentType: string
    content: Uint8Array
    headers?: Record<string, string>
}

type AppContext = {
    document?: Document
    getPackageItem?: (path: string) => Promise<PackageItem|null>
    getResource: (path: string) => Promise<string|null>
    importModule: (url: string) => Promise<IObject>
    parser?: IParser
    [key: string] : unknown
}

export type Feature = {
    flag: (obj: Record<string, () => void>) => void
}

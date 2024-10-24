export const appState$: IObject
export const feature$: Feature
export function createComponent$ (name:string, handler:(el:Component) => void) : string
export function createComponent$ (handler:(el:Component) => void) : string
export function renderDocument$ (html:string, config:IObject) : Promise<string>
export function createDocumentFromFile$ (path:string, config:IObject) : Promise<string>
export function deviceSubscribesTo$ (subject:string) : void
export function emitMessage$ (subject:string, data?:IObject, target?: Window & typeof globalThis) : void
export function navigateTo$ (path:string) : void
export function registerAllowedOrigin$ (uri:string) : void
export function registerCaptions$ (name:string, captions:Record<string, string>) : void
export function registerDependencies$ (dependencies:Record<string, string>) : Promise<void>
export function registerRoute$ (path:string, handler:(path:string, params:IObject) => Promise<void> | void) : void
export function renderComponents$ (config?:IObject, element?:Component) : Promise<Record<string, Component>>
export function runAtClient$ (fn:() => Promise<unknown>) : unknown
export function runAtServer$ (fn:() => Promise<unknown>) : unknown
export function runOnce$ (fn:() => Promise<unknown>) : unknown
export function runOnLoaded$ (fn:() => Promise<unknown>) : unknown
export function subscribeTo$ (subject:string, handler:(data:IObject) => Promise<void>) : void

export interface IObject {
    [name:string]: unknown
}

export type Themes = {
    [name:string]: Record<string, string|IObject>
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
    after$: (component:Component|string, elId?:string) => Promise<Component>
    append$: (component:Component|string, elId?:string) => Promise<Component>
    before$: (component:Component|string, elId?:string) => Promise<Component>
    captions$: (name:string) => (value:string, ...args:Array<string>) => void
    children$: Record<string, Component>
    define$: (props:PropertiesObject) => void
    extend$: (props:PropertiesObject) => void
    id$: string
    is$: string
    load$: (value:string) => Promise<void>
    onMessageReceived$: (subject:string, data:IObject) => Promise<void>
    onServer$: (props?:unknown) => Promise<void>|void
    onClient$: (props?:unknown) => Promise<void>|void
    onStateChange$: (dataFunc:() => void, reactiveFunc:() => void) => void
    parent$: Component
    prepend$: (component:Component|string, elId?:string) => Promise<Component>
    remove$: () => void
    removeChild$: () => void
    removeChildren$: () => void
    init$: (props?:unknown) => Promise<void>|void
    renderAtClient$: boolean
    subscribeTo$: (subject:string, func:(config:IObject) => void) => void
    listensFor$: (subject:string) => boolean
    setThemes$: (themes:string, cascade?:boolean) => void;
    unsetThemes$: (themes:string, cascade?:boolean) => void;
    unsubscribeTo$: (subject:string) => void
    use$: () => Promise<Array<string>>
    useState$: (obj:IObject) => IObject
    useTemplate$: (template?:string, func?:() => void) => Record<string, Component>
    useTemplateUrl$: (url:string, func?:() => void) => Promise<Record<string, Component>>
    useThemes$: (themes:Themes, theme:string) => void
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

export type ServerContext = {
    domain: DomainContext
    getPackageItem: (path: string) => Promise<PackageItem | null>
    parser: IParser
    [key: string] : unknown
}

type DomainContext = {
    hostname: string
    cacheDTS: number
}

type PackageItem = {
    eTag: string
    contentType: string
    content: Uint8Array
    headers?: Record<string, string>
}

interface IParser {
    parseFromString: (markupLanguage: string, mimeType: "text/html" | "image/svg+xml" | "text/xml", globals?: unknown) => Document | XMLDocument
}

type AppContext = {
    document?: Document
    getPackageItem?: (path: string) => Promise<PackageItem | null>
    getResource: (path: string) => Promise<string>
    importModule: (url: string) => Promise<any>
    parser?: IParser
    [key: string] : unknown
}

export type Feature = {
    flag: (obj: Record<string, () => void>) => void
}

export type GenericComponent = Component & {
    click$: () => void
    hidden$: boolean
    onclick$: (e: Event) => void
    value$: string
}

export type Link = Component & {
    click$: () => void
    disabled$: boolean
    href$: string
    onclick$: (e: Event) => void | boolean
    value$: string
}

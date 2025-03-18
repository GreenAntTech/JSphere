import { Element } from "https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts";

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

export type FeatureHandlers = {
    [name:string]: () => Promise<void>
}

export type MessageHandlers = {
    [name:string]: (data:IObject, ctx:unknown) => Promise<IObject|void>
}

export type DeviceMessageHandlers = {
    [name:string]: boolean
}

export type ComponentHandlers = {
    [name:string]: (el:Component) => void
}

export type Component = Element & {
    add$: (props?:IObject) => Promise<Component>
    captions$: (name:string) => (value:string, ...args:Array<string>) => void
    children$: Record<string, Component|Array<Component>>
    componentState$: number
    define$: (props:PropertiesObject) => void
    documentState$: string
    hidden$: boolean
    hydrateOnCallback$: (props?:unknown) => Promise<void>|void
    hydrateOnComponents$: IObject[]
    hydrating$: boolean
    id$: string
    init$: (props?:unknown, isRoot?:boolean) => Promise<void>|void
    initChildren$: () => void
    is$: string
    isRendered$: boolean
    onMessageReceived$: (subject:string, data:IObject) => Promise<void>
    onInit$: (props?:unknown) => Promise<void>|void
    onRender$: (props?:unknown) => Promise<void>|void
    onHydrate$: (props?:unknown) => Promise<void>|void
    onLoaded$: (props?:unknown) => Promise<void>|void
    parent$: Component
    remove$: () => void
    removeChild$: () => void
    removeChildren$: () => void
    state$: IObject
    template$: (props?:IObject) => string|void 
    useTemplate$: (props?:IObject) => IObject
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
    text$: string|number
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
    [name:string]: ComponentGetter | ComponentMethod | ComponentSetter | ((...args: unknown[]) => Promise<unknown> | unknown)
}

export type GenericComponent = Component & {
    value$: string
    onclick$: (event:Event) => void
}

export type Link = Component & {
    disabled$: boolean
    href$: string
    value$: string
    onclick$: (event:Event) => void
}

export type Feature = {
    flag: (obj: Record<string, () => void>) => void
}

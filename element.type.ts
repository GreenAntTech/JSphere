export interface IObject {
    [name:string]: unknown
}

export type Component = HTMLElement & {
    _components: Record<string, Component>
    _extend: (props:PropertiesObject) => void
    _render: (props?:IObject) => Promise<void>|void
    _renderAtClient: boolean
    _onMessageReceived: (subject:string, data:IObject) => void
    _reset: () => void
    _subscribeTo: (subject:string, func:(config:IObject) => void) => void
    _subscribedTo: (subject:string) => boolean
    _unsubscribeTo: (subject:string) => void
    _template: HTMLElement
    _useState: (state:IObject, obj:IObject) => IObject
    _useTemplate: (template:string, func?:(config:IObject) => void) => Record<string, Component>
    _useTemplateUrl: (url:string, func?:(config:IObject) => void) => Promise<Record<string, Component>>
}

export type ComponentMethod = {
    value: (value: unknown) => Promise<unknown> | unknown
}

export type ComponentGetter = {
    get: () => unknown
}

export type ComponentSetter = {
    set: (value:  unknown) => void
}

export type PropertiesObject = {
    [name:string]: ComponentGetter | ComponentMethod | ComponentSetter | ((value: unknown) => Promise<unknown> | unknown)
}

export type AppContext = {
    document: Document
    getResource: (path: string) => Promise<string>
    importModule: (url: string) => Promise<any>
    loadCaptions: (url: string) => Promise<(value: string, ...args: string[]) => string>
    [key: string] : unknown
}

export type Feature = {
    flag: (obj: Record<string, () => void>) => void
}

export type Link = Component & {
    _click: () => void
    _disabled: boolean
    _hidden: boolean
    _href: string
    _onclick: (e: Event) => void
    _value: string
}

export type Repeater = Component & {
    _add: (id: string) => Promise<Record<string, Component>>
    _removeAll: () => void
    _visible: boolean
}

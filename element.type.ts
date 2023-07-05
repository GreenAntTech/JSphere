export interface IObject {
    [name:string]: unknown
}

export interface IComponent extends HTMLElement {
    _components: Record<string, IComponent>
    _extend: (props:IPropertiesObject) => void
    _render: (props?:IObject) => Promise<void>|void
    _renderAtClient: boolean
    _onMessageReceived: (subject:string, data:IObject) => void
    _reset: () => void
    _subscribeTo: (subject:string, func:(config:IObject) => void) => void
    _subscribedTo: (subject:string) => boolean
    _unsubscribeTo: (subject:string) => void
    _template: HTMLElement
    _useState: (state:IObject, obj:IObject) => IObject
    _useTemplate: (template:string, func?:(config:IObject) => void) => Record<string, IComponent>
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
    [name:string]: IComponentGetter | IComponentMethod | IComponentSetter | ((value: unknown) => Promise<unknown> | unknown)
}

export type IAppContext = {
    document: Document
    getResource: (path: string) => Promise<string>
    importModule: (url: string) => Promise<any>
    loadCaptions: (url: string) => Promise<(value: string, ...args: string[]) => string>
    [key: string] : unknown
}

export interface IFeature {
    flag: (obj: Record<string, () => void>) => void
}

export interface ILink extends IComponent {
    _click: () => void
    _disabled: boolean
    _hidden: boolean
    _href: string
    _onclick: (e: Event) => void
    _value: string
}

export interface IRepeater extends IComponent {
    _add: (id: string) => Promise<Record<string, IComponent>>
    _removeAll: () => void
    _visible: boolean
}

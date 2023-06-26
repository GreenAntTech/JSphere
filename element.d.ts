export { Document, HTMLElement, HTMLTemplateElement, NodeListOf, Window } from "https://esm.sh/v126/gh/microsoft/typescript@v5.0.4/src/lib/dom.generated.d.ts";

import { Document, HTMLElement } from "https://esm.sh/v126/gh/microsoft/typescript@v5.0.4/src/lib/dom.generated.d.ts";

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

export type AppContext = {
    document: Document
    getResource: (path: string) => Promise<string>
    importModule: (url: string) => unknown
    loadCaptions: (url: string) => Promise<(value: string, ...args: string[]) => string>
    [key: string] : unknown
}

export interface IFeature {
    flag: (obj: Record<string, () => void>) => void
}

export interface IRepeater extends IComponent {
    _add: (id: string) => Promise<Record<string, IComponent>>
    _removeAll: () => void
    _visible: boolean
}

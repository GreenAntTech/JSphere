import type { IObject, ServerContext } from "../server.d.ts";
import { renderDocument$ } from "../../shared/element.min.js";
import * as log from "https://deno.land/std@0.179.0/log/mod.ts";

export function getInstance (config: IObject) {
    let appPackage = '';
    appPackage = (config.settings as IObject).appPackage as string;
    if (appPackage) {
        try {
            log.info('PageServer: Instance created.');
            return new PageServer(appPackage);
        }
        catch(e) {
            log.error(`PageServer: Instance creation failed.`, e);
        }
    }
    else log.error('PageServer: One or more required parameters (appPackage) have not been set.');
}

class PageServer {
    private appPackage = '';

    constructor(appPackage:string) {
        this.appPackage = appPackage;
    }

    serve = async (ctx: ServerContext) : Promise<Response> => {
        try {
            const file = ctx.request.url.pathname.split('/')[1];
            const document = await renderDocument$({ file: `/${this.appPackage}/client/components/pages/${file}.html` }, ctx) as string;
            return ctx.response.html('<!doctype html>' + document);
        }
        catch (e) {
            console.error(e);
            return ctx.response.html(e.message);
        }
    }
}

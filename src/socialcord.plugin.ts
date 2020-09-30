/**
 * @name Socialcord
 * @version 0.1.0
 * @description nothing
 * 
 * @website http://twitter.com/BandagedBD
 */

import { BdApi } from "@bandagedbd/bdapi";
import TdClient, { TdError, TdObject, TdOptions } from "tdweb";

class TdManager
{
    private static WASM_FILE_NAME = 'a848b8b40a9281225b96b8d300a07767.wasm';
    private static WASM_FILE_HASH = TdManager.WASM_FILE_NAME.replace('.wasm', '');

    private client: TdClient;
    public onUpdateCallBack?: (update: TdObject) => any;

    public constructor()
    {
        const opts: TdOptions = {
            logVerbosityLevel: 0,
            jsLogVerbosityLevel: "error",
            mode: "wasm",
            instanceName: "tdlib",
            readOnly: false,
            isBackground: false,
            useDatabase: false,
            //wasmUrl: `${this.WASM_FILE_NAME}?_sw-precache=${this.WASM_FILE_HASH}`,
            onUpdate: (update: TdObject) =>
            {
                if (this.onUpdateCallBack)
                    return this.onUpdateCallBack(update);
            }
        };

        this.client = new TdClient(opts);
    }

    public async Send(query: TdObject): Promise<TdError | TdObject>
    {
        console.log("Send : ", query);
        return this.client.send(query);
    }
}

export class Socialcord
{
    public getName(): string
    {
        return "Socialcord";
    }

    public getDescription(): string
    {
        return "Describe the basic functions. Maybe a support server link";
    }

    public getVersion(): string
    {
        return "0.1.0";
    }

    public getAuthor(): string
    {
        return "CorrM";
    }

    public async start(): Promise<void>
    {
        BdApi.alert("CORRM", BdApi.React.version);

        const tObj: TdObject = {
            "@type": "getAuthorizationState"
        };

        const client = new TdManager();
        client.onUpdateCallBack = this.OnRecv;

        try
        {
            //const result = client.Send(tObj);
            //console.log("Result : ", result);
        } catch (error)
        {
            console.error("error : ", error);
        }
    }

    public stop(): void
    {

    }

    public getSettingsPanel(): void
    {

    }

    private OnRecv(update: TdObject): void {
        console.log('UPDATE : ', update);
    }
}
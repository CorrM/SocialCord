/**
 * @name Socialcord
 * @version 0.1.0
 * @description nothing
 * 
 * @website http://twitter.com/BandagedBD
 */

import { BdApi } from "@bandagedbd/bdapi";
import { MTProto, getSRPParams } from "@mtproto/core";

class TdManager
{
    private static API_ID: number = 1827466;
    private static API_HASH: string = "fd0ff6bb6cffff0a4e5ff308c9c4154c";

    private client: MTProto;
    // public onUpdateCallBack?: (update: TdObject) => any;

    public constructor()
    {
        this.client = new MTProto({
            api_id: TdManager.API_ID,
            api_hash: TdManager.API_HASH
        });
    }

    private SendCode(phone: string): Promise<any>
    {
        return this.Call("auth.sendCode", {
            phone_number: phone,
            settings: {
                _: "codeSettings",
            },
        });
    }

    private SignIn(phone: string, phoneCodeHash: string, code: string): Promise<any>
    {
        return this.Call("auth.signIn", {
            phone_number: phone,
            phone_code_hash: phoneCodeHash,
            phone_code: code,
        });
    }

    private GetPassword(): Promise<any>
    {
        return this.Call("account.getPassword");
    }

    private CheckPassword(srp_id: string, A: string, M1: string)
    {
        return this.Call("auth.checkPassword", {
            password: {
                _: "inputCheckPasswordSRP",
                srp_id,
                A,
                M1,
            },
        });
    }

    public SetDefaultDc(dcId: number): Promise<string>
    {
        return this.client.setDefaultDc(dcId);
    }

    public Call(method: string, params: object = {}, options: object = {}): Promise<any>
    {
        console.log(`Send "${method}" : `, params);

        return new Promise<any>(async (resolve, reject) =>
        {
            try
            {
                return resolve(await this.client.call(method, params));
            }
            catch (error)
            {
                console.log(`"${method}" error: `, error);

                const { error_code, error_message } = error;
                if (error_code === 303)
                {
                    const [type, dcId] = error_message.split('_MIGRATE_');

                    // If auth.sendCode call on incorrect DC need change default DC, because call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
                    if (type === 'PHONE')
                    {
                        await this.client.setDefaultDc(+dcId);
                    }
                    else
                    {
                        options = {
                            ...options,
                            dcId: +dcId,
                        };
                    }

                    return resolve(await this.client.call(method, params, options));
                }

                return reject(error);
            }
        });
    }

    public Login(phone: string, code: string, password: string): Promise<any>
    {
        return new Promise<any>(async (resolve, reject) => {
            const sendCodeResult = await this.SendCode(phone);
            console.log("sendCodeResult => ", sendCodeResult);

            try
            {
                const signInResult = await this.SignIn(phone, sendCodeResult.phone_code_hash, code);
                console.log("signInResult => ", signInResult);
            }
            catch (error)
            {
                if (error.error_message === "SESSION_PASSWORD_NEEDED")
                {

                }
                return reject(error);
            }

            return resolve();
        });
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

        const client = new TdManager();
        // client.onUpdateCallBack = this.OnRecv;

        try
        {
            const result = await client.Login("+201064912314", "123", "");
            console.log("Result : ", result);
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

    private OnRecv(update: any): void
    {
        console.log('UPDATE : ', update);
    }
}
import { MTProto } from "@mtproto/core";

export class TdManager
{
    private client: MTProto;

    public _API_ID: number;
    public get API_ID(): number
    {
        return this._API_ID;
    }
    public set API_ID(value: number)
    {
        this._API_ID = value;
        this.Init();
    }

    public _API_HASH: string;
    public get API_HASH(): string
    {
        return this._API_HASH;
    }
    public set API_HASH(value: string)
    {
        this._API_HASH = value;
        this.Init();
    }

    public Phone: string;
    public PhoneCodeHash: string;
    // public onUpdateCallBack?: (update: TdObject) => any;
    public constructor(apiID: number, apiHash: string, phone: string)
    {
        this._API_ID = apiID;
        this._API_HASH = apiHash;
        this.Phone = phone;
        this.PhoneCodeHash = "";
        this.client = new MTProto({
            api_id: this.API_ID,
            api_hash: this.API_HASH
        });
    }

    private Init(): void
    {
        this.client = new MTProto({
            api_id: this.API_ID,
            api_hash: this.API_HASH
        });
    }

    public SendCode(): Promise<any>
    {
        return this.Call("auth.sendCode", {
            phone_number: this.Phone,
            settings: {
                _: "codeSettings",
            },
        });
    }

    public SignIn(conformCode: string): Promise<any>
    {
        return this.Call("auth.signIn", {
            phone_number: this.Phone,
            phone_code_hash: this.PhoneCodeHash,
            phone_code: conformCode,
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

    public Login(code: string, password: string = ""): Promise<any>
    {
        return new Promise<any>(async (resolve, reject) =>
        {
            try
            {
                const signInResult = await this.SignIn(code);
                return resolve(signInResult);
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

    public Logout(): Promise<any>
    {
        return this.Call("auth.logOut", {
            phone_number: this.Phone,
            phone_code_hash: this.PhoneCodeHash,
        });
    }
}

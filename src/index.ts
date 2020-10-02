/**
 * @name Socialcord
 * @version 0.1.0
 * @description nothing
 * 
 * @website http://twitter.com/BandagedBD
 */

import { BdApi } from "@bandagedbd/bdapi";
import { MTProto, getSRPParams } from "@mtproto/core";
import { TelegramUser } from "./TelegramUser"

interface SettingPanel
{
    title: string;
    options: { [key: string]: { value: any, inner: boolean, [key: string]: any } };
}

class TdManager
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
                console.log("signInResult => ", signInResult);
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

export default (() =>
{
    const window = global.window as any;
    const config = {
        "info": {
            "name": "Socialcord",
            "author": "CorrM",
            "version": "0.1.0",
            "description": "GG"
        }
    };

    const buildPlugin = window.BDFDB_Global.PluginUtils.buildPlugin(config);
    const BDFDBPlugin = buildPlugin[0];
    const BDFDB = buildPlugin[1];

    return class Socialcord extends BDFDBPlugin
    {
        private window = global.window as any;
        private BDFDB = BDFDB;
        private tdClient: TdManager;

        private config = {
            "info": {
                "name": "Socialcord",
                "author": "CorrM",
                "version": "0.1.0",
                "description": "GG"
            }
        };

        private settings: SettingPanel[] = [
            {
                title: "Settings",
                options: {
                    addDetails        : { value: true, inner: false, description: "Add image details (name, size, amount) in the image modal" },
                    showAsHeader      : { value: true, inner: false, description: "Show image details as a details header above the image in the chat" },
                    showOnHover       : { value: false, inner: false, description: "Show image details as Tooltip in the chat" },
                    enableGallery     : { value: true, inner: false, description: "Displays previous/next Images in the same message in the image modal" },
                    enableZoom        : { value: true, inner: false, description: "Creates a zoom lense if you press down on an image in the image modal" },
                    enableCopyImg     : { value: true, inner: false, description: "Add a copy image option in the image modal" },
                    enableSaveImg     : { value: true, inner: false, description: "Add a save image as option in the image modal" },
                    useChromium       : { value: false, inner: false, description: "Use an inbuilt browser window instead of opening your default browser" },
                    addUserAvatarEntry: { value: true, inner: false, description: "User Avatars" },
                    addGuildIconEntry : { value: true, inner: false, description: "Server Icons" },
                    addEmojiEntry     : { value: true, inner: false, description: "Custom Emojis/Emotes" }
                },
            },
            {
                title: "Telegram",
                options: {
                    apiID        : { value: "", inner: false, description: "API ID", basis: "36%", type: "number" },
                    apiHash      : { value: "", inner: false, description: "API Hash", basis: "60%", type: "text" },
                    phoneNumber  : { value: "", inner: false, description: "Phone Number", basis: "36%", type: "text" },
                    confirmCode  : { value: "", inner: false, description: "Confirm Code", basis: "36%", type: "text" },
                    twoFaCode    : { value: "", inner: false, description: "2FA Code", basis: "36%", type: "number" },
                    phoneCodeHash: { value: "", inner: true }
                }
            }
        ];

        constructor()
        {
            super();
            this.tdClient = new TdManager(0, "", "");
        }

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

        public onLoad(): void
        {
            this.window.socialcord = this;
            if (this.window.BDFDB_Global && this.window.BDFDB_Global.loaded)
            {
                this.ReLoadSettings();
                return;
            }

            if (!this.window.BDFDB_Global || !Array.isArray(this.window.BDFDB_Global.pluginQueue))
                this.window.BDFDB_Global = Object.assign({}, this.window.BDFDB_Global, { pluginQueue: [] });

            if (!this.window.BDFDB_Global.downloadModal)
            {
                this.window.BDFDB_Global.downloadModal = true;
                (BdApi as any).showConfirmationModal("Library Missing", `The library plugin needed for ${this.getName()} is missing. Please click "Download Now" to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onCancel: () => { delete this.window.BDFDB_Global.downloadModal; },
                    onConfirm: () =>
                    {
                        delete this.window.BDFDB_Global.downloadModal;
                        require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e: any, r: any, b: any) =>
                        {
                            if (!e && b && b.indexOf(`//META{"name":"`) > -1)
                                require("fs").writeFile(require("path").join((BdApi as any).Plugins.folder, "0BDFDB.plugin.js"), b, () => { });
                            else
                                BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
                        });
                    }
                });
            }

            if (!this.window.BDFDB_Global.pluginQueue.includes(this.getName()))
                this.window.BDFDB_Global.pluginQueue.push(this.getName());
        }

        public async onStart(): Promise<void>
        {
            this.InitSettings();

            BdApi.alert("CORRM", BdApi.React.version);
            // client.onUpdateCallBack = this.OnRecv;

            try
            {
                // const result = await client.Login("+201064912314", "123", "");
                // console.log("Result : ", result);
            } catch (error)
            {
                console.error("error : ", error);
            }
        }

        public onStop(): void
        {

        }

        private InitSettings(): void
        {
            this.tdClient.API_ID        = this.settings[1].options.apiID.value;
            this.tdClient.API_HASH      = this.settings[1].options.apiHash.value;
            this.tdClient.Phone         = this.settings[1].options.phoneNumber.value;
            this.tdClient.PhoneCodeHash = this.settings[1].options.phoneCodeHash.value;
        }

        private ReLoadSettings(): void
        {
            {
                const settings = BDFDB.DataUtils.load(this, "settings");
                Object.keys(settings).map((key: string) => this.settings[0].options[key].value = settings[key]);
            }
            {
                const telegram = BDFDB.DataUtils.load(this, "telegram");
                Object.keys(telegram).map((key: string) => this.settings[1].options[key].value = telegram[key]);
            }

            // Update telegram client info
            this.InitSettings();
        }
        
        private SaveSettings(): void
        {
            const telegram: any = {};
            Object.keys(this.settings[1].options).forEach((key: string) => telegram[key] = this.settings[1].options[key].value);
            BDFDB.DataUtils.save(telegram, this, "telegram");

            this.ReLoadSettings();
        }

        public getSettingsPanel(collapseStates = {}): string | HTMLElement
        {
            let settingsPanel, settingsItems = [];

            settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
                title: this.settings[0].title,
                collapseStates: collapseStates,
                children: Object.keys(this.settings[0].options).map(key => !this.settings[0].options[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
                    className: BDFDB.disCN.marginbottom8,
                    type: "Switch",
                    plugin: this,
                    keys: ["settings", key],
                    label: this.settings[0].options[key].description,
                    value: this.settings[0].options[key].value
                })).filter(n => n)
            }));
            settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
                title: "Telegram",
                collapseStates: collapseStates,
                children: Object.keys(this.settings[1].options).map(key => !this.settings[1].options[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
                    className: BDFDB.disCN.marginbottom8,
                    type: "TextInput",
                    plugin: this,
                    keys: ["telegram", key],
                    label: this.settings[1].options[key].description,
                    basis: this.settings[1].options[key].basis,
                    childProps: { type: this.settings[1].options[key].type },
                    value: this.settings[1].options[key].value
                })).filter(n => n).concat(BDFDB.ReactUtils.createElement("div", {
                    style: { float: "right" },
                    children: [
                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
                            style: { float: "left", marginRight: "6px" },
                            onClick: async () =>
                            {
                                this.ReLoadSettings();
                                this.settings[1].options.phoneCodeHash.value = (await this.tdClient.SendCode()).phone_code_hash;
                                this.SaveSettings();
                            },
                            children: "Send Code",
                        }),
                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
                            style: { float: "left", marginRight: "6px" },
                            onClick: async () =>
                            {
                                this.ReLoadSettings();
                            },
                            children: "GGGGGGGGGGG"
                        }),
                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
                            style: { float: "left", marginRight: "6px" },
                            onClick: async () =>
                            {
                                this.ReLoadSettings();
                                const user: TelegramUser = await this.tdClient.Login(this.settings[1].options.confirmCode.value);
                                console.log(user);
                                this.SaveSettings();
                            },
                            children: "Active"
                        }),
                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
                            style: { float: "left" },
                            onClick: async () =>
                            {
                                this.ReLoadSettings();
                                console.log(JSON.stringify(await this.tdClient.Logout()));
                            },
                            children: "Logout"
                        })
                    ]
                }))
            }));

            return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
        }

        private onSettingsClosed(): void
        {
            if ((this as any).SettingsUpdated)
            {
                delete (this as any).SettingsUpdated;
                this.ForceUpdateAll();
            }
        }

        private ForceUpdateAll(): void
        {
            this.ReLoadSettings();

            BDFDB.PatchUtils.forceAllUpdates(this);
            BDFDB.MessageUtils.rerenderAll();
        }
    };
})();
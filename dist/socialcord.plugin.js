/**
 * @name Socialcord
 * @version 0.1.0
 * @description nothing
 *
 * @website http://twitter.com/BandagedBD
 */
const bdapi_1 = { BdApi };
const core_1 = require("@mtproto/core");
class TdManager {
    // public onUpdateCallBack?: (update: TdObject) => any;
    constructor(apiID, apiHash, phone) {
        this._API_ID = apiID;
        this._API_HASH = apiHash;
        this.Phone = phone;
        this.PhoneCodeHash = "";
        this.client = new core_1.MTProto({
            api_id: this.API_ID,
            api_hash: this.API_HASH
        });
    }
    get API_ID() {
        return this._API_ID;
    }
    set API_ID(value) {
        this._API_ID = value;
        this.Init();
    }
    get API_HASH() {
        return this._API_HASH;
    }
    set API_HASH(value) {
        this._API_HASH = value;
        this.Init();
    }
    Init() {
        this.client = new core_1.MTProto({
            api_id: this.API_ID,
            api_hash: this.API_HASH
        });
    }
    SendCode() {
        return this.Call("auth.sendCode", {
            phone_number: this.Phone,
            settings: {
                _: "codeSettings",
            },
        });
    }
    SignIn(conformCode) {
        return this.Call("auth.signIn", {
            phone_number: this.Phone,
            phone_code_hash: this.PhoneCodeHash,
            phone_code: conformCode,
        });
    }
    GetPassword() {
        return this.Call("account.getPassword");
    }
    CheckPassword(srp_id, A, M1) {
        return this.Call("auth.checkPassword", {
            password: {
                _: "inputCheckPasswordSRP",
                srp_id,
                A,
                M1,
            },
        });
    }
    SetDefaultDc(dcId) {
        return this.client.setDefaultDc(dcId);
    }
    Call(method, params = {}, options = {}) {
        console.log(`Send "${method}" : `, params);
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await this.client.call(method, params));
            }
            catch (error) {
                console.log(`"${method}" error: `, error);
                const { error_code, error_message } = error;
                if (error_code === 303) {
                    const [type, dcId] = error_message.split('_MIGRATE_');
                    // If auth.sendCode call on incorrect DC need change default DC, because call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
                    if (type === 'PHONE') {
                        await this.client.setDefaultDc(+dcId);
                    }
                    else {
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
    Login(code, password = "") {
        return new Promise(async (resolve, reject) => {
            try {
                const signInResult = await this.SignIn(code);
                console.log("signInResult => ", signInResult);
            }
            catch (error) {
                if (error.error_message === "SESSION_PASSWORD_NEEDED") {
                }
                return reject(error);
            }
            return resolve();
        });
    }
}
module.exports = (() => {
    const window = global.window;
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
    return class Socialcord extends BDFDBPlugin {
        constructor() {
            super(...arguments);
            this.window = global.window;
            this.BDFDB = BDFDB;
            this.config = {
                "info": {
                    "name": "Socialcord",
                    "author": "CorrM",
                    "version": "0.1.0",
                    "description": "GG"
                }
            };
            this.settings = [
                {
                    title: "Settings",
                    options: {
                        addDetails: { value: true, description: "Add image details (name, size, amount) in the image modal" },
                        showAsHeader: { value: true, description: "Show image details as a details header above the image in the chat" },
                        showOnHover: { value: false, description: "Show image details as Tooltip in the chat" },
                        enableGallery: { value: true, description: "Displays previous/next Images in the same message in the image modal" },
                        enableZoom: { value: true, description: "Creates a zoom lense if you press down on an image in the image modal" },
                        enableCopyImg: { value: true, description: "Add a copy image option in the image modal" },
                        enableSaveImg: { value: true, description: "Add a save image as option in the image modal" },
                        useChromium: { value: false, description: "Use an inbuilt browser window instead of opening your default browser" },
                        addUserAvatarEntry: { value: true, description: "User Avatars" },
                        addGuildIconEntry: { value: true, description: "Server Icons" },
                        addEmojiEntry: { value: true, description: "Custom Emojis/Emotes" }
                    },
                },
                {
                    title: "Telegram",
                    options: {
                        apiID: { value: "", description: "API_ID", basis: "36%", type: "number" },
                        apiHash: { value: "", description: "API_HASH", basis: "60%", type: "text" },
                        phoneNumber: { value: "", description: "Phone Number", basis: "36%", type: "text" },
                        confirmCode: { value: "", description: "Confirm Code", basis: "36%", type: "text" },
                        twoFaCode: { value: "", description: "2FA Code", basis: "36%", type: "number" }
                    }
                }
            ];
            this.tdClient = new TdManager(0, "", "");
        }
        getName() {
            return "Socialcord";
        }
        getDescription() {
            return "Describe the basic functions. Maybe a support server link";
        }
        getVersion() {
            return "0.1.0";
        }
        getAuthor() {
            return "CorrM";
        }
        onLoad() {
            this.window.socialcord = this;
            if (this.window.BDFDB_Global && this.window.BDFDB_Global.loaded) {
                this.ReLoadSettings();
                return;
            }
            if (!this.window.BDFDB_Global || !Array.isArray(this.window.BDFDB_Global.pluginQueue))
                this.window.BDFDB_Global = Object.assign({}, this.window.BDFDB_Global, { pluginQueue: [] });
            if (!this.window.BDFDB_Global.downloadModal) {
                this.window.BDFDB_Global.downloadModal = true;
                bdapi_1.BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${this.getName()} is missing. Please click "Download Now" to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onCancel: () => { delete this.window.BDFDB_Global.downloadModal; },
                    onConfirm: () => {
                        delete this.window.BDFDB_Global.downloadModal;
                        require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
                            if (!e && b && b.indexOf(`//META{"name":"`) > -1)
                                require("fs").writeFile(require("path").join(bdapi_1.BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, () => { });
                            else
                                bdapi_1.BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
                        });
                    }
                });
            }
            if (!this.window.BDFDB_Global.pluginQueue.includes(this.getName()))
                this.window.BDFDB_Global.pluginQueue.push(this.getName());
        }
        async onStart() {
            this.tdClient.API_ID = this.settings[1].options.apiID.value;
            this.tdClient.API_HASH = this.settings[1].options.apiHash.value;
            this.tdClient.Phone = this.settings[1].options.phoneNumber.value;
            bdapi_1.BdApi.alert("CORRM", bdapi_1.BdApi.React.version);
            // client.onUpdateCallBack = this.OnRecv;
            try {
                // const result = await client.Login("+201064912314", "123", "");
                // console.log("Result : ", result);
            }
            catch (error) {
                console.error("error : ", error);
            }
        }
        onStop() {
        }
        ReLoadSettings() {
            {
                const settings = BDFDB.DataUtils.load(this, "settings");
                Object.keys(settings).map((key) => this.settings[0].options[key].value = settings[key]);
            }
            {
                const telegram = BDFDB.DataUtils.load(this, "telegram");
                Object.keys(telegram).map((key) => this.settings[1].options[key].value = telegram[key]);
            }
            // Update telegram client info
            this.tdClient.API_ID = this.settings[1].options.apiID.value;
            this.tdClient.API_HASH = this.settings[1].options.apiHash.value;
        }
        getSettingsPanel(collapseStates = {}) {
            console.log(this.settings);
            let settingsPanel, settingsItems = [];
            settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
                title: this.settings[0].title,
                collapseStates: collapseStates,
                children: Object.keys(this.settings[0].options).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
                children: Object.keys(this.settings[1].options).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
                            children: "Send Code",
                            onClick: async () => {
                                this.ReLoadSettings();
                                this.tdClient.PhoneCodeHash = (await this.tdClient.SendCode()).phone_code_hash;
                            }
                        }),
                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
                            style: { float: "left" },
                            onClick: async () => {
                                this.ReLoadSettings();
                                console.log(JSON.stringify(await this.tdClient.Login(this.settings[1].options.confirmCode.value)));
                            },
                            children: "Active"
                        })
                    ]
                }))
            }));
            return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
        }
        onSettingsClosed() {
            if (this.SettingsUpdated) {
                delete this.SettingsUpdated;
                this.forceUpdateAll();
            }
        }
        forceUpdateAll() {
            this.ReLoadSettings();
            BDFDB.PatchUtils.forceAllUpdates(this);
            BDFDB.MessageUtils.rerenderAll();
        }
    };
})();


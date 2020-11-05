import { BdApiModule, MonkeyPatchOptions } from "@bandagedbd/bdapi";
import { SettingPanel } from "./utils/SettingPanel";
import { TdManager } from "./telegram/TdManager";
import { Dialogs, UserLogin, User } from "./telegram/TelegramInterface"

declare var BdApi: typeof BdApiModule;

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
                    addDetails: { value: true, inner: false, description: "Add image details (name, size, amount) in the image modal" },
                    showAsHeader: { value: true, inner: false, description: "Show image details as a details header above the image in the chat" },
                    showOnHover: { value: false, inner: false, description: "Show image details as Tooltip in the chat" },
                    enableGallery: { value: true, inner: false, description: "Displays previous/next Images in the same message in the image modal" },
                    enableZoom: { value: true, inner: false, description: "Creates a zoom lense if you press down on an image in the image modal" },
                    enableCopyImg: { value: true, inner: false, description: "Add a copy image option in the image modal" },
                    enableSaveImg: { value: true, inner: false, description: "Add a save image as option in the image modal" },
                    useChromium: { value: false, inner: false, description: "Use an inbuilt browser window instead of opening your default browser" },
                    addUserAvatarEntry: { value: true, inner: false, description: "User Avatars" },
                    addGuildIconEntry: { value: true, inner: false, description: "Server Icons" },
                    addEmojiEntry: { value: true, inner: false, description: "Custom Emojis/Emotes" }
                },
            },
            {
                title: "Telegram",
                options: {
                    apiID: { value: "", inner: false, description: "API ID", basis: "36%", type: "number" },
                    apiHash: { value: "", inner: false, description: "API Hash", basis: "60%", type: "text" },
                    phoneNumber: { value: "", inner: false, description: "Phone Number", basis: "36%", type: "text" },
                    confirmCode: { value: "", inner: false, description: "Confirm Code", basis: "36%", type: "text" },
                    twoFaCode: { value: "", inner: false, description: "2FA Code", basis: "36%", type: "number" },
                    phoneCodeHash: { value: "", inner: true }
                }
            }
        ];

        private patchedModules: MonkeyPatchOptions = {
            before: {
                PeopleListSectionedLazy: "default",
            },
            after: {
                TabBar: "render",
                PeopleListSectionedLazy: "default",
                FriendRow: "render",
                PendingRow: "default",
                BlockedRow: "render",
                PeopleListItem: ["render", "componentDidMount", "componentWillUnmount"]
            }
        };

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
            this.tdClient.API_ID = this.settings[1].options.apiID.value;
            this.tdClient.API_HASH = this.settings[1].options.apiHash.value;
            this.tdClient.Phone = this.settings[1].options.phoneNumber.value;
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
                                try
                                {
                                    const dialogs: Dialogs = await this.tdClient.Call("messages.getDialogs", {
                                        offset_date: 0,
                                        offset_id: 0,
                                        offset_peer: {
                                            _: "inputPeerEmpty"
                                        },
                                        limit: 50,
                                        hash: ""
                                    });
                                    dialogs.users.forEach((user: User) => console.log(user.first_name));
                                }
                                catch (error)
                                {
                                    console.error(error);
                                }
                            },
                            children: "GGGGGGGGGGG"
                        }),
                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
                            style: { float: "left", marginRight: "6px" },
                            onClick: async () =>
                            {
                                this.ReLoadSettings();
                                const user: UserLogin = await this.tdClient.Login(this.settings[1].options.confirmCode.value);
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

        public processTabBar(e: any)
        {
            console.log("tabBar", e);
        }
        public processPeopleListSectionedLazy(e: any)
        {
            console.log("processPeopleListSectionedLazy", e);
        }
        public processPeopleListItem(e: any)
        {
            console.log("processPeopleListItem", e);
        }
        public processBlockedRow(e: any)
        {
            console.log("processBlockedRow", e);
        }
        public processPendingRow(e: any)
        {
            console.log("processPendingRow", e);
        }
        public processFriendRow(e: any)
        {
            console.log("processFriendRow", e);
        }

    };
})();
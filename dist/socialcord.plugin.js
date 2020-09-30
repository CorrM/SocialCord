/**
 * @name Socialcord
 * @version 0.1.0
 * @description nothing
 *
 * @website http://twitter.com/BandagedBD
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socialcord = void 0;
const bdapi_1 = { BdApi };
const tdweb_1 = require("./public/tdweb");
class TdManager {
    constructor() {
        const opts = {
            logVerbosityLevel: 0,
            jsLogVerbosityLevel: "error",
            mode: "wasm",
            instanceName: "tdlib",
            readOnly: false,
            isBackground: false,
            useDatabase: false,
            //wasmUrl: `${this.WASM_FILE_NAME}?_sw-precache=${this.WASM_FILE_HASH}`,
            onUpdate: (update) => {
                if (this.onUpdateCallBack)
                    return this.onUpdateCallBack(update);
            }
        };
        this.client = new tdweb_1.default(opts);
    }
    async Send(query) {
        console.log("Send : ", query);
        return this.client.send(query);
    }
}
TdManager.WASM_FILE_NAME = 'a848b8b40a9281225b96b8d300a07767.wasm';
TdManager.WASM_FILE_HASH = TdManager.WASM_FILE_NAME.replace('.wasm', '');
class Socialcord {
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
    async start() {
        bdapi_1.BdApi.alert("CORRM", bdapi_1.BdApi.React.version);
        const tObj = {
            "@type": "getAuthorizationState"
        };
        const client = new TdManager();
        client.onUpdateCallBack = this.OnRecv;
        try {
            //const result = client.Send(tObj);
            //console.log("Result : ", result);
        }
        catch (error) {
            console.error("error : ", error);
        }
    }
    stop() {
    }
    getSettingsPanel() {
    }
    OnRecv(update) {
        console.log('UPDATE : ', update);
    }
}
exports.Socialcord = Socialcord;



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
const core_1 = require("@mtproto/core");
class TdManager {
    // public onUpdateCallBack?: (update: TdObject) => any;
    constructor() {
        this.client = new core_1.MTProto({
            api_id: TdManager.API_ID,
            api_hash: TdManager.API_HASH
        });
    }
    SendCode(phone) {
        return this.Call("auth.sendCode", {
            phone_number: phone,
            settings: {
                _: "codeSettings",
            },
        });
    }
    SignIn(phone, phoneCodeHash, code) {
        return this.Call("auth.signIn", {
            phone_number: phone,
            phone_code_hash: phoneCodeHash,
            phone_code: code,
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
    Login(phone, code, password) {
        return new Promise(async (resolve, reject) => {
            const sendCodeResult = await this.SendCode(phone);
            console.log("sendCodeResult => ", sendCodeResult);
            try {
                const signInResult = await this.SignIn(phone, sendCodeResult.phone_code_hash, code);
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
TdManager.API_ID = 1827466;
TdManager.API_HASH = "fd0ff6bb6cffff0a4e5ff308c9c4154c";
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
        const client = new TdManager();
        // client.onUpdateCallBack = this.OnRecv;
        try {
            const result = await client.Login("+201064912314", "123", "");
            console.log("Result : ", result);
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


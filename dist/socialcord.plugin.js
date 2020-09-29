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
    start() {
        bdapi_1.BdApi.alert("CORRM", "Just check");
    }
    stop() {
    }
    getSettingsPanel() {
    }
}
exports.Socialcord = Socialcord;


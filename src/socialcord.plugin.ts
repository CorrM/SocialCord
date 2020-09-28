/**
 * @name Socialcord
 * @version 0.1.0
 * @description nothing
 * 
 * @website http://twitter.com/BandagedBD
 */

import { BdApi } from "@bandagedbd/bdapi";

export class Socialcord {

    public getName(): string {
        return "Socialcord";
    }

    public getDescription(): string {
        return "Describe the basic functions. Maybe a support server link";
    }

    public getVersion(): string {
        return "0.1.0";
    }

    public getAuthor(): string {
        return "CorrM";
    }

    public start(): void {
        BdApi.alert("CORRM", "Just check");
        BdApi.showToast("fdsfsdf");
    }

    public stop(): void {
        
    }

    public getSettingsPanel(): void {

    }
}
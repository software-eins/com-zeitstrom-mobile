import BaseService from './_base';

// import store from '../store/state'

// import defaultSettingsService from '../services/settings-defaults';


interface Institution {
    id: string;
    created_at: string;
    modified_at: string;
    name: string;
    flags: Array<string>;
    config: any;

    contact_person: string;
    address: string;
    number: string;
    address_2: string;
    zip_code: string;
    city: string;
    country: string;
    brand: string;
}


class InstitutionService extends BaseService<Institution> {

    cachedDefaultSettings: any = undefined;
    cachedInstitutionSettings: any = {};
    isInitialised = false;

    constructor() {
        super("/api/v2/accounts/institutions/");
        this.cacheTimeout = 60 * 15;
    }

    retrieveInstitutionId() {
        return this.list().then(response => response.data.results[0].id)
    }

    // initialise(): Promise<void> {
    //     return Promise.all([
    //         defaultSettingsService.list(),
    //         this.retrieveSettings(store.AppActiveUser.institutionId)
    //     ]).then(function (this: any, settings: any) {
    //         let defaultSettings: any = {};
    //         for (let category of settings[0]) {
    //             defaultSettings[category.id] = {};
    //             for (let setting of category.settings) {
    //                 defaultSettings[category.id][setting.id] = setting.id;
    //             }
    //         }
    //         this.cachedDefaultSettings = defaultSettings;

    //         this.cachedInstitutionSettings[store.AppActiveUser.institutionId] = settings[1];
    //         this.isInitialised = true;
    //     }.bind(this))
    // }

    // retrieveSettings(resourceId?: string) {
    //     if (resourceId == undefined) {
    //         resourceId = store.AppActiveUser.institutionId;
    //     }

    //     return this._get(resourceId + "/settings/").then(function (this: any, response: any) {
    //         this.cachedInstitutionSettings[resourceId as string] = response;
    //         return response
    //     }.bind(this));
    // }

    // updateSettings(resourceId?: string, newSettings?: any) {
    //     if (resourceId == undefined) {
    //         resourceId = store.AppActiveUser.institutionId;
    //     }
    //     return this._post(resourceId + "/settings/", newSettings).then(function (this: any, response: any) {
    //         this.cachedInstitutionSettings[resourceId as string] = response;
    //         return response;
    //     }.bind(this));
    // }

    async retrieveSettingValue(categoryId: string, settingId: string): Promise<any> {
        const institutionId = await this.retrieveInstitutionId();
        const settings = await this._get(institutionId + "/settings/");

        return settings.data[categoryId][settingId];

        // if (institutionId == undefined) {
        //     institutionId = store.AppActiveUser.institutionId;
        // }

        // let institutionSettings = this.cachedInstitutionSettings[institutionId!];
        // let defaultSettings = this.cachedDefaultSettings;

        // if (institutionSettings == undefined || defaultSettings == undefined) {
        //     return;
        // }

        // if (categoryId in institutionSettings && settingId in institutionSettings[categoryId]) return institutionSettings[categoryId][settingId];
        // return defaultSettings[categoryId][settingId];
    }
}

const institutionService = new InstitutionService();

export { institutionService, InstitutionService, Institution }

export default institutionService;

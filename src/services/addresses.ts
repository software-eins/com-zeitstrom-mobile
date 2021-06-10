import { BaseService } from './_base';


interface Address {
    address: string;
}


class AdressService extends BaseService<Address> {

    constructor() {
        super("/api/v2/geo/addresses/");
        this.cacheTimeout = 60 * 60 * 24;
    }

    async resolveAddress(latitude: number, longitude: number): Promise<string|undefined> {
        const response = await this._get('?lat=' + String(latitude) + '&lng=' + String(longitude));
        return response.data.address;
    }
}

const addressService = new AdressService();

export { addressService, AdressService };

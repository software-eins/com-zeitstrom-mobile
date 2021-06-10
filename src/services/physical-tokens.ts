import { AxiosResponse } from 'axios';
import { BaseService, PaginatedResponse } from './_base';


interface PhysicalToken {
    id: string;
}

interface PhysicalTokenListParams {
    page?: number;
    pagesize?: number;

    query?: string;
    ids?: Array<string>;

    fields?: Array<string>;
}


class PhysicalTokenService extends BaseService<PhysicalToken> {
    constructor() {
        super("/api/v2/devices/physical-tokens/");
        this.cacheTimeout = 60 * 60 * 24 * 14;
    }

    list(this: PhysicalTokenService, page=1, pagesize=1000, query=''): Promise<AxiosResponse<PaginatedResponse<PhysicalToken>>> {
        const params =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(query));

        return this._get(params) as unknown as Promise<AxiosResponse<PaginatedResponse<PhysicalToken>>>;
    }

    listParams(this: PhysicalTokenService, params: PhysicalTokenListParams): Promise<AxiosResponse<PaginatedResponse<PhysicalToken>>> {
        params = params || {};

        params.pagesize = params.pagesize || 1000;
        params.page = params.page || 1;
        params.query = params.query || '';
        params.fields = params.fields || ['id'];
        params.ids = params.ids || [];

        const query =
            '?limit=' + String(params.pagesize) +
            '&offset=' + String((params.page - 1) * params.pagesize) +
            '&q=' + encodeURIComponent(String(params.query)) +
            '&fields=' + params.fields.join("|") +
            '&ids=' + params.ids.join("|");

        return this._get(query) as unknown as Promise<AxiosResponse<PaginatedResponse<PhysicalToken>>>;
    }

    listCreate(this: PhysicalTokenService, ids: Array<string>) {
        return this._post('', {ids, });
    }

    listDelete(this: PhysicalTokenService, ids: Array<string>) {
        return this._post('delete/', {ids, });
    }

    listAvailable(page=1, pagesize=50, query='', additionalCardNumber=''): Promise<PaginatedResponse<PhysicalToken>> {
        const params =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&type=available' +
            '&q=' + encodeURIComponent(String(query)) +
            '&additional=' + String(additionalCardNumber);

        return this._get(params) as unknown as Promise<PaginatedResponse<PhysicalToken>>;
    }
}

const physicalTokenService = new PhysicalTokenService();

export { physicalTokenService, PhysicalTokenService, PhysicalToken }

export default physicalTokenService;

import { AxiosResponse } from 'axios';
import { BaseService, PaginatedResponse } from './_base';

interface LicenseListParams {
    ids?: Array<string>;
    latestValidUntil?: string;
    earliestValidUntil?: string;
    page?: number;
    pagesize?: number;
    query?: string;
}

interface License {
    id: string;
    valid_until: string;
    code: string;
    duration?: number;
    employees: number;
}

interface LicenseSummary {
    licenses: number;
    employees: number;
}

class LicenseService extends BaseService<License> {
    constructor() {
        super("/api/v2/accounts/licenses/");
        this.cacheTimeout = 60 * 15;
    }

    listParams(params: LicenseListParams): Promise<AxiosResponse<PaginatedResponse<License>>> {
        params = params || {};

        const pagesize = params.pagesize || 50;
        const page = (params.page || 1);

        let url =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(params.query || ''));

        if (params.ids && params.ids.length > 0) url += '&ids=' + params.ids.join("|");
        if (params.latestValidUntil) url += "&valid_until__lte=" + params.latestValidUntil;
        if (params.earliestValidUntil) url += "&valid_until__gte=" + params.earliestValidUntil;

        return this._get(url) as unknown as Promise<AxiosResponse<PaginatedResponse<License>>>;
    }

    summary(): Promise<AxiosResponse<LicenseSummary>> {
        const url = "summary/";
        return this._get(url) as unknown as Promise<AxiosResponse<LicenseSummary>>;
    }
}

const licenseService = new LicenseService();

export { licenseService, LicenseService, License, LicenseSummary };

export default licenseService;

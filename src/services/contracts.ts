import { AxiosResponse } from 'axios';
import { BaseService, ChoiceField, PaginatedResponse } from './_base';


interface Contract {
    id: string;
    created_at: string;
    signed_at?: string;
    revoked_at?: string;

    state: string;
    type: string;
}

interface ContractListParams {
    pagesize?: number;
    page?: number;
    states: Array<string>;
    types: Array<string>;
}

interface DataProcessingAgreement {
    representative?: string;
    company?: string;
    street?: string;
    postal_code?: string;
    city?: string;
    country?: string;
}


class ContractService extends BaseService<Contract> {
    constructor() {
        super("/api/v2/contracts/contracts/");
        this.cacheTimeout = 60 * 15;
    }

    contractStates(page=1, pagesize=50, query=''): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        return this._getChoices('contract-states/', page, pagesize, query);
    }

    contractTypes(page=1, pagesize=50, query=''): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        return this._getChoices('contract-types/', page, pagesize, query);
    }

    listParams(params: ContractListParams): Promise<AxiosResponse<PaginatedResponse<Contract>>> {
        params = params || {};

        const pagesize = params.pagesize || 50;
        const page = params.page || 1;

        let url =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&order=-signed_at|-created_at';

        if (params.types && params.types.length > 0) url += '&types=' + params.types.join("|");
        if (params.states && params.states.length > 0) url += '&states=' + params.states.join("|");

        return this._get(url) as unknown as Promise<AxiosResponse<PaginatedResponse<Contract>>>;
    }

    createDataProcessingAgreement(params: DataProcessingAgreement): Promise<AxiosResponse<Contract>> {
        const url = "data-processing-agreement/";
        return this._post(url, params) as unknown as Promise<AxiosResponse<Contract>>;
    }

    sign(contractId: string): Promise<AxiosResponse<Contract>> {
        return this._post(contractId + "/sign/", null) as unknown as Promise<AxiosResponse<Contract>>;
    }

}

const contractService = new ContractService();

export { contractService, ContractService, Contract, DataProcessingAgreement }

export default contractService;

import { AxiosResponse } from 'axios';
import { BaseService, ChoiceField, PaginatedResponse } from './_base';
import axios from "@/axios";
import querystring from 'query-string';


interface RequestPasswordResetBody {
    username: string;
}

interface SetPasswordBody {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
}


interface Account {
    id: string;
    created_at: string;
    modified_at: string;
    institution_id: string;
    employee_id?: string;
    full_name?: string;
    email: string;
    role: string;
    permissions: Array<string>;
}

interface OAuthResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token: string;
}


class AccountService extends BaseService<Account> {
    constructor() {
        super("/api/v2/accounts/users/");
        this.cacheTimeout = 60 * 15;
    }

    validateToken(): Promise<boolean> {
        // Check if the token is still valid by sending a request to the
        // accounts endpoint and verify that a user account is returned.
        return this
            .list()
            .then((response: AxiosResponse<PaginatedResponse<Account>>) => {
                if (response.data.results.length > 0) {
                    return Promise.resolve(true);
                }
                return Promise.resolve(false);
            })
            .catch(() => {
                return Promise.resolve(false);
            });
    }

    retrieveActiveUser(): Promise<Account | undefined> {
        return this
            .list()
            .then((response: AxiosResponse<PaginatedResponse<Account>>) => {
                if (response.data.results.length > 0) {
                    return Promise.resolve(response.data.results[0]);
                }
                return Promise.resolve(undefined);
            })
    }

    listRoles(page=1, pagesize=50, query='', ids: Array<string>=[]): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        return this._getChoices('roles/', page, pagesize, query, ids);
    }

    requestPasswordChange(resourceId: string): Promise<undefined> {
        return this._post(resourceId + '/change-password/', {}) as unknown as Promise<undefined>;
    }

    requestPasswordReset(body: RequestPasswordResetBody): Promise<undefined> {
        return this._post('reset-password/', body) as unknown as Promise<undefined>;
    }

    setPassword(resourceId: string, body: SetPasswordBody): Promise<undefined> {
        return this._post(resourceId + '/set-password/', body) as unknown as Promise<undefined>;
    }

    async login(username: string, password: string): Promise<AxiosResponse<OAuthResponse>> {
        const payload = {
            "grant_type": "password",
            "username": username,
            "password": password,
            "client_id": process.env.VUE_APP_OAUTH_CLIENT_ID,
            "client_secret": process.env.VUE_APP_OAUTH_CLIENT_SECRET,
        };

        const response = await axios.post<OAuthResponse>("/o/token/", querystring.stringify(payload));
        localStorage.accessToken = response.data.access_token;

        // We already load the account list once, so we have it in the cache
        // already
        await this.list();

        return response;
    }

    logout() {
        localStorage.removeItem('accessToken');
    }
}

const accountService = new AccountService();

export { AccountService, accountService, Account }

export default accountService;

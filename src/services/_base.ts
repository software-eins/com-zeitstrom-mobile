import axios from "@/axios"
import { AxiosError, AxiosResponse } from 'axios';


export class FormFieldCondition {
    name: string;
    value: any;

    constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }
}

export interface ChoiceField {
    id: string;
    label: string;
}

export interface PaginatedResponse<T = any> {
    count: number;
    next?: string;
    previous?: string;
    results: Array<T>;
}

export interface FormFieldParams<T> {
    type?: string;
    mobileType?: string;
    label?: string;
    autofocus?: boolean;
    description?: string;
    remoteSourceService?: BaseService<T>;
    remoteSourceAttribute?: string;
    listPageSize?: number;
    remoteSourceListMethod?: string;
    isReadOnly?: boolean;
    isSelectedValueInOptionList?: boolean;
    allowNull?: boolean;
    conditions?: Array<FormFieldCondition>;
    default?: string;
    renderer?: (resource: any) => Promise<string>;

    showCreate?: boolean;
    showEdit?: boolean;

    step?: number;
    minimum?: number;
    maximum?: number;
}


export class FormField<T> {
    type: string;
    mobileType: string;
    name: string;
    label: string;
    autofocus: boolean;
    description: string | null;
    listPageSize: number;

    remoteSourceService: BaseService<T> | null;
    remoteSourceListMethod: string;
    remoteSourceAttribute: string | null;
    isSelectedValueInOptionList: boolean;
    allowNull: boolean;

    conditions: Array<FormFieldCondition>;

    default?: string;
    renderer?: (resource: any) => Promise<string>;

    isReadOnly: boolean;

    showCreate: boolean;
    showEdit: boolean;

    step: number;
    minimum: number;
    maximum: number;

    constructor(
        name: string,
        label: string,
        params: FormFieldParams<T> = {},
    ) {
        this.name = name;
        this.label = label;
        this.type = params.type !== undefined ? params.type : 'text';
        this.mobileType = params.mobileType !== undefined ? params.mobileType : this.type;
        this.autofocus = params.autofocus !== undefined ? params.autofocus : false;
        this.description = params.description !== undefined ? params.description : null;
        this.remoteSourceService = params.remoteSourceService !== undefined ? params.remoteSourceService : null;
        this.remoteSourceAttribute = params.remoteSourceAttribute !== undefined ? params.remoteSourceAttribute : null;
        this.remoteSourceListMethod = params.remoteSourceListMethod !== undefined ? params.remoteSourceListMethod : "list";
        this.isSelectedValueInOptionList = params.isSelectedValueInOptionList !== undefined ? params.isSelectedValueInOptionList : false;
        this.listPageSize = params.listPageSize !== undefined ? params.listPageSize : 100;
        this.isReadOnly = params.isReadOnly !== undefined ? params.isReadOnly : false;
        this.showCreate = params.showCreate !== undefined ? params.showCreate : true;
        this.showEdit = params.showEdit !== undefined ? params.showEdit : true;
        this.allowNull = params.allowNull !== undefined ? params.allowNull : true;
        this.conditions = params.conditions || [];
        this.default = params.default;
        this.renderer = params.renderer;
        this.step = params.step || 1;
        this.minimum = params.minimum || 0;
        this.maximum = params.maximum || 20;
    }

    _matchesCondition(value: string, condition: string): boolean {
        // Or Statement  `a|b`
        if (condition.indexOf("|") > -1) {
            for (const conditionPart of condition.split("|")) {
                if (this._matchesCondition(value, conditionPart)) return true;
            }
            return false;
        }

        // Prefix Statement `FirstPart*`
        if (condition.endsWith("*")) return value.startsWith(condition.slice(0, -1));

        return value == condition;
    }

    showField(resource: any): boolean {
        for (const condition of this.conditions) {
            const value = resource[condition.name]
            if (!this._matchesCondition(value as string, condition.value)) return false;
        }

        return true;
    }

    getOptions() {
        const name: any = this.remoteSourceListMethod;
        const func = (this.remoteSourceService as any)[name];

        return func().bind(this.remoteSourceService).then((response: AxiosResponse<any>) => {
            console.log(response);
            return response;
        })
    }
}

export interface FilterAttributeParams {
    remoteSourceService?: BaseService<any>;
    nullSelectable?: boolean;
    nullLabel?: string;
    multiple?: boolean;
    visible?: Promise<boolean>;
}

export class FilterAttribute {
    type: string;
    id: string;
    label: string;
    defaultValue: any;

    visible: Promise<boolean>;

    // Type 'select'
    remoteSourceService?: BaseService<any>;
    nullSelectable: boolean;
    nullLabel: string;
    multiple: boolean;

    constructor(
        id: string,
        label: string,
        type: string,
        defaultValue: any,
        params: FilterAttributeParams = {},
    ) {
        this.type = type;
        this.id = id;
        this.label = label;
        this.defaultValue = defaultValue;

        this.multiple = params.multiple !== undefined ? params.multiple : false;
        this.nullSelectable = params.nullSelectable !== undefined ? params.nullSelectable : true;
        this.nullLabel = params.nullLabel !== undefined ? params.nullLabel : 'Keine Auswahl';
        this.remoteSourceService = params.remoteSourceService;
        this.visible = params.visible !== undefined ? params.visible : Promise.resolve(true);
    }
}


class CachedResponse<T> {
    cachedAt: Date;
    expiresAt: Date;
    response: Promise<AxiosResponse<PaginatedResponse<T> | T>>;

    constructor(response: Promise<AxiosResponse<PaginatedResponse<T> | T>>, timeout: number) {
        this.cachedAt = new Date();
        this.expiresAt = new Date();
        this.expiresAt.setSeconds(this.expiresAt.getSeconds() + timeout);
        this.response = response;
    }

    isValid() {
        return this.expiresAt > new Date();
    }
}


export class BaseService<T> {
    endpoint: string;
    formFields: Array<FormField<any>>;
    filterAttributes: Array<FilterAttribute>;

    cacheTimeout: number;
    cacheRelatedServices: Array<BaseService<any>>;
    _cachedResponses: Map<string, CachedResponse<T>>;

    constructor(resourcePath: string, formFields: Array<FormField<any>> = [], filterAttributes: Array<FilterAttribute> = []) {
        this.endpoint = resourcePath;
        this.formFields = formFields;
        this.filterAttributes = filterAttributes;

        this.cacheTimeout = 0;
        this._cachedResponses = new Map<string, CachedResponse<T>>();
        this.cacheRelatedServices = new Array<BaseService<any>>();
    }

    titleAttribute(resourceId?: string): Promise<any> { return Promise.resolve((resource: any) => resource.name) }
    newResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Neue Resource") }
    newResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Neue Resource erstellt") }
    deleteResourceMethod(resourceId?: string): Promise<string> { return Promise.resolve("delete") }
    deleteResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Entfernen") }
    deleteResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Resource entfernt") }

    clearCache(cleanCacheRelatedServices=true) {
        this._cachedResponses = new Map<string, CachedResponse<T>>();

        if (!cleanCacheRelatedServices) return;

        for (const service of this.cacheRelatedServices) {
            service.clearCache(false);
        }
    }

    _get(pathParameters: string, useCachedResponse = true) {
        pathParameters = pathParameters ? pathParameters : '';
        const url = this.endpoint + pathParameters;
        const cacheKey = localStorage.accessToken + "|" + url;

        const cachedResponse = this._cachedResponses.get(cacheKey);
        let promise;
        if (useCachedResponse && cachedResponse && cachedResponse.isValid()) {
            promise = cachedResponse.response;
        } else {
            promise = axios.get(url);

            // Add promise to cache. We add it to the cache before a succesful
            // response, to avoid multiple requests being sent at the same time
            this._cachedResponses.set(cacheKey, new CachedResponse(promise, this.cacheTimeout));

            // In case of a failure, we remove it from the cache
            promise.then(undefined, () => {
                this._cachedResponses.delete(cacheKey);
            });
        }

        // Before we return the promise, we deep copy the response in case it
        // gets modified later
        promise = promise.then(response => {
            return JSON.parse(JSON.stringify(response));
        });

        return promise;
    }

    _delete(pathParameters: string) {
        pathParameters = pathParameters ? pathParameters : '';
        const url = this.endpoint + pathParameters;

        return axios
            .delete(url)
            .then((response: any) => {
                this.clearCache();
                return Promise.resolve(response.data)
            })
            .catch((error: AxiosError) => Promise.reject(error));
    }

    _post(pathParameters: string, body: any) {
        pathParameters = pathParameters ? pathParameters : '';
        const url = this.endpoint + pathParameters;

        return axios
            .post(url, body)
            .then((response: any) => {
                this.clearCache();
                return response
            });
    }

    _patch(pathParameters: string, body: any) {
        pathParameters = pathParameters ? pathParameters : '';
        const url = this.endpoint + pathParameters;
        return axios
            .patch(url, body)
            .then((response: any) => {
                this.clearCache();
                return response
            });
    }

    _getChoices(path: string, page=1, pagesize=50, query='', ids: Array<string>=[]): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        let params =
            path +
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(query));

        if (ids.length > 0) params += "&ids=" + ids.join("|");

        return this._get(params) as unknown as Promise<AxiosResponse<PaginatedResponse<ChoiceField>>>;
    }

    list(page=1, pagesize=50, query=''): Promise<AxiosResponse<PaginatedResponse<T>>> {
        const params =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(query));

        return this._get(params) as unknown as Promise<AxiosResponse<PaginatedResponse<T>>>;
    }

    retrieve(resourceId: string, extraParams?: Map<string, string>): Promise<AxiosResponse<T>> {
        let path = resourceId + "/";
        if (extraParams !== undefined) path += "?" + Array.from(extraParams.entries()).map(entry => entry[0] + "=" + entry[1]).join("&");

        return this._get(path) as unknown as Promise<AxiosResponse<T>>;
    }

    create(body: T): Promise<AxiosResponse<T>> {
        return this._post('', body) as unknown as Promise<AxiosResponse<T>>;
    }

    update(resourceId: string, body: T): Promise<AxiosResponse<T>> {
        return this._patch(resourceId + "/", body) as unknown as Promise<AxiosResponse<T>>
    }

    delete(resourceId: string): Promise<AxiosResponse<undefined>> {
        return this._delete(resourceId + "/") as unknown as Promise<AxiosResponse<undefined>>;
    }
}

export default BaseService;

import { BaseService, FormField, FilterAttribute, PaginatedResponse } from './_base';

import { employeeGroupService, EmployeeGroup } from './employee-groups';
import { physicalTokenService, PhysicalToken } from './physical-tokens';
import { institutionService } from './institutions';

import branding from '../branding';
import { AxiosResponse } from 'axios';

interface Employee {
    id: string;
    created_at: string;
    modified_at: string;
    archived_at?: string;
    username: string;
    user_account_id: string;
    employee_group_id?: string;
    external_id?: string;
    accounting_number?: string;
    employee_group_name?: string;
    is_male: boolean;
    first_name: string;
    last_name: string;
    email?: string;
    initial_password: string;
    physical_token_id?: string;
    can_be_deleted: boolean;
    delete_after_archive_period?: number;
}

interface EmployeesListParams {
    page?: number;
    pagesize?: number;
    query?: string;
    useCache?: boolean;

    verbosity?: string;

    ids?: Array<string>;
    employeeGroups?: Array<string>;
    showArchived?: boolean;
    minimumAbsenceCount?: number;
    absenceDaterange?: string;
}


class EmployeeService extends BaseService<Employee> {
    archivedFormFields: Array<FormField<any>>;

    constructor() {
        super("/api/v2/employees/employees/");
        this.formFields = [
            new FormField<Employee>("first_name", "Vorname", {autofocus: true}),
            new FormField<Employee>("last_name", "Nachname"),
            new FormField<Employee>("email", "E-Mail-Adresse", {
                mobileType: "stacked",
            }),
            new FormField<EmployeeGroup>("employee_group_id", "Abteilung", {
                type: 'select',
                remoteSourceService: employeeGroupService,
                remoteSourceAttribute: "name"
            }),
            new FormField<PhysicalToken>("physical_token_id", "Token-Nummer", {
                type: 'select',
                description: "Die ausgewählte Token-Nummer kann zur Authentifizierung am Zeiterfassungs-Terminal verwendet werden. Nur nicht bereits zugewiesene Nummern werden angezeigt. <a target='_blank' href='/tokens/'>Token verwalten</a>",
                remoteSourceService: physicalTokenService,
                remoteSourceListMethod: "listAvailable",
                remoteSourceAttribute: 'id',
                listPageSize: 1000,
            }),
            new FormField<Employee>("accounting_number", "Personalnummer", { mobileType: 'stacked', description: "Die Personalnummer wird verwendet, um den Mitarbeiter im Buchhaltungsexport zu identifizieren."}),
        ];
        if (branding.id == "orange")
            this.formFields.push(new FormField<Employee>("external_id", "aQrate Benutzername", { mobileType: 'stacked', description:  "Der Benutzername wird verwendet, um diesen Zeitblick Mitarbeiter einem aQrate Mitarbeiter bei Authentifizierung am MFP zuzuordnen."}));
        this.formFields = this.formFields.concat([
            new FormField<Employee>("username", branding.name + " Benutzername", {
                mobileType: 'stacked',
                description: "Der Benutzername wird vom Mitarbeiter benötigt, um sich gegenüber der " + branding.name + " Smartphone App und dem Web-Login (https://" + branding.url + "/) zu authentifizieren.",
                isReadOnly: true,
                showCreate: false,
            }),
            new FormField<Employee>("initial_password", "Vorläufiges Passwort", { mobileType: 'stacked', isReadOnly: true, showCreate: false, }),
        ]);

        this.archivedFormFields = [
            new FormField<Employee>("first_name", "Vorname", {isReadOnly: true}),
            new FormField<Employee>("last_name", "Nachname", { isReadOnly: true }),
            new FormField<Employee>("email", "E-Mail-Adresse", { isReadOnly: true }),
            new FormField<EmployeeGroup>("employee_group_id", "Abteilung", {
                type: 'select',
                remoteSourceService: employeeGroupService,
                remoteSourceAttribute: "name",
                isReadOnly: true,
            }),
            new FormField<Employee>("accounting_id", "Personalnummer", { description: "Die Personalnummer wird verwendet, um den Mitarbeiter im Buchhaltungsexport zu identifizieren." , isReadOnly: true}),
        ];
        if (branding.id == "orange")
            this.archivedFormFields.push(new FormField<Employee>("external_id", "aQrate Benutzername", { description: "Der Benutzername wird verwendet, um diesen Zeitblick Mitarbeiter einem aQrate Mitarbeiter bei Authentifizierung am MFP zuzuordnen.", isReadOnly: true }));

        this.filterAttributes = [
            new FilterAttribute("showArchived", "Archivierte Mitarbeiter anzeigen", "boolean", false, {
                visible: this.listParams({ showArchived: true}).then((response: AxiosResponse<PaginatedResponse<EmployeeGroup>>) => {
                    return response.data.count > 0;
                }),
            }),
            new FilterAttribute("employeeGroups", "Abteilungen", "select", undefined, {
                multiple: true,
                remoteSourceService: employeeGroupService,
                visible: employeeGroupService.listParams({}).then((response: AxiosResponse<PaginatedResponse<EmployeeGroup>>) => {
                    return response.data.count > 0;
                }),
            }),
        ];

        this.cacheTimeout = 60 * 60 * 24 * 14;
    }

    titleAttribute(): Promise<any> { return Promise.resolve((resource: any) => resource.first_name + " " + resource.last_name) }
    newResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Mitarbeiter hinzufügen") }
    newResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Mitarbeiter hinzugefügt") }

    deleteResourceMethod(resourceId?: string): Promise<string> {
        if (!resourceId) return Promise.resolve('');

        return this.retrieve(resourceId).then(employeeResponse => {
            if (employeeResponse.data.can_be_deleted) {
                return Promise.resolve("delete");
            } else if (!employeeResponse.data.archived_at) {
                return Promise.resolve("archive");
            }

            return Promise.resolve('');
        });
    }
    deleteResourceTitle(resourceId?: string): Promise<string> {
        if (!resourceId) return Promise.resolve("Entfernen");

        return this.retrieve(resourceId).then(employeeResponse => {
            if (employeeResponse.data.can_be_deleted) {
                return Promise.resolve("Entfernen");
            } else if (!employeeResponse.data.archived_at) {
                return Promise.resolve("Archivieren");
            }

            return Promise.resolve('');
        });
    }
    deleteResourceConfirmation(resourceId?: string): Promise<string> {
        if (!resourceId) return Promise.resolve("Mitarbeiter entfernt");

        return this.retrieve(resourceId).then(employeeResponse => {
            if (employeeResponse.data.can_be_deleted) {
                return Promise.resolve("Mitarbeiter entfernt");
            } else if (!employeeResponse.data.archived_at) {
                return Promise.resolve("Mitarbeiter archiviert");
            }

            return Promise.resolve('');
        });
    }

    async retrieveSettingValue(resourceId: string, categoryId: string, settingId: string): Promise<any> {
        const employeeSettings = (await this.retrieveSettings(resourceId)).data;
        if (categoryId in employeeSettings && settingId in employeeSettings[categoryId]) {
            return employeeSettings[categoryId][settingId]
        }

        return institutionService.retrieveSettingValue(categoryId, settingId);

    }

    retrieveSettings(resourceId: string): Promise<AxiosResponse<any>> {
        return this._get(resourceId + "/settings/") as unknown as Promise<AxiosResponse<any>>;
    }

    updateSettings(resourceId: string, newSettings: any) {
        return this._post(resourceId + "/settings/", newSettings);
    }

    resetPassword(resourceId: string) {
        return this._post(resourceId + "/reset-password/", {});
    }

    list(page=1, pagesize=50, query='', employeeGroups?: string, showArchived?: boolean) {
        let params =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(query));

        if (employeeGroups != undefined) {
            params = params + '&employee_groups=' + employeeGroups;
        }

        if (showArchived === true) {
            params = params + '&archived';
        }

        return this._get(params);
    }

    listParams(params: EmployeesListParams) {
        const pagesize = params.pagesize || 50;
        const page = params.page || 1;
        const query = params.query || '';

        let url =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(query));

        if (params.verbosity) url += "&verbosity=" + params.verbosity;
        if (params.ids) url += "&ids=" + params.ids.join("|");
        if (params.employeeGroups) url += "&employee_groups=" + params.employeeGroups.join("|");
        if (params.showArchived === true) url = url + '&archived';
        if (params.minimumAbsenceCount) url = url + '&absence_count__gte=' + String(params.minimumAbsenceCount);
        if (params.absenceDaterange) url = url + '&absence_daterange=' + params.absenceDaterange;

        return this._get(url, params.useCache !== false);
    }

    archive(resourceId: string) {
        return this._post(resourceId + "/archive/", {});
    }
}

const employeeService = new EmployeeService();

export { EmployeeService, employeeService, Employee };

export default employeeService;

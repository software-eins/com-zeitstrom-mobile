import {BaseService, FormField} from './_base';


interface EmployeeGroup {
    id: string;
    name: string;
    employee_count: number;
}


interface EmployeeGroupListParams {
    page?: number;
    pagesize?: number;
    query?: string;
    ids?: Array<string>;
}


class EmployeeGroupService extends BaseService<EmployeeGroup> {
    constructor() {
        super("/api/v2/employees/groups/");
        this.formFields = [
            new FormField("name", "Abteilungsname", { autofocus: true, mobileType: 'stacked'}),
        ];

        this.cacheTimeout = 60 * 60 * 24 * 14;
    }

    newResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Abteilung hinzufügen") }
    newResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Abteilung hinzugefügt") }
    deleteResourceMethod(resourceId?: string): Promise<string> { return Promise.resolve("delete") }
    deleteResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Entfernen") }
    deleteResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Abteilung entfernt") }

    listParams(params: EmployeeGroupListParams) {
        console.log("employee-groups.listParams");
        const pagesize = params.pagesize || 50;
        const page = params.page || 1;
        const query = params.query || '';

        let url =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(query));

            if (params.ids) url += "&ids=" + params.ids.join("|");

        return this._get(url);
    }
}

const employeeGroupService = new EmployeeGroupService();

export { EmployeeGroup, EmployeeGroupService, employeeGroupService }

export default employeeGroupService;

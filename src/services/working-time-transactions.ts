import { AxiosResponse } from 'axios';
import BaseService, { PaginatedResponse, FormField } from './_base';

interface WorkingTimeTransactionParams {
    employeeIds?: Array<string>;
    earliestDatetime?: string;
    latestDatetime?: string;

    page?: number;
    pagesize?: number;
}

interface WorkingTimeTransaction {
    id: string;
    type: string;
    date: string;
    employee_id: string;
    amount: number;
    comment: string;
}

interface WorkingTimeTransactionAggregated {
    employee_id: string;
    amount: number;
}

class WorkingTimeTransactionService extends BaseService<WorkingTimeTransaction | WorkingTimeTransactionAggregated> {
    constructor() {
        super("/api/v2/timestamps/working-time-transactions/");
        this.formFields = [
            new FormField<WorkingTimeTransaction>("amount", "Anzahl Stunden", {
                type: "number",
                description: "Arbeitszeit, welche diesem Monat hinzugefügt oder abgezogen wird. Eine negative Zahl gleicht Überstunden aus.",
                step: 1,
                minimum: -100000,
                maximum: 100000,
            }),
            new FormField<WorkingTimeTransaction>("comment", "Grund"),
        ];

        this.cacheTimeout = 60 * 2;
    }

    listParams(params: WorkingTimeTransactionParams): Promise<AxiosResponse<PaginatedResponse<WorkingTimeTransaction>>> {
        const page = params.page || 1;
        const pagesize = params.pagesize || 50;

        let query =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

        if (params.earliestDatetime) query += "&date__gte=" + params.earliestDatetime;
        if (params.latestDatetime) query += "&date__lte=" + params.latestDatetime;
        if (params.employeeIds) query += "&employee_ids=" + params.employeeIds.join("|");

        return this._get(query) as unknown as Promise<AxiosResponse<PaginatedResponse<WorkingTimeTransaction>>>;
    }

    aggregate(params: WorkingTimeTransactionParams): Promise<AxiosResponse<PaginatedResponse<WorkingTimeTransactionAggregated>>> {
        const page = params.page || 1;
        const pagesize = params.pagesize || 50;

        let query =
            'aggregate/' +
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

        if (params.earliestDatetime) query += "&date__gte=" + params.earliestDatetime;
        if (params.latestDatetime) query += "&date__lte=" + params.latestDatetime;
        if (params.employeeIds) query += "&employee_ids=" + params.employeeIds.join("|");

        return this._get(query) as unknown as Promise<AxiosResponse<PaginatedResponse<WorkingTimeTransactionAggregated>>>;
    }
}

const workingTimeTransactionService = new WorkingTimeTransactionService();

export { WorkingTimeTransactionService, workingTimeTransactionService, WorkingTimeTransactionAggregated, WorkingTimeTransaction };

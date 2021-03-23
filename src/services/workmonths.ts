import { AxiosResponse } from 'axios';
import BaseService from './_base';

interface WorkmonthListParams {
    years?: Array<number>;
    months?: Array<number>;
    employeeIds?: Array<string>;
    page?: number;
    pagesize?: number;
    verbosity?: string;
}

interface WorkmonthCreateParams {
    verbosity?: string;
}

interface WorkmonthRetrieveParams {
    verbosity?: string;
}

interface Workday {
    id: string;
    checkin: string;
    checkout?: string;
    break_duration?: number;
    work_duration?: number;
    note?: string;
    history_change_count: number;
}

interface DayOffReason {
    type: string;
}

interface MissingDay {
    id: string;

    affected_hours: number;
    comment: string;
    date_from: string;
    date_to: string;
    label: string;
    missing_type: string;
    target_hour_behaviour: string;
}

interface Day {
    day?: number;
    day_off_reasons?: Array<DayOffReason>;
    isoformat: string;
    missing_days?: Array<MissingDay>;
    weekday?: string;
    workdays?: Array<Workday>;

    inactive?: boolean;
}

interface Workmonth {
    created_at: string;
    employee_id: string;
    id: string;
    incomplete_days_count: number;
    modified_at: string;
    month: number;
    target_worktime: number;
    workday_count: number;
    worktime_count: number;
    year: number;
}

interface WorkmonthDetail {
    created_at: string;
    employee_id: string;
    id: string;
    incomplete_days_count: number;
    modified_at: string;
    month: number;
    target_worktime: number;
    workday_count: number;
    worktime_count: number;
    year: number;
    calendar: Array<Day>;
}

interface WorkingTimeBalance {
    worktime_count: number;
    target_worktime: number;
    is_active_month: boolean;
}

class WorkmonthService extends BaseService<Workmonth | WorkmonthDetail> {
    constructor() {
        super("/api/v2/timestamps/workmonths/");

        this.cacheTimeout = 60;
    }

    listParams(params: WorkmonthListParams) {
        const page = params.page || 1;
        const pagesize = params.pagesize || 50;

        let query =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

        if (params.years) query += "&years=" + params.years.join("|");
        if (params.months) query += "&months=" + params.months.join("|");
        if (params.employeeIds) query += "&employee_ids=" + params.employeeIds.join("|");
        if (params.verbosity) query += '&verbosity=' + params.verbosity;

        return this._get(query);
    }

    createParams(params: WorkmonthCreateParams, body: any): Promise<AxiosResponse<Workmonth | WorkmonthDetail>> {
        params = params || {};

        let query = "";
        if (params.verbosity) query += '?verbosity=' + params.verbosity;

        return this._post(query, body) as unknown as Promise<AxiosResponse<Workmonth | WorkmonthDetail>>;
    }

    retrieveParams(resourceId: string, params: WorkmonthRetrieveParams): Promise<Workmonth | WorkmonthDetail> {
        params = params || {};

        let query = resourceId + "/";
        if (params.verbosity) query += '?verbosity=' + params.verbosity;

        return this._get(query) as unknown as Promise<Workmonth | WorkmonthDetail>;
    }

    workingTimeBalance(resourceId: string): Promise<WorkingTimeBalance> {
        const endpoint = resourceId + "/working-time-balance/";
        return this._get(endpoint) as unknown as Promise<WorkingTimeBalance>;
    }

    getDownloadLink(resourceId: string): string {
        return this.endpoint + resourceId + "/download/";
    }
}

const workmonthService = new WorkmonthService();

export { Day, MissingDay, DayOffReason, Workday, Workmonth, WorkmonthDetail, workmonthService };


import BaseService, { PaginatedResponse } from './_base';

import { Timestamp } from "./timestamps";
import { AxiosResponse } from 'axios';
import { workmonthService } from './workmonths';
import { employeeReportService } from './reports-employees';


interface Timespan {
    id: string;
    checkin: Timestamp;

    checkout?: Timestamp;
    employee_comment?: string;
    project_id?: string;

    duration?: number;
}

interface TimespanListParams {
    employeeIds?: Array<string>;
    workmonthIds?: Array<string>;
    workdayIds?: Array<string>;
    isoDateFrom?: string;
    isoDateTo?: string;
    page?: number;
    pagesize?: number;
    verbosity?: string;
    order?: Array<string>;

    hasEmployeeComment?: boolean;
    employeeComment?: string;
}

interface TimespanHistoryParams {
    page?: number;
    pagesize?: number;
}

class TimespanGroup {
    originalTimespanIds: Array<string>;
    timespans: Array<Timespan>;

    constructor() {
        this.timespans = [];
        this.originalTimespanIds = [];
    }

    checkin(): string { return this.timespans[0].checkin.time }

    checkout(): string {
        const lastTimespan = this.timespans[this.timespans.length - 1];
        if (lastTimespan.checkout == undefined) return '??';

        return lastTimespan.checkout.time
    }

    stampTimespanIds() {
        this.originalTimespanIds = [];
        for (const ts of this.timespans) {
            this.originalTimespanIds.push(ts.id);
        }
    }
}

interface TimespanSetTimesBody {
    checkin: string;
    checkout?: string;
    project_id?: string;
}

interface TimespanSetTimesEmployeeBody {
    checkin: string;
    checkout?: string;
    update_reason?: string;
}

interface TimespanAddTimesBody {
    workday_id: string;
    checkin: string;
    checkout?: string;
    project_id?: string;
}

class TimespanService extends BaseService<Timespan> {
    constructor() {
        super("/api/v2/timestamps/timespans/");

        this.cacheTimeout = 60;
        this.cacheRelatedServices = [workmonthService, employeeReportService];
    }

    listParams(params: TimespanListParams): AxiosResponse<PaginatedResponse<Timespan>> {
        params = params || {};
        const page = params.page || 1;
        const pagesize = params.pagesize || 50;

        let query =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

        if (params.employeeIds) query += "&employee_ids=" + params.employeeIds.join("|");
        if (params.workmonthIds) query += "&workmonth_ids=" + params.workmonthIds.join("|");
        if (params.workdayIds) query += "&workday_ids=" + params.workdayIds.join("|");
        if (params.verbosity) query += '&verbosity=' + params.verbosity;
        if (params.isoDateFrom) query += '&datetime_from=' + params.isoDateFrom;
        if (params.isoDateTo) query += '&datetime_to=' + params.isoDateTo;
        if (params.order) query += "&order=" + params.order.join("|");
        if (params.hasEmployeeComment !== undefined) query += "&has_employee_comment=" + (params.hasEmployeeComment ? 'true' : 'false');
        if (params.employeeComment) query += "&employee_comment=" + params.employeeComment;

        return this._get(query) as unknown as AxiosResponse<PaginatedResponse<Timespan>>;
    }

    history(resourceId: string, params: TimespanHistoryParams) {
        params = params || {};
        const page = params.page || 1;
        const pagesize = params.pagesize || 50;

        const query =
            resourceId + "/history/" +
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

        return this._get(query);
    }

    setTimes(resourceId: string, body: TimespanSetTimesBody): Promise<Timespan> {
        const query = resourceId + "/set-times/";
        return this._patch(query, body) as unknown as Promise<Timespan>;
    }

    setTimesEmployee(resourceId: string, body: TimespanSetTimesEmployeeBody): Promise<Timespan> {
        const query = resourceId + "/set-times-employee/";
        return this._patch(query, body) as unknown as Promise<Timespan>;
    }

    addTimes(body: TimespanAddTimesBody): Promise<Timespan> {
        const query = "add-times/";
        return this._post(query, body) as unknown as Promise<Timespan>;
    }

    updateEmployeeComment(resourceId: string, employeeComment?: string): Promise<Timespan> {
        const query = resourceId + "/update-employee-comment/";
        const payload = {
            'employee_comment': employeeComment,
        }
        return this._post(query, payload) as unknown as Promise<Timespan>;
    }

    assignProject(resourceId: string, projectId?: string): Promise<Timespan> {
        const query = resourceId + "/assign-project/";
        const payload = {
            'project_id': projectId || undefined,
        }
        return this._post(query, payload) as unknown as Promise<Timespan>;
    }

    modifyConsecutiveTimespans(timespanGroup: TimespanGroup): Promise<TimespanGroup> {
        const query = "modify-consecutive-timespans/";
        const newTimespans = [];
        for (const ts of timespanGroup.timespans) {
            newTimespans.push({
                'checkin': ts.checkin.time,
                'checkout': ts.checkout?.time,
                'employee_comment': ts.employee_comment,
                'project_id': ts.project_id,
            });
        }

        const payload = {
            'source_timespan_ids': timespanGroup.originalTimespanIds,
            'new_timespans': newTimespans,
        };

        const result = this._post(query, payload) as unknown as Promise<Array<Timespan>>;

        return result.then(response => {
            timespanGroup.originalTimespanIds = response.map(ts => ts.id);
            timespanGroup.timespans = response;

            return timespanGroup
        })
    }
}

const timespanService = new TimespanService();

export { Timespan, timespanService, TimespanListParams }

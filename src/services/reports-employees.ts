import { Timespan } from './timespans';
import BaseService from './_base';



interface WorkdayReport {
    break_duration: number;
    checkin: string;
    checkout?: string;
    id: string;
    note?: string;
    short_break_policy: string;
    timespans: Array<Timespan>;
}

interface WorkdayReprotListParams {
    page?: number;
    pagesize?: number;
    daterange?: Array<string>;
}

class EmployeeReportService extends BaseService<WorkdayReport> {
    constructor() {
        super("/api/v2/reports/employees/");

        this.cacheTimeout = 60;
    }

    workdayReports(employeeId: string, params: WorkdayReprotListParams = {}) {
        const page = params.page || 1;
        const pagesize = params.pagesize || 50;
        const daterange = params.daterange;

        let query =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

        if (daterange) query += "&daterange=" + daterange[0] + "|" + daterange[1];

        return this._get(employeeId + '/' + query);
    }
}

const employeeReportService = new EmployeeReportService();

export { employeeReportService, WorkdayReport }

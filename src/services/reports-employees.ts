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

class EmployeeReportService extends BaseService<WorkdayReport> {
    constructor() {
        super("/api/v2/reports/employees/");
    }

    workdayReports(objectId: string, page=1, pagesize=50) {
        const params =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

        return this._get(objectId + '/' + params);
    }
}

const employeeReportService = new EmployeeReportService();

export { employeeReportService, WorkdayReport }


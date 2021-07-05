import { AxiosResponse } from 'axios';
import { Timespan } from './timespans';
import { BaseService } from './_base';


interface EmployeeTrack {
    id: string;
}


class TrackingService extends BaseService<EmployeeTrack> {
    constructor() {
        super("/api/v2/tracking/employees/");
    }

    addTwoTimestamps(employeeId: string, comment?: string, projectId?: string, newProjectId?: string, meta?: any) {
        return this._post(employeeId + '/add-timestamps/', {
            "description": comment,
            "project_id": projectId,
            "next_project_id": newProjectId,
            "meta": meta,
        });
    }

    addTimestamp(employeeId: string, comment?: string, projectId?: string, meta?: any) {
        return this._post(employeeId + '/add-timestamp/', {
            "description": comment,
            "project_id": projectId,
            "meta": meta,
        });
    }

    updateComment(employeeId: string, comment?: string, projectId?: string) {
        return this._post(employeeId + '/update-comment/', {
            "description": comment,
            "project_id": projectId,
        });
    }

    activeTimespan(employeeId: string): Promise<AxiosResponse<Timespan|string>> {
        return this._get(employeeId + '/active-timespan/') as unknown as Promise<AxiosResponse<Timespan|string>>;
    }
}

const trackingService = new TrackingService();

export { trackingService };

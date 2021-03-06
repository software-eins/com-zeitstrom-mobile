import { AxiosResponse } from 'axios';
import { BaseService, ChoiceField, PaginatedResponse } from './_base';


interface Absence {
  id: string;
  created_at: string;
  modified_at: string;
  employee_id: string;
  date_from: string;
  date_to: string;
  affected_hours: number;
  target_hour_behaviour: string;
  attachment?: string;
  comment?: string;
  missing_type: string;
}

interface AbsenceListParams {
  pagesize?: number;
  page?: number;
  order?: Array<string>;
}


class AbsenceService extends BaseService<Absence> {
    constructor() {
        super("/api/v2/timestamps/absence/");
        this.cacheTimeout = 60 * 5;
    }

    missingTypes(page=1, pagesize=50, query=''): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        return this._getChoices('missing-types/', page, pagesize, query);
    }

    targetHourBehaviours(page=1, pagesize=50, query=''): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        return this._getChoices('target-hour-behaviours/', page, pagesize, query);
    }

  listParams(params?: AbsenceListParams): Promise<AxiosResponse<PaginatedResponse<Absence>>> {
        params = params || {};

        const pagesize = params.pagesize || 50;
        const page = params.page || 1;

        let url =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

            if (params.order) url += "&order=" + params.order.join(",");

        return this._get(url) as unknown as Promise<AxiosResponse<PaginatedResponse<Absence>>>;
    }

}

const absenceService = new AbsenceService();

export { absenceService, AbsenceService, Absence, }

export default absenceService;

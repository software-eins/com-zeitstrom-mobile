import { AxiosResponse } from 'axios';
import {
  BaseService,
  ChoiceField,
  PaginatedResponse,
  S3UploadToken,
  SignedUrl,
} from './_base';


interface AbsenceApplication {
  id: string;
  created_at: string;
  modified_at: string;
  employee_id: string;
  date_from: string;
  date_to: string;
  half_day: boolean;
  affected_hours: number;
  target_hour_behaviour: string;
  attachment?: string;
  comment?: string;
  missing_type: string;
}

interface AbsenceApplicationListParams {
  pagesize?: number;
  page?: number;
  order?: Array<string>;
}


class AbsenceApplicationService extends BaseService<AbsenceApplication> {
    constructor() {
        super("/api/v2/timestamps/absence-applications/");
        this.cacheTimeout = 60 * 5;
    }

    missingTypes(page=1, pagesize=50, query=''): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        return this._getChoices('missing-types/', page, pagesize, query);
    }

    targetHourBehaviours(page=1, pagesize=50, query=''): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        return this._getChoices('target-hour-behaviours/', page, pagesize, query);
    }

    listParams(params?: AbsenceApplicationListParams): Promise<AxiosResponse<PaginatedResponse<AbsenceApplication>>> {
        params = params || {};

        const pagesize = params.pagesize || 50;
        const page = params.page || 1;

        let url =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize);

            if (params.order) url += "&order=" + params.order.join(",");

        return this._get(url) as unknown as Promise<AxiosResponse<PaginatedResponse<AbsenceApplication>>>;
    }

    deleteResourceConfirmation(resourceId?: string): Promise<string> {
      return Promise.resolve("Abwesenheitsanfrage entfernt");
    }
    newResourceConfirmation(resourceId?: string): Promise<string> {
      return Promise.resolve("Abwesenheitsanfrage erstellt");
    }

    uploadAttachmentToken(employeeId: string): Promise<AxiosResponse<S3UploadToken>> {
      const url = "upload-attachment-token/";
      const data = {
        employee_id: employeeId,
      }
      return this._post(url, data) as unknown as Promise<AxiosResponse<S3UploadToken>>;
    }

    signAttachmentUrl(uri: string): Promise<AxiosResponse<SignedUrl>> {
      const url = "sign-attachment-url/";
      const data = { uri, };
      return this._post(url, data) as unknown as Promise<AxiosResponse<SignedUrl>>;
    }

}

const absenceApplicationService = new AbsenceApplicationService();

export { absenceApplicationService, AbsenceApplicationService, AbsenceApplication, }

export default absenceApplicationService;

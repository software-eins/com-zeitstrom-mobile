import { AxiosResponse } from 'axios';
import { BaseService, FormField, PaginatedResponse } from './_base';

interface ProjectListParams {
    ids?: Array<string>;
    includeArchived?: boolean;
    highlighted?: boolean;
    page?: number;
    pagesize?: number;
    query?: string;
}

interface Project {
    id: string;
    archived_at?: string;
    name: string;
    code: string;
    color: string;
    total_duration: number;
}

class ProjectService extends BaseService<Project> {
    archivedFormFields: Array<FormField<any>>;

    constructor() {
        super("/api/v2/projects/projects/");
        this.formFields = [
            new FormField("name", "Name", { autofocus: true }),
            new FormField("code", "Code", {}),
            new FormField("highlighted", "Hervorgehoben", {
                type: 'bool',
                description: "Hervorgehobene Projekte können schneller durch Mitarbeiter ausgewählt werden. Es können maximal 3 Projekte hervorgehoben werden.",
            }),
            new FormField("color", "Farbe", { type: 'color' }),
        ];

        this.archivedFormFields = [
            new FormField("name", "Name", { isReadOnly: true }),
            new FormField("code", "Code", { isReadOnly: true }),
            new FormField("highlighted", "Hervorgehoben", {
                type: 'bool',
                isReadOnly: true,
                description: "Hervorgehobene Projekte können schneller durch Mitarbeiter ausgewählt werden. Es können maximal 3 Projekte hervorgehoben werden.",
            }),
            new FormField("color", "Farbe", { type: 'color', isReadOnly: true }),
        ];

        this.cacheTimeout = 60 * 5;
    }

    newResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Projekt hinzufügen") }
    newResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Projekt hinzugefügt") }
    deleteResourceMethod(resourceId?: string): Promise<string> { return Promise.resolve("archive") }
    deleteResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Archivieren") }
    deleteResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Projekt archiviert") }

    listParams(params: ProjectListParams): Promise<AxiosResponse<PaginatedResponse<Project>>> {
        params = params || {};

        const pagesize = params.pagesize || 50;
        const page = params.page || 1;
        const query = params.query || '';

        let url =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(query));

        if (params.ids && params.ids.length > 0) url += '&ids=' + params.ids.join("|");
        if ((params.ids && params.ids.length > 0) || params.includeArchived) url += '&include-archived';

        if (params.highlighted) url += '&highlighted';

        return this._get(url) as unknown as Promise<AxiosResponse<PaginatedResponse<Project>>>;
    }

    archive(resourceId: string): Promise<AxiosResponse<Project>> {
        const promise = this._post(resourceId + "/archive/", {});

        // Clean cache after archive request was successfull
        promise.then(() => {
            this.clearCache();
        });

        return promise as unknown as Promise<AxiosResponse<Project>>;
    }
}

const projectService = new ProjectService();

export { projectService, ProjectService, Project };

export default projectService;

import { AxiosResponse } from 'axios';
import { BaseService, FormField, FormFieldCondition, ChoiceField, PaginatedResponse } from './_base';


interface NetworkConnectionDetail {
    is_connected: boolean;
    ip?: string;
}


interface NetworkConnections {
    wifi: NetworkConnectionDetail;
    eth: NetworkConnectionDetail;
}


interface Device {
    id: string;
    created_at: string;
    modified_at: string;
    model?: string;
    serial_number: string;
    human_readable_name: string;
    authentication_mode: string;
    is_online: boolean;
    network_connections: NetworkConnections;
}

interface DeviceListParams {
    page?: number;
    pagesize?: number;
    query?: string;
}


class DeviceService extends BaseService<Device> {
    constructor() {
        super("/api/v2/devices/devices/");
        this.formFields = [
            new FormField("serial_number", "Seriennummer", { autofocus: true, showEdit: false }),
            new FormField("human_readable_name", "Bezeichnung", { mobileType: 'stacked', showEdit: false }),

            new FormField("serial_number", "Seriennummer", { isReadOnly: true, showCreate: false }),
            new FormField("model", "Baureihe", { isReadOnly: true, showCreate: false, default: "Token-Scanner" }),
            new FormField("human_readable_name", "Bezeichnung", { mobileType: 'stacked', autofocus: true, showCreate: false }),

            new FormField("authentication_mode", "Authentifizierung", {
                type: "select",
                remoteSourceService: this,
                remoteSourceAttribute: 'label',
                remoteSourceListMethod: "listAuthenticationModes",
                isSelectedValueInOptionList: true,
                allowNull: false,
                showCreate: false,
                conditions: [
                    new FormFieldCondition("model", "MFP*"),
                ],
            }),
        ];

        this.cacheTimeout = 60 * 15;
    }

    titleAttribute(resourceId?: string): Promise<any> {
        return Promise.resolve((resource: any) => {
            if (resource.human_readable_name) return resource.human_readable_name;
            return resource.serial_number;
        });
    }
    newResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Terminal hinzufügen") }
    newResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Terminal hinzugefügt") }
    deleteResourceMethod(resourceId?: string): Promise<string> { return Promise.resolve("delete") }
    deleteResourceTitle(resourceId?: string): Promise<string> { return Promise.resolve("Entfernen") }
    deleteResourceConfirmation(resourceId?: string): Promise<string> { return Promise.resolve("Terminal entfernt") }

    listAuthenticationModes(page=1, pagesize=50, query=''): Promise<AxiosResponse<PaginatedResponse<ChoiceField>>> {
        return this._getChoices('authentication-modes/', page, pagesize, query);
    }

    listParams(params: DeviceListParams) {
        const pagesize = params.pagesize || 50;
        const page = params.page || 1;
        const query = params.query || '';

        const url =
            '?limit=' + String(pagesize) +
            '&offset=' + String((page - 1) * pagesize) +
            '&q=' + encodeURIComponent(String(query));

        return this._get(url);
    }
}

const deviceService = new DeviceService();

export {deviceService, DeviceService, Device, NetworkConnectionDetail, NetworkConnections}

export default deviceService;

import { BaseService, FormField, PaginatedResponse } from './_base';


interface SupportTicket {
    id?: string;
    subject?: string;
    body?: string;
}


class SupportTicketService extends BaseService<SupportTicket> {
    constructor() {
        super("/api/v2/support/tickets/");
        this.formFields = [
            new FormField("subject", "Dein Anliegen", { autofocus: true }),
            new FormField("body", "Detaillierte Beschreibung", {}),
        ];
    }
}

const supportTicketService = new SupportTicketService();

export { supportTicketService, SupportTicketService, SupportTicket };

export default supportTicketService;

<template>
    <zeit-list
        v-if="isLoaded && isActive"
        resourceType="Mitarbeiter"
        basePath="/employees/"
        searchPlaceholder="Suche nach Name oder Token"
        :service="employeeService"
        :fields="fields"
        :totalResultCountPromise="totalResultCountPromise"
        :segmentFilter="segmentFilterOptions"
        addResourceLabel="Neuer Mitarbeiter"
        :detailActions="detailActions"
        :showResults="showResults"
    >
        <template v-slot:no-results>Es existieren aktuell keine Mitarbeiter.</template>
        <template v-slot:no-results-add>Erstelle Mitarbeiter, welche Zugriff zu {{ branding.name }} erhalten dürfen.</template>
    </zeit-list>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { archive } from 'ionicons/icons';
    import { toastController } from '@ionic/vue';
    import ZeitList from '../components/ui/ZeitList.vue';
    import { DetailAction } from '../components/ui/ZeitDetail.vue';
    import employeeService, { Employee } from '../services/employees';
    import { RowIcon } from '../components/ui/ZeitGrid.vue';
    import branding from '../branding';
    import { AxiosResponse } from 'axios';

    import { textToClipboard } from '../globals/clipboard';

    export default defineComponent({
        title: "Mitarbeiter",
        components: {
            ZeitList,
        },
        data() {
            return {
                isLoaded: false,
                isActive: false,
                showResults: true,

                branding,
                employeeService,
                fields: [
                    {
                        id: "first_name",
                        label: "Vorname",
                    },
                    {
                        id: "last_name",
                        label: "Nachname",
                    },
                    {
                        hideDesktop: true,
                        mobileLevel: 'h2',
                        formatter: (e: any) => {
                            if (e.first_name && e.last_name) return e.first_name + " " + e.last_name;
                            return e.first_name || e.last_name;
                        },
                    },
                    {
                        id: "employee_group_name",
                        label: "Abteilung",
                        mobileLevel: 'p',
                        default: 'Keine Abteilung',
                    },
                    {
                        id: 'physical_token_id',
                        label: 'Token',
                        mobileLevel: 'p',
                        default: 'Kein Token',
                    },
                    {
                        id: "archived_at",
                        label: "Archiviert am",
                        hideDesktop: true,
                        mobileLevel: "h2-icons",
                        formatter: (e: any) => {
                            if (e.archived_at) return new RowIcon(archive, "medium");
                            return undefined;
                        }
                    },
                ],
                segmentFilterOptions: {
                    filterAttributeId: 'showArchived',
                    options: [
                        {label: 'Aktiv', value: 'active'},
                        {label: 'Archiviert', value: 'archived'},
                    ],
                    default: 'active',
                } as any,
                totalResultCountPromise: function() {
                    return Promise.all([
                        employeeService.listParams({}).then((result: AxiosResponse<any>) => {
                            return result.data.count;
                        }),
                        employeeService.listParams({showArchived: true}).then((result: AxiosResponse<any>) => {
                            return result.data.count;
                        }),
                    ]).then((resultCounts: Array<number>) => {
                        return resultCounts[0] + resultCounts[1];
                    });
                },
                detailActions: [] as Array<DetailAction>,
            }
        },
        beforeMount() {
            console.log("Employee.beforeMount");
            this.detailActions = [
                new DetailAction(
                    'Zugangsdaten kopieren',
                    (employee: Employee) => {
                        textToClipboard(
                            employee.username + "\n" + employee.initial_password,
                            'Zugangsdaten kopiert.'
                        )
                    }
                ),
                new DetailAction(
                    'Passwort zurücksetzen',
                    (employee: Employee) => {
                        employeeService.resetPassword(employee.id).then((response: AxiosResponse<Employee>) => {
                            employee.initial_password = response.data.initial_password;
                            textToClipboard(employee.initial_password, "Neues Passwort kopiert.");
                        })
                    }
                ),
                new DetailAction(
                    'Mitarbeiter löschen',
                    (employee: Employee) => {
                        this.showResults = false;
                        employeeService.delete(employee.id).then(() => {
                            toastController.create({
                                message: 'Mitarbeiter gelöscht.',
                                duration: 2000,
                                color: 'dark',
                            }).then(toast => toast.present());
                            this.showResults = true;
                        });
                    },
                    'destructive',
                    (employee: Employee) => {
                        return employee.can_be_deleted;
                    }
                ),
                new DetailAction(
                    'Mitarbeiter archivieren',
                    (employee: Employee) => {
                        this.showResults = false;
                        employeeService.archive(employee.id).then(() => {
                            toastController.create({
                                message: 'Mitarbeiter archiviert.',
                                duration: 2000,
                                color: 'dark',
                            }).then(toast => toast.present());
                            this.showResults = true;
                        });
                    },
                    'destructive',
                    (employee: Employee) => {
                        return !employee.can_be_deleted && !employee.archived_at;
                    }
                ),
            ];

            this.isActive = true;
            return Promise.all([
                employeeService.listParams({}).then((result: AxiosResponse<any>) => {
                    return result.data.count;
                }),
                employeeService.listParams({showArchived: true}).then((result: AxiosResponse<any>) => {
                    return result.data.count;
                }),
            ]).then((resultCounts: Array<number>) => {
                const activeCount = resultCounts[0];
                const archiveCount = resultCounts[1];

                // Do not show archive filter option if no archived employees exist
                if (archiveCount == 0) {
                    this.segmentFilterOptions = undefined;
                }
                // Do show archive filter option as default if no active employee exists
                else if (activeCount == 0) {
                    this.segmentFilterOptions.default = true;
                }
                this.isLoaded = true;
            });
        },
        ionViewWillLeave() {
            this.isActive = false;
        },
        ionViewWillEnter() {
            this.isActive = true;
        },
    })
</script>



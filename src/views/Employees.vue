<template>
    <zeit-list
        v-if="isLoaded"
        resourceType="Mitarbeiter"
        basePath="/employees/"
        searchPlaceholder="Suche nach Name oder Token"
        :service="employeeService"
        :fields="fields"
        :totalResultCountPromise="totalResultCountPromise"
        :segmentFilter="segmentFilterOptions"
    >
        <template v-slot:no-results>Es existieren aktuell keine Mitarbeiter.</template>
        <template v-slot:no-results-add>Erstelle Mitarbeiter, welche Zugriff zu {{ branding.name }} erhalten dürfen.</template>
    </zeit-list>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { archive } from 'ionicons/icons';
    import ZeitList from '../components/ui/ZeitList.vue';
    import employeeService from '../services/employees';
    import { RowIcon } from '../components/ui/ZeitGrid.vue';
    import branding from '../branding';
    import { AxiosResponse } from 'axios';

    export default defineComponent({
        components: {
            ZeitList,
        },
        data() {
            return {
                isLoaded: false,

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
                        {label: 'Aktiv', value: false},
                        {label: 'Archiviert', value: true},
                    ],
                    default: false,
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
            }
        },
        beforeMount() {
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
    })
</script>



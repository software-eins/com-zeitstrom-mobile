<template>
    <zeit-list
        v-if="isActive"
        resourceType="Abteilungen"
        basePath="/departments/"
        searchPlaceholder="Suche nach Abteilungsname"
        :service="employeeGroupService"
        :fields="fields"
        addResourceLabel="Neue Abteilung"
    >
        <template v-slot:no-results>Es existieren aktuell keine Abteilungen.</template>
        <template v-slot:no-results-add>Erstelle Abteilungen, um deine Mitarbeiter zu gruppieren und einfacher zu verwalten.</template>
    </zeit-list>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import ZeitList from '../components/ui/ZeitList.vue';
    import { employeeGroupService, EmployeeGroup } from '../services/employee-groups';

    export default defineComponent({
        title: "Abteilungen",
        components: {
            ZeitList,
        },
        data() {
            return {
                isActive: false,

                employeeGroupService,
                fields: [
                    // {
                    //     id: "id",
                    //     label: "Seriennummer",
                    //     mobileLevel: "p",
                    // },
                    {
                        id: "name",
                        label: "Name",
                        mobileLevel: "h2",
                    },
                    {
                        id: "employee_count",
                        label: "Zugeordnete Mitarbeiter",
                    },
                    {
                        mobileLevel: "p",
                        hideDesktop: true,
                        formatter: (group: EmployeeGroup) => group.employee_count + " Mitarbeiter",
                    },
                ],
            }
        },
        beforeMount() {
            this.isActive = true;
        },
        ionViewWillLeave() {
            this.isActive = false;
        },
        ionViewWillEnter() {
            this.isActive = true;
        },
    })
</script>



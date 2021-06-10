<template>
    <zeit-list
        resourceType="Mitarbeiter"
        basePath="/employees/"
        searchPlaceholder="Suche nach Name oder Token"
        :service="employeeService"
        :fields="fields"
        :listParameters="listParameters"
    ></zeit-list>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import ZeitList from '../components/ui/ZeitList.vue';
    import employeeService from '../services/employees';

    export default defineComponent({
        components: {
            ZeitList,
        },
        computed: {
            listParameters() {
                return {employeeGroups: [this.$route.params.id]}
            }
        },
        data() {
            return {
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
                        id: 'physical_token_id',
                        label: 'Token',
                        mobileLevel: 'p',
                        default: 'Kein Token',
                    }
                ],
            }
        },
    })
</script>



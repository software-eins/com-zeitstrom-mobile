<template>
    <zeit-list
        resourceType="Token"
        basePath="/tokens/"
        searchPlaceholder="Suche nach Token"
        :service="physicalTokenService"
        :listParameters="listParameters"
        :fields="fields"
        :showDetail="false"
        :showSearch="false"
        addResourceLabel="Neue Token anlegen"
    ></zeit-list>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import ZeitList from '../components/ui/ZeitList.vue';
    import physicalTokenService from '../services/physical-tokens';

    export default defineComponent({
        title: "Token",
        components: {
            ZeitList,
        },
        data() {
            return {
                physicalTokenService,
                listParameters: {
                    fields: [
                        'id',
                        'employee__first_name',
                        'employee__last_name',
                    ],
                },
                fields: [
                    {
                        id: "id",
                        label: "Token",
                        mobileLevel: "h2",
                    },
                    {
                        id: "employee__first_name",
                        label: "Vorname",
                    },
                    {
                        id: "employee__last_name",
                        label: "Nachname",
                    },
                    {
                        hideDesktop: true,
                        mobileLevel: 'p',
                        formatter: (token: any) => {
                            if (!token.employee__first_name && !token.employee__last_name) return "Keine Zuordnung";
                            if (token.employee__first_name && token.employee__last_name) return token.employee__first_name + " " + token.employee__last_name;

                            return token.employee__first_name || token.employee__last_name;
                        },
                    },
                ],
            }
        },
    })
</script>

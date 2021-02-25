<template>
    <zeit-list
        resourceType="Hardware"
        basePath="/devices/"
        searchPlaceholder="Suche nach Seriennummer"
        :service="deviceService"
        :fields="fields"
    >
        <template v-slot:no-results>Es existiert aktuell keine Zeiterfassungs-Hardware in deinem Unternehmen.</template>
        <template v-slot:no-results-add>Füge Hardware hinzu, um deinen Mitarbeitern die Arbeitszeiterfassung über dedizierte Terminals zu ermöglichen.</template>
    </zeit-list>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import ZeitList from '../components/ui/ZeitList.vue';

    import deviceService from '../services/devices';

    export default defineComponent({
        components: {
            ZeitList,
        },
        data() {
            return {
                deviceService,
                fields: [
                    {
                        id: "serial_number",
                        label: "Seriennummer",
                        mobileLevel: "p",
                    },
                    {
                        id: "human_readable_name",
                        label: "Bezeichnung",
                        default: "Keine Bezeichnung",
                        mobileLevel: "h2",
                    },
                    {
                        id: "model",
                        label: "Baureihe",
                        default: "Token-Scanner",
                        mobileLevel: "p",
                    },
                ],
            }
        },
    })
</script>

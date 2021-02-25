<template>
    <zeit-list
        resourceType="Projekte"
        basePath="/projects/"
        searchPlaceholder="Suche nach Name oder Code"
        :service="projectService"
        :fields="fields"
    >
        <template v-slot:no-results>Es existieren aktuell keine Projekte.</template>
        <template v-slot:no-results-add>Sobald du ein Projekt erstellst, können Arbeitszeiten Projekten zugewiesen werden.</template>
    </zeit-list>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { star } from 'ionicons/icons';
    import ZeitList from '../components/ui/ZeitList.vue';
    import projectService from '../services/projects';
    import { formatDuration } from '../globals/helpers';
    import { RowIcon } from '../components/ui/ZeitGrid.vue';

    export default defineComponent({
        components: {
            ZeitList,
        },
        data() {
            return {
                projectService,
                fields: [
                    {
                        id: "name",
                        label: "Name",
                        mobileLevel: "h2",
                    },
                    {
                        id: "highlighted",
                        hideDesktop: true,
                        mobileLevel: "h2-icons",
                        formatter: (e: any) => {
                            if (e.highlighted) return new RowIcon(star);
                            return undefined;
                        }
                    },
                    {
                        id: "code",
                        label: "Code",
                        mobileLevel: "p",
                    },
                    {
                        id: "color",
                        label: "Projektfarbe",
                        mobileLevel: "colorborder",
                    },
                    {
                        id: "total_duration",
                        label: "Erfasste Zeit",
                        mobileLevel: "p",
                        promise: (e: any): Promise<string> => {
                            return formatDuration(e.total_duration).then(result => result + " h");
                        },
                    },
                ],
            }
        },
    })
</script>

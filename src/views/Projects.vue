<template>
    <zeit-list
        v-if="isActive"
        resourceType="Projekte"
        basePath="/projects/"
        searchPlaceholder="Suche nach Name oder Code"
        :service="projectService"
        :fields="fields"
        addResourceLabel="Neues Projekt"
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
        title: "Projekte",
        components: {
            ZeitList,
        },
        data() {
            return {
                isActive: false,
                projectService,
                fields: [
                    {
                        id: "name",
                        label: "Name",
                        formatter: (e: any) => {
                            if (e.highlighted) return '<div class="flex items-center">' + e.name + '<img class="ml-1 h-4 w-4 opacity-50" src="' + new RowIcon(star).icon + '" /></div>';
                            return e.name
                        }
                    },
                    {
                        id: "name",
                        hideDesktop: true,
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
                        formatter: (e: any) => {
                            return '<div style="width: 58px; height: 25px; background: #' + e.color + '" class="rounded" />';
                        }
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

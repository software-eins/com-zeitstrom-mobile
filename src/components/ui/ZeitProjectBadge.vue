<template>
    <div
        v-if="project"
        class="inline-block cursor-default"
    >
        <div
            :style="getStyle()"
            class="inline-block project-badge px-2 py-1"
        >
            <div class="flex">
                <div class="text flex-initial">
                    {{ project.code }}
                </div>
                <div
                    v-if="postfix"
                    class="flex-initial postfix y-align-2 py-2 ml-3 pl-3"
                    :style="getPostfixStyle()"
                >
                    {{ postfix }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .project-badge {
        border-radius: 3px;
        font-size: 80%;
        line-height: 1;
    }
    .project-badge div.text {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .project-badge .postfix {
        border-left: 1px solid;
    }
</style>

<script lang="ts">
    import { colors } from '../../globals/colors';
    import { defineComponent } from 'vue';

    import { Project, projectService } from '../../services/projects';
    import { AxiosResponse } from 'axios';

    export default defineComponent({
        props: {
            projectId: String,
            maxWidth: {
                type: Number,
                default: 200,
            },
            postfix: {
                type: String,
                default: undefined,
            },
        },
        data() {
            return {
                projectService,

                project: undefined as Project|undefined,
                textByBackground: {},
            }
        },
        watch: {
            projectId() {
                this.loadProject();
            },
        },
        methods: {
            getStyle(this: any) {
                return {
                    'background-color': '#' + this.project.color,
                    'color': '#' + (this.textByBackground[this.project.color] || 'ffffff'),
                    'max-width': String(this.maxWidth) + "px",
                };
            },
            getPostfixStyle(this: any) {
                return {
                    'color': '#' + (this.textByBackground[this.project.color] || 'ffffff') + 'aa',
                    'border-color': '#' + (this.textByBackground[this.project.color] || 'ffffff') + '22',
                    'max-width': String(this.maxWidth) + "px",
                };
            },
            loadProject() {
                if (!this.projectId) {
                    this.project = undefined;
                    return
                }

                return this.projectService.retrieve(this.projectId).then((response: AxiosResponse<Project>) => {
                    this.project = response.data;
                });
            }
        },
        mounted(this: any) {
            for (const color of colors) {
                this.textByBackground[color.code] = color.text;
            }

            this.loadProject();
        }
    })
</script>

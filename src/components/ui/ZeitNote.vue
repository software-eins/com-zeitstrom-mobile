<template>
    <div class="relative px-6 py-3">
        <div class="zeit-border sm:rounded-xl" :class="getClasses()"></div>
        <slot></slot>
    </div>
</template>

<style scoped>
    .zeit-border {
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 6px;
    }
</style>

<script lang="ts">
    export default {
        name: "zs-note",
        props: {
            color: { type: String, default: "primary" },
        },
        data() {
            return {
            }
        },
        methods: {
            getClasses(this: any) {
                return [
                    'bg-' + this.color,
                ]
            }
        },
    }
</script>

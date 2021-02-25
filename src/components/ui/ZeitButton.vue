<template>
    <ion-button
        :buttonType="buttonType"
        :color="color"
        :disabled="disabled || isLoading"
        :download="download"
        :expand="expand"
        :fill="fill"
        :href="href"
        :mode="mode"
        :rel="rel"
        :shape="shape"
        :size="size"
        :strong="strong"
        :type="type"
        @click="onClick($event)"
    >
        <slot v-if="!isLoading"></slot>
        <ion-spinner v-if="isLoading" name="dots" class="ml-4"></ion-spinner>

        <template v-slot:end><slot name="end"></slot></template>
        <template v-slot:icon-only><slot name="icon-only"></slot></template>
        <template v-slot:start><slot name="start"></slot></template>
    </ion-button>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    import { IonButton, IonSpinner } from '@ionic/vue';

    export default defineComponent({
        components: {
            IonButton,
            IonSpinner,
        },
        props: {
            isLoading: {
                type: Boolean,
                default: false,
            },
            // These props are copied from https://ionicframework.com/docs/api/button, except of `routerAnimation` and
            // `routerDirection` which are causing a weird bug when proxied.
            buttonType: {
                type: String,
                default: 'button',
            },
            color: {
                type: String,
                default: 'primary',
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            download: {
                type: String,
                default: undefined,
            },
            expand: {
                type: String,
                default: undefined,
            },
            fill: {
                type: String,
                default: undefined,
            },
            href: {
                type: String,
                default: null,
            },
            mode: {
                type: String,
                default: undefined,
            },
            rel: {
                type: String,
                default: undefined,
            },
            // routerAnimation: {
            //     type: String,
            //     default: undefined,
            // },
            // routerDirection: {
            //     type: String,
            //     default: 'forward',
            // },
            shape: {
                type: String,
                default: undefined,
            },
            size: {
                type: String,
                default: undefined,
            },
            strong: {
                type: Boolean,
                default: false,
            },
            type: {
                type: String,
                default: 'button',
            },
        },
        methods: {
            onClick(ev: Event) {
                this.$emit("click", ev);
            },
        },
    });
</script>

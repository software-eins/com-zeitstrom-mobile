<template>
    <ion-button
        v-if="isMobile"
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
    <button
        v-else
        :disabled="disabled || isLoading"
        type="submit"
        class="border border-transparent rounded-md py-2 px-4 inline-flex justify-center text-sm font-medium relative focus:outline-none focus:ring-primary focus:ring-2 focus:ring-offset-2"
        :class="getDesktopStyling()"
    >
        <div :class="{'opacity-0': isLoading}"><slot /></div>
        <ion-spinner v-if="isLoading" name="dots" class="absolute mx-auto top-1"></ion-spinner>
    </button>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    import { IonButton, IonSpinner } from '@ionic/vue';

    export default defineComponent({
        components: {
            IonButton,
            IonSpinner,
        },
        inject: [
            "isMobile",
        ],
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
            getDesktopStyling() {
                let classes = [] as Array<string>;

                if (!this.fill || this.fill == 'solid') {
                    classes = classes.concat(["shadow-sm", "hover:shadow-md"]);

                    if (this.color == 'primary') classes = classes.concat(["bg-primary", "text-white"]);
                    if (this.color == 'light') classes = classes.concat(["bg-gray-200", "text-gray-800"]);
                    if (this.color == 'success') classes = classes.concat(["bg-green-600", "text-white"]);

                    if (this.disabled || this.isLoading) classes = classes.concat(["bg-opacity-60"])
                    else if (this.color == 'primary') classes = classes.concat(["hover:bg-primary-dark"])
                    else if (this.color == 'light') classes = classes.concat(["hover:bg-gray-300"]);
                    else if (this.color == 'success') classes = classes.concat(["hover:bg-green-700"]);
                }

                if (this.fill == 'clear' || this.fill == 'outline') {
                    classes = classes.concat(["hover:bg-opacity-20", "hover:shadow-sm"]);
                    if (this.color == 'primary') classes = classes.concat(["text-primary", "hover:bg-primary"]);
                    if (this.color == 'light') classes = classes.concat(["text-gray-600", "hover:bg-gray-400"]);
                    if (this.color == 'success') classes = classes.concat(["text-green-600", "hover:bg-green-600"]);
                }

                if (this.fill == 'outline') {
                    if (this.color == 'primary') classes = classes.concat(["border-solid", "border", "border-primary"]);
                    if (this.color == 'light') classes = classes.concat(["border-solid", "border", "border-gray-600",]);
                    if (this.color == 'success') classes = classes.concat(["border-solid", "border", "border-green-600",]);
                }

                return classes;
            }
        },
    });
</script>

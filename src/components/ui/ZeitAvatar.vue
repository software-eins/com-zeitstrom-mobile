<template>
    <div class="avatar flex items-center justify-center" :style="getStyle()">
        {{ userInitials }}
    </div>
</template>

<style scoped>
    .avatar {
        color: white;
        border-radius: 50%;
        overflow: hidden;
        line-height: 1;
        font-weight: 600;
    }
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        account: Object,
        size: {
            type: String,
            default: '48px',
        },
        fontSize: {
            type: String,
            default: '24px',
        },
    },
    computed: {
        userInitials() {
            let result = "";
            for (const namePart of this.account!.full_name.split(" ")) result += namePart[0];
            return result
        }
    },
    methods: {
        stringToHslColor(id: string, s: number, l: number) {
            let hash = 0;
            for (let i = 0; i < id.length; i++) {
                hash = id.charCodeAt(i) + ((hash << 5) - hash);
            }

            const h = hash % 360;
            return 'hsl('+h+', '+s+'%, '+l+'%)';
        },
        getStyle() {
            return {
                width: this.size,
                height: this.size,
                'font-size': this.fontSize,
                background: this.stringToHslColor(this.account!.id, 30, 70),
            }
        }
    }
});
</script>

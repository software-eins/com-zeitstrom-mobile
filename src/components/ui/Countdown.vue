<template>
    <div :style="getDimensions()" class="flex items-center justify-center" style="position: relative;">
        <svg
            :height="radius * 2"
            :width="radius * 2"
            style="position: absolute"
        >
            <circle
                stroke="#666"
                fill="transparent"
                class="progress-ring__circle"
                :class="[remainingSeconds < seconds + 1 ? 'progress-ring__circle__transition' : '']"
                :stroke-dasharray="circumference + ' ' + circumference"
                :style="{ strokeDashoffset: strokeDashoffset() }"
                :stroke-width="stroke"
                :r="normalizedRadius"
                :cx="radius"
                :cy="radius"
            />
        </svg>
    </div>
</template>

<script>
    export default {
        name: 'Countdown',

        props: {
            radius: {
                type: Number,
                default: 250,
            },
            stroke: {
                type: Number,
                default: 6,
            },
            seconds: {
                type: Number,
                default: 10,
            },
            repeat: {
                type: Boolean,
                default: false,
            }
        },
        emits: ["zero"],
        data() {
            const normalizedRadius = this.radius - this.stroke * 2;
            const circumference = normalizedRadius * 2 * Math.PI;

            return {
                normalizedRadius,
                circumference,

                zeroEmitted: false,

                remainingSeconds: null,
                interval: null,
            };
        },

        methods: {
            progress() {
                const remaining = Math.max(this.remainingSeconds - 1, 0);
                return remaining / this.seconds * 100;
            },
            strokeDashoffset() {
                return this.circumference - this.progress() / 100 * this.circumference;
            },
            getDimensions() {
                return {
                    width: (this.radius * 2) + "px",
                    height: (this.radius * 2) + "px",
                }
            },
        },

        mounted() {
            this.remainingSeconds = this.seconds + 1;

            this.interval = setInterval(function() {
                if (this.remainingSeconds == 0 && !this.zeroEmitted) {
                    this.$emit("zero");
                    this.zeroEmitted = true;
                }
                if (this.remainingSeconds == 0 && this.repeat) {
                    this.zeroEmitted = false;
                    this.remainingSeconds = this.seconds + 2;
                }
                this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
                this.$forceUpdate();
            }.bind(this), 1000);

            setTimeout(function() {
                this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
                this.$forceUpdate();
            }.bind(this), 10);
        },

        beforeUnmount() {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
</script>

<style scoped>
    .progress-ring__circle__transition {
        transition: 1s stroke-dashoffset linear;
    }

    .progress-ring__circle {
        transform: scaleX(-1) rotate(-90deg);
        transform-origin: 50% 50%;
    }

    .countdown {
        text-align: center;
    }
</style>

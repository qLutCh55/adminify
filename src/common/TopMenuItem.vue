<template>
    <div>
        <template v-if="item.type == 'button'">
            <v-tooltip
                bottom
                v-if="typeof item.label !== 'undefined' && item.label !== ''"
            >
                <template v-slot:activator="{ on }">
                    <v-btn
                        v-on="on"
                        @click.stop="doItemAction"
                        :disabled="isDisabled"
                        :color="item.color"
                        :class="item.textColor + '--text'"
                    >
                        {{ item.text }}
                    </v-btn>
                </template>
                <span>
                    {{ item.label }}
                </span>
            </v-tooltip>
            <v-btn
                v-else
                @click.stop="doItemAction"
                :disabled="isDisabled"
                :color="item.color"
                :class="item.textColor + '--text'"
            >
                {{ item.text }}
            </v-btn>
        </template>
        <template v-else-if="item.type == 'icon'">
            <v-tooltip
                bottom
                v-if="typeof item.label !== 'undefined' && item.label !== ''"
            >
                <template v-slot:activator="{ on }">
                    <v-btn
                        v-on="on"
                        icon
                        :disabled="isDisabled"
                        @click.stop="doItemAction"
                    >
                        <v-icon
                            :color="item.color"
                        >
                            {{ item.icon }}
                        </v-icon>
                    </v-btn>
                </template>
                <span>
                {{ item.label }}
            </span>
            </v-tooltip>
            <v-btn
                v-else
                icon
                :disabled="isDisabled"
                @click.stop="doItemAction"
            >
                <v-icon
                    :color="item.color"
                >
                    {{ item.icon }}
                </v-icon>
            </v-btn>
        </template>
        <template v-else-if="item.type == 'text'">
        <span
            class="body-1"
            :class="item.color + '--text'"
        >
            {{ item.text }}
        </span>
        </template>
    </div>
</template>
<script>
    export default {
        name: 'Top-Menu-Item',
        data() {
            return {}
        },
        props: ['item'],
        computed: {
            isDisabled() {
                return !!(typeof this.item.route !== 'undefined' && this.item.route && this.$route.path == this.item.route);
            }
        },
        methods: {
            doItemAction() {
                if (typeof this.item.eventName !== 'undefined' && this.item.eventName) {
                    Event.fire(this.item.eventName);
                }

                if (typeof this.item.route !== 'undefined' && this.item.route && this.$route.path !== this.item.route) {
                    this.$router.push(this.item.route);
                }
            }
        }
    }
</script>

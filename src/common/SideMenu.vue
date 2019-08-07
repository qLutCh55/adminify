<template>
    <v-navigation-drawer
        mobile-break-point="1380"
        width="250"
        class="blue-grey darken-4"
        dark
        :mini-variant="miniVariant"
        v-model="drawer"
        app
    >
        <v-toolbar flat class="transparent">
            <v-list class="pa-0" :class="{'list-border-bottom' : miniVariant}">
                <v-list-tile>
                    <v-list-tile-avatar v-if="!miniVariant">
                        <v-icon color="orange">
                            mdi-hubspot
                        </v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content v-if="!miniVariant">
                        <v-list-tile-title>{{ applicationName }}<sup class="sub-caption">TM</sup></v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon @click.stop="miniVariant = !miniVariant">
                            <v-icon v-html="miniVariant ? 'mdi-chevron-right' : 'mdi-chevron-left'"></v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-toolbar>
        <v-divider></v-divider>


        <template v-for="(menuItem, index) in menu">
            <v-list dense subheader :class="{'list-border-bottom' : miniVariant}" :key="index">
                <v-subheader>{{ menuItem.heading.toUpperCase() }}</v-subheader>
                <v-tooltip right :disabled="!miniVariant" v-for="(menuChild, childIndex) in menuItem.children"
                           :key="childIndex">
                    <v-list-tile
                        :to="menuChild.path"
                        exact
                        slot="activator"
                    >
                        <v-list-tile-action>
                            <v-icon>{{ menuChild.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ menuChild.name }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <span
                        v-if="miniVariant && typeof menuChild.miniName !== 'undefined'">{{ menuChild.miniName }}</span>
                    <span v-else>{{ menuChild.name }}</span>
                </v-tooltip>
            </v-list>

            <v-divider></v-divider>
        </template>
    </v-navigation-drawer>
</template>
<script>
    import menu from '../../../../resources/js/menu';

    export default {
        name: 'Menu',
        data() {
            return {
                menu: menu
            }
        },
        computed: {
            miniVariant: {
                set(value) {
                    this.$store.commit('application/setMiniVariantStatus', value);
                },
                get() {
                    return this.$store.getters['application/getMiniVariantStatus'];
                }
            },
            drawer: {
                set(value) {
                    this.$store.commit('application/setDrawerStatus', value);
                },
                get() {
                    return this.$store.getters['application/getDrawerStatus'];
                }
            },
            applicationName() {
                return this.$store.getters['application/getApplicationName'];
            }
        }
    }
</script>

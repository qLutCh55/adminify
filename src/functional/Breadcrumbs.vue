<template>
    <v-container
            fluid
            grid-list-lg
            class="pa-0"
            v-if="breadcrumbs.length"
    >
        <v-layout>
            <v-flex xs12>
                <v-breadcrumbs
                        divider="/"
                        :items="breadcrumbs"
                        v-if="!dashboard"
                        class="pb-0"
                >
                    <template
                            slot="item"
                            slot-scope="props"
                    >
                        <li>
                            <router-link
                                    :to="props.item.link"
                                    :class="[props.item.disabled && 'v-breadcrumbs__item--disabled'] + ' v-breadcrumbs__item'"
                                    :disabled="props.item.disabled">
                                {{ props.item.text }}
                            </router-link>
                        </li>
                    </template>
                </v-breadcrumbs>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
    export default {
        data() {
            return {
                pageTitle: null,
                breadcrumbs: [],
                dashboard: true,
            }
        },
        mounted() {
            this.setTitle();
            this.setBreadcrumbs();
            this.checkIfRouteDashboard();
        },
        computed: {
            lastRouteDisabledBreadcrumbs() {
                let lastRouteIndex = 1;

                if (this.lastAndSecondLastRouteAreTheSame) {
                    lastRouteIndex = 2;
                }

                let lastRoute = this.$route.matched[this.$route.matched.length - lastRouteIndex];
                return !!(
                    typeof lastRoute.meta.breadcrumb == 'undefined' ||
                    (typeof lastRoute.meta.breadcrumb !== 'undefined' && !lastRoute.meta.breadcrumb)
                );
            },
            lastAndSecondLastRouteAreTheSame() {
                if (this.$route.matched.length > 1) {
                    let lastRoute = this.$route.matched[this.$route.matched.length - 1];
                    let secondLastRoute = this.$route.matched[this.$route.matched.length - 2];

                    if (this.trimRight(lastRoute.path, '/') === secondLastRoute.path) {
                        return true;
                    }
                }

                return false;
            }
        },
        methods: {
            setTitle() {
                if (typeof this.$route.meta === 'string') {
                    this.pageTitle = this.$route.meta;
                } else if (typeof this.$route.name === 'string') {
                    this.pageTitle = this.$route.name;
                } else {
                    this.pageTitle = null;
                    console.error('No title set for path [%s]', this.$route.path);
                }
            },
            setBreadcrumbs() {
                if (this.lastRouteDisabledBreadcrumbs) {
                    this.breadcrumbs = [];
                    return;
                }

                for (var i = 0; i < this.$route.matched.length; i++) {
                    let route = this.$route.matched[i];

                    if (i !== (this.$route.matched.length - 1) && route.meta.breadcrumb) {
                        let link = route.path;

                        if (link == "") {
                            link = "/";
                        }

                        // Replacing all the :id in route with the correct keys
                        let keys = new RegExp(route.regex).exec(route.path);
                        if (keys.length > 1) {
                            for (var k = 0; k < keys.length; k++) {
                                if (k !== 0) {
                                    link = link.replace(keys[k], this.$route.params[keys[k].replace(':', '')]);
                                }
                            }
                        }

                        let disabled = false;

                        if (i == (this.$route.matched.length - 2)) {
                            disabled = true;
                        }


                        let breadcrumb = {
                            text: route.meta.breadcrumb,
                            disabled: disabled,
                            link: link
                        };

                        this.breadcrumbs.push(breadcrumb);
                    }
                }
            },
            checkIfRouteDashboard() {
                if (this.$router.currentRoute.name == 'Dashboard') {
                    this.dashboard = true;
                } else {
                    this.dashboard = false;
                }
            },
            trimRight(string, charlist) {
                if (charlist === undefined) {
                    charlist = "\s";
                }

                return string.replace(new RegExp("[" + charlist + "]+$"), "");
            }
        },
        name: 'Breadcrumb',
        watch: {
            '$route'() {
                this.setTitle();
                this.breadcrumbs = [];
                this.setBreadcrumbs();
                this.checkIfRouteDashboard();
            }
        },
    }
</script>
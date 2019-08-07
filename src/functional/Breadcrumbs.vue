<template>
    <v-container fluid grid-list-lg class="pb-0">
        <v-layout row wrap>
            <v-flex xs12>
                <h3 class="display-1 mb-3">{{ pageTitle }}</h3>
                <v-breadcrumbs divider="/" :items="breadcrumbs" class="pa-0" v-if="!dashboard">
                    <template slot="item" slot-scope="props">
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
                for (var i = 0; i < this.$route.matched.length; i++) {
                    if (i !== (this.$route.matched.length - 1) && this.$route.matched[i].meta.breadcrumb) {
                        let link = this.$route.matched[i].path;

                        if (link == "") {
                            link = "/";
                        }

                        // Replacing all the :id in route with the correct keys
                        let keys = new RegExp(this.$route.matched[i].regex).exec(this.$route.matched[i].path);
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

                        this.breadcrumbs.push({
                            text: this.$route.matched[i].meta.breadcrumb,
                            disabled: disabled,
                            link: link
                        });
                    }
                }
            },
            checkIfRouteDashboard() {
                if (this.$router.currentRoute.name == 'Dashboard') {
                    this.dashboard = true;
                } else {
                    this.dashboard = false;
                }
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
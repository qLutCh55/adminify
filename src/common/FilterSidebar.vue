<template>
    <v-navigation-drawer
            temporary
            :right="right"
            v-model="filterDrawer"
            fixed
            app
            width="300"
    >
        <v-toolbar
            flat
            dark
            class="primary"
        >
            <v-toolbar-title>Filters</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
                icon
                @click.stop="toggleFilterDrawer"
            >
                <v-icon>$mdiClose</v-icon>
            </v-btn>
        </v-toolbar>
        <v-list subheader dense>
            <v-subheader>All filters</v-subheader>

            <v-list-group
                    :value="isFirstFilter(index)"
                    v-for="(filter, index) in filters"
                    :key="component + index"
            >
                <v-list-item slot="activator">
                    <v-list-item-title
                        v-if="typeof filter.label !== 'undefined'"
                    >
                        {{ filter.label }}
                    </v-list-item-title>
                    <v-list-item-title
                        v-else
                    >
                        {{ getFilterTypeLabel(filter.type) }}
                    </v-list-item-title>
                </v-list-item>

                <template v-for="item in filter.data">
                    <v-list-item>
                        <v-list-item-action>
                            <v-checkbox
                                    color="primary"
                                    @change="toggleFilter(filter.type, item.id)"
                                    :input-value="!! isFilterActive(filter.type, item.id)"
                                    value
                            ></v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>
                                {{ item.name }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </template>

            </v-list-group>

        </v-list>
    </v-navigation-drawer>
</template>

<script>
    export default {
        name: 'FilterSidebar',
        data() {
            return {
                right: true,
                component: true,
            }
        },
        watch: {
            'filtersReset'() {
                this.reloadComponent();
            },
        },
        methods: {
            toggleFilterDrawer() {
                this.$store.commit('application/setFilterDrawerStatus', !this.$store.getters['application/getFilterDrawerStatus']);
            },
            isFirstFilter(index) {
                if (index == 0) {
                    return true;
                }
                return false;
            },
            toggleFilter(filterType, filterId) {
                let filter = {
                    type: filterType,
                    id: filterId
                };
                this.$store.dispatch('application/toggleFilter', filter);
            },
            reloadComponent() {
                this.component = !this.component;
            },
            isFilterActive(filterType, filterId) {
                let selectedFilters = this.$store.getters['application/getSelectedFilters'];

                return (selectedFilters.hasOwnProperty(filterType) && selectedFilters[filterType].indexOf(filterId) >= 0);
            },
            getFilterTypeLabel(label) {
                return this.ucfirst(label.replace(/([A-Z])/g, " $1").toLowerCase());
            }
        },
        computed: {
            filters() {
                return this.$store.getters['application/getFilters'];
            },
            filterDrawer: {
                set(value) {
                    this.$store.commit('application/setFilterDrawerStatus', value);
                },
                get() {
                    return this.$store.getters['application/getFilterDrawerStatus'];
                }
            },
            filtersReset() {
                return this.$store.getters['application/areFiltersReset'];
            }
        },
        mounted() {
        }
    }
</script>


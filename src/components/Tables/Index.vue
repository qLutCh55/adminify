<template>
    <v-container fluid grid-list-lg>
        <v-layout row wrap>
            <v-flex xs12>
                <v-slide-y-transition mode="out-in">
                    <v-card>
                        <v-card-title dark class="primary white--text">

                            <v-btn color="white" @click.native="triggerCreateEvent" v-if="createButton">
                                <span v-if="createButtonText">
                                    {{ createButtonText }}
                                </span>
                                <span v-else>
                                    New {{ ucfirst(singleItemName) }}
                                </span>
                            </v-btn>


                            <div class="text--white text-uppercase subheading font-weight-medium pa-2">
                                {{ totalItems }}
                                <span v-if="totalItems === 1">Result</span>
                                <span v-else>Results</span>
                            </div>

                            <v-spacer></v-spacer>

                            <div :class="{'searching--closed': !searching}" class="searching">
                                <v-text-field
                                    :id="this.singleItemName +'-search'"
                                    v-model="searchQuery"
                                    append-icon="mdi-close"
                                    @click:append="searchEnd"
                                    placeholder="Search"
                                    hide-details
                                    :autocomplete="'new-password'"
                                    solo
                                ></v-text-field>
                            </div>

                            <v-btn icon dark @click.native.stop="searchBegin" v-if="searchButton">
                                <v-icon>mdi-magnify</v-icon>
                            </v-btn>

                            <v-btn icon dark @click.native.stop="clearFilters" v-if="filterButton && filterCount > 0">
                                <v-icon>mdi-filter-remove-outline</v-icon>
                            </v-btn>

                            <v-btn icon dark @click.native.stop="toggleFilterDrawer" v-if="filterButton">
                                <v-badge
                                    color="error"
                                    left
                                    overlap
                                >
                                    <span slot="badge" v-if="filterCount !== 0">{{ filterCount }}</span>
                                    <v-icon>mdi-filter-variant</v-icon>
                                </v-badge>
                            </v-btn>

                            <v-btn icon dark @click.native.stop="fetchData" v-if="refreshButton">
                                <v-icon>mdi-autorenew</v-icon>
                            </v-btn>

                        </v-card-title>
                        <v-data-table
                            class="elevation-1"
                            :headers="headers"
                            :items="items"
                            :pagination.sync="pagination"
                            :total-items="totalItems"
                            :loading="fetching"
                            :rowsPerPageItems="[15,20,25]">
                            <template slot="items" slot-scope="props">
                                <slot name="row" v-bind:item="props.item"></slot>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-slide-y-transition>
            </v-flex>
        </v-layout>
        <slot></slot>
    </v-container>
</template>
<script>
    export default {
        data() {
            return {
                searching: false,
                totalItems: 0,
                items: [],
                fetching: true,
                timeout: null,
                pagination: {
                    descending: false,
                    page: 1,
                    rowsPerPage: 15,
                    sortBy: null,
                    totalItems: 0,
                },

                deleteDialog: false,
                deleteWaiting: false,
                deleteItem: null,
            }
        },
        name: 'Index-Table',
        props: {
            'single-item-name': {
                type: String,
                required: true
            },
            'plural-item-name': {
                type: String,
                required: true
            },

            'data-url': {
                type: String,
                default: null
            },

            'headers': {
                type: Array,
                default: () => ([])
            },

            'create-button': {
                type: Boolean,
                default: false
            },
            'create-button-text': {
                type: String,
                default: ''
            },

            'search-button': {
                type: Boolean,
                default: true
            },

            'refresh-button': {
                type: Boolean,
                default: true
            },

            'filter-button': {
                type: Boolean,
                default: false
            },

            'force-refresh': {
                type: Boolean,
                default: false
            },
        },
        computed: {
            filter() {
                return this.$store.getters['application/getCombinedFilter'];
            },
            filterCount() {
                return this.$store.getters['application/getSelectedFiltersCount'];
            },
            searchQuery: {
                set(value) {
                    this.$store.dispatch('application/setSearchQuery', value);
                },
                get() {
                    return this.$store.getters['application/getSearchQuery'];
                }
            }
        },
        watch: {
            'searchQuery'() {
                if (!this.fetching) {
                    this.fetchDataDelayed();
                }
                this.setQueryParameter(this.searchQuery);
            },
            'filterCount'() {
                this.fetchDataDelayed();
            },
            'forceRefresh'() {
                if (!this.fetching) {
                    this.fetchData();
                }
            },
            'pagination'() {
                if (!this.fetching) {
                    this.fetchData();
                }
            },
        },
        mounted() {
            this.checkUrlForParams();
            this.createItem = this.createObject;
        },
        methods: {
            fetchDataDelayed() {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.fetchData();
                }, 1000);
            },
            fetchData() {
                this.fetching = true;

                const {sortBy, descending, page, rowsPerPage} = this.pagination;

                this.setPageParameter(page);

                this.setSortByParameter(sortBy, descending);

                this.setRowsPerPageParameter(rowsPerPage);

                let url = '/' + this.pluralItemName + '/searchPaginated';

                if (this.dataUrl) {
                    url = this.dataUrl;
                }

                window.axios.post(url + '?page=' + page, {
                    filter: this.filter,
                    itemsPerPage: rowsPerPage,
                    sortBy: sortBy,
                    descending: descending,
                }).then(response => {
                    this.items = response.data[this.pluralItemName].data;
                    this.totalItems = response.data[this.pluralItemName].total;
                    this.fetching = false;
                });
            },

            checkUrlForParams() {
                let url = new window.domurl;

                if (typeof url.query.page !== 'undefined') {
                    this.pagination.page = parseInt(url.query.page);
                }

                if (typeof url.query.q !== 'undefined') {
                    this.searchQuery = url.query.q;
                    this.searching = true;
                }

                if (typeof url.query.sortBy !== 'undefined') {
                    this.pagination.sortBy = url.query.sortBy;
                }

                if (typeof url.query.descending !== 'undefined') {
                    this.pagination.descending = url.query.descending;
                }

                if (typeof url.query.rows !== 'undefined') {
                    this.pagination.rowsPerPage = Number(url.query.rows);
                }

                let definitions = url.decode(url.query.toString()).split('&');
                this.$store.dispatch('application/massToggleFilters', definitions).then(response => {
                    this.fetchData();
                });
            },

            setPageParameter(page) {
                let url = new window.domurl;
                url.query.page = page;
                history.replaceState({path: url.decode(url.toString())}, '', url.decode(url.toString()));
            },
            setSortByParameter(sortBy, descending) {
                let url = new window.domurl;
                url.query.sortBy = sortBy;
                if (sortBy) {
                    url.query.descending = descending;
                } else {
                    delete url.query.descending;
                }
                history.replaceState({path: url.decode(url.toString())}, '', url.decode(url.toString()));
            },
            setRowsPerPageParameter(rowsPerPage) {
                let url = new window.domurl;
                url.query.rows = rowsPerPage;
                history.replaceState({path: url.decode(url.toString())}, '', url.decode(url.toString()));
            },
            setQueryParameter(query) {
                let url = new window.domurl;
                if (query !== '') {
                    url.query.q = query;
                } else {
                    delete url.query.q;
                }
                history.replaceState({path: url.decode(url.toString())}, '', url.decode(url.toString()));
            },

            searchBegin() {
                this.searching = true;
                setTimeout(() => document.querySelector('#' + this.singleItemName + '-search').focus(), 50)
            },
            searchEnd() {
                this.searching = false;
                this.searchQuery = '';
                document.querySelector('#' + this.singleItemName + '-search').blur();
            },

            toggleFilterDrawer() {
                this.$store.commit('application/setFilterDrawerStatus', !this.$store.getters['application/getFilterDrawerStatus']);
            },
            clearFilters() {
                this.$store.dispatch('application/resetFilters');
            },

            triggerCreateEvent() {
                this.$emit('create');
            },
        },
    }
</script>

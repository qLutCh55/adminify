<template>
    <v-container
        fluid
        grid-list-lg
    >
        <v-layout wrap>
            <v-flex xs12>
                <v-slide-y-transition mode="out-in">
                    <v-card>
                        <v-card-title
                            dark
                            class="primary white--text pa-4"
                        >
                            <v-btn
                                color="white"
                                @click.native="triggerCreateEvent"
                                v-if="createButton"
                            >
                                <span v-if="createButtonText">
                                    {{ createButtonText }}
                                </span>
                                <span v-else>
                                    New {{ ucfirst(singleItemName) }}
                                </span>
                            </v-btn>


                            <div class="text--white text-uppercase subtitle-1 font-weight-medium px-3">
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

                            <v-btn
                                icon
                                dark
                                @click.native.stop="searchBegin"
                                v-if="searchButton"
                            >
                                <v-icon>mdi-magnify</v-icon>
                            </v-btn>

                            <v-btn
                                icon
                                dark
                                @click.native.stop="clearFilters"
                                v-if="filterButton && filterCount > 0"
                            >
                                <v-icon>mdi-filter-remove-outline</v-icon>
                            </v-btn>

                            <v-btn
                                icon
                                dark
                                @click.native.stop="toggleFilterDrawer"
                                v-if="filterButton"
                            >
                                <v-badge
                                    color="error"
                                    left
                                    overlap
                                >
                                    <span
                                        slot="badge"
                                        v-if="filterCount !== 0"
                                    >
                                        {{ filterCount }}
                                    </span>
                                    <v-icon>mdi-filter-variant</v-icon>
                                </v-badge>
                            </v-btn>

                            <slot name="additional-buttons"></slot>

                            <v-btn
                                icon
                                dark
                                @click.native.stop="fetchData"
                                v-if="refreshButton"
                            >
                                <v-icon>mdi-autorenew</v-icon>
                            </v-btn>

                        </v-card-title>
                        <v-data-table
                            class="elevation-1"
                            :headers="headers"
                            :items="items"
                            :options.sync="options"
                            :server-items-length="totalItems"
                            :loading="fetching"
                            :footer-props="{
                                'items-per-page-options': $store.getters['application/getPerPage']
                            }"
                            multi-sort
                        >
                            <template v-slot:body="{ items }">
                                <tbody>
                                <template v-for="(item, index) in items">
                                    <slot name="row" v-bind:item="item"></slot>
                                </template>
                                </tbody>
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

                options: {
                    groupBy: [],
                    groupDesc: [],
                    itemsPerPage: 25,
                    multiSort: false,
                    mustSort: false,
                    page: 1,
                    sortBy: [],
                    sortDesc: [],
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
            'options'() {
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

                this.setPageParameter(this.options.page);

                this.setSortByParameter(this.options.sortBy, this.options.sortDesc);

                this.setItemsPerPageParameter(this.options.itemsPerPage);

                let url = '/' + this.pluralItemName + '/searchPaginated';

                if (this.dataUrl) {
                    url = this.dataUrl;
                }

                window.axios.post(url + '?page=' + this.options.page, {
                    filter: this.filter,
                    itemsPerPage: this.options.itemsPerPage,
                    sortBy: this.options.sortBy,
                    sortDesc: this.options.sortDesc,
                }).then(response => {
                    this.items = response.data[this.pluralItemName].data;
                    this.totalItems = response.data[this.pluralItemName].total;
                    this.fetching = false;
                });
            },

            checkUrlForParams() {
                let url = new window.domurl;

                if (typeof url.query.page !== 'undefined') {
                    this.options.page = parseInt(url.query.page);
                }

                if (typeof url.query.q !== 'undefined') {
                    this.searchQuery = url.query.q;
                    this.searching = true;
                }

                if (typeof url.query.sortBy !== 'undefined') {
                    this.options.sortBy = url.query.sortBy.split('|');
                }

                if (typeof url.query.descending !== 'undefined') {
                    this.options.sortDesc = url.query.descending.split('|');
                }

                if (typeof url.query.rows !== 'undefined') {
                    this.options.itemsPerPage = Number(url.query.rows);
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

                if (sortBy.length) {
                    url.query.sortBy = sortBy.join('|');
                    url.query.descending = descending.join('|');
                } else {
                    delete url.query.sortBy;
                    delete url.query.descending;
                }

                history.replaceState({path: url.decode(url.toString())}, '', url.decode(url.toString()));
            },
            setItemsPerPageParameter(itemsPerPage) {
                let url = new window.domurl;
                url.query.rows = itemsPerPage;
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

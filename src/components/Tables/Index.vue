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
                                <span v-if="totalItems === 1">{{ useItemNameForResults ? ucfirst(singleItemName) : "Result" }}</span>
                                <span v-else>{{ useItemNameForResults ? ucfirst(pluralItemName) : "Results" }}</span>
                            </div>
                            
                            <v-spacer></v-spacer>
                            
                            <div
                                :class="{'searching--closed': !searching}"
                                class="searching"
                            >
                                <v-text-field
                                    :id="this.singleItemName +'-search'"
                                    v-model="searchQuery"
                                    append-icon="$mdiClose"
                                    @click:append="searchEnd"
                                    placeholder="Search"
                                    hide-details
                                    :autocomplete="'new-password'"
                                    solo
                                ></v-text-field>
                            </div>
                            
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        icon
                                        dark
                                        @click.native.stop="searchBegin"
                                        v-if="searchButton"
                                        v-on="on"
                                    >
                                        <v-icon>$mdiMagnify</v-icon>
                                    </v-btn>
                                </template>
                                <span>Search</span>
                            </v-tooltip>
                            
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        v-show="sortingCount"
                                        icon
                                        dark
                                        @click.native.stop="clearSorting"
                                        v-on="on"
                                    >
                                        <v-icon>$mdiSortVariantRemove</v-icon>
                                    </v-btn>
                                </template>
                                <span>Clear sorting</span>
                            </v-tooltip>
                            
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        icon
                                        dark
                                        @click.native.stop="clearFilters"
                                        v-show="filterButton && filterCount > 0"
                                        v-on="on"
                                    >
                                        <v-icon>$mdiFilterRemoveOutline</v-icon>
                                    </v-btn>
                                </template>
                                <span>Clear filters</span>
                            </v-tooltip>
                            
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        icon
                                        dark
                                        @click.native.stop="toggleFilterDrawer"
                                        v-if="filterButton"
                                        v-on="on"
                                    >
                                        <v-badge
                                            :value="filterCount !== 0"
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
                                            <v-icon>$mdiFilterVariant</v-icon>
                                        </v-badge>
                                    </v-btn>
                                </template>
                                <span>Filters</span>
                            </v-tooltip>
                            
                            <slot name="additional-buttons"></slot>
                            
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        icon
                                        dark
                                        @click.native.stop="fetchData"
                                        v-if="refreshButton"
                                        v-on="on"
                                    >
                                        <v-icon>$mdiAutorenew</v-icon>
                                    </v-btn>
                                </template>
                                <span>Refresh</span>
                            </v-tooltip>
                        
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
                                    <slot
                                        name="row"
                                        v-bind:item="item"
                                    ></slot>
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
                
                previousQuery: '',
                
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
    
            'use-item-name-for-results': {
                type: Boolean,
                default: false
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
            sortingCount() {
                return this.options.groupBy.length || this.options.groupDesc.length || this.options.sortBy.length || this.options.sortDesc.length;
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
                this.$emit('optionsChanged', this.options);
            },
        },
        mounted() {
            this.checkUrlForParams();
            this.setupWebsocket(this.pluralItemName, this.fetchData);
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
                
                if (this.filter.searchQuery !== this.previousQuery) {
                    this.options.page = 1;
                }
                
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
                    
                    this.previousQuery = this.filter.searchQuery;
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
                
                if (typeof url.query.sortDesc !== 'undefined') {
                    let sortDesc = url.query.sortDesc.split('|');
                    this.options.sortDesc = sortDesc.map((value) => {
                        if (value == 'true') {
                            return true;
                        } else {
                            return false;
                        }
                    });
                }
                
                if (typeof url.query.itemsPerPage !== 'undefined') {
                    this.options.itemsPerPage = Number(url.query.itemsPerPage);
                }
                
                let definitions = url.decode(url.query.toString()).split('&');
                this.$store.dispatch('application/massToggleFilters', definitions).then(response => {
                    this.fetchData();
                });
            },
            
            setPageParameter(page) {
                let url = new window.domurl;
                url.query.page = page;
                history.replaceState({path: url.toString()}, '', url.toString());
            },
            setSortByParameter(sortBy, sortDesc) {
                let url = new window.domurl;
                
                if (sortBy.length) {
                    url.query.sortBy = sortBy.join('|');
                    url.query.sortDesc = sortDesc.join('|');
                } else {
                    delete url.query.sortBy;
                    delete url.query.sortDesc;
                }
                
                history.replaceState({path: url.toString()}, '', url.toString());
            },
            setItemsPerPageParameter(itemsPerPage) {
                let url = new window.domurl;
                url.query.itemsPerPage = itemsPerPage;
                history.replaceState({path: url.toString()}, '', url.toString());
            },
            setQueryParameter(query) {
                let url = new window.domurl;
                if (query !== '') {
                    url.query.q = query;
                } else {
                    delete url.query.q;
                }
                history.replaceState({path: url.toString()}, '', url.toString());
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
            clearSorting() {
                this.options.groupBy = [];
                this.options.groupDesc = [];
                this.options.sortBy = [];
                this.options.sortDesc = [];
            },
            
            triggerCreateEvent() {
                this.$emit('create');
            },
        },
    }
</script>

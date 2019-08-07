<template>
    <v-card flat class="mt-3">
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
                :headers="headers"
                :items="items"
                :pagination.sync="pagination"
                :total-items="totalItems"
                :expand="true"
                :loading="fetching"
                :rowsPerPageItems="[15,20,25]">
            <template slot="items" slot-scope="props">
                <slot name="row" v-bind:item="props.item"></slot>
            </template>
        </v-data-table>
        <v-create
                :dialog.sync="createDialog"
                :waiting.sync="createWaiting"
                :disabledActions.sync="disableActions"
                :disabledCreateAction.sync="disableCreateAction"
                :title="createDialogTitle"
                :formErrors.sync="createErrors"
                @cancel="cancelCreate"
                @confirm="doCreate"
        >
            <template slot="content">
                <slot name="createForm"></slot>
            </template>
        </v-create>
    </v-card>
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

                createDialog: false,
                createWaiting: false,
                createItem: {},
            }
        },
        name: 'Sub-Index-Table',
        props: {
            'single-item-name': {
                type: String,
                required: true
            },
            'plural-item-name': {
                type: String,
                required: true
            },

            'data-id-parameter': {
                type: String,
                required: true
            },
            'data-url': {
                type: String,
                default: null
            },
            'create-url': {
                type: String,
                default: null
            },
            'create-redirect-url': {
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
            'create-object': {
                type: Object,
                default: () => ({})
            },
            'create-errors': {
                type: Array,
                default: () => ([])
            },
            'create-button-text': {
                type: String,
                default: ''
            },
            'create-dialog-heading': {
                type: String,
                default: ''
            },
            'disable-create-action': {
                type: Boolean,
                default: false
            },
            'disable-actions': {
                type: Boolean,
                default: false
            },

            'search-button': {
                type: Boolean,
                default: true
            },

            'refresh-button': {
                type: Boolean,
                default: true
            },

            'force-refresh': {
                type: Boolean,
                default: false
            },

            'filter-button': {
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
            },
            createDialogTitle() {
                if (this.createDialogHeading) {
                    return this.createDialogHeading;
                } else {
                    return 'Create ' + this.singleItemName;
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
                    id: this.$route.params[this.dataIdParameter],
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

            cancelCreate() {
                this.createDialog = false;
                this.createWaiting = false;
                this.$emit('cancelCreate');
            },
            doCreate() {
                if(!this.createWaiting) {
                    this.createWaiting = true;
                    setTimeout(() => {
                        this.doCreate();
                    }, 1000);
                    return;
                }

                let url = '/' + this.pluralItemName + '/create';
                if (this.createUrl) {
                    url = this.createUrl;
                }

                window.axios.post(url, {[this.singleItemName]: this.createItem}).then(response => {
                    this.$emit('itemCreated');
                    this.$toasted.show(this.ucfirst(this.singleItemName) + " created", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });

                    let url = '/' + this.pluralItemName + '/edit/';
                    if (this.createRedirectUrl) {
                        url = this.createRedirectUrl;
                    }

                    this.$router.push(url + response.data.id);
                    this.cancelCreate();
                });
            },
            triggerCreateEvent() {
                this.$emit('beforeCreate');
                this.createDialog = true
            },
        },
    }
</script>

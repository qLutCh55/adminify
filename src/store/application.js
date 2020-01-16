export default {
    namespaced: true,

    state: {
        name: document.body.getAttribute('data-name'),
        registration_allowed: document.body.getAttribute('data-reg') ? document.body.getAttribute('data-reg') : false,
        social_login: document.body.getAttribute('data-google') ? document.body.getAttribute('data-google') : false,

        drawer: true,
        miniVariant: localStorage.getItem('miniVariant') ? (/true/i).test(localStorage.getItem('miniVariant')) : false,
        filterDrawer: false,
        filters: [],
        selectedFilters: {},
        selectedFiltersCount: 0,
        searchQuery: '',
        clearedFilters: false,

        notifications: 0,
        notificationDrawer: false,

        paginationRowsPerPage: [25, 50, 100],

        leftTopBar: ADMINIFY_LEFT_TOP_MENU,
        rightTopBar: ADMINIFY_RIGHT_TOP_MENU,

        webpSupported: false,
    },

    getters: {
        getApplicationName(state) {
            return state.name;
        },
        getRegistrationStatus(state) {
            return state.registration_allowed;
        },
        getSocialLoginStatus(state) {
            return state.social_login;
        },

        getDrawerStatus(state) {
            return state.drawer;
        },
        getMiniVariantStatus(state) {
            return state.miniVariant;
        },
        getFilterDrawerStatus(state) {
            return state.filterDrawer;
        },
        getNotificationDrawerStatus(state) {
            return state.notificationDrawer;
        },
        getFilters(state) {
            return state.filters.sort((a, b) => (a.type > b.type) ? 1 : ((b.type > a.type) ? -1 : 0));
        },
        getSearchQuery(state) {
            return state.searchQuery;
        },
        getSelectedFilters(state) {
            return state.selectedFilters;
        },
        areFiltersReset(state) {
            return state.clearedFilters;
        },
        getSelectedFiltersCount(state) {
            return state.selectedFiltersCount;
        },
        getCombinedFilter(state) {
            return {
                searchQuery: state.searchQuery,
                filters: state.selectedFilters
            };
        },

        getNotificationsCount(state) {
            return state.notifications;
        },

        getPerPage(state) {
            return state.paginationRowsPerPage;
        },

        getLeftTopBar(state) {
            return state.leftTopBar.sort((a, b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0));
        },
        getRightTopBar(state) {
            return state.rightTopBar.sort((a, b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0));
        },

        getWebpSupport(state) {
            return state.webpSupported;
        }
    },

    actions: {
        changeDrawerStatus(context, status) {
            context.commit('setDrawerStatus', status);
        },
        changeMiniVariantStatus(context, status) {
            context.commit('setMiniVariantStatus', status);
        },
        changeNotificationDrawerStatus(context, status) {
            context.commit('setNotificationDrawerStatus', status);
        },
        changeFilterDrawerStatus(context, status) {
            context.commit('setFilterDrawerStatus', status);
        },
        addToFilters(context, filter) {
            context.commit('setFilter', filter);
        },
        toggleFilter(context, filter) {
            if (typeof context.state.selectedFilters[filter.type] === 'undefined') {
                context.commit('setSelectedFilterArray', filter.type)
            }

            if (context.state.selectedFilters[filter.type].indexOf(filter.id) > -1) {
                context.commit('removeFilter', filter);
            } else {
                context.commit('applyFilter', filter);
            }
            context.dispatch('updateCurrentUrl');
        },
        clearFilters(context) {
            context.commit('clearFilters');
        },
        resetFilters(context) {
            context.commit('resetFilters');
        },
        updateCurrentUrl(context) {
            let params = {};

            let filters = context.state.selectedFilters;
            for (let property in filters) {
                if (filters.hasOwnProperty(property)) {
                    params[property] = filters[property].join(',');
                }
            }

            let url = new window.domurl;

            let query = context.state.searchQuery;
            if (query !== '') {
                url.query.q = query;
            }

            for (let property in params) {
                if (params.hasOwnProperty(property)) {
                    url.query[property] = params[property];
                }
            }

            for (let qParam in url.query) {
                if (url.query.hasOwnProperty(qParam) && url.query[qParam] === '') {
                    delete url.query[qParam];
                }
            }

            window.history.replaceState({path: url.toString()}, '', url.toString());
        },
        massToggleFilters(context, filters) {
            return new Promise((resolve, reject) => {
                for (let i = 0, len = filters.length; i < len; i++) {
                    let parts = filters[i].split('=', 2);

                    let ignoreQueryParams = ['page', 'q', 'itemsPerPage', 'sortDesc', 'sortBy', 'startdate', 'enddate', 'tab'];

                    if (typeof parts[0] !== 'undefined' && !ignoreQueryParams.includes(parts[0]) && typeof parts[1] !== 'undefined' && parts[1] !== '') {
                        let filterName = parts[0];
                        let filterValues = parts[1].split(',');

                        if (typeof context.state.selectedFilters[filterName] === 'undefined') {
                            context.commit('setSelectedFilterArray', filterName)
                        }

                        for (let x = 0, len = filterValues.length; x < len; x++) {

                            let id = filterValues[x];
                            if (id.match(/^[0-9]+$/) !== null) {
                                id = parseInt(id);
                            }

                            let filter = {
                                type: filterName,
                                id: id
                            };

                            context.commit('applyFilter', filter)
                        }
                    }
                }
                resolve();
            });
        },
        setSearchQuery(context, query) {
            context.commit('setSearchQuery', query);
            context.dispatch('updateCurrentUrl');
        },
        getNotificationsCount(context) {
            window.axios.post('/notifications/count', {}).then(response => {
                context.commit('setNotificationsCount', response.data.count);
            });
        },

        disableMainScroll() {
            let htmlElement = document.getElementsByTagName("html")[0];
            htmlElement.setAttribute('data-overflow-hidden', '');
        },
        enableMainScroll() {
            let htmlElement = document.getElementsByTagName("html")[0];
            htmlElement.removeAttribute('data-overflow-hidden');
        },


        addTopBarItem(context, data) {
            let position = 'leftTopBar';
            if (typeof data.position !== 'undefined' && data.position == 'right') {
                position = 'rightTopBar';
            }

            data.position = position;
            context.commit('addItemToTopBar', data);
        },
        updateTopBarItem(context, data) {
            let position = 'leftTopBar';
            if (typeof data.position !== 'undefined' && data.position == 'right') {
                position = 'rightTopBar';
            }

            data.position = position;
            context.commit('updateItemOnTopBar', data);
        },
        removeTopBarItem(context, data) {
            let position = 'leftTopBar';
            if (typeof data.position !== 'undefined' && data.position == 'right') {
                position = 'rightTopBar';
            }

            data.position = position;
            context.commit('removeItemFromTopBar', data);
        },
        resetTopBar(context) {
            context.commit('setTopBarToDefault')
        },

        checkWebpSupport(context) {
            return new Promise((resolve, reject) => {
                const image = new Image();

                image.onerror = (err) => {
                    context.commit('setWebpSupport', false);
                    resolve();
                };
                image.onload = () => {
                    context.commit('setWebpSupport', true);
                    resolve();
                };

                image.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
            });
        },

    },

    mutations: {
        setDrawerStatus(state, status) {
            state.drawer = status;
        },
        setMiniVariantStatus(state, status) {
            state.miniVariant = status;
            localStorage.setItem('miniVariant', status)
        },
        setNotificationDrawerStatus(state, status) {
            if (status) {
                this.dispatch('application/disableMainScroll');
            } else {
                this.dispatch('application/enableMainScroll');
            }
            state.notificationDrawer = status;
        },
        setFilterDrawerStatus(state, status) {
            state.filterDrawer = status;
        },
        setFilter(state, filter) {
            state.filters.push(filter);
        },
        clearFilters(state) {
            state.filters = [];
            state.selectedFilters = {};
            state.selectedFiltersCount = 0;
            state.searchQuery = '';
        },
        resetFilters(state) {
            state.selectedFilters = {};
            state.selectedFiltersCount = 0;
            state.clearedFilters = !state.clearedFilters;

            let page = 1;

            let url = new window.domurl;
            if (typeof url.query.page !== 'undefined') {
                page = parseInt(url.query.page);
            }

            for (let x = 0, len = state.filters.length; x < len; x++) {
                let filter = state.filters[x];

                if (typeof url.query[filter.type] !== 'undefined') {
                    delete url.query[filter.type];
                }
            }

            history.replaceState({path: url.toString()}, '', url.toString());
        },
        setSelectedFilterArray(state, filterName) {
            state.selectedFilters[filterName] = [];
        },
        applyFilter(state, filter) {
            state.selectedFiltersCount++;
            state.selectedFilters[filter.type].push(filter.id);

        },
        removeFilter(state, filter) {
            state.selectedFiltersCount--;
            state.selectedFilters[filter.type].splice(state.selectedFilters[filter.type].indexOf(filter.id), 1);
        },
        setSearchQuery(state, query) {
            state.searchQuery = query;
        },
        setNotificationsCount(state, query) {
            state.notifications = query;
        },

        setTopBarToDefault(state) {
            state.leftTopBar = ADMINIFY_LEFT_TOP_MENU;
            state.rightTopBar = ADMINIFY_RIGHT_TOP_MENU;
        },
        addItemToTopBar(state, data) {
            state[data.position].push(data.item);
        },
        updateItemOnTopBar(state, data) {
            if (typeof data.item.slug !== 'undefined') {
                let topBarItem = state[data.position].find((item) => {
                    return item.slug == data.item.slug;
                });

                if (topBarItem !== 'undefined') {
                    topBarItem.text = data.item.text;
                }
            } else {
                console.error('Slug not defined!');
            }
        },
        removeItemFromTopBar(state, data) {
            if (typeof data.slug !== 'undefined') {
                let topBarItem = state[data.position].find((item) => {
                    return item.slug == data.slug;
                });

                if (topBarItem !== 'undefined') {
                    let updatedTopBar = state[data.position].filter((obj) => {
                        return obj.slug !== data.slug;
                    });

                    state[data.position] = updatedTopBar;
                }
            } else {
                console.error('Slug not defined!');
            }
        },

        setWebpSupport(state, value) {
            state.webpSupported = value;
        }
    }
}

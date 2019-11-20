export default {
    namespaced: true,

    state: {
        roles: [],
        fetching: {},
        users: {
            deletatedIds: [],
            users: [],
            timestamp: null
        },
    },

    getters: {
        getRoles(state) {
            return state.roles;
        },
        getUsers(state) {
            return state.users.users;
        },
        getDelegatedIds(state) {
            return state.users.delegatedIds;
        },
    },

    actions: {
        getResource(context, resource, timeout) {
            if (typeof window.Echo !== 'undefined') {
                if (typeof window[resource + '_listener'] == 'undefined') {
                    window[resource + '_listener'] = true;
                    window.Echo.private('cache-clear').listen('.' + resource.toLowerCase(), (e) => {
                        context.commit('clearResource', resource);
                        context.dispatch('getResource', resource);
                    });
                }
            } else {
                if (typeof timeout !== 'undefined' || timeout) {
                    setTimeout(() => {
                        context.commit('clearResource', resource);
                        context.dispatch('getResource', resource);
                    }, timeout * 1000);
                }
            }

            return new Promise((resolve, reject) => {
                if (typeof context.state[resource] == 'undefined' || !context.state[resource] || !context.state[resource].length) {
                    if (typeof context.state.fetching[resource] == 'undefined' || !context.state.fetching[resource]) {
                        context.commit('setFetchingResourceTrue', resource);
                        window.axios.post('/resources/get' + resource.charAt(0).toUpperCase() + resource.slice(1)).then(response => {
                            context.state[resource] = response.data[resource];
                            context.commit('setFetchingResourceFalse', resource);
                            resolve(response.data[resource]);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        setTimeout(() => {
                            context.dispatch('getResource', resource, timeout).then(response => {
                                resolve(response);
                            });
                        }, 100);
                    }
                } else {
                    resolve(context.state[resource]);
                }
            });
        },
        setRoles(context, roles) {
            context.commit('setRoles', roles);
        },
        addToResources(context, resource) {
            context.commit('appendToResource', resource);
        },
        getUsers(context) {
            if (typeof window.Echo !== 'undefined') {
                if (typeof window['users_listener'] == 'undefined') {
                    window['users_listener'] = true;
                    window.Echo.private('update-dom').listen('.users', (e) => {
                        context.dispatch('fetchUsers');
                    });
                }
            } else {
                setTimeout(() => {
                    context.dispatch('getUsers');
                }, 60000);
            }
            context.dispatch('fetchUsers');
        },
        fetchUsers(context) {
            window.axios.post('/resources/getUsers', {
                timestamp: context.state.users.timestamp
            }).then(response => {
                if (typeof response.data.users !== 'undefined') {
                    let firstRequest = context.state.users.timestamp == undefined;
                    context.commit('setUsers', response.data);
                    if (!firstRequest) {
                        context.dispatch('checkSelfUpdated');
                    }
                }
            });
        },
        checkSelfUpdated(context) {
            let authenticatedUser = context.rootState.auth.user;

            if (context.state.users.delegatedIds.indexOf(authenticatedUser.id) > -1) {
                let storeUser = context.state.users.users.find((user) => {
                    return user.id == authenticatedUser.id;
                });

                if (typeof storeUser !== 'undefined' && authenticatedUser.updated_at !== storeUser.updated_at) {
                    this.dispatch('auth/getUser');
                }
            } else {
                this.dispatch('auth/logout').then(response => {
                    window.location.href = window.location.href;
                });
            }
        },
    },

    mutations: {
        setRoles(state, roles) {
            state.roles = roles;
        },
        clearResource(state, resource) {
            state[resource] = null;
        },
        setFetchingResourceTrue(state, resource) {
            state.fetching[resource] = true;
        },
        setFetchingResourceFalse(state, resource) {
            state.fetching[resource] = false;
        },
        appendToResource(state, resource) {
            if (typeof state[resource.name] !== 'undefined') {
                state[resource.name].push(resource.object);
            }
        },
        setUsers(state, users) {
            state.users = users;
        }
    }
}

export default {
    namespaced: true,

    state: {
        roles: [],
        fetching: {},
    },

    getters: {
        getRoles(state) {
            return state.roles;
        },
    },

    actions: {
        getResource(context, resource, timeout) {
            if (typeof window.Echo !== 'undefined') {
                if (typeof window[resource + 'listener'] == 'undefined') {
                    window[resource + 'listener'] = true;
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
        }
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
            if(typeof state[resource.name] !== 'undefined') {
                state[resource.name].push(resource.object);
            }
        }
    }
}
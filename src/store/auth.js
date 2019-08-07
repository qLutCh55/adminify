export default {
    namespaced: true,

    state: {
        user: {},
        roles: {}
    },

    getters: {
        isAuthenticated(state) {
            for (var key in state.user) {
                if (state.user.hasOwnProperty(key)) {
                    return true;
                }
            }
            return false;
        },
        getUser(state) {
            return state.user;
        },
        getApplicationRoles(state) {
            return state.roles;
        },
    },

    actions: {
        getUser(context) {
            return new Promise((resolve, reject) => {
                window.axios.post('/users/getUser').then(response => {
                    context.commit('setUser', response.data.user);
                    context.dispatch('removePreLoader');
                    resolve(response);
                }).catch(error => {
                    reject(error);
                })
            });
        },
        removePreLoader() {
            let fadeTarget = document.getElementById('pre-loader');
            if (fadeTarget) {
                setTimeout(function () {
                    let fadeEffect = setInterval(function () {
                        if (!fadeTarget.style.opacity) {
                            fadeTarget.style.opacity = 1;
                        }
                        if (fadeTarget.style.opacity > 0) {
                            fadeTarget.style.opacity -= 0.5;
                        } else {
                            if (fadeTarget.parentNode !== null) {
                                fadeTarget.parentNode.removeChild(fadeTarget);
                            }
                            clearInterval(fadeEffect);
                        }
                    }, 100);
                }, 1500);
            }
        },
        setApplicationRoles(context, roles) {
            for (var i = 0, len = roles.length; i < len; i++) {
                context.commit('setApplicationRole', roles[i]);
            }
        },
        logout(context) {
            return new Promise((resolve, reject) => {
                window.axios.post('/logout').then(response => {
                    context.commit('unsetUser');

                    window.axios.defaults.headers.common = {
                        'X-CSRF-TOKEN': response.data.token,
                        'X-Requested-With': 'XMLHttpRequest'
                    };
                    document.querySelector('meta[name="csrf-token"]').setAttribute("content", response.data.token);

                    resolve(response);
                }).catch(error => {
                    reject(error);
                });
            })
        }
    },

    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        unsetUser(state) {
            state.user = {}
        },
        setApplicationRole(state, role) {
            state.roles[role.slug] = role.id;
        }
    }
}
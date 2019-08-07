import Vue from 'vue';
import store from './../../../../../resources/js/store';

let roles = window.app.roles;

// Setting Comprehensive Global Roles Data
store.dispatch('resources/setRoles', roles);

// Setting Application Roles
store.dispatch('auth/setApplicationRoles', roles);


Vue.mixin({
    methods: {
        hasRole(role, increment = 0) {
            if (store.getters['auth/isAuthenticated']) {
                let roles = store.getters['auth/getApplicationRoles'];
                if (roles.hasOwnProperty(role)) {
                    let roleId = roles[role];
                    let authenticatedUser = store.getters['auth/getUser'];
                    return authenticatedUser.role_ids.indexOf(roleId) > -1;
                }
            } else if (increment < 4) {
                setTimeout(() => {
                    this.hasRole(role, increment + 1);
                }, 100);
            }

            return false;
        },
        hasMinRole(role, increment = 0) {
            if (store.getters['auth/isAuthenticated']) {
                let roles = store.getters['auth/getApplicationRoles'];

                if (roles.hasOwnProperty(role)) {
                    let roleId = roles[role];
                    let authenticatedUser = store.getters['auth/getUser'];

                    for (let i = 0; i < authenticatedUser.role_ids.length; i++) {
                        let userRoleId = authenticatedUser.role_ids[i];
                        if (userRoleId >= roleId) {
                            return true;
                        }
                    }
                }
            } else if (increment < 4) {
                setTimeout(() => {
                    this.hasMinRole(role, increment + 1);
                }, 100);
            }

            return false;
        },
        hasMaxRole(role, increment = 0) {
            if (store.getters['auth/isAuthenticated']) {
                let roles = store.getters['auth/getApplicationRoles'];

                if (roles.hasOwnProperty(role)) {
                    let roleId = roles[role];
                    let authenticatedUser = store.getters['auth/getUser'];

                    for (let i = 0; i < authenticatedUser.role_ids.length; i++) {
                        let userRoleId = authenticatedUser.role_ids[i];
                        if (userRoleId <= roleId) {
                            return true;
                        }
                    }
                }
            } else if (increment < 4) {
                setTimeout(() => {
                    this.hasMaxRole(role, increment + 1);
                }, 100);
            }

            return false;
        },
        belowRole(role, increment = 0) {
            if (store.getters['auth/isAuthenticated']) {
                let roles = store.getters['auth/getApplicationRoles'];

                if (roles.hasOwnProperty(role)) {
                    let roleId = roles[role];
                    let authenticatedUser = store.getters['auth/getUser'];

                    for (let i = 0; i < authenticatedUser.role_ids.length; i++) {
                        let userRoleId = authenticatedUser.role_ids[i];

                        if (userRoleId >= roleId) {
                            return false;
                        }
                    }
                    return true;
                }
            } else if (increment < 4) {
                setTimeout(() => {
                    this.belowRole(role, increment + 1);
                }, 100);
            }

            return false;
        },
        aboveRole(role, increment = 0) {
            if (store.getters['auth/isAuthenticated']) {
                let roles = store.getters['auth/getApplicationRoles'];

                if (roles.hasOwnProperty(role)) {
                    let roleId = roles[role];
                    let authenticatedUser = store.getters['auth/getUser'];

                    for (let i = 0; i < authenticatedUser.role_ids.length; i++) {
                        let userRoleId = authenticatedUser.role_ids[i];

                        if (userRoleId <= roleId) {
                            return false;
                        }
                    }
                    return true;
                }
            } else if (increment < 4) {
                setTimeout(() => {
                    this.aboveRole(role, increment + 1);
                }, 100);
            }


            return false;
        },
    }
});

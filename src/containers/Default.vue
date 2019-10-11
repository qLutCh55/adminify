<template>
    <v-app>
        <side-menu/>

        <title-updater></title-updater>

        <top-menu/>

        <v-content>
            <breadcrumbs></breadcrumbs>
            <router-view v-if="loaded"></router-view>
        </v-content>

        <filter-sidebar/>
        <notification-sidebar/>
    </v-app>
</template>
<script>
    import SideMenu from './../common/SideMenu';
    import TopMenu from './../common/TopMenu';
    import TitleUpdater from '../functional/Title';
    import Breadcrumbs from '../functional/Breadcrumbs';
    import FilterSidebar from './../common/FilterSidebar';
    import NotificationSidebar from './../common/NotificationSidebar';

    export default {
        data() {
            return {
                loaded: false,

                menu: ADMINIFY_MENU,
                permissions: {},
            }
        },
        components: {
            SideMenu,
            TopMenu,
            Breadcrumbs,
            TitleUpdater,
            FilterSidebar,
            NotificationSidebar,
        },
        computed: {
            loggedInUser() {
                return this.$store.getters['auth/getUser'];
            },
        },
        name: 'MasterContainer',
        mounted() {
            if (!this.$store.getters['auth/isAuthenticated']) {
                this.$store.dispatch('auth/getUser').then(response => {
                    if (typeof response.data.verified !== 'undefined' && response.data.verified !== 'true') {
                        this.$router.push('/email/verify');
                    }
                    this.buildPermissionTree().then(response => {
                        this.checkPermissions(10);
                    });
                });
                this.$store.dispatch('resources/getUsers');
            } else {
                this.buildPermissionTree().then(response => {
                    this.checkPermissions(10);
                });
            }
        },
        watch: {
            '$route'() {
                this.checkPermissions(10);
            }
        },
        methods: {
            buildPermissionTree() {
                return new Promise((resolve, reject) => {
                    _.each(this.menu, (item) => {
                        let parentPath = '';
                        let parentRestrictions = [];

                        if (typeof item.enforceRestriction !== 'undefined' && !item.enforceRestriction) {
                            return;
                        }


                        if (typeof item.restriction !== 'undefined' && item.restriction !== "none") {
                            parentRestrictions = item.restriction.split('|');
                        }

                        if (typeof item.hidden !== 'undefined' && item.hidden.length) {
                            _.each(item.hidden, (hiddenChild) => {
                                let hiddenChildRestrictions = [...parentRestrictions];

                                if (typeof hiddenChild.enforceRestriction !== 'undefined' && !hiddenChild.enforceRestriction) {
                                    return;
                                }

                                if (typeof hiddenChild.restriction !== 'undefined' && hiddenChild.restriction !== "none") {
                                    let hiddenChildRestrictionArray = hiddenChild.restriction.split('|');

                                    _.each(hiddenChildRestrictionArray, (restriction) => {
                                        if (hiddenChildRestrictions.indexOf(restriction) == -1) {
                                            hiddenChildRestrictions.push(restriction);
                                        }
                                    });
                                }

                                let hiddenChildPath = hiddenChild.routeName;

                                if (hiddenChildRestrictions.length) {
                                    this.permissions[hiddenChildPath] = hiddenChildRestrictions;
                                }
                            });
                        }

                        if (typeof item.children !== 'undefined' && item.children.length) {

                            _.each(item.children, (child) => {
                                let childRestrictions = [...parentRestrictions];

                                if (typeof child.enforceRestriction !== 'undefined' && !child.enforceRestriction) {
                                    return;
                                }

                                if (typeof child.restriction !== 'undefined' && child.restriction !== "none") {
                                    let childRestrictionArray = child.restriction.split('|');

                                    _.each(childRestrictionArray, (restriction) => {
                                        if (childRestrictions.indexOf(restriction) == -1) {
                                            childRestrictions.push(restriction);
                                        }
                                    });
                                }

                                let childPath = child.path.split('?')[0];

                                if (childRestrictions.length) {
                                    this.permissions[childPath] = childRestrictions;
                                }
                            });

                        } else if (typeof item.path !== 'undefined' && parentRestrictions.length) {
                            parentPath = item.path.split('?')[0];
                            this.permissions[parentPath] = parentRestrictions;
                        }
                    });

                    resolve();
                });
            },
            checkPermissions(attempts) {
                let key = null;

                if (this.permissions.hasOwnProperty(this.$route.path)) {
                    key = this.$route.path;
                } else if (this.permissions.hasOwnProperty(this.$route.name)) {
                    key = this.$route.name;
                }

                if (key) {
                    if (attempts && typeof this.loggedInUser == 'undefined' && typeof this.loggedInUser.id == 'undefined') {
                        setTimeout(() => {
                            attempts--;
                            this.checkPermissions(attempts);
                        }, 100);

                        return false;
                    }

                    if (!attempts || !this.hasPermission(this.permissions[key])) {
                        this.$router.push('/unauthorized');
                    }
                }

                this.loaded = true;
            },
            hasPermission(permissions) {
                for (let i = 0, len = permissions.length; i < len; i++) {
                    let permission = permissions[i];

                    if (this.hasRole(permission)) {
                        return true;
                    }
                }

                return false;
            },
        }
    }
</script>

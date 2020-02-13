<template>
    <v-app-bar
            color="primary"
            dark
            flat
            app
    >
        <v-app-bar-nav-icon
                @click.stop="toggleLeftDrawer"
                class="toggle-side-menu-button"
        ></v-app-bar-nav-icon>

        <template
                v-for="(item, index) in leftTopMenu"
        >
            <top-menu-item
                    :key="'leftTopMenu-' + index"
                    :item="item"
            ></top-menu-item>
        </template>

        <v-spacer></v-spacer>

        <template
                v-for="(item, index) in rightTopMenu"
        >
            <top-menu-item
                    :key="'rightTopMenu-' + index"
                    :item="item"
            ></top-menu-item>
        </template>

        <v-tooltip
                bottom
                v-if="canImpersonateReturn"
        >
            <template v-slot:activator="{ on }">
                <v-btn
                        icon
                        v-on="on"
                        @click.stop="impersonateReturn"
                >
                    <v-icon>$mdiAccountConvert</v-icon>
                </v-btn>
            </template>
            <span>
                Return as
                <span v-if="typeof impersonator !== 'undefined' && typeof impersonator.first_name !== 'undefined'">
                    {{ impersonator.first_name }}
                </span>
                 <span v-if="typeof impersonator !== 'undefined' && typeof impersonator.last_name !== 'undefined'">
                    {{ impersonator.last_name }}
                </span>
            </span>
        </v-tooltip>


        <v-btn
                icon
                @click.stop="toggleNotificationDrawer"
        >
            <v-badge
                    color="error"
                    overlap
                    v-if="notificationsCount > 0"
            >
                <template v-slot:badge>
                    {{ notificationsCount }}
                </template>
                <v-icon>$mdiBellRing</v-icon>
            </v-badge>
            <v-icon v-else>$mdiBellRing</v-icon>
        </v-btn>


        <v-menu
                bottom
                left
        >
            <template v-slot:activator="{ on }">
                <v-btn
                        icon
                        slot="activator"
                        v-on="on"
                >
                    <v-thumbnail
                            :thumbnail="loggedInUser.thumbnail"
                            width="32"
                            height="32"
                    ></v-thumbnail>
                </v-btn>
            </template>
            <v-list class="pa-0">
                <v-list-item>
                    <v-list-item-avatar>
                        <v-thumbnail
                                :thumbnail="loggedInUser.thumbnail"
                                width="40"
                                height="40"
                        ></v-thumbnail>
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ loggedInUser.first_name }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item
                        key="profile"
                        @click="editProfile"
                >
                    <v-list-item-action>
                        <v-icon>$mdiAccount</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>My Profile</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item @click="doLogout">
                    <v-list-item-action>
                        <v-icon>$mdiLockOpen</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Logout</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>
</template>

<script>
    import TopMenuItem from './TopMenuItem';

    export default {
        name: 'Top-Menu',
        data() {
            return {
                timer: null,
            }
        },
        components: {
            TopMenuItem,
        },
        computed: {
            rightDrawer() {
                return this.$store.getters['application/getRightDrawerStatus'];
            },
            drawer: {
                set(value) {
                    this.$store.commit('application/setDrawerStatus', value);
                },
                get() {
                    return this.$store.getters['application/getDrawerStatus'];
                }
            },
            loggedInUser() {
                return this.$store.getters['auth/getUser'];
            },
            notificationsCount() {
                return this.$store.getters['application/getNotificationsCount'];
            },
            impersonator() {
                return this.loggedInUser.impersonator;
            },
            canImpersonateReturn() {
                return typeof this.loggedInUser.impersonator !== 'undefined' && this.loggedInUser.impersonator !== null;
            },

            leftTopMenu() {
                return this.$store.getters['application/getLeftTopBar'];
            },
            rightTopMenu() {
                return this.$store.getters['application/getRightTopBar'];
            },
        },
        created() {
            this.$store.dispatch('application/getNotificationsCount');
            this.setupNotificationWebsocket();
        },
        beforeDestroy() {
            if (this.timer) {
                clearInterval(this.timer);
            }
        },
        methods: {
            setupNotificationWebsocket() {
                if (typeof this.loggedInUser == 'undefined' || typeof this.loggedInUser.id == 'undefined') {
                    setTimeout(() => {
                        this.setupNotificationWebsocket();
                    }, 100);
                    return false;
                }

                if (typeof window.Echo !== 'undefined') {
                    window.Echo.private('notifications.' + this.loggedInUser.id)
                        .listen('.update-notifications', (e) => {
                            if (typeof e.unread !== 'undefined') {
                                this.$store.commit('application/setNotificationsCount', e.unread);
                            } else if (typeof e.notifications !== 'undefined') {
                                this.$store.commit('application/setNotificationsCount', e.notifications);
                            } else {
                                this.fetchNotificationCount();
                            }
                        });
                } else {
                    this.timer = setInterval(this.fetchNotificationCount, 600 * 1000);
                }
            },
            fetchNotificationCount() {
                this.$store.dispatch('application/getNotificationsCount');
            },
            toggleRightDrawer() {
                this.$store.commit('application/setRightDrawerStatus', !this.$store.getters['application/getRightDrawerStatus']);
            },
            toggleLeftDrawer() {
                this.$store.commit('application/setDrawerStatus', !this.$store.getters['application/setDrawerStatus']);
            },
            toggleNotificationDrawer() {
                this.$store.commit('application/setNotificationDrawerStatus', !this.$store.getters['application/getNotificationDrawerStatus']);
            },
            editProfile() {
                this.$router.push('/profile?tab=info');
            },
            doLogout() {
                this.$store.dispatch('auth/logout').then(response => {
                    this.$router.push('/login');
                }).catch(error => {
                    console.log(error);
                    // window.open("/login","_self");
                });
            },
            impersonateReturn() {
                window.location = '/impersonate-return';
            }
        }
    }
</script>

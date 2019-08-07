<template>
    <v-toolbar
            app
            flat
            color="primary"
            dark
    >
        <v-toolbar-side-icon
                @click.stop="toggleLeftDrawer"
                class="hidden-lg-and-up"
        />

        <v-spacer></v-spacer>

        <v-tooltip bottom v-if="canImpersonateReturn">
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click.stop="impersonateReturn">
                    <v-icon>mdi-account-arrow-left</v-icon>
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


        <v-btn icon @click.stop="toggleNotificationDrawer">
            <v-badge
                    color="error"
                    overlap
                    v-if="notificationsCount > 0"
            >
                <template v-slot:badge>
                    {{ notificationsCount }}
                </template>
                <v-icon>mdi-bell-ring</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell-ring</v-icon>
        </v-btn>


        <v-menu
                bottom
                left
        >
            <v-btn icon slot="activator">
                <v-avatar size="32">
                    <img :src="loggedInUser.thumbnail">
                </v-avatar>
            </v-btn>
            <v-list class="pa-0">
                <v-list-tile avatar>
                    <v-list-tile-avatar>
                        <img :src="loggedInUser.thumbnail">
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ loggedInUser.first_name }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-divider></v-divider>

                <v-list-tile key="profile" @click="editProfile">
                    <v-list-tile-action>
                        <v-icon>mdi-account</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>My Profile</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-divider></v-divider>

                <v-list-tile key="lock_open" @click="doLogout">
                    <v-list-tile-action>
                        <v-icon>mdi-lock-open</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Logout</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-menu>
    </v-toolbar>
</template>

<script>
    export default {
        name: 'Top-Menu',
        data() {
            return {
                timer: null,
            }
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
            }
        },
        created() {
            this.$store.dispatch('application/getNotificationsCount');
            this.timer = setInterval(this.fetchNotificationCount, 600 * 1000);
        },
        beforeDestroy() {
            clearInterval(this.timer);
        },
        methods: {
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
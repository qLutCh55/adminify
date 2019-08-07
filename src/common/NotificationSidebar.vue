<template>
    <v-navigation-drawer
            temporary
            :right="right"
            v-model="notificationDrawer"
            fixed
            app
    >
        <v-toolbar flat prominent dark class="primary">
            <v-toolbar-title>Notifications</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="toggleNotificationDrawer">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-toolbar>

        <div class="text-xs-center pa-5" v-if="fetching">
            <v-progress-circular
                    :size="40"
                    color="primary"
                    indeterminate
            ></v-progress-circular>
        </div>
        <v-list subheader dense v-else>
            <template v-if="!notifications.length">
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>No notifications</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </template>
            <template v-else>
                <v-list-tile
                        v-for="(notification, index) in notifications"
                        :key="index"
                        avatar
                        :class="notification.read_at ? '' : 'primary lighten-2'"
                        @click="viewNotification(index)"
                >
                    <v-list-tile-avatar>
                        <v-icon v-if="notification.icon">{{ notification.icon }}</v-icon>
                        <v-icon v-else>mdi mdi-bell-ring</v-icon>
                    </v-list-tile-avatar>

                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{ notification.total }} {{ notification.type }} {{ notification.action }}
                        </v-list-tile-title>
                        <v-list-tile-sub-title v-if="notification.read_at">
                            Read {{ notification.read_at|fromNow }}
                        </v-list-tile-sub-title>
                    </v-list-tile-content>

                    <v-list-tile-action>
                        <v-btn icon ripple @click="deleteNotification(index)">
                            <v-icon color="error">mdi mdi-delete-circle-outline</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
            </template>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
    export default {
        name: 'NotificationSidebar',
        data() {
            return {
                right: true,
                component: true,

                fetching: true,
                notifications: [],
            }
        },
        computed: {
            notificationDrawer: {
                set(value) {
                    if (value) {
                        this.getNotifications();
                    }
                    this.$store.commit('application/setNotificationDrawerStatus', value);
                },
                get() {
                    return this.$store.getters['application/getNotificationDrawerStatus'];
                }
            },
        },
        mounted() {
        },
        methods: {
            toggleNotificationDrawer() {
                this.$store.commit('application/setNotificationDrawerStatus', !this.$store.getters['application/getNotificationDrawerStatus']);
            },
            getNotifications() {
                this.fetching = true;
                window.axios.post('/notifications/get').then(response => {
                    this.notifications = response.data.notifications;
                    this.$store.commit('application/setNotificationsCount', response.data.count);
                    this.fetching = false;
                });
            },
            viewNotification(index) {
                let notification = this.notifications[index];

                if (typeof notification.url !== 'undefined' && notification.url) {
                    this.$router.push(notification.url);
                }

                window.axios.post('/notifications/read', {identifier: notification.identifier}).then(response => {
                    this.$store.commit('application/setNotificationsCount', response.data.count);
                });
            },
            deleteNotification(index) {
                let notification = this.notifications[index];
                this.notifications.splice(index, 1);
                window.axios.post('/notifications/remove', {identifier: notification.identifier}).then(response => {
                    this.$store.commit('application/setNotificationsCount', response.data.count);
                });
            }
        },
    }
</script>


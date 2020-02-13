<template>
    <v-navigation-drawer
            temporary
            :right="right"
            v-model="notificationDrawer"
            fixed
            app
            width="300"
    >
        <v-toolbar
                flat
                dark
                class="primary"
        >
            <v-toolbar-title>Notifications</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
                    icon
                    @click.stop="toggleNotificationDrawer"
            >
                <v-icon>$mdiClose</v-icon>
            </v-btn>
        </v-toolbar>

        <div
                class="text-center pa-5"
                v-if="fetching"
        >
            <v-progress-circular
                    :size="40"
                    color="primary"
                    indeterminate
            ></v-progress-circular>
        </div>
        <v-list
                subheader
                dense
                v-else
        >
            <template v-if="!notifications.length">
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title>No notifications</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>
            <template
                    v-else
            >
                <v-list-item>
                    <v-list-item-content class="align-center">
                        <v-btn
                                text
                                color="error"
                                small
                                @click="clearAllNotifications"
                        >
                            Clear all
                        </v-btn>
                    </v-list-item-content>
                </v-list-item>

                <v-card
                        flat
                        v-for="(notification, index) in notifications"
                        :key="index"
                        avatar
                        class="notification-card"
                        :class="notification.actionUrl ? 'pointer' : ''"
                >
                    <v-card-title class="pt-0">
                        <div
                                class="notification-card-avatar"
                                @click="viewNotification(index)"
                        >
                            <v-thumbnail
                                    v-if="notification.thumbnail"
                                    :thumbnail="notification.thumbnail"
                                    width="30"
                                    height="30"
                            ></v-thumbnail>
                            <v-icon v-else>$mdiBellRing</v-icon>
                        </div>
                        <div
                                class="notification-card-content"
                                @click="viewNotification(index)"
                        >
                            <div class="subtitle-2">{{ notification.message }}</div>
                            <div class="caption">{{ notification.created_at|fromNow }}</div>
                        </div>
                        <div class="notification-card-action">
                            <v-btn
                                    icon
                                    @click="deleteNotification(index)"
                                    text
                            >
                                <v-icon color="error">$mdiClose</v-icon>
                            </v-btn>
                        </div>
                    </v-card-title>
                </v-card>
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
                window.axios.post('/notifications/get')
                    .then(response => {
                        this.notifications = response.data.notifications;
                        this.$store.commit('application/setNotificationsCount', 0);
                        this.fetching = false;
                    });
            },
            viewNotification(index) {
                let notification = this.notifications[index];

                window.axios.post('/notifications/open', {id: notification.id});

                if (notification.actionUrl) {
                    if (notification.actionMethod == 0) {
                        window.open(notification.actionUrl, "_blank");
                    } else if (notification.actionMethod == 1 && this.$route.path !== notification.actionUrl) {
                        this.$router.push(notification.actionUrl);
                        Event.fire('notification-route-change');
                    }
                }
            },
            deleteNotification(index) {
                let notification = this.notifications[index];
                this.notifications.splice(index, 1);
                window.axios.post('/notifications/dismiss', {id: notification.id});
            },

            clearAllNotifications() {
                window.axios.post('/notifications/clear').then(response => {
                    this.$store.commit('application/setNotificationsCount', 0);
                    this.notifications = [];
                });
            }
        },
    }
</script>

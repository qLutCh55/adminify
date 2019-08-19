<template>
    <v-app light>
        <side-menu/>

        <title-updater></title-updater>

        <top-menu/>

        <v-content>
            <breadcrumbs></breadcrumbs>
            <router-view></router-view>
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
            return {}
        },
        components: {
            SideMenu,
            TopMenu,
            Breadcrumbs,
            TitleUpdater,
            FilterSidebar,
            NotificationSidebar,
        },
        name: 'MasterContainer',
        mounted() {
            if (!this.$store.getters['auth/isAuthenticated']) {
                this.$store.dispatch('auth/getUser').then(response => {
                    if (typeof response.data.verified !== 'undefined' && response.data.verified !== 'true') {
                        this.$router.push('/email/verify');
                    }
                });
            }
        },
        methods: {}
    }
</script>

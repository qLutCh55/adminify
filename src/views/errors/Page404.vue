<template>
    <auth-container>
        <v-card>
            <v-card-text class="mb-3">
                <div class="text-center">
                    <div class="display-3">404</div>
                    <div class="title mb-2">Whoops...</div>
                    <div class="subtitle mb-2">The page you are looking for was not found.</div>
                    <div class="text-center">
                        <v-btn
                            @click="$router.push('/dashboard')"
                            outlined
                            color="primary"
                        >
                            Get me out of here
                        </v-btn>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </auth-container>
</template>

<script>
    import AuthContainer from '../../containers/Auth';

    export default {
        data() {
            return {}
        },
        components: {
            AuthContainer
        },
        name: 'Page404',
        mounted() {
            document.title = this.$store.getters['application/getApplicationName'] + ' | 404';
        },
        methods: {}
    }
</script>


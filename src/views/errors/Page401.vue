<template>
    <auth-container>
        <v-card>
            <v-card-text class="mb-3">
                <div class="text-center">
                    <div class="display-3">401</div>
                    <div class="title mb-2">Whoops...</div>
                    <div class="subtitle mb-5">It seems you are not authorized to view this page.</div>
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
        name: 'Page401',
        mounted() {
            document.title = this.$store.getters['application/getApplicationName'] + ' | 401';
        },
        methods: {}
    }
</script>


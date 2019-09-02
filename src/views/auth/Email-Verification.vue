<template>
    <auth-container>
        <v-card width="450">
            <v-card-text>
                <div class="text-center display-3 grey--text text--darken-2 font-weight-light mb-4">
                    Email Verification
                </div>
                <div class="text-center">
                    <p>Before proceeding, please check your email for a verification link.</p>
                    <p>If you did not receive the email, click below to request another</p>
                    <v-btn
                        color="primary"
                        :loading="attempting"
                        @click="resendVerificationEmail"
                    >
                        Resend verification email
                    </v-btn>
                </div>
                <v-alert
                    :value="message !== ''"
                    color="success"
                >
                    {{ message }}
                </v-alert>
            </v-card-text>
        </v-card>
    </auth-container>
</template>

<script>
    import AuthContainer from '../../containers/Auth';

    export default {
        data() {
            return {
                message: '',
                attempting: false,
            }
        },
        components: {
            AuthContainer
        },
        computed: {},
        name: 'Email-Verification',
        mounted() {
            document.title = this.$store.getters['application/getApplicationName'] + ' | Email Verification';
        },
        methods: {
            resendVerificationEmail() {
                this.message = '';
                this.attempting = true;
                window.axios.post('/email/resend', {errorHandle: true}).then(response => {

                    this.attempting = false;
                    this.message = response.data.message;

                }).catch(error => {
                    this.message = '';

                    if (error.response.status == 419) {
                        this.message = 'Please refresh your browser.'
                    }

                    this.attempting = false;
                });
            },
        }
    }
</script>

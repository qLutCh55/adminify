<template>
    <auth-container>
        <v-card width="320">
            <v-card-text>
                <div class="text-center display-3 grey--text text--darken-2 font-weight-light mb-4">
                    Reset Password
                </div>
                <v-form
                    @submit.native.prevent="doPasswordReset"
                    ref="resetPasswordForm"
                    class="text-center"
                    lazy-validation
                >
                    <v-text-field
                            label="Email"
                            v-model="user.email"
                            prepend-icon="mdi-email-mark-as-unread"
                            :rules="[
                                v => !!v || 'Email is required.',
                                $root.rules.email
                            ]"
                            type="email"
                            :error-messages="emailProblem ? emailProblem : ''"
                            autocapitalize="off"
                            autocorrect="off"
                            :autocomplete="'new-password'"
                            :disabled="attempting"
                    ></v-text-field>
                    <div class="text-center mt-2 mb-2">
                        <v-btn
                            type="submit"
                            color="primary"
                            :loading="attempting"
                        >
                            Send Password Reset Link
                        </v-btn>
                    </div>
                </v-form>

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
                user: {
                    email: '',
                },
                emailProblem: '',
                message: '',
                attempting: false,
            }
        },
        components: {
            AuthContainer
        },
        computed: {},
        name: 'Password-Reset',
        mounted() {
            document.title = this.$store.getters['application/getApplicationName'] + ' | Password reset';
        },
        methods: {
            doPasswordReset() {
                this.message = '';
                this.emailProblem = '';
                if (this.$refs.resetPasswordForm.validate()) {
                    this.attempting = true;
                    window.axios.post('/password/email', this.user, {errorHandle: true}).then(response => {
                        this.attempting = false;
                        this.$refs.resetPasswordForm.reset();
                        this.message = response.data.message;
                    }).catch(error => {
                        this.message = '';

                        if (error.response.status == 419) {
                            this.message = 'Please refresh your browser.'
                        }

                        let errors = error.response.data.errors;

                        for (let key in errors) {
                            if (!errors.hasOwnProperty(key)) continue;

                            if (key == 'email') {
                                this.emailProblem = errors[key];
                            }
                        }

                        this.attempting = false;
                    });
                }
            },
        }
    }
</script>

<template>
    <auth-container>
        <v-card width="320">
            <v-card-text>
                <div class="text-center display-3 grey--text text--darken-2 font-weight-light mb-4">
                    Reset Password
                </div>
                <v-form
                    @submit.native.prevent="doPasswordChange"
                    ref="resetPasswordForm"
                    class="text-center"
                    lazy-validation
                >
                    <v-text-field
                            v-model="user.token"
                            class="hidden"
                            type="hidden"
                            hidden
                    ></v-text-field>
                    <v-text-field
                            label="Email"
                            v-model="user.email"
                            prepend-icon="mdi-email-mark-as-unread"
                            :autocomplete="'new-password'"
                            disabled
                    ></v-text-field>
                    <v-text-field
                            label="Password"
                            v-model="user.password"
                            prepend-icon="mdi-lock"
                            :rules="[
                                v => !!v || 'Password is required.',
                                v => !!(v.length > 7) || 'Password needs to be at least 8 characters.'
                            ]"
                            :append-icon="viewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="() => (viewPassword = !viewPassword)"
                            :type="viewPassword ? 'text' : 'password'"
                            :autocomplete="'new-password'"
                            :disabled="attempting"
                    ></v-text-field>
                    <v-text-field
                            label="Confirm Password"
                            v-model="user.password_confirmation"
                            prepend-icon="mdi-lock"
                            :rules="[
                                v => !!v || 'Please confirm password.',
                                v => !!(v == this.user.password) || 'Passwords need to be the same.'
                            ]"
                            :append-icon="viewConfirmedPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="() => (viewConfirmedPassword = !viewConfirmedPassword)"
                            :type="viewConfirmedPassword ? 'text' : 'password'"
                            :autocomplete="'new-password'"
                            :disabled="attempting"
                    ></v-text-field>
                    <div class="text-center mt-2">
                        <v-btn
                            type="submit"
                            color="primary"
                            :loading="attempting"
                        >
                            Reset Password
                        </v-btn>
                    </div>
                </v-form>
                <v-alert
                    class="mt-3"
                    :value="message !== ''"
                    color="error"
                    dark
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
                    token: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                },
                viewPassword: false,
                viewConfirmedPassword: false,
                attempting: false,
                message: '',
                verificationRequired: false,
            }
        },
        components: {
            AuthContainer
        },
        computed: {},
        name: 'Password-Change',
        mounted() {
            document.title = this.$store.getters['application/getApplicationName'] + ' | Password Change';
            this.user.token = this.$route.params.token;
            this.user.email = this.decodeBase64(this.$route.params.email);
        },
        methods: {
            doPasswordChange() {
                if (this.$refs.resetPasswordForm.validate()) {
                    this.message = '';
                    this.attempting = true;
                    window.axios.post('/password/reset', this.user).then(response => {
                        this.$store.commit('auth/setUser', response.data.user);
                        this.attempting = false;

                        if (typeof response.data.verified !== 'undefined' && response.data.verified !== 'true') {
                            this.verificationRequired = true;
                        }

                        window.axios.post('/token').then(response => {

                            window.axios.defaults.headers.common = {
                                'X-CSRF-TOKEN': response.data.token,
                                'X-Requested-With': 'XMLHttpRequest'
                            };

                            document.querySelector('meta[name="csrf-token"]').setAttribute("content", response.data.token);

                            this.$toasted.show('Password successful changed!', {
                                theme: "default",
                                position: "top-center",
                                duration: 1500
                            });

                            if (this.verificationRequired) {
                                this.$router.push('/email/verify');
                            } else {
                                this.$router.push('/dashboard');
                            }
                        });

                    }).catch(error => {
                        this.message = error.response.data.message;

                        if (error.response.status == 419) {
                            this.message = 'Please refresh your browser.'
                        }

                        this.attempting = false;
                    });
                }
            }
        }
    }
</script>

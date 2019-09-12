<template>
    <auth-container>
        <v-card width="320">
            <v-card-text>
                <div class="text-center display-3 grey--text text--darken-2 font-weight-light mb-4">
                    Login
                </div>
                <v-form @submit.native.prevent="doLogin" ref="loginForm" class="text-xs-center" lazy-validation>
                    <v-text-field
                            label="Email"
                            v-model="login.email"
                            prepend-icon="mdi-account"
                            :rules="[ v => !!v || 'Email is required.' ]"
                            type="email"
                            autocapitalize="off"
                            autocorrect="off"
                            :disabled="attempting"
                    ></v-text-field>
                    <v-text-field
                            label="Password"
                            v-model="login.password"
                            prepend-icon="mdi-lock"
                            :rules="[ v => !!v || 'Password is required.' ]"
                            :append-icon="viewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="() => (viewPassword = !viewPassword)"
                            :type="viewPassword ? 'text' : 'password'"
                            :disabled="attempting"
                    ></v-text-field>
                    <v-checkbox
                            label="Remember me"
                            color="primary"
                            v-model="login.remember"
                            value="1"
                            :disabled="attempting"
                    ></v-checkbox>
                    <div class="text-center">
                        <v-btn
                            type="submit"
                            color="primary"
                            :loading="attempting"
                        >
                            Login
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
            <v-card-actions>
                <v-btn
                    text
                    @click="goToRegisterPage"
                    v-if="ableToRegister"
                    :disabled="attempting"
                >
                    Register
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    text
                    @click="goToForgotPasswordPage"
                    :disabled="attempting"
                >
                    Forgot Password?
                </v-btn>
            </v-card-actions>
        </v-card>
    </auth-container>
</template>

<script>
    import AuthContainer from '../../containers/Auth';

    export default {
        data() {
            return {
                login: {
                    email: '',
                    password: '',
                    remember: 0
                },
                viewPassword: false,
                message: '',
                problem: [],
                attempting: false,
                verificationRequired: false,
            }
        },
        components: {
            AuthContainer
        },
        name: 'Login',
        computed: {
            ableToRegister() {
                return this.$store.getters['application/getRegistrationStatus'];
            }
        },
        mounted() {
            document.title = this.$store.getters['application/getApplicationName'] + ' | Login';
        },
        methods: {
            goToRegisterPage() {
                this.$router.push('/register')
            },
            goToForgotPasswordPage() {
                this.$router.push('/password/reset')
            },
            doLogin() {
                this.message = '';
                if (this.$refs.loginForm.validate()) {
                    this.attempting = true;
                    window.axios.post('/login', this.login).then(response => {
                        this.$store.commit('auth/setUser', response.data.user);
                        this.$store.dispatch('resources/getUsers');

                        if (typeof response.data.verified !== 'undefined' && response.data.verified !== 'true') {
                            this.verificationRequired = true;
                        }

                        window.axios.post('/token').then(response => {

                            window.axios.defaults.headers.common = {
                                'X-CSRF-TOKEN': response.data.token,
                                'X-Requested-With': 'XMLHttpRequest'
                            };

                            document.querySelector('meta[name="csrf-token"]').setAttribute("content", response.data.token);

                            this.$toasted.show('Login Successful!', {
                                theme: "default",
                                position: "top-center",
                                duration: 1500
                            });

                            if (this.verificationRequired) {
                                this.$router.push('/email/verify');
                            } else if (document.querySelector('meta[name="redirect-url"]') && document.querySelector('meta[name="redirect-url"]').getAttribute('content') !== '') {
                                let redirectUrl = document.querySelector('meta[name="redirect-url"]').getAttribute('content');
                                this.$router.push(redirectUrl);
                                document.querySelector('meta[name="redirect-url"]').setAttribute("content", '');
                            } else {
                                this.$router.push('/dashboard');
                            }

                            this.attempting = false;
                        });
                    }).catch(error => {
                        this.message = error.response.data.message;

                        if (error.response.status == 419) {
                            this.message = 'Please refresh your browser.'
                        }

                        this.attempting = false;
                    });
                }
            },
        }
    }
</script>

<template>
    <auth-container>
        <v-card width="320">
            <v-card-text>
                <div class="text-center display-3 grey--text text--darken-2 font-weight-light mb-4">
                    Register
                </div>
                <v-form
                    @submit.native.prevent="doRegister"
                    ref="registerForm"
                    class="text-center"
                    lazy-validation
                >
                    <v-text-field
                            label="Name"
                            v-model="register.name"
                            prepend-icon="mdi-account"
                            :rules="[ v => !!v || 'Name is required.' ]"
                            :error-messages="nameProblem ? nameProblem : ''"
                            type="name"
                            autocapitalize="off"
                            autocorrect="off"
                            :disabled="attempting"
                    ></v-text-field>
                    <v-text-field
                            label="Email"
                            v-model="register.email"
                            prepend-icon="mdi-at"
                            :rules="[
                                v => !!v || 'Email is required.',
                                $root.rules.email
                            ]"
                            :error-messages="emailProblem ? emailProblem : ''"
                            type="email"
                            autocapitalize="off"
                            autocorrect="off"
                            :disabled="attempting"
                    ></v-text-field>
                    <v-text-field
                            label="Password"
                            v-model="register.password"
                            prepend-icon="mdi-lock"
                            :rules="[
                                v => !!v || 'Password is required.',
                                v => !!(v.length > 8) || 'Password needs to be at least 8 characters.'
                            ]"
                            :error-messages="passwordProblem ? passwordProblem : ''"
                            :append-icon="viewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="() => (viewPassword = !viewPassword)"
                            :type="viewPassword ? 'text' : 'password'"
                            :disabled="attempting"
                    ></v-text-field>
                    <v-text-field
                            label="Confirm Password"
                            v-model="register.password_confirmation"
                            prepend-icon="mdi-lock"
                            :rules="[
                                v => !!v || 'Please confirm password.',
                                v => !!(v == this.register.password) || 'Passwords need to be the same.'
                            ]"
                            :append-icon="viewConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="() => (viewConfirmPassword = !viewConfirmPassword)"
                            :type="viewConfirmPassword ? 'text' : 'password'"
                            :disabled="attempting"
                    ></v-text-field>
                    <div class="text-center">
                        <v-btn
                            type="submit"
                            color="primary"
                            :loading="attempting"
                        >
                            Register
                        </v-btn>
                    </div>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    text
                    @click="goToLoginPage"
                    :disabled="attempting"
                >
                    Already have an account?
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
                register: {
                    name: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                },
                viewPassword: false,
                viewConfirmPassword: false,
                nameProblem: '',
                emailProblem: '',
                passwordProblem: '',
                problem: [],
                attempting: false,
                verificationRequired: false,
            }
        },
        components: {
            AuthContainer
        },
        name: 'Register',
        mounted() {
            document.title = this.$store.getters['application/getApplicationName'] + ' | Register';
        },
        methods: {
            goToLoginPage() {
                this.$router.push('/login')
            },
            resetProblems() {
                this.nameProblem = '';
                this.emailProblem = '';
                this.passwordProblem = '';
            },
            doRegister() {
                if (this.$refs.registerForm.validate()) {
                    this.resetProblems();
                    this.attempting = true;
                    window.axios.post('/register', this.register).then(response => {
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

                            this.$toasted.show('Registration Successful!', {
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

                        if (error.response.status == 419) {
                            this.message = 'Please refresh your browser.'
                        }

                        let errors = error.response.data.errors;

                        for (let key in errors) {
                            if (!errors.hasOwnProperty(key)) continue;

                            if (key == 'email') {
                                this.emailProblem = errors[key];
                            } else if (key == 'password') {
                                this.passwordProblem = errors[key];
                            } else if (key == 'name') {
                                this.nameProblemProblem = errors[key];
                            }
                        }

                        this.attempting = false;
                    });
                }
            }
        }
    }
</script>

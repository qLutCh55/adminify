<template>
    <router-view></router-view>
</template>

<script>
    export default {
        name: 'app',
        data() {
            return {
                timer: '',
                token: '',
            }
        },
        created() {
            this.timer = setInterval(this.refreshToken, 3500 * 1000);
            this.$store.dispatch('application/checkWebpSupport');
        },
        methods: {
            refreshToken() {
                window.axios.post('/token', {}).then(response => {
                    this.token = response.data.token;
                    this.setToken();
                });
            },

            setToken() {
                window.axios.defaults.headers.common = {
                    'X-CSRF-TOKEN': this.token,
                    'X-Requested-With': 'XMLHttpRequest'
                };

                document.querySelector('meta[name="csrf-token"]').setAttribute("content", this.token);

                if (typeof window.Echo !== 'undefined') {
                    window.Echo.options.csrfToken = this.token;
                }
            }
        },
        beforeDestroy() {
            clearInterval(this.timer);
        },
    }
</script>

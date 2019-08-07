<template>
</template>
<script>
    export default {
        data() {
            return {}
        },
        name: 'Dashboard',
        computed: {},
        mounted() {
            document.title = this.$store.getters['application/getApplicationName'] + ' | Dashboard';
        },
        methods: {}
    }
</script>
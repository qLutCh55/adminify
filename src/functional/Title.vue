<template></template>
<script>
    export default {
        data() {
            return {
                pageTitle: null,
                originalTitle: document.title
            }
        },
        mounted() {
            this.setTitle();
        },
        methods: {
            setTitle() {
                if (typeof this.$route.name === 'string') {
                    this.pageTitle = this.$route.name;

                    if (this.originalTitle.indexOf('|') === -1) {
                        document.title = `${this.originalTitle} | ${this.pageTitle}`;
                    } else {
                        document.title = `${this.$store.getters['application/getApplicationName']} | ${this.pageTitle}`;
                    }
                } else {
                    this.pageTitle = null;
                    console.error('No title set for path [%s]', this.$route.path);
                }
            },
        },
        name: 'Title-Updater',
        watch: {
            '$route'() {
                this.setTitle();
            }
        },
    }
</script>
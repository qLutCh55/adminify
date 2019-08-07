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
                    if (this.originalTitle.indexOf('|') === -1) {
                        this.pageTitle = this.$route.name;
                        document.title = this.originalTitle + ' | ' + this.pageTitle;
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
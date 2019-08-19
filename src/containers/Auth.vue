<template>
    <v-app>
        <v-content>
            <video-bg :sources="['/static/video/'+ color +'.mp4']" :img="'/static/video/'+ color +'.jpg'">
                <v-container fluid fill-height>
                    <v-layout
                            justify-center
                            align-center
                            column
                    >
                        <slot></slot>
                    </v-layout>
                </v-container>
            </video-bg>
        </v-content>
    </v-app>
</template>
<script>

    export default {
        data() {
            return {
                colors: ['pink', 'orange', 'red'],
            }
        },
        name: 'Auth-Container',
        computed: {
            color() {
                return this.colors[Math.floor(Math.random() * this.colors.length)];
            }
        },
        mounted() {
            if (document.getElementById('pre-loader')) {
                this.$store.dispatch('auth/removePreLoader');
            }
        },
    }
</script>


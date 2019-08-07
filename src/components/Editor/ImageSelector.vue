<template>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card style="min-height: 100%;">
            <v-toolbar dark color="primary">
                <v-btn icon dark @click="closeImageSelect">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Images</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-container grid-list-sm fluid>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-upload
                                url="/images/uploadWithoutAttaching"
                                role="image"
                                accept="image/jpeg, image/png"
                                fileType="image"
                                @uploaded="uploadedImage"
                                @error="alertError"
                        ></v-upload>
                    </v-flex>
                    <v-flex xs12>
                        <v-card flat class="mt-2 mb-4">
                            <v-text-field
                                    v-model="searchQuery"
                                    prepend-icon="mdi-magnify"
                                    placeholder="Search"
                                    hide-details
                                    :disabled="fetchingImages"
                            ></v-text-field>
                        </v-card>
                    </v-flex>
                    <v-flex
                            v-for="(image, index) in images"
                            :key="index"
                            xs6 sm2
                            d-flex
                    >
                        <v-card flat tile class="d-flex">
                            <v-img
                                    @click="selectImage(image)"
                                    :src="'/images/' + image.hash + '-ft=200+200.' + image.type"
                                    :lazy-src="'/images/' + image.hash + '-ft=200+200.' + image.type"
                                    aspect-ratio="1"
                                    class="grey lighten-2 pointer"
                            >
                                <v-layout
                                        slot="placeholder"
                                        fill-height
                                        align-center
                                        justify-center
                                        ma-0
                                >
                                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                                </v-layout>
                            </v-img>
                        </v-card>
                    </v-flex>
                    <v-flex xs12 class="text-xs-center mt-2" v-if="noImagesFound && !fetchingImages">
                        <p class="red--text">Could not find any images...</p>
                    </v-flex>
                    <v-flex xs12 class="text-xs-center mt-2" v-if="thereIsMoreImages">
                        <v-btn @click="loadMoreImages" :disabled="fetchingImages" color="primary">Load More</v-btn>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        data() {
            return {
                dialog: true,
                fetchingImages: true,
                page: 0,
                images: [],
                searchQuery: '',
                timeout: null,
                noImagesFound: false,
                thereIsMoreImages: false,
            }
        },
        watch: {
            'searchQuery'() {
                this.fetchImagesDelayed();
            },
        },
        name: 'Editor-Image-Select-Dialog',
        mounted() {
            window.axios.post('/images/searchPaginated?page=' + this.page).then(response => {
                this.page++;
                this.fetchingImages = false;
                this.images = response.data.images.data;
                this.thereIsMoreImages = true;
            });
        },
        methods: {
            closeImageSelect() {
                this.$emit('close');
            },
            selectImage(image) {
                this.$emit('select', image);
            },
            fetchImagesDelayed() {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.images = [];
                    this.page = 1;
                    this.noImagesFound = false;
                    this.loadMoreImages();
                }, 500);
            },
            loadMoreImages() {
                this.fetchingImages = true;
                window.axios.post('/images/searchPaginated?page=' + this.page, {searchQuery: this.searchQuery}).then(response => {
                    if (response.data.images.total > 0) {
                        this.page++;
                        this.fetchingImages = false;
                        this.images = this.images.concat(response.data.images.data);
                        this.thereIsMoreImages = response.data.images.total > 18;
                    } else {
                        this.fetchingImages = false;
                        this.thereIsMoreImages = false;
                        this.noImagesFound = true;
                    }
                });
            },

            uploadedImage(response) {
                this.selectImage(response.image);
                this.$toasted.show('Image uploaded!', {
                    theme: "default",
                    position: "top-center",
                    duration: 2000
                });
            },
            alertError(message) {
                this.$toasted.show(message, {
                    theme: "error",
                    position: "top-center",
                    duration: 3500
                });
            }
        },
    }
</script>
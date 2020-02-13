<template>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card style="min-height: 100%;">
            <v-toolbar dark color="primary">
                <v-btn icon dark @click="closeImageManager">
                    <v-icon>$mdiClose</v-icon>
                </v-btn>
                <v-toolbar-title>Images</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn dark flat @click="closeImageManager">Close</v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-container grid-list-sm fluid>
                <v-layout wrap>
                    <v-flex xs12>
                        <v-upload
                                url="/images/upload"
                                :role="role"
                                :model-id="modelId"
                                :model="model"
                                accept="image/jpeg, image/png"
                                fileType="image"
                                @uploaded="uploadedImage"
                                @error="alertError"
                        ></v-upload>
                    </v-flex>
                    <v-flex xs12>
                        <draggable
                                v-model="nodes"
                                group="content"
                                :sort="true"
                                handle=".imageHandle"
                                @start="drag=true"
                                @end="drag=true"
                                @change="handleReorder"
                                class="layout wrap"
                        >
                            <v-flex
                                    v-for="(image, index) in nodes"
                                    :key="index"
                                    d-flex
                                    xs12 sm4 md2
                            >
                                <v-card flat tile class="d-flex v-gallery">
                                    <v-img
                                            :src="getImageUrl(image)"
                                            :lazy-src="`${getImageUrl(image)}`"
                                            aspect-ratio="1"
                                            class="grey lighten-2 imageHandle"
                                    >
                                        <v-layout
                                                slot="placeholder"
                                                fill-height
                                                align-center
                                                justify-center
                                                ma-0
                                        >
                                            <v-progress-circular
                                                    indeterminate
                                                    color="grey lighten-5"
                                            ></v-progress-circular>
                                        </v-layout>
                                    </v-img>
                                    <div class="v-gallery-actions">
                                        <v-tooltip bottom>
                                            <v-btn
                                                    slot="activator"
                                                    fab
                                                    small
                                                    color="error"
                                                    class="mx-0"
                                                    @click="handleDeleteImageFile(index)"
                                            >
                                                <v-icon>$mdiDelete</v-icon>
                                            </v-btn>
                                            <span>Delete</span>
                                        </v-tooltip>
                                    </div>
                                </v-card>
                            </v-flex>
                        </draggable>
                    </v-flex>
                </v-layout>
            </v-container>
            <v-confirm
                    :dialog.sync="deleteDialog"
                    :waiting.sync="deleteWaiting"
                    @cancel="cancelDelete"
                    @confirm="doDeleteImage"
            ></v-confirm>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        data() {
            return {
                dialog: true,

                nodes: [],

                deleteImageIndex: null,
                deleteDialog: false,
                deleteWaiting: false,
            }
        },
        name: 'Image-Manager-Dialog',
        mounted() {
            for (var i = 0, len = this.images.length; i < len; i++) {
                let image = this.images[i];
                this.nodes.push(image);
            }
        },
        props: {
            'model-id': {
                type: Number,
                required: true,
            },
            'model': {
                type: String,
                required: true,
            },
            'role': {
                type: String,
                default: 'images'
            },
            'images': {
                type: Array,
                required: true,
            },
        },
        methods: {
            closeImageManager() {
                this.$emit('close');
            },
            uploadedImage(response) {
                this.nodes.push(response.image);
                this.$emit('uploaded', response.image);
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
            },

            handleReorder() {
                window.axios.post('/images/reorder', {
                    ids: this.nodes.map(a => a.id),
                    modelId: this.modelId,
                    model: this.model,
                    role: this.role
                }).then(response => {
                    this.$emit('reorder', this.nodes);
                    this.$toasted.show("Update successful", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });
            },

            cancelDelete() {
                this.deleteImageIndex = null;
                this.deleteWaiting = false;
                this.deleteDialog = false;
            },
            handleDeleteImageFile(index) {
                this.deleteImageIndex = index;
                this.deleteDialog = true;
            },
            doDeleteImage() {
                this.deleteWaiting = true;
                window.axios.post('/images/clear', {
                    modelId: this.modelId,
                    model: this.model,
                    id: this.nodes[this.deleteImageIndex].id,
                    role: this.role
                }).then(response => {
                    this.$emit('delete', this.deleteImageIndex);
                    this.$delete(this.nodes, this.deleteImageIndex);
                    this.cancelDelete();
                    this.$toasted.show("Image deleted", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });
            },

            getImageUrl(image) {
                return '/images/' + image.hash + '-ft=' + 200 + '+' + 200 + '.' + image.type;
            }
        },
    }
</script>

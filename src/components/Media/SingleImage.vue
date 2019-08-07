<template>
    <v-card flat class="mb-1">
        <div v-if="uploading" class="text-xs-center">
            <v-progress-circular
                    :rotate="270"
                    :size="150"
                    :width="10"
                    :value="uploadingProgress"
                    color="primary"
            >
                {{ uploadingProgress }} %
            </v-progress-circular>
        </div>
        <div v-else>
            <div
                    class="dropbox mt-3"
                    @click="selectFile"
                    @dragover.prevent="updateDragDropFocus(true)"
                    @dragleave.prevent="updateDragDropFocus(false)"
                    @dragenter.prevent="updateDragDropFocus(true)"
                    @drop.prevent="detectFiles"
                    v-show="typeof object.hash === 'undefined'"
            >
                <input
                        v-if="uploadReady"
                        class="hidden"
                        ref="nodeFile"
                        type="file"
                        name="file"
                        accept="image/jpeg, image/png"
                        @change="detectFiles"
                        :disabled="disabled"
                />
                <p>
                    Drag your image<br> or click to browse
                </p>
            </div>
            <div v-if="typeof object.hash !== 'undefined'" class="text-xs-center">
                <img class="img-fluid" :src="imageUrl">
            </div>
        </div>
        <v-confirm
                :dialog.sync="deleteDialog"
                :waiting.sync="deleteWaiting"
                @cancel="cancelDelete"
                @confirm="doDeleteImage"
        ></v-confirm>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                    flat
                    color="error"
                    v-if="typeof object.hash !== 'undefined'"
                    @click="handleDeleteImage"
                    :disabled="disabled"
            >
                Remove
            </v-btn>
            <v-btn
                    flat
                    color="primary"
                    v-if="typeof object.hash !== 'undefined'"
                    @click="selectFile"
                    :disabled="disabled"
            >
                Change
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
    export default {
        data() {
            return {
                uploadReady: true,
                dragDropFocus: false,

                object: {},

                imageDetails: {},

                deleteDialog: false,
                deleteWaiting: false,

                uploading: false,
                uploadingProgress: null
            }
        },
        name: 'Single-Item',
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
            'details': {
                type: Object,
            },
            'width': {
                type: String,
                default: null
            },
            'height': {
                type: String,
                default: null
            },
            'actions': {
                type: Boolean,
                default: true
            },
            'disabled': {
                type: Boolean,
                default: false
            },
            'image': {
                type: Object,
                required: true,
            }
        },
        computed: {
            imageUrl() {
                if (this.width && this.height) {
                    return '/images/' + this.object.hash + '-ft=' + this.width + '+' + this.height + '.' + this.object.type;
                } else if (this.width) {
                    return '/images/' + this.object.hash + '-ft=' + this.width + '+' + (this.object.width / this.object.height) * this.width + '.' + this.object.type;
                } else if (this.height) {
                    return '/images/' + this.object.hash + '-ft=' + (this.object.height / this.object.width) * this.height + '+' + this.height + '.' + this.object.type;
                } else {
                    if (this.object.orientation == 'L') {
                        return '/images/' + this.object.hash + '-ct=' + 800 + '+' + 400 + '.' + this.object.type;
                    } else {
                        return '/images/' + this.object.hash + '-ct=' + 400 + '+' + 600 + '.' + this.object.type;
                    }
                }
            }
        },
        mounted() {
            this.object = this.image;
            if (this.details) {
                this.imageDetails = this.details;
            }
        },
        methods: {
            selectFile() {
                if (this.disabled) {
                    return false;
                }
                this.$refs.nodeFile.click();
            },
            detectFiles(e) {
                e.preventDefault();
                let fileList = e.target.files || e.dataTransfer.files;
                for (let i = 0, len = fileList.length; i < len; i++) {
                    this.uploadImage(fileList[i]);
                }
                this.clearFileInput();
            },
            clearFileInput() {
                this.uploadReady = false;
                this.$nextTick(() => {
                    this.uploadReady = true;
                })
            },
            uploadImage(image) {
                if (typeof image !== 'undefined' && this.verifyFileType(image)) {

                    this.uploading = true;

                    let data = new FormData();
                    data.append('modelId', this.modelId);
                    data.append('model', this.model);
                    data.append('role', this.role);
                    Object.keys(this.imageDetails).forEach(key => data.append(key, this.imageDetails[key]));
                    data.append(this.role, image, image.name);

                    window.axios.post('/images/upload', data, {
                        errorHandle: true,
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: (progressEvent) => {
                            this.uploadingProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        }
                    }).then(response => {
                        this.object = response.data.image;
                        this.$emit('newImage', this.object);
                        this.uploading = false;
                        this.uploadingProgress = 0;

                        this.$toasted.show("Image uploaded", {
                            theme: "default",
                            position: "top-center",
                            duration: 1500
                        });
                    }).catch(error => {
                        let message = "Whoops! Something went wrong";

                        if (error.response.status === 413) {
                            message = "Whoops! Image size is too large";
                        }

                        this.$toasted.show(message, {
                            theme: "error",
                            position: "top-center",
                            duration: 3500
                        });
                    });
                }
            },
            verifyFileType(image) {
                let allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (allowedTypes.indexOf(image.type) < 0) {
                    this.$toasted.show("Whoops! Seems like image " + image.name + " is the wrong image type!", {
                        theme: "error",
                        position: "top-center",
                        duration: 5000
                    });
                    return false;
                }
                return true;
            },
            updateDragDropFocus(focus) {
                this.dragDropFocus = focus;
            },
            cancelDelete() {
                this.deleteWaiting = false;
                this.deleteDialog = false;
            },
            handleDeleteImage() {
                this.deleteDialog = true;
            },
            doDeleteImage() {
                this.deleteWaiting = true;
                window.axios.post('/images/clear', {
                    modelId: this.modelId,
                    model: this.model,
                    id: this.object.id,
                    role: this.role
                }).then(response => {
                    this.object = {};
                    this.cancelDelete();
                    this.$emit('remove');
                    this.$toasted.show("Image deleted", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });
            },
        },
    }
</script>

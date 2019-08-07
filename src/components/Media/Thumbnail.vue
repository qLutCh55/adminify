<template>
    <div class="text-xs-center mb-3 v-thumbnail">
        <div class="v-thumbnail-avatar">
            <img
                    :src="thumbnailImage"
                    @click="changeThumbnail"
                    class="img-fluid"
                    :class="changeable? 'pointer' : ''"
                    v-if="!uploading"
            >
            <v-progress-circular
                    v-else
                    :rotate="270"
                    :size="150"
                    :width="10"
                    :value="uploadingProgress"
                    color="primary"
            >
                {{ uploadingProgress }} %
            </v-progress-circular>
        </div>
        <div class="v-thumbnail-actions" v-if="changeable">
            <v-tooltip bottom>
                <v-btn
                        slot="activator"
                        fab
                        small
                        color="primary"
                        @click="changeThumbnail"
                        :disabled="disabled"
                >
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <span>Change</span>
            </v-tooltip>

            <v-tooltip bottom>
                <v-btn
                        slot="activator"
                        fab
                        small
                        color="error"
                        @click="deleteDialog = true"
                        v-if="deleteable"
                        :disabled="disabled"
                >
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <span>Delete</span>
            </v-tooltip>
        </div>
        <input
                v-if="changeable"
                hidden
                type="file"
                ref="imageInput"
                class="hidden"
                :accept="accept"
                :disabled="disabled"
                @change="onFileChange"
        >
        <v-img-editor
                v-if="showEditor && changeable"
                :image="image"
                :ratios="['1:1']"
                :viewMode="1"
                @close="resetEditor"
                @save="upload"
        ></v-img-editor>
        <v-confirm
                v-if="changeable"
                :dialog.sync="deleteDialog"
                :waiting.sync="deleteWaiting"
                @cancel="deleteDialog = false"
                @confirm="doDelete"
        ></v-confirm>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                thumbnailImage: null,
                fileDetails: {},
                showEditor: false,
                image: {
                    blob: null,
                    url: null,
                    name: null,
                    type: null,
                },
                uploading: false,
                uploadingProgress: 0,
                deleteDialog: false,
                deleteWaiting: false,

                imageFlag: '',
            }
        },
        name: 'Thumbnail',
        props: {
            'thumbnail': {
                type: String,
                required: true
            },
            'flag': {
                type: String,
                default: ''
            },
            'accept': {
                type: String,
                default: '*',
            },
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
                required: true
            },
            'details': {
                type: Object,
            },
            'width': {
                type: String,
                default: '200',
            },
            'height': {
                type: String,
                default: '200',
            },
            'changeable': {
                type: Boolean,
                default: true,
            },
            'disabled': {
                type: Boolean,
                default: false,
            },
            'viewMode': {
                type: Number,
                default: 0
            }
        },
        computed: {
            deleteable() {
                return this.imageFlag === 'canDelete';
            }
        },
        watch: {},
        mounted() {
            this.thumbnailImage = this.thumbnail;
            if (this.details) {
                this.fileDetails = this.details;
            }
            this.imageFlag = this.flag;
        },
        methods: {
            changeThumbnail() {
                if (this.disabled) {
                    return false;
                }

                if (this.changeable) {
                    this.$refs.imageInput.click();
                }
            },
            onFileChange(e) {
                let fileList = e.target.files || e.dataTransfer.files;
                this.showImageEditor(fileList[0]);
            },
            showImageEditor(image) {
                if (typeof image !== 'undefined' && this.verifyFileType(image)) {
                    this.image = {
                        blob: image,
                        url: URL.createObjectURL(image),
                        name: image.name,
                        type: image.type,
                    };
                    this.showEditor = true;
                }
            },
            upload(image) {
                this.uploading = true;

                let data = new FormData();
                data.append('modelId', this.modelId);
                data.append('model', this.model);
                data.append('single', true);
                data.append('role', this.role);
                Object.keys(this.fileDetails).forEach(key => data.append(key, this.fileDetails[key]));
                data.append('thumbnail', image, image.name);

                window.axios.post('/images/upload', data, {
                    errorHandle: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        this.uploadingProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    }
                }).then(response => {
                    this.thumbnailImage = '/images/' + response.data.image.hash + '-ft=' + this.width + '+' + this.height + '.' + response.data.image.type;
                    this.imageFlag = 'canDelete';
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
            },
            verifyFileType(file) {
                if (this.accept && this.accept !== '*') {
                    let allowedTypes = this.accept.split(',').map(function (item) {
                        return item.trim();
                    });

                    if (allowedTypes.indexOf(file.type) < 0) {
                        this.$toasted.show("Whoops! Seems like thumbnail " + file.name + " is the wrong file type!", {
                            theme: "error",
                            position: "top-center",
                            duration: 5000
                        });
                        return false;
                    }
                }
                return true;
            },
            resetEditor() {
                this.image = {
                    blob: null,
                    url: null,
                    name: null,
                    type: null,
                };
                this.showEditor = false;
            },
            doDelete() {
                this.deleteWaiting = true;
                window.axios.post('/images/clear', {
                    modelId: this.modelId,
                    model: this.model,
                    role: this.role
                }).then(response => {
                    this.thumbnailImage = response.data.thumbnail;
                    this.imageFlag = '';
                    this.deleteWaiting = false;
                    this.deleteDialog = false;
                    this.$toasted.show("Thumbnail removed", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });
            },
        },
    }
</script>

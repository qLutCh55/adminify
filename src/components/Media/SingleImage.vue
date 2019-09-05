<template>
    <div
            class="single-image-wrapper"
            :style="aspectRatio == 1 ? 'max-width: 320px;' : ''"
    >
        <v-card flat>
            <v-card-title v-if="title">
                <h3 class="headline mb-0">{{ title }}</h3>
            </v-card-title>

            <v-card-text v-if="uploading">
                <v-progress-circular
                        :rotate="270"
                        :size="150"
                        :width="10"
                        :value="uploadingProgress"
                        color="primary"
                >
                    {{ uploadingProgress }} %
                </v-progress-circular>
            </v-card-text>

            <v-img
                    v-else-if="imageUrl"
                    :src="imageUrl"
                    :aspect-ratio="aspectRatio"
                    @click="changeImage"
            ></v-img>

            <v-card-text v-else>
                <v-btn
                        @click="changeImage"
                        color="primary"
                        :disabled="disabled"
                >
                    Click to upload
                </v-btn>
            </v-card-text>

            <v-card-actions v-if="imageUrl">
                <v-spacer></v-spacer>

                <v-btn
                        @click="changeImage"
                        text
                        :disabled="disabled"
                        color="success"
                >
                    Replace
                </v-btn>

                <v-btn
                        v-if="imageFlag !== 'cantDelete'"
                        @click="deleteDialog = true"
                        text
                        :disabled="disabled"
                        color="error"
                >
                    Remove
                </v-btn>

            </v-card-actions>
        </v-card>

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
                :image="newImage"
                :ratios="[ratio]"
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
                originalImage: null,

                showEditor: false,

                newImage: {
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
        name: 'Single-Image',
        props: {
            'image': {
                required: true
            },
            'flag': {
                type: String,
                default: ''
            },

            'modelId': {
                required: true,
            },
            'model': {
                required: true,
            },

            'title': {
                default: ''
            },
            'role': {
                type: String,
                required: true
            },

            'accept': {
                type: String,
                default: '*',
            },

            'width': {
                default: null
            },
            'height': {
                default: null
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
                default: 0
            },

            'ratio': {
                default: '1:1',
            },
        },
        computed: {
            deleteable() {
                return this.imageFlag === 'canDelete';
            },
            aspectRatioArray() {
                let ratios = this.ratio.split(':');

                if (typeof ratios[1] == 'undefined') {
                    ratios[1] = 1;
                }

                return ratios;
            },
            aspectRatio() {
                let ratios = this.aspectRatioArray;

                let finalRatio = parseInt(ratios[0]) / parseInt(ratios[1]);

                return finalRatio.toFixed(2);
            },
            imageWidth () {
                if (this.width) {
                    return this.width;
                }

                let calculatedWidth = 1000;

                if (this.originalImage && typeof this.originalImage.width !== 'undefined') {
                    calculatedWidth = this.originalImage.width;
                }

                calculatedWidth = calculatedWidth / parseInt(this.aspectRatioArray[0]);

                return Math.ceil(calculatedWidth);
            },
            imageHeight () {
                if (this.height) {
                    return this.height;
                }

                let calculatedHeight = 1000;

                if (this.originalImage && typeof this.originalImage.height !== 'undefined') {
                    calculatedHeight = this.originalImage.height;
                }

                calculatedHeight = calculatedHeight / parseInt(this.aspectRatioArray[1]);

                return Math.ceil(calculatedHeight);
            },
            imageExtension () {
                if (this.originalImage && typeof this.originalImage.type !== 'undefined') {
                    return this.originalImage.type;
                }

                return 'jpeg';
            },
            imageUrl() {
                if (this.originalImage) {
                    if (typeof this.originalImage.hash !== 'undefined') {
                        return this.buildUrlFromHash(this.originalImage.hash);
                    }

                    if (typeof this.originalImage.url !== 'undefined') {
                        return this.originalImage.url;
                    }
                }

                return '';
            }
        },
        watch: {},
        mounted() {
            this.originalImage = this.image;
            this.imageFlag = this.flag;
        },
        methods: {
            changeImage() {
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
                    this.newImage = {
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
                    this.$emit('update');
                    this.originalImage = response.data.image;
                    this.imageFlag = '';
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
                this.newImage = {
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
                    this.$emit('update');
                    if (typeof response.data.thumbnail !== 'undefined') {
                        this.originalImage = {
                            url: response.data.thumbnail
                        };
                        this.imageFlag = 'cantDelete';
                    } else {
                        this.originalImage = null;
                        this.imageFlag = '';
                    }

                    this.deleteWaiting = false;
                    this.deleteDialog = false;
                    this.$toasted.show("Image removed", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });
            },
            buildUrlFromHash(hash, width = null, height = null, extension = null) {
                if (!width) {
                    width = this.imageWidth;
                }

                if (!height) {
                    height = this.imageHeight;
                }

                if (!extension) {
                    extension = this.imageExtension;
                }

                return '/images/' + hash + '-ft=' + width + '+' + height + '.' + extension;
            }
        },
    }
</script>

<template>
    <div class="single-image-wrapper" :style="aspectRatio == 1 ? 'max-width: 320px;' : ''">
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
                v-else-if="originalImage"
                :src="originalImage"
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
            <v-card-actions v-if="originalImage">
                <v-spacer></v-spacer>
                <v-btn
                    @click="changeImage"
                    flat
                    :disabled="disabled"
                    color="success"
                >
                    Replace
                </v-btn>
                <v-btn
                    v-if="imageFlag !== 'cantDelete'"
                    @click="deleteDialog = true"
                    flat
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
            :ratios="[cropRatio]"
            :viewMode="1"
            @close="resetEditor"
            @save="upload"
        ></v-img-editor>
        <v-delete
            v-if="changeable"
            :dialog.sync="deleteDialog"
            :waiting.sync="deleteWaiting"
            @cancel="deleteDialog = false"
            @confirm="doDelete"
        ></v-delete>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                originalImage: null,
                fileDetails: {},
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
            'title': {
                default: ''
            },
            'image': {
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
            },
            'cropRatio': {
                default: '1:1',
            },
            'aspect-ratio': {
                default: '2.75',
            }
        },
        computed: {
            deleteable() {
                return this.imageFlag === 'canDelete';
            }
        },
        watch: {},
        mounted() {
            this.originalImage = this.image;
            if (this.details) {
                this.fileDetails = this.details;
            }
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
                Object.keys(this.fileDetails).forEach(key => data.append(key, this.fileDetails[key]));
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
                    this.originalImage = '/images/' + response.data.image.hash + '-ft=' + this.width + '+' + this.height + '.' + response.data.image.type;
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
                        this.originalImage = response.data.thumbnail;
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
        },
    }
</script>

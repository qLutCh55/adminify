<template>
    <v-card flat class="mb-1">
        <div v-if="uploading" class="text-xs-center">
            <template v-if="!multiple">
                <v-progress-circular
                        :rotate="270"
                        :size="150"
                        :width="10"
                        :value="uploadingProgress"
                        color="primary"
                        :indeterminate="uploadingProgress == 100"
                >
                    {{ uploadingProgress }} %
                </v-progress-circular>
            </template>
            <template v-else>
                <v-list>
                    <v-list-tile
                            v-for="(upload, index) in uploads"
                            :key="index"
                            avatar
                    >
                        <v-list-tile-content>
                            <v-list-tile-title v-text="upload.name"></v-list-tile-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                            <v-progress-circular
                                    :rotate="270"
                                    :value="upload.progress"
                                    color="primary"
                                    :indeterminate="upload.progress == 100"
                            >
                            </v-progress-circular>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list>
            </template>
        </div>
        <div v-else>
            <div
                    class="dropbox mt-3"
                    @click="selectFile"
                    @dragover.prevent="updateDragDropFocus(true)"
                    @dragleave.prevent="updateDragDropFocus(false)"
                    @dragenter.prevent="updateDragDropFocus(true)"
                    @drop.prevent="detectFiles"
                    v-show="uploadReady"
            >
                <input
                        class="hidden"
                        ref="nodeFile"
                        type="file"
                        name="file"
                        :accept="accept"
                        @change="detectFiles"
                        :multiple="multiple"
                />
                <p>
                    Drag your {{ fileType }}<br> or click to browse
                </p>
            </div>
        </div>
    </v-card>
</template>
<script>
    export default {
        data() {
            return {
                uploading: false,
                uploadingProgress: 0,
                uploadReady: true,

                dragDropFocus: false,

                uploads: {},
            }
        },
        name: 'Upload-Component',
        props: {
            'model': {
                default: null,
            },
            'modelId': {
                default: null,
            },
            'url': {
                type: String,
                required: true
            },
            'role': {
                type: String,
                required: true
            },
            'accept': {
                type: String,
                default: '*'
            },
            'file-type': {
                type: String,
                default: 'images'
            },
            'disabled': {
                type: Boolean,
                default: false
            },
            'multiple': {
                type: Boolean,
                default: false
            },
            'details': {
                type: Object,
                default: () => ({})
            },
        },
        mounted() {
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
                    this.uploadObject(fileList[i]);
                }
                this.clearFileInput();
            },
            clearFileInput() {
                this.uploadReady = false;
                this.$nextTick(() => {
                    this.uploadReady = true;
                })
            },
            updateDragDropFocus(focus) {
                this.dragDropFocus = focus;
            },

            uploadObject(object) {
                if (typeof object !== 'undefined' && this.verifyObjectType(object)) {
                    this.uploading = true;

                    let tmpUploadKey = Object.keys(this.uploads).length;

                    if (this.multiple) {
                        let newObject = {
                            name: object.name,
                            progress: 0
                        };
                        this.$set(this.uploads, tmpUploadKey, newObject);
                    }

                    let data = new FormData();

                    if (this.modelId) {
                        data.append('modelId', this.modelId);
                    }

                    if (this.model) {
                        data.append('model', this.model);
                    }

                    Object.keys(this.details).forEach(key => data.append(key, this.details[key]));

                    data.append('role', this.role);
                    data.append(this.role, object, object.name);

                    window.axios.post(this.url, data, {
                        errorHandle: true,
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: (progressEvent) => {
                            if (this.multiple) {
                                this.uploads[tmpUploadKey].progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            } else {
                                this.uploadingProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            }
                        }
                    }).then(response => {
                        this.$emit('uploaded', response.data);

                        if (this.multiple) {
                            delete this.uploads[tmpUploadKey];

                            if (!Object.keys(this.uploads).length) {
                                this.uploading = false;
                            }
                        } else {
                            this.uploadingProgress = 0;
                            this.uploading = false;
                        }
                    }).catch(error => {
                        let message = "Whoops! Something went wrong";

                        if (error.response.status === 413) {
                            message = "Whoops! Image size is too large";
                        }

                        this.$emit('error', message);

                        if (this.multiple) {
                            delete this.uploads[tmpUploadKey];

                            if (!Object.keys(this.uploads).length) {
                                this.uploading = false;
                            }
                        } else {
                            this.uploadingProgress = 0;
                            this.uploading = false;
                        }
                    });
                }
            },
            verifyObjectType(object) {
                if (this.accept === '*') {
                    return true;
                }

                let allowedTypes = this.accept.split(',').map((item) => {
                    return item.trim()
                });

                if (allowedTypes.indexOf(object.type) < 0) {
                    this.$toasted.show("Whoops! Seems like " + this.fileType + " " + object.name + " is the wrong " + this.fileType + " type!", {
                        theme: "error",
                        position: "top-center",
                        duration: 5000
                    });
                    return false;
                }
                return true;
            },
        },
    }
</script>
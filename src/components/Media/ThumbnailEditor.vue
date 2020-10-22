<template>
	<div class="text-center mb-3 v-thumbnail">
		<div class="v-thumbnail-avatar">
			<img
				:src="imageSrc"
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
		<div
			class="v-thumbnail-actions"
			v-if="changeable"
		>
			<v-tooltip bottom>
				<template v-slot:activator="{ on }">
					<v-btn
						v-on="on"
						fab
						small
						color="primary"
						@click="changeThumbnail"
						:disabled="disabled"
					>
						<v-icon>$mdiPencil</v-icon>
					</v-btn>
				</template>
				<span>Change</span>
			</v-tooltip>
			
			<v-tooltip bottom>
				<template v-slot:activator="{ on }">
					<v-btn
						v-on="on"
						fab
						small
						color="error"
						@click="deleteDialog = true"
						v-show="deleteable"
						:disabled="disabled"
					>
						<v-icon>$mdiDelete</v-icon>
					</v-btn>
				</template>
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

                imageWidth: null,
                imageHeight: null,

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
            }
        },
        name: 'Thumbnail-Editor',
        props: {
            'thumbnail': {
                required: true
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
            imageSrc() {
                let url = '/thumbnail/random/unknown.jpeg';

                if (this.thumbnailImage) {
                    if (typeof this.thumbnailImage.id !== 'undefined' && typeof this.thumbnailImage.hash !== 'undefined') {
                        url = '/images/' + this.thumbnailImage.hash + '-ft=' + this.imageWidth + '+' + this.imageHeight + '.' + this.thumbnailImage.type;
                    } else if (typeof this.thumbnailImage.model !== 'undefined' && typeof this.thumbnailImage.modelId !== 'undefined') {
                        url = '/thumbnail/' + this.thumbnailImage.model + '/' + this.thumbnailImage.modelId + '-s=' + this.imageWidth + 'x' + this.imageHeight + '.jpeg';
                    } else if (typeof this.thumbnailImage == 'string' && this.thumbnailImage !== '') {
                        url = this.thumbnailImage;
                    }
                }

                return url;
            },
            deleteable() {
                return (this.thumbnailImage && typeof this.thumbnailImage.canDelete && this.thumbnailImage.canDelete);
            }
        },
        watch: {
            'thumbnail'() {
                if (typeof this.thumbnail !== 'undefined') {
                    this.thumbnailImage = this.thumbnail;
                }
            }
        },
        mounted() {
            this.thumbnailImage = this.thumbnail;

            if (this.details) {
                this.fileDetails = this.details;
            }

            this.imageWidth = this.width;

            if (!this.height) {
                this.imageHeight = this.width;
            } else {
                this.imageHeight = this.height;
            }
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
                e.target.value = ''
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
                data.append('role', 'thumbnail');
                Object.keys(this.fileDetails).forEach(key => data.append(key, this.fileDetails[key]));
                data.append('thumbnail', image, image.name);
                data.append('single', true);

                window.axios.post('/images/upload', data, {
                    errorHandle: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        this.uploadingProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    }
                })
                    .then(response => {
                        this.thumbnailImage = response.data.image;
                        this.thumbnailImage.canDelete = true;
                        this.uploading = false;
                        this.uploadingProgress = 0;
                        this.$toasted.show("Image uploaded", {
                            theme: "default",
                            position: "top-center",
                            duration: 1500
                        });

                        this.$emit('changed');
                    })
                    .catch(error => {
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

                window.axios.post('/images/delete', {
                    id: this.thumbnailImage.id,
                    model: this.model,
                    modelId: this.modelId,
                }).then(response => {
                    this.thumbnailImage = {
                        model: this.model,
                        modelId: this.modelId
                    }
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

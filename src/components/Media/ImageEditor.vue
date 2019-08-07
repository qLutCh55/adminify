<template>
    <v-dialog v-model="show" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card class="image-editor-card">
            <v-toolbar dark color="primary">
                <v-btn icon dark @click.native="closeImageEdit">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Image editor</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn dark flat @click.native="closeImageEdit" v-if="!cropping">Close</v-btn>
                    <v-btn dark flat @click.native="cancelImageCrop" v-if="cropping && !setImageRatio">Cancel</v-btn>
                    <v-btn dark flat @click.native="undoImageEdit" v-if="cropped">Undo</v-btn>
                    <a :href="currentImage.url" :download="currentImage.name" class="v-btn v-btn--flat theme--dark"
                       v-if="downloadable">Download</a>
                    <v-btn dark flat @click.native="cropImage" v-if="cropping">Crop</v-btn>
                    <template v-else>
                        <v-btn dark flat @click.native="replaceImage" v-if="replaceAndReupload && cropped">Replace</v-btn>
                        <v-btn dark flat @click.native="saveImage">Save</v-btn>
                    </template>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text class="image-editor-content">
                <div class="editor" ref="editor">
                    <div class="canvas" @dblclick="dblclick">
                        <img ref="image" :alt="currentImage.name" :src="currentImage.url" @load="start">
                    </div>

                    <div class="image-editor-toolbar" v-if="cropper">
                        <v-btn-toggle>
                            <v-btn flat @click="moveCropper">
                                <v-icon>mdi-cursor-move</v-icon>
                            </v-btn>
                            <v-btn flat @click="cropCropper" v-if="!setImageRatio">
                                <v-icon>mdi-crop</v-icon>
                            </v-btn>
                            <v-btn flat @click="zoomInCropper">
                                <v-icon>mdi-magnify-plus-outline</v-icon>
                            </v-btn>
                            <v-btn flat @click="zoomOutCropper">
                                <v-icon>mdi-magnify-minus-outline</v-icon>
                            </v-btn>
                            <v-btn flat @click="rotateLeftCropper">
                                <v-icon>mdi-rotate-left</v-icon>
                            </v-btn>
                            <v-btn flat @click="rotateRightCropper">
                                <v-icon>mdi-rotate-right</v-icon>
                            </v-btn>
                            <v-btn flat @click="flipHorizontalCropper">
                                <v-icon>mdi-swap-horizontal</v-icon>
                            </v-btn>
                            <v-btn flat @click="flipVerticalCropper">
                                <v-icon>mdi-swap-vertical</v-icon>
                            </v-btn>
                            <v-menu offset-y v-if="ratios.length > 1">
                                <v-btn flat slot="activator">
                                    <v-icon>mdi-aspect-ratio</v-icon>
                                </v-btn>
                                <v-list>
                                    <v-list-tile
                                            :class="{'active-list-item' : selectedRatio(item)}"
                                            v-for="(item, index) in ratios"
                                            :key="index"
                                            @click="setRatio(item)"
                                    >
                                        <v-list-tile-title>{{ item }}</v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>

                        </v-btn-toggle>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
    import Cropper from 'cropperjs';

    export default {
        data() {
            return {
                show: true,
                cropped: false,
                setImageRatio: false,
                cropping: false,
                canvasData: null,
                cropBoxData: null,
                croppedData: null,
                cropper: null,
                previousImage: '',
                currentImage: {},
                cropRatio: 'Free',
                ratio: 'NaN',
            }
        },
        props: {
            image: {
                type: Object,
                required: true,
            },
            ratios: {
                type: Array,
                default: () => ['Free', '16:9', '4:3', '1:1', '2:3']
            },
            'viewMode': {
                type: Number,
                default: 0,
            },
            'replaceAndReupload': {
                type: Boolean,
                default: false,
            }
        },
        computed: {
            downloadable() {
                if (this.image.url) {
                    return true;
                }
                return false;
            },
        },
        watch: {
            cropRatio() {
                if (this.cropper) {
                    this.changeAspectRatio();
                }
            }
        },
        name: 'Image-Editor',
        mounted() {
            if (this.ratios.length == 1) {
                this.cropRatio = this.ratios[0];
                this.setAspectRatio();
                this.setImageRatio = true;
            }
            this.currentImage = this.image;
            window.addEventListener('keydown', (this.onKeydown = this.keydown.bind(this)));
        },
        beforeDestroy() {
            window.removeEventListener('keydown', this.onKeydown);
            this.stop();
        },
        methods: {
            closeImageEdit() {
                this.reset();
                this.$emit('close');
            },
            cancelImageCrop() {
                if (this.cropping) {
                    this.cropper.clear();
                    this.cropping = false;
                }
            },
            undoImageEdit() {
                this.restore();
            },
            cropImage() {
                this.crop();
            },
            replaceImage() {
                if (this.currentImage.url.indexOf('data:') !== -1) {
                    this.dataURItoBlob(this.currentImage.url).then(blob => {
                        this.currentImage.blob = this.blobToFile(blob, this.currentImage.name);
                        this.postReplaceImage();
                    });
                } else {
                    this.postReplaceImage();
                }
            },
            saveImage() {
                if (this.currentImage.url.indexOf('data:') !== -1) {
                    this.dataURItoBlob(this.currentImage.url).then(blob => {
                        this.currentImage.blob = this.blobToFile(blob, this.currentImage.name);
                        this.postImage();
                    });
                } else {
                    this.postImage();
                }
            },
            postReplaceImage() {
                this.$emit('replace', this.currentImage.blob);
                this.closeImageEdit();
            },
            postImage() {
                this.$emit('save', this.currentImage.blob);
                this.closeImageEdit();
            },
            restore() {
                if (this.cropped) {
                    this.cropped = false;
                    this.currentImage.url = this.previousImage;
                    this.previousImage = '';
                }
            },
            setAspectRatio() {
                this.ratio = 'NaN';
                if (this.cropRatio == '16:9') {
                    this.ratio = 16 / 9
                } else if (this.cropRatio == '4:3') {
                    this.ratio = 4 / 3
                } else if (this.cropRatio == '1:1') {
                    this.ratio = 1 / 1
                } else if (this.cropRatio == '2:3') {
                    this.ratio = 2 / 3
                }
            },
            changeAspectRatio() {
                this.setAspectRatio();
                this.stop();
                this.start();
            },
            reset() {
                this.stop();
                this.cropped = false;
                this.cropping = false;
                this.previousImage = '';
                this.currentImage = {
                    name: '',
                    type: '',
                    url: '',
                };
            },
            stop() {
                if (this.cropper) {
                    this.cropper.destroy();
                    this.cropper = null;
                }
            },
            crop() {
                if (this.cropping) {
                    this.croppedData = this.cropper.getData();
                    this.canvasData = this.cropper.getCanvasData();
                    this.cropBoxData = this.cropper.getCropBoxData();
                    this.cropped = true;
                    this.cropping = false;
                    this.previousImage = this.currentImage.url;
                    this.currentImage.url = this.cropper.getCroppedCanvas(this.currentImage.type === 'image/png' ? {} : {
                        fillColor: '#fff',
                    }).toDataURL(this.currentImage.type);
                    this.stop();
                }
            },
            start() {
                if (this.cropped) {
                    return;
                }

                let automaticCropping = false;
                if (this.setImageRatio) {
                    automaticCropping = true;
                }

                this.cropper = new Cropper(this.$refs.image, {
                    autoCrop: automaticCropping,
                    dragMode: 'move',
                    background: false,
                    aspectRatio: this.ratio,
                    viewMode: this.viewMode,

                    ready: () => {
                        if (this.croppedData) {
                            this.cropper
                                .crop()
                                .setData(this.croppedData)
                                .setCanvasData(this.canvasData)
                                .setCropBoxData(this.cropBoxData);

                            this.croppedData = null;
                            this.canvasData = null;
                            this.cropBoxData = null;
                        }
                    },

                    crop: ({detail}) => {
                        if (detail.width > 0 && detail.height > 0 && !this.cropping) {
                            this.cropping = true;
                        }
                    },
                });
            },
            moveCropper() {
                this.cropper.setDragMode('move');
            },
            cropCropper() {
                this.cropper.setDragMode('crop');
                this.cropping = true;
            },
            zoomInCropper() {
                this.cropper.zoom(0.1);
            },
            zoomOutCropper() {
                this.cropper.zoom(-0.1);
            },
            rotateLeftCropper() {
                this.cropper.rotate(-90);
            },
            rotateRightCropper() {
                this.cropper.rotate(90);
            },
            flipHorizontalCropper() {
                this.cropper.scaleX(-this.cropper.getData().scaleX || -1);
            },
            flipVerticalCropper() {
                this.cropper.scaleY(-this.cropper.getData().scaleY || -1);
            },
            setRatio(ratio) {
                this.cropRatio = ratio;
            },
            selectedRatio(ratio) {
                if (ratio == this.cropRatio) {
                    return true;
                }
                return false;
            },
            dblclick(e) {
                if (e.target.className.indexOf('cropper-face') >= 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.crop();
                    this.cropping = true;
                }
            },
            keydown(e) {
                switch (e.key) {
                    // Undo crop
                    case 'z':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.restore();
                        }

                        break;

                    // Delete the image
                    case 'Delete':
                        this.reset();
                        break;

                    default:
                }

                if (!this.cropper) {
                    return;
                }

                switch (e.key) {
                    // Crop the image
                    case 'Enter':
                        this.crop();
                        break;

                    // Clear crop area
                    case 'Escape':
                        this.clear();
                        break;

                    // Move to the left
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.cropper.move(-1, 0);
                        break;

                    // Move to the top
                    case 'ArrowUp':
                        e.preventDefault();
                        this.cropper.move(0, -1);
                        break;

                    // Move to the right
                    case 'ArrowRight':
                        e.preventDefault();
                        this.cropper.move(1, 0);
                        break;

                    // Move to the bottom
                    case 'ArrowDown':
                        e.preventDefault();
                        this.cropper.move(0, 1);
                        break;

                    // Enter crop mode
                    case 'c':
                        this.cropper.setDragMode('crop');
                        break;

                    // Enter move mode
                    case 'm':
                        this.cropper.setDragMode('move');
                        break;

                    // Zoom in
                    case 'i':
                        this.cropper.zoom(0.1);
                        break;

                    // Zoom out
                    case 'o':
                        this.cropper.zoom(-0.1);
                        break;

                    // Rotate left
                    case 'l':
                        this.cropper.rotate(-90);
                        break;

                    // Rotate right
                    case 'r':
                        this.cropper.rotate(90);
                        break;

                    // Flip horizontal
                    case 'h':
                        this.cropper.scaleX(-this.cropper.getData().scaleX || -1);
                        break;

                    // Flip vertical
                    case 'v':
                        this.cropper.scaleY(-this.cropper.getData().scaleY || -1);
                        break;

                    default:
                }
            },
            dataURItoBlob(dataURI) {
                return new Promise((resolve, reject) => {
                    // convert base64 to raw binary data held in a string
                    let byteString = atob(dataURI.split(',')[1]);

                    // separate out the mime component
                    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                    // write the bytes of the string to an ArrayBuffer
                    let arrayBuffer = new ArrayBuffer(byteString.length);
                    let _ia = new Uint8Array(arrayBuffer);
                    for (let i = 0; i < byteString.length; i++) {
                        _ia[i] = byteString.charCodeAt(i);
                    }

                    let dataView = new DataView(arrayBuffer);
                    let blob = new Blob([dataView], {type: mimeString});

                    resolve(blob);
                })
            },
            blobToFile(theBlob, fileName) {
                theBlob.lastModifiedDate = new Date();
                theBlob.name = fileName;
                return theBlob;
            }
        }
    }
</script>
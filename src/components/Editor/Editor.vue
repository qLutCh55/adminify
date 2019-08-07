<template>
    <v-card flat>
        <v-card-text v-if="!loading">
            <ckeditor
                    class="ck-editor-border"
                    :disabled="!editable"
                    :editor="editor"
                    v-model="editorData"
                    :config="editorConfig"
            ></ckeditor>
        </v-card-text>
        <v-card-actions v-if="editable">
            <v-btn
                    color="primary"
                    @click="$emit('html', editorData)"
                    :loading="loadingActions"
                    :disabled="!disabledActions"
            >
                HTML
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
                    color="success"
                    @click="$emit('update', editorData)"
                    :loading="loadingActions"
                    :disabled="!disabledActions"
            >
                Save
            </v-btn>
            <v-btn
                    color="error"
                    @click="$emit('delete')"
                    :loading="loadingActions"
                    :disabled="!disabledActions"
            >
                Delete
            </v-btn>
        </v-card-actions>
        <image-selector
                v-if="selectImageDialog"
                @select="selectImage"
                @close="closeImageDialog"
        ></image-selector>
    </v-card>
</template>
<script>
    import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
    import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
    import AutoFormat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
    import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
    import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
    import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
    import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
    import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
    import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
    import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
    import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
    import Heading from '@ckeditor/ckeditor5-heading/src/heading';
    import Image from '@ckeditor/ckeditor5-image/src/image';
    import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
    import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
    import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
    import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
    import Link from '@ckeditor/ckeditor5-link/src/link';
    import List from '@ckeditor/ckeditor5-list/src/list';
    import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
    import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
    import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
    import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
    import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
    import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
    import Table from '@ckeditor/ckeditor5-table/src/table';
    import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
    import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';

    import UploadAdapter from './upload-adapter';
    import InsertImage from './insert-image';

    import ImageSelector from './ImageSelector';

    function UploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new UploadAdapter(loader);
        };
    }

    function InsertImagePlugin(editor) {
        return new InsertImage(editor);
    }

    export default {
        data() {
            return {
                loading: true,
                selectImageDialog: false,
                tmpEditor: null,
                editor: ClassicEditor,
                editorData: '',
                editorConfig: {
                    plugins: [
                        Essentials,
                        AutoFormat,
                        Bold,
                        Italic,
                        Strikethrough,
                        Underline,
                        Subscript,
                        Superscript,
                        Code,
                        BlockQuote,
                        Heading,
                        Image,
                        ImageCaption,
                        ImageStyle,
                        ImageToolbar,
                        ImageUpload,
                        Link,
                        List,
                        Paragraph,
                        Alignment,
                        FontSize,
                        FontColor,
                        FontBackgroundColor,
                        RemoveFormat,
                        Table,
                        TableToolbar,
                        MediaEmbed,
                        UploadAdapterPlugin,
                        InsertImagePlugin
                    ],

                    fontSize: {
                        options: [
                            'tiny',
                            'small',
                            'default',
                            'big',
                            'huge'
                        ]
                    },

                    table: {
                        contentToolbar: [
                            'tableColumn',
                            'tableRow',
                            'mergeTableCells'
                        ]
                    },

                    image: {
                        toolbar: [
                            'imageStyle:full',
                            'imageStyle:alignLeft',
                            'imageStyle:alignCenter',
                            'imageStyle:alignRight',
                            '|',
                            'imageTextAlternative'
                        ],
                        styles: [
                            'full',
                            'alignLeft',
                            'alignCenter',
                            'alignRight'
                        ]
                    },

                    mediaEmbed: {
                        // configuration...
                    },

                    fontColor: {
                        colors: [
                            {
                                color: '#3490dc',
                                label: 'Blue'
                            },
                            {
                                color: '#6574cd',
                                label: 'Indigo'
                            },
                            {
                                color: '#9561e2',
                                label: 'Purple'
                            },
                            {
                                color: '#f66d9b',
                                label: 'Pink'
                            },
                            {
                                color: '#e3342f',
                                label: 'Red'
                            },
                            {
                                color: '#f6993f',
                                label: 'Orange'
                            },
                            {
                                color: '#ffed4a',
                                label: 'Yellow'
                            },
                            {
                                color: '#38c172',
                                label: 'Green'
                            },
                            {
                                color: '#4dc0b5',
                                label: 'Teal'
                            },
                            {
                                color: '#6cb2eb',
                                label: 'Cyan'
                            },
                            {
                                color: '#000000',
                                label: 'Black'
                            },
                            {
                                color: '#ffffff',
                                label: 'White',
                                hasBorder: true
                            },
                        ]
                    },

                    fontBackgroundColor: {
                        colors: [
                            {
                                color: '#3490dc',
                                label: 'Blue'
                            },
                            {
                                color: '#6574cd',
                                label: 'Indigo'
                            },
                            {
                                color: '#9561e2',
                                label: 'Purple'
                            },
                            {
                                color: '#f66d9b',
                                label: 'Pink'
                            },
                            {
                                color: '#e3342f',
                                label: 'Red'
                            },
                            {
                                color: '#f6993f',
                                label: 'Orange'
                            },
                            {
                                color: '#ffed4a',
                                label: 'Yellow'
                            },
                            {
                                color: '#38c172',
                                label: 'Green'
                            },
                            {
                                color: '#4dc0b5',
                                label: 'Teal'
                            },
                            {
                                color: '#6cb2eb',
                                label: 'Cyan'
                            },
                            {
                                color: '#000000',
                                label: 'Black'
                            },
                            {
                                color: '#ffffff',
                                label: 'White',
                                hasBorder: true
                            },
                        ]
                    },

                    toolbar: {
                        items: [
                            'heading',
                            '|',
                            'alignment',
                            '|',
                            'bold',
                            'italic',
                            'strikethrough',
                            'underline',
                            'subscript',
                            'superscript',
                            'code',
                            'removeFormat',
                            '|',
                            'link',
                            'insertImage',
                            'blockQuote',
                            'mediaEmbed',
                            'insertTable',
                            '|',
                            'bulletedList',
                            'numberedList',
                            '|',
                            'fontSize',
                            'fontColor',
                            'fontBackgroundColor',
                        ]
                    },

                    language: 'en'
                }
            }
        },
        props: {
            'content': {
                type: String,
                default: ''
            },
            'editable': {
                type: Boolean,
                default: false
            },
            'loading-actions': {
                type: Boolean,
                default: false
            },
            'disabled-actions': {
                type: Boolean,
                default: false
            },
        },
        components: {
            ImageSelector
        },
        name: 'Editor',
        watch: {
            'content'() {
                if (this.content) {
                    this.editorData = this.content;
                } else {
                    this.editorData = '';
                }
            }
        },
        mounted() {
            document.addEventListener("selectImage", (e) => {
                this.showImageDialog(e.detail);
            });

            if (this.content) {
                this.editorData = this.content;
            } else {
                this.editorData = '';
            }

            this.loading = false;
        },
        methods: {
            showImageDialog(editor) {
                this.selectImageDialog = true;
                this.tmpEditor = editor;
            },
            closeImageDialog() {
                this.selectImageDialog = false;
                this.tmpEditor = null;
            },
            selectImage(image) {
                let editor = this.tmpEditor;
                let hash = image.hash;
                let extension = image.type;
                // let maxWidth = image.width;
                // let responsiveWidths = ['320', '480', '680', '800', '960', '1280', '1600'];

                let urls = {
                    default: window.location.protocol + '//' + window.location.host + '/images/' + hash + '.' + extension
                };

                // for (let i = 0, len = responsiveWidths.length; i < len; i++) {
                //     let width = parseInt(responsiveWidths[i]);
                //
                //     if (width < maxWidth) {
                //         urls[width] = window.location.protocol + '//' + window.location.host + '/images/' + hash + '-fw=' + width + '.' + extension;
                //     }
                // }

                editor.model.change(writer => {

                    const imageElement = writer.createElement('image', {
                        src: urls.default,
                    });

                    // let maxWidth = 0;
                    //
                    // const srcsetAttribute = Object.keys(urls)
                    // // Filter out keys that are not integers.
                    //     .filter(key => {
                    //         const width = parseInt(key, 10);
                    //
                    //         if (!isNaN(width)) {
                    //             maxWidth = Math.max(maxWidth, width);
                    //
                    //             return true;
                    //         }
                    //     })
                    //
                    //     // Convert each key to srcset entry.
                    //     .map(key => `${urls[key]} ${key}w`)
                    //
                    //     // Join all entries.
                    //     .join(', ');
                    //
                    // if (srcsetAttribute !== '') {
                    //     writer.setAttribute('srcset', {
                    //         data: srcsetAttribute,
                    //         width: maxWidth
                    //     }, imageElement);
                    // }

                    // Insert the image in the current selection location.
                    editor.model.insertContent(imageElement, editor.model.document.selection);
                });

                this.closeImageDialog();
            }
        },
        destroyed() {
            document.removeEventListener("selectImage", () => {
            });
        },
    }
</script>
<style lang="scss">
    .ck-editor-border {
        border: 1px solid rgba(0, 0, 0, 0.15) !important;
        padding: 2em !important;
    }
</style>
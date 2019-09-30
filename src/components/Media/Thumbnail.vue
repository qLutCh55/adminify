<template>
    <v-avatar :size="imageWidth">
        <img :src="imageSrc">
    </v-avatar>
</template>
<script>
    export default {
        data() {
            return {
                image: null,

                imageWidth: null,
                imageHeight: null,
            }
        },
        name: 'Thumbnail',
        props: {
            'thumbnail': {
                required: true
            },
            'width': {
                default: '200',
            },
            'height': {
                required: false,
            },
        },
        computed: {
            imageSrc() {
                let url = '/avatar/random/unknown.jpeg';

                if (this.image) {
                    if (typeof this.image.id !== 'undefined' && typeof this.image.hash !== 'undefined') {
                        url = '/images/' + this.image.hash + '-ft=' + this.imageWidth + '+' + this.imageHeight + '.' + this.image.type;
                    } else if (typeof this.image.model !== 'undefined' && typeof this.image.modelId !== 'undefined') {
                        url = '/avatar/' + this.image.model + '/' + this.image.modelId + '-s=' + this.imageWidth + 'x' + this.imageHeight + '.jpeg';
                    } else if (typeof this.image == 'string' && this.image !== '') {
                        url = this.image;
                    }
                }

                return url;
            }
        },
        watch: {
            'thumbnail'() {
                if (typeof this.thumbnail !== 'undefined') {
                    this.image = this.thumbnail;
                }
            }
        },
        mounted() {
            this.image = this.thumbnail;
            this.imageWidth = this.width;

            if (!this.height) {
                this.imageHeight = this.width;
            } else {
                this.imageHeight = this.height;
            }
        }
    }
</script>

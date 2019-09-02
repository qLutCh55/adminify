<template>
    <v-card class="text-xs-center" flat>
        <v-card-text v-if="loading || !loaded" class="audio-uploading-progress">
            <v-progress-circular
                    :size="50"
                    color="primary"
                    indeterminate
            ></v-progress-circular>
        </v-card-text>
        <v-card-text v-if="loaded" :class="noList ? 'pb-0' : ''">
            <v-btn class="ma-0" outline icon color="primary" @click.native="playing ? pause() : play()"
                   :disabled="loaded === false">
                <v-icon v-if="playing === false || paused === true">mdi-play</v-icon>
                <v-icon v-else>mdi-pause</v-icon>
            </v-btn>
            <v-btn class="ma-0" outline icon color="primary" v-if="nodes.length > 1" @click.native="previousTrack()"
                   :disabled="loaded === false">
                <v-icon>mdi-skip-previous</v-icon>
            </v-btn>
            <v-btn class="ma-0" outline icon color="primary" @click.native="stop()" :disabled="loaded === false">
                <v-icon>mdi-stop</v-icon>
            </v-btn>
            <v-btn class="ma-0" outline icon color="primary" v-if="nodes.length > 1" @click.native="nextTrack()"
                   :disabled="loaded === false">
                <v-icon>mdi-skip-next</v-icon>
            </v-btn>
            <v-btn class="ma-0" outline icon color="warning" @click.native="mute()" :disabled="loaded === false">
                <v-icon v-if="isMuted === false">mdi-volume-high</v-icon>
                <v-icon v-else>mdi-volume-off</v-icon>
            </v-btn>
            <v-btn class="ma-0" outline icon color="success" @click.native="loaded ? download() : reload()">
                <v-icon v-if="loaded === false">mdi-refresh</v-icon>
                <v-icon v-else>mdi-download</v-icon>
            </v-btn>
            <v-slider class="mt-2" hide-details @click.native="setPosition()" v-model="percentage"
                      color="primary"></v-slider>
            <p class="mb-0">{{ currentTime }} / {{ duration }}</p>
        </v-card-text>
        <audio ref="player" v-on:ended="ended" v-on:canplay="canPlay" :src="currentTrack.url"></audio>
        <v-card-text v-if="loaded && !noList">
            <v-list>
                <template v-for="(item, index) in nodes">
                    <v-list-tile
                            :key="index"
                            avatar
                            :class="activeTrack(index) ? 'primary' : ''"
                    >
                        <v-list-tile-action>
                            <v-icon v-if="activeTrack(index)" color="white">mdi-chart-bar-stacked</v-icon>
                            <v-icon class="playlist-play-button" @click="setTrackAndPlay(index)" v-else>mdi-play
                            </v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title :class="activeTrack(index) ? 'white--text' : ''">{{
                                item.metadata.basename }}
                            </v-list-tile-title>
                            <v-list-tile-sub-title :class="activeTrack(index) ? 'white--text' : ''">{{
                                humanFileSize(item.size) }}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-divider v-if="index !== nodes.length - 1"></v-divider>
                </template>
            </v-list>
        </v-card-text>
    </v-card>
</template>
<script>
    const formatTime = (second) => {
        return new Date(second * 1000).toISOString().substr(11, 8);
    };

    export default {
        data() {
            return {
                nodes: [],
                currentTrack: {
                    url: ''
                },
                currentIndex: null,
                loading: true,

                isMuted: false,
                loaded: false,
                playing: false,
                paused: false,
                percentage: 0,
                currentTime: '00:00:00',
                audio: undefined,
                totalDuration: 0,
            }
        },
        name: 'Audio-Playlist',
        props: {
            'files': {
                type: Array,
                default: () => ([])
            },
            'autoPlay': {
                type: Boolean,
                default: false
            },
            'ended': {
                type: Function,
                default: () => {
                },
            },
            'canPlay': {
                type: Function,
                default: () => {
                },
            },
            'noList': {
                type: Boolean,
                default: false,
            },
        },
        mounted() {
            this.nodes = this.files;
            this.setTrack().then(response => {
                this.audio = this.$refs.player;
                this.init();
                this.loading = false;
            });
        },
        computed: {
            duration: function () {
                return this.audio ? formatTime(this.totalDuration) : '';
            },
            firstTrack() {
                return this.currentIndex == 0;
            },
            lastTrack() {
                return this.currentIndex == this.nodes.length - 1;
            },
        },
        methods: {
            setPosition() {
                this.audio.currentTime = parseInt(this.audio.duration / 100 * this.percentage);
            },
            stop() {
                this.paused = this.playing = false;
                this.audio.pause();
                this.audio.currentTime = 0;
            },
            play() {
                if (this.playing) return;
                this.paused = false;
                this.audio.play();
                this.playing = true;
            },
            pause() {
                this.paused = !this.paused;
                (this.paused) ? this.audio.pause() : this.audio.play();
            },
            download() {
                this.audio.pause();
                window.open(this.currentTrack.url, 'download');
            },
            mute() {
                this.isMuted = !this.isMuted;
                this.audio.muted = this.isMuted;
                this.volumeValue = this.isMuted ? 0 : 75;
            },
            reload() {
                this.audio.load();
            },
            activeTrack(index) {
                return index == this.currentIndex;
            },
            setTrack(index) {
                return new Promise((resolve, reject) => {
                    if (typeof index == 'undefined') {
                        index = 0;
                    }

                    this.currentTrack = this.nodes[index];
                    this.currentIndex = index;

                    resolve();
                });
            },
            previousTrack() {
                if (this.currentIndex !== 0) {
                    this.setTrack(this.currentIndex - 1);
                } else {
                    this.setTrack(this.nodes.length - 1);
                }
            },
            nextTrack() {
                if (this.currentIndex !== this.nodes.length - 1) {
                    this.setTrack(this.currentIndex + 1);
                } else {
                    this.setTrack();
                }
            },
            setTrackAndPlay(index) {
                this.stop();
                this.setTrack(index).then(response => {
                    this.audio.play();
                });
            },
            _handleLoaded: function () {
                if (this.audio.readyState >= 2) {
                    if (this.autoPlay) this.audio.play();
                    this.loaded = true;
                    this.totalDuration = parseInt(this.audio.duration);
                } else {
                    throw new Error('Failed to load sound file');
                }
            },
            _handlePlayingUI: function (e) {
                this.percentage = this.audio.currentTime / this.audio.duration * 100;
                this.currentTime = formatTime(this.audio.currentTime);
            },
            _handlePlayPause: function (e) {
                if (e.type === 'pause' && this.paused === false && this.playing === false) {
                    this.currentTime = '00:00:00';
                }
            },
            _handleEnded() {
                this.paused = this.playing = false;
            },
            init: function () {
                this.audio.addEventListener('timeupdate', this._handlePlayingUI);
                this.audio.addEventListener('loadeddata', this._handleLoaded);
                this.audio.addEventListener('pause', this._handlePlayPause);
                this.audio.addEventListener('play', this._handlePlayPause);
                this.audio.addEventListener('ended', this._handleEnded);
            },
        },
        beforeDestroy() {
            this.audio.removeEventListener('timeupdate', this._handlePlayingUI);
            this.audio.removeEventListener('loadeddata', this._handleLoaded);
            this.audio.removeEventListener('pause', this._handlePlayPause);
            this.audio.removeEventListener('play', this._handlePlayPause);
            this.audio.removeEventListener('ended', this._handleEnded);
        }
    }
</script>
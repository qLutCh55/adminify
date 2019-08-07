import Vue from 'vue';

Vue.component('v-node-table', require('./Tables/Index').default);
Vue.component('v-sub-table', require('./Tables/Sub-Index').default);

Vue.component('v-confirm', require('./Dialogs/ConfirmDialog').default);
Vue.component('v-create', require('./Dialogs/CreateDialog').default);

Vue.component('v-image-manager', require('./Dialogs/ImageManager').default);
Vue.component('v-file-manager', require('./Dialogs/FileManager').default);

Vue.component('v-thumbnail', require('./Media/Thumbnail').default);
Vue.component('v-img-editor', require('./Media/ImageEditor').default);
Vue.component('v-single-image', require('./Media/SingleImage').default);

Vue.component('v-upload', require('./Media/Upload').default);

Vue.component('v-editor', require('./Editor/Editor').default);

Vue.component('draggable', require('vuedraggable'));

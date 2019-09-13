<template>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card style="min-height: 100%;">
            <v-toolbar dark color="primary">
                <v-btn icon dark @click="closeFileManager">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Files</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn dark flat @click="closeFileManager">Close</v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-container grid-list-sm fluid>
                <v-layout wrap align-center justify-center>
                    <v-flex xs12 md6>
                        <v-upload
                            url="/files/upload"
                            :role="role"
                            :model-id="modelId"
                            :model="model"
                            accept="*"
                            fileType="file"
                            @uploaded="uploadedFile"
                            @error="alertError"
                        >
                            Drag your file<br> or click to upload
                        </v-upload>

                        <div class="text-xs-center">
                            <v-btn color="primary" @click="openFileBrowserDialog">
                                Click to browse uploaded files
                            </v-btn>
                        </div>
                    </v-flex>
                    <v-flex xs12>
                        <draggable
                            v-model="nodes"
                            group="content"
                            :sort="true"
                            handle=".fileHandle"
                            @start="drag=true"
                            @end="drag=true"
                            @change="handleReorder"
                            class="layout wrap"
                        >
                            <v-flex
                                v-for="(file, index) in nodes"
                                :key="index"
                                d-flex
                                xs12 sm4 md2
                            >
                                <v-card flat class="fileHandle" style="max-width: 170px;">
                                    <v-card-text class="text-xs-center">
                                        <v-icon size="100">mdi {{ getFileIcon(file) }}</v-icon>
                                        <p class="mb-0 truncate" :title="file.metadata.basename">{{
                                            file.metadata.basename }}</p>
                                    </v-card-text>
                                    <v-card-actions class="justify-center align-center">
                                        <v-tooltip bottom v-if="file.viewable">
                                            <v-btn slot="activator" icon flat small color="warning" class="mx-0"
                                                   @click="handleViewFile(index)">
                                                <v-icon>mdi-eye</v-icon>
                                            </v-btn>
                                            <span>View</span>
                                        </v-tooltip>

                                        <v-tooltip bottom v-else>
                                            <v-btn slot="activator" icon flat small color="success" class="mx-0"
                                                   @click="handleDownloadFile(index)">
                                                <v-icon>mdi-download</v-icon>
                                            </v-btn>
                                            <span>Download</span>
                                        </v-tooltip>

                                        <v-tooltip bottom>
                                            <v-btn slot="activator" icon flat small color="primary" class="mx-0"
                                                   @click="handleEditFile(file)">
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <span>Edit</span>
                                        </v-tooltip>

                                        <v-tooltip bottom>
                                            <v-btn slot="activator" icon flat small color="error" class="mx-0"
                                                   @click="handleDeleteFile(index)">
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                            <span>Delete</span>
                                        </v-tooltip>
                                    </v-card-actions>
                                </v-card>
                            </v-flex>
                        </draggable>
                    </v-flex>
                </v-layout>
            </v-container>
            <v-confirm
                :dialog.sync="deleteDialog"
                :waiting.sync="deleteWaiting"
                @cancel="cancelDelete"
                @confirm="doDeleteFile"
            ></v-confirm>
            <v-create
                title="Edit file"
                :dialog.sync="editDialog"
                :waiting.sync="editWaiting"
                :disabledActions.sync="editWaiting"
                :formErrors.sync="errors"
                @cancel="cancelEdit"
                @confirm="doEdit"
                continue-label="Update"
            >
                <template slot="content" v-if="node && typeof node.details !== 'undefined'">
                    <v-text-field
                        id="focus"
                        label="Name"
                        v-model="node.details.name"
                        :disabled="editWaiting"
                    ></v-text-field>

                    <v-text-field
                        :value="node.mime"
                        label="mime"
                        disabled
                    ></v-text-field>

                    <v-text-field
                        label="Caption"
                        v-model="node.details.caption"
                        :disabled="editWaiting"
                    ></v-text-field>

                    <v-text-field
                        label="Copyright"
                        v-model="node.details.copyright"
                        :disabled="editWaiting"
                    ></v-text-field>

                    <v-combobox
                        v-model="node.details.tags"
                        label="Tags"
                        multiple
                        chips
                        hint="Hit enter after each tag to create it"
                        persistent-hint
                        deletable-chips
                        append-icon=""
                        :disabled="editWaiting"
                    ></v-combobox>
                </template>
            </v-create>
            <v-dialog v-model="fileBrowserDialog" persistent max-width="900">
                <v-card>
                    <v-card-title dark class="primary white--text">

                        <div class="text--white text-uppercase subtitle-1 font-weight-medium pa-2">
                            {{ totalItems }}
                            <span v-if="totalItems === 1">Result</span>
                            <span v-else>Results</span>
                        </div>

                        <v-spacer></v-spacer>

                        <div :class="{'searching--closed': !searching}" class="searching">
                            <v-text-field
                                id="file-search"
                                v-model="filter.searchQuery"
                                append-icon="mdi-close"
                                @click:append="searchEnd"
                                placeholder="Search"
                                hide-details
                                :autocomplete="'new-password'"
                                solo
                            ></v-text-field>
                        </div>

                        <v-btn icon dark @click.native.stop="searchBegin">
                            <v-icon>mdi-magnify</v-icon>
                        </v-btn>

                        <v-btn icon dark @click.native.stop="fetchData">
                            <v-icon>mdi-autorenew</v-icon>
                        </v-btn>

                        <v-btn icon dark @click.native.stop="closeFileBrowserDialog">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>

                    </v-card-title>
                    <v-data-table
                        :headers="[
                            {text: 'Name', value: 'name', align: 'center'},
                            {text: 'Size', value: 'size', align: 'center'},
                            {text: 'Extension', value: 'extension', align: 'center'},
                            {text: 'Actions', value: 'actions', align: 'center', sortable: false},
                        ]"
                        :items="dbFiles"
                        :pagination.sync="pagination"
                        :total-items="totalItems"
                        :loading="fetching"
                        :rowsPerPageItems="[15,20,25]">
                        <template slot="items" slot-scope="props">
                            <tr class="text-xs-center">
                                <td>
                                    {{ props.item.basename }}
                                </td>
                                <td>
                                    {{ humanFileSize(props.item.size) }}
                                </td>
                                <td>
                                    {{ props.item.extension }}
                                </td>
                                <td>
                                    <v-tooltip bottom>
                                        <v-btn slot="activator"
                                               icon
                                               flat
                                               small
                                               color="primary"
                                               class="mx-0"
                                               @click="handleSelectFile(props.item)"
                                        >
                                            <v-icon>mdi-check-decagram</v-icon>
                                        </v-btn>
                                        <span>Select</span>
                                    </v-tooltip>
                                </td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card>
            </v-dialog>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        data() {
            return {
                dialog: true,

                nodes: [],

                deleteFileIndex: null,
                deleteDialog: false,
                deleteWaiting: false,

                node: null,
                nodeIndex: null,
                nodeClone: null,
                editDialog: false,
                editWaiting: false,
                errors: [],

                fileBrowserDialog: false,
                searching: false,
                totalItems: 0,
                dbFiles: [],
                timeout: null,
                fetching: true,
                pagination: {
                    descending: false,
                    page: 1,
                    rowsPerPage: 15,
                    sortBy: null,
                    totalItems: 0,
                },
                filter: {
                    searchQuery: '',
                }
            }
        },
        watch: {
            'filter.searchQuery'() {
                if (!this.fetching) {
                    this.fetchFilesDelayed();
                }
            },
        },
        name: 'File-Manager-Dialog',
        mounted() {
            for (var i = 0, len = this.files.length; i < len; i++) {
                let file = this.files[i];
                this.nodes.push(file);
            }
        },
        props: {
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
                default: 'images'
            },
            'files': {
                type: Array,
                required: true,
            },
        },
        methods: {
            closeFileManager() {
                this.$emit('close');
            },

            uploadedFile(response) {
                this.$emit('update');
                this.$toasted.show('File uploaded!', {
                    theme: "default",
                    position: "top-center",
                    duration: 2000
                });
            },

            alertError(message) {
                this.$toasted.show(message, {
                    theme: "error",
                    position: "top-center",
                    duration: 3500
                });
            },

            handleDownloadFile(index) {
                window.open('/files/download/' + this.files[index].id, "_blank");
            },
            handleViewFile(index) {
                window.open('/files/preview/' + this.files[index].id, "_blank");
            },

            handleEditFile(file, index) {
                if (typeof file.details == 'undefined') {
                    file.details = {};
                }

                this.node = file;
                this.nodeIndex = index;
                this.nodeClone = Object.assign({}, this.node);
                this.editDialog = true;
            },
            closeEdit() {
                this.editDialog = false;
                this.editWaiting = false;
                this.node = null;
                this.nodeIndex = null;
                this.nodeClone = null;
            },
            cancelEdit() {
                this.nodes[this.nodeIndex] = Object.assign({}, this.nodeClone);
                this.closeEdit();
            },
            doEdit() {
                this.editWaiting = true;
                window.axios.post('/files/update', {
                    id: this.node.id,
                    metadata: this.node.details,
                    modelId: this.modelId,
                    model: this.model,
                    role: this.role
                }).then(response => {
                    this.nodes[this.nodeIndex] = Object.assign({}, this.node);
                    this.closeEdit();
                    this.$toasted.show("File updated", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });

            },

            handleReorder() {
                window.axios.post('/files/reorder', {
                    ids: this.nodes.map(a => a.id),
                    modelId: this.modelId,
                    model: this.model,
                    role: this.role
                }).then(response => {
                    this.$emit('reorder', this.nodes);
                    this.$toasted.show("Update successful", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });
            },

            cancelDelete() {
                this.deleteFileIndex = null;
                this.deleteWaiting = false;
                this.deleteDialog = false;
            },
            handleDeleteFile(index) {
                this.deleteFileIndex = index;
                this.deleteDialog = true;
            },

            doDeleteFile() {
                this.deleteWaiting = true;
                window.axios.post('/files/delete', {
                    id: this.nodes[this.deleteFileIndex].id,
                    modelId: this.modelId,
                    model: this.model,
                    role: this.role
                }).then(response => {
                    this.$emit('delete', this.deleteFileIndex);
                    this.$delete(this.nodes, this.deleteFileIndex);
                    this.cancelDelete();
                    this.$toasted.show("File deleted", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });
            },

            handleSelectFile(file) {
                window.axios.post('/files/attach', {
                    id: file.id,
                    modelId: this.modelId,
                    model: this.model,
                    role: this.role
                }).then(response => {
                    this.$emit('update');
                    this.closeFileBrowserDialog();
                    this.$toasted.show("File attached", {
                        theme: "default",
                        position: "top-center",
                        duration: 1500
                    });
                });
            },

            searchBegin() {
                this.searching = true;
                setTimeout(() => document.querySelector('#file-search').focus(), 50)
            },
            searchEnd() {
                this.searching = false;
                this.filter.searchQuery = '';
                document.querySelector('#file-search').blur();
            },

            closeFileBrowserDialog() {
                this.fileBrowserDialog = false;
                this.pagination.page = 1;
                this.searchEnd();
            },

            openFileBrowserDialog() {
                this.fileBrowserDialog = true;
                this.fetchFiles();
            },

            fetchFilesDelayed() {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.fetchFiles();
                }, 1000);
            },

            fetchFiles() {
                this.fetching = true;

                const {sortBy, descending, page, rowsPerPage} = this.pagination;

                window.axios.post('/files/searchPaginated' + '?page=' + page, {
                    filter: this.filter,
                    itemsPerPage: rowsPerPage,
                    sortBy: sortBy,
                    descending: descending,
                }).then(response => {
                    this.dbFiles = response.data.files.data;
                    this.totalItems = response.data.files.total;
                    this.fetching = false;
                });
            },

        },
    }
</script>

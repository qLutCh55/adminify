<template>
  <v-card
      flat
      class="mb-1"
  >
    <div
        v-if="roles.length"
        class="text-center"
    >
      <div
          style="max-width: 680px; margin: 0 auto;"
      >
        <v-select
            :items="availableRoles"
            v-model="selectedRole"
            label="File(s) role"
            item-value="id"
            item-text="label"
            :disabled="uploading"
            hide-details
        ></v-select>
      </div>
    </div>

    <div
        v-if="uploading"
        class="text-center"
    >
      <template
          v-if="!multiple"
      >
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
      <template
          v-else
      >
        <v-list>
          <v-list-item
              v-for="(upload, index) in uploads"
              :key="index"
          >
            <v-list-item-content>
              <v-list-item-title v-text="upload.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-progress-circular
                  :rotate="270"
                  :value="upload.progress"
                  color="primary"
                  :indeterminate="upload.progress == 100"
              >
              </v-progress-circular>
            </v-list-item-action>
          </v-list-item>
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
        <p class="mb-0">
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

      selectedRole: null,
      availableRoles: [],
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
      default: 'Files'
    },
    'roles': {
      type: Array,
      default: () => ([])
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
    if (this.roles.length) {
      this.convertRoles();
    } else {
      this.selectedRole = this.role;
    }
  },
  methods: {
    convertRoles() {
      this.roles.forEach((role) => {
        let roleObject = {
          id: null,
          label: null,
        }

        if (typeof role === 'object') {
          roleObject.id = role.id;
          roleObject.label = role.label;

          this.availableRoles.push(roleObject);

          if (roleObject.id === this.role || roleObject.label === this.role) {
            this.selectedRole = roleObject.id;
          }
        } else if (typeof role === 'string') {
          roleObject.id = this.slugify(role);
          roleObject.label = this.convertRoleStringToLabel(role);

          this.availableRoles.push(roleObject);

          if (roleObject.id === this.role || roleObject.label === this.role) {
            this.selectedRole = roleObject.id;
          }

        } else {
          console.error('Undefined role:');
          consoler.error(role);
        }
      });

      if (this.selectedRole == null) {
        this.selectedRole = this.availableRoles[0].id;
      }
    },
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
      e.target.value = '';
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

        data.append('role', this.selectedRole);
        data.append(this.selectedRole, object, object.name);

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

<template>
    <v-dialog
            v-model="dialog"
            persistent
            :max-width="maxWidth"
    >
        <v-card>
            <v-card-title>
                <h3 class="headline mb-0" v-html="title"></h3>
            </v-card-title>
            <v-card-text>
                <div
                        class="text-center"
                        v-if="waiting"
                >
                    <v-progress-circular
                            indeterminate
                            color="primary"
                    ></v-progress-circular>
                </div>
                <div v-else>
                    <v-form
                            ref="createForm"
                            v-model="invalid"
                            lazy-validation
                            @keyup.enter.native="confirmDialog"
                    >
                        <slot name="content"></slot>
                    </v-form>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn
                        color="error"
                        text
                        @click.native="cancelDialog"
                        :disabled="waiting || disabledActions"
                >
                    {{ cancelLabel }}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                        color="primary"
                        text
                        @click.native="confirmDialog"
                        :disabled="waiting || disabledActions || disabledCreateAction || formInvalid"
                >
                    {{ continueLabel }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        data() {
            return {
                invalid: false,
                errors: [],
            }
        },
        name: 'Create-Dialog',
        props: {
            'dialog': {
                type: Boolean,
                required: true
            },
            'waiting': {
                type: Boolean,
                required: false
            },
            'title': {
                type: String,
                default: 'Create new'
            },
            'form-errors': {
                type: Array,
                default: () => ([])
            },
            'disabled-create-action': {
                type: Boolean,
                default: false
            },
            'disabled-actions': {
                type: Boolean,
                default: false
            },
            'continue-label': {
                type: String,
                default: 'Create'
            },
            'cancel-label': {
                type: String,
                default: 'Cancel'
            },
            'max-width': {
                type: String,
                default: '320'
            }
        },
        watch: {
            'formErrors'() {
                this.errors = this.formErrors;
            }
        },
        computed: {
            formInvalid() {
                return !this.invalid;
            }
        },
        mounted() {
        },
        methods: {
            cancelDialog() {
                this.errors = [];
                this.$refs.createForm.resetValidation();
                this.$emit('cancel');
            },
            confirmDialog() {
                if (this.$refs.createForm.validate() && !this.errors.length) {
                    this.$emit('confirm');
                }
            },
        },
    }
</script>

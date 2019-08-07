<template>
    <v-dialog v-model="dialog" persistent max-width="320">
        <v-card>
            <v-card-text class="text-xs-center">
                <h3 class="headline mb-4">{{ title }}</h3>
                <div class="text-xs-center" v-if="waiting">
                    <v-progress-circular
                            indeterminate
                            color="primary"
                    ></v-progress-circular>
                </div>
                <v-icon color="error" class="a-animated tada" size="80px" v-else>
                    {{ icon }}
                </v-icon>
            </v-card-text>
            <v-card-actions>
                <v-btn color="red" flat @click="$emit('cancel')" :disabled="waiting">No</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" flat @click="$emit('confirm')" :disabled="waiting">Yes</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        data() {
            return {}
        },
        name: 'Confirm-Dialog',
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
                default: 'Are you sure?'
            },
            'icon' : {
                type: String,
                default: 'mdi-delete-variant'
            }
        },
        mounted() {},
        methods: {
        },
    }
</script>

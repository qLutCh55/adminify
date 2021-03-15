<template>
    <v-navigation-drawer
        mobile-break-point="1380"
        width="250"
        class="blue-grey darken-4"
        dark
        :mini-variant="miniVariant"
        v-model="drawer"
        app
    >
        <v-list-item>
            <v-list-item-avatar v-if="!miniVariant">
                <template v-if="icon">
                    <template v-if="typeof icon.hash !== 'undefined'">
                        <img :src="iconSrc" width="40" height="40">
                    </template>
                    <template v-else>
                        <v-icon :color="icon.color">
                            $mdi{{ icon.icon }}
                        </v-icon>
                    </template>
                </template>
                <template v-else>
                    <v-icon color="orange">
                        $mdiHubspot
                    </v-icon>
                </template>
            </v-list-item-avatar>
            <v-list-item-content v-if="!miniVariant">
                <v-list-item-title>
                    {{ applicationName }}
                    <sup class="sub-caption">TM</sup>
                </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
                <v-btn
                    icon
                    @click.stop="miniVariant = !miniVariant"
                >
                    <v-icon v-html="miniVariant ? '$mdiChevronRight' : '$mdiChevronLeft'"></v-icon>
                </v-btn>
            </v-list-item-action>
        </v-list-item>
        <v-divider></v-divider>

        <v-list
            dense
            subheader
        >
            <template
                v-for="(menuItem, index) in menu"
                v-if="menuItem.restriction == 'none' || hasPermission(menuItem.restriction)"
            >
                <v-tooltip
                    :key="index"
                    right
                    :disabled="!miniVariant || openPanel == menuItem.heading"
                >
                    <template v-slot:activator="{ on }">
                        <v-list-group
                            :value="mustOpen(menuItem)"
                            :key="index"
                            :prepend-icon="miniVariant ? menuItem.icon : ''"
                            @click="setActiveExpansionPanel(menuItem.heading)"
                            v-on="on"
                        >
                            <v-icon v-if="miniVariant" slot="prependIcon">
                                {{ menuItem.icon }}
                            </v-icon>

                            <template v-slot:activator>
                                <v-list-item>
                                    <v-list-item-title>{{ menuItem.heading.toUpperCase() }}</v-list-item-title>
                                </v-list-item>
                            </template>

                            <v-tooltip
                                right
                                :disabled="!miniVariant"
                                v-for="(menuChild, childIndex) in menuItem.children"
                                :key="childIndex"
                                v-if="!menuChild.restriction || menuChild.restriction == 'none' || hasPermission(menuChild.restriction)"
                            >
                                <template v-slot:activator="{ on }">
                                    <v-list-item
                                        @click="menuItemClick(menuChild)"
                                        exact
                                        v-on="on"
                                    >
                                        <v-list-item-action>
                                            <v-icon>{{ menuChild.icon }}</v-icon>
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ menuChild.name }}</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                                <span v-if="miniVariant && typeof menuChild.miniName !== 'undefined'">
                                    {{ menuChild.miniName }}
                                </span>
                                <span v-else>{{ menuChild.name }}</span>
                            </v-tooltip>
                        </v-list-group>
                    </template>
                    <span>{{ menuItem.heading }}</span>
                </v-tooltip>

                <v-divider></v-divider>
            </template>

        </v-list>

        <!--        TODO: This is for non-collapseable menu -> maybe add prop? -->
        <!--        <template v-for="(menuItem, index) in menu">-->
        <!--            <v-list-->
        <!--                dense-->
        <!--                subheader-->
        <!--                :key="index"-->
        <!--            >-->
        <!--                <v-subheader>{{ menuItem.heading.toUpperCase() }}</v-subheader>-->
        <!--                <v-tooltip-->
        <!--                    right-->
        <!--                    :disabled="!miniVariant"-->
        <!--                    v-for="(menuChild, childIndex) in menuItem.children"-->
        <!--                    :key="childIndex"-->
        <!--                >-->
        <!--                    <template v-slot:activator="{ on }">-->
        <!--                        <v-list-item-->
        <!--                            :to="menuChild.path"-->
        <!--                            exact-->
        <!--                            v-on="on"-->
        <!--                        >-->
        <!--                            <v-list-item-action>-->
        <!--                                <v-icon>{{ menuChild.icon }}</v-icon>-->
        <!--                            </v-list-item-action>-->
        <!--                            <v-list-item-content>-->
        <!--                                <v-list-item-title>{{ menuChild.name }}</v-list-item-title>-->
        <!--                            </v-list-item-content>-->
        <!--                        </v-list-item>-->
        <!--                    </template>-->
        <!--                    <span-->
        <!--                        v-if="miniVariant && typeof menuChild.miniName !== 'undefined'"-->
        <!--                    >-->
        <!--                        {{ menuChild.miniName }}-->
        <!--                    </span>-->
        <!--                    <span v-else>-->
        <!--                        {{ menuChild.name }}-->
        <!--                    </span>-->
        <!--                </v-tooltip>-->
        <!--            </v-list>-->

        <!--            <v-divider></v-divider>-->
        <!--        </template>-->
    </v-navigation-drawer>
</template>
<script>
    export default {
        name: 'Menu',
        data() {
            return {
                menu: ADMINIFY_MENU,

                openPanel: null,

                icon: null,
            }
        },
        mounted() {
            this.checkAppIcon();
            this.setupWebsocket('settings', this.checkAppIcon);
        },
        computed: {
            miniVariant: {
                set(value) {
                    this.$store.commit('application/setMiniVariantStatus', value);
                },
                get() {
                    return this.$store.getters['application/getMiniVariantStatus'];
                }
            },
            drawer: {
                set(value) {
                    this.$store.commit('application/setDrawerStatus', value);
                },
                get() {
                    return this.$store.getters['application/getDrawerStatus'];
                }
            },
            applicationName() {
                return this.$store.getters['application/getApplicationName'];
            },
            iconSrc() {
                if (typeof this.icon.hash !== 'undefined') {
                    return '/images/' + this.icon.hash + '-ft=40+40.' + this.icon.type;
                }
            }
        },
        methods: {
            hasPermission(permissionString) {
                if (typeof permissionString == 'undefined') {
                    return true;
                }

                let roles = permissionString.split('|');

                for (let i = 0, len = roles.length; i < len; i++) {
                    let role = roles[i];

                    if (this.hasRole(role)) {
                        return true;
                    }
                }

                return false;
            },

            setActiveExpansionPanel(name) {
                if (this.openPanel == name) {
                    this.openPanel = null;
                } else {
                    this.openPanel = name;
                }
            },

            mustOpen(item) {
                for (let i = 0, len = item.children.length; i < len; i++) {
                    let child = item.children[i];

                    let childUrl = child.path;

                    if (childUrl.indexOf('?') !== -1) {
                        childUrl = child.path.substring(0, child.path.indexOf("?"));
                    }

                    if (window.location.href.indexOf(childUrl) > -1) {
                        return true;
                    }
                }
                return false;
            },

            checkAppIcon() {
                window.axios.post('/settings/getAppIcon')
                    .then((response) => {
                        this.icon = response.data.icon;
                    });
            },
    
            menuItemClick(item) {
                if (typeof item.target !== 'undefined') {
            
                    if (typeof item.newTab !== 'undefined' && item.newTab) {
                        window.open(item.target, '_blank');
                    } else {
                        window.open(item.target);
                    }
                }
        
                this.$router.push(item.path);
        
                this.key = !this.key;
            }
        }
    }
</script>

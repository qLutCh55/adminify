<template>
  <div class="editor">
    <div
        class="v-input__control"
    >
      <label
          class="v-label v-label--active theme--light"
          :class="(value !== '') ? 'small-label' : 'normal-label' "
      >
        {{ inputLabel }}
      </label>
      <editor-menu-bubble
          :editor="editor"
          :keep-in-bounds="keepInBounds"
          v-slot="{ commands, isActive, getMarkAttrs, menu }"
      >
        <div
            v-if="editable"
            class="menububble"
            :class="{ 'is-active': menu.isActive }"
            :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
        >

          <button
              class="menububble__button"
              :class="{ 'is-active': isActive.bold() }"
              @click="commands.bold"
          >
            <v-icon>$mdiFormatBold</v-icon>
          </button>

          <button
              class="menububble__button"
              :class="{ 'is-active': isActive.italic() }"
              @click="commands.italic"
          >
            <v-icon>$mdiFormatItalic</v-icon>
          </button>

          <button
              class="menububble__button"
              :class="{ 'is-active': isActive.strike() }"
              @click="commands.strike"
          >
            <v-icon>$mdiFormatStrikethrough</v-icon>
          </button>

          <button
              class="menububble__button"
              :class="{ 'is-active': isActive.underline() }"
              @click="commands.underline"
          >
            <v-icon>$mdiFormatUnderline</v-icon>
          </button>

          <button
              class="menububble__button"
              :class="{ 'is-active': isActive.bullet_list() }"
              @click="commands.bullet_list"
          >
            <v-icon>$mdiFormatListBulleted</v-icon>
          </button>

          <button
              class="menububble__button"
              :class="{ 'is-active': isActive.ordered_list() }"
              @click="commands.ordered_list"
          >
            <v-icon>$mdiFormatListNumbered</v-icon>
          </button>


          <form
              class="menububble__form"
              v-if="linkMenuIsActive"
              @submit.prevent="setLinkUrl(commands.link, linkUrl)"
          >
            <input
                class="menububble__input"
                type="text"
                v-model="linkUrl"
                placeholder="https://"
                ref="linkInput"
                @keydown.esc="hideLinkMenu"
            />
            <button
                class="menububble__button" @click="setLinkUrl(commands.link, null)"
                type="button"
            >
              <v-icon>$mdiLinkVariantRemove</v-icon>
            </button>
          </form>

          <template v-else>
            <button
                class="menububble__button"
                @click="showLinkMenu(getMarkAttrs('link'))"
                :class="{ 'is-active': isActive.link() }"
            >
              <v-icon>$mdiLinkVariant</v-icon>
            </button>
          </template>


        </div>
      </editor-menu-bubble>
      <editor-content
          class="editor__content"
          :editor="editor"
      />
    </div>
  </div>
</template>
<script>
import {Editor, EditorContent, EditorMenuBubble} from 'tiptap'
import {
  BulletList,
  OrderedList,
  ListItem,
  Bold,
  Italic,
  Link,
  Strike,
  Underline,
  HardBreak,
} from 'tiptap-extensions'

export default {
  components: {
    EditorContent,
    EditorMenuBubble,
  },

  computed: {
    'inputLabel'() {
      if (this.label) {
        return this.label;
      } else {
        return 'Description';
      }
    },
    editable() {
      return !!(!this.disabled && !this.readonly);
    }
  },

  props: {
    'label': {
      type: String,
      default: '',
    },
    'value': {
      required: true,
    },
    'disabled': {
      type: Boolean,
      default: false
    },
    'readonly': {
      type: Boolean,
      default: false
    },
    'configuration': {
      type: Object,
      default: () => ({})
    },
    'extensions': {
      type: Array,
      default: () => ([])
    },
  },

  data() {
    return {
      keepInBounds: true,
      editor: null,
      linkUrl: null,
      linkMenuIsActive: false,
    }
  },

  mounted() {
    let configuration = {
      editable: this.editable,
      content: this.value,
      extensions: [
        new BulletList(),
        new ListItem(),
        new OrderedList(),
        new Link(),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline(),
        new HardBreak(),
      ],
      onUpdate: ({getHTML}) => {
        this.$emit('input', getHTML());
      },
      ...this.configuration
    };

    this.extensions.forEach((e) => {
      configuration.extensions.push(e);
    });

    this.editor = new Editor(configuration);
  },

  beforeDestroy() {
    this.editor.destroy()
  },

  methods: {
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.linkMenuIsActive = true;
      this.$nextTick(() => {
        this.$refs.linkInput.focus();
      });
    },
    hideLinkMenu() {
      this.linkUrl = null;
      this.linkMenuIsActive = false;
    },
    setLinkUrl(command, url) {
      command({href: url});
      this.hideLinkMenu();
    },
  }
}
</script>
<style lang="scss">
$color-black: #000000;
$color-white: #ffffff;
$color-grey: #dddddd;

.editor {
  position: relative;
  padding-top: 16px;
  margin-top: 4px;

  .v-label {
    left: 0;
    right: auto;
    position: absolute;
  }

  &:focus-within {
    .v-label {
      color: #1976d2;
      font-size: 12px;
      transform: translateY(-12px);
    }
  }

  .small-label {
    font-size: 12px;
    transform: translateY(-12px);
  }

  .normal-label {
    font-size: 16px;
  }

  &__content {
    outline: none;

    width: 100%;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.87);

    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;

    padding-top: 5px;

    &:focus {
      outline: none;
    }

    & > .ProseMirror {
      padding: 0 0 8px;

      background-image: linear-gradient(to bottom, #1976d2, #1976d2), linear-gradient(to bottom, #757575, #757575);
      background-size: 0 2px, 100% 1px;
      background-position: 50% 100%, 50% 100%;
      transition: background-size 0.3s cubic-bezier(0.64, 0.09, 0.08, 1);

      &:hover {
        background-image: linear-gradient(to bottom, #1976d2, #1976d2), linear-gradient(to bottom, #191919, #191919);
      }

      &:focus {
        outline: none;
        background-size: 100% 2px, 100% 1px;
      }
    }

    p {
      margin: 0;
    }
  }
}


.menububble {
  position: absolute;
  display: flex;
  z-index: 20;
  background: $color-black;
  border-radius: 5px;
  padding: 0.3rem;
  margin-bottom: 0.5rem;
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s, visibility 0.2s;

  &.is-active {
    opacity: 1;
    visibility: visible;
  }

  &__button {
    display: inline-flex;
    background: transparent;
    border: 0;
    color: $color-white;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      background-color: rgba($color-white, 0.1);
    }

    &.is-active {
      background-color: rgba($color-white, 0.2);
    }

    .v-icon {
      color: inherit !important;
    }
  }

  &__form {
    display: flex;
    align-items: center;
  }

  &__input {
    font: inherit;
    border: none;
    background: transparent;
    color: $color-white;
  }
}
</style>

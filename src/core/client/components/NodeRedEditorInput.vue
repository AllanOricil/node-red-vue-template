<template>
  <div ref="containerDiv" class="node-text-editor-container">
    <div ref="editorDiv" :id="editorId" class="node-text-editor"></div>
    <div v-show="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    language: {
      type: String,
      default: "json",
      validator: function (value) {
        const allowedLanguages = [
          "text",
          "json",
          "javascript",
          "html",
          "css",
          "markdown",
          "sql",
          "yaml",
        ];
        const isValid = allowedLanguages.includes(value);
        if (!isValid) {
          console.warn(
            `[NodeRedEditorComponent] Invalid ACE editor mode prop: "${value}". ` +
              `Expected one of: ${allowedLanguages.join(", ")}`
          );
        }
        return isValid;
      },
    },
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["update:value"],
  editor: null,
  data() {
    return {
      editorId: "node-red-editor-" + Math.random().toString(36).substring(2, 9),
    };
  },
  mounted() {
    this.mountEditor();
  },
  methods: {
    mountEditor() {
      this.$nextTick(() => {
        const containerEl = this.$refs.containerDiv;
        const editorEl = this.$refs.editorDiv;

        if (containerEl && editorEl) {
          try {
            const inlineHeight = containerEl.style.height;
            const inlineWidth = containerEl.style.width;
            if (inlineHeight) {
              editorEl.style.height = inlineHeight;
            } else {
              editorEl.style.height = "200px";
            }

            if (inlineWidth) {
              editorEl.style.width = inlineWidth;
            } else {
              editorEl.style.width = "100%";
            }

            this.createEditorInstance();
          } catch (e) {
            console.error(
              "[NodeRedEditorInput] Error setting initial editor style:",
              e
            );
            this.createEditorInstance();
          }
        } else {
          console.error(
            "[NodeRedEditorInput] Container or Editor div refs not found on mount."
          );
        }
      });
    },
    createEditorInstance() {
      this.editorInstance = RED.editor.createEditor({
        id: this.editorId,
        mode: this.language,
        value: this.value,
      });
      this.editorInstance.getSession().on("change", () => {
        const currentValue = this.editorInstance.getValue();
        if (currentValue !== this.value) {
          this.$emit("update:value", currentValue);
        }
      });
    },
  },
  beforeUnmount() {
    if (this.editorInstance) {
      try {
        this.editorInstance.destroy();
      } catch (err) {
        console.error(`Error destroying editor for ID ${this.editorId}:`, err);
      }
      this.editorInstance = null;
    }
  },
};
</script>

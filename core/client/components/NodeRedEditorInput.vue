<template>
  <div ref="containerDiv" class="node-text-editor-container">
    <div ref="editorDiv" :id="editorId" class="node-text-editor"></div>
    <div v-show="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as monaco from "monaco-editor";

export default defineComponent({
  name: "NodeRedEditorInput",
  props: {
    value: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "json",
      validator(value) {
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
            `[NodeRedEditorComponent] Invalid Monaco editor mode prop: "${value}". ` +
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
  emits: {
    "update:value": (value: string) => typeof value === "string",
  },
  setup(props, { emit }) {
    const containerDiv = ref<HTMLElement | null>(null);
    const editorDiv = ref<HTMLElement | null>(null);
    const editorId = `node-red-editor-${Math.random().toString(36).substring(2, 9)}`;
    let editorInstance: any;

    onMounted(() => {
      mountEditor();
    });

    onBeforeUnmount(() => {
      if (editorInstance) {
        editorInstance.dispose();
        editorInstance = null;
      }
    });

    const mountEditor = () => {
      const containerEl = containerDiv.value;
      const editorEl = editorDiv.value;

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

          createEditorInstance();
        } catch (e) {
          console.error(
            "[NodeRedEditorInput] Error setting initial editor style:",
            e
          );
          createEditorInstance();
        }
      } else {
        console.error(
          "[NodeRedEditorInput] Container or Editor div refs not found on mount."
        );
      }
    };

    const createEditorInstance = () => {
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
    };

    return {
      containerDiv,
      editorDiv,
      editorId,
      error: props.error,
    };
  },
});
</script>

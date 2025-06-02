<template>
  <div ref="container" class="container">
    <button
      ref="expand-button"
      class="red-ui-button red-ui-button-small expand-button"
      @click="onClickExpand"
    >
      <i class="fa fa-expand"></i>
    </button>
    <div :id="editorId" ref="editor"></div>
    <div v-show="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
// TODO: expose editor apis
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    value: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "json",
      validator: function (value) {
        const allowedLanguages = [
          "abap",
          "apex",
          "azcli",
          "bat",
          "bicep",
          "cameligo",
          "clojure",
          "coffee",
          "cpp",
          "csharp",
          "csp",
          "css",
          "cypher",
          "dart",
          "dockerfile",
          "ecl",
          "elixir",
          "flow9",
          "freemarker2",
          "fsharp",
          "go",
          "graphql",
          "handlebars",
          "hcl",
          "html",
          "ini",
          "java",
          "javascript",
          "json",
          "julia",
          "kotlin",
          "less",
          "lexon",
          "liquid",
          "lua",
          "m3",
          "markdown",
          "mdx",
          "mips",
          "msdax",
          "mysql",
          "objective-c",
          "pascal",
          "pascaligo",
          "perl",
          "pgsql",
          "php",
          "pla",
          "postiats",
          "powerquery",
          "powershell",
          "protobuf",
          "pub",
          "python",
          "qsharp",
          "r",
          "razor",
          "redis",
          "redshift",
          "restructuredtext",
          "ruby",
          "rust",
          "sb",
          "scala",
          "scheme",
          "scss",
          "shell",
          "solidity",
          "sophia",
          "sparql",
          "sql",
          "st",
          "swift",
          "systemverilog",
          "tcl",
          "twig",
          "typescript",
          "typespec",
          "vb",
          "wgsl",
          "xml",
          "yaml",
        ];
        const isValid = allowedLanguages.includes(value);
        if (!isValid) {
          console.warn(
            `[WARN]: Invalid value for 'type' property: "${value}". ` +
              `Expected one of: ${allowedLanguages.join(", ")}`,
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
    const stateId = Math.random().toString(36).substring(2, 9);
    return {
      editorId: "node-red-editor-" + stateId,
      stateId,
    };
  },
  mounted() {
    // NOTE: jquery wrapper is used because RED.popover.tooltip needs it
    const expandButton = $(this.$refs["expand-button"]);
    RED.popover.tooltip(expandButton, RED._("node-red:common.label.expand"));
    this.mountEditor();
    this.createExpandeEditorTray();
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
  methods: {
    mountEditor() {
      this.$nextTick(() => {
        const containerEl = this.$refs.container;
        const editorEl = this.$refs.editor;

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
              e,
            );
            this.createEditorInstance();
          }
        } else {
          console.error(
            "[NodeRedEditorInput] Container or Editor div refs not found on mount.",
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
    createExpandeEditorTray() {
      let expandedEditor;
      const value = this.value;
      const stateId = this.stateId;
      const language = this.language;

      const onCancel = () => {
        setTimeout(() => {
          this.editorInstance.focus();
        }, 250);
        RED.tray.close();
      };

      const onDone = () => {
        expandedEditor.saveView();
        this.editorInstance.setValue(expandedEditor.getValue(), -1);
        setTimeout(() => {
          this.editorInstance.restoreView();
          this.editorInstance.focus();
        }, 250);
        RED.tray.close();
      };

      this.expandedEditorTray = {
        title: "Editor",
        focusElement: true,
        width: "Infinity",
        buttons: [
          {
            id: "node-dialog-cancel",
            text: RED._("common.label.cancel"),
            click: onCancel,
          },
          {
            id: "node-dialog-ok",
            text: RED._("common.label.done"),
            class: "primary",
            click: onDone,
          },
        ],
        open: function (tray) {
          const dialogForm = $(
            '<form id="dialog-form" class="form-horizontal" autocomplete="off"></form>',
          ).appendTo(tray.find(".red-ui-tray-body"));
          dialogForm.html(
            '<div id="expanded-editor-input" style="height: 100%"></div>',
          );

          expandedEditor = RED.editor.createEditor({
            id: "expanded-editor-input",
            stateId,
            mode: language,
            focus: true,
            value,
          });
          dialogForm.i18n();
        },
        close: function () {
          expandedEditor.destroy();
        },
      };
    },
    onClickExpand() {
      RED.tray.show(this.expandedEditorTray);
    },
  },
});
</script>
<style scoped>
.container {
  position: relative;
}

.expand-button {
  position: absolute;
  top: -23px;
  right: 0px;
  z-index: 10;
  transition: color 0.3s ease;
  cursor: pointer;
}
</style>

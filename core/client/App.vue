<template>
  <div style="width: 100%">
    <NodeRedNodeForm :node="localNode" :errors="errors" style="width: 100%" />
  </div>
</template>

<script lang="ts">
import jsonpointer from "jsonpointer";
import { defineComponent } from "vue";
import { validatorService } from "./validator";

export default defineComponent({
  name: "NodeRedVueApp",
  props: {
    node: {
      type: Object,
      required: true,
    },
    validator: {
      type: Function,
      required: true,
    },
    disableSaveButtonOnError: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      localNode: this.node,
      errors: {},
    };
  },
  beforeMount() {
    this.validator(this.localNode);

    Object.keys(this.localNode._def.defaults).forEach((prop) => {
      this.$watch(
        () => this.localNode[prop],
        (newVal) => {
          this.validate();
        },
        { deep: true }
      );
    });

    Object.keys(this.localNode._def.credentials).forEach((prop) => {
      if (
        this.localNode._def.credentials[prop].type === "password" &&
        this.localNode.credentials[`has_${prop}`]
      ) {
        this.localNode.credentials[prop] = "__PWD__";
      }

      this.$watch(
        () => this.localNode.credentials[prop],
        (newVal, oldVal) => {
          this.validate();

          if (
            this.localNode._def.credentials[prop].type === "password" &&
            newVal !== oldVal
          ) {
            this.localNode.credentials[`has_${prop}`] = !!newVal;
          }
        },
        { deep: true }
      );
    });
  },
  beforeUnmount() {
    if (this.disableSaveButtonOnError) {
      $("#node-dialog-ok")?.prop("disabled", false).removeClass("disabled");
      $("#node-config-dialog-ok")
        ?.prop("disabled", false)
        .removeClass("disabled");
      $("#red-ui-workspace").get(0).style.setProperty("pointer-events", "");
      // $("#red-ui-workspace-chart svg")
      //   .get(0)
      //   .style.setProperty("pointer-events", "all");
    }

    // NOTE: must set credentials prop to undefined to avoid updating it to __PWD__ in the server
    Object.keys(this.localNode._def.credentials).forEach((prop) => {
      if (
        this.localNode._def.credentials[prop].type === "password" &&
        this.localNode.credentials[`has_${prop}`] &&
        this.localNode.credentials[prop] === "__PWD__"
      ) {
        this.localNode.credentials[prop] = undefined;
      }
    });
  },
  methods: {
    validate() {
      const valid = this.validator(this.localNode);
      if (!valid) {
        const errors = this.validator.errors;
        this.errors = errors.reduce((acc, error) => {
          const errorValue = jsonpointer.get(
            this.localNode,
            error.instancePath
          );
          if (
            error.parentSchema.format === "password" &&
            errorValue === "__PWD__"
          ) {
            console.log(
              "password fields with value equal to __PWD__ should not be an error"
            );
            return acc;
          } else {
            const key = `node${error.instancePath.replaceAll("/", ".")}`;
            acc[key] = error.message;
            return acc;
          }
        }, {});
      } else {
        this.errors = {};
      }

      if (this.disableSaveButtonOnError) {
        if (Object.keys(this.errors).length) {
          $("#node-dialog-ok")?.prop("disabled", true).addClass("disabled");
          $("#node-config-dialog-ok")
            ?.prop("disabled", true)
            .addClass("disabled");
          $("#red-ui-workspace")
            .get(0)
            .style.setProperty("pointer-events", "none", "important");
          // $("#red-ui-workspace-chart svg")
          //   .get(0)
          //   .style.setProperty("pointer-events", "none", "important");
        } else {
          $("#node-dialog-ok").prop("disabled", false).removeClass("disabled");
          $("#node-config-dialog-ok")
            .prop("disabled", false)
            .removeClass("disabled");
          $("#red-ui-workspace").get(0).style.setProperty("pointer-events", "");
          // $("#red-ui-workspace-chart svg")
          //   .get(0)
          //   .style.setProperty("pointer-events", "all");
        }
      }
    },
  },
});
</script>

<style>
#app .node-red-vue-input-error-message {
  color: var(--red-ui-form-input-border-error-color);
}

#app label {
  width: 100%;
}
</style>

<template>
  <div style="width: 100%">
    <NodeRedNodeForm :node="node" :errors="errors" style="width: 100%" />
  </div>
</template>

<script>
export default {
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
  },
  data() {
    return {
      errors: {},
    };
  },
  mounted() {
    this.validate();

    Object.keys(this.node._def.defaults).forEach((prop) => {
      this.$watch(
        () => this.node[prop],
        (newVal) => {
          this.validate();
        },
        { deep: true }
      );
    });

    Object.keys(this.node._def.credentials).forEach((prop) => {
      if (
        this.node._def.credentials[prop].type === "password" &&
        this.node.credentials[`has_${prop}`]
      ) {
        this.node.credentials[prop] = "__PWD__";
      }

      this.$watch(
        () => this.node.credentials[prop],
        (newVal, oldVal) => {
          this.validate();

          if (
            this.node._def.credentials[prop].type === "password" &&
            newVal !== oldVal
          ) {
            this.node.credentials[`has_${prop}`] = !!newVal;
          }
        },
        { deep: true }
      );
    });
  },
  beforeUnmount() {
    $("#node-dialog-ok").prop("disabled", false).removeClass("disabled");
    $("#red-ui-workspace").get(0).style.setProperty("pointer-events", "");
    // $("#red-ui-workspace-chart svg")
    //   .get(0)
    //   .style.setProperty("pointer-events", "all");

    // NOTE: must set credentials prop to undefined to avoid updating it to __PWD__ in the server
    Object.keys(this.node._def.credentials).forEach((prop) => {
      if (
        this.node._def.credentials[prop].type === "password" &&
        this.node.credentials[`has_${prop}`] &&
        this.node.credentials[prop] === "__PWD__"
      ) {
        this.node.credentials[prop] = undefined;
      }
    });
  },
  methods: {
    validate() {
      const valid = this.validator(this.node);
      if (!valid) {
        const errors = this.validator.errors;
        this.errors = errors.reduce((acc, error) => {
          const key = `node${error.instancePath.replaceAll("/", ".")}`;
          acc[key] = error.message;
          return acc;
        }, {});
      } else {
        this.errors = {};
      }
      if (Object.keys(this.errors).length) {
        $("#node-dialog-ok").prop("disabled", true).addClass("disabled");
        $("#red-ui-workspace")
          .get(0)
          .style.setProperty("pointer-events", "none", "important");
        // $("#red-ui-workspace-chart svg")
        //   .get(0)
        //   .style.setProperty("pointer-events", "none", "important");
      } else {
        $("#node-dialog-ok").prop("disabled", false).removeClass("disabled");
        $("#red-ui-workspace").get(0).style.setProperty("pointer-events", "");
        // $("#red-ui-workspace-chart svg")
        //   .get(0)
        //   .style.setProperty("pointer-events", "all");
      }
    },
  },
};
</script>

<style>
.node-red-vue-input-error-message {
  color: var(--red-ui-form-input-border-error-color);
}
</style>

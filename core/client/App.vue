<template>
  <div style="width: 100%">
    <component
      :is="NodeRedNodeForm"
      :node="node"
      :errors="errors"
      style="width: 100%"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onBeforeMount,
  onBeforeUnmount,
  watch,
} from "vue";

export default defineComponent({
  name: "NodeRedVueApp",
  props: {
    node: {
      type: Object,
      required: true,
    },
    NodeRedNodeForm: {
      type: Object,
      required: true,
    },
    validator: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const errors = ref({});
    const node = props.node;

    const validate = () => {
      const valid = props.validator(node);
      if (!valid) {
        const errorsList = props.validator.errors;
        errors.value = errorsList.reduce((acc, error) => {
          const key = `node${error.instancePath.replaceAll("/", ".")}`;
          acc[key] = error.message;
          return acc;
        }, {});
      } else {
        errors.value = {};
      }

      if (Object.keys(errors.value).length) {
        $("#node-dialog-ok").prop("disabled", true).addClass("disabled");
        $("#red-ui-workspace")
          .get(0)
          .style.setProperty("pointer-events", "none", "important");
      } else {
        $("#node-dialog-ok").prop("disabled", false).removeClass("disabled");
        $("#red-ui-workspace").get(0).style.setProperty("pointer-events", "");
      }
    };

    onBeforeMount(() => {
      validate();

      Object.keys(node._def.defaults).forEach((prop) => {
        watch(
          () => node[prop],
          () => {
            validate();
          },
          { deep: true }
        );
      });

      Object.keys(node._def.credentials).forEach((prop) => {
        if (
          node._def.credentials[prop].type === "password" &&
          node.credentials[`has_${prop}`]
        ) {
          node.credentials[prop] = "__PWD__";
        }

        watch(
          () => node.credentials[prop],
          (newVal, oldVal) => {
            validate();
            if (
              node._def.credentials[prop].type === "password" &&
              newVal !== oldVal
            ) {
              node.credentials[`has_${prop}`] = !!newVal;
            }
          },
          { deep: true }
        );
      });
    });

    onBeforeUnmount(() => {
      $("#node-dialog-ok").prop("disabled", false).removeClass("disabled");
      $("#red-ui-workspace").get(0).style.setProperty("pointer-events", "");

      Object.keys(node._def.credentials).forEach((prop) => {
        if (
          node._def.credentials[prop].type === "password" &&
          node.credentials[`has_${prop}`] &&
          node.credentials[prop] === "__PWD__"
        ) {
          node.credentials[prop] = undefined;
        }
      });
    });

    return {
      node,
      errors,
      validate,
    };
  },
});
</script>

<style>
.node-red-vue-input-error-message {
  color: var(--red-ui-form-input-border-error-color);
}
</style>

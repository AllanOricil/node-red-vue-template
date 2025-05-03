<template>
  <div style="display: flex; flex-direction: column; width: 100%">
    <input type="text" :id="inputId" style="width: 100%" />
    <div v-if="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import $ from "jquery";

export default defineComponent({
  name: "NodeRedConfigInput",
  props: {
    value: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
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
    const inputPrefix = ref(
      "node-input-" + Math.random().toString(36).substring(2, 9)
    );

    const inputId = computed(() => {
      return inputPrefix.value + "-" + props.value;
    });

    onMounted(() => {
      console.log(props);

      RED.editor.prepareConfigNodeSelect(
        props,
        props.value,
        props.type,
        inputPrefix.value
      );

      const input = $("#" + inputId.value);

      input.on("change", () => {
        emit("update:value", input.val());
      });

      input.val(props.value || "_ADD_");
    });

    return {
      inputPrefix,
      inputId,
      error: props.error,
    };
  },
});
</script>

<template>
  <div style="display: flex; flex-direction: column; width: 100%">
    <input
      ref="inputField"
      :type="type"
      :value="internalValue"
      :placeholder="placeholder"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      style="flex: 1; width: 100%"
    />
    <div v-if="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from "vue";

export default defineComponent({
  name: "NodeRedInput",
  props: {
    value: String,
    type: {
      type: String,
      default: "text",
      validator: function (value: String) {
        return ["text", "password"].includes(value);
      },
    },
    placeholder: String,
    error: {
      type: String,
      default: "",
    },
  },
  emits: {
    "update:value": (value: string) => typeof value === "string",
    input: (value: string) => typeof value === "string",
  },
  setup(props, { emit }) {
    const internalValue = ref("");
    const secretPattern = "*************";

    onBeforeMount(() => {
      internalValue.value = props.value ?? "";
      onBlur();
    });

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      internalValue.value = target.value;
      emit("update:value", internalValue.value);
      emit("input", internalValue.value);
    };

    const onFocus = () => {
      if (props.type === "password" && internalValue.value === secretPattern) {
        internalValue.value = "";
      }
    };

    const onBlur = () => {
      if (props.type === "password" && props.value === "__PWD__") {
        internalValue.value = secretPattern;
      }
    };

    return {
      internalValue,
      onInput,
      onFocus,
      onBlur,
    };
  },
});
</script>

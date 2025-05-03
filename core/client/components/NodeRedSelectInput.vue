<template>
  <div style="display: flex; flex-direction: column; width: 100%">
    <input
      type="text"
      ref="selectInput"
      class="node-input-select"
      style="width: 100%"
    />
    <div v-if="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import $ from "jquery";

interface Option {
  value: string;
  label: string;
}

export default defineComponent({
  name: "NodeRedSelectInput",
  props: {
    value: {
      type: [String, Array] as () => string | string[],
      required: true,
    },
    options: {
      type: Array as () => Option[],
      required: true,
      validator(value: Option[]) {
        if (!Array.isArray(value)) {
          console.warn("Prop 'options' must be an array.");
          return false;
        }
        const isValid = value.every((item) => {
          const isObject = typeof item === "object" && item !== null;
          if (!isObject) return false;
          return (
            item.hasOwnProperty("value") &&
            item.hasOwnProperty("label") &&
            typeof item.value === "string" &&
            typeof item.label === "string"
          );
        });

        if (!isValid) {
          console.warn(
            "Validation failed for prop 'options': Each item must be an object with 'value' and 'label' properties being strings.",
            value
          );
        }
        return isValid;
      },
    },
    multiple: {
      type: Boolean,
      default: false,
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
    const selectInputRef = ref<HTMLInputElement | null>(null);

    watch(
      () => props.value,
      (newValue) => {
        const $selectInput = $(selectInputRef.value);
        $selectInput.typedInput(
          "value",
          Array.isArray(newValue) ? newValue.join(",") : newValue
        );
      }
    );

    onMounted(() => {
      if (selectInputRef.value) {
        const $selectInput = $(selectInputRef.value);

        $selectInput.typedInput({
          types: [
            {
              multiple: props.multiple,
              options: props.options,
            },
          ],
        });

        $selectInput.typedInput(
          "value",
          Array.isArray(props.value) ? props.value.join(",") : props.value
        );

        $selectInput.on("change", () => {
          const newValue = props.multiple
            ? $selectInput.typedInput("value")?.split(",")
            : $selectInput.typedInput("value");
          emit("update:value", newValue);
        });
      }
    });

    return {
      selectInputRef,
      error: props.error,
    };
  },
});
</script>

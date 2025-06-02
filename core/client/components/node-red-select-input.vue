<template>
  <div style="display: flex; flex-direction: column; width: 100%">
    <input
      ref="selectInput"
      type="text"
      class="node-input-select"
      style="width: 100%"
    />
    <div v-if="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    value: {
      type: [String, Array],
      default: () => "",
    },
    options: {
      type: Array,
      required: true,
      validator: function (value) {
        if (!Array.isArray(value)) {
          console.warn(
            "[WARN] Invalid value for 'options' property. It must be an array.",
          );
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
            "[WARN] Invalid value for 'options' property. Each item must be an object with 'value' and 'label' properties being strings.",
            value,
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
  emits: ["update:value"],
  mounted() {
    const inputElement = this.$refs.selectInput;
    const $selectInput = $(inputElement);
    $selectInput.typedInput({
      types: [
        {
          multiple: this.multiple,
          options: this.options,
        },
      ],
    });

    $selectInput.typedInput(
      "value",
      Array.isArray(this.value) ? this.value.join(",") : this.value,
    );
    $selectInput.on("change", () => {
      const newValue = this.multiple
        ? $selectInput.typedInput("value")?.split(",")
        : $selectInput.typedInput("value");
      this.$emit("update:value", newValue);
    });
  },
});
</script>

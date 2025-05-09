<template>
  <div style="display: flex; flex-direction: column; width: 100%">
    <input
      type="text"
      ref="typedInput"
      class="node-red-typed-input"
      style="flex: 1; width: 100%"
    />
    <div v-if="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { TYPED_INPUT_TYPES } from "../../constants";

export default {
  props: {
    value: {
      type: Object,
      required: true,
      validator: function (obj) {
        if (!typeof obj === "object") {
          console.warn(
            "[WARN] Invalid value for 'value' property. It must be an object."
          );
          return false;
        }
        const isValid =
          typeof obj?.value === "string" && typeof obj?.type === "string";
        if (!isValid) {
          console.warn(
            "[WARN] Invalid value for 'value' property. It must be an object with 'value' and 'type' properties being strings.",
            obj
          );
        }
        return isValid;
      },
    },
    types: {
      type: Array,
      default: () => TYPED_INPUT_TYPES,
    },
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["update:value"],
  computed: {
    isProvidedValueTypeValid() {
      const type = this.value.type;
      const types = this.types;

      return types.includes(type);
    },
  },
  watch: {
    isProvidedValueTypeValid: {
      handler(newValue) {
        if (!newValue) {
          console.warn(
            `Validation failed: this.value.type (${this.value.type}) must be one of the provided types (${this.types}).`
          );
        }
      },
      immediate: true,
    },
  },
  mounted() {
    const inputElement = this.$refs.typedInput;
    this.$input = $(inputElement).typedInput({
      default: this.value.type || this.types[0],
      types: this.types,
    });

    this.$input.typedInput("value", this.value.value || "");
    this.$input.typedInput("type", this.value.type || this.types[0]);

    // NOTE: when typed input is just a text input, it isn't emiting change while typing because it is updating the value in a hidden input
    this.$nextTick(() => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.attributeName === "value") {
            this.onChange();
          }
        }
      });

      observer.observe(inputElement, {
        attributes: true,
        attributeFilter: ["value"],
      });

      this._observer = observer;
    });

    // NOTE: this emits changes to all types that lose focus when choosing a value, but text inputs
    this.$input.on("change", () => {
      this.onChange();
    });
  },
  watch: {
    error(newVal) {
      this.$nextTick(() => {
        const targetDiv = this.$el.querySelector(
          ".red-ui-typedInput-container"
        );
        if (newVal) {
          targetDiv.classList.add("input-error");
        } else {
          targetDiv.classList.remove("input-error");
        }
      });
    },
  },
  methods: {
    onChange() {
      const newValue = this.$input.typedInput("value");
      const newType = this.$input.typedInput("type");
      if (this.value.value !== newValue || this.value.type !== newType) {
        this.$emit("update:value", {
          value: newValue,
          type: newType,
        });
      }
    },
  },
};
</script>

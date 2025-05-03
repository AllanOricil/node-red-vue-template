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

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
} from "vue";
import $ from "jquery";

interface TypedValue {
  value: string;
  type: string;
}

export default defineComponent({
  name: "NodeRedTypedInput",
  props: {
    value: {
      type: Object as () => TypedValue,
      required: true,
      validator: (obj: TypedValue) => {
        if (typeof obj !== "object") {
          console.warn("Prop 'value' must be an object.");
          return false;
        }
        const isValid =
          "value" in obj &&
          "type" in obj &&
          typeof obj.value === "string" &&
          typeof obj.type === "string";

        if (!isValid) {
          console.warn(
            "Validation failed for prop 'value': It must be an object with 'value' and 'type' properties being strings.",
            obj
          );
        }
        return isValid;
      },
    },
    types: {
      type: Array as () => string[],
      default: () => [
        "msg",
        "flow",
        "global",
        "str",
        "num",
        "bool",
        "json",
        "bin",
        "re",
        "jsonata",
        "date",
        "env",
        "node",
        "cred",
      ],
    },
    error: {
      type: String,
      default: "",
    },
  },
  emits: {
    "update:value": (val: TypedValue) =>
      val &&
      typeof val === "object" &&
      typeof val.value === "string" &&
      typeof val.type === "string",
  },
  setup(props, { emit }) {
    const typedInput = ref<HTMLElement | null>(null);
    const $input = ref<JQuery | null>(null);
    const _observer = ref<MutationObserver | null>(null);

    const value = ref<TypedValue>(props.value);
    const types = ref<string[]>(props.types);
    const error = ref<string>(props.error);

    const isProvidedValueTypeValid = computed(() => {
      return types.value.includes(value.value.type);
    });

    watch(isProvidedValueTypeValid, (newVal) => {
      if (!newVal) {
        console.warn(
          `Validation failed: this.value.type (${value.value.type}) must be one of the provided types (${types.value}).`
        );
      }
    });

    watch(error, (newVal) => {
      nextTick(() => {
        const targetDiv = typedInput.value?.querySelector(
          ".red-ui-typedInput-container"
        );
        if (targetDiv) {
          if (newVal) {
            targetDiv.classList.add("input-error");
          } else {
            targetDiv.classList.remove("input-error");
          }
        }
      });
    });

    onMounted(() => {
      const inputElement = typedInput.value;
      if (inputElement) {
        $input.value = $(inputElement).typedInput({
          default: value.value.type || types.value[0],
          types: types.value,
        });

        $input.value.typedInput("value", value.value.value || "");
        $input.value.typedInput("type", value.value.type || types.value[0]);

        nextTick(() => {
          const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.attributeName === "value") {
                onChange();
              }
            }
          });

          observer.observe(inputElement, {
            attributes: true,
            attributeFilter: ["value"],
          });

          _observer.value = observer;
        });

        $input.value.on("change", () => {
          onChange();
        });
      }
    });

    const onChange = () => {
      const newValue = $input.value?.typedInput("value");
      const newType = $input.value?.typedInput("type");
      if (value.value.value !== newValue || value.value.type !== newType) {
        emit("update:value", {
          value: newValue,
          type: newType,
        });
      }
    };

    return {
      typedInput,
      error,
      isProvidedValueTypeValid,
    };
  },
});
</script>

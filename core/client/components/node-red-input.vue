<template>
  <div style="display: flex; flex-direction: column; width: 100%">
    <input
      ref="inputField"
      :type="type"
      :value="internalValue"
      :placeholder="placeholder"
      style="flex: 1; width: 100%"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
    <div v-if="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const SECRET_PATTERN = "*************";

export default defineComponent({
  props: {
    value: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["update:value", "input"],
  data() {
    return {
      internalValue: "",
    };
  },
  beforeMount() {
    this.internalValue = this.value;
    this.onBlur();
  },
  methods: {
    onInput(event) {
      this.internalValue = event.target.value;
      this.$emit("update:value", this.internalValue);
      this.$emit("input", this.internalValue);
    },
    onFocus() {
      if (this.type === "password" && this.internalValue === SECRET_PATTERN) {
        this.internalValue = "";
      }
    },
    onBlur() {
      if (this.type === "password" && this.value === "__PWD__") {
        this.internalValue = SECRET_PATTERN;
      }
    },
  },
});
</script>

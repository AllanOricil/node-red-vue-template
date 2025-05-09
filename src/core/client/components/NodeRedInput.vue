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

<script>
export default {
  props: {
    value: String,
    type: {
      type: String,
      default: "text",
    },
    placeholder: String,
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["update:value", "input"],
  data() {
    return {
      internalValue: "",
      secretPattern: "*************",
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
      if (
        this.type === "password" &&
        this.internalValue === this.secretPattern
      ) {
        this.internalValue = "";
      }
    },
    onBlur() {
      if (this.type === "password" && this.value === "__PWD__") {
        this.internalValue = this.secretPattern;
      }
    },
  },
};
</script>

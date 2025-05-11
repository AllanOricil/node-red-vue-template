<template>
  <div style="display: flex; flex-direction: column; width: 100%">
    <input type="text" :id="inputId" style="width: 100%" />
    <div v-if="error" class="node-red-vue-input-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    value: String,
    type: String,
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["update:value"],
  computed: {
    inputPrefix() {
      return "node-input-" + Math.random().toString(36).substring(2, 9);
    },
    inputId() {
      return this.inputPrefix + "-" + this.value;
    },
  },
  mounted() {
    RED.editor.prepareConfigNodeSelect(
      this,
      this.value,
      this.type,
      this.inputPrefix
    );

    const input = $("#" + this.inputId);
    input.on("change", () => {
      this.$emit("update:value", input.val());
    });

    input.val(this.value || "_ADD_");
  },
};
</script>

<template>
  <div class="form-row">
    <label><i class="fa fa-tag"></i> Name</label>
    <NodeRedInput
      v-model:value="node.name"
      :error="errors['node.name']"
      placeholder="name"
    />
  </div>
  <div class="form-row">
    <label><i class="fa fa-tag"></i> Hostname</label>
    <NodeRedInput
      v-model:value="node.host"
      :error="errors['node.host']"
      placeholder="hostname"
    />
  </div>
</template>

<script>
export default {
  name: "NodeRedNodeForm",
  props: {
    node: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

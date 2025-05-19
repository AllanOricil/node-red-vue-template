<template>
  <div>
    <div class="form-row">
      <label><i class="fa fa-tag"></i> Username</label>
      <NodeRedInput
        v-model:value="node.credentials.username"
        :error="errors['node.credentials.username']"
      />
    </div>

    <div class="form-row">
      <label><i class="fa fa-tag"></i> Password</label>
      <NodeRedInput
        v-model:value="node.credentials.password"
        type="password"
        :error="errors['node.credentials.password']"
      />
    </div>

    <div class="form-row">
      <label><i class="fa fa-tag"></i> Password 2</label>
      <NodeRedInput
        v-model:value="node.credentials.password2"
        type="password"
        :error="errors['node.credentials.password2']"
      />
    </div>

    <div class="form-row">
      <label>Typed Input</label>
      <NodeRedTypedInput
        v-model:value="node.myProperty"
        :types="types"
        :error="errors['node.myProperty']"
      />
    </div>

    <div class="form-row">
      <label>Typed Input 2</label>
      <NodeRedTypedInput
        v-model:value="node.myProperty2"
        :error="errors['node.myProperty2']"
      />
    </div>

    <div class="form-row">
      <label>Config Input</label>
      <NodeRedConfigInput
        v-model:value="node.remoteServer"
        type="remote-server"
        :error="errors['node.remoteServer']"
      />
    </div>

    <div class="form-row">
      <label>Config Input</label>
      <NodeRedConfigInput
        v-model:value="node.anotherRemoteServer"
        type="remote-server"
        :error="errors['node.anotherRemoteServer']"
      />
    </div>

    <div class="form-row">
      <label>Select Input</label>
      <NodeRedSelectInput
        v-model:value="node.country"
        :options="countries"
        :error="errors['node.country']"
      />
    </div>

    <div class="form-row">
      <label>MultiSelect Input</label>
      <NodeRedSelectInput
        v-model:value="node.fruit"
        :options="fruits"
        multiple
        :error="errors['node.fruit']"
      />
    </div>

    <div class="form-row">
      <label>Select Input</label>
      <NodeRedSelectInput
        v-model:value="node.number"
        :options="numbers"
        :error="errors['node.number']"
      />
    </div>

    <div class="form-row">
      <label>Select Input</label>
      <NodeRedSelectInput
        v-model:value="node.object"
        :options="objects"
        multiple
        :error="errors['node.object']"
      />
    </div>

    <div class="form-row">
      <label>Select Input</label>
      <NodeRedSelectInput
        v-model:value="node.array"
        :options="arrays"
        :error="errors['node.array']"
      />
    </div>

    <div class="form-row">
      <label>Editor with default height 200px and JSON</label>
      <NodeRedEditorInput
        v-model:value="node.jsontest"
        :error="errors['node.jsontest']"
      />
    </div>

    <div class="form-row">
      <label>Editor with custom height and CSS</label>
      <NodeRedEditorInput
        v-model:value="node.csstest"
        language="css"
        style="height: 100px"
        :error="errors['node.csstest']"
      />
    </div>

    <!-- NOTE: this is loaded from the resources/{pkg.name} folder -->
    <img src="/vue.png" />

    <!-- NOTE: this is added to the bundled .js -->
    <img :src="logo" alt="Logo" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import logo from "../assets/vue.png";

export default defineComponent({
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
  data() {
    return {
      logo,
      types: ["str", "msg", "node"],
      countries: [
        { value: "usa", label: "usa" },
        { value: "argentina", label: "argentina" },
        { value: "brasil", label: "brasil" },
      ],
      fruits: [
        { value: "apple", label: "apple" },
        { value: "melon", label: "melon" },
        { value: "raspberry", label: "raspberry" },
      ],
      numbers: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
      ],
      objects: [
        { value: JSON.stringify({ test: "a" }), label: "a" },
        { value: JSON.stringify({ test: "b" }), label: "b" },
        { value: JSON.stringify({ test: "c" }), label: "c" },
      ],
      arrays: [
        { value: JSON.stringify(["a"]), label: "a" },
        { value: JSON.stringify(["b"]), label: "b" },
        { value: JSON.stringify(["c"]), label: "c" },
      ],
    };
  },
  mounted() {
    console.log("MOUNTED");
    console.log(this.logo);
  },
});
</script>

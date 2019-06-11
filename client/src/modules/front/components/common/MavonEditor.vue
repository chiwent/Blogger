<template>
  <div>
    <mavon-editor v-model="mdVal"></mavon-editor>
  </div>
</template>
   <script>
var mavonEditor = require("mavon-editor");
import "mavon-editor/dist/css/index.css";
export default {
  name: "Mavon",
  components: {
    "mavon-editor": mavonEditor.mavonEditor
  },
  data() {
    return {
      mdVal: ""
    };
  }
};
</script>
<style lang="stylus" scoped></style>

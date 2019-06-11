<!--<template>
  <div>
    <vue-git-comment :options="options"></vue-git-comment>
  </div>
</template>
<script>
export default {
  name: "Gitment",
  data() {
    return {
      options: {
        client_id: "",
        client_secret: "",
        owner: "chiwent",
        repo: "blogcomment",
        uuid: Date.now()
      }
    };
  }
};
</script>
-->


<template>
  <Vssue :title="title" :options="options"/>
</template>

<script>
import { VssueComponent } from "vssue";
import GithubV3 from "@vssue/api-github-v3";
import "vssue/dist/vssue.css";

export default {
  name: "Gitment",

  components: {
    Vssue: VssueComponent
  },

  data() {
    return {
      title: "blogcomment",
      options: {
        api: GithubV3,
        owner: "chiwent",
        repo: "blogcomment",
        clientId: "",
        clientSecret: "" // 只有在使用某些平台时需要
      }
    };
  }
};
</script>
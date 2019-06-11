<template>
  <div class="admin">
    <div class="admin__list">
      <list></list>
    </div>
    <div class="admin__editor" v-if="editorStatus === 'article'">
      <editor></editor>
    </div>
    <div class="admin__editor" v-else>
      <about></about>
    </div>
    <!-- <div class="admin__logout">
      <i class="fa fa-power-off" aria-hidden="true" @click="logout"></i>
    </div>-->
    <div class="admin__logout">
      <span @click="logout">退出登录</span>
    </div>
  </div>
</template>

<script>
import Editor from "./Editor.vue";
import About from "./About.vue";
import List from "./List.vue";
import { mapMutations, mapGetters } from "vuex";

export default {
  name: "admin",
  components: {
    Editor,
    About,
    List
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["editorStatus"])
  },
  created() {},
  mounted() {},
  methods: {
    ...mapMutations({
      deleteToken: "DELETE_TOKEN"
    }),
    logout() {
      this.$confirm("此操作将退出系统, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.deleteToken();
          this.$router.push("/admin/login");
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '../assets/stylus/_settings.styl';

.admin {
  &__list {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 500px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  &__editor {
    margin-left: 500px;
  }

  &__logout {
    position: absolute;
    top: 22px;
    right: 30px;
    font-size: 28px;
    cursor: pointer;
    color: $blue;
  }
}
</style>

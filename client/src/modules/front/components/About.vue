<template>
  <div class="container">
    <div class="about__loading" v-if="isLoading">
      <Loading :loadingMsg="loadingMsg"></Loading>
    </div>
    <div class="about__main" v-if="!isLoading">
      <h1 class="about__title">{{currentAbout.title}}</h1>
      <!-- <p class="about__time">{{currentPost.createTime}}</p> -->
      <div class="about__content markdown-body" v-html="compiledPost" ref="post"></div>
    </div>
  </div>
</template>
<script>
import Loading from "publicComponents/Loading.vue";
import aboutApi from "api/about.js";
import marked from "lib/marked.js";

import { mapGetters, mapActions } from "vuex";

export default {
  name: "About",
  components: {
    Loading
  },
  data() {
    return {
      isLoading: false,
      loadingMsg: "加载中..."
    };
  },
  computed: {
    ...mapGetters(["currentAbout"]),
    compiledPost() {
      return this.compiledMarkdown(this.currentAbout.content);
    }
  },
  created() {
    if (typeof window === "undefined") {
      return;
    }
  },
  beforeMount() {
    this.isLoading = true;
    this.getPublishAbout().then(() => {
      document.querySelector("title").innerText = this.currentAbout.title;
      this.isLoading = false;
    });
  },
  preFetch(store) {
    return store.dispatch("getPublishAbout");
    /*.then(res => {
      console.log(res);
      debugger;
    });
    */
  },
  mounted() {},
  methods: {
    ...mapActions(["getPublishAbout"]),
    compiledMarkdown(value) {
      return marked(value);
    }
  }
};
</script>
<style lang="stylus">
@import '../assets/stylus/markdown.styl';
</style>
<style lang="stylus" scoped>
@import '../assets/stylus/_settings.styl';

.container {
  position: relative;
  top: 100px;
  margin: 0 auto;
}

.about {
  max-width: 1000px;
  margin: 85px auto 0 auto;
  padding: 0 20px 0px 20px;

  &__main {
    margin: 0 auto;
    min-height: 100%;
  }

  &__title {
    font-size: 24px;
    word-break: break-all;
  }

  &__time {
    color: #7f8c8d;
    font-weight: 400;
    margin-bottom: 10px;
  }

  &__loading {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 200px;
    margin-left: -(@width / 2) + 125;
    margin-top: -(@height / 2) + 60;
  }
}

.share__box {
  margin-top: 50px;
}

@media only screen and (min-width: 768px) {
  .about {
    position: relative;
    margin-top: 80px;

    &__main {
      padding: 0 100px;
    }

    &__loading {
      position: absolute;
      top: 200px;
      left: 50%;
      width: 300px;
      margin-left: -(@width / 2);
    }
  }
}

@media only screen and (min-width: 320px) and (max-width: 480px) {
  .about {
    &__main {
      padding: 0 10px;
    }
  }
}
</style>
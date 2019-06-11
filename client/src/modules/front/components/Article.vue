<template>
  <div class="article">
    <div class="cover-img">
      <img :src="currentPost.coverImg ? currentPost.coverImg  : defaultCover" alt>
      <h1 class="cover-title">{{currentPost.title}}</h1>
      <i class="cover-desc">宇宙的星星很多，难免会遗忘几颗，所以用坠落，证明自己来过</i>
    </div>
    <div class="article__loading" v-if="isLoading">
      <Loading :loadingMsg="loadingMsg"></Loading>
    </div>
    <Side :isInList="false" :category="category"></Side>
    <div class="article__main" v-if="!isLoading">
      <h1 class="article__title">{{currentPost.title}}</h1>
      <p class="article__time">{{currentPost.createTime}}</p>
      <div class="article__content markdown-body" v-html="currentPostCompile" ref="post"></div>
      <Comment :sourceId="currentPost.id"></Comment>

      <share :url="shareUrl" :title="$store.state.currentPost.title"></share>

      <!-- <mavon-editor v-model="mdVal" v-if="isBrowser"></mavon-editor> -->

      <!-- <mavon v-if="isBrowser"></mavon> -->

      <!-- 自实现markdown编辑器 -->
      <pure-comment></pure-comment>
    </div>
  </div>
</template>

<script>
import Loading from "publicComponents/Loading.vue";
import articleApi from "api/article.js";
import marked from "lib/marked.js";
import Side from "./common/Side.vue";
import Comment from "./common/Comment.vue";
import Share from "./common/Share.vue";

// import NoSSR from "vue-no-ssr";

import PureComment from "./common/PureComment.vue";
// import Mavon from "./common/MavonEditor.vue";

// import Toast from '../../../components/Toast.vue';

import config from "../../../../../server/configs/index.js";

import { mapGetters, mapActions } from "vuex";

// var mavonEditor = require("mavon-editor");
// import "mavon-editor/dist/css/index.css";

export default {
  name: "article_component", // 防止和html元素重名
  data() {
    return {
      category: [],
      isLoading: false,
      loadingMsg: "加载中...",
      defaultCover: require("../../../static/img/default-cover.jpg"),
      isBrowser:
        process.env.VUE_ENV === "client" || process.env.VUE_ENV !== "server", // 判断系统环境，如果是client端才渲染组件
      mdVal: "",
      routeId: void 0
    };
  },
  computed: {
    ...mapGetters(["currentPost", "currentPostCompile"]),
    compiledPost() {
      return this.compiledMarkdown(this.$store.state.currentPost.content);
    },
    shareUrl() {
      return config.location + this.$route.path;
    }
  },
  components: {
    Side,
    Loading,
    Comment,
    Share,
    PureComment
    // Mavon
    // "mavon-editor": mavonEditor.mavonEditor
  },
  created() {
    articleApi
      .incReadTime(this.$route.params.id)
      .then(res => {})
      .catch(err => {});
  },
  beforeMount() {
    // 如果想等说明数据已经拿到，就没必要进行再去取数据了
    if (this.currentPost.id === this.$route.params.id) {
      this.$nextTick(() => {
        // 提取文章标签，生成目录
        Array.from(
          this.$refs.post.querySelectorAll("h1,h2,h3,h4,h5,h6")
        ).forEach((item, index) => {
          item.id = item.localName + "-" + index;
          this.category.push({
            tagName: item.localName,
            text: item.innerText,
            href: "#" + item.localName + "-" + index
          });
        });
      });
      return;
    }
    this.isLoading = true;
    this.getPost(this.$route.params.id).then(() => {
      document.querySelector("title").innerText = this.currentPost.title;
      this.isLoading = false;
      this.$nextTick(() => {
        // 提取文章标签，生成目录
        Array.from(
          this.$refs.post.querySelectorAll("h1,h2,h3,h4,h5,h6")
        ).forEach((item, index) => {
          item.id = item.localName + "-" + index;
          this.category.push({
            tagName: item.localName,
            text: item.innerText,
            href: "#" + item.localName + "-" + index
          });
        });
      });
    });
  },
  /**
   * 缺失会导致刷新文章详情页报错，页面白屏:The client-side rendered virtual DOM tree is not matching server-rendered content. This is likely caused by incorrect HTML markup, for example nesting block-level elements inside <p>, or missing <tbody>. Bailing hydration and performing full client-side render.
   */
  preFetch(store) {
    return store.dispatch("getPost", store.state.route.params.id);
  },
  mounted() {
    // this.$store.dispatch("getPost", this.$store.state.route.params.id);
  },
  methods: {
    ...mapActions(["getPost"]),
    compiledMarkdown(value) {
      return marked(value);
    }
  },
  beforeRouteEnter(to, from, next) {
    // console.log("route enter");
    if (from.path.indexOf("userinfo")) {
      // console.log("router reload");
      next();
    }
  },
  // 监听路由，防止跳转到文章详情页时路由刷新而数据不刷新
  watch: {
    $route(to, from) {
      this.$store.dispatch("getPost", this.$store.state.route.params.id);
    }
  }
};
</script>

<style lang="stylus">
@import '../assets/stylus/markdown.styl';
</style>
<style lang="stylus" scoped>
@import '../assets/stylus/_settings.styl';

.article {
  max-width: 1000px;
  margin: 60px auto 0 auto;
  padding: 20px;

  &__main {
    margin-left: 260px;
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

@media screen and (max-width: 768px) {
  .article {
    position: relative;

    // margin-top: 80px;
    &__main {
      margin-left: 0;
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

.cover-img {
  position: relative;
  width: 100%;
  max-height: 450px;
  margin-bottom: 50px;

  img {
    width: 100%;
    max-width: 100%;
    max-height: 450px;
    filter: blur(3px);
  }

  .cover-title {
    position: absolute;
    width: 100%;
    color: #ffffff;
    -webkit-text-stroke: 2px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  .cover-desc {
    position: absolute;
    text-align: center;
    color: #fff;
    -webkit-text-stroke: 1px rgba(0, 0, 0, 0.2);
    width: 80%;
    left: 50%;
    transform: translate(-50%, 60%);
  }
}

@media only screen and (max-width: 768px) {
  .cover-img {
    .cover-title {
      font-size: 25px;
      top: 10px;
    }

    .cover-desc {
      top: 50px;
      font-size: 12px;
    }
  }
}

@media only screen and (min-width: 769px) {
  .cover-img {
    .cover-title {
      top: 30px;
      font-size: 50px;
    }

    .cover-desc {
      top: 200px;
      font-size: 20px;
    }
  }
}
</style>

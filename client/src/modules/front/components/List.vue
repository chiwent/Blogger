<template>
  <div class="list">
    <Side :isInList="true"></Side>
    <div class="list__loading" v-if="isLoading">
      <Loading :loadingMsg="loadingMsg"></Loading>
    </div>
    <ul class="list__article">
      <li class="list__article__filterMsg" v-if="(selectTags.length !== 0)">
        筛选
        <span>{{filterMsg}}</span>
        分类
      </li>
      <li class="list__article__filterMsg" v-if="$store.state.searchVal && posts.length">
        搜索
        <span>“{{$store.state.searchVal}}”</span>
        关键词
      </li>
      <template v-if="posts.length!==0 && isLoading == false">
        <li v-for="article in posts" class="list__article__item" :key="article.id">
          <h1 class="list__article__item__title">
            <router-link :to="'article/'+article.id">{{ article.title }}</router-link>
          </h1>
          <div class="list__article__item__info">
            <p class="list__article__item__time">
              {{article.createTime}}
              <span class="list__article__item__time__count">
                阅读次数: {{article.readCount}}
                <span v-if="article.readCount === 999">+</span>
              </span>
            </p>
            <div
              class="list__article__item__abstract markdown-body"
              v-html="compiledMarkdown(article.abstract)"
            ></div>
            <!-- <span v-for="tag in article.tags"> {{tag.name}}</span> -->
            <p class="continue-read">
              <router-link :to="'/article/'+article.id" class="continue-reading">继续阅读...</router-link>
            </p>
          </div>
        </li>
        <Pagination :curPage="curPage" :allPage="allPage"></Pagination>
      </template>
      <div v-if="posts.length==0 && isLoading==false" class="msg-box">
        <p>暂时没有相关文章</p>
      </div>
    </ul>
  </div>
</template>

<script>
import Pagination from "publicComponents/Pagination.vue";
import Loading from "publicComponents/Loading.vue";
import Side from "./common/Side.vue";
import articleApi from "api/article.js";
import marked from "lib/marked.js";

import { mapGetters, mapActions } from "vuex";

export default {
  name: "list",
  computed: {
    ...mapGetters([
      "posts",
      "tags",
      "curPage",
      "allPage",
      "selectTags",
      "searchTags",
      "currentPost"
    ]),
    filterMsg() {
      let msg = "";
      this.selectTags.forEach(item => {
        msg += item.name + "、";
      });
      return msg.replace(/、$/, "");
    }
  },
  components: {
    Pagination,
    Side,
    Loading
  },
  data() {
    return {
      isLoading: false,
      value: 1,
      loadingMsg: "加载中..."
    };
  },
  created() {},
  beforeMount() {
    // 用来判断是否有数据，有数据就不再请求了。进入userinfo页后，vuex的posts会丢失，所以要判断
    if (this.currentPost.id === "" && this.$store.state.posts.length > 0) {
      // 说明不是从文章详细页过来的
      return;
    }
    this.isLoading = true;
    this.getAllPosts({ page: this.$store.state.route.params.page }).then(() => {
      this.isLoading = false;
    });
  },
  // 预获取数据
  preFetch(store) {
    // console.log("prefetch");
    store.dispatch("getAllTags");
    // store.dispatch("getPublishTags");
    return store
      .dispatch("getAllPosts", { page: store.state.route.params.page })
      .catch(err => {
        alert("获取数据异常");
      });
  },
  mounted() {
    this.$EventBus.$on("searchArticle", (searchVal, page) => {
      // console.log("$on:", searchVal);
      // debugger;
      // this.searchArticles(searchVal);
      this.$store.dispatch("searchArticles", { searchVal, page }).catch(err => {
        alert("获取数据异常");
      });
    });
  },
  beforeDestroy() {
    this.$store.dispatch("searchItem", "");
    this.$EventBus.$off("searchArticle");
  },
  beforeUpdate() {},
  methods: {
    ...mapActions(["getAllPosts", "getAllTags"]),
    compiledMarkdown(value) {
      return marked(value);
    },
    /*
    switch(page) {
      this.changePage(page);
    },
    */
    changePage(cur) {
      if (this.$route.meta.articleList && !this.$route.query.content) {
        // this.$router.push("/page/" + cur);
        this.isLoading = true;
        this.getAllPosts({ tag: this.searchTags, page: cur }).then(() => {
          this.isLoading = false;
        });
      } else if (this.$route.meta.searchList && this.$route.query.content) {
        // this.$router.push("/search/" + cur);
        this.isLoading = true;
        this.$store
          .dispatch("searchArticles", {
            // searchVal: this.$store.state.searchVal,
            searchVal: this.$route.query.content,
            page: this.$route.query.page
          })
          .then(() => {
            this.isLoading = false;
          })
          .catch(err => {
            alert("获取数据异常");
          });
      }
    }
    /*
    searchArticleM(searchVal, page = 0) {
      articleApi
        .searchItem(searchVal, page)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          this.$EventBus.$emit("toast", "获取数据异常", "toast-error");
        });
    }*/
  },
  watch: {
    selectTags() {
      this.isLoading = true;
      this.getAllPosts({
        tag: this.searchTags
      }).then(() => {
        this.isLoading = false;
      });
    },
    $route(to, from) {
      // console.log(to.path);
      if (to.meta.articleList || to.meta.searchList) {
        let toPage = to.path.split("/");
        let page = toPage[toPage.length - 1];
        this.changePage(page);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '../assets/stylus/_settings.styl';

.list {
  padding: 10px;
  max-width: 1000px;
  margin: 0 auto;
  padding-top: 85px;

  &__article {
    list-style: none;
    margin-left: 260px;
  }

  &__article__item {
    margin: 0 auto;
    padding: 10px;
    margin-bottom: 50px;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
    border-radius: 18px;
    background-color: rgba(255, 255, 255, 0.6);
  }

  &__article__item__title {
    margin: 15px auto;
    text-align: center;
    font-size: 24px;
    word-break: break-all;

    // border-left: 5px solid #0288d1;
    a {
      margin-left: 5px;
      text-decoration: none;
      color: #409eff;
    }
  }

  &__article__item__time {
    color: #7f8c8d;
    font-weight: 400;
    margin-bottom: 25px;
    margin-top: 2px;
    text-align: center;

    &__count {
      margin-left: 50px;
    }
  }

  &__article__item__abstract {
    margin-bottom: 5px;
  }

  .continue-read {
    margin-top: 30px;
  }

  .continue-reading {
    text-decoration: none;
    color: #0366d6;
  }

  &__article__filterMsg {
    font-size: 20px;
    text-align: center;
    margin-bottom: 15px;

    span {
      color: $blue;
    }
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

  .msg-box {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 200px;
    height: 200px;
    margin-left: -(@width / 2) + 125;
    margin-top: -(@height / 2) + 60;
    text-align: center;
    color: #bfbfbf;
  }
}

@media screen and (max-width: 850px) {
  .list {
    position: relative;
    padding-top: 80px;

    &__article__item {
      margin-bottom: 10px;
    }

    &__article {
      margin-left: 0;
    }

    &__article__filterMsg {
      font-size: 18px;
    }

    .msg-box {
      position: absolute;
      top: 250px;
      left: 50%;
      width: 300px;
      margin-left: -(@width / 2);
    }

    &__loading {
      position: absolute;
      top: 250px;
      left: 50%;
      width: 300px;
      margin-left: -(@width / 2);
    }
  }
}
</style>

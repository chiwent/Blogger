<template>
  <div class="list">
    <!-- 标签左侧栏 -->
    <div class="list__top-title">
      <i class="fa fa-tags" aria-hidden="true"></i>&nbsp;标签
    </div>
    <ul class="list__tag">
      <li
        v-for="tag in tagList"
        :key="tag.id"
        @click="toggleSelectFn(tag.id)"
        class="list__tag__item"
        :class="{ 'list__tag__item--active': selectTagArr.includes(tag.id)}"
      >
        <i class="fa fa-tag" aria-hidden="true"></i>&nbsp;&nbsp;
        <span>{{tag.name}}</span>
        <i class="fa fa-trash-o" aria-hidden="true" @click.stop="deleteTagFn(tag.id)"></i>
      </li>
    </ul>

    <!-- 编辑自我介绍左侧栏 -->
    <ul class="about_me">
      <div class="list__top-title">
        <i class="fa fa-tags" aria-hidden="true"></i>&nbsp;关于我
        <button class="about_me_button" @click.stop="editAbout">编辑</button>
      </div>
    </ul>

    <!-- 新建文章左侧栏 -->
    <ul class="list__article">
      <li @click="createArticle" class="list__article__button" @click.stop="newArticleEditor">
        <i class="fa fa-plus" aria-hidden="true"></i>&nbsp;新建文章
      </li>
      <li
        v-for="(article, index) in articleList"
        :key="article.id"
        @click="switchArticle(index)"
        class="list__article__item"
        :class="{'list__article__item--active': currentArticle.index == index}"
      >
        <h1 class="list__article__item__title">{{ article.title | cutTitle}}</h1>
        <div class="list__article__item__info">
          <i class="fa fa-tag" aria-hidden="true"></i>
          <span
            v-for="tag in article.tags"
            :key="tag.id"
            class="list__article__item__tag"
          >{{tag.name}}</span>
          <p class="list__article__item__createTime">
            <i class="fa fa-calendar" aria-hidden="true"></i>
            &nbsp; {{article.createTime}}
          </p>
          <p class="list__article__item__publish" v-if="article.publish">已发布</p>
          <p class="list__article__item__publish" v-else>草稿</p>
        </div>
      </li>
      <pagination :curPage="curPage" :allPage="allPage" @changePage="changePage"></pagination>

      <!-- 切换图片上传区  true：本地上传 false：sm.ms上传 -->
      <!-- <el-switch
        name="上传目标"
        v-model="isLocalUpload"
        style="display: block"
        active-text="本地"
        inactive-text="sm.ms"
      ></el-switch>-->

      <toggle-button
        v-model="isLocalUpload"
        :width="120"
        :height="30"
        :sync="true"
        :labels="{checked: '本地上传', unchecked: 'sm.ms上传'}"
        :color="{checked: '#409eff', unchecked: '#00a488'}"
      ></toggle-button>

      <!-- 本地markdown -->
      <div>
        <div class="markdown-wrapper" v-show="isLocalUpload">
          <h3 class="markdown-title">本地markdown图片上传区</h3>
          <el-button
            type="primary"
            class="markdown-btn"
            @click.stop="$router.push('/admin/album')"
          >进入</el-button>
          <el-upload
            class="upload-markdown"
            drag
            action
            :before-upload="beforeImageUpload"
            :on-success="handleSuccess"
            :limit="1"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5m</div>
          </el-upload>
        </div>

        <div class="markdown-wrapper" v-show="!isLocalUpload">
          <h3 class="markdown-title">SM.MS图片上传区</h3>
          <el-upload class="upload-smms" drag action :before-upload="beforeSMMSUpload" :limit="1">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5m</div>
          </el-upload>
        </div>
      </div>
      <h3 class="upload-result">图片链接：</h3>
      <p class="upload-src">{{ uploadImg }}</p>
    </ul>
    <!-- <el-button type="primary" @click="loadComment">加载评论</el-button> -->
  </div>
</template>


<script>
import Pagination from "publicComponents/Pagination.vue";
import { mapGetters, mapActions, mapMutations } from "vuex";
import eventBus from "../assets/eventBus/eventBus.js";
// import smms from "../../../api/uploadFile.js";
import uploadApi from "../../../api/uploadFile.js";
import axios from "axios";
import config from "serverConfig/index.js";
const baseUrl = config.location + "/server/public/markdown/";
export default {
  name: "list",
  computed: {
    ...mapGetters([
      "articleList",
      "tagList",
      "currentArticle",
      "allPage",
      "curPage",
      "selectTagArr"
    ])
    /*
    routeStatus() {
      return /\/admin$/.test(this.$route.path);
    }*/
  },
  components: {
    Pagination
  },
  data() {
    return {
      uploadImg: "",
      isLocalUpload: true
    };
  },
  filters: {
    cutTitle(value) {
      if (value.length > 24) {
        return value.substring(0, 24) + "...";
      } else {
        return value;
      }
    }
  },
  methods: {
    ...mapActions([
      "getAllArticles",
      "getAllTags",
      "getPublishTags",
      "getCurrentArticle",
      "deleteTag",
      "newArticle"
    ]),
    ...mapMutations({
      setAllPage: "SET_ALL_PAGE",
      setCurPage: "SET_CUR_PAGE",
      toggleSelect: "TOGGLE_SELECT_TAG"
    }),

    editAbout() {
      this.$store.dispatch("toggleEditor", "about").catch(err => {
        console.log(err);
      });
    },
    toggleSelectFn(id) {
      this.toggleSelect(id);
    },
    switchArticle(index) {
      this.$store.dispatch("newArticle", false);
      this.$store.dispatch("toggleEditor", "article").catch(err => {
        console.log(err);
      });
      if (!this.currentArticle.save) {
        this.$message.error("请先保存当前文章");
        return;
      }
      this.getCurrentArticle(index);
      // console.log(this.currentArticle.id);
      // debugger;
      eventBus.$emit("switchArticle", this.currentArticle.id);
    },
    createArticle() {
      this.$store.dispatch("toggleEditor", "article").catch(err => {
        console.log(err);
      });
      this.getCurrentArticle(-1);
    },
    deleteArticle() {
      this.$confirm("此操作将永久删除该文章, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$store
            .dispatch("deleteArticle", {
              id: this.currentArticle._id,
              index: this.currentArticle.index
            })
            .then(res => {
              if (res.data.success) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
              }
            })
            .catch(err => {
              console.log(err);
              this.$message.error(err.response.data.error);
            });
        })
        .catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '已取消删除'
          // });
        });
    },
    deleteTagFn(id) {
      this.$confirm("此操作将永久删除该标签, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.deleteTag({
            id
          })
            .then(res => {
              if (res.data.success) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                // this.getAllArticles({
                //   tag: this.selectTagArr
                // })
              }
            })
            .catch(err => {
              console.log(err);
              this.$message.error(err.response.data.error);
            });
        })
        .catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '已取消删除'
          // });
        });
    },
    changePage(cur) {
      this.getAllArticles({
        page: cur,
        tag: this.selectTagArr
      }).then(res => {
        this.getCurrentArticle(0);
        eventBus.$emit("switchArticle", res.data.articleArr[0].id);
      });
    },
    beforeImageUpload(file, fileList) {
      const acceptArr = [
        "image/pjpeg",
        "image/jpeg",
        "image/png",
        "image/x-png",
        "image/gif"
      ];
      const acceptType = acceptArr.some(item => {
        return file.type === item;
      });
      const limitSize = file.size / 1024 / 1024 < 5;
      if (!acceptType) {
        this.$message.error("上传图片只能是jpg或png、gif格式!");
      }
      if (!limitSize) {
        this.$message.error("上传图片大小不能超过 5MB!");
      }
      let form = new FormData();
      form.append("file", file);
      uploadApi
        .uploadMd(this.$store.state.auth.token, form)
        .then(res => {
          if (res.data.success) {
            this.$message({
              message: "上传成功",
              type: "success"
            });
            this.uploadImg = baseUrl + res.data.mdImg;
            /*
            this.$emit("on-success", res.data.mdImg);
            this.fileList.unshift({
              name: baseUrl + res.data.mdImg,
              url: baseUrl + res.data.mdImg
            });
            console.log("fileList:", this.fileList);
            */
          } else {
            this.$message({
              message: "上传失败",
              type: "error"
            });
          }
        })
        .catch(err => {
          this.$message({
            message: "上传失败",
            type: "error"
          });
        });

      return acceptType && limitSize;
    },
    beforeSMMSUpload(file, fileList) {
      const acceptArr = [
        "image/pjpeg",
        "image/jpeg",
        "image/png",
        "image/x-png"
      ];
      const acceptType = acceptArr.some(item => {
        return file.type === item;
      });
      const limitSize = file.size / 1024 / 1024 < 5;
      if (!acceptType) {
        this.$message.error("上传图片只能是jpg或png格式!");
      }
      if (!limitSize) {
        this.$message.error("上传图片大小不能超过 5MB!");
      }
      let form = new FormData();
      form.append("smfile", file);
      /*
      var res = Array.from(form.entries(), ([key, prop]) => ({
        [key]: {
          ContentLength: typeof prop === "string" ? prop.length : prop.size
        }
      }));
      console.log(res);
      */
      uploadApi
        .smmsUpload(form)
        .then(res => {
          if (res.data.code === "success") {
            this.uploadImg = res.data.data.url;
            this.$message({
              message: "上传成功",
              type: "success"
            });
          } else {
            this.$message({
              message: "上传失败",
              type: "error"
            });
          }
        })
        .catch(err => {
          console.error(err);
          this.$message({
            message: "上传失败",
            type: "error"
          });
        });

      return acceptType && limitSize;
    },
    handleSuccess(file) {
      console.log("file:", file);
    },
    newArticleEditor() {
      this.$store.dispatch("newArticle", true);
    }
  },

  mounted() {
    this.getAllArticles().then(res => {
      // console.log("allPage:", this.allPage);
      // console.log("curPage:", this.curPage);

      // this.dispatch("getArticleId", res.data.articleArr[0].id);
      eventBus.$emit("switchArticle", res.data.articleArr[0].id);
    });
    this.getAllTags();
    // this.getPublishTags();
  },
  watch: {
    selectTagArr(val, oldVal) {
      // console.log(val);
      // console.log("change selectTagArr");
      this.getAllArticles({
        tag: val
      }).then(res => {
        eventBus.$emit("switchArticle", this.currentArticle.id);
      });
    }
  }
};
</script>


<style lang="stylus" scoped>
@import '../assets/stylus/_settings.styl';

.list {
  padding: 15px;

  &__top-title {
    width: 100%;
    font-size: 25px;
    padding: 10px;
    color: $blue;

    span {
      padding-left: 15px;
    }
  }

  &__tag {
    height: 100px;
    margin-bottom: 30px;
    overflow: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    list-style: none;
    align-content: flex-start;
  }

  .about_me {
    height: 80px;

    &_button {
      float: right;
      margin: 5px;
      padding: 7px;
      flex-shrink: 1;
      background-color: #0288d1;
      color: #fff;
      border: none;
      border-radius: 5px;
      font-size: 15px;
      text-align: center;
      cursor: pointer;
      outline: none;

      &-active {
        background-color: $orange;
      }
    }
  }

  &__tag__item {
    // flex-grow 1
    flex-shrink: 1;
    background-color: $blue;
    color: white;
    border-radius: 5px;
    text-align: center;
    margin: 5px;
    padding: 7px;
    cursor: pointer;
    height: 36px;
  }

  &__tag__item--active {
    background-color: $orange;
  }

  &__article {
    margin-top: 5px;
    list-style: none;
  }

  &__article__item__title {
    font-size: 22px;
  }

  &__article__button {
    padding: 10px;
    font-size: 25px;
    color: $blue;
    cursor: pointer;
  }

  &__article__item {
    position: relative;
    width: 100%;
    height: 100px;
    background-color: $grey-bg;
    padding: 15px;
    margin-bottom: 5px;
    cursor: pointer;
  }

  &__article__item--active {
    border-left: 10px solid $blue;
  }

  &__article__item__info {
    position: absolute;
    bottom: 5px;
    right: 15px;
    text-align: right;
  }

  &__article__item__abstract {
    width: 100%;
    max-height: 50px;
    word-wrap: break-word;
    word-break: all;
  }

  &__article__item__publish {
    position: absolute;
    top: -45px;
    right: -3px;
    font-size: 13px;
    color: $grey-publish;
  }

  &__article__item__tag {
    padding: 0 5px;
    color: $blue;
  }

  .markdown-wrapper {
    position: relative;

    .markdown-title {
      display: inline-block;
      color: $blue;
      margin-bottom: 30px;
    }

    .markdown-btn {
      position: absolute;
      right: 20px;
    }
  }

  .upload-result {
    margin: 15px 0;
    color: $blue;
  }

  .upload-src {
    width: 100%;
    font-size: 17px;
    word-break: break-all;
  }
}
</style>

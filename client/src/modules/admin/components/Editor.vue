<template>
  <div class="editor-box">
    <p class="editor-box__title">
      <i class="fa fa-pencil-square" aria-hidden="true"></i>&nbsp;&nbsp;记录你的生活点滴
    </p>
    <div class="cover-wrapper">
      <h3 class="cover-title">文章封面图</h3>
      <el-upload
        class="upload-cover"
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
    <div class="editor-box__input-box">
      <label for="title">文章标题:</label>
      <input
        type="text"
        placeholder="文章标题"
        v-model="articleTitle"
        class="editor-box__input"
        id="title"
      >
    </div>
    <div class="editor-box__input-box">
      <label for="title">添加标签:</label>
      <!-- <input type="text" placeholder="回车添加文章标签" v-model="articleTag" @keyup.enter="AddTag"> -->
      <input type="text" placeholder="回车添加标签，发布后会保存标签" v-model="articleTag" @keyup.enter="AddTag">
    </div>
    <ul class="editor-box__tagList">
      <li v-for="(tag, index) in currentArticle.tags" :key="tag.name">
        <span>{{tag.name}}</span>&nbsp;&nbsp;
        <i class="fa fa-trash-o" aria-hidden="true" @click="deleteCurrentTag(index)"></i>
      </li>
    </ul>
    <textarea id="editor"></textarea>
    <div class="editor-box__button-box">
      <button @click="createArticle" v-if="currentArticle.id === -1">创建</button>
      <button @click="saveArticle({button: 'true'})" v-else>保存</button>
      <template v-if="currentArticle.id !== -1">
        <button @click="publishArticle" v-if="!currentArticle.publish">发布</button>
        <button @click="notPublishArticle" v-else>撤回发布</button>
      </template>
      <button @click="deleteArticle">删除</button>
    </div>

    <pure-comment></pure-comment>
  </div>
</template>

<script>
import SimpleMDE from "simplemde";
import debounce from "lib/debounce.js";
import marked from "lib/marked.js";
import css from "simplemde/dist/simplemde.min.css";

import uploadApi from "../../../api/uploadFile.js";

import PureComment from "./PureComment.vue";

import config from "serverConfig/index.js";
const baseUrl = config.location + "/markdown/";

import eventBus from "../assets/eventBus/eventBus.js";

import { mapGetters, mapActions, mapMutations } from "vuex";

let simplemde;
export default {
  name: "editor",
  components: {
    PureComment
  },
  data() {
    return {
      articleTag: "",
      tags: [],
      articleTitle: "",
      articleContent: "",
      nowId: ""
    };
  },
  computed: {
    ...mapGetters(["currentArticle", "selectTagArr"])
  },
  created() {
    eventBus.$on("switchArticle", id => {
      this.nowId = id;
    });
  },
  mounted: function() {
    // dom渲染完成后置入编辑器当前文章内容
    this.$nextTick(() => {
      this.articleTitle = this.currentArticle.title;
      this.articleContent = this.currentArticle.content;
      simplemde.value(this.articleContent);
    });
    simplemde = new SimpleMDE({
      autoDownloadFontAwesome: false,
      element: document.getElementById("editor"),
      spellChecker: false,
      previewRender: function(plainText) {
        return marked(plainText); // 返回渲染的HTML
      }
    });
    simplemde.codemirror.on("change", () => {
      let value = simplemde.value();
      // 如果文章内容相同就不保存了
      if (this.currentArticle.content === value) {
        return;
      }
      // 如果文章已经保存
      if (this.currentArticle.save) {
        // 改变文章状态 => 未保存
        this.$store.dispatch("changeArticle");
      }
      // 如果不是新建的文章，则保存，这是自动保存，如果不要自动保存可以注释
      if (this.currentArticle.id !== -1) {
        this.saveArticle({
          content: value
        });
      }
      this.articleContent = value;
    });
  },
  methods: {
    ...mapActions(["getCurrentArticle", "getAllTags", "getAllArticles"]),
    ...mapMutations({
      clearSelect: "CLEAR_SELECT_TAG"
    }),
    createArticle() {
      const info = {
        title: this.articleTitle,
        content: this.articleContent,
        publish: false,
        tags: this.currentArticle.tags
      };
      this.$store
        .dispatch("createArticle", info)
        .then(res => {
          if (res.data.success) {
            this.$message({
              message: "创建成功",
              type: "success"
            });
            // 这里不再需要getAllArticles因为有watch函数监听变化
            // this.getAllArticles().then(res => {
            //  this.clearSelect();
            // })
            this.clearSelect();
          }
        })
        .catch(err => {
          this.$message.error(err.response.data.error);
        });
    },
    // 保存文章引入去抖
    saveArticle: debounce(function({
      title = this.articleTitle,
      content = this.articleContent,
      button = false
    }) {
      let abstract;
      if (content.indexOf("<!--more-->") !== -1) {
        abstract = content.split("<!--more-->")[0];
      } else {
        this.$message.error("请填写摘要");
        return;
      }
      const article = {
        title: title,
        content: content,
        abstract: abstract,
        tags: this.currentArticle.tags,
        lastEditTime: new Date()
      };
      this.$store
        .dispatch("saveArticle", {
          id: this.currentArticle.id,
          article
        })
        .then(res => {
          console.log("save article");
          if (res.data.success && button) {
            this.$message({
              message: "保存成功",
              type: "success"
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error(err.response.data.error);
        });
    }),
    publishArticle() {
      this.$store
        .dispatch("publishArticle", {
          id: this.currentArticle.id
        })
        .then(res => {
          if (res.data.success) {
            this.$message({
              message: "发布成功",
              type: "success"
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error(err.response.data.error);
        });
    },
    notPublishArticle() {
      this.$store
        .dispatch("notPublishArticle", {
          id: this.currentArticle.id
        })
        .then(res => {
          if (res.data.success) {
            this.$message({
              message: "撤回发布成功",
              type: "success"
            });
          }
        })
        .catch(err => {
          this.$message.error(err.response.data.error);
        });
    },
    deleteArticle() {
      this.$confirm("此操作将永久删除该文章, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          if (this.currentArticle.id === -1) {
            this.getCurrentArticle(0);
            return;
          }
          this.$store
            .dispatch("deleteArticle", {
              id: this.currentArticle.id,
              index: this.currentArticle.index
            })
            .then(res => {
              if (res.data.success) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                // this.getAllArticles();
                // 因为clearSelect就可以更新全部文章了
                this.clearSelect();
              }
            })
            .catch(err => {
              console.log(err);
              this.$message.error(err.response.data.error);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    /*
    SaveTag() {

    },
    */
    AddTag() {
      if (this.currentArticle.tags.find(p => p.name === this.articleTag)) {
        this.$message.error("该标签已存在");
      } else {
        if (this.currentArticle.tags.length >= 5) {
          this.$message({
            type: "error",
            message: "不能创建超过5个标签"
          });
          return;
        }
        this.$store
          .dispatch("createTag", {
            name: this.articleTag
          })
          .then(res => {
            if (res.data.success) {
              this.$message({
                message: "创建成功",
                type: "success",
                duration: 500
              });
              this.getAllTags();
              this.articleTag = "";
              if (this.currentArticle.id !== -1) {
                this.saveArticle({});
              }
            }
          })
          .catch(err => {
            this.$message.error(err.response.data.error);
          });
      }
    },
    deleteCurrentTag(index) {
      console.log("tagIndex:", index);
      this.$confirm("此操作将永久删除该标签, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$store
            .dispatch("deleteCurrentTag", { index })
            .then(res => {
              if (this.currentArticle.id !== -1) {
                this.saveArticle({});
              }
              this.getAllTags();
            })
            .catch(err => {
              this.$message.error(err);
            });
        })
        .catch(() => {});
    },
    beforeImageUpload(file, fileList) {
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
            let imgUrl = baseUrl + res.data.mdImg;
            console.log(imgUrl);
            uploadApi
              .uploadCover(this.nowId, imgUrl)
              .then(res => {})
              .catch(err => {});
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
    handleSuccess() {}
  },
  watch: {
    currentArticle(val, oldVal) {
      // 监听vuex current变化改变组件data
      this.articleTitle = val.title;
      this.articleContent = val.content;
      this.articleTag = "";
      if (oldVal.id !== val.id && simplemde.isPreviewActive()) {
        simplemde.togglePreview();
      }
      simplemde.value(this.articleContent);
    },
    articleTitle(val) {
      // 监听v-model, 假如变化并且不是新建文章则保存
      if (this.currentArticle.title !== val && this.currentArticle.id !== -1) {
        this.$store.dispatch("changeArticle");
        this.saveArticle({
          title: val
        });
      }
    }
  }
};
</script>

<style lang="stylus">
@import '../assets/stylus/preview.styl';
</style>
<style lang="stylus" scoped>
@import '../assets/stylus/_settings.styl';

.editor-box {
  position: relative;
  padding: 15px;

  input {
    padding: 7px;
    background-color: $grey-bg;
    width: 350px;
  }

  &__title {
    font-size: 25px;
    color: $blue;
    padding: 10px;
  }

  &__input-box {
    font-size: 17px;
    margin: 15px 0;
  }

  &__tagList {
    list-style: none;
    overflow: hidden;
    margin-bottom: 15px;

    li {
      float: left;
      height: 30px;
      line-height: @height;
      margin-right: 20px;
      verticle-align: center;
      text-algin: center;
      border-radius: 5px;
      padding: 0 5px;
      cursor: pointer;
    }

    li:hover {
      background-color: $grey-bg;
    }
  }

  &__button-box {
    float: right;
    margin: 10px;

    button {
      width: 80px;
      padding: 5px;
      background-color: $blue;
      color: white;
      margin-left: 15px;
    }
  }
}

.cover-wrapper {
  .cover-title {
    text-align: center;
    color: $blue;
    margin-bottom: 15px;
  }

  .upload-cover {
    margin-bottom: 20px;
    text-align: center;
  }
}
</style>

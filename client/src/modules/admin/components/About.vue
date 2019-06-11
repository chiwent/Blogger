<template>
  <div class="editor-box">
    <h3 class="avatar-title">头像上传</h3>
    <el-upload
      class="upload-demo"
      action
      drag
      :before-upload="beforeAvatarUpload"
      :on-success="handleSuccess"
      :limit="1"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过2m</div>
    </el-upload>
    <transition name="fade">
      <div>
        <div class="editor-box__input-box">
          <label for="title" style="margin-right: 20px;">文章标题:</label>
          <input
            type="text"
            placeholder="文章标题"
            v-model="aboutTitle"
            class="editor-box__input"
            id="title"
          >
        </div>
        <textarea id="about__editor"></textarea>
        <div class="editor-box__button-box">
          <button @click="createAbout" v-if="!hasAbout">创建</button>
          <button @click="saveAbout({button: 'true'})">保存</button>
          <template>
            <button @click="publishAbout">发布</button>
            <button @click="notPublishAbout" v-if="aboutStatus === 1">撤回发布</button>
          </template>
          <button @click="deleteAbout" v-if="aboutStatus === 1">删除</button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import axios from "axios";
import SimpleMDE from "simplemde";
import marked from "lib/marked.js";
import css from "simplemde/dist/simplemde.min.css";
import debounce from "lib/debounce.js";
import aboutApi from "../../../api/about.js";

import config from "serverConfig/index.js";
const baseURL = config.location + "/api/upload";

import { mapGetters, mapActions } from "vuex";

let simplemde;

export default {
  name: "About",
  data() {
    return {
      aboutTitle: "",
      aboutContent: "",
      hasAbout: false,
      imageUrl: ""
    };
  },
  computed: {
    ...mapGetters(["aboutStatus"]),
    headers() {
      return {
        Authorization: "token " + this.$store.state.token
      };
    }
  },
  created() {},
  mounted() {
    // dom渲染完成后置入编辑器当前文章内容
    aboutApi
      .getAbout()
      .then(res => {
        this.aboutTitle = res.data.title;
        this.aboutContent = res.data.content;

        if (res.data.title && res.data.content) {
          this.hasAbout = true;
        }
        this.$store.dispatch("toggleAboutStatus", +res.data.publish);

        simplemde.value(this.aboutContent);
      })
      .catch(err => {
        this.$message.error(err.response.data.error);
      });
    simplemde = new SimpleMDE({
      autoDownloadFontAwesome: false,
      element: document.getElementById("about__editor"),
      spellChecker: false,
      previewRender: function(plainText) {
        return marked(plainText); // 返回渲染的HTML
      }
    });
    simplemde.codemirror.on("change", () => {
      let value = simplemde.value();
      // 如果文章内容相同就不保存了
      if (this.aboutContent === value) {
        return;
      }
      this.aboutContent = value;
    });
  },
  methods: {
    ...mapActions(["toggleAboutStatus"]),
    /*
    uploadFile() {
      return "http://localhost:8889/api/upload";
    },
    */
    beforeAvatarUpload(file) {
      const acceptArr = [
        "image/pjpeg",
        "image/jpeg",
        "image/png",
        "image/x-png"
      ];
      const acceptType = acceptArr.some(item => {
        return file.type === item;
      });
      const limitSize = file.size / 1024 / 1024 < 2;
      if (!acceptType) {
        this.$message.error("上传头像图片只能是jpg或png格式!");
      }
      if (!limitSize) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      let form = new FormData();
      form.append("file", file);
      axios
        .post(baseURL, form, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "token " + this.$store.state.auth.token
          }
        })
        .then(res => {
          if (res.data.success) {
            this.$message({
              message: "上传成功",
              type: "success"
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
    handleSuccess(resp, file) {
      // this.imageUrl = URL.createObjectURL(file.raw);
      // console.log(resp);
      // debugger;
    },
    // ...mapActions(["getAbout"]),
    createAbout() {
      const about = {
        title: this.aboutTitle,
        content: this.aboutContent,
        publish: false
      };
      this.$store
        .dispatch("createAbout", about)
        .then(res => {
          this.hasAbout = true;
          if (res.data.success) {
            this.$message({
              message: "创建成功",
              type: "success"
            });
          }
        })
        .catch(err => {
          this.$message.error(err.response.data.error);
        });
    },
    // 保存文章引入去抖
    saveAbout: debounce(function({
      title = this.aboutTitle,
      content = this.aboutContent,
      button = false
    }) {
      const about = {
        title: title,
        content: content
      };
      aboutApi
        .saveAbout(about)
        .then(res => {
          console.log("save about");
          // console.log(res.data);
          // debugger;
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
    publishAbout() {
      /*
      this.$store
        .dispatch("publishAbout")
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
      */
      aboutApi
        .publishAbout()
        .then(res => {
          this.$store.dispatch("toggleAboutStatus", 1);
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
    notPublishAbout() {
      /*
      this.$store
        .dispatch("notPublishAbout")
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
        */
      aboutApi
        .notPublishAbout()
        .then(res => {
          if (res.data.success) {
            this.$store.dispatch("toggleAboutStatus", 0);
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
    deleteAbout() {
      this.$confirm("此操作将永久删除该文章, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          aboutApi
            .deleteAbout()
            .then(res => {
              this.$store.dispatch("toggleAboutStatus", 0);
              this.hasAbout = false;
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
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
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
  top: 50px;
  padding: 15px;

  .avatar-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 20px;
  }

  .upload-demo {
    margin-bottom: 50px;
  }

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

.fade-enter-active, .fade-leave-active {
  transition: all 0.5s;
}

.fade-enter, .fade-leave-active {
  opacity: 0;
}

.fade-enter {
  transform: translateX(50px);
}

.fade-leave-active {
  transform: translateX(-50px);
}
</style>


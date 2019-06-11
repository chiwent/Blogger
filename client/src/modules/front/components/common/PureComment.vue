<template>
  <div class="comment">
    <p class="comment-title">如果对本文有见解，请发一条友善的评论吧</p>
    <!-- <div class="comment-author-box">
      <div class="comment-author-name">
        <label for="author-name">用户名(必填)：</label>
        <input
          type="text"
          placeholder
          v-model="authorName"
          class="comment-author-name-input"
          id="author-name"
        >
      </div>
      <div class="comment-author-email">
        <label for="author-email">邮箱(必填)：</label>
        <input
          type="text"
          placeholder
          v-model="authorEmail"
          class="comment-author-email-input"
          id="author-email"
        >
      </div>
    </div>-->
    <div class="comment-editor-box">
      <p class="comment-resp" v-if="respUserId">
        回复：
        <span class="resp-target">@{{ respUserName }}</span>
        <button class="cancel-resp" @click.stop="cancelRep">取消</button>
      </p>

      <div class="markdown">
        <div class="markdown__editor">
          <textarea class="markdown__input" ref="markdown" v-model="commentContent"></textarea>
        </div>
        <div class="markdown__preview" v-html="preview"></div>
      </div>
    </div>

    <button class="submit-btn" @click="createCM">提交</button>
    <!-- <el-button type="primary" class="submit-btn">提交</el-button> -->
    <!-- <p>{{postComment}}</p> -->

    <p class="comment-item-box-tip">评论</p>

    <div class="comment-item-box" v-for="(item, index) in postComment" :key="index">
      <div class="comment-item-wrapper" v-if="!item.parent">
        <div class="comment-item-author">
          <p
            class="author-name"
            :class="{'author-admin': item.name === 'admin'}"
            @click.stop="routeToUser(item.uid, item.name)"
          >{{ item.name }}</p>
          <span class="publish-time">{{ item.createTime }}</span>
          <span class="resp" @click.stop="commentRsp(item.uid, item.name, item.id)">回复</span>
        </div>
        <!-- <p>item.content: {{ item.content }}</p> -->
        <div class="comment-item" v-html="item.content"></div>
        <div
          class="sub-comment-box"
          v-for="(subContent, subIndex) in postComment.filter(subItem => subItem.parent === item.id)"
          :key="subIndex"
        >
          <div class="sub-comment-author">
            <p
              class="author-name"
              :class="{'author-admin': subContent.name === 'admin'}"
              @click.stop="routeToUser(subContent.uid, subContent.name)"
            >{{ subContent.name }}</p>
            <span class="publish-time">{{ subContent.createTime }}</span>
            <span
              class="resp"
              @click.stop="commentRsp(subContent.uid, subContent.name, subContent.parent)"
            >回复</span>
          </div>
          <div class="sub-comment-item" v-html="subContent.content"></div>
        </div>
      </div>
    </div>

    <toast></toast>
  </div>
</template>
<script>
// import { markdown } from "markdown";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

import commentApi from "../../../../api/comment.js";

import Toast from "../../../../components/Toast.vue";

import { setStorage, getStorage } from "../../../../util/util.js";

import debounce from "lib/debounce.js";

// import Validator from "../../../../../../util/validator.js";

export default {
  name: "PureComment",
  components: {
    Toast
  },
  /*
  props: {
    routeId: {
      type: String
    }
  },
  */
  computed: {
    routeIdComputed() {
      return this.routeId;
    }
  },
  data() {
    return {
      // authorName: "",
      // authorEmail: "",
      postComment: void 0,
      commentContent: void 0,
      respUserId: "",
      respUserName: "",
      respFloorId: undefined,
      preview: "",
      // renderContent: "",
      markdown: void 0,
      toastText: "",
      toastStyle: void 0,
      atFlag: void 0,
      floor: 1
    };
  },
  computed: {},
  created() {},
  mounted() {
    const id = this.$route.params.id;
    // if (!this.postComment) {
    this.getPublishCM(id);
    // }
    this.markdown = new MarkdownIt({
      highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return (
              '<pre class="hljs"><code>' +
              hljs.highlight(lang, str, true).value +
              "</code></pre>"
            );
          } catch (__) {}
        }

        return (
          '<pre class="hljs"><code>' +
          this.markdown.utils.escapeHtml(str) +
          "</code></pre>"
        );
      }
    });
    this.$refs.markdown.oninput = e => {
      this.mdcontent = e.target.value;
      // this.preview = markdown.toHTML(content);
      this.preview = this.markdown.render(this.mdcontent);
    };
  },
  beforeDestroy() {},
  methods: {
    mdRender(content) {
      if (content) {
        return this.markdown.render(content);
      }
    },
    getPublishCM(id) {
      commentApi
        .getPublishComment(id)
        .then(res => {
          const data = res.data.comment;
          this.postComment = data;
        })
        .catch(err => {
          // alert("Error:", err);
          this.toastText = "获取评论失败";
          this.toastStyle = "toast-error";
        });
    },
    createCM() {
      const id = this.$route.params.id;
      // this.commentContent = this.commentContent.replace(/[^\u4e00-\u9fa5\u0030-\u0039\u0061-\u007a\u0041-\u005a]+/g, '');
      let token = getStorage({
        name: "token",
        type: "session"
      });
      if (!token) {
        this.$EventBus.$emit("toast", "你还没有登录", "toast-error");
        return;
      }
      if (this.commentContent === "") {
        // alert("内容不能为空");
        this.$EventBus.$emit("toast", "内容不能为空", "toast-error");
        return;
      }
      /*
      this.validateUserName();
      this.validateEmail();
      this.validateContent();
      */
      if (this.respUserId) {
        this.atFlag = "<b>@" + this.respUserName + "</b><br>";
      } else {
        this.atFlag = "";
      }
      this.commentContent = this.atFlag + this.mdRender(this.commentContent);
      this.commentContent = this.commentContent.replace(
        /[` ~!@#$%^&*()_|+\-=?;:'",.\{\}\[\]\\\/]/gi,
        ""
      );
      // console.log(this.commentContent);
      commentApi
        .createComment(
          id,
          this.commentContent,
          this.respFloorId,
          this.respUserId,
          this.respUserName
        )
        .then(res => {
          this.$EventBus.$emit("toast", "发布评论成功", "toast-success");
          this.commentContent = "";
          this.preview = "";
          this.respFloorId = void 0;
          this.respUserId = void 0;
          this.respUserName = void 0;
        })
        .catch(err => {
          // alert("Error:", err);
          this.$EventBus.$emit("toast", "发布评论失败", "toast-error");
        });
    },
    /*
    validateUserName() {
      this.validateFn(
        this.authorName,
        "isUserName",
        "用户名格式不正确，请使用2到10位中英文和数字组合"
      );
    },
    validateEmail() {
      this.validateFn(this.authorEmail, "isEmail", "邮箱格式不正确");
    },
    validateContent() {
      this.validateFn(this.commentContent, "isEmpty", "内容不能为空");
    },
    validateFn(value, strategy, errorMsg) {
      const validate = () => {
        let validator = new Validator();
        validator.add(value, [
          {
            strategy: strategy,
            errorMsg: errorMsg
          }
        ]);
        let result = validator.start();
        return result;
      };
      let error = validate();
      if (error) {
        this.$EventBus.$emit("toast", error, "toast-error");
        return;
      }
    },
    */
    commentRsp(respId, respUserName, parentId = undefined) {
      if (parentId) {
        this.respFloorId = parentId;
      } else {
        this.respFloorId = void 0;
      }
      // console.log(this.respFloorId);
      this.respUserId = respId;
      this.respUserName = respUserName;
    },
    cancelRep() {
      this.respUserId = void 0;
      this.respUserName = void 0;
      this.respFloorId = void 0;
    },
    routeToUser(userId, userName) {
      if (userName !== "admin") {
        this.$router.push(`/userinfo/${userId}`);
      } else {
        this.$router.push("/about");
      }
    }
    /*
    beforeRouteEnter(to, from, next) {
      if (
        to.path !== from.path &&
        to.path.indexOf("article") &&
        from.path.indexOf("article")
      ) {
        this.getPublishCM(this.$route.params.id);
        next();
      }
    }
    */
  },
  watch: {
    $route: function(to, from) {
      this.getPublishCM(this.$route.params.id);
    }
  }
};
</script>
<style lang="stylus" scoped>
$red = #ff0000;
$pureBlue = #007fff;
$green = #449d44;

.comment {
  position: relative;
  margin-bottom: 80px;

  &-title {
    margin: 50px 0;
    font-size: 20px;
  }

  &-author-box {
    width: 100%;
    margin: 20px 0;
  }

  &-author-name, &-author-email {
    width: 50%;
    display: inline-block;
    cursor: pointer;
  }

  &-author-name-input, &-author-email-input {
    max-width: 90%;
    height: 30px;
    border: 1px solid #aaaaaa;
  }
}

.comment-editor-box {
  position: relative;
  margin-bottom: 15px;

  .comment-resp {
    margin-bottom: 10px;
  }

  .cancel-resp {
    position: absolute;
    right: 20px;
    color: $red;
    outline: none;
  }
}

.submit-btn {
  position: absolute;
  right: 0;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 4px;

  &:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
  }
}

.comment-item-box-tip {
  margin-top: 50px;
  text-align: center;
  font-size: 19px;
  color: #666666;

  &:before, &:after {
    width: 30%;
    height: 1px;
    background-color: #aaaaaa;
  }
}

.comment-item-box {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.7);

  .comment-item-wrapper {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #dddddd;
    overflow-x: auto;
  }

  .comment-item-author {
    position: relative;

    .author-name {
      margin-bottom: 10px;
      color: $pureBlue;
      cursor: pointer;
    }

    .publish-time {
      color: #aaaaaa;
      font-size: 13px;
    }

    .resp {
      position: absolute;
      top: 0;
      right: 10px;
      color: $green;
      cursor: pointer;
    }
  }

  .comment-item {
    margin: 20px 0 0 15px;
    font-size: 17px;
  }
}

.sub-comment-box {
  position: relative;
  padding: 10px;
  border: 1px solid #cfcfcf;
  margin: 20px 0 20px 25px;

  .author-name {
    margin-bottom: 10px;
    color: $pureBlue;
    cursor: pointer;
  }

  .publish-time {
    color: #aaaaaa;
    font-size: 13px;
  }

  .resp {
    position: absolute;
    top: 10px;
    right: 10px;
    color: $green;
    cursor: pointer;
  }
}

.author-admin {
  font-weight: 700;
  color: #fb8b02 !important;
}

.markdown {
  position: relative;
  overflow: hidden;
  border: 2px solid #000000;
  height: 200px;
}

.markdown__editor {
  position: absolute;
  width: 50%;
  height: 100%;
  box-sizing: border-box;
  border-right: 1px solid #999999;
}

.markdown__input {
  width: 100%;
  height: 100%;
  padding: 10px;
  font-size: 16px;
  outline: none;
  resize: none;
}

.markdown__preview {
  position: absolute;
  padding: 10px;
  right: 0;
  width: 50%;
  height: 100%;
  overflow-y: auto;
}

.v-note-wrapper .markdown-body {
  z-index: 1;
}
</style>

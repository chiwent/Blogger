<template>
  <div class="comment">
    <p>评论编辑区:</p>
    <div class="comment-editor-box">
      <p class="comment-resp" v-if="respUserName">
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

    <button class="submit-btn" @click="createAdminCM">提交</button>
    <!-- <el-button type="primary" class="submit-btn">提交</el-button> -->
    <!-- <p>{{postComment}}</p> -->

    <p class="comment-item-box-tip">评论</p>
    <div v-show="!$store.state.editor.newArticleFlag">
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
          <div class="comment-status-top">
            <el-tag class="status-btn" type="success" v-if="item.state === 1">已发布</el-tag>
            <el-tag class="status-btn" type="warning" v-if="item.state === 0">待审核</el-tag>
            <!-- <el-tag class="status-btn" type="danger" v-if="item.state === 2">已删除</el-tag> -->
          </div>
          <div class="comment-status-btn-top">
            <el-button type="success" v-if="item.state !== 1" @click.stop="publishCM(item.id)">发布</el-button>
            <el-button
              type="warning"
              v-if="item.state !== 0 && item.state !== 2"
              @click.stop="notPublishCM(item.id)"
            >撤销发布</el-button>
            <!-- <el-button type="danger" v-if="item.state !== 2" @click.stop="deleteCM(item.id)">删除</el-button> -->
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
            <div class="comment-status">
              <el-tag class="status-btn" type="success" v-if="subContent.state === 1">已发布</el-tag>
              <el-tag class="status-btn" type="warning" v-if="subContent.state === 0">待审核</el-tag>
              <!-- <el-tag class="status-btn" type="danger" v-if="subContent.state === 2">已删除</el-tag> -->
            </div>
            <div class="comment-status-btn">
              <el-button
                type="success"
                v-if="subContent.state !== 1"
                @click.stop="publishCM(subContent.id)"
              >发布</el-button>
              <el-button
                type="warning"
                v-if="subContent.state !== 0 && item.state !== 2"
                @click.stop="notPublishCM(subContent.id)"
              >撤销发布</el-button>
              <!-- <el-button
                type="danger"
                v-if="subContent.state !== 2"
                @click.stop="deleteCM(subContent.id)"
              >删除</el-button>-->
            </div>
            <div class="sub-comment-item" v-html="subContent.content"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import { markdown } from "markdown";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

import commentApi from "../../../api/comment.js";
import debounce from "lib/debounce.js";

import eventBus from "../assets/eventBus/eventBus.js";

import config from "serverConfig/index.js";
const baseUrl = config.location;

export default {
  name: "PureComment",
  components: {},
  data() {
    return {
      authorName: "",
      authorEmail: "",
      postComment: void 0,
      commentContent: void 0,
      respUserId: "",
      respUserName: "",
      respFloorId: undefined,
      preview: "",
      renderContent: "",
      nowId: void 0,
      atFlag: void 0
      // markdown: void 0
    };
  },
  computed: {
    computedComment() {
      return this.postComment;
    }
  },
  created() {
    eventBus.$on("switchArticle", id => {
      this.nowId = id;
      if (id) {
        this.getAllCM(id);
      }
    });
  },
  mounted() {
    // console.log("id:", this.$store.state.articleId);
    this.markdown = new MarkdownIt({
      highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return (
              '<pre class="hljs"><code>' +
              hljs.highlight(lang, str, true).value +
              "</code></pre>"
            );
          } catch (err) {
            console.log(err);
          }
        }

        return (
          '<pre class="hljs"><code>' +
          this.markdown.utils.escapeHtml(str) +
          "</code></pre>"
        );
      }
    });
    this.$refs.markdown.oninput = e => {
      let content = e.target.value;
      // this.preview = markdown.toHTML(content);
      this.preview = this.markdown.render(content);
    };
  },
  beforeDestroy() {
    eventBus.$off("switchArticle");
  },
  methods: {
    mdRender(content) {
      return this.markdown.render(content);
    },
    getAllCM(id) {
      commentApi
        .getAllComment(id)
        .then(res => {
          const data = res.data.comment;
          this.postComment = data;
        })
        .catch(err => {
          this.$message({
            message: "系统异常",
            type: "error"
          });
        });
    },
    createAdminCM() {
      const id = this.nowId;
      if (this.commentContent === "") {
        this.$message({
          message: "内容不能为空",
          type: "error"
        });
        return;
      }
      if (this.respUserId) {
        this.atFlag = "<b>@" + this.respUserName + "</b><br>";
      } else {
        this.atFlag = "";
      }
      this.commentContent = this.atFlag + this.mdRender(this.commentContent);
      commentApi
        .createAdminComment(
          id,
          this.commentContent,
          this.respFloorId,
          this.respUserId,
          this.respUserName
        )
        .then(res => {
          //   console.log(res.data);
          this.$message({
            message: "提交成功",
            type: "success"
          });
          this.commentContent = "";
          this.preview = "";
          this.respFloorId = void 0;
          this.respUserId = void 0;
          this.respUserName = void 0;
        })
        .catch(err => {
          this.$message({
            message: "系统异常",
            type: "error"
          });
        });
    },
    commentRsp(respId, respUserName, parentId = undefined) {
      if (parentId) {
        this.respFloorId = parentId;
      } else {
        this.respFloorId = void 0;
      }
      this.respUserId = respId;
      this.respUserName = respUserName;
    },
    cancelRep() {
      this.respUserId = void 0;
      this.respUserName = void 0;
      this.respFloorId = void 0;
    },
    publishCM(id) {
      this.$confirm("需要发表该评论吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        commentApi
          .publishComment(id, this.nowId)
          .then(res => {
            // console.log(res.data);
            // debugger;
            if (res.data.success) {
              this.getAllCM(this.nowId);
              this.$message({
                message: "发布成功",
                type: "success"
              });
            }
          })
          .catch(err => {
            this.$message({
              message: "系统异常",
              type: "error"
            });
          });
      });
    },
    notPublishCM(id) {
      this.$confirm("需要撤销该评论的发布吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        commentApi
          .notPublishComment(id, this.nowId)
          .then(res => {
            // console.log(res.data);
            // debugger;
            if (res.data.success) {
              this.getAllCM(this.nowId);
              this.$message({
                message: "撤销发布成功",
                type: "success"
              });
            }
          })
          .catch(err => {
            this.$message({
              message: "系统异常",
              type: "error"
            });
          });
      });
    },
    deleteCM(id) {
      this.$confirm("需要删除该评论的发布吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        commentApi
          .deleteComment(id)
          .then(res => {
            // console.log(res.data);
            // debugger;
            if (res.data.success) {
              this.getAllCM(this.nowId);
              this.$message({
                message: "删除成功",
                type: "success"
              });
            }
          })
          .catch(err => {
            this.$message({
              message: "系统异常",
              type: "error"
            });
          });
      });
    },
    routeToUser(userId, userName) {
      if (userName !== "admin") {
        // this.$router.replace(`/userinfo/${userId}`);
        location.href = `${baseUrl}/userinfo/${userId}`;
      } else {
        location.href = baseUrl + "/about";
      }
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
  top: 100px;
  min-height: 350px;
  margin-bottom: 50px;

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
  }

  &-author-name-input, &-author-email-input {
    max-width: 90%;
    height: 30px;
    border: 1px solid #aaaaaa;
  }
}

.comment-status-top {
  position: absolute;
  top: 10px;
  left: 160px;
}

.comment-status-btn-top {
  position: absolute;
  top: 10px;
  left: 250px;
}

.comment-status {
  position: absolute;
  top: 0;
  left: 150px;
}

.comment-status-btn {
  position: absolute;
  top: 0;
  left: 240px;
}

.status-btn {
  cursor: pointer;
}

.comment-editor-box {
  position: relative;
  margin-bottom: 15px;

  .markdown {
    width: 80%;
    left: 50%;
    transform: translateX(-50%);
  }

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

.author-admin {
  font-weight: 700;
  color: #fb8b02 !important;
}

.submit-btn {
  position: absolute;
  right: 20px;
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
  .comment-item-wrapper {
    position: relative;
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
    top: 0;
    right: 10px;
    color: $green;
    cursor: pointer;
  }
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
</style>

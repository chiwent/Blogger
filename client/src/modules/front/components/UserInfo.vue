<template>
  <div class="userInfo">
    <div class="userInfo-container">
      <div class="user-wrapper">
        <div class="userInfo-column userInfo-column-1">
          <div class="userInfo-form">
            <p class="userInfo-title">个人信息</p>

            <div class="userInfo-wrapper">
              <div class="user-avatar-wrapper">
                <img :src="userAvatar" alt="avatar" v-if="userAvatar">
              </div>
            </div>
            <p class="create-time">加入时间：{{userInfo.createTime}}</p>
            <div class="user-info-row-container">
              <div class="userInfo-wrapper">
                <div class="userInfo-row-wrapper">
                  <span class="userInfo-label">用户名：</span>
                  <p class="userInfo-info-content">{{ userInfo.username }}</p>
                </div>
              </div>
              <div class="userInfo-wrapper">
                <div class="userInfo-row-wrapper">
                  <span class="userInfo-label">邮箱：</span>
                  <p class="userInfo-info-content">{{ userInfo.showemail }}</p>
                </div>
              </div>
              <div class="userInfo-wrapper">
                <div class="userInfo-row-wrapper">
                  <span class="userInfo-label">网站：</span>
                  <p
                    class="website userInfo-info-content"
                    @click.stop="routerToUser(userInfo.website)"
                  >{{ userInfo.website }}</p>
                </div>
              </div>
              <div class="userInfo-wrapper">
                <div class="userInfo-row-wrapper">
                  <span class="userInfo-label">座右铭：</span>
                  <p class="userInfo-info-content">{{ userInfo.motto }}</p>
                </div>
              </div>
              <div class="userInfo-desc">
                <div class="userInfo-row-wrapper">
                  <span class="userInfo-label">介绍：</span>
                  <p class="userInfo-info-content">{{ userInfo.intro }}</p>
                </div>
              </div>
            </div>
            <div class="edit-btn-wrapper">
              <button class="edit-btn" @click.stop="editUserInfo" v-if="$store.state.token">编辑</button>
            </div>
          </div>
        </div>

        <div class="userInfo-column userInfo-column-2">
          <p class="userInfo-title">最近的评论</p>
          <template v-if="userInfo.comment.length > 0">
            <div
              class="userInfo-row-wrapper recent-comment"
              v-for="(comment, index) in userInfo.comment"
              :key="index"
              @click.stop="routerToArticle(comment.postId)"
            >
              <div class="userInfo-comment-resp" v-if="comment.respUser">
                <span class="resp-user-label">回复：</span>
                <span class="resp-user">{{comment.respUser}}</span>
              </div>
              <span class="resp-content-label">内容：</span>
              <div class="userInfo-comment-content" v-html="comment.content"></div>
              <p class="userInfo-comment-time">
                <span class="resp-time-label">时间：</span>
                {{ comment.createTime }}
              </p>
            </div>
          </template>
          <template v-else>
            <div class="empty-wrapper">
              <div class="empty-tip">暂时还没有内容哦~</div>
              <div class="animate-img"></div>
            </div>
          </template>
        </div>
        <div class="userInfo-column userInfo-column-3" v-if="$store.state.uid === $route.params.id">
          <p class="userInfo-title">未读消息</p>
          <template v-if="userMsg.length > 0">
            <div
              class="userInfo-row-wrapper recent-comment"
              v-for="(message, index) in userMsg"
              :key="index"
              @click.stop="routerToMsg(message._id, message.postId)"
            >
              <div class="userInfo-comment-resp" v-if="message.respUser">
                <span class="resp-user-label">回复：</span>
                <span
                  class="resp-user"
                  @click.stop="routerToUser(message.name, message.uid)"
                >{{message.name}}</span>
              </div>
              <span class="resp-content-label">内容：</span>
              <div class="userInfo-comment-content" v-html="message.content"></div>
              <p class="userInfo-comment-time">
                <span class="resp-time-label">时间：</span>
                {{ message.createTime }}
              </p>
            </div>
          </template>
          <template v-else>
            <div class="empty-wrapper">
              <div class="empty-tip">暂时还没有内容哦~</div>
              <div class="animate-img"></div>
            </div>
          </template>
        </div>
      </div>

      <div class="edit-container" v-show="isShowEdit">
        <div class="userInfo-form">
          <p class="userInfo-title">个人信息</p>
          <svg
            t="1559747750824"
            class="close-btn"
            style
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1994"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            @click.stop="closeInfo"
          >
            <defs>
              <style type="text/css"></style>
            </defs>
            <path
              d="M511.488511 972.851149c254.238434 0 460.33966-206.101227 460.339661-460.33966S765.726945 52.171828 511.488511 52.171828 51.148851 258.273055 51.148851 512.511489s206.101227 460.33966 460.33966 460.33966z m0 51.148851C229.00159 1024 0 794.99841 0 512.511489S229.00159 1.022977 511.488511 1.022977s511.488511 229.00159 511.488512 511.488512-229.00159 511.488511-511.488512 511.488511z"
              p-id="1995"
            ></path>
            <path
              d="M513.306342 478.160943l-162.755645-162.754621c-9.986302-9.987325-26.180028-9.987325-36.167352 0-9.987325 9.987325-9.987325 26.181051 0 36.168375l162.755644 162.754622-162.755644 162.754621c-9.987325 9.987325-9.987325 26.180028 0 36.167353 9.987325 9.987325 26.181051 9.987325 36.168375 0l162.754622-162.754622 162.754621 162.755645c9.987325 9.986302 26.180028 9.986302 36.167353 0 9.987325-9.988348 9.987325-26.181051 0-36.168376l-162.754622-162.755644 162.755645-162.753599c9.986302-9.987325 9.986302-26.181051 0-36.168375-9.988348-9.987325-26.181051-9.987325-36.168376 0l-162.755644 162.755644z"
              p-id="1996"
            ></path>
          </svg>
          <div class="userInfo-edit-wrapper">
            <div class="user-avatar-wrapper">
              <!-- <img :src="userAvatar" alt="avatar"> -->
              <form class="form-upload" action="#" method="post" enctype="multipart/form-data">
                <input type="file" name="file" class="input-file" @change="uploadChange">
                <input type="submit" value="submit" class="input-submit" @click.stop="uploadAvatar">
              </form>
            </div>
          </div>
          <div class="userInfo-edit-wrapper">
            <div class="userInfo-row-wrapper">
              <span class="userInfo-label">用户名：</span>
              <!-- <p class="userInfo-name">{{ userInfo.name }}</p> -->
              <input type="text" class="edit-userInfo" v-model="userEditInfo.userName">
            </div>
          </div>
          <div class="userInfo-edit-wrapper">
            <div class="userInfo-row-wrapper">
              <span class="userInfo-label">邮箱：</span>
              <input type="text" class="edit-userInfo" v-model="userEditInfo.userEmail">
            </div>
          </div>
          <div class="userInfo-edit-wrapper">
            <div class="userInfo-row-wrapper">
              <span class="userInfo-label">网站：</span>
              <input type="text" class="edit-userInfo" v-model="userEditInfo.userWebsite">
            </div>
          </div>
          <div class="userInfo-edit-wrapper">
            <div class="userInfo-row-wrapper">
              <span class="userInfo-label">座右铭：</span>
              <textarea
                name="motto"
                class="edit-textarea ele-textarea"
                v-model="userEditInfo.userMotto"
              ></textarea>
            </div>
          </div>
          <div class="userInfo-desc">
            <div class="userInfo-row-wrapper">
              <span class="userInfo-label">介绍：</span>
              <textarea
                name="desc"
                class="desc-textarea ele-textarea"
                v-model="userEditInfo.userIntro"
              ></textarea>
            </div>
          </div>
          <div class="userInfo-btn">
            <button class="submit-userInfo" @click.stop="submitUserInfo">提交</button>
          </div>
        </div>
      </div>
    </div>
    <toast></toast>
    <!-- <vue-particles color="#dedede"></vue-particles> -->
  </div>
</template>
<script>
import Toast from "../../../components/Toast.vue";
import userInfoApi from "../../../api/userinfo.js";
import uploadApi from "../../../api/uploadFile.js";
import { setStorage, getStorage } from "../../../util/util.js";
// import { userInfo } from "os";
import config from "serverConfig/index.js";
const baseURL = config.location + "/normalUser/";
export default {
  name: "UserInfo",
  components: {
    Toast
  },
  data() {
    return {
      // 后端返回的用户信息
      userInfo: {
        username: "",
        createTime: "",
        showemail: "空",
        website: "空",
        motto: "这里空空如也",
        createTime: "",
        intro: "这里空空如也",
        comment: []
      },
      userInfoBackup: {
        username: "",
        createTime: "",
        showemail: "空",
        website: "空",
        motto: "这里空空如也",
        createTime: "",
        intro: "这里空空如也",
        comment: []
      },
      // 前台编辑的用户信息
      userEditInfo: {
        userName: void 0,
        userEmail: void 0,
        userWebsite: void 0,
        userMotto: void 0,
        userIntro: void 0
      },
      // 后台返回的未读信息
      userMsg: [],
      // 用户头像
      userAvatar: "",
      isShowEdit: false,
      files: void 0,
      token: void 0,
      isBrowser:
        process.env.VUE_ENV === "client" && process.env.VUE_ENV !== "server" // 判断系统环境，如果是client端才渲染组件
    };
  },
  /**
   * 需要数据预获取，否则前后端的数据不一致导致渲染失败
   */
  preFetch(store) {
    let isBrowser =
      process.env.VUE_ENV === "client" && process.env.VUE_ENV !== "server";
    console.log("isBrowser:", isBrowser);
    if (isBrowser) {
      let token = getStorage({
        name: "token",
        type: "session"
      });
      let uid = getStorage({
        name: "uid",
        type: "session"
      });
      if (token) {
        token = token.content;
        store.dispatch.setToken(token);
      }
      if (uid) {
        uid = uid.content;
        store.dispatch.setUid(uid);
      }
    }
  },
  /*
  // 缓存vuex，防止通过标题跳转回首页时vuex为空导致页面数据为空
  preFetch(store) {
    store.dispatch("getAllTags");
    // store.dispatch("getPublishTags");
    return store
      .dispatch("getAllPosts", { page: store.state.route.params.page })
      .catch(err => {
        alert("获取数据异常");
      });
  },
  */
  created() {},
  mounted() {
    this.getUserInfo();
    let uid = getStorage({
      name: "uid",
      type: "session"
    });
    if (uid) {
      uid = uid.content;
      // if (this.$route.params.id === this.$store.state.uid) {
      this.getUnReadMsg();
      // }
    }
  },
  methods: {
    /**
     * 关闭个人信息编辑框
     */
    closeInfo() {
      this.isShowEdit = false;
      this.userEditInfo = {};
      this.files = void 0;
    },
    /**
     * 点击“个人信息”中的"编辑按钮"，弹出编辑框
     */
    editUserInfo() {
      this.isShowEdit = true;
    },
    /**
     * 提交用户个人信息
     */
    submitUserInfo() {
      let params = {
        username: this.userEditInfo.userName,
        showemail: this.userEditInfo.userEmail,
        website: this.userEditInfo.userWebsite,
        motto: this.userEditInfo.userMotto,
        intro: this.userEditInfo.userIntro
      };
      userInfoApi
        .postUserInfo(params)
        .then(res => {
          if (res.data.success) {
            this.userInfo = Object({}, this.userInfo, res.data.content);
          } else {
            this.$EventBus.$emit("toast", `${res.data.desc}`, "toast-error");
          }
          // this.userInfo = res.data.content;
          this.userInfo = Object.assign({}, this.userInfo, res.data.content);
        })
        .catch(err => {
          console.error(err);
          this.$EventBus.$emit("toast", "提交修改失败", "toast-error");
        });
      this.isShowEdit = false;
    },
    /**
     * 获取用户个人信息
     */
    getUserInfo() {
      userInfoApi.getUserInfo(this.$route.params.id).then(res => {
        this.userInfo = Object.assign({}, this.userInfo, res.data);
        this.userAvatar = /^http/.test(res.data.avatar)
          ? res.data.avatar
          : baseURL + res.data.avatar;
      });
    },
    /**
     * 监听上传头像的事件
     */
    uploadChange(e) {
      this.files = e.target.files || e.dataTransfer.files;
      if (!this.files.length) {
        return;
      }
    },
    /**
     * 上传用户个人头像
     */
    uploadAvatar() {
      let file = this.files[0];
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
      const limitSize = file.size / 1024 / 1024 < 3;
      if (!acceptType) {
        this.$EventBus.$emit(
          "toast",
          "只能上传jpg、png、gif图片",
          "toast-error"
        );
      }
      if (!limitSize) {
        this.$EventBus.$emit("toast", "只能上传小于3M的图片", "toast-error");
      }
      let form = new FormData();
      form.append("file", file);
      uploadApi
        .uploadUserAvatar(form)
        .then(res => {
          if (res.data.success) {
            this.$EventBus.$emit("toast", "上传成功", "toast-success");
            this.userAvatar = baseURL + res.data.fileName;
          } else {
            this.$EventBus.$emit("toast", "上传失败", "toast-error");
          }
        })
        .catch(err => {
          console.error(err);
          this.$EventBus.$emit("toast", "上传失败", "toast-error");
        });

      return acceptType && limitSize;
    },
    /**
     * 获取未读消息
     */
    getUnReadMsg() {
      userInfoApi
        .getUnReadMsg(this.$route.params.id)
        .then(res => {
          console.log(res);
          this.userMsg = res.data.message;
        })
        .catch(err => {
          console.error(err);
          this.$EventBus.$emit("toast", "获取'未读的消息'失败", "toast-error");
        });
    },
    /**
     * 点击‘最近评论’内的元素，跳转到指定文章
     */
    routerToArticle(path) {
      this.$router.push("/article/" + path);
    },
    /**
     * 点击"未读消息"内的元素，跳转到指定文章，并在后台设置已读
     */
    routerToMsg(commentId, path) {
      userInfoApi
        .setReadMsg(commentId)
        .then(res => {
          this.$router.push("/article/" + path);
        })
        .catch(err => {
          console.error(err);
        });
    },
    /**
     * 跳转到用户的介绍页
     */
    routerToUser(username, userid) {
      if (username !== "admin") {
        this.$router.push("/userinfo/" + userid);
      } else {
        this.$router.push("/about");
      }
    }
  },
  watch: {
    $route(to, from) {
      this.$store.dispatch("setUid", this.$route.params.id);
      if (
        to.path.indexOf("userinfo") &&
        from.path.indexOf("userinfo") &&
        to.path !== from.path
      ) {
        userInfoApi.getUserInfo(this.$route.params.id).then(res => {
          this.userInfo = Object.assign({}, this.userInfoBackup, res.data);
          this.userAvatar = /^http/.test(res.data.avatar)
            ? res.data.avatar
            : baseURL + res.data.avatar;
        });
        if (this.$route.params.id === this.$store.state.token) {
          this.getUnReadMsg();
        }
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
.userInfo {
  width: 100%;
  height: 100%;
  padding: 100px 50px;

  .user-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;

    .user-avatar-wrapper {
      display: block;
      width: 150px;
      height: 100px;
      margin: 0 auto;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .userInfo-column {
      position: relative;
      bottom: 0;
      width: 30%;
      height: 500px;
      overflow: auto;
      background-color: rgba(255, 255, 255, 0.7);
      transition: all 0.5s ease-in-out;

      &:hover {
        bottom: 10px;
        box-shadow: 0 6px 18px 0 rgba(232, 237, 250, 0.5);
      }

      .edit-btn-wrapper {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 10%;

        .edit-btn {
          display: block;
          height: 80%;
          line-height: 80%;
          width: 80px;
          margin: auto;
          background-color: #7832;
          cursor: pointer;
          outline: none;
        }
      }
    }

    .userInfo-form {
      position: relative;
      height: 100%;
    }

    .userInfo-title {
      text-align: center;
      height: 50px;
      line-height: 50px;
      font-size: 18px;
      font-weight: 600;
    }

    .userInfo-wrapper {
      margin: 15px 0;
      padding: 0 20px;

      .userInfo-row-wrapper {
        .userInfo-label {
          font-size: 18px;
          font-weight: 500;
        }

        .userInfo-info-content {
          display: inline-block;
          color: #317ef3;
          padding-top: 5px;
        }
      }
    }

    .userInfo-desc {
      .userInfo-row-wrapper {
        padding: 0 20px;

        .userInfo-label {
          font-size: 18px;
          font-weight: 500;
        }

        .userInfo-info-content {
          margin-top: 10px;
        }
      }
    }
  }

  .edit-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);

    .close-btn {
      position: absolute;
      top: 65px;
      right: 50px;
      display: block;
      color: #ffffff;
      font-size: 18px;
      cursor: pointer;
    }

    .userInfo-form {
      position: fixed;
      width: 500px;
      height: 550px;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      background-color: #ffffff;

      .userInfo-title {
        text-align: center;
        height: 50px;
        line-height: 50px;
        font-size: 18px;
      }

      .close-btn {
        position: absolute;
        right: 20px;
        top: 15px;
        width: 20px;
        height: 20px;
      }

      .userInfo-edit-wrapper {
        margin: 5px 15px;

        .form-upload {
          padding: 20px;

          .input-submit {
            display: inline-block;
            line-height: 1;
            white-space: nowrap;
            cursor: pointer;
            color: #409eff;
            background: #ecf5ff;
            border-color: #b3d8ff;
            border: 1px solid #dcdfe6;
            text-align: center;
            box-sizing: border-box;
            outline: none;
            margin: 0;
            transition: 0.1s;
            font-weight: 500;
            padding: 12px 20px;
            font-size: 14px;
            border-radius: 4px;
          }
        }

        .userInfo-row-wrapper {
          position: relative;
          height: 35px;

          .userInfo-label {
            font-size: 18px;
            font-weight: 500;
          }

          .userInfo-info-content {
            display: inline-block;
            color: #317ef3;
          }

          .edit-userInfo {
            position: absolute;
            right: 10px;
            width: 375px;
            height: 80%;
            border: 1px solid #cccccc;
          }

          .edit-textarea {
            position: absolute;
            top: 0;
            right: 10px;
            width: 80%;
            height: 50px;
            border: 1px solid #cccccc;
          }

          .userInfo-desc {
          }
        }
      }
    }

    .userInfo-desc {
      position: relative;
      margin-top: 30px;
      padding: 0 15px;

      .userInfo-label {
        font-size: 18px;
        font-weight: 500;
      }

      .desc-textarea {
        position: absolute;
        top: 0;
        right: 25px;
        width: 375px;
        height: 150px;
        border: 1px solid #cccccc;
      }
    }

    .userInfo-btn {
      position: absolute;
      width: 100%;
      height: 10%;
      bottom: 0;
      text-align: center;

      .submit-userInfo {
        line-height: 1;
        white-space: nowrap;
        cursor: pointer;
        color: #409eff;
        background: #ecf5ff;
        border-color: #b3d8ff;
        border: 1px solid #dcdfe6;
        text-align: center;
        box-sizing: border-box;
        outline: none;
        margin: 0;
        transition: 0.1s;
        font-weight: 500;
        padding: 12px 20px;
        font-size: 14px;
        border-radius: 4px;
      }
    }
  }
}

.create-time {
  padding-left: 20px;
  font-size: 18px;
  font-weight: 500;
}

.ele-textarea {
  display: block;
  resize: vertical;
  padding: 5px 15px;
  line-height: 1.5;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.recent-comment {
  padding: 20px;
  border-bottom: 1px solid #ccc;
  background-color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s linear;

  &:hover {
    background-color: #ecf5ff;
  }

  .userInfo-comment-resp {
    margin-bottom: 10px;

    .resp-user-label {
      margin-right: 30px;
      color: #a6a9ad;
      font-size: 16px;
      font-weight: 600;
    }

    .resp-user {
      color: #3f85ed;
      font-weight: 700;
      font-size: 20px;
    }
  }

  .userInfo-comment-content {
    padding: 8px 15px;
    margin: 10px 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
  }

  .resp-content-label {
    display: block;
    margin-bottom: 10px;
    color: #a6a9ad;
    font-size: 16px;
    font-weight: 600;
  }

  .userInfo-comment-time {
    .resp-time-label {
      margin-right: 30px;
      color: #a6a9ad;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.empty-wrapper {
  .empty-tip {
    position: relative;
    top: 20px;
    font-type: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    font-size: 20px;
    text-align: center;
  }

  .animate-img {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    width: 180px;
    height: 300px;
    background: url('../../../static/img/charector.png') 0 0 no-repeat;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: step-start;
    -webkit-animation-name: person-slow;
    -webkit-animation-duration: 950ms;
  }
}

@keyframes person-slow {
  0% {
    background-position: 0 0;
  }

  14.3% {
    background-position: -180px 0;
  }

  28.6% {
    background-position: -360px 0;
  }

  42.9% {
    background-position: -540px 0;
  }

  57.2% {
    background-position: -720px 0;
  }

  71.5% {
    background-position: -900px 0;
  }

  85.8% {
    background-position: -1080px 0;
  }

  100% {
    background-position: 0 0;
  }
}
</style>

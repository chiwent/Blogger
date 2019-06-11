// 主页登录或注册弹窗
<template>
  <div class="popup" v-if="signType">
    <toast></toast>
    <div class="popup-container" v-show="signType === 'signIn'">
      <div class="popup-header">
        <span class="popup-title">{{ popupTitle }}</span>
        <span class="popup-btn" @click.stop="closePopup">关闭</span>
      </div>
      <div class="popup-content">
        <template v-if="!forgotFlag">
          <div class="popup-username popup-input-wrapper">
            <input
              type="text"
              class="popup-input"
              placeholder="用户名"
              v-model="popupData.popupUserName"
            >
          </div>
          <div class="popup-pwd popup-input-wrapper">
            <input
              type="password"
              class="popup-input"
              placeholder="密码"
              v-model="popupData.popupPwd"
            >
          </div>
          <span class="forgot-pwd" @click="forgotPwd">忘记密码？</span>
          <div class="popup-submit popup-input-wrapper">
            <button class="submit-btn" @click.stop="submitSignin">登录</button>
          </div>
        </template>
        <!-- 密码重置 -->
        <template v-if="forgotFlag">
          <div class="popup-username popup-input-wrapper">
            <input type="text" class="popup-input" placeholder="邮箱" v-model="popupData.popupEmail">
          </div>
          <template>
            <button
              class="code-btn"
              :class="[{display: codeKey}]"
              @click="getEmailCode('reset')"
              :disabled="!canSend"
            >{{ codeMsg }}</button>
          </template>
          <div class="popup-pwd popup-input-wrapper">
            <input type="text" class="popup-input" placeholder="验证码" v-model="popupData.popupCode">
          </div>
          <div class="popup-pwd popup-input-wrapper">
            <input
              type="password"
              class="popup-input"
              placeholder="密码"
              v-model="popupData.popupPwd"
            >
          </div>
          <div class="popup-pwd-sec popup-input-wrapper">
            <input
              type="password"
              class="popup-input"
              placeholder="再次输入密码"
              v-model="popupData.popupPwdSec"
            >
          </div>
          <span class="forgot-pwd" @click="returnLogin">返回登录</span>
          <div class="popup-submit popup-input-wrapper">
            <button class="submit-btn" @click.stop="resetPwd">重置密码</button>
          </div>
        </template>
      </div>
    </div>

    <div class="popup-container" v-show="signType === 'signUp'">
      <div class="popup-header">
        <span class="popup-title">{{ popupTitle }}</span>
        <span class="popup-btn" @click.stop="closePopup">关闭</span>
      </div>
      <div class="popup-content">
        <div class="popup-email popup-input-wrapper">
          <input type="text" class="popup-input" placeholder="邮箱" v-model="popupData.popupEmail">
          <template>
            <button
              class="code-btn"
              :class="[{display: codeKey}]"
              @click="getEmailCode('signup')"
              :disabled="!canSend"
            >{{ codeMsg }}</button>
          </template>
        </div>
        <div class="popup-username popup-input-wrapper">
          <input
            type="text"
            class="popup-input"
            placeholder="用户名"
            v-model="popupData.popupUserName"
          >
        </div>
        <div class="popup-code popup-input-wrapper">
          <input type="text" class="popup-input" placeholder="验证码" v-model="popupData.popupCode">
        </div>
        <div class="popup-pwd popup-input-wrapper">
          <input type="password" class="popup-input" placeholder="密码" v-model="popupData.popupPwd">
        </div>
        <div class="popup-pwd-sec popup-input-wrapper">
          <input
            type="password"
            class="popup-input"
            placeholder="再次输入密码"
            v-model="popupData.popupPwdSec"
          >
        </div>
        <div class="popup-submit popup-input-wrapper">
          <button class="submit-btn" @click.stop="submitSignup">注册</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import Cookies from "js-cookie";
import { setInterval, clearInterval } from "timers";
import ntoken from "../../../../api/login.js";
import userApi from "../../../../api/userinfo.js";
import md5 from "md5";
import { mapActions } from "vuex";
import { setStorage, getStorage } from "../../../../util/util.js";
import Toast from "../../../../components/Toast.vue";
const CODEMSG = "获取验证码",
  RESENDMSG = "${codeTime}秒后重发",
  RESENDTIME = 60;
export default {
  name: "Popup",
  components: {
    Toast
  },
  data() {
    return {
      codeMsg: CODEMSG,
      resendTime: RESENDTIME,
      codeKey: false,
      popupTitle: "",
      popupData: {
        popupEmail: "",
        popupUserName: "",
        popupCode: "",
        popupPwd: "",
        popupPwdSec: ""
      },
      signType: "",
      canSend: true,
      forgotFlag: false
    };
  },
  created() {},
  mounted() {
    this.$EventBus.$on("openPopup", params => {
      this.signType = params;
      if (this.signType === "signIn") {
        this.popupTitle = "登录";
      } else if (this.signType === "signUp") {
        this.popupTitle = "注册";
      }
    });
  },
  beforeDestroy() {
    this.$EventBus.$off("openPopup", () => {
      this.signType = "";
    });
  },
  methods: {
    ...mapActions(["createNToken"]),
    preFetch({ store }) {
      // 子组件不执行
    },
    /**
     * 关闭弹窗
     */
    closePopup() {
      this.signType = "";
      this.popupData = {};
      this.forgotFlag = false;
    },
    /**
     * 邮箱验证码验证
     */
    getEmailCode(emailType) {
      if (!this.popupData.popupEmail) {
        this.$EventBus.$emit("toast", "邮箱不能为空", "toast-error");
      } else if (
        !/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(
          this.popupData.popupEmail
        )
      ) {
        this.$EventBus.$emit("toast", "邮箱格式不正确", "toast-error");
      } else {
        if (this.canSend) {
          userApi
            .sendEmail(this.popupData.popupEmail, emailType)
            .then(res => {
              this.canSend = false;
              this.codeMsg = RESENDMSG.replace("${codeTime}", this.resendTime);
              this.codeKey = true;
              const codeTime = setInterval(() => {
                this.resendTime--;
                this.codeMsg = RESENDMSG.replace(
                  "${codeTime}",
                  this.resendTime
                );
                if (this.resendTime === 0) {
                  this.resendTime = RESENDTIME;
                  this.codeMsg = CODEMSG;
                  this.codeKey = false;
                  clearInterval(codeTime);
                  // TODO:在此重发邮件
                  this.canSend = true;
                }
              }, 1000);
              if (res.data.success) {
                this.$EventBus.$emit("toast", "请求发送成功", "toast-success");
              } else {
                emailType === "signup"
                  ? this.$EventBus.$emit("toast", "邮箱已注册", "toast-error")
                  : this.$EventBus.$emit("toast", "邮箱未注册", "toast-error");
              }
            })
            .catch(err => {
              this.$EventBus.$emit("toast", "请求发送失败", "toast-error");
            });
        }
      }
    },
    asycSign() {
      return this.$store
        .dispatch("createNToken", {
          username: this.popupData.popupUserName,
          //   password: md5(this.popupPwd).toUpperCase()
          password: md5(this.popupData.popupPwd).toUpperCase()
        })
        .then(res => {
          this.signType = "";
        })
        .catch(err => {
          console.error(err);
          alert(err);
        });
    },
    submitSignin() {
      ntoken
        .createNToken(
          this.popupData.popupUserName,
          md5(this.popupData.popupPwd).toUpperCase()
        )
        .then(res => {
          if (res.data.success) {
            setStorage({
              name: "token",
              content: res.data.token,
              type: "session"
            });
            setStorage({
              name: "uid",
              content: res.data.uid,
              type: "session"
            });
            let token = res.data.token;
            // this.$store.dispatch("setToken", token.content);
            this.$EventBus.$emit("login", token);
            this.signType = "";
            // this.$router.push(`/user/${res.data.token}`);
            alert("登录成功");
            if (location) {
              location.reload();
            }
            // this.$EventBus.$emit("toast", "登录成功", "toast-success");
          } else {
            alert("登录失败");
            // this.$EventBus.$emit("toast", "登录失败", "toast-error");
          }
          this.popupData = {};
        })
        .catch(err => {
          alert("登录失败");
          // this.$EventBus.$emit("toast", "登录失败", "toast-error");
        });
    },
    /**
     * 提交注册信息
     */
    submitSignup() {
      if (this.popupData.popupEmail === "") {
        alert("邮箱不能为空");
        return;
      } else if (
        !/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(
          this.popupData.popupEmail
        )
      ) {
        alert("邮箱格式不正确");
        return;
      }
      if (this.popupData.popupUserName === "") {
        alert("用户名不能为空");
        return;
      } else if (
        !/[a-zA-Z0-9_\u4e00-\u9fa5]{2,10}/.test(this.popupData.popupUserName)
      ) {
        alert("用户名格式不正确，请使用2到10位中英文和数字组合");
        return;
      }
      if (this.popupData.popupPwd === "" && this.popupData.popupPwdSec === "") {
        alert("用户密码不能为空");
        return;
      } else if (!/^[\w_-]{6,16}$/.test(this.popupPwd)) {
        alert(
          "密码最短为6位，最长位16为，可以包含小写和大写字母、数字、下划线、减号"
        );
        return;
      }
      if (this.popupData.popupPwd !== this.popupData.popupPwdSec) {
        alert("两次输入的密码不等");
        return;
      }
      userApi
        .regist(
          this.popupData.popupUserName,
          md5(this.popupData.popupPwd).toUpperCase(),
          this.popupData.popupEmail,
          this.popupData.popupCode
        )
        .then(res => {
          if (res.data.success) {
            alert("注册成功");
            this.$EventBus.$emit("toast", "注册成功", "toast-success");
            this.signType = "";
            this.popupData = {};
          } else {
            this.$EventBus.$emit(
              "toast",
              "验证码错误或已失效，请重发邮件",
              "toast-error"
            );
          }
        })
        .catch(err => {
          alert("注册失败");
          this.$EventBus.$emit("toast", "注册失败", "toast-error");
        });
    },
    forgotPwd() {
      this.forgotFlag = true;
    },
    returnLogin() {
      this.forgotFlag = false;
    },
    resetPwd() {
      if (this.popupData.popupEmail === "") {
        alert("邮箱不能为空");
        return;
      } else if (
        !/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(
          this.popupData.popupEmail
        )
      ) {
        alert("邮箱格式不正确");
        return;
      }
      if (this.popupData.popupPwd === "" && this.popupData.popupPwdSec === "") {
        alert("用户密码不能为空");
        return;
      } else if (!/^[\w_-]{6,16}$/.test(this.popupPwd)) {
        alert(
          "密码最短为6位，最长位16为，可以包含小写和大写字母、数字、下划线、减号"
        );
        return;
      }
      if (this.popupData.popupPwd !== this.popupData.popupPwdSec) {
        alert("两次输入的密码不等");
        return;
      }
      userApi
        .resetUser(
          this.popupData.popupEmail,
          md5(this.popupData.popupPwd).toUpperCase(),
          this.popupData.popupCode
        )
        .then(res => {
          if (res.data.success) {
            this.$EventBus.$emit("toast", "密码重置成功", "toast-success");
            this.signType = "";
            this.popupData = {};
            this.forgotFlag = false;
          } else {
            this.$EventBus.$emit(
              "toast",
              "验证码错误或已失效，请重发邮件",
              "toast-error"
            );
          }
        })
        .catch(err => {
          this.$EventBus.$emit("toast", "注册失败", "toast-error");
        });
    }
  }
};
</script>
<style lang="stylus" scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  z-index: 99;

  &-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    z-index: 99;
    max-width: 300px;
    max-height: 500px;
    background-color: #ffffff;
    animation: fadeInTop 0.3s linear;
  }

  &-header {
    height: 50px;
    line-height: 50px;
    position: relative;
    background-color: rgba(0, 0, 0, 0.15);
  }

  &-title {
    position: relative;
    left: 20px;
    font-size: 18px;
    font-weight: 600;
  }

  &-btn {
    position: absolute;
    right: 20px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
  }

  &-content {
    padding: 10px;
  }

  &-input-wrapper {
    margin: 20px 0;
    text-align: center;

    .popup-input {
      -webkit-appearance: none;
      background-color: #fff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      color: #606266;
      display: inline-block;
      font-size: inherit;
      height: 40px;
      line-height: 40px;
      outline: none;
      padding: 0 15px;
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      width: 100%;
    }

    .code-btn {
      display: block;
      text-align: center;
      margin: 10px auto;
    }
  }
}

.popup-submit .submit-btn, .code-btn {
  margin-top: 30px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  color: #409eff;
  background: #ecf5ff;
  border-color: #b3d8ff;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
}

@keyframes fadeInTop {
  from {
    opacity: 0;
    transform: translate(0, 200px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.forgot-pwd {
  position: relative;
  left: 200px;
  color: #409eff;
  cursor: pointer;
}
</style>

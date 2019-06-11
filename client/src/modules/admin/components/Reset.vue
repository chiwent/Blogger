<template>
  <div class="reset">
    <p>重置密码</p>
    <div class="reset__box">
      <div class="reset__item">
        <input type="text" placeholder="邮箱" v-model="email">
      </div>
      <template>
        <div class="reset__email-btn">
          <button
            class="code-btn"
            :class="[{display: codeKey}]"
            @click.stop="getEmailCode('reset')"
            :disabled="!canSend"
          >{{ codeMsg }}</button>
        </div>
      </template>
      <div class="reset__item">
        <input type="text" class="popup-input" placeholder="验证码" v-model="code">
      </div>
      <div class="reset__item">
        <input type="password" placeholder="密码" v-model="password">
      </div>
      <div class="reset__item">
        <input type="password" placeholder="重新输入密码" v-model="passwordSec">
      </div>
      <div class="reset__item">
        <button @click="reset">提交</button>
      </div>
    </div>
  </div>
</template>


<script>
const CODEMSG = "获取验证码",
  RESENDMSG = "${codeTime}秒后重发",
  RESENDTIME = 60;
import { Message } from "element-ui";
import md5 from "md5";
import api from "../../../api/login.js";
import { setTimeout } from "timers";

export default {
  name: "Reset",
  data() {
    return {
      codeMsg: CODEMSG,
      resendTime: RESENDTIME,
      codeKey: false,
      canSend: true,
      username: "",
      email: "",
      code: "",
      password: "",
      passwordSec: ""
    };
  },
  methods: {
    getEmailCode() {
      if (this.email === "") {
        this.$message({
          message: "邮箱不能为空",
          type: "error"
        });
        return false;
      }
      if (
        !/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(
          this.email
        )
      ) {
        this.$message({
          message: "邮箱格式不正确",
          type: "error"
        });
        return false;
      }
      api
        .sendEmail(this.email, "reset")
        .then(res => {
          if (!res.data.success) {
            this.$message.error(res.data.desc);
          } else {
            this.codeKey = true;
            const codeTime = setInterval(() => {
              this.resendTime--;
              this.codeMsg = RESENDMSG.replace("${codeTime}", this.resendTime);
              if (this.resendTime === 0) {
                this.resendTime = RESENDTIME;
                this.codeMsg = CODEMSG;
                this.codeKey = false;
                clearInterval(codeTime);
                this.canSend = true;
              }
            }, 1000);
            this.$message({
              message: "发送成功",
              type: "success"
            });
          }
        })
        .catch(err => {
          this.$message.error(err.response.data.error);
        });
    },
    reset() {
      if (
        this.email === "" ||
        this.password === "" ||
        this.code === "" ||
        this.passwordSec === ""
      ) {
        this.$message({
          message: "表单所有项均不能为空",
          type: "error"
        });
        return false;
      }
      if (this.password !== this.passwordSec) {
        this.$message({
          message: "密码前后不一致",
          type: "error"
        });
      }
      console.log("password:", this.password);
      this.password = md5(this.password).toUpperCase();
      api
        .resetAdmin(this.email, this.password, this.code)
        .then(res => {
          console.log(res);
          debugger;
          if (res.data.success) {
            this.$message({
              message: "修改密码成功",
              type: "success"
            });
          } else {
            this.$message.error(res.data.desc);
          }
        })
        .catch(err => {
          this.$message.error(err.response.data.error);
        });
    }
  }
};
</script>


<style lang="stylus">
@import '../assets/stylus/_settings.styl';

.reset {
  max-width: 640px;
  margin: 150px auto 0 auto;

  &__header {
    margin: 0 auto 50px auto;
    text-align: center;
  }

  &__item {
    margin-bottom: 10px;
    padding: 0 10px 0 10px;

    input {
      display: block;
      width: 300px;
      height: 50px;
      border: 1px solid $login-text;
      margin: 0 auto;
      padding-left: 10px;
    }

    button {
      display: block;
      width: 300px;
      height: 50px;
      margin: 20px auto;
      background-color: $blue;
      color: white;
    }
  }

  &__email-btn {
    margin: 10px;
    text-align: center;

    button {
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
  }

  .register__btn {
    display: block;
    text-align: center;
    cursor: pointer;
  }
}
</style>
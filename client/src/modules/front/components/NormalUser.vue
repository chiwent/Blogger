<template>
  <div class="login">
    <div class="login__header">
      <h1 class="login__title">用户登录/注册</h1>
    </div>
    <div class="login__box" v-if="!registFlag">
      <div class="login__item">
        <input type="text" placeholder="管理员用户名" v-model="username">
      </div>
      <div class="login__item">
        <input type="password" placeholder="密码" v-model="password" @keyup.enter="login">
      </div>
      <div class="login__item">
        <button @click="login">登录</button>
      </div>
      <div class="register__btn">
        <span @click.stop="registFlag = true">注册</span>
      </div>

      <div class="reset__btn">
        <router-link to="/user/reset">修改密码</router-link>
      </div>
    </div>

    <div class="regist__box" v-if="this.registFlag">
      <div class="register__item">
        <input type="text" placeholder="用户名" v-model="name">
      </div>
      <div class="register__item">
        <input type="text" placeholder="管理员用户名" v-model="username">
      </div>
      <div class="register__item">
        <input type="password" placeholder="密码" v-model="password" @keyup.enter="regist">
      </div>
      <div class="register__item">
        <button @click="resgist">注册</button>
      </div>
      <div class="reset__btn">
        <span @click.stop="registFlag = false">返回</span>
      </div>
    </div>
  </div>
</template>


<script>
import { Message } from "element-ui";
import md5 from "md5";
import api from "../../../api/login.js";

export default {
  name: "NormalUser",
  data() {
    return {
      name: "",
      username: "",
      password: "",
      registFlag: false
    };
  },
  methods: {
    login() {
      let info = {
        username: this.username,
        password: md5(this.password).toUpperCase()
      };
      this.$store
        .dispatch("createToken", info)
        .then(res => {
          if (res.data.success) {
            this.$message({
              message: "登陆成功",
              type: "success"
            });
            this.$router.push("/");
          }
        })
        .catch(err => {
          this.$message.error(err.response.data.error);
        });
    },
    resgist() {
      const password = md5(this.password).toUpperCase();
      api
        .regist(this.name, this.username, password, "normal")
        .then(res => {
          // console.log(res);
          // debugger;
          if (res.data.success) {
            this.$message({
              message: "注册成功",
              type: "success"
            });
          } else {
            this.$message({
              message: res.data.content,
              type: "error"
            });
          }
          this.registFlag = false;
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

.login, .register {
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

  .register__btn {
    display: block;
    text-align: center;
    cursor: pointer;
  }
}

.reset__btn {
  position: relative;
  right: 150px;
  text-align: right;

  a {
    text-decoration: none;
  }

  span {
    cursor: pointer;
  }
}
</style>
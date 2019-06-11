<template>
  <header class="top-header">
    <!--<img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAALEwAACxMBAJqcGAAAADlJREFUWMPt08ERACAIBDEomvqxBh18EQogn9us+HsJAAAAt0BPfQU8A2YKULKSdQAQmpIBAMBm4AAtdCIhmRB8RAAAAABJRU5ErkJggg=="
      alt
      class="top-header__menu-button"
      @click.stop="toggleSideBox"
    >-->
    <button class="hamb-menu" @click.stop="toggleMenu" type="button">
      <span class="line" v-for="i in 3" :key="i" :class="{'line-active': $store.state.sideBoxOpen}"></span>
    </button>
    <router-link to="/" class="top-header__main-icon" @click.native="clearFilter">{{ blog }}</router-link>
    <!-- <div class="user" v-if="$route.path.indexOf('user') === -1">
      <a href="/user/login" class="user-signin">登录</a>
      <a href="/user/login" class="user-signup">注册</a>
    </div>-->
    <!-- {{$store.state.token}} -->
    <div class="user" v-if="!token">
      <span class="user-signin" @click.stop="userSignIn('signIn')">登录</span>
      <span class="user-signup" @click.stop="userSignUp('signUp')">注册</span>
    </div>
    <div class="user" v-if="token">
      <span class="user-info" @click.stop="$router.push(`/userinfo/${userId}`)">个人信息</span>
      <span class="user-logout" @click.stop="logout">退出登录</span>
    </div>
  </header>
</template>
<script>
import { mapActions, mapMutations, mapGetters } from "vuex";

import config from "../../../../../../server/configs/index.js";

import {
  setStorage,
  getStorage,
  removeStorage
} from "../../../../util/util.js";

export default {
  name: "top-header",
  data() {
    return {
      blog: config.blog,
      // toggleMenuFlag: false,
      token: void 0,
      userId: void 0
    };
  },
  computed: {
    // token() {
    //   return this.$store.state.token;
    // }
    ...mapGetters(["userToken"])
  },
  created() {},
  mounted() {
    this.$EventBus.$on("login", token => {
      this.token = token;
      this.userId = getStorage({
        name: "uid",
        type: "session"
      }).content;
    });
    let uid = getStorage({
      name: "uid",
      type: "session"
    });
    if (uid) {
      this.userId = uid.content;
    }
    let token = getStorage({
      name: "token",
      type: "session"
    });
    if (token) {
      this.token = token.content;
      // if (!this.$store.state.token) {
      // this.$store.dispatch("setToken", this.token);
      // }
    }
    // console.log("store:", this.$store.state.token);
  },
  beforeDestroy() {
    this.$EventBus.$off("login");
  },
  methods: {
    ...mapActions(["getAllPosts"]),
    ...mapMutations({
      toggleSideBox: "TOGGLE_SIDEBOX",
      setSelectTags: "SET_SELECT_TAGS"
    }),
    clearFilter() {
      this.$store.dispatch("searchItem", "");
      this.setSelectTags([]);
    },
    toggleMenu() {
      this.toggleSideBox();
      // this.toggleMenuFlag = !this.toggleMenuFlag;
    },
    userSignIn() {
      this.$EventBus.$emit("openPopup", "signIn");
    },
    userSignUp() {
      this.$EventBus.$emit("openPopup", "signUp");
    },
    logout() {
      if (confirm("确认退出吗")) {
        this.$nextTick(() => {
          removeStorage({
            name: "token",
            type: "session"
          });
          removeStorage({
            name: "uid",
            type: "session"
          });
          this.token = void 0;
          this.$store
            .dispatch("rmToken")
            .then(() => {
              alert("退出成功");
              this.$EventBus.$emit("toast", "退出成功", "toast-success", true);
            })
            .catch(err => {
              alert("退出失败");
              this.$EventBus.$emit("toast", "退出失败", "toast-error");
            });
        });
      }
    }
  },
  computed: {}
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
@import '../../assets/stylus/_settings.styl';

.top-header {
  position: fixed;
  top: 0;
  height: 60px;
  line-height: @height;
  width: 100%;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.25);
  padding: 0 40px 0 40px;
  background: #555555;
  z-index: 3;

  &__main-icon {
    text-decoration: none;
    color: #ffffff;
    font-weight: 600;
    font-size: 20px;
  }

  &__menu-button {
    position: absolute;
    left: 10px;
    top: 50%;
    width: 32px;
    height: 32px;
    margin-top: -(@height / 2);
    display: none;
  }

  .user {
    position: absolute;
    top: 0;

    &-signin, &-signup, &-info, &-logout {
      color: #ffffff;
      text-decoration: none;
      cursor: pointer;
    }

    &-signup, &-logout {
      margin-left: 20px;
    }
  }
}

@media screen and (max-width: 768px) {
  .top-header {
    text-align: center;
    padding: 0;

    &__menu-button {
      display: block;
    }
  }

  .hamb-menu {
    position: absolute;
    display: block;
    left: 26px;
    top: 25px;
    z-index: 9999;
    margin: 0;
    padding: 0;
    width: 22px;
    height: 19px;
    border: none;
    border-radius: 0;
    background-color: transparent;
    cursor: pointer;

    .line {
      position: absolute;
      display: block;
      width: 22px;
      height: 4px;
      border-radius: 3px;
      background-color: #ffffff;
      transition: transform 0.7s cubic-bezier(0.64, 0.04, 0.35, 1);

      &:nth-child(1) {
        top: 0;
      }

      &:nth-child(2) {
        top: calc(50% - 2px);
      }

      &:nth-child(3) {
        bottom: 0;
      }
    }

    .line-active {
      opacity: 1;

      &:nth-child(1) {
        transform: translateY(6.5px) translateZ(0);
        transition: transform 0.2s cubic-bezier(0.64, 0.04, 0.35, 1);
      }

      &:nth-child(3) {
        transform: translateY(-6.5px) translateZ(0);
        transition: transform 0.2s cubic-bezier(0.64, 0.04, 0.35, 1);
      }
    }
  }

  .close-hamb-menu {
    position: absolute;
    top: 25px;
    left: 26px;
    z-index: 3;
    width: 22px;
    height: 19px;
    border: 0;
    pointer-events: visible;
    background-color: transparent;

    .line {
      position: absolute;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: #ffffff;
      transition: transform 0.28s cubic-bezier(0.64, 0.04, 0.35, 1);
    }

    .line-active {
      &:nth-child(1) {
        transform: rotate(45deg);
        transform-origin: center center;
        transition: transform 1s cubic-bezier(0.64, 0.04, 0.35, 1);
      }

      &:nth-child(2) {
        transform: rotate(-45deg);
        transform-origin: center center;
        transition: transform 1s cubic-bezier(0.64, 0.04, 0.35, 1);
      }
    }
  }
}

@media only screen and (min-width: 769px) {
  .top-header .user {
    right: 50px;
  }
}

@media only screen and (max-width: 768px) {
  .top-header .user {
    right: 20px;
  }
}
</style>

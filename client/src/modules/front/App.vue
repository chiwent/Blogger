<template>
  <div id="app" ref="app">
    <!-- <canvas class="canvas"></canvas> -->
    <!-- <no-ssr>
      <vue-particles color="#dedede"></vue-particles>
    </no-ssr>-->

    <div class="wrap">
      <particles></particles>
      <top></top>
      <transition name="fade" mode="out-in">
        <!-- keep-alive排除article -->
        <!-- <keep-alive exclude="['article_component', 'UserInfo']"> -->
        <router-view></router-view>
        <!-- </keep-alive> -->
      </transition>
      <hot hot-title="访问数最多" class="read-hot" :sliders="readHotData"></hot>
      <hot hot-title="评论数最多" class="comment-hot" :sliders="commentHotData"></hot>
    </div>
    <footer class="footer">
      <div class="footer-word">
        <p>
          Copyright ©
          <span class="copyright">Simon</span>&nbsp;&nbsp;2019
        </p>
        <p>
          Created by
          <span class="copyright">Blogger</span>
        </p>
      </div>
    </footer>
    <!-- <back-top :scrollElement="scrollElement"></back-top> -->
    <div>
      <transition name="fade-to-top">
        <div class="to__top" @click.stop="backToTop" v-if="scrollTop > 0"></div>
      </transition>
    </div>
    <popup></popup>
    <!-- 防止disqus导致首页报错 -->
    <!-- <div id="disqus_thread"></div> -->
  </div>
</template>

<script>
// import axios from 'axios';
import { scrollToY } from "../../util/util.js";
import Top from "./components/common/Top.vue";
import { setStorage, getStorage } from "../../util/util.js";
// import BackTop from "../../components/BackTop.vue";

import { mapActions, mapGetters } from "vuex";

// import { setStorage, getStorage } from "../../util/util.js";
import Popup from "./components/common/Popup.vue";
// import particles from "particles.js";

// import NoSSR from "vue-no-ssr";

import Particles from "./components/common/Particles.vue";
import Hot from "./components/common/Hot.vue";

import articleApi from "../../api/article.js";
export default {
  name: "app",
  components: {
    Top,
    Popup,
    // "no-ssr": NoSSR,
    Particles,
    Hot
    // BackTop
  },
  data() {
    return {
      scrollTop: 0,
      readHotData: void 0,
      commentHot: void 0,
      readHotData: [],
      commentHotData: []
      // scrollElement: void 0
    };
  },
  computed: {
    // ...mapGetters(["avatarImg"])
  },
  // 自行加上
  preFetch(store) {
    // store.dispatch("getAllTags");
    // store.dispatch("getPost", store.state.route.params.id);
  },

  created() {},
  mounted() {
    // particlesJS.load("particles");
    if (!this.$store.state.adminAvatar) {
      this.getAdminAvatar();
    }
    if (!this.$store.state.token) {
      let token = getStorage({
        name: "token",
        type: "session"
      });
      let uid = getStorage({
        name: "uid",
        type: "session"
      });
      // console.log("uid:", uid);
      if (uid && !this.$store.state.uid) {
        uid = uid.content;
        // console.log("uid2:", uid);
        this.$store.dispatch("setUid", uid);
      }
      if (token && !this.$store.state.token) {
        token = token.content;
        // if (!this.$store.state.token) {
        this.$store.dispatch("setToken", token);
        // }
      }
    }
    this.scrollElement = document.querySelector("#app");
    this.scrollElement.addEventListener("scroll", this.scrollHandler);

    this.$refs.app.onclick = () => {
      if (!this.$store.state.sideBoxOpen) {
        this.$store.dispatch("closeWeixinQR");
      }
    };

    // this.color();
    this.getReadHot();
    this.getCmtHot();
  },
  destroyed() {
    this.scrollElement.removeEventListener("scroll", this.scrollHandler);
  },
  methods: {
    ...mapActions(["closeWeixinQR", "getAvatar"]),
    scrollHandler() {
      this.scrollTop = this.scrollElement.scrollTop;
    },
    backToTop() {
      scrollToY(this.scrollElement, 0, 2000, "easeOutSine");
    },
    // 获取访问数最多
    getReadHot() {
      articleApi.readHot().then(res => {
        this.readHotData = res.data.article;
      });
    },
    // 获取评论最多
    getCmtHot() {
      articleApi.commentHot().then(res => {
        this.commentHotData = res.data.article;
      });
    },
    // 获取管理员头像
    getAdminAvatar() {
      this.$store.dispatch("getAdminAvatar").catch(err => {
        console.error(err);
      });
    },
    // 彩带
    color() {
      const c = document.getElementsByTagName("canvas")[0];
      c.addEventListener("touchmove", function(e) {
        e.preventDefault();
      });
      var x = c.getContext("2d"),
        pr = window.devicePixelRatio || 1,
        w = window.innerWidth,
        h = window.innerHeight,
        f = 90,
        q,
        m = Math,
        r = 0,
        u = m.PI * 2,
        v = m.cos,
        z = m.random;
      c.width = w * pr;
      c.height = h * pr;
      x.scale(pr, pr);
      x.globalAlpha = 0.6;
      function i() {
        x.clearRect(0, 0, w, h);
        q = [{ x: 0, y: h * 0.1 + f }, { x: 0, y: h * 0.7 - f }];
        while (q[1].x < w + f) d(q[0], q[1]);
      }
      function d(i, j) {
        x.beginPath();
        x.moveTo(i.x, i.y);
        x.lineTo(j.x, j.y);
        var k = j.x + (z() * 2 - 0.25) * f,
          n = y(j.y);
        x.lineTo(k, n);
        x.closePath();
        r -= u / -50;
        x.fillStyle =
          "#" +
          (
            ((v(r) * 127 + 128) << 16) |
            ((v(r + u / 3) * 127 + 128) << 8) |
            (v(r + (u / 3) * 2) * 127 + 128)
          ).toString(16);
        x.fill();
        q[0] = q[1];
        q[1] = { x: k, y: n };
      }
      function y(p) {
        var t = p + (z() * 2 - 1.1) * f;
        return t > h || t < 0 ? y(p) : t;
      }
      c.onclick = i;
      c.ontouchstart = i;
      i();
    }
  },
  /*
  beforeRouteEnter(to, from, next) {
    this.scrollElement.scrollTop = 0;
    next();
  },
  */
  watch: {
    $route(to, from, next) {
      if (to.path !== from.path) {
        this.scrollElement.scrollTop = 0;
      }
      if (this.$route.path === "/") {
        document.title = "Simon's Blog";
      } else if (this.$route.path.indexOf("userinfo") > 0) {
        document.title = "用户信息";
      }
      // next();
    }
  }
};
</script>

<style lang="stylus">
@import 'assets/stylus/main.styl';
@import 'assets/stylus/markdown.styl';

$footer-height = 60px;

#app {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
</style>
<style lang="stylus" scoped>
$footer-height = 60px;

#app {
  #disqus_thread {
    display: none;
  }

  .canvas {
    position: relative;
    top: 50px;
    width: 100%;
    height: 300px;
    z-index: 1;
  }

  .particles-background {
    background: #383838;
    height: 100%;
    width: 100%;
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .fade-enter-active, .fade-leave-active {
    transition: all 0.2s ease;
  }

  .fade-enter, .fade-leave-active {
    opacity: 0;
  }

  .wrap {
    position: relative;
    min-height: 100%;
    // margin-bottom: $footer-height;
    z-index: 20;
  }

  .wrap:after {
    content: '';
    display: block;
    height: $footer-height;
  }

  .footer {
    position: relative;
    bottom: 0;
    height: 80px;
    text-align: center;
    // color: $grey;
    background-color: #555;
    text-align: center;
    line-height: 20px;

    .footer-word {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ffffff;
    }

    a {
      text-decoration: none;
      color: $blue-link;

      &:hover {
        text-decoration: underline;
      }
    }

    .copyright {
      font-weight: 500;
      // color: #666666;
    }
  }

  @media screen and (max-width: 850px) {
    .fade-enter {
      transform: translate(30px, 0px);
    }

    .fade-leave-active {
      transform: translate(-30px, 0px);
    }
  }

  .to__top {
    position: fixed;
    right: 30px;
    bottom: 5%;
    z-index: 20;
    width: 32px;
    height: 30px;
    margin-top: 100px;
    background: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
    cursor: pointer;

    &::after {
      content: '';
      z-index: 2;
      display: block;
      width: 100%;
      height: 100%;
      background: url('../../static/img/to-top.png') no-repeat center center;
    }
  }

  .fade-to-top-enter-active, .fade-to-top-leave-active {
    transition: opacity 0.5s;
  }

  .fade-to-top-enter, .fade-to-top-leave-to {
    opacity: 0;
  }
}

.read-hot {
  top: 100px;
  right: 30px;
}

.comment-hot {
  top: 350px;
  right: 30px;
}
</style>

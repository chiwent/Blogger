<template>
  <div class="container">
    <transition name="fade">
      <div class="to__top" @click="backToTop" v-if="scrollTop > 100"></div>
    </transition>
  </div>
</template>
<script>
import { scrollToY } from "../util/util.js";
export default {
  name: "BackTop",
  data() {
    return {
      scrollTop: 0
    };
  },
  props: {
    scrollElement: {
      required: true
    }
  },
  mounted() {
    document.addEventListener("scroll", this.scrollHandler, true);
  },
  destroyed() {
    document.removeEventListener("scroll", this.scrollHandler, true);
  },
  methods: {
    scrollHandler() {
      this.scrollTop =
        document.documentElement.scrollTop ||
        window.pageYOffset ||
        document.body.scrollTop;
    },
    backToTop() {
      scrollToY(window, 0, 1000, "easeInOutQuint");
    }
  }
};
</script>
<style lang="stylus" scoped>
.to__top {
  position: fixed;
  right: 12px;
  bottom: 5%;
  z-index: 1;
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
    background: url('../static/img/to-top.png') no-repeat center center;
  }
}
</style>


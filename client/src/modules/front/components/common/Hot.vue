<template>
  <div class="slider-container" v-if="!isMobile" v-show="$route.path.indexOf('userinfo') < 0">
    <div class="hot-title">{{hotTitle}}</div>
    <div id="slider">
      <div class="window" @mouseover="stop" @mouseleave="play">
        <ul class="container" :style="containerStyle" v-if="sliders.length > 0">
          <li>
            <!-- <img :src="sliders[sliders.length - 1].img" alt> -->

            <div class="slider-slide" @click.stop="routeTo(sliders[sliders.length - 1]._id)">
              <img
                :src="sliders[sliders.length -1].coverImg ? sliders[sliders.length -1].coverImg : defaultCover"
                alt
              >
              <p class="article-title">{{sliders[sliders.length - 1].title}}</p>
              <div class="article-desc">
                <p class="article-time">时间：{{sliders[sliders.length - 1].createTime}}</p>
                <p
                  class="article-readCount"
                >访问量：{{sliders[sliders.length - 1].readCount > 0 ? sliders[sliders.length - 1].readCount : 0}}</p>
                <div
                  class="article-readCount"
                >评论量：{{sliders[sliders.length - 1].commentCount > 0 ? sliders[sliders.length - 1].commentCount : 0}}</div>
              </div>
            </div>
          </li>
          <li v-for="(item, index) in sliders" :key="index">
            <!-- <img :src="item.img" alt> -->
            <div class="slider-slide" @click.stop="routeTo(item._id)">
              <!-- <img :src="imgList[index].img" alt> -->
              <img :src="item.coverImg ? item.coverImg : defaultCover" alt>
              <p class="article-title">{{item.title}}</p>
              <div class="article-desc">
                <p class="article-time">时间：{{item.createTime}}</p>
                <p class="article-readCount">访问量：{{item.readCount > 0 ? item.readCount : 0}}</p>
                <div class="article-readCount">评论量：{{item.commentCount > 0 ? item.commentCount : 0}}</div>
              </div>
            </div>
          </li>
          <li>
            <!-- <img :src="sliders[0].img" alt> -->

            <div class="slider-slide" @click.stop="routeTo(sliders[0]._id)">
              <!-- <img :src="imgList[0].img" alt> -->
              <img :src="sliders[0].coverImg ? sliders[0].coverImg : defaultCover" alt>
              <p class="article-title">{{sliders[0].title}}</p>
              <div class="article-desc">
                <div class="article-time">时间：{{sliders[0].createTime}}</div>
                <div
                  class="article-readCount"
                >访问量：{{sliders[0].readCount > 0 ? sliders[0].readCount : 0}}</div>
                <div
                  class="article-readCount"
                >评论量：{{sliders[0].commentCount > 0 ? sliders[0].commentCount : 0}}</div>
              </div>
            </div>
          </li>
        </ul>
        <p v-if="sliders.length < 1">暂无数据</p>
        <ul class="direction">
          <li class="left" @click="move(swiperSize, 1, speed)">
            <svg
              t="1559528913494"
              class="arrow-left"
              style
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="3146"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="16"
              height="16"
            >
              <defs>
                <style type="text/css"></style>
              </defs>
              <path
                d="M18.432 459.264l455.168-348.672c31.232-23.552 75.776-1.536 75.776 37.376v174.08h422.4c28.672 0 51.712 23.04 51.712 51.712v246.272c0 28.672-23.04 51.712-51.712 51.712h-422.4v174.08c0 38.912-45.056 61.44-75.776 37.376L18.432 534.016c-24.576-18.944-24.576-55.808 0-74.752z"
                p-id="3147"
                fill="#ffffff"
              ></path>
            </svg>
          </li>
          <li class="right" @click="move(swiperSize, -1, speed)">
            <svg
              t="1559528961147"
              class="arrow-right"
              style
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="2159"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="16"
              height="16"
            >
              <defs>
                <style type="text/css"></style>
              </defs>
              <path
                d="M1005.568 474.624l-455.168-348.672c-31.232-23.552-75.776-1.536-75.776 37.376v174.08H51.712C23.04 336.896 0 360.448 0 388.608V634.88c0 28.672 23.04 51.712 51.712 51.712h422.4v174.08c0 38.912 45.056 61.44 75.776 37.376l455.168-348.672c25.088-18.944 25.088-55.808 0.512-74.752z"
                p-id="2160"
                fill="#ffffff"
              ></path>
            </svg>
          </li>
        </ul>
        <ul class="dots">
          <li
            v-for="(dot, i) in sliders"
            :key="i"
            :class="{dotted: i === (currentIndex-1)}"
            @click="jump(i+1)"
          ></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
// import articleApi from "../../../../api/article.js";
export default {
  name: "slider",
  props: {
    /*
    readHot: {
      type: Boolean,
      default: false
    },
    commentHot: {
      type: Boolean,
      default: false
    },
    */
    hotTitle: {
      type: String
    },
    initialSpeed: {
      type: Number,
      default: 30
    },
    initialInterval: {
      type: Number,
      default: 4
    },
    sliders: {
      type: Array
    }
  },
  data() {
    return {
      defaultCover: require("../../../../static/img/default-cover.jpg"),
      // sliders: [],
      currentIndex: 1,
      distance: -250,
      swiperSize: 250,
      transitionEnd: true,
      speed: this.initialSpeed,
      isMobile: false,
      timer: {},
      temp: {}
    };
  },
  computed: {
    containerStyle() {
      return {
        transform: `translate3d(${this.distance}px, 0, 0)`
      };
    },
    interval() {
      return this.initialInterval * 1000;
    }
  },
  mounted() {
    this.init();
    /*
    if (this.redHot) {
      this.getReadHot();
    }
    if (this.commentHot) {
      this.getCmtHot();
    }
    */
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler, false);
  },
  methods: {
    /**
     * 初始化轮播
     */
    init() {
      this.play();
      window.onblur = function() {
        this.stop();
      }.bind(this);
      window.onfocus = function() {
        this.play();
      }.bind(this);
    },
    /**
     * 轮播控制
     */
    move(offset, direction, speed) {
      if (!this.transitionEnd) return;
      this.transitionEnd = false;
      direction === -1
        ? (this.currentIndex += offset / this.swiperSize)
        : (this.currentIndex -= offset / this.swiperSize);
      if (this.currentIndex > this.sliders.length) this.currentIndex = 1;
      if (this.currentIndex < 1) this.currentIndex = this.sliders.length;

      const destination = this.distance + offset * direction;
      this.animate(destination, direction, speed);
    },
    /**
     * 轮播
     */
    animate(des, direc, speed) {
      if (this.temp) {
        clearInterval(this.temp);
        this.temp = null;
      }
      this.temp = setInterval(() => {
        if (
          (direc === -1 && des < this.distance) ||
          (direc === 1 && des > this.distance)
        ) {
          this.distance += speed * direc;
        } else {
          this.transitionEnd = true;
          clearInterval(this.temp);
          this.distance = des;
          if (des < -(this.swiperSize * this.sliders.length))
            this.distance = -this.swiperSize;
          if (des > -this.swiperSize)
            this.distance = -(this.swiperSize * this.sliders.length);
        }
      }, 20);
    },
    /**
     * 根据dot跳转到指定slider
     */
    jump(index) {
      const direction = index - this.currentIndex >= 0 ? -1 : 1;
      const offset = Math.abs(index - this.currentIndex) * this.swiperSize;
      const jumpSpeed =
        Math.abs(index - this.currentIndex) === 0
          ? this.speed
          : Math.abs(index - this.currentIndex) * this.speed;
      this.move(offset, direction, jumpSpeed);
    },
    play() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.timer = setInterval(() => {
        this.move(this.swiperSize, -1, this.speed);
      }, this.interval);
    },
    stop() {
      clearInterval(this.timer);
      this.timer = null;
    },
    /*
    getReadHot() {
      articleApi.readHot().then(res => {
        this.sliders = res.data.article;
      });
    },
    getCmtHot() {
      articleApi.commentHot().then(res => {
        this.sliders = res.data.article;
      });
    },
    */
    routeTo(path) {
      path = "/article/" + path.toString();
      this.$router.push(path);
      // location.reload();
    },
    checkBrowser() {
      let clientWidth = document.body.clientWidth;
      return (
        /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) &&
        clientWidth < 768
      );
    },
    resizeHandler() {
      this.isMobile = this.checkBrowser();
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeHandler, false);
  }
  /**
   * 路由监听，在点击Hot组件后，刷新路由的同时也刷新数据
   */
  /*
  watch: {
    $route(to, from) {
      if (
        (to.path.indexOf("article") > -1 &&
          from.path.indexOf("userinfo") > -1) ||
        (to.path.indexOf("article") &&
          from.path.indexOf("path") &&
          to.path !== from.path)
      ) {
        // TODO：
        // 防止文章路由间切换而内容不变的情况，但是会导致重复请求
        this.$store.dispatch("getPost", this.$store.state.route.params.id);
      }
    }
  }
  */
};
</script>


<style scoped lang="stylus">
$width = 250px;
$height = 150px;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

li {
  list-style: none;
}

.slider-container {
  position: fixed;
  width: 250px;
  height: 190px;
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 5px 4px 10px 5px rgba(165, 165, 165, 0.3);

  .hot-title {
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-size: 18px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }
}

#slider {
  text-align: center;
  width: $width;
}

.window {
  position: relative;
  width: $width;
  height: $height;
  margin: 0 auto;
  overflow: hidden;
}

.container {
  display: flex;
  position: absolute;
}

.left, .right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  cursor: pointer;
}

.left {
  left: 3%;
  padding-left: 12px;
  padding-top: 10px;
}

.right {
  right: 3%;
  padding-right: 12px;
  padding-top: 10px;
}

.arrow-left, .arrow-right {
  position: absolute;
  margin: auto;
  top: 20p;
  text-align: center;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

img {
  user-select: none;
  width: $width;
  height: $height;
}

.dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.dots li {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 3px;
  border: 1px solid white;
  border-radius: 50%;
  background-color: #333;
  cursor: pointer;
}

.dots .dotted {
  background-color: orange;
}

.slider-slide {
  position: relative;
  width: $width;
  height: $height;
  cursor: pointer;

  img {
    z-index: 1;
    opacity: 0.8;
  }

  .article-title {
    position: absolute;
    top: 15px;
    left: 0;
    right: 0;
    margin: auto;
    font-size: 20px;
    color: #ffffff;
  }

  .article-desc {
    position: absolute;
    top: 45px;
    left: 0;
    right: 0;
    margin: auto;
    font-size: 20px;
    color: #ffffff;
  }

  .article-time, .article-readCount {
    z-index: 2;
    display: block;
    margin: 5px 0;
    font-size: 15px;
  }
}
</style>
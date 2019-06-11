// 分享组件
<template>
  <div>
    <p class="share-desc">分享至：</p>
    <div class="share-box">
      <a :href="weiboUrl" target="_blank" class="share-icon weibo-icon"></a>
      <a :href="qzoneUrl" target="_blank" class="share-icon qzone-icon"></a>
      <a :href="qqUrl" target="_blank" class="share-icon qq-icon"></a>
      <a :href="doubanUrl" target="_blank" class="share-icon douban-icon"></a>
      <div @click.stop="toggleQR" class="share-icon weixin-icon">
        <div class="weixin-qr" ref="weixinqr" :class="{'weixin-qr-show' : weixinqr}"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
export default {
  name: "Share",
  props: {
    url: {
      type: String
    },
    title: {
      type: String
    }
  },
  data() {
    return {
      content: "Simon's blog"
    };
  },
  computed: {
    ...mapGetters(["weixinqr"]),
    weiboUrl() {
      let url =
        "http://service.weibo.com/share/share.php?url=" +
        encodeURIComponent(this.url) +
        "&title=" +
        encodeURIComponent(this.title);
      return url;
    },
    qzoneUrl() {
      let url =
        "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" +
        encodeURIComponent(this.url) +
        "&title=" +
        encodeURIComponent(this.title) +
        "&summary=" +
        encodeURIComponent(this.content);
      return url;
    },
    qqUrl() {
      let url =
        "http://connect.qq.com/widget/shareqq/index.html?url=" +
        encodeURIComponent(this.url) +
        "&sharesource=qzone&title=" +
        encodeURIComponent(this.title) +
        "&summary=" +
        encodeURIComponent(this.content);
      return url;
    },
    doubanUrl() {
      let url =
        "http://www.douban.com/share/service?href=" +
        encodeURIComponent(this.url) +
        "&name=" +
        encodeURIComponent(this.title) +
        "&text=" +
        encodeURIComponent(this.content) +
        " " +
        encodeURIComponent(this.url);
      return url;
    },
    weixinUrl() {
      let url =
        "http://qr.liantu.com/api.php?text=" + encodeURIComponent(this.url);
      return url;
    }
  },
  mounted() {
    this.$refs.weixinqr.style.backgroundSize = "cover";
    this.$refs.weixinqr.style.backgroundImage = `url(${this.weixinUrl})`;
  },
  methods: {
    ...mapActions(["toggleWeixinQR"]),
    toggleQR() {
      this.$store.dispatch("toggleWeixinQR");

      /*
      this.$refs.weixinqr.style.display = "block";
      this.$refs.weixinqr.style.backgroundSize = "cover";
      this.$refs.weixinqr.style.backgroundImage = `url(${this.weixinUrl})`;
      */
      //   debugger;
    }
  }
};
</script>
<style lang="stylus" scoped>
.share-box {
  margin: 30px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;

  .share-desc {
    margin-bottom: 10px;
    font-size: 17px;
    color: #888888;
  }

  .share-icon {
    position: relative;
    display: inline-block;
    margin: 0 10px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }

  .weibo-icon {
    background: url('../../../../static/img/weibo.png') no-repeat center center;
  }

  .qzone-icon {
    background: url('../../../../static/img/qzone.png') no-repeat center center;
  }

  .qq-icon {
    background: url('../../../../static/img/qq.png') no-repeat center center;
  }

  .douban-icon {
    background: url('../../../../static/img/douban.png') no-repeat center center;
  }

  .weixin-icon {
    background: url('../../../../static/img/wechat.png') no-repeat center center;

    .weixin-qr {
      display: none;
      border: 1px solid #eee;
      position: absolute;
      z-index: 9;
      top: -205px;
      width: 200px;
      height: 192px;
      color: #666;
      font-size: 12px;
      text-align: center;
      background-color: #fff;
      box-shadow: 0 2px 10px #aaa;
      transition: all 0.2s;

      &::after {
        content: '';
        position: absolute;
        margin-left: -6px;
        bottom: -13px;
        width: 0;
        height: 0;
        border-width: 8px 6px 6px;
        border-style: solid;
        border-color: #fff transparent transparent;
      }
    }

    .weixin-qr-show {
      display: block !important;
    }
  }
}

@media screen and (min-width: 768px) {
  .weixin-qr {
    left: -84px;

    &::after {
      left: 50%;
    }
  }
}

@media screen and (min-width: 320px) and (max-width: 480px) {
  .weixin-qr {
    left: -150px;

    &::after {
      left: 90%;
    }
  }
}
</style>

<template>
  <div class="toast-container">
    <p
      class="toast-text"
      :class="[toastStyle, {'toast-text-show': toastShow}]"
      ref="toast"
    >{{ toastText }}</p>
  </div>
</template>
<script>
export default {
  name: "Toast",
  /*
  props: {
    toastText: {
      type: String
    },
    toastStyle: {
      type: String
    }
  },
  */
  data() {
    return {
      toastText: "",
      toastStyle: "",
      toastShow: false
    };
  },
  created() {
    this.$EventBus.$on("toast", (toastText, toastStyle, reloadFlag) => {
      this.toastShow = true;
      this.toastText = toastText;
      this.toastStyle = toastStyle;

      if (reloadFlag) {
        setTimeout(() => {
          this.toastShow = false;
        }, 2000);
      } else {
        setTimeout(() => {
          this.toastShow = false;
        }, 2000);
      }
    });
  },
  mounted() {},
  beforeDestroy() {
    this.$EventBus.$off("toast");
  }
};
</script>
<style lang="stylus" scoped>
.toast-container {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  z-index: 9999;

  .toast-text {
    padding: 10px;
    color: #ffffff;
    text-align: center;
    visibility: hidden;
  }

  .toast-text-show {
    visibility: visible;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
  }
}

.toast-success {
  background-color: #4caf50;
}

.toast-warning {
  background-color: #e6a23c;
}

.toast-error {
  background-color: #f56c6c;
}

@keyframes fadein {
  from {
    bottom: 0;
    opacity: 0;
  }

  to {
    bottom: 30px;
    opacity: 1;
  }
}

@keyframes fadeout {
  from {
    bottom: 30px;
    opacity: 1;
  }

  to {
    bottom: 0;
    opacity: 0;
  }
}
</style>

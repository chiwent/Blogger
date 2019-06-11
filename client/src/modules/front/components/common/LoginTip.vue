<template>
  <div class="login-container">你还没有登录</div>
</template>
<script>
export default {
  name: "LoginTip",
  data() {
    return {};
  }
};
</script>
<style lang="stylus" scoped>
.login-container {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}
</style>

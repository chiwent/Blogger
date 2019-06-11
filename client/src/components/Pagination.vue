<template>
  <ul class="pagination">
    <li class="pagination__button" @click="prevPage">
      <i class="el-icon-arrow-left" v-if="curPage > 1"></i>
    </li>
    <li
      class="pagination__item"
      v-for="page in pageArr"
      @click="switchPage(page)"
      :class="{'pagination__item--active': (page === curPage)}"
      :key="page"
    >
      <span v-if="allPage > 1">{{page}}</span>
    </li>
    <li class="pagination__button" @click="nextPage">
      <i class="el-icon-arrow-right" v-if="curPage < allPage"></i>
    </li>
  </ul>
</template>

<script>
export default {
  name: "pagination",
  data() {
    return {};
  },
  computed: {
    /*
    isIndex(page) {
      if (page === 0 && this.$store.state.curPage === "") {
        return true;
      }
    },
    */
    pageArr() {
      let arr = [];
      // 5页不显示省略号
      if (this.allPage <= 5) {
        for (let i = 1; i <= this.allPage; i++) {
          arr.push(i);
        }
      } else {
        // 当前页码大于3显示前面省略号
        if (this.curPage - 1 < 3) {
          for (let i = 1; i <= this.curPage + 1; i++) {
            arr.push(i);
          }
          arr.push("...");
          arr.push(this.allPage);
        } else if (this.allPage - this.curPage < 3) {
          // 显示前面一个省略号
          arr.push(1);
          arr.push("...");
          for (let i = this.curPage - 1; i <= this.allPage; i++) {
            arr.push(i);
          }
        } else {
          // 显示前后两个省略号
          arr.push(1);
          arr.push("...");
          arr.push(this.curPage - 1);
          arr.push(this.curPage);
          arr.push(this.curPage + 1);
          arr.push("...");
          arr.push(this.allPage);
        }
      }
      return arr;
    }
  },
  props: {
    curPage: {
      type: Number,
      required: true
    },
    allPage: {
      type: Number,
      required: true
    }
  },
  methods: {
    prevPage() {
      if (this.curPage <= 1) {
        return;
      }
      if (this.$route.meta.articleList) {
        this.$router.push("/page/" + this.curPage - 1);
      } else if (this.$route.meta.searchList) {
        // this.$router.push("/search/" + this.curPage - 1);
        this.$router.push(
          `/search?content=${this.$route.query.content}&page=${this.curPage -
            1}`
        );
      } else {
        this.$emit("changePage", this.curPage - 1);
      }
    },
    nextPage() {
      if (this.curPage >= this.allPage) {
        return;
      }
      if (this.$route.meta.articleList) {
        this.$router.push("/page/" + this.curPage + 1);
      } else if (this.$route.meta.searchList) {
        // this.$router.push("/search/" + this.curPage + 1);
        this.$router.push(
          `/search?content=${this.$route.query.content}&page=${this.curPage +
            1}`
        );
      } else {
        this.$emit("changePage", this.curPage + 1);
      }
    },
    switchPage(page) {
      if (page === "...") {
        return;
      }
      // 触发父组件的changePage方法，实现从父组件再修改props,单向数据流

      if (this.$route.meta.articleList) {
        this.$router.push("/page/" + page);
      } else if (this.$route.meta.searchList) {
        // this.$router.push("/search/" + page);
        this.$router.push(
          `/search?content=${this.$route.query.content}&page=${page}`
        );
      } else {
        this.$emit("changePage", page);
      }
    }
  },
  watch: {}
};
</script>

<style lang="stylus" scoped>
.pagination {
  display: flex;
  max-width: 300px;
  list-style: none;
  margin: 25px auto;

  .pagination__button {
    flex: 1;
    text-align: center;
    color: #0288D1;
    cursor: pointer;
  }

  .pagination__item {
    flex: 1;
    text-align: center;
    cursor: pointer;
    margin: 0 10px;

    &:hover {
      background-color: #efefef;
    }
  }

  .pagination__item--active {
    background-color: #efefef;
  }
}
</style>

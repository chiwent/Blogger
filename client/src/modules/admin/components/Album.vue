<template>
  <div class="container">
    <!-- <h2 class="title">本地Markdown图片管理区</h2> -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/admin/album'}">本地Markdown图片管理区</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="upload-area-wrapper">
      <h4 class="upload-area-title">图片上传区</h4>
      <el-upload class="upload-area" action="#" drag :before-upload="beforeImageUpload" :limit="1">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5m</div>
      </el-upload>
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        class="pagination"
        background
        layout="prev,pager,next"
        :current-page.sync="currentPage"
        :page-count="totalSize"
        @current-change="handleCurrentPage"
        v-show="totalSize > 1"
      ></el-pagination>
    </div>
    <div class="img-container" v-if="imgList.length > 0">
      <ul class="img-list-ul">
        <li
          class="img-list"
          v-for="(item, index) in imgList"
          :key="index"
          @click.stop="showBigImg(item)"
          :class="{'delete-img-effect' :true}"
        >
          <img :src="baseUrl + item" alt>
          <!-- <p class="img-desc">{{baseUrl + item}}</p> -->
          <el-button @click.stop="deleteImg(item, index)">删除</el-button>
        </li>
      </ul>
      <!-- <vue-preview :slides="imgList" @close="handleClose"></vue-preview> -->
    </div>
    <div class="big-img-wrapper" v-show="showFlag">
      <div class="close-btn" @click.stop="closeBigImg">关闭</div>
      <div class="target-img">
        <img :src="baseUrl + targetImg" alt>
        <p class="img-desc">{{ baseUrl + targetImg }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import uploadApi from "../../../api/uploadFile.js";
import { constants } from "crypto";
import config from "serverConfig/index.js";
const baseURL = config.location + "/markdown/";
export default {
  name: "Album",
  data() {
    return {
      baseUrl: baseURL,
      imgList: [],
      totalSize: 0,
      targetImg: void 0,
      showFlag: false,
      currentPage: 1
    };
  },
  created() {
    this.showImg(1);
  },
  mounted() {},
  methods: {
    handleClose() {
      console.log("close event");
    },
    showImg(page) {
      uploadApi
        .showMd(page)
        .then(res => {
          this.totalSize = Math.ceil(res.data.totalSize / 16);
          this.imgList = res.data.mdImg;
        })
        .catch(err => {
          console.log(err);
          this.$message({
            message: "获取失败",
            type: "error"
          });
        });
    },
    beforeImageUpload(file, fileList) {
      const acceptArr = [
        "image/pjpeg",
        "image/jpeg",
        "image/png",
        "image/x-png",
        "image/gif"
      ];
      const acceptType = acceptArr.some(item => {
        return file.type === item;
      });
      const limitSize = file.size / 1024 / 1024 < 5;
      if (!acceptType) {
        this.$message.error("上传图片只能是jpg或png格式!");
      }
      if (!limitSize) {
        this.$message.error("上传图片大小不能超过 5MB!");
      }
      let form = new FormData();
      form.append("file", file);
      uploadApi
        .uploadMd(this.$store.state.auth.token, form)
        .then(res => {
          if (res.data.success) {
            this.$message({
              message: "上传成功",
              type: "success"
            });
            this.imgList.unshift(res.data.mdImg);
            this.imgList.pop();
          } else {
            this.$message({
              message: "上传失败",
              type: "error"
            });
          }
        })
        .catch(err => {
          this.$message({
            message: "上传失败",
            type: "error"
          });
        });

      return acceptType && limitSize;
    },
    handleCurrentPage(page) {
      uploadApi
        .showMd(page)
        .then(res => {
          this.totalSize = Math.ceil(res.data.totalSize / 16);
          this.imgList = res.data.mdImg;
        })
        .catch(err => {
          console.log(err);
          this.$message({
            message: "获取失败",
            type: "error"
          });
        });
    },
    showBigImg(img) {
      this.targetImg = img;
      this.showFlag = true;
    },
    closeBigImg() {
      this.showFlag = false;
      this.targetImg = void 0;
    },
    deleteImg(img, index) {
      uploadApi
        .deleteMd(img)
        .then(res => {
          if (res.data.success) {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.showImg(this.currentPage);
          } else {
            this.$message({
              message: "删除失败",
              type: "error"
            });
          }
        })
        .catch(err => {
          // console.error(err)
          this.$message({
            message: "删除失败",
            type: "error"
          });
        });
      if (this.imgList.length === 0) {
        this.currentPage = 1;
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
@import '../assets/stylus/_settings.styl';

.container {
  .breadcrumb {
    margin: 30px;

    .el-breadcrumb__item {
      font-size: 18px;
    }
  }

  .upload-area-wrapper {
    position: relative;
    margin: 30px;

    .upload-area-title {
      color: $blue;
      text-align: center;
      margin-bottom: 15px;
    }

    .upload-area {
      width: 400px;
      margin: 0 auto;
    }
  }

  .pagination-wrapper {
    position: relative;

    .pagination {
      position: absolute;
      right: 100px;
    }
  }

  .img-container {
    margin-top: 80px;
    text-align: center;

    .img-list-ul {
      width: 80%;
      margin: 0 auto;

      .img-list {
        float: left;
        display: inline-block;
        width: 25%;
        height: 300px;
        padding: 20px 20px 50px 20px;
        font-size: 0;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          margin-bottom: 10px;
        }

        .img-desc {
          font-size: 18px;
        }
      }
    }
  }

  .big-img-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);

    .close-btn {
      position: absolute;
      top: 50px;
      right: 50px;
      color: #ffffff;
      font-size: 23px;
      font-weight: bold;
      cursor: pointer;
    }

    .target-img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 30px 30px 100px 30px;

      img {
        max-width: 400px;
        max-height: 400px;
      }
    }

    .img-desc {
      position: absolute;
      bottom: 0;
      max-width: 400px;
      color: #ffffff;
      font-size: 17px;
      word-break: break-all;
    }
  }
}
</style>

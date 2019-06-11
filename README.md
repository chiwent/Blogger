# Blogger
## Vue2 + Koa2 + MongoDB + SSR 打造的个人博客

fork自：[vue-blog](https://github.com/BUPT-HJM/vue-blog)<br>

- 前台页：vue ssr
- 管理页： vue spa

## 重点说明
本项目只是花了几天的时间草草写了一下，就上传到GitHub了，部分代码实现的方式可能会很*奇葩*（特别是sql），甚至注释可能都没加全。但是老罗说得好：<b>理解万岁</b>，后续有时间的话应该会修正一下代码<br>

### 自定义配置
在`server/configs/index.js`文件中，可按需要情况修改<br>

### 启动
详情可见fork目标的README
```
# install dependencies 
# 安装依赖，可以使用yarn/npm
npm install # or yarn install

# serve in dev mode, with hot reload at localhost:8889
# 开发环境，带有HMR，监听8889端口
npm run dev

# build for production
# 生产环境打包
npm run build

# serve in production mode (with building)
# 生产环境服务，不带有打包
npm start

# serve in production mode (without building)
# 生产环境服务,带有打包
npm run prod

# pm2
# need `npm install pm2 -g`
npm run pm2
```

### 功能
本博客系统有三个用户角色：游客、登录的普通用户、管理员<br>

- 游客只能浏览、分享管理员发布的文章和自我介绍，或者查看其他用户的个人信息；
- 游客可以注册账号，注册方式为邮件验证码，用户注册并登录账户后，可以在文章末尾发表评论，普通用户发表的评论会经过DFA算法自动过滤替换敏感词（为了防止过滤遗漏，后台有管理员手动撤销发布的功能）。普通用户在收到其他用户的回复（@）后，系统会邮件通知该用户。普通用户还可以编辑个人信息和上传个人头像；
- 管理员用户的权限包括了文章和个人介绍的增删查改、评论的发布和撤销、图片上传到本地服务器或图床（使用SM.MS）、编辑文章相关标签。<br>


### 展示
#### 前台页
![index-1](https://raw.githubusercontent.com/chiwent/Blogger/master/demo/index-1.PNG)
![index-2](https://raw.githubusercontent.com/chiwent/Blogger/master/demo/index-2.PNG)
![index-3](https://raw.githubusercontent.com/chiwent/Blogger/master/demo/index-3.PNG)
![index-4](https://raw.githubusercontent.com/chiwent/Blogger/master/demo/index-4.PNG)
![index-5](https://raw.githubusercontent.com/chiwent/Blogger/master/demo/index-5.PNG)
![index-6](https://raw.githubusercontent.com/chiwent/Blogger/master/demo/index-6.PNG)

#### 后台页
![admin-1](https://raw.githubusercontent.com/chiwent/Blogger/master/demo/admin-1.PNG)

关于服务端渲染，可以参看个人的博文：[Vue SSR初上手](https://github.com/chiwent/blog/issues/11)<br>


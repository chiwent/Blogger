// import fs from 'fs';
let config = {
    location: 'http://localhost:8889',
    app: {
        port: process.env.PORT || 8889,
        baseApi: '/api',
    },
    mongodb: {
        url: process.env.MONGO_URL || 'mongodb://localhost:27017/vue-blog',
    },
    mailConfig: {
        hosts: '',
        secure: false,
        secureConnection: false,
        auth: {
            user: '',
            pass: ''
        },
        from: ''
    },
    jwt: {
        secret: 'admin', // 默认
    },
    mongodbSecret: { // mongodb用户和密码
        user: '',
        pass: '',
    },
    admin: { // 后台初始化的用户名密码
        user: 'admin',
        pwd: 'password',
    },
    title: 'Simon\'s Blog',
    blog: 'Blogger',
    userName: 'simon',
    motto: '好好学习，天天向上',
    avatar: '',
    social: {
        github: 'https://github.com',
        weibo: 'https://weibo.com',
        zhihu: 'https://zhihu.com'
    },
    disqus: { // disqus
        // url: 'https://simonc.disqus.com/count.js',
    },
    baidu: { // 百度统计
        url: '',
    },
};

// 可在private.js定义自己私有的配置
// module.exports = {
//   mongodbSecret: {
//      user: '',
//      pass: ''
//   },
//   jwt: {
//      secret: 'xxx'
//   },
//   admin: {
//      user: '',
//      pwd: ''
//   }
// }


/*
if (fs.existsSync(__dirname + '/private.js')) {
    config = Object.assign(config, require('./private.js'));
}
*/
console.log(config);
export default config;

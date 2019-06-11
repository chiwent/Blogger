import Axios from 'axios';
import config from "../../../server/configs/index.js";
const baseURL = config.location;
// const md5 = require('md5');
export default {
    /**
     * 普通用户注册
     * @param {String} username 用户名
     * @param {String} password 密码
     * @param {String} email 邮箱地址
     * @param {String} code 邮箱验证码
     * @param {String} role 用户角色
     */
    regist(username, password, email, code, role = 'normal') {
        // password = md5(password).toUpperCase()
        return new Promise((resolve, reject) => {
            Axios.post('/api/regist', { username, password, email, code, role }).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 邮件重置密码
     * @param {String} email 邮箱地址
     * @param {String} password 新密码
     * @param {String} code 验证码
     * @param {Stirng} role 用户角色，默认为'normal'，为普通用户
     */
    resetUser(email, password, code, role = 'normal') {
        // password = md5(password).toUpperCase()
        return new Promise((resolve, reject) => {
            Axios.post('/api/resetUser', { email, password, code, role }).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 获取用户信息
     * @param {String} userId 用户ID
     */
    getUserInfo(userId) {
        return new Promise((resolve, reject) => {
            Axios.get('/api/userInfo/' + userId).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 
     * @param {String} id 用户ID
     * @param {Object} params 提交的参数信息，包括用户名、网址等等
     */
    postUserInfo(params) {
        let username = params.username;
        let showemail = params.showemail;
        let website = params.website;
        let motto = params.motto;
        let intro = params.intro;
        return new Promise((resolve, reject) => {
            Axios.post('/api/userInfo/', { username, showemail, website, motto, intro }).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 
     * @param {String} email 邮箱地址
     * @param {String} emailType 邮件类型：'signup' => 注册邮件，'reset' => 重置密码邮件
     */
    sendEmail(email, emailType) {
        return new Promise((resolve, reject) => {
            Axios.post('/api/sendEmail', { email, emailType }).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 获取未读评论
     * @param {String} id 用户ID
     */
    getUnReadMsg(id) {
        console.log('axios uid:', id)
        return new Promise((resolve, reject) => {
            Axios.get(`/api/userMsg?id=${id}`).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 设置评论已读
     * @param {String} commentId 评论ID
     */
    setReadMsg(commentId) {
        return new Promise((resolve, reject) => {
            Axios.post('/api/userMsg', { commentId }).then(res => {
                resolve(res);
            });
        });
    }
}
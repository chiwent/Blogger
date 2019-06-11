import Axios from 'axios';
import { rejects } from 'assert';
// import md5 from 'md5';
export default {
    createToken(username, password) {
        return Axios.post('/api/token', { username, password });
    },
    regist(name, username, password, role = 'normal', code = '') {
        return new Promise((resolve, reject) => {
            Axios.post('/api/regist', { name, username, password, role, code }).then(res => {
                resolve(res);
            });
        });
    },
    reset(username, oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            Axios.post('/api/reset', { username, oldPassword, newPassword }).then(res => {
                resolve(res);
            });
        });
    },
    adminRegist(username, password, email, role = 'admin') {
        return new Promise((resolve, reject) => {
            Axios.post('/api/regist', { username, password, email, role }).then(res => {
                resolve(res);
            });
        });
    },
    createNToken(username, password) {
        /*
        return new Promise((resolve, reject) => {
            Axios.post('/api/ntoken', { username, password }).then(res => {
                resolve(res);
            });
        });
        // */
        // password = md5(password).toUpperCase()
        return Axios.post('/api/ntoken', { username, password });
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
     * 邮件重置密码
     * @param {String} email 邮箱地址
     * @param {String} password 新密码
     * @param {String} code 验证码
     * @param {Stirng} role 用户角色，默认为'admin'，为管理用户
     */
    resetAdmin(email, password, code, role = 'admin') {
        return new Promise((resolve, reject) => {
            Axios.post('/api/resetAdmin', { email, password, code, role }).then(res => {
                resolve(res);
            });
        });
    },
};

import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import moment from 'moment';
moment.locale('zh-cn');
const userSchema = new Schema({
    name: String,
    // 用户角色
    role: {
        type: String,
        default: 'normal'
    },
    // 用户名
    username: {
        type: String,
        required: true
    },
    // 密码
    password: {
        type: String,
        required: true
    },
    // 用户IP
    userIp: String,
    // 用户注册邮箱
    email: String,
    /*
    salt: {
        type: String,
        required: true
    },*/
    // 用户头像名
    avatar: String,
    // 用户头像base64编码
    avatarCode: String,
    // userId: String,
    // 普通用户展示的邮箱
    showemail: String,
    // 普通用户介绍
    intro: String,
    // 普通用户的网站
    website: String,
    // 普通用户座右铭
    motto: String,
    // 用户创建时间
    createTime: Date,
}, { versionKey: false });

const roleReg = /^[a-zA-Z0-9_-]{4,10}$/;
const pwdReg = /^.*(?=.{6,16})(?=.*\d)(?=.*[A-Z]{2,})(?=.*[a-z]{2,})(?=.*[!@#$%^&*?\(\)]).*$/;
const userIdReg = /^[-'a-zA-Z0-9\u4e00-\u9eff]{4,6}$/i

let User = mongoose.model('user', userSchema);

userSchema.path('createTime').get(function (v) {
    return moment(v).format('lll');
});
/*
User.schema.path('username').validate(function (val) {
    return roleReg.test(val);
}, 'Invalid userid');
*/
/*
User.schema.path('password').validate(function (val) {
    return pwdReg.test(val);
}, 'Invalid password');
*/

module.exports = User;

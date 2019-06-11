'use strict';

import Code from '../models/code.js';
import User from '../models/user.js';
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

import config from '../configs/index.js';
const baseUrl = config.location;

class EmailController {
    constructor() {

    }

    async sendEmail(targetEmail, subject, mainContent) {
        let transporter = nodemailer.createTransport(smtpTransport({
            host: config.mailConfig.host,
            secure: config.mailConfig.secure,
            secureConnection: config.mailConfig.secureConnection,
            auth: {
                user: config.mailConfig.auth.user,
                pass: config.mailConfig.auth.pass
            }
        }));
        let info = await transporter.sendMail({
            from: config.mailConfig.from,
            to: targetEmail,
            subject: subject,
            html: mainContent
        });
        // console.log("Message sent: %s", info.messageId);
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    async signEmail(ctx, targetEmail) {
        const email = await User.findOne({ email: targetEmail }).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器错误');
        });
        if (email) {
            ctx.body = {
                success: false,
                desc: '邮箱已注册'
            }
            return false;
        } else {
            const code = Math.random().toString().slice(3, 7);
            const date = new Date();
            date.setTime(date.getTime() + 60 * 10 * 1000); // 设置10分钟有效期
            let subject = '欢迎注册NBlogger用户';
            let mainContent = `<p>欢迎注册NBlogger新用户，你的邮箱验证码是：<b>${code}</b>，10分钟内有效，请妥善管理</p>`;
            const send = await this.sendEmail(targetEmail, subject, mainContent).catch(err => {
                console.error(err);
                ctx.throw(500, '服务器错误');
            });
            const emailCode = new Code({
                code: code,
                effTime: date
            });
            let emailCodeRes = await emailCode.save().catch(err => {
                ctx.throw(500, '服务器内部错误');
            });
            ctx.body = {
                success: true,
                desc: '注册邮件发送成功'
            }
            return true;
        }
    }

    async resetEmail(ctx, targetEmail) {
        const email = await User.findOne({ email: targetEmail }).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器错误');
        });
        console.log('email:', email);
        if (!email) {
            ctx.body = {
                success: false,
                desc: '邮箱未注册'
            }
            return false;
        } else {
            const code = Math.random().toString().slice(3, 7);
            const date = new Date();
            date.setTime(date.getTime() + 60 * 10 * 1000); // 设置10分钟有效期
            let subject = 'NBlogger密码重置';
            let mainContent = `<b>你在NBlogger博客平台上重置密码的验证码是: <b>${code}。10分钟内有效</b>`;
            this.sendEmail(targetEmail, subject, mainContent).catch(err => {
                console.error(err);
                ctx.throw(500, '服务器错误');
            });
            const emailCode = new Code({
                code: code,
                effTime: date
            });
            let emailCodeRes = await emailCode.save().catch(err => {
                ctx.throw(500, '服务器内部错误');
            });
            ctx.body = {
                success: true,
                desc: '重置邮件发送成功'
            }
            return true;
        }
    }

    async TipEmail(ctx, targetEmail, fromUserId, fromUserName, articleId, article) {
        const baseURL = baseUrl;
        let subject = '你收到来自NBlogger的消息';
        let mainContent = `<p>你收到了<a href="${baseURL}/userinfo/${fromUserId}">${fromUserName}</a>的回复信息，主题是<a href="${baseURL}/article/${articleId}">《${article}》</a></p>
                            <p>快去看看吧</p>
                            `;
        this.sendEmail(targetEmail, subject, mainContent).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器错误');
        });
        return true;
    }
}

export default EmailController;
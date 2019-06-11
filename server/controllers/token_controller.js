import User from '../models/user.js';
import Code from '../models/code.js';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import config from '../configs/';
import Email from './email_controller.js';

const email = new Email();

export async function initUser() {
    let user = await User.find().exec().catch(err => {
        console.log(err);
    });
    if (user.length === 0) {
        user = new User({
            name: 'simon',
            username: config.admin.user,
            password: md5(config.admin.pwd).toUpperCase(),
            avatar: '',
            createTime: new Date(),
        });
        await user.save().catch(err => {
            console.log(err);
        });
    }
}

export async function regist(ctx) {

}

export async function sendEmail(ctx) {
    const ctxBody = ctx.request.body;
    const emailType = ctxBody.emailType;
    // console.log('emailType:', emailType)
    if (!ctxBody.email || !/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(ctxBody.email)) {
        ctx.body = {
            success: false,
            desc: '邮箱为空或格式不正确'
        }
    } else {
        if (emailType === 'signup') {
            let status = await email.signEmail(ctx, ctxBody.email);
            if (status) {
                ctx.body = {
                    success: true,
                    desc: '邮件发送成功'
                }
            } else {
                ctx.body = {
                    success: false,
                    desc: '邮箱已注册'
                }
            }
        } else if (emailType === 'reset') {
            let status = await email.resetEmail(ctx, ctxBody.email);
            if (status) {
                ctx.body = {
                    success: true,
                    desc: '邮件发送成功'
                }
            } else {
                ctx.body = {
                    success: false,
                    desc: '邮箱未注册'
                }
            }
        }
    }
}

export async function register(ctx) {
    const ctxQuery = ctx.request.body;

    if (!/[a-zA-Z0-9_\u4e00-\u9fa5]{2,10}/.test(ctxQuery.name)) {
        ctx.throw(400, '用户名格式不正确，请使用2到10位中英文和数字组合');
        return;
    }
    if (ctxQuery.role === 'admin') {

        let user = await User.findOne({ $or: [{ username: ctxQuery.username }, { email: ctxQuery.email }] }).exec().catch(err => {
            console.log(err);
            ctx.throw(500, '服务器内部错误');
        });
        // 如果不存在管理员
        if (!user) {
            let imgName = Math.random().toString().slice(3, 8);
            let avatar = 'https://avatars.dicebear.com/v2/bottts/' + imgName + '.svg';
            user = new User({
                // name: ctxQuery.name,
                username: ctxQuery.username,
                password: ctxQuery.password,
                email: ctxQuery.email,
                avatar: avatar,
                createTime: new Date(),
                role: ctxQuery.role
            });
            await user.save().catch(err => {
                console.log(err);
                ctx.throw(500, '服务器内部错误');
            });
            ctx.body = {
                success: true,
                desc: '注册成功'
            }
        } else {
            ctx.body = {
                success: false,
                content: '已存在管理员，请根据管理员信息登录'
            }
        }
    } else if (ctxQuery.role === 'normal') {
        // 用户名和邮箱都不能重复
        let normalUser = await User.findOne({ $or: [{ username: ctxQuery.username }, { email: ctxQuery.email }] }).exec().catch(err => {
            console.log(err);
            ctx.throw(500, '服务器内部错误');
        });
        if (!normalUser) {
            const date = new Date().getTime();
            const code = await Code.find({ code: ctxQuery.code }).sort({ createTime: -1 }).limit(1).catch(err => {
                console.error(err);
                ctx.throw(500, '服务器内部错误');
            });
            console.log('code:', code[0]);
            // console.log('efftime:', code.effTime.getTime())
            if (code[0].effTime.getTime() >= date) {
                let imgName = Math.random().toString().slice(3, 8);
                let avatar = 'https://avatars.dicebear.com/v2/bottts/' + imgName + '.svg';
                normalUser = new User({
                    // name: ctxQuery.name,
                    username: ctxQuery.username,
                    password: ctxQuery.password,
                    email: ctxQuery.email,
                    createTime: new Date(),
                    avatar: avatar,
                    role: 'normal'
                });
                await normalUser.save().catch(err => {
                    console.log(err);
                    ctx.throw(500, '服务器内部错误');
                });
                ctx.body = {
                    success: true,
                    desc: '注册成功'
                }
            } else {
                ctx.body = {
                    success: false,
                    desc: '验证码已失效，请重新获取'
                }
            }
        } else {
            ctx.body = {
                success: false,
                desc: '用户已存在，请根据用户信息登录'
            }
        }
    }
}


export async function resetUser(ctx) {
    const ctxBody = ctx.request.body;
    const email = ctxBody.email;
    const code = ctxBody.code;
    const password = ctxBody.password;
    let normalUser = await User.findOne({ $and: [{ email }, { role: 'normal' }] }).exec().catch(err => {
        console.log(err);
        ctx.throw(500, '服务器内部错误');
    });
    // console.log('reset pwd:', normalUser)
    if (normalUser) {
        const date = new Date().getTime();
        const codeRes = await Code.find({ code }).sort({ createTime: -1 }).limit(1).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        });
        console.log('codeRes:', codeRes[0])
        // console.log('password:', password)
        if (codeRes[0].effTime.getTime() >= date) {
            const resetRes = await User.findOneAndUpdate({ email, role: 'normal' }, { password }).catch(err => {
                console.log(err);
                ctx.throw(500, '服务器内部错误');
            });
            // console.log('resetRes:', resetRes);
            ctx.body = {
                success: true,
                desc: '重置成功'
            }
        } else {
            ctx.body = {
                success: false,
                desc: '验证码已失效或有误，请检查或重新获取'
            }
        }
    } else {
        ctx.body = {
            success: false,
            content: '邮箱尚未注册'
        }
    }
}

export async function login(ctx) {
    // console.log('request:', ctx.request)
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    let user = await User.findOne({ $and: [{ username }, { role: 'admin' }] }).exec();
    if (user !== null) {
        if (user.password === password) {
            const token = jwt.sign({
                uid: user._id,
                username: user.username,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 1 day
                // exp: Math.floor(Date.now() / 1000) + 3 // 3s
            }, config.jwt.secret);
            ctx.body = {
                success: true,
                uid: user._id,
                username: user.username,
                role: user.role,
                token: token
            };
        } else {
            ctx.throw(401, '密码错误');
        }
    } else {
        ctx.throw(401, '用户名错误');
    }
}

export async function normalLogin(ctx) {
    // console.log('request:', ctx.request)
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    // console.log(username, password);
    let user = await User.findOne({ $and: [{ username }, { role: 'normal' }] }).exec();
    // console.log('normal')
    if (user !== null) {
        if (user.password === password) {
            const token = jwt.sign({
                uid: user._id,
                username: user.username,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 1 day
                // exp: Math.floor(Date.now() / 1000) + 3 // 3s
            }, config.jwt.secret);
            ctx.body = {
                success: true,
                uid: user._id,
                name: user.username,
                role: user.role,
                token: token,
            };
        } else {
            ctx.throw(401, '密码错误');
        }
    } else {
        ctx.throw(401, '用户名错误');
    }
}

export async function resetAdmin(ctx) {
    const ctxBody = ctx.request.body;
    const email = ctxBody.email;
    // const username = ctxBody.username;
    const code = ctxBody.code;
    const password = ctxBody.password;
    let user = await User.findOne({ $and: [{ email }, { role: 'admin' }] }).exec().catch(err => {
        console.log(err);
    });

    if (user) {
        const date = new Date().getTime();
        const codeRes = await Code.find({ code }).sort({ createTime: -1 }).limit(1).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        });
        console.log('codeRes:', codeRes[0])
        // console.log('password:', password)
        if (codeRes[0].effTime.getTime() >= date) {
            const resetRes = await User.findOneAndUpdate({ email, role: 'admin' }, { password }).catch(err => {
                console.log(err);
                ctx.throw(500, '服务器内部错误');
            });
            ctx.body = {
                success: true,
                desc: '修改密码成功'
            }
        } else {
            ctx.body = {
                success: false,
                desc: '验证码已失效或有误，请重新获取'
            }
        }
    } else {
        ctx.body = {
            success: false,
            desc: '邮箱尚未注册'
        }
    }
}
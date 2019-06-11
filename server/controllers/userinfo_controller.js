import User from '../models/user.js';
import Comment from '../models/comment.js';
import userinfo from '../../client/src/api/userinfo.js';
const xss = require('xss');
const DFAfilter = require('sensitive-word-filter')

class UserInfoController {
    constructor() {

    }
    /**
     * 查看用户个人信息
     */
    async getUserInfo(ctx) {
        const ctxBody = ctx.request.body;
        // const username = ctxBody.username;
        const id = ctx.params.id;
        const limitSize = 5;
        // console.log('params.id:', id)
        const userInfo = await User.findOne({ _id: id, role: 'normal' }).catch(err => {
            console.error(err)
            ctx.throw(500, '服务器内部错误');
        });
        if (!userInfo) {
            ctx.throw(404, '用户ID不存在');
        }
        const commentRes = await Comment.find({ uid: id }).sort({ createTime: -1 }).limit(limitSize).exec().catch(err => {
            console.error(err);
            ctx.throw(500, '服务内部错误');
        });
        ctx.body = {
            success: true,
            username: userInfo.username,
            avatar: userInfo.avatar,
            createTime: userInfo.createTime,
            website: userInfo.website,
            showemail: userInfo.showemail,
            motto: userInfo.motto,
            intro: userInfo.intro,
            comment: commentRes,
            desc: '获取个人信息'
        }
    }

    /**
     * 用户本人修改个人信息
     */
    async modityUser(ctx) {
        const ctxQuery = ctx.query;
        const ctxBody = ctx.request.body;
        const userId = ctxQuery.id;
        const userInfo = await User.findByIdAndUpdate(id, { ctxBody }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        ctx.body = {
            success: true,
            userInfo,
            desc: '修改个人信息'
        }
    }

    /**
     * 用户本人修改普通用户信息
     * @param {Object} ctx 
     */
    async postUserInfo(ctx) {
        const ctxBody = ctx.request.body;
        let userInfo;
        const id = ctx.tokenUid;
        const username = DFAfilter.filter(xss(ctxBody.username));
        const showemail = DFAfilter.filter(xss(ctxBody.showemail));
        const website = DFAfilter.filter(xss(ctxBody.website));
        const motto = DFAfilter.filter(xss(ctxBody.motto));
        const intro = DFAfilter.filter(xss(ctxBody.intro));

        if (username) {
            const userCheck = await User.findById(id).catch(err => {
                console.error(err);
                ctx.throw(500, '服务器内部错误');
            });
            if (userCheck !== null) {
                ctx.body = {
                    success: false,
                    desc: '用户名已存在，请重新设置'
                }
            }
            userInfo = await User.findByIdAndUpdate(id, { $set: { username } }).catch(err => {
                console.error(err);
                ctx.throw(500, '服务器内部错误');
            });
        } else {
            if (showemail) {
                userInfo = await User.findByIdAndUpdate(id, { $set: { showemail } }).catch(err => {
                    console.error(err);
                    ctx.throw(500, '服务器内部错误');
                });
            }
            if (website) {
                userInfo = await User.findByIdAndUpdate(id, { $set: { website } }).catch(err => {
                    console.error(err);
                    ctx.throw(500, '服务器内部错误');
                });
            }
            if (motto) {
                userInfo = await User.findByIdAndUpdate(id, { $set: { motto } }).catch(err => {
                    console.error(err);
                    ctx.throw(500, '服务器内部错误');
                });
            }
            if (intro) {
                userInfo = await User.findByIdAndUpdate(id, { $set: { intro } }).catch(err => {
                    console.error(err);
                    ctx.throw(500, '服务器内部错误');
                });
            }
        }
        ctx.body = {
            success: true,
            content: {
                showemail,
                website,
                motto,
                intro
            },
            desc: '修改用户信息成功'
        }

    }

    /**
     * 获取未读消息
     */
    async getUnReadMsg(ctx) {
        console.log('uid:', ctx.query.id)
        // const limitSize = 5;
        if (ctx.tokenUid !== ctx.query.id) {
            return;
        }
        const message = await Comment.find({ respId: ctx.tokenUid, readStatus: false }).sort({ createTime: -1 }).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        });
        console.log('message:', message);
        ctx.body = {
            success: true,
            message,
            desc: '获取未读消息'
        }
    }

    async setReadMsg(ctx) {
        const ctxBody = ctx.request.body;
        const commentId = ctxBody.commentId;
        /*
        const message = await Comment.findByIdAndUpdate(commentId, { readStatus: true }).catch(err => {
            console.error(err)
            ctx.throw(500, '服务器内部错误');
        });
        */
        const message = await Comment.findOneAndUpdate({ _id: commentId, respId: ctx.tokenUid, readStatus: false }, { readStatus: true }).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        })
        // console.log('message:', message);
        ctx.body = {
            success: true,
            desc: '消息已读'
        }
    }


    async getUser(ctx) {

    }

}

export default UserInfoController;
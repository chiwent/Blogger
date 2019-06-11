import Comment from '../models/comment.js';
import Article from '../models/article.js';
import User from '../models/user.js';
import Email from './email_controller.js'
const email = new Email();
const DFAfilter = require('sensitive-word-filter')

const xss = require('xss');

function getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.headers['x-real-ip'];
}

class CommentController {
    async createComment(ctx, req) {
        const ctxBody = ctx.request.body;
        const content = xss(ctxBody.content);
        const postId = ctxBody.postId;
        const parent = ctxBody.parent;
        const respId = ctxBody.respId;
        const respUser = ctxBody.respUser;
        let userIP = ctx.request.ip;
        // console.log('ctx.request.ip', ctx.request.ip)
        let filteredStr = DFAfilter.filter(content);
        // console.log('Filter:', filteredStr)
        if (userIP === '::1') {
            userIP = '127.0.0.1'
        } else {
            userIP = ctx.request.ip.match(/\d+.\d+.\d+.\d+/);
        }
        // console.log('tokenName:', ctx.tokenUserName)
        const comment = new Comment({
            postId,
            uid: ctx.tokenUid,
            name: ctx.tokenUserName,
            content: filteredStr,
            createTime: new Date(),
            userIP,
            parent,
            respId,
            respUser
        });
        // console.log('comment:', comment)
        // console.log('userip:', userIP);
        let createResult = await comment.save().catch(err => {
            console.error('Err:', err)
            ctx.throw(500, '服务器内部错误');
        });

        const user = await User.findById(createResult.uid).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        });
        // 用户评论数+1
        const article = await Article.findByIdAndUpdate(postId, { $inc: { "commentCount": 1 } }).catch(err => {
            console.error('Err:', err)
            ctx.throw(500, '服务器内部错误');
        });

        // console.log('article:', article);
        // console.log('user:', user);
        console.log('send to email:', user.email)
        // 发送通知邮件
        if (createResult.respId) {
            await email.TipEmail(ctx, user.email, createResult.uid, createResult.name, article.postId, article.title);
        }


        // TODO: 增加文章评论数
        /*
        if (createResult) {
            let article = await Article.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }).catch(err => {
                ctx.throw(500, '服务器内部错误');
            });
        }
        */
        ctx.body = {
            success: true,
            comment: createResult,
            desc: '创建评论成功'
        };
    }

    async createAdminComment(ctx) {
        const ctxBody = ctx.request.body;
        // const name = ctxBody.name;
        const content = ctxBody.content;
        const postId = ctxBody.postId;
        const parent = ctxBody.parent;
        const respId = ctxBody.respId;
        const respUser = ctxBody.respUser;
        // const userIP = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0];
        // console.log('postId:', postId);

        // console.log('token :', ctx.tokenUid, ctx.tokenUserName)
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const comment = new Comment({
            postId,
            uid: ctx.tokenUid,
            name: 'admin',
            // email: 'admin@admin.com',
            content,
            state: 1,
            createTime: new Date(),
            parent,
            respId,
            respUser
            // userIP
        });
        // console.log('comment:', comment)
        let createResult = await comment.save().catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        // 用户评论数+1
        const article = await Article.findByIdAndUpdate(postId, { $inc: { "commentCount": 1 } }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        const user = await User.findById(createResult.respId).catch(err => {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        });
        // console.log('createRes:', createResult)
        // console.log('article:', article);
        // console.log('user:', user.email);
        // 发送通知邮件
        console.log('send to email:', user.email)
        if (createResult.respId) {
            let emailstatus = await email.TipEmail(ctx, user.email, createResult.uid, createResult.name, article._id, article.title);
            console.log('EmailStatus:', emailstatus)
        }
        ctx.body = {
            success: true,
            comment: createResult,
            desc: '创建评论成功'
        };
    }

    async getAllComment(ctx) {
        // const postId = ctx.params.id;   // 文章ID
        // const postId = ctx.request.body.postId;
        const postId = ctx.request.query.postId;
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const comment = await Comment.find({ postId }).sort({ createTime: -1 }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        ctx.body = {
            success: true,
            comment,
            desc: '获取所有评论'
        }
    }

    async getPublishComment(ctx) {
        // const postId = ctx.params.id;   // 文章ID
        // const postId = ctx.request.body.postId;
        const postId = ctx.request.query.postId;
        // console.log('postId:', postId)
        const comment = await Comment.find({
            postId,
            state: 1
        }).sort({ createTime: -1 }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        ctx.body = {
            success: true,
            comment,
            desc: '获取发布评论'
        }
    }

    async publishComment(ctx) {
        // const id = ctx.params.id;
        const articleId = ctx.request.body.articleId;  // 文章ID
        const commentId = ctx.request.body.commentId; // 评论ID
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const comment = await Comment.findByIdAndUpdate(commentId, { $set: { state: 1 } }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        const article = await Article.findByIdAndUpdate(articleId, { $inc: { "commentCount": 1 } }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        // console.log(article)
        ctx.body = {
            success: true,
            desc: '发布评论成功'
        }
    }

    async unPublishComment(ctx) {
        // const id = ctx.params.id;
        const articleId = ctx.request.body.articleId;  // 文章ID
        const commentId = ctx.request.body.commentId; // 评论ID
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const comment = await Comment.findByIdAndUpdate(commentId, { $set: { state: 0 } }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        const article = await Article.findByIdAndUpdate(articleId, { $inc: { "commentCount": -1 } }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        // console.log(article)
        ctx.body = {
            success: true,
            desc: '撤销发布成功'
        }
    }

    async deleteComment(ctx) {
        const id = ctx.params.id;
        // const id = ctx.request.body.id; // 评论ID
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        // 软删除
        const comment = await Comment.findByIdAndUpdate({ _id: id }, { $set: { state: 2 } }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        ctx.body = {
            success: true,
            desc: '删除成功'
        }
    }

}
export default CommentController;
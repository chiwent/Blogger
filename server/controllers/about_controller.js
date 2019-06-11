import About from '../models/about.js';
import User from '../models/user.js';
import config from '../configs/';
const xss = require('xss');


class AboutController {
    async createAbout(ctx) {
        const ctxBody = ctx.request.body;
        const title = ctxBody.title;
        const content = xss(ctxBody.content);
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const about = new About({
            title: title,
            content: content,
            // publish: publish
            publish: false
        });

        let createStatus = await about.save().catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        ctx.body = {
            success: true,
            about: createStatus
        }
    }

    async getAbout(ctx) {
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const about = await About.findOne({}, (err, docs) => {
            if (docs === null) {
                ctx.body = {
                    success: true,
                    desc: '当前没有数据'
                }
            }
        }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        if (about) {
            ctx.body = {
                success: true,
                title: about.title,
                content: about.content,
                publish: about.publish
            }
        }
    }

    async getPublishAbout(ctx) {
        const about = await About.findOne({
            publish: true
        }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        console.log(about)
        if (about) {
            ctx.body = {
                success: true,
                title: about.title,
                content: about.content
            };
        } else {
            ctx.body = {
                success: true,
                title: '关于我',
                content: '暂时还没想好写什么...'
            };
        }
    }

    async  modifyAbout(ctx) {
        // console.log(ctx.request.body)
        const ctxQuery = ctx.request.body;
        const title = ctxQuery.title;
        const content = ctxQuery.content;
        const publish = ctxQuery.publish;
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        // console.log('modifyAbout:', ctxQuery, title, content)
        if (title === '') {
            ctx.throw(400, '标题不能为空');
        }
        if (content === '') {
            ctx.throw(400, '文章内容不能为空');
        }
        const about = await About.updateOne({}, { title: title, content: content, publish: publish }).catch(err => {
            if (err.name === 'CastError') {
                ctx.throw(400, '自我介绍不存在');
            } else {
                ctx.throw(500, '服务器内部错误');
            }
        });
        ctx.body = {
            success: true,
            debug: '修改成功'
        };
    }

    async publishAbout(ctx) {
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const about = await About.updateOne({ publish: false }, { publish: true }).catch(err => {
            if (err.name === 'CastError') {
                this.throw(400, '自我介绍不存在');
            } else {
                this.throw(500, '服务器内部错误');
            }
        });
        ctx.body = {
            success: true,
            publish: about.publish,
            desc: '发布自我介绍成功'
        };
    }

    async notPublishAbout(ctx) {
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const about = await About.updateOne({ publish: true }, { publish: false }).catch(err => {
            if (err.name === 'CastError') {
                this.throw(400, '自我介绍不存在');
            } else {
                this.throw(500, '服务器内部错误');
            }
        });
        ctx.body = {
            success: true,
            publish: about.publish,
        };
    }

    async  deleteAbout(ctx) {
        let status;
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        const about = await About.remove().catch(err => {
            if (err.name === 'CastError') {
                this.throw(400, '自我介绍不存在');
            } else {
                this.throw(500, '服务器内部错误');
            }
        });
        if (about.publish === undefined) {
            status = 0;
        }
        ctx.body = {
            success: true,
            publish: status,
        };
    }

    async getAvatar(ctx) {
        const avatar = await User.findOne({ username: 'admin' }).catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
        ctx.body = {
            success: true,
            avatar: avatar.avatar,
            // avatarCode: avatar.avatarCode
        }
    }
}

export default AboutController;
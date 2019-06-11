import Article from '../models/article.js';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import config from '../configs/';
const xss = require('xss');
// const chalk = require('chalk');
// const log = console.log;

export async function createArticle(ctx) {
    const title = xss(ctx.request.body.title);
    const content = xss(ctx.request.body.content);
    const abstract = xss(ctx.request.body.abstract);
    const publish = ctx.request.body.publish;
    const tags = ctx.request.body.tags;
    const createTime = new Date();
    const lastEditTime = new Date();
    if (title === '') {
        ctx.throw(400, '标题不能为空');
    }
    if (content === '') {
        ctx.throw(400, '文章内容不能为空');
    }
    if (abstract === '') {
        ctx.throw(400, '摘要不能为空');
    }
    if (ctx.tokenRole !== 'admin') {
        ctx.throw(401, '非管理员用户');
    }
    const article = new Article({
        title,
        content,
        abstract,
        publish,
        tags,
        createTime,
        lastEditTime,
    });
    let createResult = await article.save().catch(err => {
        ctx.throw(500, '服务器内部错误');
    });
    await Article.populate(createResult, { path: 'tags' }, function (err, result) {
        createResult = result;
        // console.log(result)

    });
    console.log('文章创建成功');
    ctx.body = {
        success: true,
        article: createResult,
    };

}

export async function getAllArticles(ctx) {
    const tag = ctx.query.tag;
    const page = +ctx.query.page;
    const limit = +ctx.query.limit || 4;
    let skip = 0;
    let articleArr;
    let allPage;
    let allNum;
    if (ctx.tokenRole !== 'admin') {
        ctx.throw(401, '非管理员用户');
    }
    if (page !== 0) {
        skip = limit * (page - 1);
    }

    if (tag === '') {
        articleArr = await Article.find()
            .populate('tags')
            .sort({ createTime: -1 })
            .limit(limit)
            .skip(skip).catch(err => {
                ctx.throw(500, '服务器内部错误');
            });
        allNum = await Article.count().catch(err => {
            this.throw(500, '服务器内部错误');
        });
    } else {
        let tagArr = tag.split(',');
        // console.log(tagArr)
        articleArr = await Article.find({
            tags: { $in: tagArr },
        })
            .populate('tags')
            .sort({ createTime: -1 })
            .limit(limit)
            .skip(skip).catch(err => {
                ctx.throw(500, '服务器内部错误');
            });
        allNum = await Article.find({
            tags: { $in: tagArr },
        }).count().catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
    }
    allPage = Math.ceil(allNum / limit);
    ctx.body = {
        success: true,
        articleArr,
        allPage: allPage,
    };
}

export async function getAllPublishArticles(ctx) {
    const tag = ctx.query.tag;
    const page = +ctx.query.page;
    const limit = +ctx.query.limit || 4;
    let skip = 0;
    let articleArr;
    let allPage;
    let allNum;

    if (page !== 0) {
        skip = limit * (page - 1);
    }

    if (tag === '') {
        articleArr = await Article.find({
            publish: true,
        })
            .populate('tags')
            .sort({ createTime: -1 })
            .limit(limit)
            .skip(skip).catch(err => {
                ctx.throw(500, '服务器内部错误');
            });
        allNum = await Article.find({
            publish: true,
        }).count().catch(err => {
            this.throw(500, '服务器内部错误');
        });
    } else {
        let tagArr = tag.split(',');
        // console.log(tagArr)
        articleArr = await Article.find({
            tags: { $in: tagArr },
            publish: true,
        })
            .populate('tags')
            .sort({ createTime: -1 })
            .limit(limit)
            .skip(skip).catch(err => {
                ctx.throw(500, '服务器内部错误');
            });
        allNum = await Article.find({
            tags: { $in: tagArr },
        }).count().catch(err => {
            ctx.throw(500, '服务器内部错误');
        });
    }

    allPage = Math.ceil(allNum / limit);


    ctx.body = {
        success: true,
        articleArr,
        allPage: allPage,
    };
}


export async function modifyArticle(ctx) {
    // console.log(ctx.request.body)
    const id = ctx.params.id;
    const title = ctx.request.body.title;
    const content = ctx.request.body.content;
    const abstract = ctx.request.body.abstract;
    const tags = ctx.request.body.tags;
    if (title === '') {
        ctx.throw(400, '标题不能为空');
    }
    if (content === '') {
        ctx.throw(400, '文章内容不能为空');
    }
    if (abstract === '') {
        ctx.throw(400, '摘要不能为空');
    }

    /* if (tags.length === 0) {
    ctx.throw(400, '标签不能为空')
  } */
    const article = await Article.findByIdAndUpdate(id, { $set: ctx.request.body }).catch(err => {
        if (err.name === 'CastError') {
            ctx.throw(400, 'id不存在');
        } else {
            ctx.throw(500, '服务器内部错误');
        }
    });
    ctx.body = {
        success: true,
    };
}

export async function getArticle(ctx) {
    let article;
    const id = ctx.params.id;
    // const role = ctx.request.body.role;
    // console.log('id:', id, 'role:', ctx.request.body.role);
    if (id === '') {
        ctx.throw(400, 'id不能为空');
    }

    /* if (tags.length === 0) {
    ctx.throw(400, '标签不能为空')
  } */
    /*
      if (role !== 'admin') {
          log(chalk.blue('Role:', role))
          article = await Article.findByIdAndUpdate(id, { $inc: { "count": 1 } }).catch(err => {
              if (err.name === 'CastError') {
                  ctx.throw(400, 'id不存在');
              } else {
                  ctx.throw(500, '服务器内部错误');
              }
          });
      } else {
          article = await Article.findById(id).catch(err => {
              if (err.name === 'CastError') {
                  ctx.throw(400, 'id不存在');
              } else {
                  ctx.throw(500, '服务器内部错误');
              }
          });
      }
      */
    article = await Article.findById(id).catch(err => {
        if (err.name === 'CastError') {
            ctx.throw(400, 'id不存在');
        } else {
            ctx.throw(500, '服务器内部错误');
        }
    });
    ctx.body = {
        success: true,
        article: article,
    };
}

export async function incReadTime(ctx) {
    const id = ctx.request.body.id;
    console.log('id:', id)
    const role = ctx.request.body.role;
    if (role !== 'admin') {
        // log(chalk.blue('Role:', role))
        const article = await Article.findByIdAndUpdate(id, { $inc: { "readCount": 1 } }).catch(err => {
            if (err.name === 'CastError') {
                ctx.throw(400, 'id不存在');
            } else {
                ctx.throw(500, '服务器内部错误');
            }
        });
    }
    ctx.body = {
        success: true
    }
}

export async function readHotArticles(ctx) {
    const limitSize = 5;
    const article = await Article.find().sort({ readCount: -1 }).limit(limitSize).catch(err => {
        ctx.throw(500, '服务器内部错误');
    });
    if (article.length === 0) {
        ctx.body = {
            success: true,
            article: '暂时为空',
            desc: '获取阅读次数最多的文章'
        }
    } else {
        ctx.body = {
            success: true,
            article,
            desc: '获取阅读次数最多的文章'
        }
    }
}

export async function cmtHotArticles(ctx) {
    const limitSize = 5;
    const article = await Article.find().sort({ commentCount: -1 }).limit(limitSize).catch(err => {
        ctx.throw(500, '服务器内部错误');
    });
    if (article.length === 0) {
        ctx.body = {
            success: true,
            article: '暂时为空',
            desc: '获取评论数最多的文章'
        }
    } else {
        ctx.body = {
            success: true,
            article,
            desc: '获取评论数最多的文章'
        }
    }
}

export async function deleteArticle(ctx) {
    const id = ctx.params.id;
    if (ctx.tokenRole !== 'admin') {
        ctx.throw(401, '非管理员用户');
    }
    const article = await Article.findByIdAndRemove(id).catch(err => {
        if (err.name === 'CastError') {
            this.throw(400, 'id不存在');
        } else {
            this.throw(500, '服务器内部错误');
        }
    });
    ctx.body = {
        success: true,
    };
}

export async function publishArticle(ctx) {
    const id = ctx.params.id;
    if (ctx.tokenRole !== 'admin') {
        ctx.throw(401, '非管理员用户');
    }
    const article = await Article.findByIdAndUpdate(id, { $set: { publish: true } }).catch(err => {
        if (err.name === 'CastError') {
            this.throw(400, 'id不存在');
        } else {
            this.throw(500, '服务器内部错误');
        }
    });
    ctx.body = {
        success: true,
    };
}

export async function notPublishArticle(ctx) {
    const id = ctx.params.id;
    if (ctx.tokenRole !== 'admin') {
        ctx.throw(401, '非管理员用户');
    }
    const article = await Article.findByIdAndUpdate(id, { $set: { publish: false } }).catch(err => {
        if (err.name === 'CastError') {
            this.throw(400, 'id不存在');
        } else {
            this.throw(500, '服务器内部错误');
        }
    });
    ctx.body = {
        success: true,
    };
}

export async function searchArticle(ctx) {
    let end;
    const limit = 4;
    let begin = 0;
    let page = ctx.query.page;
    // const reg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
    // const regEx = "[^\\[.*?\\]].*?" + ctx.query.content + ".*?[^\\(.*?\\)+$]";
    const regEx = "[^\\[|\\(]{1}" + ctx.query.content;
    const content = new RegExp(regEx, 'gi');
    // const content = new RegExp(ctx.query.content, 'gi');
    // console.log('regex:', content)
    if (page < 1) {
        page = 1;
    }
    if (page > 1) {
        begin = (page - 1) * limit;
        end = page * limit;
    } else {
        begin = 0;
        end = limit;
    }
    // console.log('query:', begin, limit, content, page);
    const articleArr = await Article.find({ $or: [{ title: { $regex: content } }, { abstract: { $regex: content } }, { content: { $regex: content } }] })
        .sort({ createTime: -1 }).catch(err => {
            console.log('Err:', err)
            ctx.throw(500, '服务器内部错误');
        });
    const allNum = Math.ceil(articleArr.length / limit);
    // console.log('controller allNum:', allNum);

    const article = articleArr.slice(begin, end);
    ctx.body = {
        success: true,
        article,
        allNum,
        page,
        desc: '文章查询结果'
    }
}

export async function uploadCover(ctx) {
    let id = ctx.request.body.id;
    let img = ctx.request.body.img;
    if (ctx.tokenRole !== 'admin') {
        ctx.throw(401, '非管理员用户');
    }
    const cover = await Article.findByIdAndUpdate(id, { $set: { coverImg: img } }).catch(err => {
        ctx.throw(500, '服务器内部错误');
    });
    ctx.body = {
        success: true,
        desc: '设置成功'
    }
}
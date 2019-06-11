import jwt from 'jsonwebtoken';
import config from '../configs/';
export default async (ctx, next) => {
    // console.log(ctx.get('Authorization'));
    const authorization = ctx.get('Authorization');
    if (authorization === '') {
        ctx.throw(401, 'no token detected in http header \'Authorization\'');
        ctx.redirect('/tip');
    }
    const token = authorization.split(' ')[1];
    let tokenContent;
    try {
        tokenContent = await jwt.verify(token, config.jwt.secret);
    } catch (err) {
        if ('TokenExpiredError' === err.name) {
            ctx.throw(401, 'token expired,请及时本地保存数据！');
            ctx.redirect('/');
        }
        ctx.throw(401, 'invalid token');
        ctx.redirect('/');
    }
    ctx.tokenUserName = tokenContent.username;
    ctx.tokenUid = tokenContent.uid;
    // console.log('normal verify:', tokenContent)
    console.log('鉴权成功');
    await next();
};

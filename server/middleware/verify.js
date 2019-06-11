import jwt from 'jsonwebtoken';
import config from '../configs/';
export default async (ctx, next) => {
    // console.log(ctx.get('Authorization'));
    const authorization = ctx.get('Authorization');
    if (authorization === '') {
        ctx.throw(401, 'no token detected in http header \'Authorization\'');
    }
    const token = authorization.split(' ')[1];
    let tokenContent;
    try {
        tokenContent = await jwt.verify(token, config.jwt.secret);
    } catch (err) {
        if ('TokenExpiredError' === err.name) {
            ctx.throw(401, 'token expired,请及时本地保存数据！');
        }
        ctx.throw(401, 'invalid token');
    }
    console.log('tokenContent:', tokenContent); // 可以拿到uid、username等信息
    // 将解密的token信息传递到控制器，防止有token的用户随意设置用户名等参数
    ctx.tokenUserName = tokenContent.username;
    ctx.tokenUid = tokenContent.uid;
    ctx.tokenRole = tokenContent.role;
    console.log('鉴权成功');
    await next();
};

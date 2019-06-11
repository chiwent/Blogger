
export default async (router) => {
    router.all('*', async (ctx, next) => {
        ctx.set("Access-Control-Allow-Origin", "*")
        ctx.set("Access-Control-Allow-Headers", "X-Requested-With, Authorization")
        ctx.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
        ctx.set("X-Powered-By", ' 3.2.1')
        ctx.set("Content-Type", "application/json;charset=utf-8")
        ctx.set('Referer', 'http://localhost:8889')
        next();
    })
}
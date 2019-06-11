import koa from 'koa';
import convert from 'koa-convert';
import onerror from 'koa-onerror';
import serve from 'koa-static';
import mongoose from 'mongoose';
import historyApiFallback from './middleware/historyApiFallback';
import config from './configs';
import middleware from './middleware';
import api from './api';
import path from 'path';
import fs from 'fs';
import { createBundleRenderer } from 'vue-server-renderer';
import serverConfig from '../server/configs/index.js';
import koaBody from 'koa-body';

// import bodyParser from 'koa-bodyparser';

const resolve = file => path.resolve(__dirname, file);

mongoose.Promise = Promise;
// connect mongodb
mongoose.connect(config.mongodb.url, config.mongodbSecret);
mongoose.connection.on('error', console.error);

const isProd = process.env.NODE_ENV === 'production';
const router = require('koa-router')();
const routerInfo = require('koa-router')();
const proxy = require('koa-proxies');

// import cookie from 'koa-cookie';

import jsCookie from 'js-cookie';

const Ddos = require('ddos');
const ddos = new Ddos({ whitelist: ['127.0.0.1', 'localhost'] });


const app = new koa();
// app.proxy = true;



/*
const { JSDOM } = require('jsdom')
const dom = new JSDOM('<!Doctype html><html><body></body></html>',
    { url: 'http://127.0.0.1:8889' })

global.window = dom.window
global.document = window.document
global.navigator = window.navigator;
global.scrollTo = window.scrollTo;
global.location = window.location;
*/
// global.XMLHttpRequest = window.XMLHttpRequest;

const cors = require('koa2-cors');

const protect = require('koa-protect');
app.use(protect.koa.sqlInjection({
    body: true,
    loggerFunction: console.error
}));

app.use(protect.koa.xss({
    body: true,
    loggerFunction: console.error
}));

app.use(proxy('/smms', {
    target: 'https://sm.ms',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/(smms)/, '/api'),
    logs: true
}));

app.use(ddos.koa().bind(ddos));

// app.use(cookie());


app.use(cors({
    origin: function (ctx) {

        if (ctx.url === '/api' || ctx.url === '/admin') {
            console.log('cors:', ctx.url);
            return "*"; // 允许来自所有域名请求
        }
        // return '*'; // 直接允许全部域名

        return 'http://localhost:8889'; //只允许 http://localhost:8889 这个域名的请求
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

app.use(middleware());
onerror(app);



// api router
app.use(api());


app.use(serve(path.join(__dirname, './public')))



/*
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 2 * 1024 * 1024	// 设置上传文件大小最大限制，默认2M
    }
}));
*/

// 创建渲染器，开启组件缓存
let renderer;

// console.log('jsCookie: ', jsCookie.get('token'));

function createRenderer(bundle, template) {
    return createBundleRenderer(bundle, {
        template,
        cache: require('lru-cache')({
            max: 1000,
            maxAge: 1000 * 60 * 15,
        }),
        runInNewContext: false,
    });
}

// 编译中的提示
routerInfo.get('*', async (ctx, next) => {
    if (!renderer) {
        ctx.body = 'Still working......';
        return ctx.body;
    }
    return next();
});

app.use(routerInfo.routes());

// 对路由admin直接走historyApiFallback,而不是用服务端渲染

app.use(convert(historyApiFallback({
    verbose: true,
    index: '/admin.html',
    rewrites: [
        { from: /^\/admin\/?$/, to: '/admin.html' },
        { from: /^\/admin\/login/, to: '/admin.html' },
    ],
    path: /^\/admin/,
})));

if (isProd) {
    // 生产环境下直接读取构造渲染器
    const bundle = require('../client/dist/vue-ssr-server-bundle.json');
    const template = fs.readFileSync(resolve('../client/dist/front.html'), 'utf-8');
    renderer = createRenderer(bundle, template);
    app.use(serve('./client/dist'));
} else {
    // 开发环境下使用hot/dev middleware拿到bundle与template
    require('../client/build/setup-dev-server')(app, (bundle, template) => {
        renderer = createRenderer(bundle, template);
    });
}

// 流式渲染
router.get('*', async (ctx, next) => {
    let req = ctx.req;
    // 由于koa内有处理type，此处需要额外修改content-type
    ctx.type = 'html';
    const s = Date.now();
    let context = {
        title: serverConfig.title,
        url: req.url,
        renderURLScript: (type) => {
            if (config[type].url !== '') {
                return `<script src="${config[type].url}" async></script>`;
            }
            return '';
        },
        // cookies: req.cookies
    };
    function renderToStringPromise() {
        return new Promise((resolve, reject) => {
            renderer.renderToString(context, (err, html) => {
                if (err) {
                    console.log(err);
                }
                if (!isProd) {
                    console.log(`whole request: ${Date.now() - s}ms`);
                }
                resolve(html);
            });
        });
    }
    ctx.body = await renderToStringPromise();
});

app
    .use(router.routes())
    .use(router.allowedMethods());

// create server
app.listen(config.app.port, () => {
    console.log('The server is running at http://localhost:' + config.app.port);
});

export default app;

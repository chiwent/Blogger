import { createApp } from './app';

const isDev = process.env.NODE_ENV !== 'production';

import Cookies from 'js-cookie';


// https://ssr.vuejs.org/zh/guide/data.html#%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E6%95%B0%E6%8D%AE%E9%A2%84%E5%8F%96-server-data-fetching
export default context => {
    const s = isDev && Date.now();
    // 注意下面这句话要写在export函数里供服务端渲染调用，重新初始化那store、router
    const { app, router, store } = createApp();
    return new Promise((resolve, reject) => {
        router.push(context.url);
        router.onReady(() => {
            const matchedComponents = router.getMatchedComponents();
            if (!matchedComponents.length) {
                reject({ code: 404 });
            }
            Promise.all(matchedComponents.map(component => {
                if (component.preFetch) {
                    // 调用组件上的preFetch(这部分只能拿到router第一级别组件，子组件的preFetch拿不到)
                    return component.preFetch(store);
                }
            })).then(() => {
                isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`);
                // 暴露数据到HTMl，使得客户端渲染拿到数据，跟服务端渲染匹配
                context.state = store.state;
                context.state.posts.forEach((element, index) => {
                    context.state.posts[index].content = '';
                });
                /*
                if (context.cookies) {
                    store.state.token = context.cookies;
                }
                Cookies.set('token', store.state.token)
                console.log('state.token', store.state.token)
                console.log('Cookies: ', Cookies.get('token'));
                console.log('context.cookie: ', context.cookies);
                */
                // console.log('context', context)
                // console.log('context url', context.url)
                if (/\/article\//g.test(context.url)) {
                    context.title = context.state.currentPost.title;
                } else if (/\/userinfo\//g.test(context.url)) {
                    context.title = '用户详情'
                }
                /*
                console.log('context.state:', context.state, 'context:', context)
                console.log('content.state:', context.state)
                console.log('article:', context.title)
                */

                // context.state.about.content = '';
                if (/\/about\//g.test(context.url)) {
                    context.title = '关于我';
                }
                resolve(app);
            }).catch(reject);
        });
    });
};

// import vue from 'vue';
import { createApp } from './app';
const { app, router, store } = createApp();


// store替换使client rendering和server rendering匹配
if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
}

//  挂载app
router.onReady(() => {
    router.beforeResolve((to, from, next) => {
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)
        // 只关心非预渲染的组件, 对比它们，找出两个匹配列表的差异组件
        let diffed = false
        const activated = matched.filter((c, i) => {
            return diffed || (diffed = (prevMatched[i] !== c))
        })
        if (!activated.length) {
            return next()
        }
        // 这里如果有加载指示器 (loading indicator)，就触发
        Promise.all(activated.map(c => {
            /*if (c.preFetch) {
                return c.preFetch({ store, route: to })
            }*/
        })).then(() => {
            // 停止加载指示器(loading indicator)
            next()
        }).catch(next)
    })
    app.$mount('#app');
});




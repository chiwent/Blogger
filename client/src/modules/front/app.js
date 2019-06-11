import Vue from 'vue';
import Axios from 'axios';
import { createStore } from './store';
import { createRouter } from './router';
import { sync } from 'vuex-router-sync';

import App from './App.vue';

import { setStorage, getStorage } from '../../util/util.js';

Vue.prototype.$EventBus = new Vue()



/*
import 'swiper/dist/css/swiper.css';
if (process.env.VUE_ENV === 'client') {
    const VueAwesomeSwiper = require('vue-awesome-swiper/dist/ssr');
    Vue.use(VueAwesomeSwiper);
}
*/

// 解决移动端300ms延迟问题

if (typeof window !== 'undefined') {
    const Fastclick = require('fastclick');
    Fastclick.attach(document.body);
}

/*
Vue.mixin({
    beforeRouteEnter(to, from, next) {
        document.body.scrollTop = 0;
    }
})
*/

// 每次服务端请求渲染时会重新createApp，初始化这些store、router
// 不然会出现数据还是原来的数据没有变化的问题
export function createApp(ssrContext) {
    const store = createStore();
    const router = createRouter();

    sync(store, router);

    if (typeof window !== 'undefined') {
        router.beforeEach((to, from, next) => {
            let token = getStorage({
                name: "token",
                type: "session"
            });
            if (token && !store.state.token) {
                store.dispatch('setToken', token.content);
            }
            let uid = getStorage({
                name: 'uid',
                type: 'session'
            });
            if (uid && !store.state.uid) {
                store.dispatch("setUid", uid.content);
            }

            if (token) {
                Axios.defaults.headers.common['Authorization'] = 'token ' + token.content;
            }
            if (to.path === '/reset') {
                next('/reset')
            }
            if (to.meta.userAuth && !token) {
                next('/tip');
            }

            document.body.scrollTop = 0;
            if (from.path === '/') {
                store.dispatch('closeWeixinQR');
                // store.dispatch('clearArticle');
            }
            if (to.path === '/' && store.state.sideBoxOpen) {
                store.commit('CLOSE_SIDEBOX');
                setTimeout(function () {
                    next();
                }, 100);
            } else {
                next();
            }
            next();
        });
    }

    const app = new Vue({
        router,
        store,
        ssrContext,
        render: h => h(App),
    });

    return { app, router, store };
}

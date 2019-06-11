import Vue from 'vue';
import VueRouter from 'vue-router';
// import List from '../components/List.vue'
// import Article from '../components/Article.vue'

Vue.use(VueRouter);



const List = resolve => require(['../components/List.vue'], resolve);
const Article = resolve => require(['../components/Article.vue'], resolve);
const About = resolve => require(['../components/About.vue'], resolve);
const NormalUser = resolve => require(['../components/NormalUser.vue'], resolve);
const UserInfo = resolve => require(['../components/UserInfo.vue'], resolve);
const LoginTip = resolve => require(['../components/common/LoginTip.vue'], resolve);
//fixed Not-implemented error
/*
const isServer = process.env.VUE_ENV === 'server'
if (isServer) {
    window.scrollTo = function (x, y) {
        // do something or not
    }
}
*/

const isBrowser = typeof window !== 'undefined';



export function createRouter() {
    const router = new VueRouter({
        mode: 'history',
        scrollBehavior: (to, from, savedPosition) => {
            if (savedPosition) {
                return savedPosition;
            } else {
                return { x: 0, y: 0 };
            }
        },
        routes: [
            { path: '/', component: List, meta: { articleList: true } },
            { path: '/about', component: About },
            { path: '/article/:id', component: Article, meta: { scrollToTop: true } },
            { path: '/page/:page', component: List, meta: { articleList: true } },
            { path: '/search', component: List, meta: { searchList: true } },
            // { path: '/userinfo/login', component: NormalUser },
            { path: '/userinfo/:id', component: UserInfo },
            { path: '/tip', component: LoginTip },
            { path: '*', redirect: '/' },
        ],
    });
    /*
    if (typeof window !== 'undefined') {
        router.afterEach((to, from) => {
            if (document && !(/\/article\//g.test(to.path))) {
                document.querySelector('title').innerText = 'Simon\'s Blog';
            }
        });
    }
    */
    return router;
}

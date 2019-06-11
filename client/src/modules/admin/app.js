import Vue from 'vue';
import VueRouter from 'vue-router';
import Axios from 'axios';

import { Message } from 'element-ui';
import { MessageBox } from 'element-ui';
import { Upload } from 'element-ui';
import { Button } from 'element-ui';
import { Tag } from 'element-ui';
import { Pagination } from 'element-ui';
import { Breadcrumb, BreadcrumbItem } from 'element-ui';
import { Dialog } from 'element-ui';
import { Switch } from 'element-ui';

import ToggleButton from 'vue-js-toggle-button';
Vue.use(ToggleButton);

import './assets/stylus/main.styl';

import App from './App.vue';
import store from './store';

/*
import VuePreview from 'vue-preview'
Vue.use(VuePreview)
*/
/*
import "vue-git-comment/dist/vue-git-comment.css";
import VueGitComment from "vue-git-comment";

Vue.use(VueGitComment);
*/



// 按需引入element-ui相关弹出
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message = (options) => { // 重新定义默认参数
    options = Object.assign(options, { duration: 2000 });
    return Message(options);
};
Vue.prototype.$message.error = (err) => { // 重新定义默认参数
    var options = {
        message: err,
        duration: 500,
        type: 'error',
    };
    return Message(options);
};

Vue.use(VueRouter);
Vue.use(Upload);
Vue.use(Button);
Vue.use(Tag);
Vue.use(Pagination);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Dialog);
Vue.use(Switch);

const Login = resolve => require(['./components/Login.vue'], resolve);
const Admin = resolve => require(['./components/Admin.vue'], resolve);
const Reset = resolve => require(['./components/Reset.vue'], resolve);
const Album = resolve => require(['./components/Album.vue'], resolve);
// const NormalUser = resolve => require(['./components/NormalUser.vue'], resolve);
const routes = [
    { path: '/admin/login', component: Login, meta: { adminAuth: true } },
    { path: '/admin', component: Admin },
    /*{
        path: '*',
        redirect: '/404', // 输入其他不存在的地址自动跳回首页
    },*/
    {
        path: '/admin/reset', component: Reset
    },
    {
        path: '/admin/album', component: Album
    },
    /*
    {
        path: '/user/login', component: NormalUser, meta: { userAuth: true }
    }
    */
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

router.beforeEach((to, from, next) => {
    // console.log(store.state);
    // console.log(to);
    if (to.meta.adminAuth) { // login
        if (store.state.auth.token) {
            next('/admin');
        }
        next();
    } else {
        if (store.state.auth.token) {
            // Axios.defaults.headers.common['Authorization'] = 'Bearer ' + store.state.auth.token; // 全局设定header的token验证，注意Bearer后有个空格
            Axios.defaults.headers.common['Authorization'] = 'token ' + store.state.auth.token;
            next();
        } else if (to.path === '/admin/reset') {
            next();
        } else {
            console.log('without token');
            next('/admin/login');
        }
    }

});

// axios拦截返回，拦截token过期
Axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response.data.error.indexOf('token') !== -1) {
        store.commit('DELETE_TOKEN');
    }
    return Promise.reject(error);
});

new Vue({
    el: '#app',
    render: h => h(App),
    router,
    store,
});

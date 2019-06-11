import Vue from 'vue';
import Vuex from 'vuex';
import articleApi from 'api/article.js';
import tagApi from 'api/tag.js';
import aboutApi from 'api/about.js';
import tokenApi from '../../../api/login.js';
import marked from 'lib/marked.js';
// import Cookies from 'js-cookie';
import config from '../../../../../server/configs/index.js';

// import { getStorage, setStorage } from '../../../util/util.js';
import Axios from 'axios';

Vue.use(Vuex);

/*
let initAvatar = getStorage({
    name: 'avatar',
    type: 'session'
});
*/


const prefixAvatar = '../../../../../../server/public/avatar/';

// const initialToken = Cookies.get('token');
// const initialToken = document.cookie;

export function createStore() {
    return new Vuex.Store({
        state: {
            currentPost: {
                content: '',
                id: '',
            },
            currentPostCompile: '',
            posts: [],
            allPage: 0,
            curPage: 0,
            tags: [],
            selectTags: [],
            sideBoxOpen: false,
            about: {
                title: '',
                content: ''
            },
            weixinqr: false,
            adminAvatar: '',
            searchVal: '',
            token: void 0,
            uid: void 0
        },

        actions: {
            createNToken({ commit, state }, { username, password }) {
                // console.log(initialToken)
                return tokenApi.createNToken(username, password).then(res => {
                    if (res.data.success) {
                        // console.log(res.data.token);
                        commit('CREATE_TOKEN', res.data.token);
                    } else {
                        commit('DELETE_TOKEN');
                    }
                    return new Promise((resolve, reject) => {
                        resolve(res);
                    });
                });
            },
            setToken({ commit, state }, token) {
                commit('SET_TOKEN', token);
            },
            rmToken({ commit, dispatch, state }) {
                commit('DELETE_TOKEN');
                dispatch('rmUid');
            },
            setUid({ commit, state }, uid) {
                commit('SET_UID', uid);
            },
            rmUid({ commit, state }) {
                // debugger
                commit('DELETE_UID');
            },
            searchItem({ commit, state }, searchVal) {
                commit('SEARCH_ITEM', searchVal);
            },
            searchArticles({ commit, state }, { searchVal, page = 1 }) {
                return articleApi.searchArticle(searchVal, page).then(res => {
                    commit('GET_ALL_POSTS', { posts: res.data.article, allPage: res.data.allNum, curPage: res.data.page });
                    return new Promise((resolve, reject) => {
                        resolve(res);
                    });
                });
            },
            getAdminAvatar({ commit, state }) {
                let prefix = config.location + '/avatar/';
                return aboutApi.getAvatar().then(res => {
                    const avatar = /^http/.test(res.data.avatar)
                        ? res.data.avatar
                        : prefix + res.data.avatar;
                    commit('GET_ADMIN_AVATAR', avatar);
                });
            },
            getAllPosts({ commit, state }, { tag = '', page = 1, limit = 5 } = {}) {
                return articleApi.getAllPublishArticles(tag, page, limit).then(res => {
                    commit('GET_ALL_POSTS', { posts: res.data.articleArr, allPage: res.data.allPage, curPage: page });
                    return new Promise((resolve, reject) => {
                        resolve(res);
                    });
                });
            },
            getAllTags({ commit, state }) {
                return tagApi.getAllTags().then(res => {
                    commit('GET_ALL_TAGS', res.data.tagArr);
                    return new Promise((resolve, reject) => {
                        resolve(res);
                    });
                });
            },
            getPublishTags({ commit, state }) {
                return tagApi.getPublishTags().then(res => {
                    commit('GET_PUBLISH_TAGS', res.data.tagArr);
                    return new Promise((resolve, reject) => {
                        resolve(res);
                    });
                });
            },
            getPublishAbout({ commit, state }) {
                return aboutApi.getPublishAbout().then(res => {
                    console.log(res.data)
                    commit('GET_PUBLISH_ABOUT', res.data);
                });
            },
            getPost({ commit, state }, id) {
                let article = state.posts.find((post) => post.id === id);
                if (!article && state.currentPost.id === id) {
                    article = state.currentPost;
                }
                if (article && article.content) {
                    commit('GET_POST', article);
                    return new Promise((resolve, reject) => {
                        resolve(article);
                    });
                } else {
                    return articleApi.getArticle(id).then(res => {
                        commit('GET_POST', res.data.article);
                        return new Promise((resolve, reject) => {
                            resolve(res);
                        });
                    }).catch((err) => {
                        console.log(err)
                    });
                }
                /*
                return articleApi.getArticle(id).then(res => {
                    commit('GET_POST', res.data.article);
                    return new Promise((resolve, reject) => {
                        resolve(res);
                    });
                }).catch((err) => {
                    console.log(err)
                });
                */

            },
            clearArticle({ commit, state }, id) {
                commit('CLEAR_ARTICLE_STATE', id);
            },
            toggleWeixinQR({ commit, state }) {
                commit('TOGGLE_WEIXIN_QR');
            },
            closeWeixinQR({ commit, state }) {
                commit('CLOSE_WEIXIN_QR');
            },
        },

        mutations: {
            CREATE_TOKEN: (state, token) => {
                state.token = token;
                // Cookies.set(token);
            },
            SET_TOKEN: (state, token) => {
                state.token = token;
            },
            DELETE_TOKEN: (state, token) => {
                state.token = void 0;
            },
            SET_UID: (state, uid) => {
                state.uid = uid;
            },
            DELETE_UID: (state, uid) => {
                state.uid = void 0;
            },
            /*
            DELETE_TOKEN: (state, token) => {
                state.token = null;
                Cookies.remove('token');
            },
            */
            SEARCH_ITEM: (state, searchVal) => {
                state.searchVal = searchVal;
            },
            GET_ADMIN_AVATAR: (state, avatar) => {
                state.adminAvatar = avatar;
            },
            GET_ALL_POSTS: (state, { posts, allPage, curPage }) => {
                if (isNaN(+allPage)) {
                    allPage = 0;
                }
                if (isNaN(+curPage)) {
                    curPage = 0;
                }
                state.posts = posts;
                state.allPage = +allPage;
                state.curPage = +curPage;
                // debugger
            },
            GET_ALL_TAGS: (state, tags) => {
                state.tags = tags;
            },
            GET_PUBLISH_TAGS: (state, tags) => {
                state.tags = tags;
            },
            SET_SELECT_TAGS: (state, tags) => {
                state.selectTags = tags;
            },
            TOGGLE_SELECT_TAGS: (state, { id, name, searchVal }) => {
                state.searchVal = '';
                if (typeof state.selectTags.find(function (e) {
                    return e.id === id;
                }) === 'undefined') {
                    state.selectTags.push({
                        id,
                        name,
                    });
                } else {
                    state.selectTags = state.selectTags.filter((e) => {
                        return e.id !== id;
                    });
                }
            },
            TOGGLE_SIDEBOX: (state) => {
                state.sideBoxOpen = !state.sideBoxOpen;
            },
            CLOSE_SIDEBOX: (state) => {
                state.sideBoxOpen = false;
            },
            GET_POST: (state, article) => {
                state.currentPost = article;
                state.currentPostCompile = marked(state.currentPost.content);
            },
            CLEAR_ARTICLE_STATE: (state) => {
                state.currentPost = '';
            },
            GET_PUBLISH_ABOUT: (state, about) => {
                state.about.title = about.title;
                state.about.content = marked(about.content);
            },
            TOGGLE_WEIXIN_QR: (state) => {
                state.weixinqr = !state.weixinqr;
            },
            CLOSE_WEIXIN_QR: (state) => {
                state.weixinqr = false;
            }
        },
        getters: {
            searchval: state => state.searchVal,
            posts: state => state.posts,
            tags: state => state.tags,
            curPage: state => state.curPage,
            allPage: state => state.allPage,
            selectTags: state => state.selectTags,
            searchTags: state => {
                return state.selectTags.map((item) => item.id);
            },
            sideBoxOpen: state => state.sideBoxOpen,
            currentPost: state => state.currentPost,
            currentPostCompile: state => state.currentPostCompile,
            currentAbout: state => state.about,
            weixinqr: state => state.weixinqr,
            adminAvatar: state => state.adminAvatar,
            userToken: state => state.token
        },
    });
}

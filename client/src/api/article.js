import Axios from 'axios';
// 为了让服务端渲染正确请求数据

// if (typeof window === 'undefined') {
//     Axios.defaults.baseURL = 'http://127.0.0.1:8889';
// }

// Axios.defaults.baseURL = 'http://127.0.0.1:8889';
// const baseURL = 'http://127.0.0.1:8889';
const baseURL = 'http://localhost:8889';
export default {
    createArticle(title, content, publish, tags) {
        let abstract;
        if (content.indexOf('<!--more-->') !== -1) {
            abstract = content.split('<!--more-->')[0];
        } else {
            abstract = '';
        }
        return Axios.post(baseURL + '/api/articles', { title, content, publish, abstract, tags });
    },
    getAllArticles(tag = '', page = 1, limit = 0) {
        return Axios.get(baseURL + `/api/articles?tag=${tag}&page=${page}&limit=${limit}`);
    },
    getAllPublishArticles(tag = '', page = 1, limit = 0) {
        return Axios.get(baseURL + `/api/publishArticles?tag=${tag}&page=${page}&limit=${limit}`);
    },
    saveArticle(id, article) {
        console.log(article);
        return Axios.patch(baseURL + '/api/articles/' + id, article);
    },
    publishArticle(id) {
        return Axios.patch(baseURL + '/api/articles/' + id, { publish: true });
    },
    notPublishArticle(id) {
        return Axios.patch(baseURL + '/api/articles/' + id, { publish: false });
    },
    deleteArticle(id) {
        return Axios.delete(baseURL + '/api/articles/' + id);
    },
    getArticle(id) {
        return Axios.get(baseURL + '/api/articles/' + id);
    },
    /*
    getArticle(id, role = 'normal') {
        return Axios.get(baseURL + '/api/articles/' + id, { role });
    },
    */
    searchArticle(content, page = 1) {
        // return new Promise((reoslve, reject) => {
        return Axios.get(baseURL + `/api/search?content=${content}&page=${page}`);
        // });
    },
    incReadTime(id, role = 'normal') {
        return new Promise((resolve, reject) => {
            Axios.post(baseURL + '/api/incReadTime', { id, role }).then(res => {
                resolve(res);
            });
        });
    },
    readHot() {
        return new Promise((resolve, reject) => {
            Axios.get(baseURL + '/api/readHot').then(res => {
                resolve(res);
            });
        });
    },
    commentHot() {
        return new Promise((resolve, reject) => {
            Axios.get(baseURL + '/api/cmtHot').then(res => {
                resolve(res);
            });
        });
    }
};

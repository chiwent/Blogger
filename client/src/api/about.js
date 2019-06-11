import Axios from 'axios';
// 为了让服务端渲染正确请求数据

// if (typeof window === 'undefined') {
//     Axios.defaults.baseURL = 'http://127.0.0.1:8889';
// }

// Axios.defaults.baseURL = 'http://127.0.0.1:8889';
// const baseURL = 'http://127.0.0.1:8889';
const baseURL = 'http://localhost:8889';
export default {
    createAbout(title, content) {
        return Axios.post(baseURL + '/api/about', { title, content });
    },
    getAbout() {
        return Axios.get(baseURL + '/api/about');
    },
    getPublishAbout() {
        return Axios.get(baseURL + '/api/publishAbout');
    },
    saveAbout(about) {
        console.log(about);
        return Axios.patch(baseURL + '/api/about/', about);
    },
    /*
    publishAbout() {
        return Axios.patch('/api/about/', { publish: true });
    },
    notPublishAbout(id) {
        return Axios.patch('/api/about/', { publish: false });
    },
    */
    publishAbout() {
        return Axios.post(baseURL + '/api/publishAbout', { publish: true });
    },
    notPublishAbout() {
        return Axios.post(baseURL + '/api/notPublishAbout', { publish: false });
    },
    deleteAbout() {
        return Axios.delete(baseURL + '/api/about/');
    },
    getAvatar() {
        return new Promise((resolve, reject) => {
            Axios.get(baseURL + '/api/avatar').then(res => {
                resolve(res);
            });
        });
    },
};
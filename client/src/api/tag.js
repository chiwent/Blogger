import Axios from 'axios';
// 为了让服务端渲染正确请求数据

// if (typeof window === 'undefined') {
//     Axios.defaults.baseURL = 'http://127.0.0.1:8889';
// }

// Axios.defaults.baseURL = 'http://127.0.0.1:8889';
// const baseURL = 'http://127.0.0.1:8889';
const baseURL = 'http://localhost:8889';
export default {
    createTag(name) {
        return Axios.post(baseURL + '/api/tags', { name: name });
    },
    getAllTags() {
        return Axios.get(baseURL + '/api/tags');
    },
    getPublishTags() {
        return Axios.get(baseURL + '/api/publishtags');
    },
    modifyTag(id, name) {
        return Axios.patch(baseURL + '/api/tags/' + id, name);
    },
    deleteTag(id) {
        return Axios.delete(baseURL + '/api/tags/' + id);
    },
};

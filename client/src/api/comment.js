import Axios from 'axios';
// 为了让服务端渲染正确请求数据

// if (typeof window === 'undefined') {
//     Axios.defaults.baseURL = 'http://127.0.0.1:8889';
// }

// Axios.defaults.baseURL = 'http://127.0.0.1:8889';
// const baseURL = 'http://127.0.0.1:8889';
const baseURL = 'http://localhost:8889';
export default {
    /**
     * 获取发布的评论
     * @param {String} postId 对应文章的ID
     */
    getPublishComment(postId) {
        return new Promise((resolve, reject) => {
            Axios.get(baseURL + '/api/publishComment?postId=' + postId).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 获取所有评论
     * @param {String} postId 对应的文章ID
     */
    getAllComment(postId) {
        return new Promise((resolve, reject) => {
            Axios.get(baseURL + '/api/comment/?postId=' + postId).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 普通用户发表评论
     * @param {String} postId 文章ID
     * @param {String} content 评论内容
     * @param {String} parent 评论顶层（评论的层级有两级）
     * @param {String} respId 被回复对象的用户ID
     * @param {String} respUser 被回复的用户名
     */
    createComment(postId, content, parent = undefined, respId = undefined, respUser = undefined) {
        // console.log(parent, respId, respUser)
        // debugger
        return new Promise((resolve, reject) => {
            // console.log(postId,  content, parent);
            // debugger
            Axios.post(baseURL + '/api/comment', { postId, content, parent, respId, respUser }).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 管理员发表评论
     * @param {String} postId 文章ID
     * @param {String} content 评论内容
     * @param {String} parent 评论顶层（评论的层级有两级）
     * @param {String} respId 被回复对象的用户ID
     * @param {String} respUser 被回复的用户名
     */
    createAdminComment(postId, content, parent = undefined, respId = undefined, respUser = undefined) {
        // console.log('axios createAdminComment:', postId, content, parent)
        // debugger
        return new Promise((resolve, reject) => {
            Axios.post(baseURL + '/api/acomment', { postId, content, parent, respId, respUser }).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 发表评论
     * @param {String} commentId 评论的ID
     * @param {String} articleId 对应文章的ID
     */
    publishComment(commentId, articleId) {
        return new Promise((resolve, reject) => {
            Axios.post(baseURL + '/api/publishComment', { commentId, articleId }).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 撤销评论
     * @param {String} commentId 评论ID
     * @param {String} articleId 对应文章的ID
     */
    notPublishComment(commentId, articleId) {
        return new Promise((resolve, reject) => {
            Axios.post(baseURL + '/api/unPublishComment', { commentId, articleId }).then(res => {
                resolve(res);
            });
        });
    },
    /**
     * 删除评论
     * @param {String} id 评论ID
     */
    deleteComment(id) {
        return new Promise((resolve, reject) => {
            Axios.delete(baseURL + '/api/comment/' + id).then(res => {
                resolve(res);
            });
        });
    },

}
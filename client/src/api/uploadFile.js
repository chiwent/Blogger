import Axios from 'axios';
const smmsURL = 'https://sm.ms';
const baseURL = 'http://localhost:8889'
export default {
    smmsUpload(file, ssl, format) {
        delete Axios.defaults.headers.common["Authorization"];
        return new Promise((resolve, reject) => {
            Axios.post('/smms/upload', file, ssl, format, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "referer": "https://sm.ms/"
                }
            }).then(res => {
                resolve(res);
            });
        });
    },
    uploadMd(token, form) {
        return new Promise((resolve, reject) => {
            Axios
                .post(baseURL + "/api/uploadmd", form, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: "token " + token
                    }
                }).then(res => {
                    resolve(res);
                });
        });
    },
    showMd(page) {
        return new Promise((resolve, reject) => {
            Axios.get(baseURL + "/api/mdImg?page=" + page).then(res => {
                resolve(res);
            });
        });
    },
    deleteMd(img) {
        return new Promise((resolve, reject) => {
            Axios.post(baseURL + "/api/deletemdImg", { img }).then(res => {
                resolve(res);
            });
        })
    },
    uploadCover(id, img) {
        return new Promise((resolve, reject) => {
            Axios.post(baseURL + "/api/uploadCover", { id, img }).then(res => {
                resolve(res);
            });
        });
    },
    uploadUserAvatar(file) {
        return new Promise((resolve, reject) => {
            Axios.post(baseURL + "/api/addUserAvatar/", file, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then(res => {
                resolve(res);
            });
        })
    }
};

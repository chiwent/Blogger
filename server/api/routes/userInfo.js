import UserInfo from '../../controllers/userinfo_controller.js';
import Email from '../../controllers/email_controller.js';
import verify from '../../middleware/vertifyNormal.js';

const info = new UserInfo();
const email = new Email();

export default async (router) => {
    router.get('/user', verify, info.getUser)
        .get('/userInfo/:id', info.getUserInfo)
        .post('/userInfo', verify, info.postUserInfo)
        .post('/signup', email.signEmail)
        .get('/userMsg', verify, info.getUnReadMsg)
        .post('/userMsg', verify, info.setReadMsg)
    // .patch('/user/:id', verify, info.modifyUser)
};
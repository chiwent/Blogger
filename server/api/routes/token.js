import * as $ from '../../controllers/token_controller.js';

export default async (router) => {

    router.post('/token', $.login);
    router.post('/regist', $.register);
    router.post('/resetAdmin', $.resetAdmin);
    router.post('/registNormal', $.register);
    router.post('/ntoken', $.normalLogin);
    router.post('/sendEmail', $.sendEmail);
    router.post('/resetUser', $.resetUser);
};

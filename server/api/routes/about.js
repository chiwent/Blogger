import About from '../../controllers/about_controller.js';
import verify from '../../middleware/verify.js';

const about = new About();

export default async (router) => {
    router.get('/about', verify, about.getAbout)
        .post('/about', verify, about.createAbout)
        .post('/publishAbout', verify, about.publishAbout)
        .post('/notPublishAbout', verify, about.notPublishAbout)
        .patch('/about', verify, about.modifyAbout)
        .delete('/about', verify, about.deleteAbout)
        .get('/publishAbout', about.getPublishAbout)
        .get('/avatar', about.getAvatar)
};
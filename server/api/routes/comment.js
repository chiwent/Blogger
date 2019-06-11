import Comment from '../../controllers/comment_controller.js';
import verify from '../../middleware/verify.js';
import normalVerify from '../../middleware/vertifyNormal.js';
const comment = new Comment();

export default async (router) => {
    router.get('/comment', verify, comment.getAllComment)
        .post('/comment', normalVerify, comment.createComment)
        .post('/acomment', verify, comment.createAdminComment)
        .get('/publishComment', comment.getPublishComment)
        .delete('/comment/:id', verify, comment.deleteComment)
        .post('/publishComment', verify, comment.publishComment)
        .post('/unPublishComment', verify, comment.unPublishComment)
};

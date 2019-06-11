/*
    const fs = require('fs');
    const path = require('path');
    const formidable = require('formidable');
    import verify from '../../middleware/verify.js';
    const cacheFolder = path.resolve(__dirname, '../../public/img');
    export default async (router) => {
        router.post('/upload', verify, function (req, res, next) {

            console.log('nowpath:', __dirname, cacheFolder);
            if (!fs.existsSync(cacheFolder)) {
                fs.mkdirSync(cacheFolder);
            }

            let form = new formidable.IncomingForm();
            form.encoding = 'utf-8';
            form.uploadDir = cacheFolder;
            form.keepExtensions = true;
            form.maxFieldsSize = 2 * 1024 * 1024;
            form.type = true;
            form.parse(req, function (err, fields, files) {
                if (err) {
                    return res.json(err);
                }
                let extName = '';
                switch (files.file.type) {
                    case 'image/pjpeg':
                        extName = 'jpg';
                        break;
                    case 'image/jpeg':
                        extName = 'jpg';
                        break;
                    case 'image/png':
                        extName = 'png';
                        break;
                    case 'image/x-png':
                        extName = 'png';
                        break;
                }
                if (extName.length === 0) {
                    return res.json({
                        msg: '只支持jpg或png格式图片'
                    });
                } else {
                    let avatarName = new Date() + '.' + extName;
                    let newPath = form.uploadDir + '/' + avatarName;
                    debugger
                    fs.renameSync(files.file.path, newPath);
                    console.log(newPath);
                }
            });
        });
    }
*/


// const path = require('path');
import verify from '../../middleware/verify.js';
import normalVerify from '../../middleware/vertifyNormal.js'
import File from '../../controllers/file_controller.js';
// import User from '../../models/user.js';
import KoaBody from 'koa-body';
const file = new File();
export default async (router) => {
    router.post('/upload', verify, KoaBody({ multipart: true }), async (ctx) => file.uploadAvatar(ctx))
        .post('/uploadmd', verify, KoaBody({
            multipart: true,
            formLimit: "5mb"
        }), async (ctx) => file.uploadMd(ctx))
        .get('/mdImg', verify, file.showImg)
        .post('/deletemdImg', verify, file.deleteImg)
        .post('/addUserAvatar', normalVerify, KoaBody({
            multipart: true,
            formLimit: "2mb"
        }), async (ctx) => file.uploadUserAvatar(ctx))
}


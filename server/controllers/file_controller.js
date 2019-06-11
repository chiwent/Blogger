const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
import User from '../models/user.js';
import { readdir, unlinkSync } from 'fs';
const avatarFolder = path.resolve(__dirname, '../public/avatar');
const mdFolder = path.resolve(__dirname, '../public/markdown');
const userAvatarFolder = path.resolve(__dirname, '../public/normalUser');

function promisify(fn) {
    /**
     * @param {...Any} params The params to pass into *fn*
     * @return {Promise<Any|Any[]>}
     */
    return function promisified(...params) {
        return new Promise((resolve, reject) => fn(...params.concat([(err, ...args) => err ? reject(err) : resolve(args.length < 2 ? args[0] : args)])))
    }
}

function readDirAsync(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, fileList) => {
            if (err) {
                reject(err);
            } else {
                fileList.sort((a, b) => {
                    return b.split('.')[0] - a.split('.')[0];
                });
                resolve(fileList);
            }
        });
    });
}


function deleteFileAsync(file) {
    return new Promise((resolve, reject) => {
        fs.unlink(file, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(file)
            }
        });
    });
}

class FileController {
    constructor() {
        this.fileList = void 0;
    }
    async upload(file, folder) {
        // console.log('file:', file);
        const fileType = file.type;
        let extName = '';
        switch (fileType) {
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
            case 'image/gif':
                extName = 'gif';
                break;
        }
        const fileName = new Date().getTime() + '.' + extName;
        const reader = fs.createReadStream(file.path);
        const upStream = fs.createWriteStream(path.resolve(folder, fileName));
        reader.pipe(upStream);
        return fileName;
    }
    async uploadAvatar(ctx) {
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        if (!fs.existsSync(avatarFolder)) {
            fs.mkdirSync(avatarFolder);
        }
        const file = ctx.request.files.file;
        const fileType = file.type;
        // console.log('File: ', file + '\n')
        const fileName = await this.upload(file, avatarFolder);
        const imgData = fs.readFileSync(file.path);
        const imgBase64 = `data:${fileType};base64,` + imgData.toString('base64');
        const user = await User.findOneAndUpdate({ role: 'admin' }, { avatar: fileName, avatarCode: imgBase64 }).catch(err => {
            console.log(err)
            ctx.throw(500, '服务器内部错误');
        });
        ctx.body = {
            success: true,
            avatar: fileName,
            desc: '上传成功'
        }
    }
    async uploadMd(ctx) {
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        if (!fs.existsSync(mdFolder)) {
            fs.mkdirSync(mdFolder);
        }
        let fileName;
        const file = ctx.request.files.file;
        // const fileName = await this.upload(file, mdFolder);
        try {
            fileName = await this.upload(file, mdFolder)
        } catch (err) {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        }
        ctx.body = {
            success: true,
            mdImg: fileName,
            desc: '上传成功'
        }
    }

    /**
     * 上传普通用户头像
     * @param {Object} ctx  
     */
    async uploadUserAvatar(ctx) {
        let file = ctx.request.files.file;
        let userId = ctx.tokenUid;
        console.log('userId:', userId)
        // console.log('file:', file)
        // console.log('userID:', userId)
        if (!fs.existsSync(userAvatarFolder)) {
            fs.mkdirSync(userAvatarFolder);
        }
        let fileName;
        try {
            fileName = await this.upload(file, userAvatarFolder);
        } catch (err) {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        }
        // console.log('fileName:', fileName)
        const normalUser = await User.findByIdAndUpdate(userId, { avatar: fileName }).catch(err => {
            console.error(err)
            ctx.throw(500, '服务器内部错误');
        });
        // console.log('normalUser:', normalUser)
        ctx.body = {
            success: true,
            fileName,
            desc: '上传成功'
        }
    }

    async showImg(ctx) {
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        let page = ctx.query.page; // 页数
        const limit = 16;
        let begin, end;
        let fileList;
        // const readdirAsync = promisify(fs.readdir);
        if (page < 1 || !page) {
            page = 1;
        }
        if (page > 1) {
            begin = (page - 1) * limit;
            end = page * limit;
        } else {
            begin = 0;
            end = limit;
        }
        if (!fs.existsSync(mdFolder)) {
            fs.mkdirSync(mdFolder);
        }
        try {
            fileList = await readDirAsync(mdFolder);
        } catch (err) {
            console.error(err);
            ctx.throw(500, '服务器内部错误');
        }
        ctx.body = {
            success: true,
            mdImg: fileList.slice(begin, end),
            totalSize: fileList.length,
            desc: '读取相册成功'
        }
    }
    async deleteImg(ctx) {
        if (ctx.tokenRole !== 'admin') {
            ctx.throw(401, '非管理员用户');
        }
        let img = ctx.request.body.img;
        // console.log('IMG :', img)
        img = path.resolve(mdFolder, img);
        // console.log('img:', img)
        const stat = fs.statSync(img);
        if (stat.isFile()) {
            try {
                img = await unlinkSync(img);
            } catch (err) {
                console.error(err);
                ctx.throw(500, '服务器内部错误');
            }
            ctx.body = {
                success: true,
                mdImg: img,
                desc: '删除图片成功'
            }
        } else {
            ctx.body = {
                success: false,
                desc: '删除图片失败'
            }
        }
    }

}

export default FileController;
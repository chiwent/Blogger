import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const aboutSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: '关于我'
    },
    content: {
        type: String,
        required: true,
        default: '还没想好要写什么...'
    },
    publish: {
        type: Boolean,
        default: false,
    },
    /*
    publishTime: {
        type: Date
    }*/
    /*
    createTime: {
        type: Date,
    },
    lastEditTime: {
        type: Date,
        default: Date.now,
    }
    */
}, { versionKey: false });
aboutSchema.set('toJSON', { getters: true, virtuals: true });
aboutSchema.set('toObject', { getters: true, virtuals: true });
/*
aboutSchema.path('createTime').get(function (v) {
    return moment(v).format('lll');
});
articleSchema.path('lastEditTime').get(function (v) {
    return moment(v).format('lll');
});
*/
module.exports = mongoose.model('about', aboutSchema);
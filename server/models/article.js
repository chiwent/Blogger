import mongoose from 'mongoose';
import moment from 'moment';
moment.locale('zh-cn');
const Schema = mongoose.Schema;
const articleSchema = new Schema({
    title: String,
    content: String,
    abstract: String,
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'tag',
    }],
    comment: [{
        type: Schema.Types.ObjectId,
        ref: 'comment'
    }],
    publish: {
        type: Boolean,
        default: false,
    },
    createTime: {
        type: Date,
    },
    lastEditTime: {
        type: Date,
        default: Date.now,
    },
    readTime: {
        type: Number,
        default: 0
    },
    readCount: {
        type: Number,
        default: 0,
        max: 999,
        min: 0
    },
    commentCount: {
        type: Number,
        default: 0,
        max: 999,
        min: 0
    },
    coverImg: {
        type: String
    }
}, { versionKey: false });
articleSchema.set('toJSON', { getters: true, virtuals: true });
articleSchema.set('toObject', { getters: true, virtuals: true });
articleSchema.path('createTime').get(function (v) {
    return moment(v).format('lll');
});
articleSchema.path('lastEditTime').get(function (v) {
    return moment(v).format('lll');
});
module.exports = mongoose.model('article', articleSchema);
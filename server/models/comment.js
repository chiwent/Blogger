import mongoose from 'mongoose';
import moment from 'moment';
moment.locale('zh-cn');
const Schema = mongoose.Schema;
const commentSchema = new Schema({
    // 对应的文章ID
    postId: {
        type: String,
        required: true
    },
    /*
    user: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
    }],
    */
    /*
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    */
    // 用户ID
    uid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, validate: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/ },
    content: String,
    // 状态 0待审核 1通过 2删除(暂时不设置此状态)
    state: { type: Number, default: 1 },
    createTime: {
        type: Date
    },
    userIP: {
        type: String
    },
    publishTime: {
        type: Date,
    },
    // 评论的用户名
    fromUser: {
        type: String
    },
    // 回复的楼层的ID(一级评论的_id)
    parent: String,
    // 回复某人的ID(用户的ID)
    respId: String,
    // 回复某人的用户名(用户名)
    respUser: String,
    // 是否已读
    readStatus: {
        type: String,
        default: false
    }
}, { versionKey: false });
commentSchema.set('toJSON', { getters: true, virtuals: true });
commentSchema.set('toObject', { getters: true, virtuals: true });
commentSchema.path('createTime').get(function (v) {
    return moment(v).format('lll');
});
commentSchema.path('publishTime').get(function (v) {
    return moment(v).format('lll');
});
module.exports = mongoose.model('comment', commentSchema);

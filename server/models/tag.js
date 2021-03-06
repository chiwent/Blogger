import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const tagSchema = new Schema({
    name: {
        type: String,
        default: '',
    },
    publish: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 0
    }
}, { versionKey: false });
tagSchema.set('toJSON', { getters: true, virtuals: true });
tagSchema.set('toObject', { getters: true, virtuals: true }); // 普通+虚拟

module.exports = mongoose.model('tag', tagSchema);

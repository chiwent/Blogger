import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const codeSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    effTime: {
        type: Date,
        required: true
    }
}, { versionKey: false });
codeSchema.set('toJSON', { getters: true, virtuals: true });
codeSchema.set('toObject', { getters: true, virtuals: true });
module.exports = mongoose.model('code', codeSchema);
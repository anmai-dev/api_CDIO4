const { Timestamp } = require('bson');
const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    useURL: {
        type: Boolean,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    videoFile: {
        type: String,
        required: function () {
            return !this.useURL;
        },
    },
    videoURL: {
        type: String,
        required: function () {
            return this.useURL;
        },
    },
    category: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        required: false
    },
    comment: {
        type: String,
        required: false,
    },
    tags: [String],
    duration: Number,
    isPublic: {
        type: Boolean,
        default: true,
    },
}
    , { timestamps: true });
module.exports = mongoose.model('Video', videoSchema)
const Video = require('../models/Videos');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const videoControllers = {

    // tong quat -------------------------------------------

    getAllVideo: async (req, res) => { // danh sach phim
        try {
            const allVideo = await Video.find();
            return res.status(200).json(allVideo);
        } catch (error) {
            console.error("Error getting videos:", error);
            return res.status(500).json({ message: "getallvideo Failed", error: error.toString() });
        }
    },
    searchMovies: async (req, res) => { // tim kiếm phim
        try {
            const keyword = req.query.keyword || "";

            const videoSearch = await Video.find({
                title: { $regex: keyword, $options: "i" }
            });

            res.status(200).json({
                success: true,
                data: videoSearch
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi server"
            });

        }
    },
    detailsVideos: async (req, res) => { // chi tiết phim
        try {
            const id = req.params.id;
            const videoDetails = await Video.findById(id);
            res.status(200).json({
                success: true,
                data: videoDetails
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi server"
            });
        }
    },
    commentMovies: async (req, res) => {
        try {

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi server",
                message: error
            })
        }
    },
    reviewMoviesById: async (req, res) => {
        try {

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi server",
                message: error
            })
        }
    },




    // admin --------------------------------------------
    createVideo: async (req, res) => { // tao phim
        try {
            console.log("req.body:", req.body);
            console.log("req.files:", req.files);

            const { title, videoURL, useURL } = req.body;
            const isUseURL = useURL === 'true' || useURL === true;

            if (!title) {
                return res.status(400).json({ message: 'Missing title' });
            }

            let thumbnailPath = null;
            let videoFilePath = null;

            if (req.files && req.files.thumbnail) {
                const thumbnail = req.files.thumbnail;

                try {
                    const result = await cloudinary.uploader.upload(thumbnail.tempFilePath, {
                        folder: 'image_video_project/thumbnails',
                        resource_type: 'image'
                    });
                    thumbnailPath = result.secure_url;
                    console.log(`Thumbnail uploaded to Cloudinary: ${thumbnailPath}`);

                    if (fs.existsSync(thumbnail.tempFilePath)) {
                        fs.unlinkSync(thumbnail.tempFilePath);
                    }
                } catch (fileError) {
                    console.error("Error uploading thumbnail to Cloudinary:", fileError);
                    return res.status(500).json({
                        message: "Error uploading thumbnail to Cloudinary",
                        error: fileError.toString()
                    });
                }
            } else {
                return res.status(400).json({ message: 'No thumbnail uploaded' });
            }
            if (!isUseURL) {
                if (req.files && req.files.video) {
                    const videoFile = req.files.video;


                    console.log("Video file info:", {
                        name: videoFile.name,
                        size: videoFile.size,
                        mimetype: videoFile.mimetype,
                        md5: videoFile.md5,
                        tempFilePath: videoFile.tempFilePath
                    });


                    try {
                        const result = await cloudinary.uploader.upload(videoFile.tempFilePath, {
                            folder: 'image_video_project/videos',
                            resource_type: 'video'
                        });
                        videoFilePath = result.secure_url;
                        console.log(`Video uploaded to Cloudinary: ${videoFilePath}`);


                        if (fs.existsSync(videoFile.tempFilePath)) {
                            fs.unlinkSync(videoFile.tempFilePath);
                        }
                    } catch (fileError) {
                        console.error("Error uploading video to Cloudinary:", fileError);


                        if (thumbnailPath && thumbnailPath.includes('cloudinary.com')) {
                            try {
                                const publicId = thumbnailPath.split('/').slice(-2).join('/').split('.')[0];
                                await cloudinary.uploader.destroy(publicId);
                            } catch (deleteError) {
                                console.error("Error deleting thumbnail from Cloudinary:", deleteError);
                            }
                        }

                        return res.status(500).json({
                            message: "Error uploading video to Cloudinary",
                            error: fileError.toString()
                        });
                    }
                } else {
                    return res.status(400).json({ message: 'No video file uploaded' });
                }
            } else if (!videoURL) {
                return res.status(400).json({ message: 'No video URL provided' });
            }
            const newVideo = new Video({
                thumbnail: thumbnailPath,
                title,
                useURL: isUseURL,
                videoFile: isUseURL ? null : videoFilePath,
                videoURL: isUseURL ? videoURL : null,
                views: 0,
                isPublic: true,
            });
            const video = await newVideo.save();
            return res.status(200).json(video);
        } catch (error) {
            console.error("Error creating video:", error);
            return res.status(500).json({ message: "Internal server error", error: error.toString() });
        }
    },

    deleteVideo: async (req, res) => {
        try {
            const { id } = req.params;


            const video = await Video.findById(id);
            if (!video) {
                return res.status(404).json({ message: "Video not found" });
            }


            if (video.thumbnail) {
                const thumbnailPath = path.join(__dirname, '../../../', video.thumbnail);
                if (fs.existsSync(thumbnailPath)) {
                    fs.unlinkSync(thumbnailPath);
                }
            }


            if (video.videoFile) {
                const videoPath = path.join(__dirname, '../../../', video.videoFile);
                if (fs.existsSync(videoPath)) {
                    fs.unlinkSync(videoPath);
                }
            }
            await Video.findByIdAndDelete(id);
            return res.status(200).json({ message: "Video deleted successfully", id });
        } catch (error) {
            console.error("Error deleting video:", error);
            return res.status(500).json({ message: "Internal server error", error: error.toString() });
        }
    }
};



module.exports = videoControllers;
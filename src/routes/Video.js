const route = require('express').Router();
const videoControllers = require("../controllers/videoControllers")
const middlewareVerify = require('../controllers/middlewareControllers')



route.post("/", middlewareVerify.verifyTokenAdmin, (req, res, next) => {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    next();
}, videoControllers.createVideo);

route.get("/", videoControllers.getAllVideo)

route.delete("/:id", middlewareVerify.verifyTokenAdmin, videoControllers.deleteVideo)
route.get("/search", videoControllers.searchMovies);
route.post("/comment", videoControllers.commentMovies);
route.post("/reviewMovies", videoControllers.reviewMoviesById)



module.exports = route
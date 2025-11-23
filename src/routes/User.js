const route = require('express').Router();
const userControllers = require('../controllers/userControllers');
const middlewareVerify = require("../controllers/middlewareControllers");


//get all users
route.get("/getall", userControllers.getAllusers);
route.get("/:id", userControllers.getUserById)
// delete user
route.delete('/delete/:id', userControllers.deleteUser);
// update user
route.put("/:id", middlewareVerify.verifyTokenAndAdmin, userControllers.updateUser)


module.exports = route;
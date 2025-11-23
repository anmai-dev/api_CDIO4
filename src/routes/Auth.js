const route = require('express').Router();
const authControllers = require('../controllers/authControllers');

// register
route.post("/register", authControllers.register);

// login
route.post("/login", authControllers.login);




module.exports = route;
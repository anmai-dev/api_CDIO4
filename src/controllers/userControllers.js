const User = require("../models/users");
const CryptoJS = require('crypto-js');


const userControllers = {
    //get all users
    getAllusers: async (req, res) => {
        try {
            const allUsers = await User.find();


            if (!allUsers || allUsers.length === 0) {
                console.log('No users found');
                return res.status(404).json({ message: 'No users found' });
            }

            console.log('Sending users data');
            return res.status(200).json(allUsers);
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },
    //delete user
    deleteUser: async (req, res) => {
        console.log("req", req.headers)
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json(user)

        } catch (error) {
            res.status(500).json(error)

        }
    },
    // get user by id
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
            res.status(200).json(user)

        } catch (error) {
            res.status(500).json(error)

        }
    },
    // update user
    updateUser: async (req, res) => {

        try {
            const updateUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
            return res.status(200).json("User đã được cập nhật thành công !")

        } catch (error) {
            return res.status(500).json(error)
        }
    }

}



module.exports = userControllers;



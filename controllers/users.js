const express= require('express');
const router= express.Router();
const verifyToken = require('../middleware/verify-token');


const User= require('../models/user');

router.get('/:userId', verifyToken, async (req, res) => {
    try{
        if(req.user._id !== req.params.userId) {
            return res.status(403).json({ error: 'Access denied.' });
        }
        const user= await User.findById(req.params.userId, "username");
        res.json(user);
        if(!user) {
            throw new Error('User not found.');
        }
    } catch (err) {
        res.status(500).json({ err: err.message });   
    }
});

module.exports = router;
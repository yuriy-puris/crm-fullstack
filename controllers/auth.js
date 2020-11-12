const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const keys = require('../config/keys');
const errorHandler = require('../utils/errorHandler');


module.exports.login = async (req, res) => {
    
    const candidate = await User.findOne({ email: req.body.email });
    if ( candidate ) {
        const passwordResult = bcryptjs.compareSync(req.body.password, candidate.password);
        if ( passwordResult ) {
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, { expiresIn: 60 * 60 });

            res.status(200).json({
                token: `Bearer ${token}`
            });
        } else {
            res.status(401).json({
                message: 'Password not match'
            });
        }
    } else {
        res.status(404).json({
            message: 'User not found'
        });
    }

};

module.exports.register = async (req, res) => {
    
    const candidate = await User.findOne({ email: req.body.email });

    if ( candidate ) {
        // 409 - conflict
        res.status(409).json({
            message: 'User with this email already exist'
        })
    } else {
        const salt = bcryptjs.genSaltSync(10);
        const password = req.body.password;
        const user = new User({
            email: req.body.email,
            password: bcryptjs.hashSync(password, salt)
        });
        try {
            await user.save();
            // 201 - created
            res.status(201).json(user);
        } catch (err) {
            errorHandler(res, err);
        }
    }

};
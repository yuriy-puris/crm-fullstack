const { ExtractJwt, Strategy } = require('passport-jwt');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');


const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.jwt
}

module.exports = passport => {
    passport.use(
        new Strategy(options, async (payload, done) => {
            try {
                const user = await User.findById(payload.userId).select('email id');
                if ( user ) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            } catch(err) {
                console.log(err)
            }
        })
    )
}
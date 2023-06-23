const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByUsername) {
    const authenticateUser = async (username, password, done) => {
        const user = getUserByUsername(username);
        if (user == null) {
            return done(null, false, { message: "No user with that username" });
        }
        if (password === user.password) {
            return done(null, user);
        } else {
            return done(null, false, { message: "Password incorrect" });
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.username));
    passport.deserializeUser((username, done) => {
        return done(null, getUserByUsername(username));
    });
}

module.exports = initialize;
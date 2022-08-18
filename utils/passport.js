var localStrategy = require('passport-local').Strategy;
var models = require('./cassandra');
var bcrypt = require('bcrypt');

module.exports = function(passport) {
    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async function(email, password, done) {
        try {
            const user = await models.instance.User.findOneAsync({email: email});
            if (!user) {
                return done(null, false, {message: 'User not found'});
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, {message: 'Incorrect password'});
            }
            else {
                return done(null, user);
            }
        }
        catch (err) {
            console.log(err);
            return done(err, false);
        }
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });
    passport.deserializeUser(async function(email, done) {
        try {
            const user = await models.instance.User.findOneAsync({email: email});
            if (user) {
                done(null, {email: user.email, name: user.name, role: user.role});
            }
        }
        catch (err) {
            console.log(err);
            done(err, false);
        }
    });
}
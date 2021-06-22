const wrapAsync = require('../utilities/wrapAsync');
const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.register = wrapAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email is already registered.');
            return res.redirect('/campgrounds');
        }
        const user = new User({ email, username });
        const newUser = await User.register(user, password);
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/user/register');
    }
});

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

module.exports.authenticate = passport.authenticate('local', {
    failureFlash: 'Invalid username or password.',
    failureRedirect: '/user/login'
});
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You have logged out.');
    res.redirect('/campgrounds');
};
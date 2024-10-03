const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//SIGNUP
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async(req, res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to PG for Peeps!");
            res.redirect("/listings");
        });
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    } 
}));


//LOGIN
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post(
    "/login", 
    saveRedirectUrl,
    passport.authenticate("local", 
    { failureRedirect: "/login", failureFlash: true }),
    async(req, res) => {
    req.flash("success", "Welcome back to PG for Peeps!");
    let redirectUrl = res.locals.redirect || "/listings";
    res.redirect(redirectUrl);
});


//LOGOUT
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;
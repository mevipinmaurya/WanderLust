const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync")
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");


router.route("/signup")
    .get(userController.getSignup)
    .post(wrapAsync(userController.postSignup))


router.route("/login")
    .get(userController.userGetLogin)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.userPostLogin)

router.get("/logout", userController.userLogout);

module.exports = router;
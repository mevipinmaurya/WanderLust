const express = require("express");
const router = express.Router({mergeParams : true});
const Listing = require("../models/listing.js"); 
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
// For server side validation (joi)
const {reviewSchema} = require("../schema.js");
const { isLoggedIn } = require("../middleware.js");
const reviewController = require("../controllers/review.js");


// For review validation
const validateReview = (req, res, next) => {
    let result = reviewSchema.validate(req.body);
    console.log(result);
    if (result.error) {
        throw new ExpressError(400, result.error);
    } else {
        next();
    }
}


// Post Review route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.postReview))


// Delete Review Route
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.destroyReview));


module.exports = router;

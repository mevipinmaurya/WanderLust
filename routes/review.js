const express = require("express");
const router = express.Router({mergeParams : true});
const Listing = require("../models/listing.js"); 
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
// For server side validation (joi)
const {reviewSchema} = require("../schema.js");
const { isLoggedIn } = require("../middleware.js");


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
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    // let { rating: newRating, comment: newComment } = req.body.review;
    let newReview = new Review(req.body.review)
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    // console.log("Review saved");
    // res.send("Review Saved");

    req.flash("success", "New Review Added !");
    res.redirect(`/listings/${id}`);
}))


// Delete Review Route
router.delete("/:reviewId", isLoggedIn, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    let isReviewAuthor = await Review.findById(reviewId);
    if (!isReviewAuthor.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted !");
    res.redirect(`/listings/${id}`);
}))


module.exports = router;

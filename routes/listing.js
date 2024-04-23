const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
// For server side validation (joi)
const { listingSchema } = require("../schema.js");




// For listings schema validation
const validateListing = (req, res, next) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
        throw new ExpressError(400, result.error);
    } else {
        next();
    }
}


// Index route
router.get("/", wrapAsync(async (req, res) => {
    let allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
}))

// new route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
})

// Create route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created !");
    res.redirect("/listings");
}))


// edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}))

// update route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { title: newTitle, description: newDes, price: newPrice, image: newImg, location: newLoc, country: newCount } = req.body.listing;
    await Listing.findByIdAndUpdate(id, {
        title: newTitle,
        description: newDes,
        price: newPrice,
        image: newImg,
        location: newLoc,
        country: newCount,
    })
    req.flash("success", "Listing Updated !");
    res.redirect(`/listings/${id}`);
}))

// Destroy route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
}))


// show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Requested listings does not exist !!!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}))


module.exports = router;
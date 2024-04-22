const express = require("express");
const app = express()
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");

// For server side validation (joi)
const listingSchema = require("./schema.js");
const reviewSchema = require("./schema.js");

const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, "/public")))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"));


main().then(() => {
    console.log("Connection Successfull")
}).catch((err) => {
    console.log("Some error has occured !!!");
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new villa",
//         discription: "By the beach",
//         price: 1200,
//         location: "Caligute, Goa",
//         country: "India",
//     })

//     await sampleListing.save();

//     res.send("Sample Listing is created")
// })


// For schema validation
const validateListing = (req, res, next) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
        throw new ExpressError(400, result.error);
    } else {
        next();
    }
}

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


// Index route
app.get("/listings", wrapAsync(async (req, res) => {
    let allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
}))

// new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

// Create route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    let { title: newTitle, description: newDesc, image: newImg, price: newprice, location: newLoc, country: newCount } = req.body;
    const newListing = new Listing({
        title: newTitle,
        description: newDesc,
        image: newImg,
        price: newprice,
        location: newLoc,
        country: newCount
    })

    // ***************** Schema Validation ********************
    // if(!newListing.title){
    //     throw new ExpressError(400, "Title is missing");
    // }

    // if(!newListing.description){
    //     throw new ExpressError(400, "Description is missing");
    // }

    // if(!newListing.location){
    //     throw new ExpressError(400, "Location is missing");
    // }

    // if(!newListing.country){
    //     throw new ExpressError(400, "Country is missing");
    // }

    // if(!newListing.price){
    //     throw new ExpressError(400, "Price is missing");
    // }

    await newListing.save();
    res.redirect("/listings");
}))

// edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}))

// update route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { title: newTitle, description: newDes, price: newPrice, image: newImg, location: newLoc, country: newCount } = req.body;
    await Listing.findByIdAndUpdate(id, {
        title: newTitle,
        description: newDes,
        price: newPrice,
        image: newImg,
        location: newLoc,
        country: newCount,
    })
    res.redirect(`/listings/${id}`);
}))

// Destroy route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))


// Review 
// Post Review route
app.post("/listings/:id/review", validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let { rating: newRating, comment: newComment } = req.body;
    let newReview = new Review({
        comment: newComment,
        rating: newRating,
    })

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    // console.log("Review saved");
    // res.send("Review Saved");

    res.redirect(`/listings/${id}`);
}))


// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))


// show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}))


app.get("/", (req, res) => {
    res.send("Building a major Project")
})


// Below code will match all route to the entered route if match found then response will be send otherwise page Not found error occur
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found !!!"));
})


// Middleware (Error Handling)
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong !!!" } = err;
    // res.send("Something Went Wrong !!!");
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message });
})

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
})
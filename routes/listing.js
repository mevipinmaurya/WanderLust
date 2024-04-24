const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
// For server side validation (joi)
const { listingSchema } = require("../schema.js");
const { isLoggedIn } = require("../middleware.js");

const { storage } = require("../cloudConfig.js");

const multer = require('multer')
const upload = multer({ storage })


const listingController = require("../controllers/listing.js");


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

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing))
// .post(upload.single("listing[image]"), (req, res) => {
//     res.send(req.file);
// })

// new route
router.get("/new", isLoggedIn, listingController.newListing);

router.route("/:id")
    .put(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, wrapAsync(listingController.destroyListing))
    .get(wrapAsync(listingController.showListing))



// edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.editListing));



module.exports = router;
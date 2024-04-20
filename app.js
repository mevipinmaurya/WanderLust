const express = require("express");
const app = express()
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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


// Index route
app.get("/listings", async (req, res) => {
    let allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
})

// new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

// Create route
app.post("/listings", async (req, res) => {
    let { title: newTitle, description: newDesc, image: newImg, price: newprice, location: newLoc, country: newCount } = req.body;
    const newListing = new Listing({
        title: newTitle,
        description: newDesc,
        image: newImg,
        price: newprice,
        location: newLoc,
        country: newCount
    })

    await newListing.save();
    res.redirect("/listings");
})

// edit route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})

// update route
app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;
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
})

// Destroy route
app.delete("/listings/:id", async (req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})


// show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
})


app.get("/", (req, res) => {
    res.send("Building a major Project")
})

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
})
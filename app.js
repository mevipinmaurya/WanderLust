const express = require("express");
const app = express()
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


// Requiring all routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const path = require("path");
const session = require("express-session");
const flash = require("express-flash");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, "/public")))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"));

// Creating Session (express-session)
const sessionOptions = {
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
}


app.get("/", (req, res) => {
    res.send("Building a major Project")
})


app.use(session(sessionOptions))
// Creating flash (connect-flash) (use after session)
app.use(flash());

// Passport section
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;       // Stores the details of the loggedIn users
    next();
})



// // Demo user
// app.get("/demouser", async (req, res)=>{
//     let fakeUser = new User({
//         email : "abc@gmail.com",
//         username : "abcd",
//     });

//     let registeredUser = await User.register(fakeUser, "helloWorld");
//     res.send(registeredUser);
// })



// Database Connection code
main().then(() => {
    console.log("Connection Successfull")
}).catch((err) => {
    console.log("Some error has occured !!!");
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}



// using listings router
app.use("/listings", listingRouter);
// using review router
app.use("/listings/:id/reviews", reviewRouter);
// Using user router
app.use("/", userRouter)




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
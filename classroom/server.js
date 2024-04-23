const express = require("express");
const app = express();

const session = require("express-session");
const flash = require("express-flash");

const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
    secret: "mysecretstring",
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());


// Middleware
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
})

app.get("/register", (req, res) => {
    let { name = "anonymous" } = req.query;
    req.session.name = name;
    // req.flash("success", "User registered successfully");

    if (name === "anonymous") {
        req.flash("error", "User not registered");
    } else {
        req.flash("success", "User registered successfully");
    }
    res.redirect("/hello");
})

app.get("/hello", (req, res) => {
    res.render("page.ejs", { name: req.session.name });
})




// app.get("/reqcount", (req, res) => {
//     if (req.session.count) {
//         req.session.count++;
//     } else {
//         req.session.count = 1;
//     }
//     res.send(`You sent a request ${req.session.count} times`);
// })

// app.get("/test", (req, res) => {
//     res.send("I am root")
// })


// const cookieParser = require("cookie-parser");

// app.use(cookieParser());

// app.get("/setcookies", (req, res)=>{
//     res.cookie("greet", "hello");
//     res.cookie("name", "vipin");
//     res.send("We sent you a cookie");
// });

// app.get("/greet", (req, res)=>{
//     let {name, greet} = req.cookies;
//     res.send(`${greet} ${name}`);
// })

// app.get("/", (req, res)=>{
//     console.dir(req.cookies);
//     res.send("i'm root");
// })

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})
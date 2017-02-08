var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    User = require("./models/user"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

var app = express();
mongoose.connect("mongodb://localhost/auth_demo_app");

app.use(express.static(__dirname + "/public"));

var port = 3000;

app.use(require("express-session")({
    secret: "Amma is the Divine Mother of the universe",
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============================
//ROUTES
//============================


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/secret", isLoggedIn, function (req, res) {
    res.render("secret");
});

//Authentication Route

//sign up (register form)
app.get("/register", function (req, res) {
    res.render("register");
});

//handling user sign up
app.post("/register", function (req, res) {
    //User.register can be used because we have passport-local-mongoose - see user.js
    User.register(new User( {username : req.body.username}), req.body.password, function (err, User) {
        if(err){
            console.log(err);
            res.render("/register");
        } else {
            //local strategy
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secret");
            })
        }
    });
});

//LOGIN Routes
app.get("/login", function (req, res) {
    res.render("login");
});

//login logic with middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function (req, res) {
});


//logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//passport method isAuthenticated
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(port, function () {
    console.log("AuthDemo sever running at port: " + port);
});
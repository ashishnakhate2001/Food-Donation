require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const ejs = require("ejs");
const mongoose = require('mongoose');
const path = require('path');
const jwt = require("jsonwebtoken");
const cookieParser= require("cookie-parser");

const homeStartingContent = "This is the food description";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

let port = process.env.PORT || 3000;

let img="";
let id="";
let button ="login"
//Image upload multer
const storage = multer.diskStorage({
    // Destination to store image
    destination:(req, file, cb)=>{
      cb(null, 'public/FDimg')
    },
    filename:(req, file, cb) => {
      // console.log(file)       //It show the image property in console
      img = file.originalname;
      cb(null, file.fieldname + '_' +file.originalname)
    }
});
const upload = multer({storage: storage})



app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://ashish:ashish123@cluster0.oixe4rc.mongodb.net/fDB');



// fruit
const fruitSchema = new mongoose.Schema({
  name: String,
  rating: Number
});

const Fruit = mongoose.model("Fruit", fruitSchema);

// Donation Schema
const donationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  food: String,
  foodN: String,
  address: String,
  image: String,
  status: String
});



const Donation = mongoose.model("Donation", donationSchema);

// Register User Schema
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  phone: Number,
  password: String,
  tokens: [{
    token:{
      type:String,
      required:true
    }
  }],
  Doners:[{donationSchema}]
});
userSchema.methods.generateToken = async function(){
  try {
    console.log(this._id.toString());
    const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({token:token});
    await this.save();
      return token;

  } catch (e) {
    console.log("error");
  }
}

const User = mongoose.model("User", userSchema);



const auth = async (req, res, next)=>{
  try {
    const token = req.cookies.jwt;
    const verifyUser =await jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifyUser);
    const user = await User.findOne({_id:verifyUser._id});
console.log("testing.......................................");
   console.log(user._id.toHexString());


   req.token = token;
   req.user = user;

   // storing id of user
   id= user._id;
   button = "logout";

    next();

  } catch (e) {
    console.log("cookies error")
    button = "login"
  }
}


// Routing code of ejs
app.get("/", function(req, res) {
  Donation.find({}, function(err, donations){
  res.render("home", {
    button:button,
    startingContent: homeStartingContent,
    donations: donations

    });
});
});


app.get("/login", function(req, res) {
  res.render("login")
});


app.get("/signup", function(req, res) {
  res.render("signup")
});


app.get("/recive-food",auth , async function(req, res) {

  Donation.find({}, function(err, donations){
  res.render("receive-food", {
    startingContent: homeStartingContent,
    donations: donations,
    button: button
    });
});
});


app.get("/donate-food",auth ,async function(req, res) {
    await console.log(req.cookies.jwt);
  res.render("donate-food")
});

app.get("/profile", async function(req, res) {
     const userDetails = await User.findOne({_id: id});
  res.render("profile", {
    userDetails : userDetails
    });
});


app.get("/Guest", function(req, res) {
 User.find({}, function(err, users){
  res.render("Guest", {
    users: users

    });
  });
});








app.get("/logout",auth ,async function(req, res) {
  try {

req.user.tokens = req.user.tokens.filter((currElement)=>{
  return currElement.token != req.token
})
    button = "login";

    res.clearCookie("jwt");
    console.log("logout successfully")
    await req.user.save();
    res.render("login")

  } catch (e) {
    console.log("logout page error")
  }
});


//donate food form
app.post("/donate-food", upload.single("image"),async function(req, res) {
// passing data from donate food to app.js
  const donation =await new Donation ({
    name: req.body.customer_name,
    email: req.body.email_address,
    phone: req.body.phone_number,
    food: req.body.food_type,
    foodN: req.body.food_name,
    address: req.body.doner_address,
    image: img,
    status: "click to need"
  });



  donation.save();
  console.log(donation);
  User.findOne({_id: id}, function(err, foundonation){
    if(err){
      console.log("food donation error")
    }else{
      //food donation listing save in user database
        foundonation.Doners.push(donation);
        foundonation.save();
      }
  });
  console.log(donation);
  res.redirect("/recive-food");
});


//Register user form
app.post("/signup", async function(req, res) {
try {


  const register = await new User ({
    name: req.body.rname,
    username:req.body.rusername,
    email: req.body.remail,
    phone: req.body.rphone,
    password: req.body.rpassword,
  });
console.log("the success part" + register);
  const token = await register.generateToken();
  console.log("the token part" + token);
  res.cookie("jwt", token, {
   //expires:new Date(Date.now() + 6000000000),
  expiresIn: '24h',
  httpOnly : true
  });
  // console.log(Cookie);

  register.save();
  button = "logout"
  res.redirect("/");
} catch (e) {
  console.log("the error part of signup page");
}
});



//Register user form
app.post("/login",async function(req, res) {

const email = req.body.lemail;
const password = req.body.lpassword;

const useremail = await User.findOne({email:email});

if(useremail.email === email && useremail.password === password){
  const token = await useremail.generateToken();
  console.log("the token part" + token);
  res.cookie("jwt", token, {
  // expires:new Date(Date.now() + 30000),
  expiresIn: '2d',
  httpOnly : true
  });



  console.log("log in success full");
  // cookies save and signout button enable
  button = "logout"
  res.redirect("/");
}
else{
  console.log("email or password not same");
  res.redirect("/login");
}

});






app.listen(port, function() {
  console.log("Server has started successfully");
});

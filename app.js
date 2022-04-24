const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const ejs = require("ejs");
const mongoose = require('mongoose');
const path = require('path');

const homeStartingContent = "This is the food description";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();


let img="";
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

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/fDB');



// fruit
const fruitSchema = new mongoose.Schema({
  name: String,
  rating: Number
});

const Fruit = mongoose.model("Fruit", fruitSchema);



// people
const peopleSchema = new mongoose.Schema({
  userid: String,
  password: [String]
});

const People = mongoose.model("People", peopleSchema);


// data input of fruit and people
// const p = new Fruit ({
//   name:"Ashish",
//   rating: "1"
// });
//
// p.save();
//
// const a = new Fruit ({
//   name:"Ashish",
//   rating: "2"
// });
//
// a.save();
// const b = new Fruit ({
//   name:"Ashish",
//   rating: "2"
// });
//
// b.save();
//
// const people = new People ({
//   userid:"ashish123",
//   password: p
// });
//
// people.save();


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
  password: String
});
const User = mongoose.model("User", userSchema);



// Routing code of ejs
app.get("/", function(req, res) {
  Donation.find({}, function(err, donations){
  res.render("home", {
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

app.get("/recive-food", function(req, res) {
  Donation.find({}, function(err, donations){
  res.render("receive-food", {
    startingContent: homeStartingContent,
    donations: donations
    });
});
});

app.get("/donate-food", function(req, res) {
  res.render("donate-food")
});

app.get("/Guest", function(req, res) {
  res.render("Guest")
});



//donate food form
app.post("/donate-food", upload.single("image"), function(req, res) {

  const donation = new Donation ({
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
  res.redirect("/recive-food");
});


//Register user form
app.post("/signup", async function(req, res) {

  const user = await new User ({
    name: req.body.rname,
    username:req.body.rusername,
    email: req.body.remail,
    phone: req.body.rphone,
    password: req.body.rpassword,
  });

  user.save();
  console.log(user);
  res.redirect("/");
});


app.post("/login", function(req, res) {

  User.findOne({name: "Ashish"},function(err, users){
  if(err){
    console.log(err);
  }else{
if(users.email === req.body.lemail && users.password === req.body.lpassword){
  console.log("okkkkkkkkk");
  // cookies save and signout button enable
  
  res.redirect("/");
}
else{
  console.log("email or password not same");
  res.redirect("login");
}

  }
 });


});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

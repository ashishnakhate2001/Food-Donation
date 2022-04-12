const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const homeStartingContent = "This is the food description";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

var posts = [];


app.get("/", function(req, res) {
  res.render("home")
});

app.get("/recive-food", function(req, res) {
  res.render("receive-food", {
    startingContent: homeStartingContent,
    posts: posts
  })
});

app.get("/donate-food", function(req, res) {
  res.render("donate-food")
});

app.get("/Guest", function(req, res) {
  res.render("Guest")
});


app.post("/donate-food", function(req, res) {

  const post = {
    name: req.body.customer_name,
    email: req.body.email_address,
    phone: req.body.phone_number,
    food: req.body.food_Type,
    address: req.body.doner_address
  };

  posts.push(post);
  res.redirect("/recive-food");
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});

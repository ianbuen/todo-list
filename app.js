// basic setup
const express = require('express');
const mongoose = require('mongoose');
const _ = require("lodash");
const date = require(__dirname + '/date.js');

const app = express();

// current route variable
let currentRoute = "/";

// options to fix deprecation warnings
const options = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

// connect to MongoDB using Mongoose
const local = process.env.LOCAL;
const atlas = process.env.ATLAS;
mongoose.connect(atlas, options);

// create Schema
const itemSchema = {
  name: {
    type: String,
    required: true
  },
  category: String
};

// create Model out of the Schema
const Item = mongoose.model("Item", itemSchema);


// create 3 Initial Documents based on the Item Model
const item1 = new Item({
  name: "Code"
});

const item2 = new Item({
  name: "Compile"
});

const item3 = new Item({
  name: "Debug"
});

// put all in array
const defaultItems = [item1, item2, item3];


// EJS
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


// Root route
app.get("/", (req, res) => {

  currentRoute = "/";

  // find all task items from DB
  Item.find({ category: undefined }, (err, tasks) => {

    // log if there's an error
    if (err)
        console.log(err);

    // if no task items, create 3 new starter items
    else if (tasks.length === 0) {

      // call an insert query to DB
      Item.insertMany(defaultItems, (err) => {
        if (err)
            console.log(err);
        else
            res.redirect("/");
      });

    } else {
        res.render("list", {listTitle: date.getDate(), tasks: tasks, route: currentRoute});
    }

  });

});



// POST Method
app.post("/", (req, res) => {

  const item = new Item({
    name: req.body.txtTask
  });

  item.save();

  res.redirect("/");
});



// route for other other dynamic pages
app.get("/:page", (req, res) => {

  // get the list name based from URL
  const cat = _.lowerCase(req.params.page);
  const listTitle = _.startCase(cat) + " List";

  currentRoute = "/" + cat;

  // find all task items from DB
  Item.find({ category: cat }, (err, tasks) => {

    // log if there's an error
    if (err)
        console.log(err);

    // if task items found, render the page
    else
        res.render("list", {listTitle: listTitle, tasks: tasks, route: currentRoute});

  });

});

// DELETE POST Method
app.post("/delete", (req, res) => {

  const checkedItemID = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemID, (err) => {
      if (err)
          console.log(err);
      else
          res.redirect(currentRoute);
  })
});

// custom list POST Method
app.post("/:page", (req, res) => {

  const cat = req.params.page;

  const item = new Item({
    name: req.body.txtTask,
    category: cat
  });

  item.save();

  res.redirect(currentRoute);
});


// About Route
app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT, () => {
  console.log("Server now running at Port 80.")
});

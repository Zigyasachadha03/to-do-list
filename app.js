const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model ('item', itemsSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

//adding items in todolistDB

const item1 = new Item({
  name: "Buy Fruits"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultList = [item1, item2];





app.get("/", function(req, res) {
  const day = date.getDate();

  Item.find() 
    .then(function(items){
      if(items.length === 0){
        Item.insertMany(defaultList)
          .catch(function(err){ console.log(err)});
          res.redirect('/');
      }else{
        res.render("list", {listTitle: day, newListItems: items});
      }
    })
    .catch(function(err){console.log(err)});
});



app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName})
    .then(function(lists){
        if(!lists){
          // Create a new list.

          const listNew = new List({
            name: customListName,
            items: defaultList
          });

          listNew.save();
          res.redirect('/' + customListName);
        }else{
          // Show existing list.
          res.render("list", {listTitle: lists.name, newListItems: lists.items});
        }
      })
    .catch(function(err){console.log(err);});
})



app.post("/", function(req, res){
  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === day){
    newItem.save();
    res.redirect('/');
  }else{
    List.findOne({name: listName})
      .then(function(lists) {
        lists.items.push(newItem);
        lists.save();
        res.redirect("/" + listName);        
      })
  }
});



app.post("/delete", function(req, res){
  const day = date.getDate();
  const checkedBox = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.deleteOne({_id: checkedBox})
      .then(function(){ res.redirect('/');});
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedBox}}})
      .then(function(){ res.redirect('/' + listName);});
  }
  });
  
 



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

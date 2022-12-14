const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const _ =require("lodash");
//mongodb connections 
mongoose.connect("mongodb://localhost:27017/ToDoListDB")
//
const itemSchema = {
    name: String
}
const customSchema = {
    name: String,
    item: [itemSchema]
};

const Item = mongoose.model('item', itemSchema);
const Custom = mongoose.model('Custom', customSchema);

//seting view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

//parser connection
app.use(bodyParser.urlencoded({ extended: true }));

//setting public folder
app.use(express.static("public"));

app.get("/", (req, res) => {
    Item.find({}, async (err, result) => {
        if (!err) {
            res.render('index', { Data: result, Title: "My To Do List" })
        }
    })

})
app.post("/", (req, res) => {
    const item = req.body.item;
    const Title = req.body.Title;
    const data = new Item({ name: item })
    if(Title=="My To Do List"){
        data.save();
        res.redirect('/')
    }else{
        Custom.findOne({name:Title},(err,result)=>{
         result.item.push(data);
         result.save();
         res.redirect("/"+Title);
        })
    }
       
})

app.post("/delete", (req, res) => {
    const ItemId = req.body.ListId;
     const Title = req.body.Title;
    
     if(Title=="My To Do List"){
        Item.findByIdAndRemove(ItemId, (err) => {
            if (!err) {
                console.log("successfully deleted");
            }
        })
        res.redirect('/');
     }else{
        Custom.findOne({name:Title},(err,result)=>{
            if(!err){
                result.item.pull({_id:ItemId});
                result.save();
                res.redirect("/"+Title);
            }
        })
     }
   
})

app.get("/:customTitle", (req, res) => {
    const customTitle =_.capitalize(req.params.customTitle);

    Custom.findOne({name:customTitle}, (err, result) => {
        if (!err) {
         if(!result){
            const newItem =new Custom({name:customTitle})
            newItem.save();
            res.redirect("/"+ customTitle)
         }else{
            res.render('index', { Title: customTitle, Data: result.item })           
         }
           
        }
       
    })

})


app.listen('3000', (req, res) => {
    console.log("server running in port 3000")
});
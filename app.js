//import express package so that we can define the node server easily
const express = require("express");
// to access files within the project
const path = require("path");
const fs = require("fs");
var uniqid = require("uniqid");

//create express server
const app = express();
//define a port
const PORT = process.env.PORT || 8080;
//reusable const for db file path
const DB_FILE_PATH = path.join(__dirname, "/db/db.json");

//data parsing properties
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//setting middleware
app.use(express.static(__dirname + "/public")); //Serves resources from public folder


//view routes
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});
app.get("/notes", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

//api routes. this route will be used by client to get all the saved notes
app.get("/api/notes", function (req, res) {
  console.log("success");
  // read db,jason file and return the content as JSON
  fs.readFile(DB_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      return res.json({
        error: "The file cannot be read",
      });
    }
    return res.json(JSON.parse(data));
  });
});

// receive a new note from req.body and save it to db.json and return the same to the client
app.post("/api/notes", function (req, res) {
  console.log(req.body);
  //get the new notes from req.body
  let newNote = req.body;
  newNote.id = uniqid();
  //read/take the existing notes from db.json and convert to object using json.parse
  let existingNotesArray;
  fs.readFile(DB_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      return res.json({
        error: "The file cannot be read",
      });
    }
    existingNotesArray = JSON.parse(data);
    console.log(existingNotesArray);
    //push the new note into the existing notes,which now has been converted to array
    existingNotesArray.push(newNote);
    //overwrite the existing db.json with the updated array.
    fs.writeFile(DB_FILE_PATH, JSON.stringify(existingNotesArray), (err) => {
      if (err) {
        return res.json({
          error: "Cannot write the file",
        });
      }
    });
    //return the new note to the client
    res.json(newNote);
  });
});

app.delete("/api/notes/:id", function (req, res) {
  console.log(req.params.id);
  fs.readFile(DB_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      return res.json({
        error: "The file cannot be read",
      });
    }
    let existingNotesArray = JSON.parse(data);
    const idOfObjToRemove = req.params.id;
    const arrayAfterDelete = existingNotesArray.filter(
      (item) => item.id !== idOfObjToRemove
    );

    //overwrite the existing db.json with the updated array.
    fs.writeFile(DB_FILE_PATH, JSON.stringify(arrayAfterDelete), (err) => {
      if (err) {
        return res.json({
          error: "Cannot write the file",
        });
      }
    });
    res.json({
        status : "deleting.."
    })
  });
});

//start the server
app.listen(PORT, function () {
  console.log("App is listening" + PORT);
});

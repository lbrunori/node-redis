const express = require("express");

let path = require("path");
let logger = require("morgan");
let bodyParser = require("body-parser");
let redis = require("redis");

let app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

//Create client
let client = redis.createClient();

client.on("connect", () => {
  console.log("Redis Server connected");
});

app.get("/", (req, res, next) => {
  let title = "Task list";

  client.lrange("tasks", 0, -1, (err, reply) => {
    res.render("index", {
      title,
      tasks: reply
    });
  });
});

app.listen(3000);

console.log("Server started on port 3000");

module.exports = app;

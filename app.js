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
    client.hgetall("call", (err, call) => {
      res.render("index", {
        title,
        tasks: reply,
        call
      });
    });
  });
});

app.post("/task/add", (req, res, next) => {
  let task = req.body.task;

  client.rpush("tasks", task, (err, reply) => {
    if (err) {
      console.log(err);
    }
    console.log("Task added");
  });

  res.redirect("/");
});

app.post("/task/delete", (req, res, next) => {
  let taskToDel = req.body.task;

  client.lrange("tasks", 0, -1, (err, tasks) => {
    console.log("tasks ->" + tasks);

    for (let i = 0; i < tasks.length; i++) {
      if (taskToDel.indexOf(tasks[i]) > -1) {
        client.lrem("tasks", 0, tasks[i], () => {
          if (err) {
            console.log(err);
          }
        });
      }
    }
    res.redirect("/");
  });
});

app.post("/call/add", (req, res, next) => {
  let newCall = {
    name: req.body.name,
    company: req.body.company,
    phone: req.body.phone,
    time: req.body.time
  };

  client.hmset(
    "call",
    [
      "name",
      newCall.name,
      "company",
      newCall.company,
      "phone",
      newCall.phone,
      "time",
      newCall.time
    ],
    (err, reply) => {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

app.listen(3000);

console.log("Server started on port 3000");

module.exports = app;

const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let user_num = 0;
let logs = {};

app.post('/api/users', (req, res) => {
  let username = req.body.username;
  logs[user_num.toString()] = {
    "username": username,
    "count": 0,
    "_id": user_num.toString(),
    "log": []
  }
  user_num++;

  res.json({
    "username": username,
    "_id": (user_num - 1).toString()
  });
})

app.get('/api/users', (req, res) => {
  let ans = [];
  for (let key in logs) {
    ans.push({
      "_id":logs[key]["_id"],
      "username":logs[key]["username"]
    })
  };
  res.send(ans);
})

app.post('/api/users/:_id/exercises', (req, res) => {
  let user_id = req.params["_id"];
  let description = req.body.description;
  let duration = parseInt(req.body.duration);
  let date = new Date();
  if (req.body.date)
    date = new Date(req.body.date);
  logs[user_id]["log"].push({
    "description": description,
    "duration": duration,
    "date": date
  });
  logs[user_id]["count"]++;

  let user_name = logs[user_id]["username"];
  res.send({
    "_id": user_id,
    "username": user_name,
    "date": date.toDateString(),
    "duration": duration,
    "description": description
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  let requestParameters = req.query;
  let user_id = req.params["_id"];
  let user_logs = logs[user_id];
  let ans = {
    "username": user_logs["username"],
    "count": 0,
    "_id": user_id,
    "log": []
  };

  user_logs["log"].forEach(item => {
    

    let d = item["date"].getTime();
    
    let is_add = true;
    if (requestParameters["from"]) {
      let from = (new Date(requestParameters["from"])).getTime();
      if (d < from) {
        is_add = false;
      }
    }

    if (requestParameters["to"]) {
      let to = (new Date(requestParameters["to"])).getTime();
      if (d > to) {
        is_add = false;
      }
    }

    if (requestParameters["limit"]) {
      let limit = parseInt(requestParameters["limit"]);
      if (ans["count"] >= limit) {
        is_add = false;
      }
    }

    if (is_add) {
      ans["count"]++;
      let i = JSON.parse(JSON.stringify(item));
      i["date"] = item["date"].toDateString();
      ans["log"].push(i);
    }

  })
  res.send(ans);
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

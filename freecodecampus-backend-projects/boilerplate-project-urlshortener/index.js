require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
// Basic Configuration
const port = process.env.PORT || 3000;
const url = require('url');
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
const BodyParser = require('body-parser');
app.use(BodyParser.urlencoded({extended:true}));
let url_input_list = [];
app.post('/api/shorturl', (req, res) => {
  let url_input = req.body['url'];
  let hostname_input = url.parse(url_input).hostname;
  if (hostname_input == null) {
    res.json({error: 'invalid url'});
    return;
  };
  dns.lookup(hostname_input, (err, addresses) => {
      if (err || addresses.length === 0) {
        res.json({error: 'invalid url'});
      }
      else {
        url_input_list.push(url_input);
        res.json({"original_url": url_input, "short_url":url_input_list.length-1});
      };
  });
})

app.get('/api/shorturl/:i', (req, res) => {
  let index = parseInt(req.params.i);
  console.log(url_input_list[index]);
  res.redirect(url_input_list[index]);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

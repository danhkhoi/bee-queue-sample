var express = require('express');
var app = express();
import Queue from './kueQueue';


// This responds a POST request for the homepage
app.post('/test', function (req, res) {
   console.log("Got a POST request for the homepage");
   res.send('Hello POST');
   Queue.createJob();
})

var server = app.listen(8000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})


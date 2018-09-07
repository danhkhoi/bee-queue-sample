var express = require('express');
var app = express();

const Queue = require('bee-queue');
const queue = new Queue('example');

function delayAsync(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

// Process jobs from as many servers or processes as you like
queue.process(function (job, done) {
  console.log(`Processing job ${job.id}`);
  return delayAsync(2000).then(() => {
      console.log('vo day chua');
    return done(null, job.data.x + job.data.y);; // try again
    }); 
});

// This responds a POST request for the homepage
app.post('/test', function (req, res) {
   console.log("Got a POST request for the homepage");
   res.send('Hello POST');
   const job = queue.createJob({x: 2, y: 3})
   job.save();
   job.on('succeeded', (result) => {
     console.log(`Received result for job ${job.id}: ${result}`);
   });
})

var server = app.listen(8000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})


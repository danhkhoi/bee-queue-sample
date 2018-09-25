var express = require('express');
var app = express();
import Queue from './kueQueue';


// This responds a POST request for the homepage
app.get('/test', function (req, res) {
   console.log('call for a test');
   res.send('Hello POST');
   Queue.createJob({
       param: 'param này nọ',
   });
})

app.get('/get_job_count', async function (req, res) {
    console.log('get job count');
    res.send('Hello POST');
    const count = await Queue.getInactiveCount();
    console.log('count', count);
 })
var server = app.listen(8000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})


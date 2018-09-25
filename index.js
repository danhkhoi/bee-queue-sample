var express = require('express');
var app = express();
import Queue from './kueQueue';

let queueArray;
// This responds a POST request for the homepage
app.get('/test', function (req, res) {
   console.log('call for a test');
   res.send('Hello POST');
   for(let i = 0; i < 10; i++) {
    Queue.createJob({
        jobParams:{
         param: 'param này nọ',
        },
        queueArray: queueArray,
     });
   }
  
})

app.get('/get_job_count', async function (req, res) {
    console.log('get job count', queueArray.length);
    for(let i = 0; i < queueArray.length; i++ ) {
        try {
            const x = await Queue.getInactiveCount(queueArray[i]);
            console.log('count', i, x);
        } catch (error) {
            console.log('erro queur', error);
        }
    }
    res.send('Hello POST');
 })

var server = app.listen(8000, function () {

   var host = server.address().address
   var port = server.address().port
   queueArray = Queue.initQueueList({numQueue: 4});
   console.log("Example app listening at http://%s:%s", host, port)
})


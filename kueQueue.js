import kue from 'kue';


function delayAsync(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

const queue = kue.createQueue();

const createJob = (tag, ) => {
   );
    queue.create('testjob',{
        param1: 1,
        param2: 2,
    }).save( function(err){
        if( !err ) console.log('error create job', error );
     });
};

queue.process('testjob', function(job, done){
   console.log('queue process');
   delayAsync(1000).then(()=> {
       console.log('done job', job.id, job.data);
       done('cccc');
   });
  });

const getQueue = () => queue;

export default {
    createJob,
    getQueue,
};

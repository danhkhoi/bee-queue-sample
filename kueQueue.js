//Concurrent Queue

import kue from 'kue';
import util from 'util';

const SEND_TX_JOB = 'SEND_TX_JOB';
const ATTEMP_NUMBER = 2;
const TIME_TO_LIVE = 2000;

const DEFAULT_NUM_QUEUE = 2;
const defaultRedisConfig = {
    port: 6379,
    host: '27.0.15.42',
    auth: 'VBC@2018_%',
    db: 0,
    options: {

    }
};

const queueArray = [];

const initQueue = (numQueue = DEFAULT_NUM_QUEUE, task) => {

    for(let i = 0; i ++ ; i < DEFAULT_NUM_QUEUE) {
        const newQueue = kue.createQueue();
        const queueConfig = {
            prefix: `bq_q_${i}`,
            redis: defaultRedisConfig,
        }
        queueArray.push(newQueue);
    }
};

const leastJobQueue = async () => {
    let queueIndex = 0;
    let currentInActiveCount = undefined;
    let i = 0;
    while( i < queueArray.length) {
        try {
            const inactiveCount = await getInactiveCount(queueArray[i]);

            if(inactiveCount === 0) {
                return queueArray[i];
            }
            if (inactiveCount < currentInActiveCount || currentInActiveCount) {
                currentInActiveCount = inactiveCount;
                queueIndex = i;
            }
        } catch (error) {
            console.log('error get getInactiveCount', error);
        }
        i++;
    }
    return queueArray[queueIndex];
};



function testFunc(time = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

let queue;

try {
    queue = kue.createQueue(defaultQueueConfig);
   
    queue.watchStuckJobs() //default to 1000ms

    queue.process(SEND_TX_JOB, function (job, done) {
       
        console.log('queue process', job.id, job.data);
        testFunc().then(() => {
            //done(new Error('error gi do'));
            console.log('done job', job.id);
            done();
        });
    });
} catch (error) {
    console.log('error queue', error)
}

const createJob = (params = {}) => {
    queue && queue.create(SEND_TX_JOB, params)
    .attempts(ATTEMP_NUMBER)
    .ttl(TIME_TO_LIVE)
    .save(function (err) {
        if (!err) console.log('created new job');
    });
};


const getQueue = () => queue;

const getInactiveCount = async (queue) => {

    if (queue) {
        return util.promisify(queue.inactiveCount).bind(queue)();
    }
    return Promise.reject('Error queue');    
};

export default {
    createJob,
    getQueue,
    getInactiveCount,
};

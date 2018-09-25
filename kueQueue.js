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


const initQueueList = ({
    numQueue = DEFAULT_NUM_QUEUE,
    task,
    config
} = {}) => {

    const queueArray = [];

    for (let i = 0;i < numQueue; i++) {
        const queueConfig = {
            prefix: `bq_q_${i}`,
            redis: config || { ...defaultRedisConfig, db: i}, //NECHANGE
        }

        const queue = kue.createQueue(queueConfig);
        queue.watchStuckJobs() //default to 1000ms
        queue.process(SEND_TX_JOB, function (job, done) {

            console.log('queue process', job.id, job.data);

            testFunc().then(() => { //task
                //done(new Error('error gi do'));
                console.log('done job', job.id);
                done();
            }).catch(error => {
                console.log('error in queue', error);
                done(error);
            });
        });

        queueArray.push(queue);
    }

    return queueArray;
};

const leastJobQueue = async (queueArray) => {

    return queueArray[Math.floor(Math.random() * 5)]
    let queueIndex = 0;
    let currentInActiveCount = undefined;
    let i = 0;

    while (i < queueArray.length) {
        try {
            const inactiveCount = await getInactiveCount(queueArray[i]);

            if (inactiveCount === 0) {
                console.log('got queue ', queueIndex);
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
    console.log('got queue ', queueIndex);
    return queueArray[queueIndex];
};



function testFunc(time = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

const createJob = async ({jobParams, queueArray} = {}) => {

    const enqueueJob = await leastJobQueue(queueArray);
    //console.log('new job', jobParams);
    enqueueJob.create(SEND_TX_JOB, jobParams)
        .attempts(ATTEMP_NUMBER)
        .ttl(TIME_TO_LIVE)
        .save(function (err) {
            if (!err) console.log('created new job');
        });
};

const getInactiveCount = async (queue) => {

    if (queue) {
        return util.promisify(queue.inactiveCount).bind(queue)();
    }
    return Promise.reject('Error queue');
};

export default {
    createJob,
    getInactiveCount,
    initQueueList,
};

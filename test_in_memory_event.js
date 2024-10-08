import axios from 'axios';
import config from './config.js';

const base_url = `http://localhost:${config.in_memory_port}/event`;
const EVENT_COUNT = 10000; // Number of events to publish

async function publishEvents() {
    console.log(`Publishing ${EVENT_COUNT} events to ${base_url}`);

    const promises = [];
    for (let i = 0; i < EVENT_COUNT; i++) {
        promises.push(axios.post(base_url)
        .then((res) => {
            console.log(`Event ${i} sent successfully`, res.status);
        })
        .catch((err) => {
            // console.log(err);
            console.error(`Failed to send event ${i}`, err.response?.status ?? 'No response from server');
        }));
    }

    // Wait for all events to be sent
    await Promise.all(promises);
    console.log(`Successfully published ${EVENT_COUNT} events.`);
}

// Run the script
publishEvents()
.then(() => {
    console.log('Test completed.');
})
.catch((err) => {
    console.error('Error during test:', err);
});

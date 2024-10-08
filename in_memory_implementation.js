import express from 'express';
import config from './config.js';
// Define constants
const WINDOW_SIZE_IN_SECONDS = 300; // 5 minutes window
const BUCKET_SIZE = 60 * 1000; // 1-second buckets for each minute
const app = express();

const eventBuckets = new Array(WINDOW_SIZE_IN_SECONDS).fill(0); // Circular buffer for counting events
let startTime = Date.now();

// Function to get the current bucket index
function getCurrentBucketIndex() {
    const currentTime = Date.now();
    return Math.floor((currentTime - startTime) / 1000) % WINDOW_SIZE_IN_SECONDS;
}

// Function to advance the time window and reset older buckets
function advanceWindow() {
    const currentTime = Date.now();
    const timeDiffInSeconds = Math.floor((currentTime - startTime) / 1000);
    const startIndex = getCurrentBucketIndex();
    
    for (let i = 0; i < timeDiffInSeconds; i++) {
        eventBuckets[(startIndex + i) % WINDOW_SIZE_IN_SECONDS] = 0; // Reset expired buckets
    }
    startTime = currentTime;
}

// Function to record an event
function recordEvent() {
    advanceWindow(); // Make sure window is up to date
    const index = getCurrentBucketIndex();
    eventBuckets[index] += 1;
    console.log('Event recorded in bucket:', index);
}

// Function to get the event count in the last 5 minutes
function getEventCount() {
    advanceWindow(); // Make sure window is up to date
    return eventBuckets.reduce((sum, count) => sum + count, 0);
}

// POST /event - Record an event
app.post('/event', (req, res) => {
    recordEvent();
    res.status(201).json({ message: 'Event recorded' });
});

// GET /events/count - Get event count in the last 5 minutes
app.get('/events/count', (req, res) => {
    const count = getEventCount();
    res.status(200).json({ eventCount: count });
});

// Start the server
app.listen(config.in_memory_port, () => {
    console.log(`Server running on http://localhost:${config.in_memory_port}`);
});

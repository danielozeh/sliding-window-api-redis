import express from 'express';
import { createClient } from 'redis';
import config from './config.js';

// Create Redis client
const redisClient = createClient({url: config.redis_url});
await redisClient.connect();
const WINDOW_SIZE_IN_SECONDS = 300; // 5 minutes window
const BUCKET_NAME = 'events'; // Redis key for sorted set

const app = express();

// Function to record an event
async function recordEvent() {
    const currentTimestamp = Date.now();
    try {
        await redisClient.zAdd(BUCKET_NAME, [{ score: currentTimestamp, value: currentTimestamp.toString() }]); // Convert timestamp to string
        console.log('Event recorded at:', currentTimestamp);
    } catch (err) {
        console.error('Error recording event:', err);
    }
}

// Function to get the event count in the last 5 minutes
async function getEventCount() {
    const currentTime = Date.now();
    const fiveMinutesAgo = currentTime - WINDOW_SIZE_IN_SECONDS * 1000;
    
    try {
        // Remove events older than 5 minutes
        await redisClient.zRemRangeByScore(BUCKET_NAME, 0, fiveMinutesAgo);

        // Count remaining events
        const count = await redisClient.zCount(BUCKET_NAME, fiveMinutesAgo, currentTime);
        return count;
    } catch (err) {
        console.error('Error fetching event count:', err);
        return 0;
    }
}

// POST /event - Record an event
// POST /event - Record an event
app.post('/event', async (req, res) => {
    await recordEvent();
    res.status(201).json({ message: 'Event recorded' });
});

// GET /events/count - Get event count in the last 5 minutes
app.get('/events/count', async (req, res) => {
    const count = await getEventCount();
    res.status(200).json({ eventCount: count });
});

// Start the server
app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});

import express from 'express';
import fetch from 'node-fetch';
import _ from 'lodash';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const client_id = '7dba6644634a4ec8b318e237840152b2';
const client_secret = '127e58ddd7d14c46800d93c158111351';
let access_token = '';

// Handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Get Spotify access token
const getAccessToken = async () => {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
            },
            body: 'grant_type=client_credentials'
        });
        if (!response.ok) {
            throw new Error(`Error fetching access token: ${response.statusText}`);
        }
        const data = await response.json();
        access_token = data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error);
    }
};

// Endpoint to get song recommendations
app.post('/recommendations', async (req, res) => {
    const { songId } = req.body;

    if (!access_token) {
        await getAccessToken();
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${songId}&limit=50`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching recommendations: ${response.statusText}`);
        }
        const data = await response.json();

        // Sort tracks by popularity (or any other criteria)
        const sortedTracks = _.orderBy(data.tracks, ['popularity'], ['desc']);

        res.json(sortedTracks);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).send('Error fetching recommendations');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

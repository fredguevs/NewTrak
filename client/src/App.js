import React, { useState } from 'react';

const App = () => {
    const [songId, setSongId] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getRecommendations = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ songId })
            });
            if (!response.ok) {
                throw new Error('Error fetching recommendations');
            }
            const data = await response.json();
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setError('Failed to fetch recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Spotify Song Recommender</h1>
            <input 
                type="text" 
                value={songId} 
                onChange={(e) => setSongId(e.target.value)} 
                placeholder="Enter Spotify Song ID" 
            />
            <button onClick={getRecommendations} disabled={loading}>
                {loading ? 'Loading...' : 'Get Recommendations'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {recommendations.map((song, index) => (
                    <li key={index}>{song.name} by {song.artists.map(artist => artist.name).join(', ')}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;
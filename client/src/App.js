import React, { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import './App.css';
import logo from './image.png';

const App = () => {
    const [songId, setSongId] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [query, setQuery] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);

    useEffect(() => {
        if (query && !songId) { // Only fetch suggestions if there's a query and no song is selected
            fetchSuggestions(query);
        } else {
            setSuggestions([]);
        }
    }, [query, songId]);

    const fetchSuggestions = debounce(async (searchQuery) => {
        try {
            const response = await fetch(`http://localhost:5000/search?query=${searchQuery}`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }, 300);

    const handleSelectSuggestion = (song) => {
        setSongId(song.id);
        setQuery(`${song.name} by ${song.artists.map(artist => artist.name).join(', ')}`); // Set the input to the selected song
        setSuggestions([]); // Clear the suggestions list
        setSelectedSong(song); // Store the selected song information
    };

    const getRecommendations = async () => {
        try {
            const response = await fetch('http://localhost:5000/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ songId })
            });
            const data = await response.json();
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <>
            <div className="title">
                <h1>
                    <a href="/">Similar.ly</a>
                </h1>
                <img src={logo} alt="Logo" />
            </div>

            <div className="app-container">
                <div className="about">
                    <h1> Similar Songs Finder</h1>
                    <p> Generate a playlist based on your favorite music </p>
                </div>
                <div className="search-container">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSongId(''); // Reset songId when typing a new query
                        }}
                        placeholder="Type a song name"
                    />
                    {suggestions.length > 0 && (
                        <div className="suggestions-list">
                            {suggestions.map((song) => (
                                <button
                                    key={song.id}
                                    onClick={() => handleSelectSuggestion(song)}
                                    className="suggestion-item"
                                >
                                    {song.name} by {song.artists.map(artist => artist.name).join(', ')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={getRecommendations} className="get-recommendations-button">Generate</button>

            </div>
            {selectedSong && (
                <div className="selected-song">
                    <img src={selectedSong.album.images[0].url} alt="Album cover" className="album-cover" />
                    <p>{selectedSong.name} by {selectedSong.artists.map(artist => artist.name).join(', ')}</p>
                </div>
            )}

            <ul className="recommendations-list">
                {recommendations.map((song, index) => (
                    <li key={index} className="recommendation-item" onClick={() => window.open(song.external_urls.spotify, '_blank')}>
                        <div className="recommendation-info">
                            <img src={song.album.images[0].url} alt="Album cover" className="album-cover" />
                            <span className="song-name">{song.name}</span>
                        </div>
                        <span className="song-artist">{song.artists.map(artist => artist.name).join(', ')}</span>
                        <span className="song-duration">{formatDuration(song.duration_ms)}</span>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default App;

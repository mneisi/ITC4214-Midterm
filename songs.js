// ================== Songs =================== //


// Array to hold song objects
let songs = [];
const songUpload = document.getElementById('songUpload');
const songList = document.getElementById('songList');
const songSearch = document.getElementById('songSearch');
const audioPlayer = document.getElementById('audioPlayer');

// When songs are uploaded, create song objects with an Object URL
songUpload.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
    const songObj = {
        name: file.name,
        file: file,
        url: URL.createObjectURL(file)
    };
    songs.push(songObj);
    });
    renderSongs();
});

// Render the songs list with optional filtering
function renderSongs(filter = '') {
    songList.innerHTML = '';
    const filteredSongs = songs.filter(song =>
    song.name.toLowerCase().includes(filter.toLowerCase())
    );
    filteredSongs.forEach((song, index) => {
    // Create a card for each song
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
        <div class="card song-card">
        <div class="card-body">
            <h5 class="card-title">${song.name}</h5>
            <button class="btn btn-primary play-btn" data-index="${index}">
            <i class="fas fa-play"></i> Play
            </button>
        </div>
        </div>
    `;
    songList.appendChild(col);
    });
    
    // Add click events to the play buttons
    document.querySelectorAll('.play-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Use the data-index attribute to get the correct song object
        const index = this.getAttribute('data-index');
        // Find the song in the filtered list (to match the displayed order)
        const songToPlay = filteredSongs[index];
        playSong(songToPlay.url);
    });
    });
}

// Listen for search input and re-render the songs list
songSearch.addEventListener('input', (e) => {
    renderSongs(e.target.value);
});

// Play the selected song using the HTML5 audio element
function playSong(url) {
    audioPlayer.src = url;
    audioPlayer.style.display = 'block';
    audioPlayer.play();
}
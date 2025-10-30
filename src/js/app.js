// JavaScript - ReNew Player
console.log('ReNew Player Loaded');

//Progress Bar Constant
const progressBar = document.querySelector('#progress-Bar');

//Buttons for functionality
const playButton = document.querySelector('#resumeBtn');
const nextButton = document.querySelector('#nextSongBtn');
const prevButton = document.querySelector('#previousSongBtn');
const shuffleButton = document.querySelector('#shuffleBtn');
const likeButton = document.querySelector('#likeBtn');

//Song elements
const songTitle = document.getElementById('songName');
const songArtistAlbum = document.getElementById('songArtistAlbum');
const albumImg = document.getElementById('albumCover');

//File inputs elements
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');

//Variables
let songs = [];
let currentSongIndex = 0;
let firstSongLoaded = false;
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const audio = document.getElementById('media-session-proxy');

// MediaSession setup
setupMediaSessionHandlers();

//Listeners
selectFilesBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    songs = [];
    firstSongLoaded = false;

    files.forEach(file => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const audioDataURL = event.target.result; 

            jsmediatags.read(file, {
                onSuccess: function(tag) {
                    const title = tag.tags.title || file.name.replace(/\.[^/.]+$/, "");
                    const artist = tag.tags.artist || "Desconocido";
                    const album = tag.tags.album || "Desconocido";
                    let img = "https://lgamer0.github.io/ReNew-Project/src/others/png/musica.png";

                    if (tag.tags.picture) {
                        albumImg.classList.remove('p-5');
                        const { data, format } = tag.tags.picture;
                        let base64String = "";
                        for (let i = 0; i < data.length; i++) {
                            base64String += String.fromCharCode(data[i]);
                        }
                        const base64 = btoa(base64String);
                        img = `data:${format};base64,${base64}`;
                    } else {
                        albumImg.classList.add('p-5');
                    }

                    const songObj = {
                        title,
                        artist,
                        album,
                        src: audioDataURL,
                        img
                    };

                    songs.push(songObj);

                    if (!firstSongLoaded) {
                        firstSongLoaded = true;
                        currentSongIndex = 0;
                        loadSong(currentSongIndex);
                    }
                },
                onError: function(error) {
                    console.log("Error leyendo metadatos:", error);
                }
            });
        };

        reader.readAsDataURL(file);
    });
});

function loadSong(index) {
    const song = songs[index];
    if (!song) return;

    audio.src = song.src;
    audio.load();

    songTitle.textContent = song.title;
    songArtistAlbum.textContent = `${song.artist} - ${song.album}`;
    albumImg.src = song.img;

    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";
    totalTimeEl.textContent = "0:00";

    updateMediaSessionMetadata(song.title, song.artist, song.album, albumImg.src);
    if ('mediaSession' in navigator) updatePositionState();
}

function updateMediaSessionMetadata(title, artist, album, artworkUrl) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'Título Desconocido',
        artist: artist || 'Artista Desconocido',
        album: album || 'Álbum Desconocido',
        artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }] : []
    });
}

function setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
        audio.play();
        navigator.mediaSession.playbackState = 'playing';
    });
    navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
        navigator.mediaSession.playbackState = 'paused';
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => playPreviousSong());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong());
    navigator.mediaSession.setActionHandler('seekto', (event) => {
        if (event.seekTime !== undefined && audio.duration) {
            audio.currentTime = event.seekTime;
        }
    });
}

function playNextSong() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    audio.play();
}

function playPreviousSong() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    audio.play();
}

function playRandomSong() {
    if (songs.length === 0) return;
    currentSongIndex = Math.floor(Math.random() * songs.length);
    loadSong(currentSongIndex);
    audio.play();
}

playButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

nextButton.addEventListener('click', () => playNextSong());
prevButton.addEventListener('click', () => playPreviousSong());
shuffleButton.addEventListener('click', () => playRandomSong());
likeButton.addEventListener('click', () => likeButton.classList.toggle('text-red-500'));

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
}

function updatePositionState() {
    if (!('mediaSession' in navigator)) return;
    if (isNaN(audio.duration)) return;
    navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime,
    });
}

// Actualiza el tiempo total cuando se cargan metadatos
audio.addEventListener('loadedmetadata', () => {
    if (!isNaN(audio.duration) && audio.duration > 0) {
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

// 🔥 Actualización en tiempo real de tiempo y barra
let isUpdatingTime = false;

function startUpdatingTime() {
    if (isUpdatingTime) return;
    isUpdatingTime = true;
    updateLoop();
}

function stopUpdatingTime() {
    isUpdatingTime = false;
}

function updateLoop() {
    if (!isUpdatingTime) return;

    if (!isNaN(audio.duration) && audio.duration > 0) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
        if ('mediaSession' in navigator) updatePositionState();
    }

    requestAnimationFrame(updateLoop);
}

audio.addEventListener('play', startUpdatingTime);
audio.addEventListener('pause', stopUpdatingTime);
audio.addEventListener('ended', () => {
    stopUpdatingTime();
    playNextSong();
});

progressBar.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});

setInterval(() => {
    if ('mediaSession' in navigator && !audio.paused && !isNaN(audio.duration)) {
        navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
        });
    }
}, 1000);
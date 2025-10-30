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
const songArtist = document.getElementById('songArtist');
const albumImg = document.getElementById('albumCover');

//File inputs elements
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');

//Variables
let songs = [];
let currentSongIndex = 0;
let firstSongLoaded = false;
const audio = new Audio();
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');

//Listeners
selectFilesBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    songs = [];
    firstSongLoaded = false;

    files.forEach(file => {
        jsmediatags.read(file, {
            onSuccess: function(tag) {
                const title = tag.tags.title || file.name.replace(/\.[^/.]+$/, "");
                const artist = tag.tags.artist || "Desconocido";
                let img = "/ReNew-Project/src/others/png/musica.png";

                if (tag.tags.picture) {
                    const { data, format } = tag.tags.picture;
                    let base64String = "";
                    for (let i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    const base64 = btoa(base64String);
                    img = `data:${format};base64,${base64}`;
                }

                const songObj = {
                    title,
                    artist,
                    src: URL.createObjectURL(file),
                    img
                };

                songs.push(songObj);

                // Solo cargamos la primera canción una vez
                if (!firstSongLoaded) {
                    firstSongLoaded = true;
                    currentSongIndex = 0;
                    loadSong(currentSongIndex);
                }
            },
            onError: function(error) {
                console.log("Error leyendo metadatos:", error);

                const songObj = {
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    artist: "Desconocido",
                    src: URL.createObjectURL(file),
                    img: "/src/test/default-album.jpeg"
                };

                songs.push(songObj);

                if (!firstSongLoaded) {
                    firstSongLoaded = true;
                    currentSongIndex = 0;
                    loadSong(currentSongIndex);
                }
            }
        });
    });
});

function loadSong(index) {
    const song = songs[index]; 

    audio.src = song.src;

    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    albumImg.src = song.img;

    progressBar.value = 0;
}

playButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

nextButton.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    audio.play();
});

prevButton.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    audio.play();
});

shuffleButton.addEventListener('click', () => {
    currentSongIndex = Math.floor(Math.random() * songs.length);
    loadSong(currentSongIndex);
    audio.play();
});

likeButton.addEventListener('click', () => {
    likeButton.classList.toggle('text-red-500'); // Cambia color al dar like
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
}

// Actualiza barra y timers mientras se reproduce
audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return; // Evita NaN

    // Barra de progreso
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent;

    // Timers
    currentTimeEl.textContent = formatTime(audio.currentTime);
    totalTimeEl.textContent = formatTime(audio.duration);
});

// Permite arrastrar la barra
progressBar.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});

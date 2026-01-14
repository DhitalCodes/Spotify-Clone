console.log("Lets Write Some JavaScript");
let songs;
let currentSong = new Audio();
let currentSongIndex = 0;
let currFolder;
let currentPlaylistInfo = null; // Store current playlist metadata

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    // Load playlist metadata
    try {
        let metaResponse = await fetch(`./songs/${folder}/info.json`);
        currentPlaylistInfo = await metaResponse.json();
    } catch (error) {
        console.log("Could not load playlist info", error);
        currentPlaylistInfo = { artist: folder };
    }

    let a = await fetch(`./songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
        let fileName = song
            .split("/")
            .pop()
            .replaceAll("%20", " ")
            .replace(/\.mp3$/i, "");

        songUL.innerHTML =
            songUL.innerHTML +
            `<li>
            <img class="musicsvg" width="34" src="img/svgs/music.svg" alt="">
            <div class="info">
                <div>${fileName}</div>
                <div>${currentPlaylistInfo.artist || folder}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/svgs/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach event listener to each song in the library
    Array.from(
        document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    return songs;
}

async function displayAlbums() {
    let a = await fetch(`./songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];

            // Get the metadata
            let a = await fetch(`./songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <i class="fa-solid fa-play"></i>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="${response.title}">
                <h3>${response.title}</h3>
                <p>${response.description}</p>
            </div>`;
        }
    }

    // Load playlist on card click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0], false);
        });
    });
}

const playMusic = (track, pause = false) => {
    let play = document.querySelector("#play");
    currentSong.src = `./songs/${currFolder}/` + track;

    // Update current song index
    currentSongIndex = songs.indexOf(track);

    if (!pause) {
        currentSong.play();
        play.src = "img/svgs/pause.svg";
    } else {
        currentSong.pause();
        play.src = "img/svgs/play.svg";
    }

    // song name from the URL
    let songName = track
        .split("/")
        .pop()
        .replaceAll("%20", " ")
        .replace(/\.mp3$/i, "");

    document.querySelector(".songinfo .current-song").textContent = songName;
    document.querySelector(".songtime").textContent = "00:00/00:00";
    document.querySelector(".songinfo .artist").textContent = currentPlaylistInfo?.artist || currFolder;
};

async function main() {
    let play = document.querySelector("#play");
    let previous = document.querySelector("#previous");
    let next = document.querySelector("#next");

    // Display all the albums
    await displayAlbums();

    // Get list of first folder songs
    songs = await getSongs("YBkhatra");

    // Play first song 
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    // Attach event listener to play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/svgs/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
            currentSong.currentTime
        )}/${secondsToMinutesSeconds(currentSong.duration)}`;

        let percentage = (currentSong.currentTime / currentSong.duration) * 100;

        document.querySelector(".circle").style.left = percentage + "%";
        document.querySelector(".progress").style.width = percentage + "%";
    });

    // Add event listener for seekbar
    let isDragging = false;

    const updateSeekbar = (e) => {
        let seekbar = document.querySelector(".seekbar");
        let seekbarRect = seekbar.getBoundingClientRect();
        let clickX = e.clientX - seekbarRect.left;
        let seekbarWidth = seekbarRect.width;
        let percentage = (clickX / seekbarWidth) * 100;

        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;

        document.querySelector(".circle").style.left = percentage + "%";
        document.querySelector(".progress").style.width = percentage + "%";

        // jump to clicked part of audio
        if (currentSong.duration) {
            currentSong.currentTime = (percentage / 100) * currentSong.duration;
        }
    };

    document.querySelector(".seekbar").addEventListener("mousedown", (e) => {
        isDragging = true;
        updateSeekbar(e);
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            updateSeekbar(e);
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    // Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.toggle("active");
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.remove("active");
    });

    // Add event listener to previous button
    previous.addEventListener("click", () => {
        console.log("Previous Clicked");
        if (songs.length === 0) return;

        // wrap around to last song if at beginning
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }

        playMusic(songs[currentSongIndex]);
    });

    // Add event listener to next button
    next.addEventListener("click", () => {
        console.log("Next Clicked");
        if (songs.length === 0) return;

        //  wrap around to first song if at end
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }

        playMusic(songs[currentSongIndex]);
    });

    // Auto-play next song when current song ends
    currentSong.addEventListener("ended", () => {
        if (songs.length === 0) return;

        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }

        playMusic(songs[currentSongIndex]);
    });
    //yo vandha talall keybord shortcuts
    // keyboard shortcut to pause play
    document.addEventListener("keydown", (e) => {
        // Space bar to play/pause
        if (e.code === "Space") {
            e.preventDefault();
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/svgs/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/svgs/play.svg";
            }
        }
        // mute track using M on Keyboard
        if (e.code === "KeyM") {
            currentSong.muted = !currentSong.muted;
            console.log("Muted:", currentSong.muted);
        }
        // open hamburger with ESC key
        if (e.code === "Escape") {
            document.querySelector(".left").classList.toggle("active");
        }
        //f to full screen and algain f to exit full screen
        if (e.code === "KeyF") {
            document.documentElement.requestFullscreen();
        }
        if (e.code === "KeyF") {
            document.exitFullscreen();
        }
        // N to play next song
        if (e.code === "KeyN") {
            next.click();
        }
        // P to play previous song
        if (e.code === "KeyP") {
            previous.click();
        }
        // Replay current song from start using Q key
        if (e.code === "KeyQ") {
            e.preventDefault();
            currentSong.currentTime = 0;
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/svgs/pause.svg";
            }
        }
        // Seek backward 10 seconds using ArrowLeft key
        if (e.code === "ArrowLeft") {
        e.preventDefault();
        currentSong.currentTime = Math.max(0, currentSong.currentTime - 10);
    }
        // Seek forward 10 seconds using ArrowRight key
        if (e.code === "ArrowRight") {
        e.preventDefault();
        currentSong.currentTime = Math.min(currentSong.duration, currentSong.currentTime + 10);
    }

    });
    //done with shortcuts

    // when user copy paste content they get messae"You caNT COpy paste contents"
    document.addEventListener("copy", (event) => {
        const copieedText = window.getSelection().toString();
        event.clipboardData.setData('text/plain', 'You cant copy paste contents');
        event.preventDefault();
    });

    // Prevent right click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // Prevent text selection found out this feature on actual spotify and i guess this immproves UI.UX but a lot
    addEventListener('selectstart', (e) => {
        e.preventDefault();
    });
}

main();

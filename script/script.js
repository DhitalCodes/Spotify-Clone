console.log("Lets Write Some JavaScript");
let songs;
let currentSong = new Audio();
let currentSongIndex = 0;
let currFolder;
let currentPlaylistInfo = null;

// converts seconds to mm:ss format
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
    
    // grab the playlist info from json
    try {
        let metaResponse = await fetch(`songs/${folder}/info.json`);
        currentPlaylistInfo = await metaResponse.json();
    } catch (error) {
        console.log("Could not load playlist info", error);
        currentPlaylistInfo = { artist: folder }; 
    }
    
    let a = await fetch(`songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    // filter out only mp3 files
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}/`)[1]);
        }
    }
    
    // populate the song list in sidebar
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

    // click handler for each song
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
    let a = await fetch(`songs/`);
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
            
            // fetch playlist metadata
            let a = await fetch(`songs/${folder}/info.json`);
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
    
    // when you click a card, load that playlist
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0], false);
        });
    });
}

const playMusic = (track, pause = false) => {
    let play = document.querySelector("#play");
    currentSong.src = `songs/${currFolder}/` + track;

    currentSongIndex = songs.indexOf(track);

    if (!pause) {
        currentSong.play();
        play.src = "img/svgs/pause.svg";
    } else {
        currentSong.pause();
        play.src = "img/svgs/play.svg";
    }

    // clean up song name for display
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

    // load all album cards
    await displayAlbums();

    // default to first playlist
    songs = await getSongs("YBkhatra");

    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    // play/pause toggle
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/svgs/play.svg";
        }
    });

    // update time and seekbar as song plays
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
            currentSong.currentTime
        )}/${secondsToMinutesSeconds(currentSong.duration)}`;

        let percentage = (currentSong.currentTime / currentSong.duration) * 100;

        document.querySelector(".circle").style.left = percentage + "%";
        document.querySelector(".progress").style.width = percentage + "%";
    });

    // seekbar click to jump to different time
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let seekbarWidth = e.currentTarget.getBoundingClientRect().width;
        let clickX = e.offsetX;
        let percentage = (clickX / seekbarWidth) * 100;

        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;

        document.querySelector(".circle").style.left = percentage + "%";
        document.querySelector(".progress").style.width = percentage + "%";

        if (currentSong.duration) {
            currentSong.currentTime = (percentage / 100) * currentSong.duration;
        }
    });

    // mobile menu toggle
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.toggle("active");
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.remove("active");
    });

    // previous song button
    previous.addEventListener("click", () => {
        console.log("Previous Clicked");
        if (songs.length === 0) return;

        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }

        playMusic(songs[currentSongIndex]);
    });

    // next song button
    next.addEventListener("click", () => {
        console.log("Next Clicked");
        if (songs.length === 0) return;

        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }

        playMusic(songs[currentSongIndex]);
    });

    // auto play next song when current ends
    currentSong.addEventListener("ended", () => {
        if (songs.length === 0) return;
        
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }
        
        playMusic(songs[currentSongIndex]);
    });

    // spacebar to play/pause
    document.addEventListener("keydown", (e) => {
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
    });

    // disable copying text
    document.addEventListener("copy", (event) => {
        const copieedText = window.getSelection().toString();
        event.clipboardData.setData('text/plain', 'You cant copy paste contents');
        event.preventDefault();
    });

    // no right click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // prevent selecting text
    addEventListener('selectstart',(e) => {
        e.preventDefault();
    });
}

main();
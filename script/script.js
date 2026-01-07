console.log("Lets Write Some JavaScript");

let currentSong = new Audio();

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
    let play = document.querySelector("#play");
    let a = await fetch("http://127.0.0.1:5500/songs/YBkhatra/");
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    let play = document.querySelector("#play")
    currentSong.src = track;
    if(!pause){
        currentSong.play()
        play.src = "img/svgs/pause.svg";
    }

     else {
        currentSong.pause();
        play.src = "img/svgs/play.svg";
    }

    // song name from the URL
    let songName = track.split('/').pop()
        .replaceAll("%20", " ")
        .replace(/\.mp3$/i, "");


    document.querySelector(".songinfo .current-song").textContent = songName;
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
    document.querySelector(".songinfo .artist").textContent = "Yama Buddha";

    
}

async function main() {

    let play = document.querySelector("#play");
    // Get list of all songs
    let songs = await getSongs();
    playMusic(songs[0],true)
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];

    for (const song of songs) {
        let fileName = song.split('/').pop()
            .replaceAll("%20", " ")
            .replace(/\.mp3$/i, "");

        songUL.innerHTML = songUL.innerHTML + `<li>
            <img class="invert" width="34" src="img/svgs/music.svg" alt="">
            <div class="info">
                <div>${fileName}</div>
                <div>Yama Buddha</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/svgs/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach event listener to each song in the library
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    // Attach event listener to play, next and previous buttons
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
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = 
        `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    
    let percentage = (currentSong.currentTime / currentSong.duration) * 100;
    
    document.querySelector(".circle").style.left = percentage + "%";
    document.querySelector(".progress").style.width = percentage + "%";
});

   // Add event listener 
document.querySelector(".seekbar").addEventListener("click", e => {
    let seekbarWidth = e.currentTarget.getBoundingClientRect().width;
    let clickX = e.offsetX;
    let percentage = (clickX / seekbarWidth) * 100;
    
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    
    document.querySelector(".circle").style.left = percentage + "%";
    document.querySelector(".progress").style.width = percentage + "%";
    
    // jump to clicked part of auio
    if (currentSong.duration) {
        currentSong.currentTime = (percentage / 100) * currentSong.duration;
    }
});
}

main();
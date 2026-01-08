console.log("Lets Write Some JavaScript");
let songs;
let currentSong = new Audio();
let currentSongIndex = 0;

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

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/YBkhatra/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    let play = document.querySelector("#play");
    currentSong.src = track;

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
    document.querySelector(".songinfo .artist").textContent = "Yama Buddha";
};

async function main() {
    let play = document.querySelector("#play");
    let previous = document.querySelector("#previous"); // Get previous button
    let next = document.querySelector("#next"); // Get next button

    // Get list of all songs
    songs = await getSongs();

    // Play first song (paused by default)
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    // Show all the songs in the playlist
    let songUL = document
        .querySelector(".songlist")
        .getElementsByTagName("ul")[0];

    // Clear any existing content
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
    Array.from(
        document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

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
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let seekbarWidth = e.currentTarget.getBoundingClientRect().width;
        let clickX = e.offsetX;
        let percentage = (clickX / seekbarWidth) * 100;

        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;

        document.querySelector(".circle").style.left = percentage + "%";
        document.querySelector(".progress").style.width = percentage + "%";

        // jump to clicked part of audio
        if (currentSong.duration) {
            currentSong.currentTime = (percentage / 100) * currentSong.duration;
        }
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

        // Decrement index, wrap around to last song if at beginning
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

        // Increment index, wrap around to first song if at end
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }

        playMusic(songs[currentSongIndex]);
    });

    // keyboard shortcut to pause play (got this on github)
    document.addEventListener("keydown", (e) => {
        // Space bar to play/pause
        if (e.code === "Space") {
            e.preventDefault(); // Prevent page scrolling
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/svgs/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/svgs/play.svg";
            }
        }
    });
    //prevent text copy paste (kearned from :https://youtu.be/ldNXmJAj4Yo) but this wass not what i expected but fine learned something new basically what this dose this is when user copy text or anything from the website technically you can copy but when you want to paste the same content in another page or whereever you want it displays the massage you wrote in this case i think i wrote you can't copy texts or something like that , but what i really want is like the spotify when you try to select the text you cant i think it improves ui experience so i wanted to do that lets see  if i could find any tutorial to learn how to actually do it and how it works 
    document.addEventListener("copy", (event) => {
        const copieedText = window.getSelection().toString();
        event.clipboardData.setData('text/plain', 'You cant copy and paste contents');
        event.preventDefault();
    });

    //got a tutorial on youtube shorts (https://youtube.com/shorts/TDOR3ys6ohs?si=RRHLCgtE46_vgOkc) this will prevent user to do right click 
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    //basically done what i wanted got tutorial on (https://youtu.be/iniISlPcOHU) but have questions like how is it working ??

    addEventListener('selectstart',(e) => {
        e.preventDefault();
    });

}

main();

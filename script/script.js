console.log("Lets Write Some JavaScript");

async function getSongs(){
    let a = await fetch("http://127.0.0.1:5500/songs/YBkhatra/");
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for(let index = 0; index < as.length; index++){
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href);  // CORRECTED LINE
        }
    }
    return songs;
}

async function main(){
    // Get the list of all songs
    let songs = await getSongs();
    console.log(songs);

    // Play first song
    if(songs.length > 0){
        var audio = new Audio(songs[0]);
        audio.play();

        audio.addEventListener("loadeddata", () => {
            let duration = audio.duration;
            console.log("Duration: " + duration);
        });
    } else {
        console.log("No songs found");
    }
}
main();
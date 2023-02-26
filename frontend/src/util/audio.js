onload = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.get('stop')) {
        return;
    }
    let audio = new Audio(urlParams.get('src'));
    let audioDuration = urlParams.get('length');
    audio.volume = urlParams.get('volume');
    audio.play();
    setTimeout(()=>{
        audio.pause();
        audio.currentTime = 0;
    }, audioDuration);
}

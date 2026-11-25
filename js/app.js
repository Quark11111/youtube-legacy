var API_KEY = "AIzaSyCgNsBI2l5UZbBM2QsGhjlQtRPzi8QSurg";

var selectedVideo = 0;
var currentVideoIndex = 0;
var videoItems = [];

// =================================
// ПОИСК ВИДЕО
// =================================

function searchVideos() {

    var query = document.getElementById("search").value;

    if (!query) return;

    closePlayer();

    document.getElementById("videos").innerHTML =
        "<p>Ищем видео...</p>";

    var url =
        "https://www.googleapis.com/youtube/v3/search" +
        "?part=snippet&type=video&maxResults=12" +
        "&q=" + encodeURIComponent(query) +
        "&key=" + API_KEY;

    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4) {

            if (xhr.status === 200) {
                showVideos(JSON.parse(xhr.responseText));
            } else {
                showError(xhr);
            }
        }
    };

    xhr.send();
}

// =================================
// ПОКАЗ ВИДЕО
// =================================

function showVideos(data) {

    var container = document.getElementById("videos");
    var html = "";

    videoItems = [];

    if (!data.items || data.items.length === 0) {
        container.innerHTML = "<p>Видео не найдены</p>";
        return;
    }

    for (var i = 0; i < data.items.length; i++) {

        var video = data.items[i];

        var id = typeof video.id === "string"
            ? video.id
            : video.id.videoId;

        if (!id) continue;

        var index = videoItems.length;

        videoItems.push({
            id: id,
            title: video.snippet.title
        });

        var thumbnail = video.snippet.thumbnails.medium.url;
        var channel = video.snippet.channelTitle;

        html +=
            '<div class="video" data-index="' + index + '">' +
            '<img src="' + thumbnail + '">' +
            '<h3>' + video.snippet.title + '</h3>' +
            '<p>' + channel + '</p>' +
            '</div>';
    }

    container.innerHTML = html;

    var cards = container.getElementsByClassName("video");

    for (var j = 0; j < cards.length; j++) {

        cards[j].onclick = function() {

            var index = parseInt(
                this.getAttribute("data-index"),
                10
            );

            playVideo(videoItems[index].id, index);
        };
    }

    selectedVideo = 0;
    currentVideoIndex = 0;

    updateSelection();
}

// =================================
// ЗАПУСК ВИДЕО
// =================================

function playVideo(videoId, index) {

    if (typeof index === "number") {
        currentVideoIndex = index;
        selectedVideo = index;
    }

    document.getElementById("videos").style.display = "none";

    document.getElementById("player").style.display = "block";

    var player = document.getElementById("youtubePlayer");

    player.src =
        "https://www.youtube.com/embed/" +
        encodeURIComponent(videoId) +
        "?autoplay=1&controls=1&playsinline=1&rel=0";
}

// =================================
// ЗАКРЫТИЕ ПЛЕЕРА
// =================================

function closePlayer() {

    var player = document.getElementById("youtubePlayer");

    player.src = "";

    document.getElementById("player").style.display = "none";

    document.getElementById("videos").style.display = "block";

    updateSelection();
}

// =================================
// СЛЕДУЮЩЕЕ ВИДЕО
// =================================

function playNextVideo() {

    if (videoItems.length === 0) return;

    currentVideoIndex++;

    if (currentVideoIndex >= videoItems.length) {
        currentVideoIndex = 0;
    }

    playVideo(
        videoItems[currentVideoIndex].id,
        currentVideoIndex
    );
}

// =================================
// ПРЕДЫДУЩЕЕ ВИДЕО
// =================================

function playPreviousVideo() {

    if (videoItems.length === 0) return;

    currentVideoIndex--;

    if (currentVideoIndex < 0) {
        currentVideoIndex = videoItems.length - 1;
    }

    playVideo(
        videoItems[currentVideoIndex].id,
        currentVideoIndex
    );
}

// =================================
// РЕКОМЕНДАЦИИ
// =================================

function loadRecommendations() {

    var url =
        "https://www.googleapis.com/youtube/v3/videos" +
        "?part=snippet,status&chart=mostPopular&regionCode=KZ" +
        "&maxResults=50&key=" + API_KEY;

    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);

    xhr.onreadystatechange = function() {

        if (xhr.readyState === 4) {

            if (xhr.status === 200) {

                var data = JSON.parse(xhr.responseText);
                var playable = [];

                for (var i = 0; i < data.items.length; i++) {

                    if (data.items[i].status &&
                        data.items[i].status.embeddable === true) {

                        playable.push(data.items[i]);
                    }
                }

                for (var j = playable.length - 1; j > 0; j--) {

                    var k = Math.floor(Math.random() * (j + 1));

                    var temp = playable[j];
                    playable[j] = playable[k];
                    playable[k] = temp;
                }

                data.items = playable.slice(0, 12);

                showVideos(data);

            } else {
                showError(xhr);
            }
        }
    };

    xhr.send();
}

// =================================
// ОШИБКИ
// =================================

function showError(xhr) {

    document.getElementById("videos").innerHTML =
        "<p>Ошибка: " + xhr.status + "</p>" +
        "<pre>" + xhr.responseText + "</pre>";
}

// =================================
// ВЫДЕЛЕНИЕ ВИДЕО
// =================================

function updateSelection() {

    var videos = document.getElementsByClassName("video");

    for (var i = 0; i < videos.length; i++) {
        videos[i].className = "video";
    }

    if (videos.length > 0 && videos[selectedVideo]) {

        videos[selectedVideo].className = "video selected";

        videos[selectedVideo].scrollIntoView(false);
    }
}

// =================================
// УПРАВЛЕНИЕ ПУЛЬТОМ
// =================================

function handleRemote(event) {

    event = event || window.event;

    var key = event.keyCode;

    var playerVisible =
        document.getElementById("player").style.display === "block";

    if (playerVisible) {

        if (key === 461 || key === 8 || key === 27) {

            closePlayer();

            event.preventDefault();
            event.stopPropagation();

            return false;
        }

        return true;
    }

    if (document.activeElement.id === "search") {

        if (key === 13) {
            searchVideos();
            event.preventDefault();
            return false;
        }

        if (key === 40) {

            document.getElementById("search").blur();

            selectedVideo = 0;
            updateSelection();

            event.preventDefault();
            return false;
        }

        return true;
    }

    var videos = document.getElementsByClassName("video");

    if (videos.length === 0) return true;

    var columns = 4;

    if (key === 38) {

        if (selectedVideo >= columns) {
            selectedVideo -= columns;
        } else {
            document.getElementById("search").focus();
            return false;
        }
    }

    if (key === 40 && selectedVideo + columns < videos.length) {
        selectedVideo += columns;
    }

    if (key === 37 && selectedVideo > 0) {
        selectedVideo--;
    }

    if (key === 39 && selectedVideo < videos.length - 1) {
        selectedVideo++;
    }

    if (key === 13) {
        videos[selectedVideo].click();
        event.preventDefault();
        return false;
    }

    updateSelection();

    event.preventDefault();

    return false;
}

document.addEventListener("keydown", handleRemote, true);

// =================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// =================================

window.onload = function() {
    loadRecommendations();
};


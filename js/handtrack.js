const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let imgindex = 1
let isVideo = false;
let model = null;
let videoInterval = 100;
let Vec2;
let accelFactor;
var first_x = true;
var first_v = true;
var x_ini = 0;
var v_ini = 0;

//let windowXRange, worldXRange = 0

var pauseGameAnimationDuration = 500;


// TestBed Details
windowHeight = 600;//$(document).height()
windowWidth = document.body.clientWidth
var scale_factor = 10
var SPACE_WIDTH = windowWidth / scale_factor;

windowXRange = [0, windowWidth]
worldXRange = [-(SPACE_WIDTH / 2), SPACE_WIDTH / 2]

// video.width = 500
// video.height = 400

/* $(".pauseoverlay").show()
// $(".overlaycenter").text("Game Paused")
$(".overlaycenter").animate({
    opacity: 1,
    fontSize: "4vw"
}, pauseGameAnimationDuration, function () {}); */

const modelParams = {
    flipHorizontal: true, // flip e.g for video  
    maxNumBoxes: 1, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}




function calculateVelocity(x_final) {
    // gamex = x;

    //let actual_x = sessionStorage.getItem("xPosition");
    let veloc_x = (x_final - x_ini) + v_ini;
    //let new_x = actual_x + veloc_x;
    console.log("Velocity=", veloc_x)
    sessionStorage.setItem("Velocity", veloc_x);
    x_ini = x_final;

    //Acceleration
    if(first_v){
        v_ini = veloc_x;
        first_v = false;
    }
    else{
        let Acceleration = (veloc_x - v_ini);
        console.log("Acceleration=", Acceleration)
        sessionStorage.setItem("Acceleration", Acceleration);
        v_ini = veloc_x;
    }

}

trackButton.addEventListener("click", function () {
    toggleVideo();
});




function runDetection() {
    model.detect(video).then(predictions => {
        // console.log("Predictions: ", predictions);
        // get the middle x value of the bounding box and map to paddle location
        model.renderPredictions(predictions, canvas, context, video);

        if (predictions[0]) {
            let midval = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
            gamex = document.body.clientWidth * (midval / video.width)
            if(first_x){
                x_ini = gamex;
                first_x = false;
            }
            else{
                calculateVelocity(gamex)
            }
            
            //console.log(gamex);
            //console.log('Predictions: ', gamex);

        }
        if (isVideo) {
            setTimeout(() => {
                runDetection(video)
            }, videoInterval);
        }
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Press start!"
    trackButton.disabled = false

    $(".overlaycenter").animate({
        opacity: 0,
        fontSize: "0vw"
    }, pauseGameAnimationDuration, function () {
        $(".pauseoverlay").hide()
    });
});


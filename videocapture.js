//Setting video player size
var w = $(window).width();
$('#input').css('top', 0);
$('#input').css('left', w/2);

//Checking if supported
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

//Setting video/audio constraints
var constraints = {audio: true,video: {  width: { min: 320, ideal: 320, max: 1280 },  height: { min: 240, ideal: 240, max: 720 }}};

var recBtn = document.querySelector('button#rec');
var pauseResBtn = document.querySelector('button#pauseRes');
var stopBtn = document.querySelector('button#stop');

var videoElement = document.querySelector('video');

videoElement.controls = false;

function errorCallback(error){
  console.log('navigator.getUserMedia error: ', error);
}

//Adding a new mediasource to handle User Media
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var sourceBuffer;


var mediaRecorder;
var chunks = [];

//Using MediaRecorder API to store frame by frame in an array
function startRecording(stream) {
  mediaRecorder = new MediaRecorder(stream);
  
  pauseResBtn.textContent = "Pause";
  
  mediaRecorder.start(10);
   
  var url = window.URL || window.webkitURL;
  videoElement.src = url ? url.createObjectURL(stream) : stream;
  videoElement.play();
  
  mediaRecorder.ondataavailable = function(e) {
	chunks.push(e.data);
  };

  mediaRecorder.onerror = function(e){
    console.log('Error: ', e);
  };


  mediaRecorder.onstart = function(){
	if(frameid.innerHTML.length>0)
		stoprendering(frameid.innerHTML);
  };

  mediaRecorder.onstop = function(){
    
	//Creating blob file out of frames stored in chunks
    var blob = new Blob(chunks, {type: "video/webm"});
    chunks = [];

    var videoURL = window.URL.createObjectURL(blob);
    
    downloadLink.href = videoURL;
    videoElement.src = videoURL;
    downloadLink.innerHTML = 'Download video file';
    
    var rand =  Math.floor((Math.random() * 10000000));
    var name  = "video_"+rand+".webm" ;
    
	//Sending video file to server
	
	var fd = new FormData();
	var a='apple';
	fd.append("myfile", blob, name);
	$.ajax({
	type: 'POST',
    url: 'bob.php',
    data: a,
    processData: false,
    contentType: false,
	success: function (result) 
	{
			model(result);
	},
	error: function(jqXHR, textStatus, errorThrown)
	{
	    console.log(textStatus, errorThrown);
	}
	});
    
  };
}

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

//Handling UI changes like button state
  function onBtnRecordClicked (){
	 if (typeof MediaRecorder === 'undefined' || !navigator.getUserMedia) {
	    alert('MediaRecorder not supported on your browser, use Firefox 41 or Chrome 47 instead.');
	  }else {
	    navigator.getUserMedia(constraints, startRecording, errorCallback);
	    recBtn.disabled = true;
	    pauseResBtn.disabled = false;
	    stopBtn.disabled = false;
	  }
  }
  
  function onBtnStopClicked(){
	mediaRecorder.stop(); 
	videoElement.controls = true;
	
	recBtn.disabled = false;
	pauseResBtn.disabled = true;
	stopBtn.disabled = true;	
  }
  
  function onPauseResumeClicked(){
	 
	if(pauseResBtn.textContent === "Pause"){
		
		console.log("pause");
		
		pauseResBtn.textContent = "Resume";
		mediaRecorder.pause(); 
		
		stopBtn.disabled = true;
		
	}else{
		console.log("resume");
		
		pauseResBtn.textContent = "Pause";
		mediaRecorder.resume();
		
		stopBtn.disabled = false;
	}
	 
	recBtn.disabled = true;
	pauseResBtn.disabled = false;
	  
  }

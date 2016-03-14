'use strict';

//Setting video player settings
var w = $(window).width();
$('#input').css('top', 0);
$('#input').css('left', w / 2);

//Checking for support
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;


//Setting constraints according to browser
if (getBrowser() == "Chrome")
{
	var constraints = {
		"audio": false,
		"video":
		{
			"mandatory":
			{
				"minWidth": 320,
				"maxWidth": 320,
				"minHeight": 240,
				"maxHeight": 240
			},
			"optional": []
		}
	}; //Chrome
}
else if (getBrowser() == "Firefox")
{
	var constraints = {
		audio: true,
		video:
		{
			width:
			{
				min: 320,
				ideal: 320,
				max: 1280
			},
			height:
			{
				min: 240,
				ideal: 240,
				max: 720
			}
		}
	}; //Firefox
}

//Button access
var recBtn = document.querySelector('button#rec');
var pauseResBtn = document.querySelector('button#pauseRes');
var stopBtn = document.querySelector('button#stop');

var videoElement = document.querySelector('video');
var dataElement = document.querySelector('#data');
var downloadLink = document.querySelector('a#downloadLink');

videoElement.controls = false;

function errorCallback(error)
{
	console.log('navigator.getUserMedia error: ', error);
}

//Media source to handle immediate video input
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var sourceBuffer;

//Chunks array to hold frames
var mediaRecorder;
var chunks = [];

//Media Recorder API to record frame by frame
function startRecording(stream)
{
	log('Starting...');
	mediaRecorder = new MediaRecorder(stream);

	pauseResBtn.textContent = "Pause";

	mediaRecorder.start(10);

	var url = window.URL || window.webkitURL;
	videoElement.src = url ? url.createObjectURL(stream) : stream;
	videoElement.play();

	mediaRecorder.ondataavailable = function(e)
	{
		chunks.push(e.data);


	};

	mediaRecorder.onerror = function(e)
	{
		log('Error: ' + e);
		console.log('Error: ', e);
	};

	//Starting recorder
	mediaRecorder.onstart = function()
	{
		log('Started & state = ' + mediaRecorder.state);
		//stopping simulation
		if (frameid.innerHTML.length > 0)
			stoprendering(frameid.innerHTML);
	};

	//Stopping recorder
	mediaRecorder.onstop = function()
	{
		log('Stopped  & state = ' + mediaRecorder.state);

		//Creating blob/WebM file
		var blob = new Blob(chunks,
		{
			type: "video/webm"
		});
		chunks = [];

		var videoURL = window.URL.createObjectURL(blob);

		downloadLink.href = videoURL;
		videoElement.src = videoURL;
		downloadLink.innerHTML = 'Download video file';

		var rand = Math.floor((Math.random() * 123456));
		var name = "video_" + rand + ".webm";

		//Creating a download link for the video file
		downloadLink.setAttribute("download", name);
		downloadLink.setAttribute("name", name);

		//Sending to server
		var fd = new FormData();
		fd.append("file", blob, name);
		$.ajax(
		{
			type: 'POST',
			url: 'http://localhost:8000/upload',
			data: fd,
			processData: false,
			contentType: false,
			success: function(result)
			{
				model(result);
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				console.log(textStatus, errorThrown);
			}
		});

	};
	//Logging state of recorder
	mediaRecorder.onpause = function()
	{
		log('Paused & state = ' + mediaRecorder.state);
	}

	mediaRecorder.onresume = function()
	{
		log('Resumed  & state = ' + mediaRecorder.state);
	}

	mediaRecorder.onwarning = function(e)
	{
		log('Warning: ' + e);
	};
}

function handleSourceOpen(event)
{
	console.log('MediaSource opened');
	sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
	console.log('Source buffer: ', sourceBuffer);
}

//Checking for MediaRecorder support
function onBtnRecordClicked()
{
	if (typeof MediaRecorder === 'undefined' || !navigator.getUserMedia)
	{
		alert('MediaRecorder not supported on your browser, use Firefox 41 or Chrome 47 instead.');
	}
	else
	{
		navigator.getUserMedia(constraints, startRecording, errorCallback);
		recBtn.disabled = true;
		pauseResBtn.disabled = false;
		stopBtn.disabled = false;
	}
}

function onBtnStopClicked()
{
	mediaRecorder.stop();
	videoElement.controls = true;

	recBtn.disabled = false;
	pauseResBtn.disabled = true;
	stopBtn.disabled = true;
}

function onPauseResumeClicked()
{

	if (pauseResBtn.textContent === "Pause")
	{

		console.log("pause");

		pauseResBtn.textContent = "Resume";
		mediaRecorder.pause();

		stopBtn.disabled = true;

	}
	else
	{
		console.log("resume");

		pauseResBtn.textContent = "Pause";
		mediaRecorder.resume();

		stopBtn.disabled = false;
	}

	recBtn.disabled = true;
	pauseResBtn.disabled = false;

}

//To print logs
function log(message)
{
	dataElement.innerHTML = message + '<br>' + dataElement.innerHTML;
}


//Useful function to get browser ID
function getBrowser()
{

	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName = navigator.appName;
	var fullVersion = '' + parseFloat(navigator.appVersion);
	var majorVersion = parseInt(navigator.appVersion, 10);
	var nameOffset, verOffset, ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset = nAgt.indexOf("Opera")) != -1)
	{
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset + 6);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset = nAgt.indexOf("MSIE")) != -1)
	{
		browserName = "Microsoft Internet Explorer";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In Chrome, the true version is after "Chrome"
	else if ((verOffset = nAgt.indexOf("Chrome")) != -1)
	{
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset + 7);
	}
	// In Safari, the true version is after "Safari" or after "Version"
	else if ((verOffset = nAgt.indexOf("Safari")) != -1)
	{
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Firefox, the true version is after "Firefox"
	else if ((verOffset = nAgt.indexOf("Firefox")) != -1)
	{
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset + 8);
	}
	// In most other browsers, "name/version" is at the end of userAgent
	else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
		(verOffset = nAgt.lastIndexOf('/')))
	{
		browserName = nAgt.substring(nameOffset, verOffset);
		fullVersion = nAgt.substring(verOffset + 1);
		if (browserName.toLowerCase() == browserName.toUpperCase())
		{
			browserName = navigator.appName;
		}
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix = fullVersion.indexOf(";")) != -1)
		fullVersion = fullVersion.substring(0, ix);
	if ((ix = fullVersion.indexOf(" ")) != -1)
		fullVersion = fullVersion.substring(0, ix);

	majorVersion = parseInt('' + fullVersion, 10);
	if (isNaN(majorVersion))
	{
		fullVersion = '' + parseFloat(navigator.appVersion);
		majorVersion = parseInt(navigator.appVersion, 10);
	}


	return browserName;

}

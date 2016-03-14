# delta-hack

(for lack of a better name)
Made as part of the hackathon by delta. 

### TODO

- [ ] Fix: Doesn't work well if other objects are present in background
- [ ] Add screenshots

### Description

The objective was to read in a video and determine the dimensions of any cuboidal or spherical object in it and render it in the browser using WebGL.

### Requirements
python-opencv  
flask  
flask-cors  
numpy  
```bash
  sudo apt-get install python-opencv
  (sudo) pip install -U flask flask-cors numpy
```  

### Usage:

- Clone the repo and navigate to delta-hack directory  
- run `python main.py`  
- Open index.html (Either save the repo to your web server root or run `python -m SimpleHTTPServer 8888`)  
- Record a video with your webcam and submit. Wait for the image to be rendered.



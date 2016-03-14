from flask import *
from werkzeug import secure_filename
import numpy as np
import cv2
import os

from flask.ext.cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app,resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = set(['png', 'jpg', 'jpeg', 'gif'])


@app.route('/upload', methods=['POST'])
@cross_origin()
def upload():
    """
    Route to upload video
    """
    file = request.files['file']
    if file:
        filename = secure_filename(file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.mkdir(app.config['UPLOAD_FOLDER'])
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        try:
            shape, clist = video_handler(path)
            return jsonify(type=shape, l=clist[0], b=clist[1], h=clist[2])
        except:
            return jsonify(type='cuboid', l=100, b=100, h=100)


@app.route('/uploadi', methods=['POST'])
def uploadi():
    """
    Route to upload images
    """
    file = request.files['file']
    if file:
        filename = secure_filename(file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.mkdir(app.config['UPLOAD_FOLDER'])
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        shape, clist = rect_coordinates(path)
        return jsonify(shape=shape, r=[i[0] for i in clist], x=[
            i[1] for i in clist], y=[i[2] for i in clist])


def video_handler(path):
    """
    Reads video data into frames
    """
    cap = cv2.VideoCapture(path)
    coord = []
    while(cap.isOpened()) and len(coord) < 1:
        ret, frame = cap.read()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        cv2.imshow('frame', gray)
        if not os.path.exists('tmp'):
            os.mkdir('tmp')
        cv2.imwrite('tmp/v.png', frame)
        if rect_coordinates('tmp/v.png') is not None:
            coord.append(rect_coordinates('tmp/v.png'))
    # print coord
    a, b, c = sum([i[1][0][0] for i in coord]), sum([i[1][0][1]
                                                     for i in coord]), sum([i[1][0][2] for i in coord])
    return coord[0][0], [a, b, c]


def rect_coordinates(path):
    """
    Where everything happens.
    Detects shape and sends back in case of
    cuboid: shape, dimensions
    sphere: shape, radius, center
    """
    image = cv2.imread(path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    edged = cv2.Canny(gray, 10, 250)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
    closed = cv2.morphologyEx(edged, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(closed.copy(), cv2.RETR_EXTERNAL,
                                   cv2.CHAIN_APPROX_SIMPLE)
    total = 0
    rect = []
    for c in contours:
        perimeter = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.01 * perimeter, True)
        cv2.drawContours(image, [approx], -1, (0, 255, 0), len(approx))
        total += 1

        if approx.shape[0] == 6:
            # to check usability of frame
            # frame is usable if the first three detected lengths are
            # approximately equal to the next three detected lengths
            # respectively
            x = sides(approx[:3])
            y = sides(approx[3:])
            if okay(x, y):
                rect.append((x[0] + y[0], x[1] + y[1], x[2] + y[2]))
    if len(rect) > 0:
        return "cuboid", rect
    # for spheres
    circles = cv2.HoughCircles(gray, cv2.cv.CV_HOUGH_GRADIENT, 1.2, 100)
    if circles is not None:
        clist = []
        for (x, y, r) in np.round(circles[0, :]).astype("int"):
            clist.append((r, x, y))
        return "sphere", clist


def okay(x, y):
    """
    Utility function to check ratios corresponding sides.
    """
    for i in range(3):
        r = x[i] / y[i]
        if r > 1.2 or r < 0.8:
            return False
    return True


def slen(a, b):
    """
    returns length of line segment between points a and b
    """
    a, b = a[0], b[0]
    return ((a[0] - b[0])**2 + (a[1] - b[1])**2)**0.5


def sides(pt):
    """side length.

    calculates the length, breadth and height of a cuboid

    Arguments:
        pt {numpy array} -- contains the 6 outer coordinates of the cuboid

    Returns:
        [tuple] -- length, breadth, height
    """
    a = slen(pt[2], pt[0])
    b = slen(pt[1], pt[2])
    c = slen(pt[0], pt[1])
    return a, b, c

if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=int("8000"),
        debug=True
    )

import numpy as np
import cv2
from sys import argv


def play(path):
    """
    Read a video frame by frame and play it
    """
    cap = cv2.VideoCapture(path)

    while(cap.isOpened()):
        ret, frame = cap.read()

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        cv2.imshow('frame', gray)
        cv2.imwrite('tmp/v.png', gray)
        cv2.waitKey(0)
        if cv2.waitKey(1) & 0xFF == ord('q'):  # Esc
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    play(argv[1])

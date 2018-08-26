""" Record gaze data """
from array import array
from enum import IntEnum
from recording.liblsl.pylsl import pylsl
from player.helpers import dbmanager as db

class Record(IntEnum):
    """ Different states of the recording device """
    IDLE = 0 # initial state : do not record / paused
    RECORDING = 1 # record
    STOP = 2 # stop recording and analyze data
    ABORT = 3 # stop recording and don't analyze data

class Fixation:
    """ Container for fixations """
    x = 0.0
    y = 0.0
    start = 0.0
    stop = 0.0

    def __init__(self, x, y, start, stop):
        self.x = x
        self.y = y
        self.start = start
        self.stop = stop

# Thread worker for listening to sensor stream
def gazelistener():
    """ TODO add elaborate description """
    # some globals...yay
    global doRecord
    doRecord = Record(0)
    global gaze_user_id
    gaze_user_id = 0
    global gaze_video_id
    gaze_video_id = 0

    #compute_similarity()
    #db.update_all_similarities()

    print('looking for a Gaze stream...')
    streams = pylsl.resolve_stream('type', 'Gaze') # search for stream
    inlet = pylsl.StreamInlet(streams[0]) # create inlet for stream

    # Listen to stream while thread is running
    x_coords = array('d')
    y_coords = array('d')
    time = array('d')

    while True:
        sample, timestamp = inlet.pull_sample()

        if doRecord == 0:
            # IDLE / PAUSED
            print('Do record(0):', doRecord)
        elif doRecord == 1:
            # RECORDING
            time.append(timestamp)
            x_coords.append(sample[0])
            y_coords.append(sample[1])
            print('Do record(1):', doRecord)
        elif doRecord == 2:
            # STOP
            print('Do record(2):', doRecord)
            # calculate fixations
            # can't record until fixation calculation is done
            fixations = fixation_detection(time, x_coords, y_coords)
            # store fixations
            db.store_fixations(gaze_user_id, gaze_video_id, fixations)
            # reset state and gaze data
            doRecord = Record(0)
            x_coords = array('d')
            y_coords = array('d')
            time = array('d')
        elif doRecord == 3:
            #ABORT
            print('Do record(3)', doRecord)
            # reset state and gaze data
            doRecord = Record(0)
            x_coords = array('d')
            y_coords = array('d')
            time = array('d')

    return # never reached

#########################################################################
# Fixation detection algorithm
#
# parameters:
# t:float = timestamps
# x:float = x coordinates of gaze
# y:float = y coordinates of gaze
# maxdist:int = maximum distance between two gazepoints in one fixation
# mindur:float = minimum duration of a fixation
#
# return: fixations:list = list of fixations
#########################################################################

def fixation_detection(t, x, y, maxdist=25, mindur=0.2):
    """ Fixation detection algorithm """
    # output list
    fixations = []
    # temporary fixation list
    fix = [0]
    # temporary center of fixation
    sum_x = sum_y = 0
    # iterate over all points
    for i in range(1, len(t)):
        # calculate temporary fixation center
        sum_x += x[i-1]
        mean_x = sum_x / len(fix)
        sum_y += y[i-1]
        mean_y = sum_y / len(fix)
        # calculate point to point euklidean distance
        dist = ((mean_x-x[i])**2 + (mean_y-y[i])**2)**0.5
        # save index if distance is short enough
        if dist <= maxdist:
            fix.append(i)
        elif dist > maxdist:
            # if fixation duration is long enough...
            if t[i-1] - t[fix[0]] > mindur:
                temp_x = 0
                temp_y = 0
                # accumulate all x coordinates and all y coordinates
                for j in fix:
                    temp_x += x[j]
                    temp_y += y[j]
                # write duration and centroid of fixation into return list
                fixations.append(Fixation(temp_x / len(fix),
                                          temp_y / len(fix),
                                          t[fix[0]] - t[0], t[i-1] - t[0]))
            # empty temporary fixation array and push index of latest point into it
            fix = [i]
            # reset cumulated x and y
            sum_x = sum_y = 0

    return fixations

############################################################################
# parameters:
# dist:Int = max allowed distance between two fixation points to count as overlapping
############################################################################

# TODO: find place to call function
def compute_similarity(dist=50):
    """ computes and uploads one similarity value
    for each user pair for each video watched """
    to_do = db.missing_similarity_calculations()
    for elem in to_do:
        # load fixations from DB
        fix_u1 = db.load_fixations(elem[0], elem[2])
        fix_u2 = db.load_fixations(elem[1], elem[2])
        # acquire average video values
        alpha = db.get_avg_fix_count(elem[2]) # avg fixation count
        beta = db.get_avg_fix_dur(elem[2]) # avg fixation duration
        # temporaries
        overlap_count = 0
        overlap_dur = 0
        # iterate over all fixations of user 1
        for f_1 in fix_u1:
            # iterate over all fixations of user 2
            for f_2 in fix_u2:
                # do the two fixations overlap regarding time?
                if f_1.StopTime > f_2.StartTime and f_1.StartTime < f_2.StopTime:
                    # do the fixations overlap regarding position?
                    if ((f_1.PosX-f_2.PosX)**2 + (f_1.PosY-f_2.PosY)**2)**0.5 <= dist:
                        overlap_dur += (min(f_1.StopTime, f_2.StopTime)
                                        - max(f_1.StartTime, f_2.StartTime))
                        overlap_count += 1
                # if there are no more overlaps with this fixation end this iteration
                elif f_2.StartTime > f_1.StopTime:
                    break
        # apply scale
        db.update_user_similarity_for_video(elem[0], elem[1], elem[2],
                                            (scale_value(overlap_count, alpha)
                                             + scale_value(overlap_dur, beta)) / 2)


def scale_value(value, scale):
    """ scale value """
    if value >= 3 * scale / 4:
        return 1
    elif value >= scale / 2:
        return 0.75
    elif value >= scale / 4:
        return 0.5
    elif value > 0:
        return 0.25
    else:
        return 0



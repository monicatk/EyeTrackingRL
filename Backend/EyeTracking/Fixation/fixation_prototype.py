# Import packages
import xdf
import numpy as np
import matplotlib.pyplot as plt

###############################################################################
class FixationContainer:
	x = []
	y = []
	dur = []
	start = []
	stop = []

###############################################################################
# Extract stream by name
def extractStream(name, streams):
    
    # Go over streams and search for name
    for i in range(len(streams[0])):
        if streams[0][i]['info']['name'][0] == name:
            return streams[0][i]
    return streams[0][0]
###############################################################################



#################################################################################
# Parameters:																	
# x 		= array of x-soordinates											
# y 		= array of y-coordinates											
# t 		= array of timestamps												
# maxdist 	= maximal allowed distance between points of a fixation 			
# mindur	= minimal allowed duration of a fixation  							
#																				
# return:																		
# list[start_timestamp, end_timestamp, duration, x_centroid, y_centroid, ...]			
#################################################################################

################################################################
# !!!algorithm doesnt take the last two points into account!!! 
################################################################
def fixationDetection(x, y, t, maxdist=25, mindur=0.2):

	# output object
	fixations = FixationContainer()
	# temporary fixation list
	fix = [0]
	# iterate over all points
	for i in range(1, len(t)):
		# calculate point to point euklidic distance
		dist = ((x[i-1]-x[i])**2 + (y[i-1]-y[i])**2)**0.5
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
				# write start, stop, duration and centroid of fixation into return list
				fixations.start.append(t[fix[0]])			# start
				fixations.stop.append(t[i-1])				# stop
				fixations.dur.append(t[i-1] - t[fix[0]])	# duration
				fixations.x.append(temp_x / len(fix))	# centroid x
				fixations.y.append(temp_y / len(fix))	# centroid y
			# empty temporary fixation array and push index of latest point into it
			fix = [i]

	return fixations



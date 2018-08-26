# -*- coding: utf-8 -*-
"""
Created on Sat Jan  7 14:56:00 2017

@author: Yessi
"""

# Import packages
import xdf
import numpy as np
import json

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
# simple fixation detection algorithm
#
# Parameters:																	
# x 		= array of x-coordinates											
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
				# write duration and centroid of fixation into return list
				fixations.x.append(temp_x / len(fix))		# centroid x
				fixations.y.append(temp_y / len(fix))		# centroid y
				fixations.dur.append(t[i-1] - t[fix[0]])	# duration
				fixations.start.append(t[fix[0]])			# start
				fixations.stop.append(t[i-1])				# stop
			# empty temporary fixation array and push index of latest point into it
			fix = [i]

	return fixations

###############################################################################	

#########################################################
# writes x-, y-coordinates and duration to .json file
#
# parameters:											
# fixations: an object of the class FixationContainer	
#########################################################

def saveAsJson(fixations):
	# create new list
	dictlist = []
	# fill list with the dictionaries containing the values from fixations
	for i in range(0, len(fixations.x)):
		# each dictionary has the values x, y and duration
		d = {'x': fixations.x[i], 'y': fixations.y[i], 'duration': fixations.dur[i]}
		# add dictionary to list
		dictlist.append(d) 

	# write dictlist to json file	
	with open ('fixations.json', 'w') as file:
		file.write('var fix2 = ')
		json.dump(dictlist, file)


# also writes the start and stop values to .json file
def saveAsJsonExt(fixations):
	# create new list
	dictlist = []
	# fill list with the dictionaries containing the values from fixations
	for i in range(0, len(fixations.x)):
		# each dictionary has the values x, y and duration
		d = {'x': fixations.x[i], 'y': fixations.y[i], 'duration': fixations.dur[i], 'start': fixations.start[i], 'stop': fixations.stop[i]}
		# add dictionary to list
		dictlist.append(d) 

	# write dictlist to json file	
	with open ('fixations_ext.json', 'w') as file:
		file.write('var fix = ')
		json.dump(dictlist, file)


#############
#	Main	
#############

# Load streams into object
# Video URL: https://www.youtube.com/watch?v=dW1BIid8Osg
streams = xdf.load_xdf(r"GuardiansOfTheGalaxyVol2.xdf", None, False)

# Extract streams
gazestream = extractStream('iViewXLSL', streams)

# Extract gaze coordinates
gazeX = gazestream['time_series'][:,0]
gazeY = gazestream['time_series'][:,1]
gazeTimes = gazestream['time_stamps'] # according times in seconds

# timestamps start from 0 
time = gazeTimes - gazeTimes[0]

# compute fixations
fixations = fixationDetection(gazeX, gazeY, time)

# write into .json files
saveAsJson(fixations)

saveAsJsonExt(fixations)
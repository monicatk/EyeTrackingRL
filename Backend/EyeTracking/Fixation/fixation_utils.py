# Import packages
import xdf
import json

###############################################################################
class Fixation:
	x = 0.0
	y = 0.0
	dur = 0.0
	start = 0.0
	stop = 0.0

	def __init__(self, x, y, start, stop):
		self.x = x
		self.y = y
		self.start = start
		self.stop = stop
		self.dur = stop - start


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
# x 		= array of x-soordinates											
# y 		= array of y-coordinates											
# t 		= array of timestamps												
# maxdist 	= maximal allowed distance between points of a fixation 			
# mindur	= minimal allowed duration of a fixation  							
#																				
# return:																		
# list[Fixation-objects]	
#################################################################################

################################################################
# !!!algorithm doesnt take the last two points into account!!! 
################################################################
def fixationDetection(x, y, t, maxdist=25, mindur=0.2):

	# output list
	fixations = []
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
				fixations.append(Fixation(temp_x / len(fix), temp_y / len(fix), t[fix[0]], t[i-1]))
			# empty temporary fixation array and push index of latest point into it
			fix = [i]

	return fixations

###############################################################################	

#########################################################
# writes x-, y-coordinates and duration to .json file
#
# parameters:											
# fixations: a list containing Fixation objects	
#########################################################

def saveAsJson(fixations, filename):
	# create new list
	dictlist = []
	# fill list with the dictionaries containing the values from fixations
	for i in range(0, len(fixations)):
		# each dictionary has the values x, y and duration
		d = {'x': fixations[i].x, 'y': fixations[i].y, 'duration': fixations[i].dur}
		# add dictionary to list
		dictlist.append(d) 

	# write dictlist to json file	
	with open (filename + '.json', 'w') as file:
		json.dump(dictlist, file)


# also writes the start and stop values to .json file
def saveAsJsonExt(fixations, filename):
	# create new list
	dictlist = []
	# fill list with the dictionaries containing the values from fixations
	for i in range(0, len(fixations)):
		# each dictionary has the values x, y and duration
		d = {'x': fixations[i].x, 'y': fixations[i].y, 'duration': fixations[i].dur, 'start': fixations[i].start, 'stop': fixations[i].stop}
		# add dictionary to list
		dictlist.append(d) 

	# write dictlist to json file	
	with open (filename + '.json', 'w') as file:
		json.dump(dictlist, file)

####################################################################################
# function to crop a list of fixations if there is a long blink (x == 0 for > 1sec)
#
# parameter:
# fixations: a list of Fixation objects
# return: a list of Fixation Objects
####################################################################################

def cropFixations(fixations):
	for i in range(0, len(fixations)):
		if fixations[i].x == 0 and fixations[i].dur > 1:
			for j in range(i, -1, -1):
				del fixations[j]
			return fixations


# Load streams into object
# Video URL: https://www.youtube.com/watch?v=dW1BIid8Osg
streams = xdf.load_xdf(r"C:/Users/Jannis/Documents/Studium/Module/Andere/5.Semester/Projektpraktikum/LabRecorder/Recordings/GotG2_Raphael.xdf", None, False)

# Extract streams
gazestream = extractStream('iViewXLSL', streams)

# Extract gaze coordinates
gazeX = gazestream['time_series'][:,0]
gazeY = gazestream['time_series'][:,1]
gazeTimes = gazestream['time_stamps'] # according times in seconds

time = gazeTimes - gazeTimes[0]

#############
#	Main	
#############

if __name__ == "__main__":

	# detect fixations 
	fixations = fixationDetection(gazeX, gazeY, time)

	# crop at long blink location
	fixation = cropFixations(fixations)

	# write into .json files
	saveAsJson(fixation, fixations)

	saveAsJsonExt(fixation, fixations_ext)

	# print fixations for a user to read

	print("start", end="\t\t\t")
	print("stop", end="\t\t\t")
	print("duration", end="\t\t")
	print("x-coord", end="\t\t\t")	
	print("y-coord")				


	for i in range(0, len(fixation)):
		#start
		if fixation[i].start == 0:
			print(fixation[i].start, end="\t\t\t")
		else:
			print(fixation[i].start, end="\t\t")	
		#end
		print(fixation[i].stop, end="\t\t")	
		#duration
		print(fixation[i].dur, end="\t\t")
		#x-coord
		if fixation[i].x == 0:
			print(fixation[i].x, end="\t\t\t")
		else:
			print(fixation[i].x, end="\t\t")
		#y-coord
		print(fixation[i].y)	
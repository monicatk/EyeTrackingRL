# Import packages
import xdf
import json
import matplotlib.pyplot as plt

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

class FixationList:
	fixations = []
	user = ''
	video = ''

	def __init__(self, fixations, user, video):
		self.fixations = fixations
		self.user = user
		self.video = video


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
def fixationDetection(x, y, t, user, video, maxdist=25, mindur=0.2):

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

	return FixationList(fixations, user, video)



############################################################################
# compares the fixations of users for specific time intervalls (50px dist)
# parameters: 
# fu_1: list of Fixation objects
# fu_2: list of Fixation objects
# dist: max allowed distance between two fixation points to count as overlapping
# offset: min required overlap percentage (values from 0 to 1)
#
# return:
# [int: amount fixations user 1, float: duration fixations user 1
#  int: amount fixations user 2, float: duration fixations user 2
#  int: amount overlapping fixations, float: duration of overlapping fixations
#  list[Fixation]: overlapping fixations user 1, 
#  list[Fixation]: overlapping fixations user 2]
############################################################################
class Overlap:
	fix_count_1 = 0
	fix_count_2 = 0
	fix_dur_1 = 0.0
	fix_dur_2 = 0.0
	over_count = 0
	over_dur = 0.0
	over_count_n = 0.0
	over_dur_n = 0.0
	fix_1 = []
	fix_2 = []
	user_1 = ''
	user_2 = ''
	video = ''

	def __init__(self, fix_count_1, fix_count_2, 
				 fix_dur_1, fix_dur_2, over_count,
				 over_dur, fix_1, fix_2, user_1, user_2, video):
		self.fix_count_1 = fix_count_1
		self.fix_count_2 = fix_count_2
		self.fix_dur_1 = fix_dur_1
		self.fix_dur_2 = fix_dur_2
		self.over_count = over_count
		self.over_dur = over_dur
		self.fix_1 = fix_1
		self.fix_2 = fix_2
		self.user_1 = user_1
		self.user_2 = user_2
		self.video = video



def findOverlappingFix(fu_1, fu_2, dist, min_overlap):
	# amount of overlapping fixations
	overlap_count = 0
	# duration of overlapping fixations
	overlap_dur = 0
	# duration of all fixations per user
	fix_dur_1 = 0
	fix_dur_2 = 0
	# lists for found fixations
	fix_list_1 = []
	fix_list_2 = []
	# iterate over all fixations in fu_1
	for u1 in fu_1.fixations:
		# compute overall fiixation duration of user 1
		fix_dur_1 += u1.dur
		# iterate over all fixations in fu_2
		for u2 in fu_2.fixations:
			# do the two fixations overlap regarding time?
			if (u1.stop > u2.start and u1.start < u2.stop):
				# make sure the overlap is significant
				if ((min(u1.stop, u2.stop) - max(u1.start, u2.start))
						/ ((u1.dur + u2.dur) / 2) > min_overlap):
					# do the fixations overlap regarding position?
					if ((u1.x-u2.x)**2 + (u1.y-u2.y)**2)**0.5 <= dist:
						overlap_count += 1
						overlap_dur += min(u1.stop, u2.stop) - max(u1.start, u2.start)
						fix_list_1.append(u1)
						fix_list_2.append(u2)
			# if there are no more possible overlaps with this fu_1 fixation end this iteration			
			elif u2.start > u1.stop:
				break
	# compute overall fixation duration of user 2
	for u2 in fu_2.fixations:
		fix_dur_2 += u2.dur

	return Overlap(len(fu_1.fixations), len(fu_2.fixations), fix_dur_1, 
	               fix_dur_2, overlap_count, overlap_dur,
	               fix_list_1, fix_list_2, fu_1.user, fu_2.user, fu_1.video)


#########################################################
# 
# parameters: 
# 	path: a string containing the directory to the data
#	users: a list of strings with usernames
#	videos a list of strings with videonames
#
# return: [Overlap]
#########################################################
def massAnalysis(path, users, videos):
	overlap_list = []
	s = 1
	print('computing...')
	for u1 in users:
		for i in range(s, len(users)):
			for v in videos:
				# load data from xdf files
				streams_1 = xdf.load_xdf(path + u1 + '_' + v + '.xdf', None, False)
				streams_2 = xdf.load_xdf(path + users[i] + '_' + v + '.xdf', None, False)
				# extract gaze streams
				gazestream_1 = extractStream('iViewXLSL', streams_1)
				gazestream_2 = extractStream('iViewXLSL', streams_2)
				# Extract gaze coordinates user 1
				gazeX_1 = gazestream_1['time_series'][:,0]
				gazeY_1 = gazestream_1['time_series'][:,1]
				gazetimes_1 = gazestream_1['time_stamps']
				gtime_1 = gazetimes_1 - gazetimes_1[0]
				# Extract gaze coordinates user 1
				gazeX_2 = gazestream_2['time_series'][:,0]
				gazeY_2 = gazestream_2['time_series'][:,1]
				gazetimes_2 = gazestream_2['time_stamps']
				gtime_2 = gazetimes_2 - gazetimes_2[0]
				# get fixations
				fixations_1 = fixationDetection(gazeX_1, gazeY_1, gtime_1, u1, v)
				fixations_2 = fixationDetection(gazeX_2, gazeY_2, gtime_2, users[i], v)
				#crop at blink locations
				cropFixations(fixations_1)
				cropFixations(fixations_2)
				# get overlapping fixations
				overlap_list.append(findOverlappingFix(fixations_1, fixations_2, 50, 0))
		s += 1
	return overlap_list

def massAnalysis2(path, users, videos):
	overlap_list = []
	s = 1
	print('computing...')
	for u1 in users:
		print('[', int((users.index(u1)/len(users))* 100), '% ]')
		for u2 in users:
			if u1 != u2:
				for v in videos:
					# load data from xdf files
					streams_1 = xdf.load_xdf(path + u1 + '_' + v + '.xdf', None, False)
					streams_2 = xdf.load_xdf(path + u2 + '_' + v + '.xdf', None, False)
					# extract gaze streams
					gazestream_1 = extractStream('iViewXLSL', streams_1)
					gazestream_2 = extractStream('iViewXLSL', streams_2)
					# Extract gaze coordinates user 1
					gazeX_1 = gazestream_1['time_series'][:,0]
					gazeY_1 = gazestream_1['time_series'][:,1]
					gazetimes_1 = gazestream_1['time_stamps']
					gtime_1 = gazetimes_1 - gazetimes_1[0]
					# Extract gaze coordinates user 1
					gazeX_2 = gazestream_2['time_series'][:,0]
					gazeY_2 = gazestream_2['time_series'][:,1]
					gazetimes_2 = gazestream_2['time_stamps']
					gtime_2 = gazetimes_2 - gazetimes_2[0]
					# get fixations
					fixations_1 = fixationDetection(gazeX_1, gazeY_1, gtime_1, u1, v)
					fixations_2 = fixationDetection(gazeX_2, gazeY_2, gtime_2, u2, v)
					#crop at blink locations
					cropFixations(fixations_1)
					cropFixations(fixations_2)
					# get overlapping fixations
					overlap_list.append(findOverlappingFix(fixations_1, fixations_2, 50, 0.5))
		s += 1
	return overlap_list

########################################################
# computes per video mean values
#
# parameters:
# 	overlap_list
#	video_name
#	video_dur
#########################################
def getMeanValues(overlap_list, video_name, video_dur):
	overlap_list = [x for x in overlap_list if x.video == video_name]
	mean_over_dur = 0
	mean_over_count = 0
	mean_over_dur_n = 0
	mean_over_count_n = 0
	# normalize
	for o in overlap_list:
		# compute per second values
		o.over_dur_n = o.over_dur / video_dur
		o.over_count_n = o.over_count / video_dur
		# add up all overlap durations / overlaps
		mean_over_dur += o.over_dur
		mean_over_count += o.over_count
		mean_over_dur_n += o.over_dur_n
		mean_over_count_n += o.over_count_n
	# compute the mean values
	mean_over_dur = mean_over_dur / len(overlap_list)
	mean_over_count = mean_over_count / len(overlap_list)
	mean_over_dur_n = mean_over_dur_n / len(overlap_list)
	mean_over_count_n = mean_over_count_n / len(overlap_list)







#########################################################
# writes x-, y-coordinates and duration to .json file
#
# parameters:											
# 	fixations: a list containing Fixation objects	
#########################################################
def saveAsJson(fix, filename):
	# create new list
	dictlist = []
	# fill list with the dictionaries containing the values from fixations
	for i in range(0, len(fix.fixations)):
		# each dictionary has the values x, y and duration
		d = {'x': fix.fixations[i].x, 'y': fix.fixations[i].y, 'duration': fix.fixations[i].dur}
		# add dictionary to list
		dictlist.append(d) 

	# write dictlist to json file	
	with open (filename + '.json', 'w') as file:
		json.dump(dictlist, file)


# also writes the start and stop values to .json file
def saveAsJsonExt(fix, filename):
	# create new list
	dictlist = []
	# fill list with the dictionaries containing the values from fixations
	for i in range(0, len(fix.fixations)):
		# each dictionary has the values x, y and duration
		d = {'x': fix.fixations[i].x, 'y': fix.fixations[i].y, 'duration': fix.fixations[i].dur, 'start': fix.fixations[i].start, 'stop': fix.fixations[i].stop}
		# add dictionary to list
		dictlist.append(d) 

	# write dictlist to json file	
	with open (filename + '.json', 'w') as file:
		json.dump(dictlist, file)

####################################################################################
# function to crop a list of fixations if there is a long blink (x == 0 for > 1sec)
#
# parameter:
# 	fixations: a list of Fixation objects
#
# return: none (just alters input list)
####################################################################################

def cropFixations(fix):
	for i in range(0, len(fix.fixations)):
		if fix.fixations[i].x == 0 and fix.fixations[i].dur > 1:
			for j in range(i, -1, -1):
				del fix.fixations[j]
			for f in reversed(fix.fixations):
				f.stop = f.stop - fix.fixations[0].start
				f.start = f.start - fix.fixations[0].start
			return

####################################################################################
# print fixations for a user to read ()
#
# parameter:
# fixations: a list of Fixation objects
####################################################################################
def printFixations(fix, filename):

	with open (filename + '.txt', 'w') as text_file:
		print("start", end="\t\t\t", file = text_file)
		print("stop", end="\t\t\t", file = text_file)
		print("duration", end="\t\t", file = text_file)
		print("x-coord", end="\t\t\t", file = text_file)	
		print("y-coord", file = text_file)				


		for i in range(0, len(fix.fixations)):
			#start
			if fix.fixations[i].start == 0:
				print(fix.fixations[i].start, end="\t\t\t", file = text_file)
			else:
				print(fix.fixations[i].start, end="\t\t", file = text_file)	
			#end
			print(fix.fixations[i].stop, end="\t\t", file = text_file)	
			#duration
			print(fix.fixations[i].dur, end="\t\t", file = text_file)
			#x-coord
			if fix.fixations[i].x == 0:
				print(fix.fixations[i].x, end="\t\t\t", file = text_file)
			else:
				print(fix.fixations[i].x, end="\t\t", file = text_file)
			#y-coord
			print(fix.fixations[i].y, file = text_file)	


# Load streams into object
streams_1 = xdf.load_xdf(r"C:/Users/Jannis/Documents/Studium/Module/Andere/5.Semester/Projektpraktikum/LabRecorder/Recordings/anne_GotG2.xdf", None, False)
streams_2 = xdf.load_xdf(r"C:/Users/Jannis/Documents/Studium/Module/Andere/5.Semester/Projektpraktikum/LabRecorder/Recordings/alex_GotG2.xdf", None, False)


# Extract streams
gazestream_1 = extractStream('iViewXLSL', streams_1)
emotionstream_1 = extractStream('EmotivLSL_PerformanceMetrics', streams_1)
facialstream_1 = extractStream('EmotivLSL_FacialExpression', streams_1)

gazestream_2 = extractStream('iViewXLSL', streams_2)
emotionstream_2 = extractStream('EmotivLSL_PerformanceMetrics', streams_2)
facialstream_2 = extractStream('EmotivLSL_FacialExpression', streams_2)

# Extract gaze coordinates
gazeX_1 = gazestream_1['time_series'][:,0]
gazeY_1 = gazestream_1['time_series'][:,1]
gazetimes_1 = gazestream_1['time_stamps']

gtime_1 = gazetimes_1 - gazetimes_1[0]

gazeX_2 = gazestream_2['time_series'][:,0]
gazeY_2 = gazestream_2['time_series'][:,1]
gazetimes_2 = gazestream_2['time_stamps']

gtime_2 = gazetimes_2 - gazetimes_2[0]

# Extract emotions ("scaled score")
stress = emotionstream_1['time_series'][:,3]
engagement_boredom = emotionstream_1['time_series'][:,7]
relaxation = emotionstream_1['time_series'][:,11]
excitement = emotionstream_1['time_series'][:,15]
interest = emotionstream_1['time_series'][:,19]
emotiontimes = emotionstream_1['time_stamps']

etime = emotiontimes - emotiontimes[0]

# Extract facial expressions
blink = facialstream_1['time_series'][:,0]
wink_left = facialstream_1['time_series'][:,1]
wink_right = facialstream_1['time_series'][:,2]
surprise = facialstream_1['time_series'][:,3]
frown = facialstream_1['time_series'][:,4]
clench = facialstream_1['time_series'][:,5]
smile = facialstream_1['time_series'][:,6]
neutral = facialstream_1['time_series'][:,7]
facialtimes = facialstream_1['time_stamps']

ftime = facialtimes - facialtimes[0]

#############
#	Main	
#############

if __name__ == "__main__":

	# detect fixations 
	#fixations_1 = fixationDetection(gazeX_1, gazeY_1, gtime_1, 'user', 'video')
	#fixations_2 = fixationDetection(gazeX_2, gazeY_2, gtime_2, 'user', 'video')

	#print uncropped fixations
	#printFixations(fixations_1, "uncropped_1")
	#printFixations(fixations_2, "uncropped_2")

	# crop at long blink location
	#cropFixations(fixations_1)
	#cropFixations(fixations_2)

	# print cropped fixations 
	#printFixations(fixations_1, "cropped_1")
	#printFixations(fixations_2, "cropped_2")


	# find and print overlapping fixations 
	#overlap = findOverlappingFix(fixations_1, fixations_2, 50, 0)
	#print(overlap.fix_count_1, overlap.fix_dur_1, overlap.fix_count_2, overlap.fix_dur_2, overlap.over_count, overlap.over_dur)
	#printFixations(FixationList(overlap.fix_1, 'user', 'video'), "fixations_1")
	#printFixations(FixationList(overlap.fix_2, 'user', 'video'), "fixations_2")

	# mass analysis
	overlap_list = massAnalysis('C:/Users/Jannis/Documents/Studium/Module/Andere/5.Semester/Projektpraktikum/LabRecorder/Recordings/', ['alex', 'anne', 'benny', 'christopher', 'joe', 'min', 'nikolas', 'raphael'], ['conjuring', 'GotG2', 'nlmg'])

	# write into .json files
	#saveAsJson(fixations_1, "fixations")

	#saveAsJsonExt(fixations_1, "fixations_ext")

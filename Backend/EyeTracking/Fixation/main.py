import xdf
import numpy as np
import fixation_prototype as fx
import matplotlib.pyplot as plt

# Load streams into object
# Video URL: https://www.youtube.com/watch?v=dW1BIid8Osg
streams = xdf.load_xdf(r"C:/Users/Jannis/Documents/Studium/Module/Andere/5.Semester/Projektpraktikum/LabRecorder/Recordings/GotG2_Raphael.xdf", None, False)

# Extract streams
gazestream = fx.extractStream('iViewXLSL', streams)

# Extract gaze coordinates
gazeX = gazestream['time_series'][:,0]
gazeY = gazestream['time_series'][:,1]
gazeTimes = gazestream['time_stamps'] # according times in seconds

time = gazeTimes - gazeTimes[0]

fixations = fx.fixationDetection(gazeX, gazeY, time)

print("start", end="\t\t\t")
print("stop", end="\t\t\t")
print("duration", end="\t\t")
print("x-coord", end="\t\t\t")	
print("y-coord")				


for i in range(0, len(fixations.start)):
	#start
	if fixations.start[i] == 0:
		print(fixations.start[i], end="\t\t\t")
	else:
		print(fixations.start[i], end="\t\t")	
	#end
	print(fixations.stop[i], end="\t\t")	
	#duration
	print(fixations.stop[i], end="\t\t")
	#x-coord
	if fixations.x[i] == 0:
		print(fixations.x[i], end="\t\t\t")
	else:
		print(fixations.x[i], end="\t\t")
	#y-coord
	print(fixations.y[i])		
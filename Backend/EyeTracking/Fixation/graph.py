# Import packages
import xdf
import matplotlib.pyplot as plt

###############################################################################
# Extract stream by name
def extractStream(name, streams):
    
    # Go over streams and search for name
    for i in range(len(streams[0])):
        if streams[0][i]['info']['name'][0] == name:
            return streams[0][i]
    return streams[0][0]
###############################################################################

# Load streams into object
streams_1 = xdf.load_xdf(r"../../TestData/christopher_conjuring.xdf", None, False)

# Extract streams
gazestream_1 = extractStream('iViewXLSL', streams_1)
emotionstream_1 = extractStream('EmotivLSL_PerformanceMetrics', streams_1)
facialstream_1 = extractStream('EmotivLSL_FacialExpression', streams_1)

# Extract gaze coordinates
gazeX_1 = gazestream_1['time_series'][:,0]
gazeY_1 = gazestream_1['time_series'][:,1]
gazetimes_1 = gazestream_1['time_stamps']

gtime_1 = gazetimes_1 - gazetimes_1[0]

# Extract emotions ("scaled score")
stress = emotionstream_1['time_series'][:,3]
engagement_boredom = emotionstream_1['time_series'][:,7]
relaxation = emotionstream_1['time_series'][:,11]
excitement = emotionstream_1['time_series'][:,15]
interest = emotionstream_1['time_series'][:,19]
emotiontimes = emotionstream_1['time_stamps']

etime = emotiontimes - emotiontimes[0]

#############
#	Main	
#############

if __name__ == "__main__":
	plt.title('Stress')
	plt.plot(etime, stress)
	plt.show()

	plt.title('Excitement')
	plt.plot(etime, excitement)
	plt.show()
	
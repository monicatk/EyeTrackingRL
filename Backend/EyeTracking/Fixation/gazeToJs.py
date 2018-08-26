# Import packages
import xdf
import json

# Extract stream by name
def extractStream(name, streams):
    
    # Go over streams and search for name
    for i in range(len(streams[0])):
        if streams[0][i]['info']['name'][0] == name:
            return streams[0][i]
    return streams[0][0]

def saveAsJsonRAW(x,y,t,filename):
    with open (filename + '.json', 'w') as json_file:
        json_file.write('')
    # fill list with the dictionaries containing the values from fixations
    for i in range(0, len(x)):
        # each dictionary has the values x, y and duration
        d = {'x': x[i], 'y': y[i], 'time': t[i]}
        with open (filename + '.json', 'a') as json_file:
            out = json.dumps(d, separators=(',', ':'))
            json_file.write(out + ',\n')

# choose source
streams = xdf.load_xdf(r"../../TestData/anne_GotG2.xdf", None, False)

gazestream = extractStream('iViewXLSL', streams)

gazeX = gazestream['time_series'][:,0]
gazeY = gazestream['time_series'][:,1]
gazetimes = gazestream['time_stamps']

x = []
y = []
t = []

for i in range(0, len(gazeX)):
    x.append(gazeX[i])
    y.append(gazeY[i])
    t.append(gazetimes[i])

flag = False

# crop at shuteyes
for i in range(0, len(x)):
    if x[i] == 0:
        flag = True
    if flag == True and x[i] != 0:
        for j in range(i-1, -1, -1):
            del x[j]
            del y[j]
            del t[j]
        break

time = t - t[0]

saveAsJsonRAW(x, y, time, 'gaze_coords')
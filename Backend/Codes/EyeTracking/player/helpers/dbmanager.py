from django.utils import timezone
from player.helpers.similarity import *
from player.models import UsersSim, YouTubeVideo, FixationPoints
from player.helpers.video import get_video_info
from player.helpers.viewmodels import *
import requests
import json
import pickle
import os

youtube_key = 'AIzaSyDTouFE7y6JxiTeTE97drfplHhWmptHGQI'

def get_avg_fix_dur(videoid):
    """simple getter"""
    x = YouTubeVideo.objects.filter(video_id=videoid)
    for y in x:
        return y.avg_fix_dur

def get_avg_fix_count(videoid):
    """simple getter"""
    x = YouTubeVideo.objects.filter(video_id=videoid)
    for y in x:
        return y.avg_fix_count

def update_all_similarities():
    """calculates the average similarity for each user pair and uploads it"""
    x = UsersVideoSim.objects.filter()
    calculations_dictionary = dict()
    for y in x:
        try:
            calculations_dictionary[(y.User1Id, y.User2Id)] = (calculations_dictionary[(y.User1Id, y.User2Id)][0]+y.Sim, calculations_dictionary[(y.User1Id, y.User2Id)][1]+1)
        except:
            calculations_dictionary[(y.User1Id, y.User2Id)] = (y.Sim, 1)
    for ((u1, u2), (total, number)) in calculations_dictionary.items():
        p = UsersSim(
            User1Id=u1,
            User2Id=u2,
            Sim=total/number
        )
        UsersSim.objects.filter(User1Id=u1, User2Id=u2).delete()
        p.save()

def missing_similarity_calculations():
    """returns a list with all (user1Id, user2Id, videoID), where there are no similarities in table for that userpair and video"""
    video_user = video_user_pairs()
    uVS = UsersVideoSim.objects.filter()
    set_with_all_UsersVideoSim = set()
    for x in uVS:
        if x.User1Id < x.User2Id:
            set_with_all_UsersVideoSim.update({(x.User1Id, x.User2Id, x.VideoId)})
        else: #else should never happen!
            set_with_all_UsersVideoSim.update({(x.User2Id, x.User1Id, x.VideoId)})
    print(set_with_all_UsersVideoSim)
    toDoList = set()
    # is there a video with record for two users? does the similarity exist already?
    for i in range(len(video_user)):
        for j in range(i+1, len(video_user)):
            if video_user[i][1] == video_user[j][1] and\
                            video_user[i][0] != video_user[j][0]: #video-ids must be identical and user-ids must differ
                user1Id = video_user[i][0]
                user2Id = video_user[j][0]
                videoID = video_user[i][1]
                if user1Id > user2Id:
                    x = user1Id
                    user1Id = user2Id
                    user2Id = x
                if (user1Id, user2Id, videoID) in set_with_all_UsersVideoSim:
                    print("detected existing similarity for: ", user1Id, user2Id, videoID)
                else:
                    toDoList.update({(user1Id, user2Id, videoID)})
    return list(toDoList)

def update_user_similarity_for_video(user1Id, user2Id, videoID, sim):
    """adds or alters the similarity for a video"""
    if user1Id > user2Id:
        x = user1Id
        user1Id = user2Id
        user2Id = x
    if user1Id == user2Id:
        return -1
    UsersVideoSim.objects.filter(User1Id=user1Id, User2Id=user2Id, VideoId=videoID).delete()
    p = UsersVideoSim(
        User1Id=user1Id,
        User2Id=user2Id,
        VideoId=videoID,
        Sim=sim
    )
    p.save()

def exist_user_similarity_for_video(user1Id, user2Id, videoID):
    """
    returns 1, if the similarity exists and user1Id != user2Id,
    returns 0, if the similarity does not exist or user1Id == user2Id
    """
    if user1Id > user2Id:
        x = user1Id
        user1Id = user2Id
        user2Id = x
    if user1Id == user2Id:
        return 0
    if UsersVideoSim.objects.filter(User1Id=user1Id, User2Id=user2Id, VideoId=videoID):
        return 1
    else:
        return 0

def get_user_similarity_for_video(user1Id, user2Id, videoID):
    """returns the similarity"""
    if user1Id > user2Id:
        x = user1Id
        user1Id = user2Id
        user2Id = x
    if user1Id == user2Id:
        return -1
    x = UsersVideoSim.objects.filter(User1Id=user1Id, User2Id=user2Id, VideoId=videoID)
    for y in x:
        return y.Sim
    return -1

def calculate_similarity(user1Id, user2Id):
    """calculates the average similarity for two users for all videos and returns it"""
    if user1Id > user2Id:
        x = user1Id
        user1Id = user2Id
        user2Id = x
    if user1Id == user2Id:
        return -1
    x = UsersVideoSim.objects.filter(User1Id=user1Id, User2Id=user2Id)
    sum = 0
    if not x:
        return 0
    for y in x:
        sum += y.Sim
    return sum / len(x)

def update_similarity(user1Id, user2Id):
    """calculates average similarity and adds them to UsersSim"""
    if user1Id > user2Id:
        x = user1Id
        user1Id = user2Id
        user2Id = x
    if user1Id == user2Id:
        return -1
    sim = calculate_similarity(user1Id, user2Id)
    UsersSim.objects.filter(User1Id=user1Id, User2Id=user2Id).delete()
    p = UsersSim(
        User1Id=user1Id,
        User2Id=user2Id,
        Sim=sim
    )
    p.save()
    return sim

def get_similarity(user1Id, user2Id):
    """returns the similarity from UsersSim table. after update_similarity, it should return the same value as calculate_similarity"""
    if user1Id > user2Id:
        x = user1Id
        user1Id = user2Id
        user2Id = x
    if user1Id == user2Id:
        return -1
    x = UsersSim.objects.filter(User1Id=user1Id, User2Id=user2Id)
    for y in x:
        return y.Sim
    return -1



def video_user_pairs():
    """returns all video-user-pairs"""
    result = set()
    fixations_raw_from_db = FixationPoints.objects.filter()
    for raw_fixation in fixations_raw_from_db:
        result.update({(raw_fixation.UserId, raw_fixation.VideoId)})
    for root, dirs, files in os.walk("recording" + os.sep + "pickledumps" + os.sep):
        for name in files:
            if name.endswith((".record")):
                name1 = str(name).split(".")
                try:
                    result.update({(int(name1[0]), name1[1])})
                except:
                    print("problem with filename ", name)
    return list(result)

def store_average(userid, videoid, f_dur, f_count):
    """
    VideoAverages stores data, which is necessary for other calculations.
    FixDur is not an average, but the total duration of all fixations
    FixCount is the number of all fixations for that user for that video

    YouTubeVideo stored data for the video and also some averages:
    avg_fix_dur is the average cumulated fixation duration for that video
    avg_fix_count is the average number of fixations per user for that video

    YouTubeVideo tries to get the data from the database first,
    if that does not work, it gets the data from youtube directly,
    and if that does not work, all fields are left blank except videoID, avg_fix_dur and avg_fix_count
    """
    VideoAverages.objects.filter(UserID=userid, VideoId=videoid).delete()
    p = VideoAverages(
        VideoId=videoid,
        UserID=userid,
        FixDur=f_dur,
        FixCount=f_count
    )
    p.save()
    fix_dur_all = 0
    fix_count_all = 0
    all_avg_for_1_video = VideoAverages.objects.filter(VideoId=videoid)
    for video_avg in all_avg_for_1_video:
        fix_dur_all += video_avg.FixDur
        fix_count_all += video_avg.FixCount

    if YouTubeVideo.objects.filter(video_id=videoid):
        query_object = YouTubeVideo.objects.filter(video_id=videoid)
        x = YouTubeVideo(
            video_id=query_object[0].video_id,
            title=query_object[0].title,
            description=query_object[0].description,
            image_url=query_object[0].image_url,
            duration=query_object[0].duration,
            tags=query_object[0].tags,
            avg_fix_dur=fix_dur_all/len(all_avg_for_1_video),
            avg_fix_count=fix_count_all/len(all_avg_for_1_video)
        )
        YouTubeVideo.objects.filter(video_id=videoid).delete()
    else:
        try:
            search_request = requests.get(
                "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + str(videoid) + "&key=" + youtube_key)
            search_dict = json.loads(search_request.text)
            item = search_dict["items"][0]
            id = item['id']
            title = item['snippet']['title']
            description = item['snippet']['description']
            image_url = item['snippet']['thumbnails']['medium']['url']
            duration = item['contentDetails']['duration']
            tags = get_tags_History(item['snippet']['tags'])
        except:
            title = ""
            description = ""
            image_url = ""
            duration = ""
            tags = ""
        x = YouTubeVideo(
            video_id=videoid,
            title=title,
            description=description,
            image_url=image_url,
            duration=duration,
            tags=tags,
            avg_fix_dur=fix_dur_all/len(all_avg_for_1_video),
            avg_fix_count=fix_count_all/len(all_avg_for_1_video)
        )
    x.save()
    return x

def store_fixations(userid, videoid, fixations):
    """
    store fixations in both file and database
    also calculates total fixation duration and fixation count.

    fixations must be a list of objects, with attributes x, y, start and stop.
    """
    #the following code adds the data to the database
    some_list = []
    f_dur = 0
    for fixation in fixations:
        p = FixationPoints(
            UserId=userid,
            VideoId=videoid,
            PosX=fixation.x,
            PosY=fixation.y,
            StartTime=fixation.start,
            StopTime=fixation.stop
        )
        f_dur += fixation.stop-fixation.start
        print(fixation.stop-fixation.start)
        some_list.append(p)

    print(userid, videoid, f_dur, len(some_list))
    # storing average
    store_average(userid, videoid, f_dur, len(some_list))

    if FixationPoints.objects.filter(UserId=userid, VideoId=videoid):
        print("FixationPoints exist already. Will not add them to database again!")
    else:
        for p in some_list:
            try:
                p.save()
            except:
                print(str(p) + " could not be stored in db")
        print("FixationPoints uploaded to database!")
    # the following code adds a pickle-dump (binary data) to the file-system, as back-up.
    j = ""
    #os.sep should be a system-independent seperator, so this should work on any operating system
    name = "recording"+ os.sep +"pickledumps"+ os.sep +str(userid) + "." + str(videoid) + ".record"
    for i in range(100):
        try:
            open(name+j, "rb")
            print(name + j + " already exist. ")
            j = "." + str(i)
        except:
            pickle.dump(some_list, open(name + j, "wb"))
            print("added " + name + j + " to files.")
            return
    print("100 files for this FixationPoints exist already. Will not add them to files again!")

def load_fixations(userid, videoid):
    """load fixations"""
    #try to get the data from file, and if this does not work, get it from database
    try:
        filename = "recording" + os.sep + "pickledumps" + os.sep + str(userid) + "." + str(videoid) + ".record"
        result = pickle.load(open(filename, "rb"))
        #print("FixationPoints for ", userid, videoid, "loaded from file")
    except:
        fixations_raw_from_db = FixationPoints.objects.filter(UserId=userid, VideoId=videoid).order_by('StartTime')
        result = []
        for raw_fixation in fixations_raw_from_db:
            p = FixationPoints(
                UserId=userid,
                VideoId=videoid,
                PosX=raw_fixation.PosX,
                PosY=raw_fixation.PosY,
                StartTime=raw_fixation.StartTime,
                StopTime=raw_fixation.StopTime
                )
            p = {"userId": userid,
                 "videoId": videoid,
                 "x": raw_fixation.PosX,
                 "y": raw_fixation.PosY,
                 "duration": raw_fixation.StopTime-raw_fixation.StartTime,
                 "start": raw_fixation.StartTime,
                 "stop": raw_fixation.StopTime}
            result.append(p)
        #print("FixationPoints for ", userid, videoid, "loaded from database")
    return result

def delete_all_fixations():
    """delete all fixations"""
    if input("are you sure you want to delete it all ?????? the whole database will be empty! y/n ") != "y":
        return
    try:
        import time
        fixations_raw_from_db = FixationPoints.objects.filter()
        pickle.dump(fixations_raw_from_db, open("recording" + os.sep + "pickledumps" + os.sep + "backup_after_deletion_of_db" + str(time.time()), "wb"))
        FixationPoints.objects.filter().delete()
        print("database is cleaned now. backup saved.")
    except:
        print("database could not be cleaned.")

def viewers_of_video(videoid):
    """Functionality to find out, who has watched a video"""
    history_of_video = UserHistory.objects.filter(VideoId=videoid)
    viewers = []
    for hist_entry in history_of_video:
        viewers.append(hist_entry.UserId)
    return list(set(viewers))

def load_all_fixations_for_video(videoid):
    """get all fixations for a video"""
    fixations_raw_from_db = FixationPoints.objects.filter(VideoId=videoid).order_by('StartTime')
    result_dic = dict()
    for raw_fixation in fixations_raw_from_db:
        p = FixationPoints(
            UserId=raw_fixation.UserId,
            VideoId=raw_fixation.VideoId,
            PosX=raw_fixation.PosX,
            PosY=raw_fixation.PosY,
            StartTime=raw_fixation.StartTime,
            StopTime=raw_fixation.StopTime
            )
        try:
            result_dic[raw_fixation.UserId].append(p)
        except:
            result_dic.update({raw_fixation.UserId:[p]})
    return list(result_dic.items())

def store_user_history(userid, videoid, rating):

    p = UserHistory(UserId=userid, VideoId=videoid, TS=timezone.now(), Rating=rating)
    p.save()

    #saves information of a watched video to local database
    if YouTubeVideo.objects.filter(video_id=videoid):
        print("history exist")
    else:
        store_video_info_History(videoid)
    return 0




# Adds information of watched videos
def History():
    videos = UserHistory.objects.values("VideoId").distinct()
    print(len(videos))
    for vid in videos:
        if YouTubeVideo.objects.filter(video_id=vid["VideoId"]):
            print("history exist")
        else:
            try:
                q = get_video_info(vid["VideoId"])
                q.save()
            except:
                print(vid["VideoId"])
                continue
    return 0

def store_video_info_History(videoid):

    search_request = requests.get(
        "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + str(videoid) + "&key=" + youtube_key)

    search_dict = json.loads(search_request.text)
    item = search_dict["items"][0]

    id = item['id']
    title = item['snippet']['title']
    description = item['snippet']['description']
    image_url = item['snippet']['thumbnails']['medium']['url']
    duration = item['contentDetails']['duration']
    tags = ""
    if 'tags' in item['snippet']:
        tags = get_tags_History(item['snippet']['tags'])
    x = YouTubeVideo(video_id=videoid, title=title, description=description, image_url=image_url,
                     duration=duration, tags=tags)
    x.save()
    return x

def get_tags_History(tag_list):
    a = ''
    for t in tag_list:
        a += " "
        a += t
    return a

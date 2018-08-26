from player.helpers.similarity import *
from player.models import *
from player.models import YouTubeVideo as History_videos
from player.helpers.viewmodels import *
import requests
import json
import sys

youtube_key = 'AIzaSyDTouFE7y6JxiTeTE97drfplHhWmptHGQI'

#return ranked videos from Youtube and watched history based on the searching keyword
def keyword_search(input,userid):
    keyword_search_request = requests.get(
        "https://www.googleapis.com/youtube/v3/search?part=snippet&&maxResults=25&type=video&q=" + input + "&key=" + youtube_key)
    keyword_search_dict = json.loads(keyword_search_request.text)
    #get similar watched videos from history according to similar users
    search_history_result = search_history(input, userid)

    #rank both videos from Youtube and our history
    i=0
    for item in keyword_search_dict['items']:
        key = item['id']['videoId']
        i+=1
        value = 5/i
        try:
            search_history_result[key] = (search_history_result[key] + value)/2
        except:
            search_history_result.update({key: value})

    from collections import OrderedDict
    d = OrderedDict(sorted(search_history_result.items(), key = lambda t: t[1], reverse = True))

    #get more info of videos from Youtube
    Youtube_result = dict()
    for item in keyword_search_dict['items']:
        id = item['id']['videoId']
        title = item['snippet']['title']
        description = item['snippet']['description']
        image = item['snippet']['thumbnails']['high']['url']
        duration = get_video_duration(id)
        Youtube_result.update({id : YouTubeVideo(video_id=id, title =title,description = description,image_url= image,duration= duration,tags='')})

    search_results = []

    for video_id in d.keys():
        try:
            search_results.append(Youtube_result[video_id])
        except:
            search_results.append(get_video_info(video_id))
    return search_results

#videos similar to the watching one on the side bar
def similar_video_search(video_id):
    keyword_search_request = requests.get(
        "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId="+video_id+"&type=video&key=" + youtube_key)
    keyword_search_dict = json.loads(keyword_search_request.text)

    search_results = []
    for item in keyword_search_dict['items']:
        id = item['id']['videoId']
        title = item['snippet']['title']
        description = item['snippet']['description']
        image = item['snippet']['thumbnails']['medium']['url']
        duration = get_video_duration(id)
        search_results.append(Video(id,title,description,image,duration))

    return search_results

#top ranked videos
def top_rated():
    count = 10
    keyword_search_request = requests.get(
        "https://www.googleapis.com/youtube/v3/videos?chart=mostPopular&part=snippet&type=video&maxResults=" + str(count) + "&key=" + youtube_key)

    keyword_search_dict = json.loads(keyword_search_request.text)

    search_results = []
    for item in keyword_search_dict['items']:
        id = item['id']
        title = item['snippet']['title']
        description = item['snippet']['description']
        image = item['snippet']['thumbnails']['medium']['url']
        duration = get_video_duration(item['id'])
        search_results.append(Video(id, title, description, image, duration))
    return search_results

def get_video_duration(videoid):

    search_request = requests.get(
        "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=" + str(videoid) + "&key=" + youtube_key)

    search_dict = json.loads(search_request.text)
    item = search_dict["items"][0]
    duration = item['contentDetails']['duration']
    return duration

def get_video_info(videoid):

    search_request = requests.get(
        "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + str(videoid) + "&key=" + youtube_key)

    search_dict = json.loads(search_request.text)
    item = search_dict["items"][0]

    id = videoid
    title = item['snippet']['title']
    description = item['snippet']['description']
    image_url = item['snippet']['thumbnails']['medium']['url']
    duration = item['contentDetails']['duration']
    tags = ""
    if 'tags' in item['snippet']:
        tags = get_tags(item['snippet']['tags'])
    video = YouTubeVideo(video_id=videoid, title=title, description=description, image_url=image_url,
                     duration=duration, tags=tags)
    return video

def get_tags(tag_list):
    a=''
    for t in tag_list:
        a+=" "
        a+= t
    return a

#get similar watched videos from history according to similar users
def search_history(input,userid):
    history_sim=[]
    total_history=[]
    video_inf=[]
    top_video_score = {}

    #get users similarity
    user_sim=Get_User_Sim(userid)

    #search history for relevant videos
    if len(user_sim)>0:
        for s in user_sim:

            history_rating=[]
            history=[]
            #all videos the user watched
            history_user=UserHistory.objects.filter(UserId=s["user_id"]).distinct()

            #History with ratings*similarity
            for h in history_user:
                #replace old ratings with highist rating
                if h.VideoId in history:
                    for hr in history_rating:
                        if hr["video_id"]==h.VideoId:
                            max_rating=hr["rating_sim"]
                    if h.Rating*s["sim"]>max_rating:
                        history_rating.remove({"video_id": h.VideoId, "rating_sim":max_rating})
                        history_rating.append({"video_id": h.VideoId, "rating_sim":h.Rating*s["sim"]})
                #add new hostory
                else:
                    max_rating=h.Rating * s["sim"]
                    history_rating.append({"video_id": h.VideoId, "rating_sim": max_rating})
                    history.append(h.VideoId)

            history_sim.append({"user_id":s["user_id"], "user_sim": s["sim"], "history" : history_rating})
            total_history+= history

        #similarity of keywords and watched videos
        #gets tags from watched videos as texts for calculation of smilarity
        for v_h in total_history:
            try:
                for v in History_videos.objects.filter(video_id=v_h):
                    video_inf.append(v)
            except :
                print(v_h)
        top_rel_videos=rel_videos(video_inf, input)


        #sums up the rating-similarity of videos
        top_video_score={}        
        for t in top_rel_videos:
            score = 0
            total_sim=0
            for i in history_sim:
                for j in i["history"]:
                    if t==j["video_id"]:
                        if j["rating_sim"]>0:
                            score+=j["rating_sim"]
                            total_sim += i["user_sim"]
            #set a threshold of weighted similarity
            if total_sim>0:
                score = score / total_sim
                top_video_score[t]=score
    return top_video_score

#return similarity between all other users and current user
def Get_User_Sim(userid):
    Sim_users=[]
    try:
        D_Sim_users1=UsersSim.objects.filter(User1Id=userid)
        for obj in D_Sim_users1:
            Sim_users.append({"user_id":obj.User2Id,"sim":obj.Sim/10})
    except UsersSim.DoesNotExist:
        D_Sim_users1={}
    try:
        D_Sim_users2=UsersSim.objects.filter(User2Id=userid)
        for obj in D_Sim_users2:
            Sim_users.append({"user_id":obj.User1Id,"sim":obj.Sim/10})
    except UsersSim.DoesNotExist:
        D_Sim_users2 = {}

    return Sim_users

#return history of user by video watched time
def top_user_history(userid):

    history_videos = UserHistory.objects.filter(UserId=userid).values("VideoId").order_by('-TS').distinct()
    last_watched_videos = []
    videos_id=[]

    #number of video should be less than 10
    number_videos = len(history_videos)
    if (number_videos > 10):
        number_videos=10

    #remove redundant video by video id and return video information
    for user_history in history_videos[:number_videos]:
        videoId=user_history["VideoId"]
        if (videoId not in videos_id):
            video = get_video_info(videoId)
            last_watched_videos.append(video)
            videos_id.append(videoId)
    return last_watched_videos
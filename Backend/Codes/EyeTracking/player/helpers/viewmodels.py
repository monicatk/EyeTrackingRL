from player.models import *
from django.db.models import Avg, Max, Min, Sum

class Video(object):
    video_id = ""
    title = ""
    description = ""
    image_url = ""
    duration = ""
    # The class "constructor" - It's actually an initializer
    def __init__(self, video_id, title, description, image_url, duration):
        self.video_id = video_id
        self.title = title
        self.description = description
        self.image_url = image_url
        self.duration = duration

class Rating(object):
    video_id = ""
    userId = ""
    average = 0
    total = 0
    total_5 = 0
    total_4 = 0
    total_3 = 0
    total_2 = 0
    total_1 = 0


    # The class "constructor" - It's actually an initializer
    def __init__(self, videoId, userId, userRating = 0, average=0, total=0, total_5=0, total_4=0, total_3=0, total_2=0, total_1=0):
        self.videoId = videoId
        self.userId = userId
        self.userRating = userRating
        if (userRating == 0):
            self.userRating = self.get_latest_userRate()
        self.total = total
        self.average = average
        self.total_5 = total_5
        self.total_4 = total_4
        self.total_3 = total_3
        self.total_2 = total_2
        self.total_1 = total_1

    def get_latest_userRate(self):

        records = UserHistory.objects.filter(UserId=self.userId, VideoId=self.videoId).annotate(lastts=Max('TS'))
        if (records.count()!=0):
            return UserHistory.objects.filter(TS=[record.lastts for record in records])
        else:
            return 0

    def calc_rating_statistics(self):
        """returns the avg rating for a video"""
        full_history = UserHistory.objects.filter(VideoId = self.videoId).order_by('-TS')
        total_rates = 0
        sum_rate = 0
        avg_rate1 = 0
        avg_rate2 = 0
        avg_rate3 = 0
        avg_rate4 = 0
        avg_rate5 = 0
        if (full_history.count() > 0):
            set_of_users_who_already_voted = set()
            for x in full_history:
                if x.Rating > 0:
                    if not (x.UserId in set_of_users_who_already_voted):
                        total_rates += 1
                        sum_rate += x.Rating
                        if x.Rating == 1:
                            avg_rate1 += 1
                        elif x.Rating == 2:
                            avg_rate2 += 1
                        elif x.Rating == 3:
                            avg_rate3 += 1
                        elif x.Rating == 4:
                            avg_rate4 += 1
                        else:
                            avg_rate5 += 1
                        set_of_users_who_already_voted.update({x.UserId})

                self.total = total_rates
                self.average = sum_rate / total_rates
                self.total_1 = avg_rate1 * 100 / total_rates
                self.total_2 = avg_rate2 * 100 / total_rates
                self.total_3 = avg_rate3 * 100 / total_rates
                self.total_4 = avg_rate4 * 100 / total_rates
                self.total_5 = avg_rate5 * 100 / total_rates

    def get_statistics(self):
        self.calc_rating_statistics()
        statistics = {"userRate": self.userRating,
                      "total":self.total,
                      "average":self.average,
                      "total_1": self.total_1,
                      "total_2": self.total_2,
                      "total_3": self.total_3,
                      "total_4": self.total_4,
                      "total_5": self.total_5}
        return statistics




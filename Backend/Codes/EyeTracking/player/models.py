from django.db import models
from django.core.urlresolvers import reverse

class UserHistory(models.Model):
    UserId = models.IntegerField()
    VideoId = models.CharField(max_length=50)
    TS = models.DateTimeField()
    Rating = models.IntegerField(blank=True, default=0)

class UsersSim(models.Model):
    User1Id = models.IntegerField()
    User2Id = models.IntegerField()
    Sim = models.FloatField()
    class Meta:
        unique_together = ("User1Id", "User2Id")

class UsersVideoSim(models.Model):
    User1Id = models.IntegerField()
    User2Id = models.IntegerField()
    VideoId = models.CharField(max_length=50)
    Sim = models.FloatField()
    class Meta:
        unique_together = ("User1Id", "User2Id", "VideoId")

class FixationPoints(models.Model):
    UserId = models.IntegerField()
    VideoId = models.CharField(max_length=50)
    PosX = models.FloatField()
    PosY = models.FloatField()
    StartTime = models.FloatField()
    StopTime = models.FloatField()
    class Meta:
        unique_together = ("UserId", "VideoId", "StartTime")

class VideoAverages(models.Model):
    VideoId = models.CharField(max_length=50)
    UserID = models.IntegerField()
    FixDur = models.FloatField()
    FixCount = models.FloatField()

class YouTubeVideo(models.Model):
    video_id = models.CharField(max_length=50)
    title = models.CharField(max_length=500)
    description = models.CharField(max_length=10000)
    image_url = models.CharField(max_length=2000)
    duration = models.CharField(max_length=50)
    tags = models.CharField(max_length=2000)
    avg_fix_dur = models.FloatField(default=0)
    avg_fix_count = models.IntegerField(default=0)


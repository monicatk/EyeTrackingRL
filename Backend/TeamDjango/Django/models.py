from django.db import models

class User(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=100)

class Session(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    startTime = models.TimeField()
    endTime = models.TimeField()

class Video(models.Model):
    url = models.CharField(max_length=250)
    name = models.CharField(max_length=100)
    tag = models.CharField(max_length=100)
    rating = models.FloatField(max_length=5)

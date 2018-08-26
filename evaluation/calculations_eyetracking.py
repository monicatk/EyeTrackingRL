from player.helpers.similarity import *
from player.models import UsersSim, YouTubeVideo, FixationPoints
from player.helpers.dbmanager import *
from django.conf import settings
from player.models import *
from django.db.models import *
import numpy as np
from django.contrib.auth.models import User
from numpy import matrix
import xlsxwriter



def calc_stat():
    videos = ('6LiKKFZyhRU','CmRih_VtVAs','CQ1wztlDACc','hcdTN5soeQw','qMOONBCqzG8','xBLmBdn2QF8')
    #users = User.objects.filter(username__like='test%')
    n = 20
    user_ids = [x for x in range(151,171)]
    stat = np.empty([n,n],dtype="S150")
    try:
        for row, user1Id in enumerate(user_ids):
            for col, user2Id in enumerate(user_ids):
                res = ''
                for i, videoId in enumerate(videos):
                    videosim = get_user_similarity_for_video(user1Id, user2Id, videoId)
                    t = type(stat[row, col])
                    res += 'v'+str(i+1) + '=' + str("%.2f" % videosim) + '; '
                overall_sim = calculate_similarity(user1Id,user2Id)
                res+='overall='+str("%.2f" % overall_sim)
                stat[row, col] = res
                print(row,col,res)

        workbook = xlsxwriter.Workbook('C:\\Users\\Mariya\\Documents\\_Uni\\\II\\practice\\stat.xlsx')
        worksheet = workbook.add_worksheet()
        row = 0

        for row, data in enumerate(stat):
            for col, value in enumerate(data):
                print(value.decode())
                print(str(value,'utf-8'))
                worksheet.write_string(row, col, str(value,'utf-8'))
        workbook.close()

    except:
        print(Exception)




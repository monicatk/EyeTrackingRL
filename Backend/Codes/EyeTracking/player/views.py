from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views import generic
from django.http import JsonResponse
from django.template import RequestContext

import gazelistener

from player.helpers.dbmanager import *
from player.helpers.video import *
from player.helpers.viewmodels import *

# "player" and "search"
class PlayerIndexView(LoginRequiredMixin, generic.ListView):
    login_url = '/login/'
    redirect_field_name = 'redirect_to'
    template_name = 'player/index.html'
    context_object_name = 'all_videos'


    def get_queryset(self):
        top_rated_videos = top_rated()
        last_watched = top_user_history(self.request.user.id)
        all_videos = dict()
        all_videos['top_rated'] = top_rated_videos
        all_videos['last_watched'] = last_watched
        return all_videos

#play a video
class DetailView(generic.ListView):
    template_name = 'player/player.html'

    def get_queryset(self):
        video_id=self.kwargs['videoid']
        videos = similar_video_search(video_id)
        return videos

    def get_context_data(self, **kwargs):
        context = super(DetailView, self).get_context_data(**kwargs)
        context['videoid'] = self.kwargs['videoid']
        context["Rating"] = 0
        store_user_history(self.request.user.id, context['videoid'], context["Rating"])
        return context

def rating(request):
    rating = request.GET.get('rating')
    videoId = request.GET.get('videoId')
    if (rating != 0):
        store_user_history(request.user.id, videoId, rating)
    rating_data = Rating(video_id = videoId, userId = request.user.id, userRating = rating)
    data = rating_data.get_statistics()
    return JsonResponse(data)

def retrieve_fixations(request):
    videoId = request.GET.get('videoId')
    fixations = load_fixations(request.user.id, videoId)
    #fixations = load_fixations(3, '1KloVyRDA0Q')
    return JsonResponse(fixations, safe=False)

# search a video
class SearchView(generic.ListView):

    template_name = 'player/search.html'

    def get(self, request, *args, **kwargs):
        q = request.GET.get('q')
        videos = keyword_search(q, self.request.user.id)
        error = ''
        if not q:
            error = "error message"
        return render(request, self.template_name, {'error': error, 'all_videos': videos})

def record_state(request):
    """ Changes the state of the recording device """
    # videoID, state, length=-1, passed=0
    gazelistener.gaze_video_id = request.GET.get('videoId')
    state = int(request.GET.get('state'))
    length = int(request.GET.get('length'))
    passed = int(request.GET.get('passed'))
    gazelistener.gaze_user_id = request.user.id
    if state == 3 and passed / length > 0.9:
        gazelistener.doRecord = gazelistener.Record(2)
    else:
        gazelistener.doRecord = gazelistener.Record(state)
    return True

"""
#"log-in"
class UserFormView(View):
    template_name= 'player/login.html'
    wrongname=False
    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('player:index')
        else:
            wrongname=True
            return render(request,self.template_name,{'wrongname':wrongname})
        return render(request,self.template_name)

class ExitView(View):
    template_name= 'player/exit.html'
    wrongname=False
    def get(self, request):
        return render(request, self.template_name)
"""

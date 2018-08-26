from django.conf.urls import url
from . import views

app_name='player'

urlpatterns = [
    url(r'^$', views.PlayerIndexView.as_view(), name='index'),
    url(r'^search/$', views.SearchView.as_view(), name="search"),
    url(r'^detail/(?P<videoid>[\w-]+)/$', views.DetailView.as_view(), name="detail"),
    url(r'^ajax/rating/$', views.rating, name='rating'),
    url(r'^ajax/retrieve_fixations/$', views.retrieve_fixations, name='retrieve_fixations'),
    url(r'^ajax/record_state/$', views.record_state, name='record_state'),
]

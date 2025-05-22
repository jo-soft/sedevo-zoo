from django.urls import re_path
import animals.views as views

url_patterns = [
    re_path(r'^animals/$', views.animals_list, name='animals'),
    re_path(r'^animals/(?P<id>[0-9]+)/$', views.animal, name='animal_detail'),
]

from channels.routing import URLRouter
from django.urls import path

from animals.routing import websocket_urlpatterns as animal_websocket_patterns

websocket_urlpatterns = [
    path('animals/', URLRouter(animal_websocket_patterns)),
]

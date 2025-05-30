from django.urls import path
from .consumers import AnimalWebsocketView

websocket_urlpatterns = [
    path('ws/', AnimalWebsocketView.as_asgi()),
]

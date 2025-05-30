from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AnimalJSONView

router = DefaultRouter()
router.register(r'animal', AnimalJSONView)

urlpatterns = [
    path('', include(router.urls)),
]

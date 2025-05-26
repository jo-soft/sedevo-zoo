from django.urls import include, path

from .views import AnimalView

from rest_framework.routers import DefaultRouter

# Create a router and register our ViewSets with it.
router = DefaultRouter()
router.register(r'animal', AnimalView)

urlpatterns = [
    path('', include(router.urls)),
]

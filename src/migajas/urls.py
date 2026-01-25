from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InteractionViewSet, StatsView

router = DefaultRouter()
router.register(r'interactions', InteractionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', StatsView.as_view(), name='stats'),
]

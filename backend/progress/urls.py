from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import ProgressViewSet
r=DefaultRouter(); r.register('progress',ProgressViewSet,basename='progress')
urlpatterns=[path('',include(r.urls))]

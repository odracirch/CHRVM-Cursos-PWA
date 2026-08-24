from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import EvaluationViewSet,AttemptViewSet
r=DefaultRouter(); r.register('evaluations',EvaluationViewSet); r.register('attempts',AttemptViewSet,basename='attempt')
urlpatterns=[path('',include(r.urls))]

from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import *
r=DefaultRouter(); r.register('courses',CourseViewSet); r.register('categories',CategoryViewSet); r.register('modules',ModuleViewSet); r.register('lessons',LessonViewSet)
urlpatterns=[path('',include(r.urls))]

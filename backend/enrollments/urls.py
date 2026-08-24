from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import EnrollmentViewSet
r=DefaultRouter(); r.register('enrollments',EnrollmentViewSet,basename='enrollment')
urlpatterns=[path('',include(r.urls))]

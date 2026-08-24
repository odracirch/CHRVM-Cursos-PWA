from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import CertificateViewSet,verify
r=DefaultRouter(); r.register('certificates',CertificateViewSet,basename='certificate')
urlpatterns=[path('',include(r.urls)),path('certificates/verify/<str:folio>/',verify)]

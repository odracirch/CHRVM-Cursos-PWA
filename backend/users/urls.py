from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, TokenRefreshView, RegisterView, ProfileView, change_password, UserViewSet
router=DefaultRouter(); router.register('users',UserViewSet)
urlpatterns=[path('auth/register/',RegisterView.as_view()),path('auth/login/',LoginView.as_view()),path('auth/refresh/',TokenRefreshView.as_view()),path('auth/profile/',ProfileView.as_view()),path('auth/change-password/',change_password),path('',include(router.urls))]

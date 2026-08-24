from django.contrib import admin
from .models import Category,Course,Module,Lesson
admin.site.register([Category,Course,Module,Lesson])

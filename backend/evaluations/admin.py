from django.contrib import admin
from .models import Evaluation,Question,Answer,Attempt
admin.site.register([Evaluation,Question,Answer,Attempt])

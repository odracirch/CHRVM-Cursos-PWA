from rest_framework import serializers
from .models import LessonProgress
class ProgressSerializer(serializers.ModelSerializer):
 class Meta: model=LessonProgress; fields='__all__'; read_only_fields=['student','completed_at']

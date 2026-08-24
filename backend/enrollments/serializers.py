from rest_framework import serializers
from .models import Enrollment
class EnrollmentSerializer(serializers.ModelSerializer):
 course_title=serializers.CharField(source='course.title',read_only=True); student_name=serializers.CharField(source='student.full_name',read_only=True)
 class Meta: model=Enrollment; fields=['id','student','student_name','course','course_title','enrolled_at','status','progress_percentage','completed_at']; read_only_fields=['student','enrolled_at','progress_percentage','completed_at']

from rest_framework import serializers
from .models import *
class CategorySerializer(serializers.ModelSerializer):
 class Meta: model=Category; fields='__all__'
class LessonSerializer(serializers.ModelSerializer):
 class Meta: model=Lesson; fields='__all__'
class ModuleSerializer(serializers.ModelSerializer):
 lessons=LessonSerializer(many=True,read_only=True)
 class Meta: model=Module; fields=['id','course','title','description','order','lessons']
class CourseSerializer(serializers.ModelSerializer):
 instructor_name=serializers.CharField(source='instructor.full_name',read_only=True); category_name=serializers.CharField(source='category.name',read_only=True); modules_count=serializers.SerializerMethodField()
 def get_modules_count(self,obj): return obj.modules.count()
 class Meta: model=Course; fields=['id','title','slug','description','short_description','category','category_name','level','duration','image','price','published','instructor','instructor_name','created_at','updated_at','modules_count']

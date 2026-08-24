from rest_framework import viewsets, permissions
from .models import *
from .serializers import *
from .permissions import IsAdminOrInstructorOwner
class CategoryViewSet(viewsets.ModelViewSet): queryset=Category.objects.all().order_by('name'); serializer_class=CategorySerializer; permission_classes=[permissions.IsAuthenticatedOrReadOnly]; search_fields=['name','description']; ordering_fields=['name','created_at']
class CourseViewSet(viewsets.ModelViewSet):
 queryset=Course.objects.select_related('category','instructor').all().order_by('-created_at'); serializer_class=CourseSerializer; filterset_fields=['category','level','instructor','published']; search_fields=['title','description','short_description']; ordering_fields=['created_at','title','price','duration']
 def get_queryset(self):
  qs=super().get_queryset()
  if not self.request.user.is_authenticated or self.request.user.role=='student': qs=qs.filter(published=True)
  return qs
 def get_permissions(self):
  if self.action in ['list','retrieve']: return [permissions.AllowAny()]
  return [IsAdminOrInstructorOwner()]
 def perform_create(self,serializer):
  user=self.request.user; serializer.save(instructor=user if user.role=='instructor' else serializer.validated_data.get('instructor',user))
class ModuleViewSet(viewsets.ModelViewSet):
 queryset=Module.objects.select_related('course','course__instructor').prefetch_related('lessons'); serializer_class=ModuleSerializer; permission_classes=[permissions.IsAuthenticated]
 def get_queryset(self):
  qs=super().get_queryset(); return qs if self.request.user.role=='admin' else qs.filter(course__instructor=self.request.user)
class LessonViewSet(viewsets.ModelViewSet):
 queryset=Lesson.objects.select_related('module','module__course'); serializer_class=LessonSerializer; permission_classes=[permissions.IsAuthenticated]
 def get_queryset(self):
  qs=super().get_queryset(); return qs if self.request.user.role=='admin' else qs.filter(module__course__instructor=self.request.user)

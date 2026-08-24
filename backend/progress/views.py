from django.utils import timezone
from rest_framework import viewsets,permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LessonProgress
from .serializers import ProgressSerializer
from enrollments.models import Enrollment
from courses.models import Course
from certificates.services import create_certificate
class ProgressViewSet(viewsets.ModelViewSet):
 serializer_class=ProgressSerializer; permission_classes=[permissions.IsAuthenticated]
 def get_queryset(self): return LessonProgress.objects.filter(student=self.request.user).select_related('lesson','lesson__module')
 def perform_create(self,serializer): serializer.save(student=self.request.user,completed_at=timezone.now() if serializer.validated_data.get('completed') else None)
 def perform_update(self,serializer): serializer.save(completed_at=timezone.now() if serializer.validated_data.get('completed') else None)
 @action(detail=False,methods=['post'])
 def complete(self,request):
  lesson_id=request.data.get('lesson'); obj,_=LessonProgress.objects.get_or_create(student=request.user,lesson_id=lesson_id); obj.completed=True; obj.completed_at=timezone.now(); obj.save();
  course=obj.lesson.module.course; total=course.modules.filter(lessons__published=True).values('lessons').count(); done=LessonProgress.objects.filter(student=request.user,lesson__module__course=course,completed=True).count(); pct=round(done*100/total) if total else 0
  Enrollment.objects.filter(student=request.user,course=course).update(progress_percentage=pct,status=Enrollment.Status.COMPLETED if pct==100 else Enrollment.Status.ACTIVE,completed_at=timezone.now() if pct==100 else None)
  if pct==100:
   from evaluations.models import Attempt
   evaluations=list(course.evaluations.all())
   if not evaluations or all(Attempt.objects.filter(student=request.user,evaluation=e,passed=True).exists() for e in evaluations): create_certificate(request.user,course)
  return Response({'lesson':obj.lesson_id,'progress_percentage':pct})

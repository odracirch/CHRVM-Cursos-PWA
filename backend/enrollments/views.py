from rest_framework import viewsets,permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Enrollment
from .serializers import EnrollmentSerializer
class EnrollmentViewSet(viewsets.ModelViewSet):
 serializer_class=EnrollmentSerializer; permission_classes=[permissions.IsAuthenticated]
 def get_queryset(self):
  u=self.request.user
  if u.role=='admin': return Enrollment.objects.select_related('course','student').all().order_by('-enrolled_at')
  if u.role=='instructor': return Enrollment.objects.filter(course__instructor=u).select_related('course','student')
  return Enrollment.objects.filter(student=u).select_related('course')
 def perform_create(self,serializer): serializer.save(student=self.request.user)
 @action(detail=False,methods=['post'])
 def enroll(self,request):
  course_id=request.data.get('course'); obj,created=Enrollment.objects.get_or_create(student=request.user,course_id=course_id)
  return Response(EnrollmentSerializer(obj).data,status=201 if created else 200)

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets,permissions
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Certificate
from .serializers import CertificateSerializer
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify(request,folio):
 c=get_object_or_404(Certificate.objects.select_related('student','course'),folio=folio)
 return Response({'valid':True,'folio':c.folio,'student':c.student.full_name,'course':c.course.title,'issue_date':c.issue_date,'verification_code':str(c.verification_code)})
class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
 serializer_class=CertificateSerializer; permission_classes=[permissions.IsAuthenticated]
 def get_queryset(self):
  u=self.request.user
  return Certificate.objects.select_related('student','course') if u.role=='admin' else Certificate.objects.filter(student=u)

from rest_framework import viewsets,permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from .serializers import *
class EvaluationViewSet(viewsets.ModelViewSet):
 queryset=Evaluation.objects.prefetch_related('questions__answers').all(); serializer_class=EvaluationSerializer; permission_classes=[permissions.IsAuthenticated]
 def get_queryset(self):
  u=self.request.user; return super().get_queryset() if u.role=='admin' else super().get_queryset().filter(course__instructor=u) if u.role=='instructor' else super().get_queryset()
 @action(detail=True,methods=['post'])
 def submit(self,request,pk=None):
  ev=self.get_object(); answers=request.data.get('answers',{}); total=0; earned=0
  for q in ev.questions.all():
   total+=q.points
   selected=answers.get(str(q.id))
   correct_ids=list(q.answers.filter(correct=True).values_list('id',flat=True))
   if isinstance(selected,list): ok=sorted(map(int,selected))==sorted(correct_ids)
   else:
    try: ok=int(selected) in correct_ids and len(correct_ids)==1
    except (TypeError,ValueError): ok=False
   if ok: earned+=q.points
  grade=round(earned*100/total,2) if total else 0; passed=grade>=ev.minimum_pass_percentage; attempt=Attempt.objects.create(student=request.user,evaluation=ev,grade=grade,passed=passed)
  return Response(AttemptSerializer(attempt).data)
class AttemptViewSet(viewsets.ReadOnlyModelViewSet):
 serializer_class=AttemptSerializer; permission_classes=[permissions.IsAuthenticated]
 def get_queryset(self):
  u=self.request.user; return Attempt.objects.all() if u.role=='admin' else Attempt.objects.filter(student=u)

from rest_framework import serializers
from .models import Evaluation,Question,Answer,Attempt
class AnswerPublicSerializer(serializers.ModelSerializer):
 class Meta: model=Answer; fields=['id','text']
class QuestionPublicSerializer(serializers.ModelSerializer):
 answers=AnswerPublicSerializer(many=True,read_only=True)
 class Meta: model=Question; fields=['id','question','type','points','order','answers']
class EvaluationSerializer(serializers.ModelSerializer):
 questions=QuestionPublicSerializer(many=True,read_only=True)
 class Meta: model=Evaluation; fields=['id','course','title','description','minimum_pass_percentage','questions']
class AttemptSerializer(serializers.ModelSerializer):
 class Meta: model=Attempt; fields='__all__'; read_only_fields=['student','grade','passed','date']

from django.db import models
class Evaluation(models.Model): course=models.ForeignKey('courses.Course',on_delete=models.CASCADE,related_name='evaluations'); title=models.CharField(max_length=200); description=models.TextField(blank=True); minimum_pass_percentage=models.PositiveIntegerField(default=70)
class Question(models.Model):
 class Type(models.TextChoices): SINGLE='single','Opción única'; TRUE_FALSE='true_false','Verdadero/Falso'
 evaluation=models.ForeignKey(Evaluation,on_delete=models.CASCADE,related_name='questions'); question=models.TextField(); type=models.CharField(max_length=20,choices=Type.choices,default=Type.SINGLE); points=models.PositiveIntegerField(default=1); order=models.PositiveIntegerField(default=0)
class Answer(models.Model): question=models.ForeignKey(Question,on_delete=models.CASCADE,related_name='answers'); text=models.CharField(max_length=500); correct=models.BooleanField(default=False)
class Attempt(models.Model): student=models.ForeignKey('users.User',on_delete=models.CASCADE,related_name='attempts'); evaluation=models.ForeignKey(Evaluation,on_delete=models.CASCADE,related_name='attempts'); grade=models.DecimalField(max_digits=5,decimal_places=2); passed=models.BooleanField(default=False); date=models.DateTimeField(auto_now_add=True)

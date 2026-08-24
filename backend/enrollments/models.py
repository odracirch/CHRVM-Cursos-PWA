from django.db import models
class Enrollment(models.Model):
 class Status(models.TextChoices): ACTIVE='active','Activo'; COMPLETED='completed','Terminado'; CANCELLED='cancelled','Cancelado'
 student=models.ForeignKey('users.User',on_delete=models.CASCADE,related_name='enrollments'); course=models.ForeignKey('courses.Course',on_delete=models.CASCADE,related_name='enrollments'); enrolled_at=models.DateTimeField(auto_now_add=True); status=models.CharField(max_length=20,choices=Status.choices,default=Status.ACTIVE); progress_percentage=models.PositiveIntegerField(default=0); completed_at=models.DateTimeField(null=True,blank=True)
 class Meta: constraints=[models.UniqueConstraint(fields=['student','course'],name='unique_student_course')]

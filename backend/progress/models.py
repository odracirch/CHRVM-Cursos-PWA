from django.db import models
class LessonProgress(models.Model):
 student=models.ForeignKey('users.User',on_delete=models.CASCADE,related_name='lesson_progress'); lesson=models.ForeignKey('courses.Lesson',on_delete=models.CASCADE,related_name='progress'); completed=models.BooleanField(default=False); completed_at=models.DateTimeField(null=True,blank=True)
 class Meta: constraints=[models.UniqueConstraint(fields=['student','lesson'],name='unique_student_lesson')]

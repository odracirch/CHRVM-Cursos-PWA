from django.db import migrations, models
import django.db.models.deletion
class Migration(migrations.Migration):
 initial=True
 dependencies=[('users','0001_initial'),('courses','0001_initial')]
 operations=[migrations.CreateModel(name='LessonProgress',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('completed',models.BooleanField(default=False)),('completed_at',models.DateTimeField(blank=True,null=True)),('lesson',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='progress',to='courses.lesson')),('student',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='lesson_progress',to='users.user'))],options={'constraints':[models.UniqueConstraint(fields=('student','lesson'),name='unique_student_lesson')]} )]

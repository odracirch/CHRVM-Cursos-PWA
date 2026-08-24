from django.db import migrations, models
import django.db.models.deletion
class Migration(migrations.Migration):
 initial=True
 dependencies=[('users','0001_initial'),('courses','0001_initial')]
 operations=[migrations.CreateModel(name='Enrollment',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('enrolled_at',models.DateTimeField(auto_now_add=True)),('status',models.CharField(choices=[('active','Activo'),('completed','Terminado'),('cancelled','Cancelado')],default='active',max_length=20)),('progress_percentage',models.PositiveIntegerField(default=0)),('completed_at',models.DateTimeField(blank=True,null=True)),('course',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='enrollments',to='courses.course')),('student',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='enrollments',to='users.user'))],options={'constraints':[models.UniqueConstraint(fields=('student','course'),name='unique_student_course')]} )]

from django.db import migrations, models
import django.db.models.deletion
import uuid
class Migration(migrations.Migration):
 initial=True
 dependencies=[('users','0001_initial'),('courses','0001_initial')]
 operations=[migrations.CreateModel(name='Certificate',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('folio',models.CharField(max_length=50,unique=True)),('issue_date',models.DateTimeField(auto_now_add=True)),('percentage',models.PositiveIntegerField(default=100)),('hours',models.PositiveIntegerField(default=0)),('pdf_file',models.FileField(blank=True,null=True,upload_to='certificates/')),('verification_code',models.UUIDField(default=uuid.uuid4,editable=False,unique=True)),('course',models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,related_name='certificates',to='courses.course')),('student',models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,related_name='certificates',to='users.user'))])]

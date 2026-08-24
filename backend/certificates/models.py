import uuid
from django.db import models
class Certificate(models.Model):
 student=models.ForeignKey('users.User',on_delete=models.PROTECT,related_name='certificates'); course=models.ForeignKey('courses.Course',on_delete=models.PROTECT,related_name='certificates'); folio=models.CharField(max_length=50,unique=True); issue_date=models.DateTimeField(auto_now_add=True); percentage=models.PositiveIntegerField(default=100); hours=models.PositiveIntegerField(default=0); pdf_file=models.FileField(upload_to='certificates/',blank=True,null=True); verification_code=models.UUIDField(default=uuid.uuid4,unique=True,editable=False)

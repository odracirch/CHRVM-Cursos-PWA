from django.db import models
from django.utils.text import slugify
class Category(models.Model):
    name=models.CharField(max_length=120,unique=True); description=models.TextField(blank=True); slug=models.SlugField(unique=True,blank=True); created_at=models.DateTimeField(auto_now_add=True)
    def save(self,*a,**kw): self.slug=self.slug or slugify(self.name); super().save(*a,**kw)
    def __str__(self): return self.name
class Course(models.Model):
    class Level(models.TextChoices): BEGINNER='beginner','Principiante'; INTERMEDIATE='intermediate','Intermedio'; ADVANCED='advanced','Avanzado'
    title=models.CharField(max_length=200); slug=models.SlugField(unique=True,blank=True); description=models.TextField(); short_description=models.CharField(max_length=300); category=models.ForeignKey(Category,on_delete=models.PROTECT,related_name='courses'); level=models.CharField(max_length=20,choices=Level.choices,default=Level.BEGINNER); duration=models.PositiveIntegerField(default=1,help_text='Horas'); image=models.ImageField(upload_to='courses/',blank=True,null=True); price=models.DecimalField(max_digits=10,decimal_places=2,default=0); published=models.BooleanField(default=False); instructor=models.ForeignKey('users.User',on_delete=models.PROTECT,related_name='courses'); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    def save(self,*a,**kw): self.slug=self.slug or slugify(self.title); super().save(*a,**kw)
    def __str__(self): return self.title
class Module(models.Model):
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='modules')
    title=models.CharField(max_length=200)
    description=models.TextField(blank=True)
    order=models.PositiveIntegerField(default=0)
    class Meta:
        ordering=['order']
        constraints=[models.UniqueConstraint(fields=['course','order'],name='unique_course_module_order')]
class Lesson(models.Model):
    module=models.ForeignKey(Module,on_delete=models.CASCADE,related_name='lessons'); title=models.CharField(max_length=200); description=models.TextField(blank=True); content=models.TextField(blank=True); video_url=models.URLField(blank=True); file=models.FileField(upload_to='lessons/',blank=True,null=True); duration=models.PositiveIntegerField(default=0,help_text='Minutos'); order=models.PositiveIntegerField(default=0); published=models.BooleanField(default=False)
    class Meta: ordering=['order']; unique_together=[('module','order')]

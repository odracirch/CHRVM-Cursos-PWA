import os
from django.core.management.base import BaseCommand
from users.models import User
from courses.models import Category,Course,Module,Lesson
class Command(BaseCommand):
 def handle(self,*args,**kwargs):
  cats=[]
  for n,d in [('Programación','Lenguajes y desarrollo de software'),('Ofimática','Herramientas digitales para productividad'),('Cultura Digital','Competencias digitales y tecnología')]: cats.append(Category.objects.get_or_create(name=n,defaults={'description':d})[0])
  def user(email,pw,role,fn,ln):
   u,created=User.objects.get_or_create(email=email,defaults={'first_name':fn,'last_name':ln,'role':role,'is_staff':role=='admin','is_superuser':role=='admin'})
   if created: u.set_password(pw); u.save()
   return u
  admin=user(os.getenv('SEED_ADMIN_EMAIL','admin@example.com'),os.getenv('SEED_ADMIN_PASSWORD','ChangeMe123!'),'admin','Administrador','CHRVM')
  ins=user(os.getenv('SEED_INSTRUCTOR_EMAIL','instructor@example.com'),os.getenv('SEED_INSTRUCTOR_PASSWORD','ChangeMe123!'),'instructor','Instructor','Demo')
  stu=user(os.getenv('SEED_STUDENT_EMAIL','student@example.com'),os.getenv('SEED_STUDENT_PASSWORD','ChangeMe123!'),'student','Alumno','Demo')
  for i,(title,cat,level) in enumerate([('Introducción a Java',cats[0],'beginner'),('Python desde cero',cats[0],'beginner'),('Herramientas de oficina',cats[1],'beginner'),('Ciudadanía digital',cats[2],'intermediate')]):
   c,created=Course.objects.get_or_create(slug=title.lower().replace(' ','-'),defaults={'title':title,'description':f'Curso práctico de {title}.','short_description':f'Aprende {title} paso a paso.','category':cat,'level':level,'duration':20+i*5,'price':0,'published':True,'instructor':ins})
   for m in range(1,3):
    mod,_=Module.objects.get_or_create(course=c,order=m,defaults={'title':f'Módulo {m}: Fundamentos','description':'Contenido esencial del curso.'})
    for l in range(1,4): Lesson.objects.get_or_create(module=mod,order=l,defaults={'title':f'Lección {m}.{l}','description':'Lección práctica.','content':'Contenido educativo de ejemplo listo para editar desde el panel.','duration':15,'published':True})
  self.stdout.write(self.style.SUCCESS('Seed completado.'))

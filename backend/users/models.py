from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
class UserManager(BaseUserManager):
    def create_user(self,email,password=None,**extra):
        if not email: raise ValueError('El email es obligatorio')
        u=self.model(email=self.normalize_email(email),**extra); u.set_password(password); u.save(using=self._db); return u
    def create_superuser(self,email,password=None,**extra):
        extra.setdefault('is_staff',True); extra.setdefault('is_superuser',True); extra.setdefault('role',User.Role.ADMIN)
        return self.create_user(email,password,**extra)
class User(AbstractBaseUser,PermissionsMixin):
    class Role(models.TextChoices): ADMIN='admin','Administrador'; INSTRUCTOR='instructor','Instructor'; STUDENT='student','Alumno'
    email=models.EmailField(unique=True); first_name=models.CharField(max_length=100); last_name=models.CharField(max_length=100); phone=models.CharField(max_length=30,blank=True); photo=models.ImageField(upload_to='users/',blank=True,null=True); role=models.CharField(max_length=20,choices=Role.choices,default=Role.STUDENT); date_joined=models.DateTimeField(auto_now_add=True); is_active=models.BooleanField(default=True); is_staff=models.BooleanField(default=False)
    USERNAME_FIELD='email'; REQUIRED_FIELDS=[]; objects=UserManager()
    def __str__(self): return self.email
    @property
    def full_name(self): return f'{self.first_name} {self.last_name}'.strip()

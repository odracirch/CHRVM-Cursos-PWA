from rest_framework import serializers
from .models import User
class UserSerializer(serializers.ModelSerializer):
    class Meta: model=User; fields=['id','email','first_name','last_name','phone','photo','role','date_joined']; read_only_fields=['id','date_joined','role']
class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True,min_length=8)
    class Meta: model=User; fields=['email','first_name','last_name','password','phone']
    def create(self,v): return User.objects.create_user(**v)
class ChangePasswordSerializer(serializers.Serializer): old_password=serializers.CharField(); new_password=serializers.CharField(min_length=8)

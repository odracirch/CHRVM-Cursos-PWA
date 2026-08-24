from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from .serializers import *
class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls,user):
        t=super().get_token(user); t['role']=user.role; t['email']=user.email; return t
class LoginView(TokenObtainPairView): serializer_class=LoginSerializer
class RegisterView(generics.CreateAPIView): queryset=User.objects.all(); serializer_class=RegisterSerializer
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class=UserSerializer
    permission_classes=[permissions.IsAuthenticated]
    def get_object(self): return self.request.user
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    s=ChangePasswordSerializer(data=request.data); s.is_valid(raise_exception=True)
    if not request.user.check_password(s.validated_data['old_password']): return Response({'detail':'Contraseña actual incorrecta.'},status=400)
    request.user.set_password(s.validated_data['new_password']); request.user.save(); return Response({'detail':'Contraseña actualizada.'})
class UserViewSet(viewsets.ModelViewSet):
    queryset=User.objects.all().order_by('-date_joined'); serializer_class=UserSerializer; permission_classes=[permissions.IsAdminUser]; search_fields=['email','first_name','last_name']; ordering_fields=['date_joined','email']

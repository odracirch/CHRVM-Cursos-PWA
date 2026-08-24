from rest_framework import permissions
class IsAdminOrInstructorOwner(permissions.BasePermission):
 def has_permission(self,request,view): return bool(request.user and request.user.is_authenticated and request.user.role in ['admin','instructor'])
 def has_object_permission(self,request,view,obj): return request.user.role=='admin' or getattr(obj,'instructor_id',None)==request.user.id

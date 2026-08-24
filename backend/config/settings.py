import os
from pathlib import Path
import dj_database_url
from datetime import timedelta
BASE_DIR=Path(__file__).resolve().parent.parent
SECRET_KEY=os.getenv('DJANGO_SECRET_KEY','unsafe-dev-key')
DEBUG=os.getenv('DEBUG','False').lower()=='true'
ALLOWED_HOSTS=[x.strip() for x in os.getenv('ALLOWED_HOSTS','localhost,127.0.0.1').split(',') if x.strip()]
INSTALLED_APPS=['django.contrib.admin','django.contrib.auth','django.contrib.contenttypes','django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles','corsheaders','rest_framework','django_filters','users','courses','enrollments','progress','evaluations','certificates']
MIDDLEWARE=['corsheaders.middleware.CorsMiddleware','django.middleware.security.SecurityMiddleware','django.contrib.sessions.middleware.SessionMiddleware','django.middleware.common.CommonMiddleware','django.middleware.csrf.CsrfViewMiddleware','django.contrib.auth.middleware.AuthenticationMiddleware','django.contrib.messages.middleware.MessageMiddleware','django.middleware.clickjacking.XFrameOptionsMiddleware']
ROOT_URLCONF='config.urls'
TEMPLATES=[{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION='config.wsgi.application'
DATABASES={'default':dj_database_url.parse(os.getenv('DATABASE_URL','postgresql://chrvm:chrvm@localhost:5432/chrvm'), conn_max_age=600, ssl_require=os.getenv('DB_SSL','false').lower()=='true')}
AUTH_PASSWORD_VALIDATORS=[{'NAME':'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},{'NAME':'django.contrib.auth.password_validation.MinimumLengthValidator'},{'NAME':'django.contrib.auth.password_validation.CommonPasswordValidator'}]
LANGUAGE_CODE='es-mx'; TIME_ZONE='America/Mexico_City'; USE_I18N=True; USE_TZ=True
STATIC_URL='/static/'; STATIC_ROOT=BASE_DIR/'staticfiles'; MEDIA_URL='/media/'; MEDIA_ROOT=BASE_DIR/'media'
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'; AUTH_USER_MODEL='users.User'
CORS_ALLOWED_ORIGINS=[x.strip() for x in os.getenv('CORS_ALLOWED_ORIGINS','http://localhost:3000').split(',') if x.strip()]
CSRF_TRUSTED_ORIGINS=[x.strip() for x in os.getenv('CSRF_TRUSTED_ORIGINS','http://localhost:3000').split(',') if x.strip()]
REST_FRAMEWORK={'DEFAULT_AUTHENTICATION_CLASSES':('rest_framework_simplejwt.authentication.JWTAuthentication',),'DEFAULT_PERMISSION_CLASSES':('rest_framework.permissions.AllowAny',),'DEFAULT_FILTER_BACKENDS':('django_filters.rest_framework.DjangoFilterBackend','rest_framework.filters.SearchFilter','rest_framework.filters.OrderingFilter'),'DEFAULT_PAGINATION_CLASS':'rest_framework.pagination.PageNumberPagination','PAGE_SIZE':20,'DEFAULT_THROTTLE_CLASSES':('rest_framework.throttling.AnonRateThrottle','rest_framework.throttling.UserRateThrottle'),'DEFAULT_THROTTLE_RATES':{'anon':'100/hour','user':'1000/hour'}}
SIMPLE_JWT={'ACCESS_TOKEN_LIFETIME':timedelta(minutes=30),'REFRESH_TOKEN_LIFETIME':timedelta(days=7),'ROTATE_REFRESH_TOKENS':True,'BLACKLIST_AFTER_ROTATION':True,'SIGNING_KEY':os.getenv('JWT_SECRET_KEY',SECRET_KEY)}
SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO','https')
SESSION_COOKIE_SECURE=not DEBUG; CSRF_COOKIE_SECURE=not DEBUG; SECURE_CONTENT_TYPE_NOSNIFF=True; SECURE_REFERRER_POLICY='strict-origin-when-cross-origin'; X_FRAME_OPTIONS='DENY'

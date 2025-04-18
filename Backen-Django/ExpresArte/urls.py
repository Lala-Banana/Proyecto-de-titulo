from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
# mi_app/urls.py
urlpatterns = [
    path('register/', views.RegistroView.as_view(), name='registro'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('me/', views.UsuarioActualView.as_view(), name='usuario-actual'),
    path('usuarios/google/', views.guardar_usuario_google, name='guardar_usuario_google'),
    path('token-google/', views.TokenGoogleView.as_view(), name='token_google'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]


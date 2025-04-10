from django.urls import path
from .views import RegistroView, LoginView, UsuarioActualView 


urlpatterns = [
    path('register/', RegistroView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UsuarioActualView.as_view(), name='me'),  # 👈 Esta línea está bien
]



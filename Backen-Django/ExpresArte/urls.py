# urls.py (usando path personalizado para cada ViewSet)
from django.urls import path
from .views import (
    CategoriaAdminDetailView, ObraAdminDetailView, ObraAdminListView, PerfilPublicoView, RegistroView, LoginView, UsuarioActualView, UsuarioAdminDetailView, UsuarioAdminListView, UsuariosPublicosView, guardar_usuario_google,
    CategoriaListCreateView, CategoriaDetailView,
    ObraListCreateView, ObraDetailView,
    CompraListCreateView, CompraDetailView,
    FavoritoListCreateView, FavoritoDetailView,
    MensajeListCreateView, MensajeDetailView,
    NotificacionListCreateView, NotificacionDetailView, TokenGoogleView,
    LogListView,
    ObrasPorCategoriaView , # ← Correctamente agregado
    editar_perfil,
    CategoriaAdminListView,
    ObrasPorUsuarioView

)

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Autenticación
    path('register/', RegistroView.as_view(), name='registro'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UsuarioActualView.as_view(), name='usuario-actual'),
    path('usuarios/google/', guardar_usuario_google, name='guardar_usuario_google'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token_google/', TokenGoogleView.as_view(), name='token_google'),

    # Categorías
    path('categorias/', CategoriaListCreateView.as_view(), name='categorias-list-create'),
    path('categorias/<int:pk>/', CategoriaDetailView.as_view(), name='categorias-detail'),
    path('categorias/<slug:slug>/', ObrasPorCategoriaView.as_view(), name='obras-por-categoria'),


    path('perfil-publico/<int:usuario_id>/', PerfilPublicoView.as_view(), name='perfil-publico'),
    path('usuarios-publicos/', UsuariosPublicosView.as_view(), name='usuarios-publicos'),

 
    # Obras
    path('obras/', ObraListCreateView.as_view(), name='obras-list-create'),
    path('obras/<int:pk>/', ObraDetailView.as_view(), name='obras-detail'),

    # Compras
    path('compras/', CompraListCreateView.as_view(), name='compras-list-create'),
    path('compras/<int:pk>/', CompraDetailView.as_view(), name='compras-detail'),

    # Favoritos
    path('favoritos/', FavoritoListCreateView.as_view(), name='favoritos-list-create'),
    path('favoritos/<int:pk>/', FavoritoDetailView.as_view(), name='favoritos-detail'),

    # Mensajes
    path('mensajes/', MensajeListCreateView.as_view(), name='mensajes-list-create'),
    path('mensajes/<int:pk>/', MensajeDetailView.as_view(), name='mensajes-detail'),

    # Notificaciones
    path('notificaciones/', NotificacionListCreateView.as_view(), name='notificaciones-list-create'),
    path('notificaciones/<int:pk>/', NotificacionDetailView.as_view(), name='notificaciones-detail'),

    # Logs (solo lectura)
    path('logs/', LogListView.as_view(), name='logs-list'),
    
    #EDITAR PERFIL
    path('editar-perfil/', editar_perfil, name='editar_perfil'),

    # ADMIN
    path('admin/categorias/', CategoriaAdminListView.as_view(), name='admin-categorias-list'),
    path('admin/categorias/<int:pk>/', CategoriaAdminDetailView.as_view(), name='admin-categorias-detail'),

    path('admin/usuarios/', UsuarioAdminListView.as_view(), name='admin-usuarios-list'),
    path('admin/usuarios/<int:pk>/', UsuarioAdminDetailView.as_view(), name='admin-usuarios-detail'),

    path('admin/obras/', ObraAdminListView.as_view(), name='admin-obras-list'),
    path('admin/obras/<int:pk>/', ObraAdminDetailView.as_view(), name='admin-obras-detail'),

     path('usuarios/<int:usuario_id>/obras/', ObrasPorUsuarioView.as_view(), name='obras-por-usuario'),

]

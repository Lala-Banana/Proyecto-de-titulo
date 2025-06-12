# views.py (completo y corregido)
import os
from venv import logger
from mercadopago import SDK
from rest_framework import generics, permissions, status
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Categoria, Comentario, Obra, Compra, Favorito, Mensaje, Notificacion, Log, Usuario, Photo
from .serializers import (
    CategoriaSerializer, ObraSerializer, CompraSerializer, FavoritoSerializer,
    MensajeSerializer, NotificacionSerializer, LogSerializer,
    UsuarioSerializer, RegistroSerializer, LoginSerializer, GoogleLoginSerializer, PhotoSerializer, ComentarioSerializer
)
from rest_framework.permissions import AllowAny, IsAdminUser  # Agregado IsAdminUser
from .serializers import UsuarioPublicoSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.exceptions import NotFound
from django.db import connection
from django.core.exceptions import PermissionDenied


# Función auxiliar para obtener los tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# Autenticación
class RegistroView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({"usuario": UsuarioSerializer(user).data, "tokens": tokens}, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({"usuario": UsuarioSerializer(user).data, "tokens": tokens}, status=200)
        return Response(serializer.errors, status=400)

class UsuarioActualView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)

# ✅ NUEVO: Editar perfil
@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def editar_perfil(request):
    user = request.user
    data = request.data

    # Campos editables
    user.nombre       = data.get('nombre', user.nombre)
    user.email        = data.get('email', user.email)
    user.telefono     = data.get('telefono', user.telefono)
    user.rut          = data.get('rut', user.rut)
    user.descripcion  = data.get('descripcion', user.descripcion)
    user.tipo_usuario = data.get('tipo_usuario', user.tipo_usuario)
    user.foto_url     = data.get('foto_url', user.foto_url)
    user.fondo        = data.get('fondo', user.fondo)

    user.save()

    return Response({
        "mensaje": "Perfil actualizado correctamente.",
        "usuario": UsuarioSerializer(user).data
    }, status=status.HTTP_200_OK)

# Google Auth
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def guardar_usuario_google(request):
    serializer = GoogleLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']

        # 🔎 Verificar si ya existe el usuario
        try:
            existente = Usuario.objects.get(email=email)
            is_staff = existente.is_staff
        except Usuario.DoesNotExist:
            is_staff = False  # Por defecto no es admin

        usuario, _ = Usuario.objects.update_or_create(
            email=email,
            defaults={
                'nombre': serializer.validated_data.get('nombre', ''),
                'foto_url': serializer.validated_data.get('foto_url', ''),
                'google_id': serializer.validated_data.get('google_id', None),
                'is_staff': is_staff,  # ⬅️ Mantenemos el rol si ya era admin
            }
        )
        tokens = get_tokens_for_user(usuario)
        return Response({"usuario": UsuarioSerializer(usuario).data, "tokens": tokens})
    return Response(serializer.errors, status=400)

class TokenGoogleView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email requerido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Usuario.objects.get(email=email)
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

# CRUD personalizados
class CategoriaListCreateView(generics.ListCreateAPIView):
    queryset = Categoria.objects.filter(visible=True)
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CategoriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ObraListCreateView(generics.ListCreateAPIView):
    serializer_class = ObraSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Obra.objects.all()
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            queryset = queryset.filter(usuario__id=usuario_id)
        return queryset

class ObraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Obra.objects.all()
    serializer_class = ObraSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_destroy(self, instance):
        if instance.usuario != self.request.user:
            raise PermissionDenied("No tienes permiso para eliminar esta obra.")
        instance.delete()

class CompraListCreateView(generics.ListCreateAPIView):
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer
    permission_classes = [permissions.IsAuthenticated]

class CompraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer
    permission_classes = [permissions.IsAuthenticated]

class FavoritoListCreateView(generics.ListCreateAPIView):
    queryset = Favorito.objects.all()
    serializer_class = FavoritoSerializer
    permission_classes = [permissions.IsAuthenticated]

class FavoritoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Favorito.objects.all()
    serializer_class = FavoritoSerializer
    permission_classes = [permissions.IsAuthenticated]

class MensajeListCreateView(generics.ListCreateAPIView):
    queryset = Mensaje.objects.all()
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

class MensajeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Mensaje.objects.all()
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

class NotificacionListCreateView(generics.ListCreateAPIView):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

class NotificacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

class LogListView(generics.ListAPIView):
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    permission_classes = [permissions.IsAdminUser]

class ObrasPorCategoriaView(generics.ListAPIView):
    serializer_class = ObraSerializer

    # ← elimina cualquier chequeo de sesión o JWT aquí:
    authentication_classes = []

    # ← permites libre acceso:
    permission_classes = [AllowAny]

    def get_queryset(self):
        slug = self.kwargs['slug']
        try:
            categoria = Categoria.objects.get(slug=slug)
        except Categoria.DoesNotExist:
            raise NotFound(f"No se encontró la categoría '{slug}'")
        return Obra.objects.filter(categoria=categoria, activo=True)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mis_obras(request):
    usuario = request.user
    obras = Obra.objects.filter(usuario=usuario, activo=True)
    serializer = ObraSerializer(obras, many=True)
    return Response(serializer.data)

class PerfilPublicoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, usuario_id):
        try:
            usuario = Usuario.objects.get(id=usuario_id)
            serializer = UsuarioPublicoSerializer(usuario)
            return Response(serializer.data)
        except Usuario.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class UsuariosPublicosView(ListAPIView):
    queryset = Usuario.objects.filter(is_active=True)
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'
    
class ObraListView(generics.ListAPIView):
    serializer_class = ObraSerializer

    def get_queryset(self):
        queryset = Obra.objects.filter(activo=True)
        categoria_id = self.request.query_params.get('categoria_id')
        precio_max = self.request.query_params.get('precio_max')

        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)

        return queryset

    def get_queryset(self):
        queryset = Obra.objects.all()
        categoria_id = self.request.query_params.get('categoria_id')
        precio_max = self.request.query_params.get('precio_max')

        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)

        return queryset

# ADMIN con permisos corregidos
class CategoriaAdminListView(generics.ListCreateAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        # 🚀 Actualizar la secuencia ANTES de crear
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT setval(pg_get_serial_sequence('"ExpresArte_categoria"', 'id'), 
                              COALESCE((SELECT MAX(id) FROM "ExpresArte_categoria"), 1));
            """)

        # Luego crear normalmente
        categoria = serializer.save()
        registrar_log(self.request.user, 'Categoria', categoria.id, 'creacion', f"Categoría '{categoria.nombre}' creada.")
class CategoriaAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        categoria = serializer.save()
        registrar_log(self.request.user, 'Categoria', categoria.id, 'modificacion', f"Categoría '{categoria.nombre}' modificada.")

    def perform_destroy(self, instance):
        registrar_log(self.request.user, 'Categoria', instance.id, 'eliminacion', f"Categoría '{instance.nombre}' eliminada.")
        instance.delete()

class UsuarioAdminListView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        usuario = serializer.save()
        registrar_log(self.request.user, 'Usuario', usuario.id, 'creacion', f"Usuario '{usuario.email}' creado.")

class UsuarioAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        usuario = serializer.save()
        registrar_log(self.request.user, 'Usuario', usuario.id, 'modificacion', f"Usuario '{usuario.email}' modificado.")

    def perform_destroy(self, instance):
        registrar_log(self.request.user, 'Usuario', instance.id, 'eliminacion', f"Usuario '{instance.email}' eliminado.")
        instance.delete()

class ObraAdminListView(generics.ListCreateAPIView):
    queryset = Obra.objects.all()
    serializer_class = ObraSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        obra = serializer.save()
        registrar_log(self.request.user, 'Obra', obra.id, 'creacion', f"Obra '{obra.titulo}' creada.")

class ObraAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Obra.objects.all()
    serializer_class = ObraSerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        obra = serializer.save()
        registrar_log(self.request.user, 'Obra', obra.id, 'modificacion', f"Obra '{obra.titulo}' modificada.")

    def perform_destroy(self, instance):
        registrar_log(self.request.user, 'Obra', instance.id, 'eliminacion', f"Obra '{instance.titulo}' eliminada.")
        instance.delete()

# REGISTRAR CAMBIOS
def registrar_log(usuario, tabla, id_registro, accion, descripcion=None):
    Log.objects.create(
        usuario=usuario,
        tabla=tabla,
        id_registro=id_registro,
        accion=accion,
        descripcion=descripcion
    )

# Obra Usuario Publico por ID
class ObrasPorUsuarioView(ListAPIView):
    serializer_class = ObraSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        usuario_id = self.kwargs.get('usuario_id')
        return Obra.objects.filter(usuario_id=usuario_id)




from django.contrib.auth import get_user_model

Usuario = get_user_model()
from .models import Obra  # Asegúrate de que tu modelo Obra esté aquí importado
# views.py

import os
import logging
from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from mercadopago import SDK

from .models import Obra

logger = logging.getLogger(__name__)
User = get_user_model()


@api_view(['POST'])
@csrf_exempt
def crear_preferencia_pro(request):
    """
    Crea preferencia de Checkout Pro en producción,
    incluyendo metadata de obra_id y cantidad.
    """
    data = request.data

    # 1) Validar obra_id y cantidad
    obra_id = data.get('obra_id')
    cantidad = data.get('cantidad')
    if obra_id is None or cantidad is None:
        return Response(
            {"error": "Debes enviar obra_id y cantidad en el cuerpo de la petición"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        obra_id = int(obra_id)
        cantidad = int(cantidad)
    except (ValueError, TypeError):
        return Response(
            {"error": "obra_id y cantidad deben ser enteros válidos"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2) Obtener la obra
    try:
        obra = Obra.objects.get(pk=obra_id)
    except Obra.DoesNotExist:
        return Response(
            {"error": f"No existe ninguna Obra con id={obra_id}"},
            status=status.HTTP_404_NOT_FOUND
        )

    # 3) Validar stock
    if cantidad < 1 or cantidad > obra.stock:
        return Response(
            {"error": f"Cantidad inválida. Debe estar entre 1 y {obra.stock}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 4) Preparar datos
    titulo = obra.titulo
    precio_unitario = float(obra.precio)

    # 5) Inicializar SDK de MercadoPago
    access_token = os.getenv("MP_ACCESS_TOKEN")
    if not access_token:
        return Response(
            {"error": "No se encontró MP_ACCESS_TOKEN en configuración"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    mp = SDK(access_token)

    # 6) Armar preference_data con metadata
    preference_data = {
        "items": [
            {"title": titulo, "quantity": cantidad, "unit_price": precio_unitario}
        ],
        "metadata": {"obra_id": obra.id, "cantidad": cantidad},
        "back_urls": {
            "success": "https://misitio.com/pago/exito",
            "failure": "https://misitio.com/pago/fallo",
            "pending": "https://misitio.com/pago/pendiente"
        },
        "auto_return": "approved",
        "notification_url": "https://misitio.com/api/pagos/webhook/"
    }

    # 7) Crear preferencia
    respuesta = mp.preference().create(preference_data)
    init_point = respuesta.get("response", {}).get("init_point")
    if not init_point:
        logger.error("MP no devolvió init_point: %s", respuesta)
        return Response(
            {"error": "No se generó init_point", "raw_mp_response": respuesta},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response({"init_point": init_point})


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def mp_webhook(request):
    """
    Webhook para notificaciones de MercadoPago.
    Descuenta stock sólo cuando el pago esté approved.
    """
    logger.info("🔔 Webhook MP recibido: %s", request.data)

    payload = request.data
    tipo = payload.get("type") or payload.get("topic") or ""
    if "payment" not in tipo:
        logger.info("Ignorado: no es notificación de pago (%s)", tipo)
        return Response(status=status.HTTP_204_NO_CONTENT)

    pay_id = payload.get("data", {}).get("id")
    if not pay_id:
        logger.warning("No se encontró data.id en payload")
        return Response(status=status.HTTP_400_BAD_REQUEST)

    mp = SDK(os.getenv("MP_ACCESS_TOKEN"))
    pago = mp.payment().get(pay_id).get("response", {})
    estado = pago.get("status")
    logger.info("Estado del pago %s en MP: %s", pay_id, estado)
    if estado != "approved":
        return Response(status=status.HTTP_204_NO_CONTENT)

    pref_id = pago.get("preference_id")
    metadata = mp.preference().get(pref_id).get("response", {}).get("metadata", {})
    logger.info("Metadata de preferencia %s: %s", pref_id, metadata)

    try:
        obra_id = int(metadata.get("obra_id"))
        cantidad = int(metadata.get("cantidad"))
    except (TypeError, ValueError):
        logger.error("Metadata inválida: %s", metadata)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    try:
        obra = Obra.objects.get(pk=obra_id)
    except Obra.DoesNotExist:
        logger.error("Obra id=%s no encontrada al descontar stock", obra_id)
        return Response(status=status.HTTP_404_NOT_FOUND)

    logger.info("Stock antes (obra %s): %d", obra_id, obra.stock)
    obra.stock = max(obra.stock - cantidad, 0)
    obra.save(update_fields=["stock"])
    logger.info("Stock después (obra %s): %d", obra_id, obra.stock)

    return Response(status=status.HTTP_200_OK)


class ObraContentTypeView(APIView):
    def get(self, request):
        ct = ContentType.objects.get_for_model(Obra)
        return Response({
            'content_type_id': ct.id,
            'model': ct.model,
            'app_label': ct.app_label
        })


class PhotoListCreateView(generics.ListCreateAPIView):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        object_id = self.request.query_params.get('object_id')
        content_type = self.request.query_params.get('content_type')

        if object_id and content_type:
            queryset = queryset.filter(object_id=object_id, content_type_id=content_type)

        return queryset

class ComentariosDeObraView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, obra_id):
        comentarios = Comentario.objects.filter(obra_id=obra_id).order_by('fecha')
        serializer = ComentarioSerializer(comentarios, many=True)
        return Response(serializer.data)

class CrearComentarioView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request):
        serializer = ComentarioSerializer(data=request.data)
        if serializer.is_valid():
            # Asignar automáticamente el usuario autenticado
            serializer.save(usuario=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_me_gusta(request, obra_id):
    try:
        obra = Obra.objects.get(id=obra_id)
    except Obra.DoesNotExist:
        return Response({'error': 'Obra no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    usuario = request.user

    if usuario in obra.me_gusta.all():
        obra.me_gusta.remove(usuario)
        liked = False
    else:
        obra.me_gusta.add(usuario)
        liked = True

    return Response({
        'liked': liked,
        'total_likes': obra.me_gusta.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_following_view(request, usuario_id):
    try:
        usuario_obj = Usuario.objects.get(id=usuario_id)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    is_following = request.user in usuario_obj.seguidores.all()

    return Response({'is_following': is_following})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_follow_view(request, usuario_id):
    try:
        usuario_obj = Usuario.objects.get(id=usuario_id)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.user == usuario_obj:
        return Response({'error': 'No puedes seguirte a ti mismo'}, status=status.HTTP_400_BAD_REQUEST)

    if request.user in usuario_obj.seguidores.all():
        usuario_obj.seguidores.remove(request.user)
        is_following = False
    else:
        usuario_obj.seguidores.add(request.user)
        is_following = True

    return Response({'is_following': is_following})

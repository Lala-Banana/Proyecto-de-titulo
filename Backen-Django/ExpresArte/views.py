# views.py (completo y corregido)
from django.conf import settings
import mercadopago
from rest_framework import generics, permissions, status
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Categoria, Obra, Compra, Favorito, Mensaje, Notificacion, Log, Usuario
from .serializers import (
    CategoriaSerializer, ObraSerializer, CompraSerializer, FavoritoSerializer,
    MensajeSerializer, NotificacionSerializer, LogSerializer, PaymentSerializer,
    UsuarioSerializer, RegistroSerializer, LoginSerializer, GoogleLoginSerializer
)
from rest_framework.permissions import AllowAny, IsAdminUser  # Agregado IsAdminUser
from .serializers import UsuarioPublicoSerializer
from django.urls import reverse

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
    user.ubicacion    = data.get('ubicacion', user.ubicacion)
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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        categoria_slug = self.kwargs['slug']
        queryset = Obra.objects.filter(categoria__slug=categoria_slug, activo=True)
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            queryset = queryset.filter(usuario__id=usuario_id)
        return queryset

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
    
# views.py (solo la parte de CreatePaymentView)

from django.conf import settings
import mercadopago
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PaymentSerializer

class CreatePaymentView(APIView):
    def post(self, request):
        # 1) Validación de entrada
        serializer = PaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items = serializer.validated_data['items']
        payer = serializer.validated_data['payer']

        # 2) Inicializar SDK de Mercado Pago
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

        # 3) Construir URLs absolutas para back_urls
        success_url = request.build_absolute_uri('/api/pagos/success/')
        failure_url = request.build_absolute_uri('/api/pagos/failure/')
        pending_url = request.build_absolute_uri('/api/pagos/pending/')
        # webhook_url = request.build_absolute_uri('/api/pagos/webhook/')

        # 4) Montar preference_data (sin notification_url para sandbox)
        preference_data = {
            "items": items,
            "payer": payer,
            "back_urls": {
                "success": success_url,
                "failure": failure_url,
                "pending": pending_url,
            },
            # Si quieres habilitar notificaciones, descomenta la siguiente línea:
            # "notification_url": webhook_url,
            # Y, si lo deseas, redirección automática tras aprobado:
            # "auto_return": "approved",
        }

        # 5) Crear la preferencia
        try:
            mp_response = sdk.preference().create(preference_data)
        except Exception as e:
            return Response(
                {"detail": "Error al crear la preferencia", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 6) Extraer la URL de checkout
        raw = mp_response.get("response", {})
        init_point = raw.get("sandbox_init_point") or raw.get("init_point")

        # 7) Devolver al cliente
        return Response(
            {
                "init_point": init_point,
                "raw_response": raw
            },
            status=status.HTTP_201_CREATED
        )

class PaymentSuccessView(APIView):
    def get(self, request):
        return Response({"detail": "Pago aprobado"}, status=status.HTTP_200_OK)

class PaymentFailureView(APIView):
    def get(self, request):
        return Response({"detail": "Pago rechazado"}, status=status.HTTP_200_OK)

class PaymentPendingView(APIView):
    def get(self, request):
        return Response({"detail": "Pago pendiente"}, status=status.HTTP_200_OK)

class MPWebhookView(APIView):
    permission_classes = []  # pública
    def post(self, request):
        # aquí validas topic o type/id y actualizas tu orden
        return Response(status=status.HTTP_200_OK)
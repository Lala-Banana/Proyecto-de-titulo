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
from django.shortcuts import get_object_or_404     
from django.conf import settings
import mercadopago
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PaymentSerializer
import logging
# Configura el logger para este módulo
logger = logging.getLogger(__name__)
class CreatePaymentView(APIView):
    # Para pruebas no exigimos autenticación ni creamos Compra
    permission_classes = []  

    def post(self, request):
        # 1) Validar obra y cantidad igual que antes
        serializer = PaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obra_id  = serializer.validated_data['obra_id']
        cantidad = serializer.validated_data['cantidad']
        obra = get_object_or_404(Obra, pk=obra_id)
        if not obra.en_venta or obra.stock < cantidad:
            return Response(
                {"error": "Stock insuficiente o obra no disponible"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2) Crear preferencia Mercado Pago
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        items = [{
            "id": str(obra.id),
            "title": obra.titulo,
            "description": obra.descripcion[:256],
            "quantity": cantidad,
            "currency_id": obra.moneda,
            "unit_price": float(obra.precio),
        }]
        payer = {"email": request.user.email} if request.user.is_authenticated else {}

        host = settings.NGROK_URL.rstrip('/')
        preference_data = {
            "items": items,
            "payer": payer,
            "back_urls": {
                "success": f"{host}/api/pagos/success/",
                "failure": f"{host}/api/pagos/failure/",
                "pending": f"{host}/api/pagos/pending/",
            },
            "binary_mode": True,
            "payment_methods": {
                "excluded_payment_types": [{"id": "ticket"}, {"id": "atm"}],
                "installments": 1
            },
            "auto_return": "approved",
        }

        try:
            raw = sdk.preference().create(preference_data)["response"]
        except Exception as e:
            return Response(
                {"error": "Error interno al crear preferencia MP", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        init_point = raw.get("init_point")
        if not init_point:
            return Response(
                {"error": "No se obtuvo init_point de producción", "raw_response": raw},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3) ¡Nota! Aquí OMITIMOS la creación de Compra para no escribir en BD:
        # compra = Compra.objects.create(…)
        # serializer = CompraSerializer(compra)

        # 4) Devolvemos solo el init_point y, opcionalmente, los datos de la preferencia
        return Response(
            {
                "init_point": init_point,
                "preference": {
                    "id": raw.get("id"),
                    "items": raw.get("items"),
                    "payer": raw.get("payer"),
                }
            },
            status=status.HTTP_201_CREATED
        )

    
class PaymentSuccessView(APIView):
    permission_classes = []  # o IsAuthenticated si ya lo protegeste

    def get(self, request):
        # 1. Extraer params de la query
        pref_id          = request.query_params.get('preference_id')
        payment_id       = request.query_params.get('payment_id')
        collection_id    = request.query_params.get('collection_id')
        merchant_order   = request.query_params.get('merchant_order_id')
        status_param     = request.query_params.get('status') or request.query_params.get('collection_status')

        if not payment_id or not pref_id:
            return Response(
                {"error": "Faltan parámetros de MP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Consultar a Mercado Pago para asegurarnos y obtener más datos
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        mp_payment = sdk.payment().get(payment_id)["response"]

        # 3. Recuperar la Compra que creaste (por preference_id)
        compra = get_object_or_404(Compra, preference_id=pref_id)

        # 4. Actualizarla con los nuevos datos
        compra.collection_id      = collection_id
        compra.transaction_amount = mp_payment.get("transaction_amount")
        compra.payer_email        = mp_payment.get("payer", {}).get("email")
        compra.payment_method     = mp_payment.get("payment_method_id")
        compra.status_detail      = mp_payment.get("status_detail")
        compra.merchant_order_id  = merchant_order
        compra.estado             = "pagada" if status_param == "approved" else status_param
        compra.save()

        # 5. Devolver un resumen
        serializer = CompraSerializer(compra)
        return Response(
            {
                "detail": "Pago aprobado y Compra actualizada",
                "compra": serializer.data
            },
            status=status.HTTP_200_OK
        )

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
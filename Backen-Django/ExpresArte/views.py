# views.py (completo y corregido)
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Categoria, Obra, Compra, Favorito, Mensaje, Notificacion, Log, Usuario
from .serializers import (
    CategoriaSerializer, ObraSerializer, CompraSerializer, FavoritoSerializer,
    MensajeSerializer, NotificacionSerializer, LogSerializer,
    UsuarioSerializer, RegistroSerializer, LoginSerializer, GoogleLoginSerializer
)

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
@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def editar_perfil(request):
    user = request.user
    data = request.data

    user.nombre = data.get('nombre', user.nombre)
    user.descripcion = data.get('descripcion', user.descripcion)
    user.foto_url = data.get('foto_url', user.foto_url)
    user.fondo = data.get('fondo', getattr(user, 'fondo', ''))  # Este campo debe estar en el modelo

    user.save()
    return Response({
        "mensaje": "Perfil actualizado correctamente.",
        "usuario": UsuarioSerializer(user).data
    })

# Google Auth
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def guardar_usuario_google(request):
    serializer = GoogleLoginSerializer(data=request.data)
    if serializer.is_valid():
        usuario, _ = Usuario.objects.update_or_create(
            email=serializer.validated_data['email'],
            defaults={
                'nombre': serializer.validated_data.get('nombre', ''),
                'foto_url': serializer.validated_data.get('foto_url', ''),
                'google_id': serializer.validated_data.get('google_id', None),
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

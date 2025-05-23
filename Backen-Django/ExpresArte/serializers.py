from rest_framework import serializers
from .models import Usuario
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Usuario, Categoria, Obra, Compra, Favorito, Mensaje, Notificacion, Log
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id',
            'nombre',
            'email',
            'telefono',
            'google_id',
            'foto_url',
            'descripcion',
            'fondo',
            'rut',
            'tipo_usuario',
            'ubicacion',
            'is_active',
            'is_staff',
            'fecha_creacion',
            'fecha_modificacion',
        ]

class UsuarioActualView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)
    
    
class GoogleLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    nombre = serializers.CharField()
    foto_url = serializers.URLField(required=False, allow_blank=True)
    google_id = serializers.CharField(required=False, allow_blank=True)

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['nombre', 'email', 'password']

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            email=validated_data['email'],
            nombre=validated_data['nombre'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Credenciales inválidas.")
        data['user'] = user
        return data

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ObraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Obra
        fields = '__all__'

class CompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compra
        fields = '__all__'

class FavoritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorito
        fields = '__all__'

class MensajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mensaje
        fields = '__all__'

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'

class LogSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)

    class Meta:
        model = Log
        fields = ['id', 'tabla', 'id_registro', 'accion', 'descripcion', 'fecha', 'usuario_nombre', 'usuario_email']


class UsuarioPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id',
            'nombre',
            'rut',
            'tipo_usuario',
            'descripcion',
            'foto_url',
            'fondo',
            'telefono',
            'ubicacion',
        ]
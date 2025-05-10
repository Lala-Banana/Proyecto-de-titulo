from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, password=None, google_id=None):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')

        user = self.model(
            email=self.normalize_email(email),
            nombre=nombre,
            google_id=google_id,
        )

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre, password=None):
        user = self.create_user(email=email, nombre=nombre, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser, PermissionsMixin):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    foto_url = models.URLField(null=True, blank=True)
    rut = models.CharField(max_length=12, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    tipo_usuario = models.CharField(max_length=20, choices=[("comprador", "Comprador"), ("artista", "Artista")], null=True)
    ubicacion = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    fondo = models.URLField(null=True, blank=True, verbose_name='Fondo personalizado')



    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre']

    def __str__(self):
        return self.email

class BaseModel(models.Model):
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Categoria(BaseModel):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    slug = models.SlugField(unique=True)
    imagen_url = models.URLField(blank=True, null=True)
    visible = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class Obra(BaseModel):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    imagen_url = models.URLField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    en_venta = models.BooleanField(default=True)
    destacada = models.BooleanField(default=False)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.titulo

class Compra(BaseModel):
    comprador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='compras')
    vendedor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ventas')
    obra = models.ForeignKey(Obra, on_delete=models.CASCADE)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('entregada', 'Entregada'),
        ('cancelada', 'Cancelada'),
        ('reembolsada', 'Reembolsada')
    ], default='pendiente')
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Compra de {self.obra} por {self.comprador}"

class Favorito(BaseModel):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    obra = models.ForeignKey(Obra, on_delete=models.CASCADE)
    fecha_guardado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'obra')

class Mensaje(BaseModel):
    emisor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mensajes_enviados')
    receptor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mensajes_recibidos')
    contenido = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.emisor} → {self.receptor}: {self.contenido[:30]}"

class Notificacion(BaseModel):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    leida = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} → {self.usuario}"

class Log(models.Model):
    tabla = models.CharField(max_length=100)
    id_registro = models.IntegerField()
    accion = models.CharField(max_length=20, choices=[
        ('creacion', 'Creación'),
        ('modificacion', 'Modificación'),
        ('eliminacion', 'Eliminación')
    ])
    descripcion = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(Usuario, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.accion} en {self.tabla} (ID {self.id_registro})"

class ObraBackup(models.Model):
    id_obra_original = models.IntegerField()
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    imagen_url = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    en_venta = models.BooleanField()
    destacada = models.BooleanField()
    activo = models.BooleanField()
    fecha_publicacion = models.DateTimeField()
    id_usuario = models.IntegerField()
    id_categoria = models.IntegerField()
    fecha_respaldo = models.DateTimeField(auto_now_add=True)

class UsuarioBackup(models.Model):
    id_usuario_original = models.IntegerField()
    nombre = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    password_hash = models.TextField()
    google_id = models.CharField(max_length=100, null=True)
    foto_url = models.TextField(null=True)
    rut = models.CharField(max_length=12, null=True)
    descripcion = models.TextField(null=True)
    tipo_usuario = models.CharField(max_length=20)
    ubicacion = models.CharField(max_length=100, null=True)
    is_active = models.BooleanField()
    is_staff = models.BooleanField()
    fecha_creacion = models.DateTimeField()
    fecha_modificacion = models.DateTimeField()
    fecha_respaldo = models.DateTimeField(auto_now_add=True)

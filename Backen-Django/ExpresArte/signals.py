from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import Categoria, Obra, Compra, Usuario, Log

# Helper para registrar logs genéricamente
def crear_log(tabla, instance, accion):
    Log.objects.create(
        tabla=tabla,
        id_registro=instance.id,
        accion=accion,
        descripcion=f"{tabla} {accion}: {str(instance)}",
        usuario=getattr(instance, 'usuario', None)
    )

# -------- Usuario --------
@receiver(post_save, sender=Usuario)
def log_usuario_save(sender, instance, created, **kwargs):
    crear_log('Usuario', instance, 'creacion' if created else 'modificacion')

@receiver(pre_delete, sender=Usuario)
def log_usuario_delete(sender, instance, **kwargs):
    crear_log('Usuario', instance, 'eliminacion')

# -------- Obra --------
@receiver(post_save, sender=Obra)
def log_obra_save(sender, instance, created, **kwargs):
    crear_log('Obra', instance, 'creacion' if created else 'modificacion')

@receiver(pre_delete, sender=Obra)
def log_obra_delete(sender, instance, **kwargs):
    crear_log('Obra', instance, 'eliminacion')

# -------- Compra --------
@receiver(post_save, sender=Compra)
def log_compra_save(sender, instance, created, **kwargs):
    crear_log('Compra', instance, 'creacion' if created else 'modificacion')

@receiver(pre_delete, sender=Compra)
def log_compra_delete(sender, instance, **kwargs):
    crear_log('Compra', instance, 'eliminacion')

# -------- Categoria --------
@receiver(post_save, sender=Categoria)
def log_categoria_save(sender, instance, created, **kwargs):
    crear_log('Categoria', instance, 'creacion' if created else 'modificacion')

@receiver(pre_delete, sender=Categoria)
def log_categoria_delete(sender, instance, **kwargs):
    crear_log('Categoria', instance, 'eliminacion')

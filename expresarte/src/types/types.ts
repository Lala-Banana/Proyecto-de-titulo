// types.ts

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  foto_url: string;
  descripcion: string;
  fondo?: string;
  google_id?: string;
  tipo_usuario?: 'comprador' | 'artista';
  rut?: string;
  ubicacion?: string;
  seguidores?: number;
  me_gusta?: number;
}

export interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
  destacada?: boolean;
  fecha_publicacion?: string;
  usuario?: Usuario;
  categoria?: Categoria;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  slug: string;
  imagen_url?: string;
  visible?: boolean;
}

export interface Compra {
  id?: number;
  comprador: Usuario;
  vendedor: Usuario;
  obra: Obra;
  precio: string;
  estado: 'pendiente' | 'pagada' | 'entregada' | 'cancelada' | 'reembolsada';
  fecha: string;
}

export interface Favorito {
  usuario: Usuario;
  obra: Obra;
  fecha_guardado: string;
}

export interface Mensaje {
  emisor: Usuario;
  receptor: Usuario;
  contenido: string;
  fecha_envio: string;
}

export interface Notificacion {
  usuario: Usuario;
  tipo: string;
  titulo: string;
  descripcion?: string;
  leida: boolean;
  fecha: string;
}

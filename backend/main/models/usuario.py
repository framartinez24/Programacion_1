from .. import db

class UsuarioModel(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    correo = db.Column(db.String(100))
    direccion = db.Column(db.String(100))
    contraseña = db.Column(db.String(100))
    telefono = db.Column(db.BigInteger)
    rol = db.Column(db.String(50))
    valoraciones = db.relationship("ValoracionModel", back_populates="usuario", cascade="all, delete-orphan")
    pedidos = db.relationship("PedidoModel", back_populates="usuario", cascade="all, delete-orphan")
    notificaciones = db.relationship("NotificacionModel", back_populates="usuario", cascade="all, delete-orphan")
    facturas = db.relationship("FacturaModel", back_populates="usuario", cascade="all, delete-orphan")

    def to_json(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "correo": self.correo,
            "direccion": self.direccion,
            "Contraseña": self.contraseña,
            "Telefono": self.telefono,
            "Rol": self.rol
        }

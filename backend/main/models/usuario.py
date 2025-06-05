
from .. import db
from datetime import timedelta
from werkzeug.security import generate_password_hash, check_password_hash

class UsuarioModel(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(100), unique=True, nullable=False)
    direccion = db.Column(db.String(200))
    telefono = db.Column(db.String(20))
    contraseña = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False)

    pedidos = db.relationship("PedidoModel", back_populates="usuario", lazy='dynamic')
    valoraciones = db.relationship('ValoracionModel', back_populates='usuario')
    notificaciones = db.relationship('NotificacionModel', back_populates='usuario')
    facturas = db.relationship('FacturaModel', back_populates='usuario')


    def to_json(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "correo": self.correo,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "rol": self.rol
        }

    def to_json_complete(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "correo": self.correo,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "rol": self.rol,
            "contraseña": self.contraseña
        }

    @property
    def plain_contraseña(self):
        raise AttributeError("La contraseña no es un atributo legible.")

    @plain_contraseña.setter
    def plain_contraseña(self, contraseña):
        self.contraseña = generate_password_hash(contraseña)

    def validate_pass(self, password):
        if not self.contraseña:
            return False
        return check_password_hash(self.contraseña, password)

    @staticmethod
    def from_json(data):
        usuario = UsuarioModel(
            nombre=data.get("nombre"),
            correo=data.get("correo"),
            direccion=data.get("direccion"),
            telefono=data.get("telefono"),
            rol=data.get("rol"),
        )
        usuario.plain_contraseña = data.get("contraseña", "")
        return usuario
from .. import db

class UsuarioModel(db.Model):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(100), unique=True, nullable=False)
    direccion = db.Column(db.String(100))
    contraseña = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20))
    rol = db.Column(db.String(50))

    def to_json(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'correo': self.correo,
            'direccion': self.direccion,
            'contraseña' : self.contraseña,
            'telefono': self.telefono,
            'rol': self.rol
        }

    def from_json(self, data):
        self.nombre = data.get('nombre', self.nombre)
        self.correo = data.get('correo', self.correo)
        self.direccion = data.get('direccion', self.direccion)
        self.contraseña = data.get('contraseña', self.contraseña)
        self.telefono = data.get('telefono', self.telefono)
        self.rol = data.get('rol', self.rol)

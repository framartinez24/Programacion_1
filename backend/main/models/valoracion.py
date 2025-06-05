from main import db

class ValoracionModel(db.Model):
    __tablename__ = "valoraciones"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    puntuacion = db.Column(db.Integer, nullable=False)
    comentario = db.Column(db.String(255), nullable=True)

    usuario = db.relationship("UsuarioModel", back_populates="valoraciones")
    producto = db.relationship("ProductoModel", back_populates="valoraciones")

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "producto_id": self.producto_id,
            "puntuacion": self.puntuacion,
            "comentario": self.comentario
        }

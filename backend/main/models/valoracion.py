from main import db

class ValoracionModel(db.Model):
    __tablename__ = 'valoracion'

    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, nullable=False)
    puntuacion = db.Column(db.Integer, nullable=False)
    comentario = db.Column(db.String(255), nullable=True)

    usuarios = db.relationship("UsuarioModel", secondary='usuario_valoracion', back_populates="valoraciones")
    productos = db.relationship("ProductoModel", secondary='producto_valoracion', back_populates="valoraciones")


    def to_dict(self):
        return {
            "id": self.id,
            "producto_id": self.producto_id,
            "puntuacion": self.puntuacion,
            "comentario": self.comentario
        }


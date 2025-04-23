from main import db

class ValoracionModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, nullable=False)
    puntuacion = db.Column(db.Integer, nullable=False)
    comentario = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "producto_id": self.producto_id,
            "puntuacion": self.puntuacion,
            "comentario": self.comentario
        }


from .. import db

class PedidoModel(db.Model):
    __tablename__ = "pedido"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "fecha": self.fecha,
            "estado": self.estado
        }

    def from_dict(self, data):
        for field in ["fecha", "estado"]:
            if field in data:
                setattr(self, field, data[field])

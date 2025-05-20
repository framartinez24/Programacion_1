from .. import db

class PedidoModel(db.Model):
    __tablename__ = "pedido"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(100), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    usuario = db.relationship("UsuarioModel", back_populates="pedidos")
    detalle_pedido = db.relationship("DetallePedidoModel", back_populates="pedido", cascade="all, delete-orphan")
    factura = db.relationship("FacturaModel", back_populates="pedido", uselist=False, cascade="all, delete-orphan")
    notificaciones = db.relationship("NotificacionModel", back_populates="pedido", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "fecha": self.fecha,
            "estado": self.estado,
            "id_usuario": self.id_usuario
        }

    def from_dict(self, data):
        for field in ["fecha", "estado", "id_usuario"]:
            if field in data:
                setattr(self, field, data[field])

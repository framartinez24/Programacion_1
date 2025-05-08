from main import db

class NotificacionModel(db.Model):
    __tablename__ = "notificacion"

    id = db.Column(db.Integer, primary_key=True)
    mensaje = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(100), nullable=True)
    fecha = db.Column(db.String(100), nullable=True)

    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    notificaciones= db.relationship("PedidoModel", secondary='pedidos_notificacion', back_populates="notificaciones")
    
    def to_json(self):
        return {
            "id": self.id,
            "mensaje": self.mensaje,
            "tipo": self.tipo,
            "fecha": self.fecha
        }

    def from_json(self, data):
        self.mensaje = data.get("mensaje", self.mensaje)
        self.tipo = data.get("tipo", self.tipo)
        self.fecha = data.get("fecha", self.fecha)

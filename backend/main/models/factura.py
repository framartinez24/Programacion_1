from main import db

class FacturaModel(db.Model):
    __tablename__ = "factura"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    metodo_pago = db.Column(db.String(100), nullable=False)
    total = db.Column(db.Integer, nullable=False)
    usuario = db.relationship("UsuarioModel", back_populates="facturas")
    pedido = db.relationship("PedidoModel", back_populates="factura")

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "pedido_id": self.pedido_id,
            "metodo_pago": self.metodo_pago,
            "total": self.total
        }

    def from_dict(self, data):
        self.usuario_id = data.get("usuario_id", self.usuario_id)
        self.pedido_id = data.get("pedido_id", self.pedido_id)
        self.metodo_pago = data.get("metodo_pago", self.metodo_pago)
        self.total = data.get("total", self.total)
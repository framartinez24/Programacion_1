from main import db

class DetallePedidoModel(db.Model):
    __tablename__ = "detalle_pedido"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)

    # pedido = db.relationship("PedidoModel", back_populates="detalle_pedido")
    pedido = db.relationship("PedidoModel", back_populates="detalle_pedido")

    # producto = db.relationship("ProductoModel", back_populates="detalle_pedido")
    producto = db.relationship("ProductoModel", back_populates="detalle_pedido")
    
    def to_dict(self):
        return {
            "id": self.id,
            "pedido_id": self.pedido_id,
            "producto_id": self.producto_id,
            "cantidad": self.cantidad
        }

    def from_dict(self, data):
        self.pedido_id = data.get("pedido_id", self.pedido_id)
        self.producto_id = data.get("producto_id", self.producto_id)
        self.cantidad = data.get("cantidad", self.cantidad)
from .. import db

class ProductoModel(db.Model):
    __tablename__ = "productos"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    precio = db.Column(db.Float, nullable=False)
    categoria = db.Column(db.String(255), nullable=False)
    stock = db.Column(db.Integer, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": self.precio,
            "categoria" : self.categoria,
            "stock": self.stock
        }

    def from_json(self, data):
        self.nombre = data.get("nombre", self.nombre)
        self.descripcion = data.get("descripcion", self.descripcion)
        self.precio = data.get("precio", self.precio)
        self.stock = data.get("stock", self.stock)
    
    detalle_pedido = db.relationship("DetallePedidoModel", back_populates="producto", cascade="all, delete-orphan")
    valoraciones = db.relationship("ValoracionModel", back_populates="producto", cascade="all, delete-orphan")
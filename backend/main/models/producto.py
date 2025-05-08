from main import db

class ProductoModel(db.Model):
    __tablename__ = "productos"

    id = db.Column(db.Integer, primary_key=True)
    nombre_Prod = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    precio = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)

    valoraciones = db.relationship("ValoracionModel", secondary='producto_valoracion', back_populates="productos", cascade="all, delete-orphan")
    detalle_pedidos = db.relationship("DetallePedidosModel", back_populates="producto", cascade="all, delete-orphan")

    def to_json(self):
        return {
            "id": self.id,
            "nombre_Prod": self.nombre_Prod,
            "descripcion": self.descripcion,
            "precio": self.precio,
            "stock": self.stock
        }

    def from_json(self, data):
        self.nombre_Prod = data.get("nombre_Prod", self.nombre_Prod)
        self.descripcion = data.get("descripcion", self.descripcion)
        self.precio = data.get("precio", self.precio)
        self.stock = data.get("stock", self.stock)
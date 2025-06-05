from flask_restful import Resource
from flask import request
from ..models import ProductoModel
from .. import db
from sqlalchemy import desc

# Recurso individual
class ProductoRecurso(Resource):  
    def get(self, id):
        producto = db.session.query(ProductoModel).get(id)
        if producto:
            return producto.to_json()
        return {"mensaje": "Producto no encontrado"}, 404

    def put(self, id):
        producto = db.session.query(ProductoModel).get(id)
        if not producto:
            return {"mensaje": "Producto no encontrado"}, 404

        data = request.get_json()

        producto.nombre = data.get("nombre", producto.nombre)
        producto.descripcion = data.get("descripcion", producto.descripcion)
        producto.precio = data.get("precio", producto.precio)
        producto.categoria = data.get("categoria", producto.categoria)
        producto.stock = data.get("stock", producto.stock)

        db.session.commit()
        return {"mensaje": "Producto actualizado"}, 200

    def delete(self, id):
        producto = db.session.query(ProductoModel).get(id)
        if not producto:
            return {"mensaje": "Producto no encontrado"}, 404

        db.session.delete(producto)
        db.session.commit()
        return {"mensaje": "Producto eliminado"}, 200


# Recurso plural
class ProductosRecursos(Resource):  
    def get(self):
        query = db.session.query(ProductoModel)

        # Filtros
        if request.args.get("nombre"):
            nombre = request.args.get("nombre")
            query = query.filter(ProductoModel.nombre.ilike(f"%{nombre}%"))

        if request.args.get("categoria"):
            categoria = request.args.get("categoria")
            query = query.filter(ProductoModel.categoria.ilike(f"%{categoria}%"))

        if request.args.get("precio_min"):
            precio_min = float(request.args.get("precio_min"))
            query = query.filter(ProductoModel.precio >= precio_min)

        if request.args.get("precio_max"):
            precio_max = float(request.args.get("precio_max"))
            query = query.filter(ProductoModel.precio <= precio_max)

        # Ordenamiento
        if request.args.get("sortby_nombre"):
            orden = request.args.get("sortby_nombre")
            if orden == "desc":
                query = query.order_by(desc(ProductoModel.nombre))
            else:
                query = query.order_by(ProductoModel.nombre)

        if request.args.get("sortby_precio"):
            orden = request.args.get("sortby_precio")
            if orden == "desc":
                query = query.order_by(desc(ProductoModel.precio))
            else:
                query = query.order_by(ProductoModel.precio)

        # Paginación
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        return [producto.to_json() for producto in paginated.items]

    def post(self):
        data = request.get_json()

        nuevo_producto = ProductoModel(
            nombre=data.get("nombre"),
            descripcion=data.get("descripcion"),
            precio=data.get("precio"),
            categoria=data.get("categoria"),
            stock=data.get("stock")
        )

        db.session.add(nuevo_producto)
        db.session.commit()
        return nuevo_producto.to_json(), 201

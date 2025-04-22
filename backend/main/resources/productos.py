from flask_restful import Resource
from flask import request
from main.models import ProductoModel
from .. import db

class ProductoRecurso(Resource):  
    def get(self, id):
        producto = db.session.query(ProductoModel).get(id)
        if producto:
            return producto.to_json(), 200
        return {"mensaje": "Producto no encontrado"}, 404

    def put(self, id):
        producto = db.session.query(ProductoModel).get(id)
        if not producto:
            return {"mensaje": "Producto no encontrado"}, 404

        data = request.get_json()
        if not data:
            return {"mensaje": "Datos no proporcionados"}, 400

        try:
            producto.from_json(data)
            db.session.commit()
            return {"mensaje": "Producto actualizado"}, 200
        except Exception as e:
            db.session.rollback()
            return {"mensaje": f"Error al actualizar: {str(e)}"}, 500

    def delete(self, id):
        producto = db.session.query(ProductoModel).get(id)
        if not producto:
            return {"mensaje": "Producto no encontrado"}, 404

        try:
            db.session.delete(producto)
            db.session.commit()
            return {"mensaje": "Producto eliminado"}, 200
        except Exception as e:
            db.session.rollback()
            return {"mensaje": f"Error al eliminar: {str(e)}"}, 500


class ProductosRecursos(Resource):  
    def get(self):
        productos = db.session.query(ProductoModel).all()
        return [producto.to_json() for producto in productos], 200

    def post(self):
        data = request.get_json()
        if not data:
            return {"mensaje": "Datos no proporcionados"}, 400

        try:
            nuevo_producto = ProductoModel(**data)
            db.session.add(nuevo_producto)
            db.session.commit()
            return nuevo_producto.to_json(), 201
        except Exception as e:
            db.session.rollback()
            return {"mensaje": f"Error al crear producto: {str(e)}"}, 500

from flask_restful import Resource
from flask import request

PRODUCTOS = {
    1: {"nombre_Prod": "Empanada", "descripcion" : "Empanada de carne ...", "precio": 100, "stock" : 48},
    2: {"nombre_Prod": "Pizza", "descripcion" : "Pizza napolitana ...", "precio": 100, "stock" : 20},

}

# Recurso Producto
class ProductoRecurso(Resource):  
    def get(self, id):
        id = int(id)  
        if id in PRODUCTOS:
            return PRODUCTOS[id]
        return {"mensaje": "Producto no encontrado"}, 404

    def put(self, id):
        id = int(id)  
        if id in PRODUCTOS:
            data = request.get_json()
            PRODUCTOS[id].update(data)
            return {"mensaje": "Producto actualizado"}, 200
        return {"mensaje": "Producto no encontrado"}, 404

    def delete(self, id):
        id = int(id)  
        if id in PRODUCTOS:
            del PRODUCTOS[id]
            return {"mensaje": "Producto eliminado"}, 204
        return {"mensaje": "Producto no encontrado"}, 404

# Recurso Productos
class ProductosRecursos(Resource):  
    def get(self):
        return PRODUCTOS

    def post(self):
        data = request.get_json()
        nuevo_id = max(PRODUCTOS.keys(), default=0) + 1
        PRODUCTOS[nuevo_id] = data
        return PRODUCTOS[nuevo_id], 201

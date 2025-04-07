from flask_restful import Resource
from flask import request

PEDIDOS = { 
    1: {"fecha" : "xx:xx:xx", "estado" : "En preparacion"},
    2: {"fecha" : "xx:xx:xx", "estado" : "Entregado"},
    3: {"fecha" : "xx:xx:xx", "estado" : "Cancelado"},

}

class PedidoRecurso(Resource):
    def get(self, id):
        id = int(id)
        if id in PEDIDOS:
            return PEDIDOS[id]
        return {"mensaje": "Pedido no encontrado"}, 404

    def put(self, id):
        id = int(id)
        if id in PEDIDOS:
            data = request.get_json()
            PEDIDOS[id].update(data)
            return {"mensaje": "Pedido actualizado"}, 200
        return {"mensaje": "Pedido no encontrado"}, 404

    def delete(self, id):
        id = int(id)
        if id in PEDIDOS:
            del PEDIDOS[id]
            return {"mensaje": "Pedido eliminado"}, 200
        return {"mensaje": "Pedido no encontrado"}, 404

class PedidosRecursos(Resource):
    def get(self):
        return PEDIDOS

    def post(self):
        data = request.get_json()
        nuevo_id = max(PEDIDOS.keys(), default=0) + 1
        PEDIDOS[nuevo_id] = data
        return PEDIDOS[nuevo_id], 201
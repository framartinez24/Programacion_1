from flask_restful import Resource
from flask import request
from main.models import PedidoModel
from .. import db

class PedidoRecurso(Resource):
    def get(self, id):
        pedido = db.session.query(PedidoModel).get(id)
        if pedido:
            return pedido.to_dict(), 200
        return {"mensaje": "Pedido no encontrado"}, 404

    def put(self, id):
        pedido = db.session.query(PedidoModel).get(id)
        if not pedido:
            return {"mensaje": "Pedido no encontrado"}, 404
        data = request.get_json()
        for key, value in data.items():
            setattr(pedido, key, value)
        db.session.commit()
        return {"mensaje": "Pedido actualizado"}, 200

    def delete(self, id):
        pedido = db.session.query(PedidoModel).get(id)
        if not pedido:
            return {"mensaje": "Pedido no encontrado"}, 404
        db.session.delete(pedido)
        db.session.commit()
        return {"mensaje": "Pedido eliminado"}, 200


class PedidosRecursos(Resource):
    def get(self):
        pedidos = db.session.query(PedidoModel).all()
        return [pedido.to_dict() for pedido in pedidos], 200

    def post(self):
        data = request.get_json()
        nuevo_pedido = PedidoModel(**data)
        db.session.add(nuevo_pedido)
        db.session.commit()
        return nuevo_pedido.to_dict(), 201

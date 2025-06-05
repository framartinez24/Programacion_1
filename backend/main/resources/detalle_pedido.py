from flask_restful import Resource, reqparse
from flask import jsonify
from main import db
from main.models.detalle_pedido import DetallePedidoModel

class DetallePedidoRecurso(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('pedido_id', type=int, required=True, help="El ID del pedido es obligatorio")
    parser.add_argument('producto_id', type=int, required=True, help="El ID del producto es obligatorio")
    parser.add_argument('cantidad', type=int, required=True, help="La cantidad es obligatoria")

    def get(self, id=None):
        if id:
            detalle = DetallePedidoModel.query.get(id)
            if detalle:
                return detalle.to_dict(), 200
            return {'error': 'Detalle de pedido no encontrado'}, 404

        detalles = DetallePedidoModel.query.all()
        return [d.to_dict() for d in detalles], 200

    def post(self):
        args = self.parser.parse_args()
        nuevo_detalle = DetallePedidoModel(
            pedido_id=args['pedido_id'],
            producto_id=args['producto_id'],
            cantidad=args['cantidad']
        )
        try:
            db.session.add(nuevo_detalle)
            db.session.commit()
            return nuevo_detalle.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': f'Error al crear detalle de pedido: {str(e)}'}, 500

    def put(self, id):
        detalle = DetallePedidoModel.query.get(id)
        if not detalle:
            return {'error': 'Detalle de pedido no encontrado'}, 404

        args = self.parser.parse_args()
        detalle.pedido_id = args['pedido_id']
        detalle.producto_id = args['producto_id']
        detalle.cantidad = args['cantidad']

        try:
            db.session.commit()
            return detalle.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {'error': f'Error al actualizar detalle de pedido: {str(e)}'}, 500

    def delete(self, id):
        detalle = DetallePedidoModel.query.get(id)
        if not detalle:
            return {'error': 'Detalle de pedido no encontrado'}, 404

        try:
            db.session.delete(detalle)
            db.session.commit()
            return {'message': 'Detalle de pedido eliminado exitosamente'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': f'Error al eliminar detalle de pedido: {str(e)}'}, 500

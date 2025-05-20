from flask_restful import Resource
from flask import request
from ..models import FacturaModel 
from main import db

class FacturaRecurso(Resource):
    def get(self, id):
        factura = db.session.query(FacturaModel).get(id)
        if factura:
            return factura.to_dict(), 200
        return {"error": "Factura no encontrada"}, 404

    def put(self, id):
        factura = db.session.query(FacturaModel).get(id)
        if not factura:
            return {"error": "Factura no encontrada"}, 404

        data = request.get_json()
        factura.usuario_id = data.get("usuario_id", factura.usuario_id)
        factura.pedido_id = data.get("pedido_id", factura.pedido_id)
        factura.metodo_pago = data.get("metodo_pago", factura.metodo_pago)
        factura.total = data.get("total", factura.total)

        db.session.commit()
        return factura.to_dict(), 200

    def delete(self, id):
        factura = db.session.query(FacturaModel).get(id)
        if not factura:
            return {"error": "Factura no encontrada"}, 404

        db.session.delete(factura)
        db.session.commit()
        return {"mensaje": "Factura eliminada"}, 200


class FacturasRecurso(Resource):
    def get(self):
        facturas = db.session.query(FacturaModel).all()
        return [f.to_dict() for f in facturas], 200

    def post(self):
        data = request.get_json()
        try:
            nueva_factura = FacturaModel(
                usuario_id=data["usuario_id"],
                pedido_id=data["pedido_id"],
                metodo_pago=data["metodo_pago"],
                total=data["total"]
            )
            db.session.add(nueva_factura)
            db.session.commit()
            return nueva_factura.to_dict(), 201
        except KeyError as e:
            return {"error": f"Falta el campo obligatorio: {str(e)}"}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al crear la factura: {str(e)}"}, 500

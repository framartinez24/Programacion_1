
from flask_restful import Resource
from flask import request
from main.models import ValoracionModel
from main import db

class ValoracionRecurso(Resource):
    def get(self):
        valoraciones = ValoracionModel.query.all()
        return [v.to_dict() for v in valoraciones], 200

    def post(self):
        data = request.get_json()

        try:
            nueva_valoracion = ValoracionModel(
                usuario_id=data["usuario_id"],
                producto_id=data["producto_id"],
                puntuacion=data["puntuacion"],
                comentario=data.get("comentario")
            )
            db.session.add(nueva_valoracion)
            db.session.commit()
            return nueva_valoracion.to_dict(), 201

        except KeyError as e:
            return {"error": f"Falta el campo obligatorio: {str(e)}"}, 400

        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al guardar la valoración: {str(e)}"}, 500

class ValoracionItemRecurso(Resource):
    def get(self, id):
        valoracion = ValoracionModel.query.get(id)
        if valoracion is None:
            return {"error": "Valoración no encontrada"}, 404
        return valoracion.to_dict(), 200

    def put(self, id):
        valoracion = ValoracionModel.query.get(id)
        if valoracion is None:
            return {"error": "Valoración no encontrada"}, 404

        data = request.get_json()
        valoracion.puntuacion = data.get("puntuacion", valoracion.puntuacion)
        valoracion.comentario = data.get("comentario", valoracion.comentario)
        db.session.commit()
        return valoracion.to_dict(), 200

    def delete(self, id):
        valoracion = ValoracionModel.query.get(id)
        if valoracion is None:
            return {"error": "Valoración no encontrada"}, 404
        db.session.delete(valoracion)
        db.session.commit()
        return {"mensaje": "Valoración eliminada correctamente"}, 200

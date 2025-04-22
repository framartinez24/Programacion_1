from flask_restful import Resource
from flask import request
from main.models import NotificacionModel
from .. import db

class NotificacionRecurso(Resource):
    def get(self, id):
        notificacion = db.session.query(NotificacionModel).get(id)
        if notificacion:
            return notificacion.to_json()
        return {"mensaje": "Notificación no encontrada"}, 404

    def put(self, id):
        notificacion = db.session.query(NotificacionModel).get(id)
        if not notificacion:
            return {"mensaje": "Notificación no encontrada"}, 404
        data = request.get_json()
        notificacion.from_json(data)
        db.session.commit()
        return {"mensaje": "Notificación actualizada"}, 200

    def delete(self, id):
        notificacion = db.session.query(NotificacionModel).get(id)
        if not notificacion:
            return {"mensaje": "Notificación no encontrada"}, 404
        db.session.delete(notificacion)
        db.session.commit()
        return {"mensaje": "Notificación eliminada"}, 200


class NotificacionesRecurso(Resource):
    def get(self):
        notificaciones = db.session.query(NotificacionModel).all()
        return [n.to_json() for n in notificaciones]

    def post(self):
        data = request.get_json()
        nueva = NotificacionModel(**data)
        db.session.add(nueva)
        db.session.commit()
        return nueva.to_json(), 201

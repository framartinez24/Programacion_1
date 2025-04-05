from flask_restful import Resource
from flask import request

class LogoutRecurso(Resource):
    def post(self):
        return {"mensaje": "Sesión cerrada correctamente"}, 200

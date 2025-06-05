from flask_restful import Resource
from flask import request
from ..models import UsuarioModel
from .. import db

class LoginRecurso(Resource):
    def post(self):
        data = request.get_json()
        correo = data.get("correo")
        contraseña = data.get("contraseña")

        # Buscar usuario por correo
        usuario = db.session.query(UsuarioModel).filter_by(correo=correo).first()

        if usuario and usuario.contraseña == contraseña:
            return {
                "mensaje": "Login exitoso",
                "usuario": usuario.to_json(),
                "token": "fake-jwt-token"
            }, 200

        return {"mensaje": "Credenciales inválidas"}, 401

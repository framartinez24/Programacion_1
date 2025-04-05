from flask_restful import Resource
from flask import request

class LoginRecurso(Resource):
    def post(self):
        data = request.get_json()
        correo = data.get("correo")
        contraseña = data.get("contraseña")

        # Validación simple
        for usuario in USUARIOS.values():
            if usuario["correo"] == correo and usuario["Contraseña"] == contraseña:
                return {"mensaje": "Login exitoso", "token": "fake-jwt-token"}, 200
        
        return {"mensaje": "Credenciales inválidas"}, 401

from flask_restful import Resource
from flask import request

USUARIOS = {
    1 : {"nombre" : "Juan", "correo" : "Juan@gmail.com", "direccion" : "Calle 123", "Contraseña" : "12345", "Telefono" : 2611234567, "Rol" : "Administrador"},
    2 : {"nombre" : "Jose", "correo" : "Jose@gmail.com", "direccion" : "Calle 456", "Contraseña" : "12345", "Telefono" : 2611234568, "Rol" : "Usuario"},
    3 : {"nombre" : "Pepe", "correo" : "Pepe@gmail.com", "direccion" : "Calle 112", "Contraseña" : "12345", "Telefono" : 2611234569, "Rol" : "Encargado"}
}

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

from flask_restful import Resource
from flask import request

USUARIOS = {
    1 : {"nombre" : "Juan", "correo" : "Juan@gmail.com", "direccion" : "Calle 123", "Contraseña" : "12345", "Telefono" : 2611234567, "Rol" : "Administrador"},
    2 : {"nombre" : "Jose", "correo" : "Jose@gmail.com", "direccion" : "Calle 456", "Contraseña" : "12345", "Telefono" : 2611234568, "Rol" : "Usuario"},
    3 : {"nombre" : "Pepe", "correo" : "Pepe@gmail.com", "direccion" : "Calle 112", "Contraseña" : "12345", "Telefono" : 2611234569, "Rol" : "Encargado"}

}


# Recurso Usuario
class UsuarioRecurso(Resource):  
    def get(self, id):
        id = int(id)  
        if id in USUARIOS:
            return USUARIOS[id]
        return {"mensaje": "Usuario no encontrado"}, 404

    def put(self, id):
        id = int(id)  
        if id in USUARIOS:
            data = request.get_json()
            USUARIOS[id].update(data)
            return {"mensaje": "Usuario actualizado"}, 200
        return {"mensaje": "Usuario no encontrado"}, 404

    def delete(self, id):
        id = int(id)  
        if id in USUARIOS:
            del USUARIOS[id]
            return {"mensaje": "Usuario eliminado"}, 204
        return {"mensaje": "Usuario no encontrado"}, 404

# Recurso Usuarios
class UsuariosRecursos(Resource):  
    def get(self):
        return USUARIOS

    def post(self):
        data = request.get_json()
        nuevo_id = max(USUARIOS.keys(), default=0) + 1
        USUARIOS[nuevo_id] = data
        return USUARIOS[nuevo_id], 201

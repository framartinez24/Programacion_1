from flask_restful import Resource
from flask import request

USUARIOS = {
    1 : {"nombre" : "Juan", "rol" : "Usuario"},
    2 : {"nombre" : "Jose", "rol" : "Administrador"}}


# Recurso Usuario
class Usuario(Resource):
    # Obtener recurso
    def get(self, id):
        if id in USUARIOS:
            return USUARIOS(id)
        # Si no existe el id
        # Retornar un mensaje de error
        return "El id es inexistente", 404
    
    # Modificar recurso
    def put(self, id):
        if id in USUARIOS:
            usuario = USUARIOS(id)
            data = request.get_json()
            usuario.update(data)
            return "El usuario fue editado con exito", 201
        # Si no existe el id
        # Retornar un mensaje de error
        return "El id modificado no existe", 404
    
    # Eliminar recurso
    def delete(self, id):
        if id in USUARIOS:
            del USUARIOS(id)
            return "Usuario eliminado con exito", 204
        # Si no existe el id
        # Retornar un mensaje de error        
        return "El id eliminado no existe", 404

# Recurso Usuarios
class Usuarios(Resource):
    # Obtener recurso
    def get (self):
        return USUARIOS
    # Obtener recurso por id
    # Insertar recurso
    def post(self):
        usuario = request.get_json()
        id = int(max(USUARIOS.keys())) + 1
        USUARIOS[id] = usuario
        return USUARIOS[id], 201
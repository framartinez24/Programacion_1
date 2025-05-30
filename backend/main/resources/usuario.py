from flask_restful import Resource
from flask import request
from ..models import UsuarioModel
from .. import db

# Recurso individual
class UsuarioRecurso(Resource):  
    def get(self, id):
        usuario = db.session.query(UsuarioModel).get(id)
        if usuario:
            return usuario.to_json()
        return {"mensaje": "Usuario no encontrado"}, 404

    def put(self, id):
        usuario = db.session.query(UsuarioModel).get(id)
        if not usuario:
            return {"mensaje": "Usuario no encontrado"}, 404

        data = request.get_json()

        usuario.nombre = data.get("nombre", usuario.nombre)
        usuario.correo = data.get("correo", usuario.correo)
        usuario.direccion = data.get("direccion", usuario.direccion)
        usuario.contraseña = data.get("contraseña", usuario.contraseña)
        usuario.telefono = data.get("Telefono", usuario.telefono)
        usuario.rol = data.get("Rol", usuario.rol)

        db.session.commit()
        return {"mensaje": "Usuario actualizado"}, 200

    def delete(self, id):
        usuario = db.session.query(UsuarioModel).get(id)
        if not usuario:
            return {"mensaje": "Usuario no encontrado"}, 404

        db.session.delete(usuario)
        db.session.commit()
        return {"mensaje": "Usuario eliminado"}, 200


# Recurso plural
class UsuariosRecursos(Resource):  
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        paginated = db.session.query(UsuarioModel).paginate(page=page, per_page=per_page, error_out=False)
        return [usuario.to_json() for usuario in paginated.items]

    def post(self):
        data = request.get_json()

        nuevo_usuario = UsuarioModel(
            nombre=data.get("nombre"),
            correo=data.get("correo"),
            direccion=data.get("direccion"),
            contraseña=data.get("contraseña"),
            telefono=data.get("Telefono"),
            rol=data.get("Rol")
        )

        db.session.add(nuevo_usuario)
        db.session.commit()
        return nuevo_usuario.to_json(), 201

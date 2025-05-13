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
    

    def post(self):
        # Crear un nuevo usuario
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
    

# Recurso colección
class UsuariosRecursos(Resource):  
    def get(self):
        # Página inicial por defecto
        page = 1
        per_page = 10

        # Obtener los parámetros de la solicitud para la paginación
        if request.args.get("page"):
            page = int(request.args.get("page"))
        if request.args.get("per_page"):
            per_page = int(request.args.get("per_page"))

        usuarios = db.session.query(UsuarioModel)

        # Filtro opcional por nombre
        if request.args.get("buscar"):
            buscar = f"%{request.args.get('buscar')}%"
            usuarios = usuarios.filter(UsuarioModel.nombre.ilike(buscar))

        # Ordenamiento opcional
        if request.args.get("sort"):
            sort_field = request.args.get("sort")
            if sort_field == "rol":
                usuarios = usuarios.order_by(UsuarioModel.rol)
            elif sort_field == "rol_desc":
                usuarios = usuarios.order_by(UsuarioModel.rol.desc())

        # Paginar los resultados con paginate()
        pagination = usuarios.paginate(page, per_page, False)
        usuarios_pagina = pagination.items

        return {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
            "usuarios": [u.to_json() for u in usuarios_pagina]
        }

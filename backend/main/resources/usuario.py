from flask_restful import Resource
from flask import request, jsonify
from sqlalchemy import desc
from ..models import UsuarioModel
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from main.auth.decorators import role_required
from .. import db


# Recurso individual
class UsuarioRecurso(Resource):
    @jwt_required(optional=True)
    # Crear recurso usuario
    @jwt_required()
    def get(self):

        correo = request.args.get("correo", None)
        rol = request.args.get("rol", None)

        query = UsuarioModel.query

        if correo:
            query = query.filter(UsuarioModel.correo.like(f"%{correo}%"))

        if rol:
            query = query.filter(UsuarioModel.rol == rol)


    # Editar recurso usuario con autenticación
    @jwt_required()
    def put(self, id):
        usuario = db.session.query(UsuarioModel).get(id)
        if not usuario:
            return {"mensaje": "Usuario no encontrado"}, 404

        data = request.get_json()

    # Actualiza solo si hay datos nuevos, conserva lo anterior si no viene algo
        usuario.nombre = data.get("nombre", usuario.nombre)
        usuario.correo = data.get("correo", usuario.correo)
        usuario.direccion = data.get("direccion", usuario.direccion)
        usuario.contraseña = data.get("contraseña", usuario.contraseña)
        usuario.telefono = data.get("telefono", usuario.telefono)
        usuario.rol = data.get("rol", usuario.rol)

    # Si viene una nueva contraseña, la hasheo usando el setter
        if "contraseña" in data:
            usuario.plain_contraseña = data["contraseña"]

        db.session.commit()
        return {"mensaje": "Usuario actualizado"}, 200

    
    @role_required(roles=["administrador", "empleado"])
    # Elimina recurso usuario
    def delete(self, id):
        usuario = db.session.query(UsuarioModel).get_or_404(id)
        rol = get_jwt().get("rol")
        
        # Si el rol es 'empleado', solo puede eliminar su propio usuario
        if rol == "empleado" and usuario.id != get_jwt_identity():
            return {"mensaje": "No tiene permisos para eliminar este recurso"}, 403
        
        db.session.delete(usuario)
        db.session.commit()
        return '', 204


# Recurso plural
class UsuariosRecursos(Resource):
    @role_required(roles = ["administrador"])
    def get(self):
        # Paginación
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        # Query base
        usuarios = db.session.query(UsuarioModel)

        # Filtros
        if request.args.get("nombre"):
            nombre = request.args.get("nombre")
            usuarios = usuarios.filter(UsuarioModel.nombre.ilike(f"%{nombre}%"))

        if request.args.get("correo"):
            correo = request.args.get("correo")
            usuarios = usuarios.filter(UsuarioModel.correo.ilike(f"%{correo}%"))

        if request.args.get("rol"):
            rol = request.args.get("rol")
            usuarios = usuarios.filter(UsuarioModel.rol == rol)

        # Ordenamiento
        if request.args.get("sortby_nombre"):
            if request.args.get("sortby_nombre") == "desc":
                usuarios = usuarios.order_by(desc(UsuarioModel.nombre))
            else:
                usuarios = usuarios.order_by(UsuarioModel.nombre)

        if request.args.get("sortby_correo"):
            if request.args.get("sortby_correo") == "desc":
                usuarios = usuarios.order_by(desc(UsuarioModel.correo))
            else:
                usuarios = usuarios.order_by(UsuarioModel.correo)

        # Aplicar paginación
        paginated = usuarios.paginate(page=page, per_page=per_page, error_out=False)

        return [usuario.to_json() for usuario in paginated.items]

    def post(self):
    
        data = request.get_json()

        usuario = UsuarioModel(
            nombre=data.get("nombre"),
            correo=data.get("correo"),
            direccion=data.get("direccion"),
            telefono=data.get("telefono"),
            rol=data.get("rol")
        )


# Usar el setter para que se guarde la contraseña hasheada
        usuario.plain_contraseña = data.get("contraseña")

        db.session.add(usuario)
        db.session.commit()
        return usuario.to_json(), 201


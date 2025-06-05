from flask import request, jsonify, Blueprint
from .. import db
from main.models import UsuarioModel
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

auth = Blueprint('auth', __name__, url_prefix='/auth')

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    correo = data.get('correo')
    contraseña = data.get('contraseña')

    if not correo or not contraseña:
        return {'mensaje': 'Correo y contraseña son requeridos'}, 400

    usuario = db.session.query(UsuarioModel).filter(UsuarioModel.correo == request.get_json().get("correo")).first()
    if not usuario or not usuario.validate_pass(contraseña):
        return {'mensaje': 'Correo o contraseña inválidos'}, 401

    access_token = create_access_token(identity=usuario)
    return jsonify({
        'id': usuario.id,
        'correo': usuario.correo,
        'access_token': access_token
    }), 200


# Método de registro
@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    correo = data.get('correo')
    if not correo:
        return {'mensaje': 'Correo requerido'}, 400

    # Verificar si el correo ya existe en la base de datos
    exists = db.session.query(UsuarioModel).filter(UsuarioModel.correo == correo).first()
    if exists:
        return {'mensaje': 'Correo duplicado'}, 409

    # Crear una nueva instancia de UsuarioModel
    nuevo_usuario = UsuarioModel(
        nombre=data.get('nombre'),
        correo=correo,
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        rol=data.get('rol')
    )

    # Setear y hashear la contraseña
    nuevo_usuario.plain_contraseña = data.get('contraseña')

    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        return nuevo_usuario.to_json(), 201
    except Exception as error:
        db.session.rollback()
        return {'mensaje': f'Error al registrar usuario: {str(error)}'}, 500
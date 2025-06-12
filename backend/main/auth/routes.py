from flask import request, jsonify, Blueprint
from .. import db
from main.models import UsuarioModel
from flask_jwt_extended import create_access_token, create_refresh_token
from main.mail.functions import sendMail
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

auth = Blueprint('auth', __name__, url_prefix='/auth')

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    correo = data.get('correo')
    contraseña = data.get('contraseña')

    if not correo or not contraseña:
        return {'mensaje': 'Correo y contraseña son requeridos'}, 400

    usuario = db.session.query(UsuarioModel).filter(UsuarioModel.correo == correo).first()
    if not usuario or not usuario.validate_pass(contraseña):
        return {'mensaje': 'Correo o contraseña inválidos'}, 401


    access_token = create_access_token(identity=str(usuario.id))
    refresh_token = create_refresh_token(identity=str(usuario.id))

    return jsonify({
        'id': usuario.id,
        'correo': usuario.correo,
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    print("identity:", get_jwt_identity())
    print("jwt:", get_jwt())
    current_user_id = str(get_jwt_identity())
    new_access_token = str(create_access_token(identity=current_user_id))
    return jsonify({
        'access_token': str(new_access_token)
    }), 200



@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    correo = data.get('correo')
    if not correo:
        return {'mensaje': 'Correo requerido'}, 400

    exists = db.session.query(UsuarioModel).filter(UsuarioModel.correo == correo).first()
    if exists:
        return {'mensaje': 'Correo duplicado'}, 409

    nuevo_usuario = UsuarioModel(
        nombre=data.get('nombre'),
        correo=correo,
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        rol=data.get('rol')
    )
    nuevo_usuario.plain_contraseña = data.get('contraseña')

    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        return nuevo_usuario.to_json(), 201
    except Exception as error:
        db.session.rollback()
        return {'mensaje': f'Error al registrar usuario: {str(error)}'}, 500

#Método de registro
@auth.route('/register_', methods=['POST'])
def register_():
    #Obtener usuario
    usuario = UsuarioModel.from_json(request.get_json())
    #Verificar si el mail ya existe en la db
    exists = db.session.query(UsuarioModel).filter(UsuarioModel.correo == usuario.correo).scalar() is not None
    if exists:
        return 'Duplicated mail', 409
    else:
        try:
            #Agregar usuario a DB
            db.session.add(usuario)
            db.session.commit()
            #Enviar mail de bienvenida
            send = sendMail([usuario.correo],"¡Bienvenido/a!",'register',usuario = usuario)
        except Exception as error:
            db.session.rollback()
            return str(error), 409
        return usuario.to_json() , 201
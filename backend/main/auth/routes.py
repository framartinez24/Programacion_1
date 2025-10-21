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


    # --- INICIO DE LA MODIFICACIÓN ---
    # 1. Creamos un diccionario con los "claims" (datos) adicionales
    #    Aquí incluimos el rol del usuario, que será leído por @role_required
    claims = {"rol": usuario.rol}

    # 2. Añadimos los 'claims' al crear el token de acceso
    access_token = create_access_token(
        identity=str(usuario.id),
        additional_claims=claims
    )
    # --- FIN DE LA MODIFICACIÓN ---

    # El token de refresco no necesita el rol, se queda igual
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
    # --- INICIO DE LA MODIFICACIÓN ---
    # Esto es crucial para que el error 403 no vuelva a aparecer
    # cuando el token de acceso principal expire.
    
    # 1. Obtener el ID del usuario del token de refresco
    current_user_id = str(get_jwt_identity())
    
    # 2. Buscar al usuario en la DB para obtener su rol actual
    usuario = db.session.query(UsuarioModel).get(current_user_id)
    if not usuario:
        # Esto es por seguridad, aunque es raro que pase
        return {"mensaje": "Usuario no encontrado"}, 404

    # 3. Crear los claims para el nuevo token
    claims = {"rol": usuario.rol}

    # 4. Crear el nuevo token de acceso CON los claims
    new_access_token = str(create_access_token(
        identity=current_user_id,
        additional_claims=claims
    ))
    # --- FIN DE LA MODIFICACIÓN ---
    
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

    usuario.rol = 'cliente'

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
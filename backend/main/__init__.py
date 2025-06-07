from flask import Flask
from dotenv import load_dotenv
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_mail import Mail
import os

api = Api()
db = SQLAlchemy()
jwt = JWTManager()
mailsender = Mail()


def create_app():
    load_dotenv()
    app = Flask(__name__)

    raw_path = os.getenv('DATABASE_PATH', './DB')
    db_path = os.path.abspath(raw_path)
    db_name = os.getenv('DATABASE_NAME', 'app.db')
    full_path = os.path.join(db_path, db_name)

    if not os.path.exists(db_path):
        os.makedirs(db_path)
    if not os.path.exists(full_path):
        open(full_path, 'a').close()

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{full_path}'
    db.init_app(app)

    import main.resources as resources

    api.add_resource(resources.UsuarioRecurso, '/usuario/<id>', endpoint="usuario")
    api.add_resource(resources.UsuariosRecursos, '/usuarios', endpoint="usuarios")
    api.add_resource(resources.ProductoRecurso, '/producto/<id>', endpoint="producto")
    api.add_resource(resources.ProductosRecursos, '/productos', endpoint="productos")
    api.add_resource(resources.LoginRecurso, '/login', endpoint="login")
    api.add_resource(resources.LogoutRecurso, '/logout', endpoint="logout")
    api.add_resource(resources.PedidosRecursos, '/pedidos', endpoint="pedidos")
    api.add_resource(resources.PedidoRecurso, '/pedido/<id>', endpoint="pedido")
    api.add_resource(resources.ValoracionRecurso, '/valoracion', endpoint="valoracion")
    api.add_resource(resources.ValoracionItemRecurso, '/valoracion/<id>', endpoint="valoracion_item")
    api.add_resource(resources.NotificacionesRecurso, '/notificaciones', endpoint="notificaciones")
    api.add_resource(resources.NotificacionRecurso, '/notificacion/<int:id>')
    api.add_resource(resources.DetallePedidoRecurso, '/detalle_pedido', '/detalle_pedido/<int:id>')
    api.add_resource(resources.FacturasRecurso, '/facturas')
    api.add_resource(resources.FacturaRecurso, '/factura/<int:id>')
    api.init_app(app)

    # Configuración JWT
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'clave-flask-segura')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'clave-jwt-supersegura')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
    jwt.init_app(app)

    #Configuración de mail
    app.config['MAIL_HOSTNAME'] = os.getenv('MAIL_HOSTNAME')
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS')
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['FLASKY_MAIL_SENDER'] = os.getenv('FLASKY_MAIL_SENDER')
    #Inicializar en app
    mailsender.init_app(app)

    # Registrar Blueprint
    from main.auth import routes 
    app.register_blueprint(routes.auth)

    # Crear tablas si no existen
    with app.app_context():
        db.create_all()

    return app

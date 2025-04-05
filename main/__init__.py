from flask import Flask
from dotenv import load_dotenv
from flask_restful import Api

import main.resources as resources

#Inicializamos restful
api = Api()

def create_app():
    #Inicializar flask
    app = Flask(__name__)
    #cargamos variables de entorno
    load_dotenv()
    
    # Agregamos el recurso de lusuarios
    api.add_resource(resources.UsuarioRecurso, '/usuario/<id>')
    api.add_resource(resources.UsuariosRecursos, '/usuarios')

    # Agregamos los recursos de productos
    api.add_resource(resources.ProductoRecurso, '/producto/<id>')
    api.add_resource(resources.ProductosRecursos, '/productos')

    # Agregamos el recurso de login
    api.add_resource(resources.LoginRecurso, '/login')

    # Agregamos el recurso de logout
    api.add_resource(resources.LogoutRecurso, '/logout')

    # Agregamos el recurso de pedidos
    api.add_resource(resources.PedidosRecursos, '/pedidos')
    api.add_resource(resources.PedidoRecurso, '/pedido/<id>')

    # Agregamos el recurso de notificaciones
    api.add_resource(resources.NotificacionRecurso, '/notificaciones')

    # Agregamos el recurso de valoración
    api.add_resource(resources.ValoracionRecurso, '/valoracion')

    
    api.init_app(app)

    return app
    
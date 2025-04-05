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
    
    #cargar los recursos
    api.add_resource(resources.UsuarioRecurso, '/usuario/<id>')
    api.add_resource(resources.UsuariosRecursos, '/usuarios')

    # Agregamos los recursos de productos
    api.add_resource(resources.ProductoRecurso, '/producto/<id>')
    api.add_resource(resources.ProductosRecursos, '/productos')

    
    api.init_app(app)

    return app
    
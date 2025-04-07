from flask_restful import Resource
from flask import request

# Cada producto tiene una lista de valoraciones (puntuación + comentario)
VALORACIONES = {
    1: [{"puntuacion": 10, "comentario": "Muy rico"}],
    2: [{"puntuacion": 7, "comentario": "Estaba rico, pero estaba frio"}],
    3: [{"puntuacion": 0, "comentario": "Tenia un pelo"}]
}

class ValoracionRecurso(Resource):
    def post(self):
        data = request.get_json()
        producto_id = data.get("producto_id")
        puntuacion = data.get("puntuacion")
        comentario = data.get("comentario", "")

        if producto_id is None or puntuacion is None:
            return {"error": "Faltan campos obligatorios: producto_id o puntuacion"}, 400

        # Si no hay valoraciones aún para este producto, inicializamos la lista
        if producto_id not in VALORACIONES:
            VALORACIONES[producto_id] = []

        # Agregamos la nueva valoración
        VALORACIONES[producto_id].append({
            "puntuacion": puntuacion,
            "comentario": comentario
        })

        return {"mensaje": "Valoración agregada correctamente"}, 201

    def get(self):
        return VALORACIONES

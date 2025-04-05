from flask_restful import Resource
from flask import request

VALORACIONES = {
    1: {"puntuacion" : 10, "comentario" : "Muy rico"},
    2: {"puntuacion" : 7,  "comentario" : "Estaba rico, pero estaba frio"},
    3: {"puntuacion" : 0, "comentario" : "Tenia un pelo"}
}

class ValoracionRecurso(Resource):
    def post(self):
        data = request.get_json()
        producto_id = data.get("producto_id")
        valor = data.get("valor")
        comentario = data.get("comentario", "")

        if producto_id not in VALORACIONES:
            VALORACIONES[producto_id] = []

        VALORACIONES[producto_id].append({"valor": valor, "comentario": comentario})
        return {"mensaje": "Valoración agregada"}, 201

    def get(self):
        return VALORACIONES
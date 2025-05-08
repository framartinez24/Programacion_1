from main import db

usuario_valoracion = db.Table(
    'usuario_valoracion',
    db.Column('usuario_id', db.Integer, db.ForeignKey('usuarios.id')),
    db.Column('valoracion_id', db.Integer, db.ForeignKey('valoracion.id'))
)

usuario_pedido = db.Table(
    'usuario_pedido',
    db.Column('usuario_id', db.Integer, db.ForeignKey('usuarios.id')),
    db.Column('pedido_id', db.Integer, db.ForeignKey('pedido.id'))
)

producto_valoracion = db.Table(
    'producto_valoracion',
    db.Column('producto_id', db.Integer, db.ForeignKey('productos.id')),
    db.Column('valoracion_id', db.Integer, db.ForeignKey('valoracion.id'))
)

pedidos_notificacion = db.Table(
    'pedidos_notificacion',
    db.Column('pedido_id', db.Integer, db.ForeignKey('pedido.id')),
    db.Column('notificacion_id', db.Integer, db.ForeignKey('notificacion.id'))
)


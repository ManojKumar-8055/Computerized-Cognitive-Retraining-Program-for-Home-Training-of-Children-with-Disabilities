import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()  # optional .env support

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///cognitive.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-me-secret')

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)  # allow cross-origin from frontend in dev

# ----------------- Models -----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GameSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(80), nullable=False)
    game_type = db.Column(db.String(50), nullable=False)  # memory / attention
    score = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer, default=0)  # seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ----------------- Auth routes -----------------
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify(msg='username & password required'), 400
    if User.query.filter_by(username=username).first():
        return jsonify(msg='user-exists'), 400
    u = User(username=username, password_hash=generate_password_hash(password))
    db.session.add(u)
    db.session.commit()
    token = create_access_token(identity=username)
    return jsonify(access_token=token), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify(msg='bad credentials'), 401
    token = create_access_token(identity=username)
    return jsonify(access_token=token)

# ----------------- Game session endpoints -----------------
@app.route('/api/sessions', methods=['POST'])
@jwt_required()
def create_session():
    current_user = get_jwt_identity()
    data = request.get_json() or {}
    game_type = data.get('game_type')
    score = int(data.get('score', 0))
    duration = int(data.get('duration', 0))
    gs = GameSession(user=current_user, game_type=game_type, score=score, duration=duration)
    db.session.add(gs)
    db.session.commit()
    return jsonify(msg='ok', id=gs.id), 201

@app.route('/api/sessions', methods=['GET'])
@jwt_required()
def list_sessions():
    current_user = get_jwt_identity()
    rows = GameSession.query.filter_by(user=current_user).order_by(GameSession.created_at.desc()).limit(200).all()
    out = [{
        'id': r.id, 'game_type': r.game_type, 'score': r.score,
        'duration': r.duration, 'created_at': r.created_at.isoformat()
    } for r in rows]
    return jsonify(out)

@app.route('/')
def health():
    return jsonify(msg='Cognitive backend running')

if __name__ == '__main__':
    with app.app_context():   # <-- add this
        db.create_all()       # now it has access to the Flask app
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)

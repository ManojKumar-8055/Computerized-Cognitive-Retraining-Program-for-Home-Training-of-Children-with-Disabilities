import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, get_jwt
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ----------------- Config -----------------
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///cognitive.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-me-secret')

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ----------------- Models -----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.Text, default="parent")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GameSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.Text, nullable=False)
    game_type = db.Column(db.Text, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer, default=0)
    mistakes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ----------------- Auth Routes -----------------
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'parent')

    if not username or not password:
        return jsonify(msg='username & password required'), 400
    if User.query.filter_by(username=username).first():
        return jsonify(msg='user-exists'), 400

    user = User(username=username, password_hash=generate_password_hash(password), role=role)
    db.session.add(user)
    db.session.commit()

    # ✅ Use username as string identity, add extra info in claims
    token = create_access_token(identity=username, additional_claims={"role": role, "id": user.id})
    return jsonify(access_token=token, role=role), 201


@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify(msg='bad credentials'), 401

    # ✅ Same structure
    token = create_access_token(identity=username, additional_claims={"role": user.role, "id": user.id})
    return jsonify(access_token=token, role=user.role)

# ----------------- Game Session Routes -----------------
@app.route('/api/sessions', methods=['POST'])
@jwt_required()
def create_session():
    username = get_jwt_identity()
    data = request.get_json() or {}

    game_type = data.get('game_type')
    score = int(data.get('score', 0))
    duration = int(data.get('duration', 0))
    mistakes = int(data.get('mistakes', 0))

    if not game_type:
        return jsonify(msg='game_type required'), 400

    gs = GameSession(user=username, game_type=game_type, score=score, duration=duration, mistakes=mistakes)
    db.session.add(gs)
    db.session.commit()
    return jsonify(msg='ok', id=gs.id), 201


@app.route('/api/sessions', methods=['GET'])
@jwt_required()
def list_sessions():
    username = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')

    # Therapist can see all sessions
    if role == 'therapist':
        rows = GameSession.query.order_by(GameSession.created_at.desc()).limit(1000).all()
    else:
        rows = GameSession.query.filter_by(user=username).order_by(GameSession.created_at.desc()).limit(200).all()

    out = [{
    'id': r.id,
    'user': r.user,
    'game_type': r.game_type,
    'score': r.score,
    'duration': r.duration,
    'mistakes': r.mistakes,
    # format as UTC ISO with Z (created_at stored using utcnow())
    'created_at': r.created_at.strftime("%Y-%m-%dT%H:%M:%SZ")
} for r in rows]
    return jsonify(out)

# ----------------- Therapist Tools -----------------
@app.route('/api/users', methods=['GET'])
@jwt_required()
def list_users():
    claims = get_jwt()
    if claims.get('role') != 'therapist':
        return jsonify(msg='forbidden'), 403

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([
    {
      'id': u.id,
      'username': u.username,
      'role': u.role,
      'created_at': u.created_at.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    for u in users
])


@app.route('/api/analysis/<username>', methods=['GET'])
@jwt_required()
def analyze_user(username):
    claims = get_jwt()
    if claims.get('role') != 'therapist':
        return jsonify(msg='forbidden'), 403

    sessions = GameSession.query.filter_by(user=username).order_by(GameSession.created_at).all()
    if not sessions:
        return jsonify(msg='no-sessions', username=username, average_mistakes=0, trend='no-data')

    mistakes = [s.mistakes for s in sessions]
    avg = sum(mistakes) / len(mistakes)
    last = mistakes[-1]
    trend = 'improving' if last < avg else 'needs-attention'

    return jsonify({
        'username': username,
        'count': len(sessions),
        'average_mistakes': avg,
        'last_mistake': last,
        'trend': trend
    })

# ----------------- Health -----------------
@app.route('/')
def health():
    return jsonify(msg='Cognitive backend running')

# ----------------- Run -----------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)

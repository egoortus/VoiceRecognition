import os
import re
from flask import Flask, abort, request, jsonify, g, url_for, send_from_directory, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_httpauth import HTTPBasicAuth
from passlib.apps import custom_app_context as pwd_context
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired
from voiceit2 import *
from config import *

# initialization
app = Flask(__name__)
app.config['SECRET_KEY'] = 'the quick brown fox jumps over the lazy dog'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
duration = 9999999999

# extensions
db = SQLAlchemy(app)
auth = HTTPBasicAuth()
voice = VoiceIt2('key_3c0424e5de2741c5851a95dbcef1f81f',
                 'tok_717537af96da4201b3a42bbb59710fcc')


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), index=True)
    password_hash = db.Column(db.String(64))
    userid = db.Column(db.String(64))

    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def generate_auth_token(self, expiration=duration):
        s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
        return s.dumps({'id': self.id})

    def voice_count(self):
        return len([f for f in os.listdir('data') if re.match('{}.[0-9].wav'.format(self.username), f)])

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except (SignatureExpired, BadSignature):
            return None    # valid token, but expired
             # invalid token
        user = User.query.get(data['id'])
        return user


@auth.verify_password
def verify_password(username_or_token, password):
    user = User.verify_auth_token(username_or_token)
    if not user:
        user = User.query.filter_by(username=username_or_token).first()
        if not user or not user.verify_password(password):
            abort(401)
    g.user = user
    return True


@app.route('/api/user/<int:id>')
def get_user(id):
    user = User.query.get(id)
    if not user:
        abort(400)
    return jsonify({'username': user.username})


@app.route('/api/users')
def get_all_users():
    users = User.query.all()
    if not users:
        abort(400)
    return jsonify([{'id': user.id, 'username': user.username} for user in users])


@app.route('/api/resource')
@auth.login_required
def get_resource():
    return jsonify({'data': 'Hello, %s!' % g.user.username})


@app.route('/api/registration', methods=['POST'])
def new_user():
    username = request.json.get('username')
    password = request.json.get('password')

    if username is None or password is None:
        return 'Bad request!', 400
    elif User.query.filter_by(username=username).first() is not None:
        return 'User allready exists!', 409

    user = User(username=username, userid=userid)
    userid = voice.create_user()['userId']
    user.hash_password(password)
    db.session.add(user)
    db.session.commit()

    token = user.generate_auth_token(duration)
    return jsonify({'token': token.decode('ascii'), 'duration': duration}), 201


@app.route('/api/remove', methods=['POST'])
@auth.login_required
def remove_user():
    db.session.delete(g.user)
    db.session.commit()

    return 'removed', 201


@app.route('/api/login-psw', methods=['POST'])
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token(duration)
    return jsonify({'token': token.decode('ascii'), 'duration': duration})


@app.route('/api/login-rec/<username>', methods=['POST'])
def login(username):
    path = 'data/{}.wav'.format(username)
    file = open(path, 'wb')
    newFileByteArray = bytearray(request.data)
    file.write(newFileByteArray)
    user = User.query.filter_by(username=username).first()
    result = voice.voice_verification(user.userid, 'en-US', path)

    if result['responseCode'] == 'SUCC':
        token = user.generate_auth_token(duration)
        return jsonify({'token': token.decode('ascii'), 'duration': duration}), 200
    else:
        return abort(401)


@app.route('/api/voice', methods=['POST'])
@auth.login_required
def add_voice():
    user = g.user
    path = 'data/{}.{}.wav'.format(g.user.username, user.voice_count())
    file = open(path, 'wb')
    newFileByteArray = bytearray(request.data)
    file.write(newFileByteArray)
    result = voice.create_voice_enrollment(user.userid, 'en-US', path)
    if result['responseCode'] == 'SUCC':
        return jsonify({'count': user.voice_count()}), 201
    else:
        return jsonify({'count': user.voice_count() - 1}), 400


@app.route('/<path:path>')
def handle_static(path):
    return send_from_directory('static', path)


@app.route('/')
def handle_root():
    return send_from_directory('static', 'index.html')

@app.route('/user')
@auth.login_required
def handle_user():
    return render_template('user.html', user=g.user)


if __name__ == '__main__':
    if not os.path.exists('db.sqlite'):
        db.create_all()
    app.run(debug=True)

from flask import Flask, send_from_directory, request

app = Flask(__name__)

@app.route('/<path:path>')
def handle_static(path):
    return send_from_directory('static', path)


@app.route('/')
def handle_root():
    return send_from_directory('static', 'index.html')


@app.route('/login/<username>', methods=['POST'])
def login(username):
    file = open('data/{}.wav'.format(username), 'wb')
    newFileByteArray = bytearray(request.data)
    file.write(newFileByteArray)
    return 'ok'



app.run('localhost', 4000)

function closeModal(event) {
    var modal2 = document.getElementById('id02');
    var modal1 = document.getElementById('id01');

    if (!event || event.target == document.getElementById('id01') || event.target == document.getElementById('id02')) {
        modal1.style.display = 'none';
        modal2.style.display = 'none';
    }
}


function setup() {
    let token, username, voice_count = 0;
    let registration, login, changepsw, voice, user;

    function checkPassword(psw1, psw2) {
        let letter = document.getElementById('letter');
        let capital = document.getElementById('capital');
        let number = document.getElementById('number');
        let length = document.getElementById('length');
        let match = document.getElementById('match');
        let is_valid = true

        invalid_to_valid = errortype => {
            errortype.classList.add('valid');
            errortype.classList.remove('invalid');
        }
        valid_to_invalid = errortype => {
            is_valid = false;
            errortype.classList.add('invalid');
            errortype.classList.remove('valid');
        }

        psw1.value.match(/[a-z]/g) ? invalid_to_valid(letter) : valid_to_invalid(letter);
        psw1.value.match(/[A-Z]/g) ? invalid_to_valid(capital) : valid_to_invalid(capital);
        psw1.value.match(/[0-9]/g) ? invalid_to_valid(number) : valid_to_invalid(number);
        psw1.value.length >= 8 ? invalid_to_valid(length) : valid_to_invalid(length);
        is_valid && psw1.value == psw2.value ? invalid_to_valid(match) : valid_to_invalid(match);

        return is_valid
    }

    function recordVoice(audio, key, before, after) {
        before()
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                const audioChunks = [];
                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    audio[key] = new Blob(audioChunks, { type: 'audio/wav' });
                });

                setTimeout(() => { mediaRecorder.stop(), after() }, 4000);
            });
    }

    function loadUserPage() {
        closeModal()
        settins = document.getElementById('id03').style.display = 'block';
    }

    if (registration = document.forms.registration) {
        registration.elements.psw1.onkeyup = registration.elements.psw2.onkeyup =
            () => { checkPassword(registration.elements.psw1, registration.elements.psw2) }

        registration.onsubmit = event => {
            event.preventDefault()
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/registration');
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.send(JSON.stringify({ 'username': registration.elements.uname.value, 'password': registration.elements.psw2.value }));
            xhr.onloadend = function () {
                if (xhr.status == 201) {
                    token = JSON.parse(xhr.response).token
                    username = registration.elements.uname.value
                    registration.reset()
                    loadUserPage()
                }
                else if (xhr.status == 403 && xhr.status == 404) {
                    login.elements.rec.checked = false
                    login.record = null
                    login.elements.errormsg.value = xhr.statusText
                } else {
                    console.log(xht.response)
                }
            }
        }
    }

    if (login = document.forms.login) {
        login.elements.rec.onclick = () => {
            recordVoice(login, 'record',
                () => {
                    login.elements.rec.parentNode.style = 'background-image: url(/recording.gif);color: transparent;'
                },
                () => {
                    login.elements.rec.parentNode.style = null;
                    login.elements.rec.checked = true
                }
            )
        }

        login.onsubmit = event => {
            event.preventDefault()
            var xhr = new XMLHttpRequest();
            if (login.elements.usepsw.checked) {
                xhr.open('POST', `/api/login-psw`);
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${login.elements.uname.value}:${login.elements.psw.value}`));
                xhr.send();
            } else {
                xhr.open('POST', `/api/login-rec/${login.elements.uname.value}`);
                xhr.send(login.record);
            }
            xhr.onloadend = () => {
                if (xhr.status == 401 || xhr.status == 404) {
                    login.elements.rec.checked = false
                    login.record = null
                    login.elements.errormsg.value = 'Incorrect username or password'
                } else if (xhr.status == 200) {
                    username = login.elements.uname.value;
                    token = JSON.parse(xhr.response).token;
                    loadUserPage();
                }
            }
        }
    }

    if (voice = document.forms.voice) {
        voice.elements.rec.onclick = () => {
            recordVoice(voice, 'record',
                () => {
                    voice.elements.rec.style.backgroundImage = 'url(/recording.gif)'
                },
                () => {
                    voice.elements.rec.style.backgroundImage = null
                }
            )
        }

        voice.onsubmit = event => {
            event.preventDefault()
            var xhr = new XMLHttpRequest();
            xhr.open('POST', `/api/voice`);
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${token}:unused`));
            xhr.send(voice.record);
            xhr.onloadend = () => {
                if (xhr.status != 201) {
                    voice.elements.errormsg.value = 'Phrase not added!'
                } else {
                    voice.elements.errormsg.value = xhr.responseText
                }
            }
        }
    }

    document.forms.user.elements.delete.onclick = () => {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', `/api/remove`);
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${token}:unused`));
        xhr.send(voice.record);
        xhr.onloadend = () => { window.location = '/' }
    }

    document.forms.user.elements.exit.onclick = window.onpopstate = () => {
        window.location = '/'
    }


    window.onclick = closeModal
}

document.addEventListener('DOMContentLoaded', setup)

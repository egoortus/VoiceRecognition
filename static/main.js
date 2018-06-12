document.addEventListener('DOMContentLoaded', () => {
    let [registration, login] = document.forms
    let psw1 = document.getElementById("psw1");
    let psw2 = document.getElementById("psw2");
    let message = document.getElementById("message");

    function closeModal(event) {
        // Get the modal
        var modal2 = document.getElementById('id02');
        // Get the modal
        var modal1 = document.getElementById('id01');

        if (!event || event.target == document.getElementById('id01') || event.target == document.getElementById('id02')) {
            modal1.style.display = "none";
            modal2.style.display = "none";
        }
    }

    function checkPassword(psw1, psw2) {
        let letter = document.getElementById("letter");
        let capital = document.getElementById("capital");
        let number = document.getElementById("number");
        let length = document.getElementById("length");
        let match = document.getElementById("match");
        let is_valid = true

        invalid_to_valid = errortype => {
            errortype.classList.add("valid");
            errortype.classList.remove("invalid");
        }
        valid_to_invalid = errortype => {
            is_valid = false;
            errortype.classList.add("invalid");
            errortype.classList.remove("valid");
        }

        psw1.value.match(/[a-z]/g) ? invalid_to_valid(letter) : valid_to_invalid(letter);
        psw1.value.match(/[A-Z]/g) ? invalid_to_valid(capital) : valid_to_invalid(capital);
        psw1.value.match(/[0-9]/g) ? invalid_to_valid(number) : valid_to_invalid(number);
        psw1.value.length >= 8 ? invalid_to_valid(length) : valid_to_invalid(length);
        is_valid && psw1.value == psw2.value ? invalid_to_valid(match) : valid_to_invalid(match);

        return is_valid
    }

    function recordVoice(element, audio, key) {
        element.parentNode.style = 'background-image: url(/recording.gif);color: transparent;'
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                const audioChunks = [];
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    audio[key] = new Blob(audioChunks, { type: 'audio/wav' });
                });

                setTimeout(() => {
                    mediaRecorder.stop();
                    element.parentNode.style = null
                    element.checked = true;
                }, 3050);
            });
    }
    
    registration.onsubmit = event => {
        event.preventDefault()
        var xhr = new XMLHttpRequest();
        xhr.open('POST', `/registration/${registration.elements.uname.value}`);
        xhr.send(login.elements.usepsw.checked ? login.elements.psw.value : login.record);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
            if (xhr.status == 403 && xhr.status == 404) {
                login.elements.rec.checked = false
                login.record = null
                login.elements.errormsg.innerText = xhr.statusText
            } else {
                document.innerHTML = xhr.response
                window.history.pushState({}, login.elements.uname.value, login.elements.uname.value)
            }
        }
    }

    login.onsubmit = event => {
        event.preventDefault()
        var xhr = new XMLHttpRequest();
        xhr.open('POST', `/login/${login.elements.uname.value}`);
        xhr.send(login.elements.usepsw.checked ? login.elements.psw.value : login.record);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
            if (xhr.status == 403 && xhr.status == 404) {
                login.elements.rec.checked = false
                login.record = null
                login.elements.errormsg.innerText = xhr.statusText
            } else {
                document.innerHTML = xhr.response
                window.history.pushState({}, login.elements.uname.value, login.elements.uname.value)
            }
        }
    }


    window.onclick = closeModal
    window.onpopstate = () => { window.location = ''}
    psw1.onfocus = psw2.onfocus = () => { message.style.display = "block"; }
    psw1.onblur = psw2.onblur = () => { message.style.display = "none"; }
    psw1.onkeyup = psw2.onkeyup = () => { checkPassword(psw1, psw2) }
    login.elements.rec.onclick = () => { recordVoice(login.elements.rec, login, 'record') }
    registration.elements.rec1.onclick = () => { recordVoice(registration.elements.rec1, registration, 'record1') }
    registration.elements.rec2.onclick = () => { recordVoice(registration.elements.rec2, registration, 'record2') }
    registration.elements.rec3.onclick = () => { recordVoice(registration.elements.rec3, registration, 'record3') }
});
document.addEventListener('DOMContentLoaded', () => {
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

    function recordVoice() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                const audioChunks = [];
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    login.record = new Blob(audioChunks, { type: 'audio/wav' });
                });

                setTimeout(() => {
                    mediaRecorder.stop();
                    login.elements.rec.parentNode.style = null
                    login.elements.rec.checked = true;
                }, 3050);
            });
    }

    window.onclick = closeModal

    let psw1 = document.getElementById("psw1");
    let psw2 = document.getElementById("psw2");
    let message = document.getElementById("message");
    psw1.onfocus = psw2.onfocus = () => { message.style.display = "block"; }
    psw1.onblur = psw2.onblur = () => { message.style.display = "none"; }
    psw1.onkeyup = psw2.onkeyup = () => { checkPassword(psw1, psw2) }

    let [registration, login] = document.forms

    login.onsubmit = event => {
        event.preventDefault()
        var xhr = new XMLHttpRequest();
        xhr.open('POST', `/login/${login.elements.uname.value}`);
        xhr.send(login.elements.usepsw.checked ? login.elements.psw.value : login.record);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;

            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText);
            } else {
                console.log('Готово!');
            }
        }
    }

    login.elements.rec.onclick = () => {
        login.elements.rec.parentNode.style = 'background-image: url(/recording.gif);color: transparent;'
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                const audioChunks = [];
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    login.record = new Blob(audioChunks, { type: 'audio/wav' });
                });

                setTimeout(() => {
                    mediaRecorder.stop();
                    login.elements.rec.parentNode.style = null
                    login.elements.rec.checked = true;
                }, 3050);
            });
    }

});
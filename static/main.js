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

document.addEventListener('DOMContentLoaded', () => {
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
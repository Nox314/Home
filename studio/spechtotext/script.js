function speechToTextConversion() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const textArea = document.getElementById('text');
    const playButton = document.getElementById('playButton');

    let isListening = false;

    playButton.onclick = function () {
        if (!isListening) {
            playButton.src = "mic-on.png"; // mic-on image
            recognition.start();
            isListening = true;
        } else {
            playButton.src = "mic-off.png"; // mic-off image
            recognition.stop();
            isListening = false;
        }
    };

    recognition.onresult = function (event) {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        textArea.value += transcript + ' ';
    };

    recognition.onnomatch = function () {
        textArea.value += '\n[Unrecognized speech]';
    };

    recognition.onerror = function (event) {
        textArea.value += `\n[Error: ${event.error}]`;
    };
}

window.onload = speechToTextConversion;

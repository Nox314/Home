const startButton = document.getElementById('startButton');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const languageSelect = document.getElementById('languageSelect');
const statusText = document.getElementById('statusText');

let recognition = null;
let isRecording = false;

// Copy Functionality
copyButton.onclick = function() {
    const textToCopy = output.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyButton.innerText;
        copyButton.innerText = '✅ Kopiert!';
        setTimeout(() => {
            copyButton.innerText = originalText;
        }, 1500);
    }).catch(err => {
        console.error('Fehler beim Kopieren:', err);
        alert('Konnte Text nicht kopieren. Bitte manuell kopieren.');
    });
};

// Clear Functionality
clearButton.onclick = function() {
    output.innerText = '';
    output.style.backgroundColor = '#fafafa';
};

// Initialize Speech Recognition
function initRecognition(language) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Ihr Browser unterstützt keine Spracherkennung. Bitte verwenden Sie Chrome, Edge oder Safari.');
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    
    newRecognition.lang = language;
    newRecognition.interimResults = true;
    newRecognition.continuous = true;
    
    newRecognition.addEventListener('start', () => {
        isRecording = true;
        startButton.classList.add('recording');
        statusText.innerText = '🎤 Aufnimmt...';
        statusText.classList.add('recording');
        output.style.backgroundColor = '#fff8f8';
    });

    newRecognition.addEventListener('end', () => {
        isRecording = false;
        startButton.classList.remove('recording');
        statusText.innerText = 'Tippe zum Aufnehmen';
        statusText.classList.remove('recording');
        output.style.backgroundColor = '#fafafa';
    });

    newRecognition.addEventListener('error', event => {
        console.error('Spracherkennungsfehler:', event.error);
        statusText.innerText = 'Fehler: ' + event.error;
        isRecording = false;
        startButton.classList.remove('recording');
    });

    newRecognition.addEventListener('result', e => {
        let finalTranscript = '';
        let interimTranscript = '';

        Array.from(e.results).forEach(result => {
            const transcript = result[0].transcript;
            if (result.isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        });

        // Display final + interim results
        const displayText = (finalTranscript || '') + (interimTranscript ? `[${interimTranscript}]` : '');
        output.innerHTML = displayText || 'Deine transkribierte Sprache erscheint hier...';
    });

    return newRecognition;
}

// Toggle Recording
startButton.addEventListener('click', function() {
    const selectedLanguage = languageSelect.value;

    if (isRecording) {
        if (recognition) {
            recognition.stop();
        }
    } else {
        // Create new recognition instance with selected language
        recognition = initRecognition(selectedLanguage);
        
        if (recognition) {
            try {
                recognition.start();
            } catch (err) {
                console.error('Fehler beim Starten der Aufnahme:', err);
                // Try creating a fresh instance
                recognition = initRecognition(selectedLanguage);
                recognition.start();
            }
        }
    }
});

// Language Change Warning
languageSelect.addEventListener('change', function() {
    if (isRecording) {
        if (confirm('Sprache während der Aufnahme ändern wird die aktuelle Aufnahme stoppen. Fortfahren?')) {
            if (recognition) {
                recognition.stop();
            }
        } else {
            languageSelect.value = recognition.lang;
        }
    }
});

// Keyboard Shortcut (Space to toggle recording)
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && document.activeElement !== languageSelect) {
        e.preventDefault();
        startButton.click();
    }
});

console.log('🎤 X!Studio Speech-to-Text geladen mit Multi-Language Support');

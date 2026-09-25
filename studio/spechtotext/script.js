const startButton = document.getElementById('startButton');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const languageSelect = document.getElementById('languageSelect');
const statusText = document.getElementById('statusText');

let recognition = null;
let isRecording = false;
let browserSupport = getBrowserSupport();

// Browser-Erkennung
function getBrowserSupport() {
    const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
    const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
    const isSafari = navigator.userAgent.indexOf('Safari') > -1 && 
                     navigator.userAgent.indexOf('Chrome') === -1;
    
    return {
        chrome: isChrome,
        firefox: isFirefox,
        safari: isSafari,
        native: ('webkitSpeechRecognition' in window) || 
                ('SpeechRecognition' in window)
    };
}

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
        alert('Konnte Text nicht kopieren.');
    });
};

clearButton.onclick = function() {
    output.innerText = '';
    output.style.backgroundColor = '#fafafa';
};

// Firefox-spezifische Alternative (Web Speech API)
function initFirefoxSpeech() {
    if (!('SpeechRecognition' in window)) {
        showFirefoxWarning();
        return null;
    }
    
    const newRecognition = new SpeechRecognition();
    newRecognition.lang = languageSelect.value;
    newRecognition.interimResults = true;
    newRecognition.continuous = true;
    
    setupRecognitionEvents(newRecognition);
    return newRecognition;
}

// Chrome/Safari Standard
function initStandardSpeech(language) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const newRecognition = new SpeechRecognition();
    
    newRecognition.lang = language;
    newRecognition.interimResults = true;
    newRecognition.continuous = true;
    
    setupRecognitionEvents(newRecognition);
    return newRecognition;
}

// Gemeinsame Event-Handler
function setupRecognitionEvents(recognitionInstance) {
    recognitionInstance.addEventListener('start', () => {
        isRecording = true;
        startButton.classList.add('recording');
        statusText.innerText = '🎤 Aufnimmt...';
        statusText.classList.add('recording');
    });

    recognitionInstance.addEventListener('end', () => {
        isRecording = false;
        startButton.classList.remove('recording');
        statusText.innerText = 'Tippe zum Aufnehmen';
        statusText.classList.remove('recording');
    });

    recognitionInstance.addEventListener('error', event => {
        console.error('Spracherkennungsfehler:', event.error);
        statusText.innerText = 'Fehler: ' + event.error;
        isRecording = false;
        startButton.classList.remove('recording');
    });

    recognitionInstance.addEventListener('result', e => {
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

        const displayText = (finalTranscript || '') + (interimTranscript ? `[${interimTranscript}]` : '');
        output.innerHTML = displayText || 'Deine transkribierte Sprache erscheint hier...';
    });
}

// Warnung für Firefox-Anutzer anzeigen
function showFirefoxWarning() {
    output.innerHTML = `
        <div style="background: #fff8f8; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c;">
            <strong>⚠️ Firefox-Einschränkung</strong><br><br>
            Die native Spracherkennung wird von Firefox derzeit nicht vollständig unterstützt.<br><br>
            <strong>Empfehlungen:</strong><br>
            • Verwende <strong>Chrome</strong> oder <strong>Edge</strong> für beste Ergebnisse<br>
            • Aktiviere experimentelle APIs in <code>about:config → dom.webspeech.enabled = true</code><br>
            • Oder nutze einen <a href="https://speechnotes.co" target="_blank">externen Dienst</a> wie SpeechNotes
        </div>
    `;
    statusText.innerText = 'Nicht unterstützt in diesem Firefox';
}

// Haupt-Logik
startButton.addEventListener('click', function() {
    if (isRecording) {
        if (recognition) {
            recognition.stop();
        }
    } else {
        // Prüfe welche API verfügbar ist
        if (browserSupport.native) {
            recognition = initStandardSpeech(languageSelect.value);
        } else {
            recognition = initFirefoxSpeech();
            
            if (!recognition) {
                showFirefoxWarning();
                return;
            }
        }
        
        try {
            recognition.start();
        } catch (err) {
            console.error('Fehler beim Starten:', err);
            showFirefoxWarning();
        }
    }
});

// Tastatur-Shortcut
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && document.activeElement !== languageSelect) {
        e.preventDefault();
        startButton.click();
    }
});

// Bei Seitenload prüfen
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎤 X!Studio Speech-to-Text Initialisiert');
    console.log('Browser:', browserSupport);
    
    if (!browserSupport.native) {
        output.innerHTML = `
            <div style="color: #666; padding: 20px; text-align: center;">
                <p>Ihr Browser unterstützt die native Spracherkennung möglicherweise nicht.</p>
                <p><strong>Testen:</strong> Klicken Sie auf das Mikrofon-Icon</p>
            </div>
        `;
    }
});

const speakButton = document.getElementById('speakButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const clearButton = document.getElementById('clearButton');
const textInput = document.getElementById('textInput');
const languageSelect = document.getElementById('language');
const voiceSelect = document.getElementById('voice');
const status = document.getElementById('status');

const synth = window.speechSynthesis;
let voices = [];

// Stimmen laden (Chrome lädt sie asynchron)
function loadVoices() {
    voices = synth.getVoices();

    // Sprachen einfügen (ohne Duplikate)
    const languages = [...new Set(voices.map(v => v.lang))].sort();
    languageSelect.innerHTML = '';
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageSelect.appendChild(option);
    });

    populateVoices();
}

function populateVoices() {
    const selectedLang = languageSelect.value;
    const filtered = selectedLang
        ? voices.filter(v => v.lang === selectedLang)
        : voices;

    voiceSelect.innerHTML = '';
    filtered.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    if (filtered.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'Keine Stimmen verfügbar';
        option.disabled = true;
        voiceSelect.appendChild(option);
    }
}

// Slider-Werte live anzeigen
document.getElementById('rate').addEventListener('input', e => {
    document.getElementById('rateValue').textContent = parseFloat(e.target.value).toFixed(1);
});
document.getElementById('pitch').addEventListener('input', e => {
    document.getElementById('pitchValue').textContent = parseFloat(e.target.value).toFixed(1);
});
document.getElementById('volume').addEventListener('input', e => {
    document.getElementById('volumeValue').textContent = parseFloat(e.target.value).toFixed(1);
});

languageSelect.addEventListener('change', populateVoices);

// Vorlesen
speakButton.addEventListener('click', () => {
    if (synth.paused) {
        synth.resume();
        status.textContent = 'Fortgesetzt...';
        return;
    }

    const text = textInput.value.trim();
    if (!text) {
        status.textContent = 'Bitte zuerst Text eingeben!';
        return;
    }

    synth.cancel(); // laufende Wiedergabe stoppen

    const utterance = new SpeechSynthesisUtterance(text);

    const selectedVoice = voiceSelect.value;
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.lang = languageSelect.value || 'de-DE';
    utterance.rate = parseFloat(document.getElementById('rate').value);
    utterance.pitch = parseFloat(document.getElementById('pitch').value);
    utterance.volume = parseFloat(document.getElementById('volume').value);

    utterance.onstart = () => {
        status.textContent = 'Liest vor...';
        speakButton.querySelector('img').src = 'https://cdn-icons-png.flaticon.com/512/149/149668.png';
    };
    utterance.onend = () => {
        status.textContent = 'Fertig.';
        speakButton.querySelector('img').src = 'https://cdn-icons-png.flaticon.com/512/744/744974.png';
    };
    utterance.onerror = (e) => {
        status.textContent = 'Fehler: ' + e.error;
    };

    synth.speak(utterance);
});

// Pause / Resume
pauseButton.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        status.textContent = 'Pausiert.';
        pauseButton.textContent = 'Fortsetzen';
    } else if (synth.paused) {
        synth.resume();
        status.textContent = 'Fortgesetzt...';
        pauseButton.textContent = 'Pause';
    }
});

// Stop
stopButton.addEventListener('click', () => {
    synth.cancel();
    status.textContent = 'Gestoppt.';
    pauseButton.textContent = 'Pause';
});

// Text löschen
clearButton.onclick = function() {
    textInput.value = '';
    status.textContent = '';
};

// Initialisierung
loadVoices();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

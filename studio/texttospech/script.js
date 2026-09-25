const speakButton = document.getElementById('speakButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const clearButton = document.getElementById('clearButton');
const output = document.getElementById('output');
const languageSelect = document.getElementById('language');
const voiceSelect = document.getElementById('voice');
const status = document.getElementById('status');

const synth = window.speechSynthesis;
let voices = [];

// Umfassende Sprachliste mit Regionsvarianten
const supportedLanguages = {
    'de-AT': 'Deutsch (Österreich)',
    'de-CH': 'Deutsch (Schweiz)',
    'de-DE': 'Deutsch (Deutschland)',
    'en-AU': 'English (Australian)',
    'en-CA': 'English (Canadian)',
    'en-GB': 'English (British)',
    'en-HK': 'English (Hong Kong)',
    'en-IE': 'English (Irish)',
    'en-IN': 'English (Indian)',
    'en-NZ': 'English (New Zealand)',
    'en-PH': 'English (Philippine)',
    'en-SG': 'English (Singapore)',
    'en-US': 'English (US)',
    'en-ZA': 'English (South African)',
    'es-AR': 'Español (Argentina)',
    'es-BO': 'Español (Bolivia)',
    'es-CL': 'Español (Chile)',
    'es-CO': 'Español (Colombia)',
    'es-CR': 'Español (Costa Rica)',
    'es-EC': 'Español (Ecuador)',
    'es-ES': 'Español (España)',
    'es-GT': 'Español (Guatemala)',
    'es-HN': 'Español (Honduras)',
    'es-MX': 'Español (México)',
    'es-NI': 'Español (Nicaragua)',
    'es-PA': 'Español (Panamá)',
    'es-PE': 'Español (Perú)',
    'es-PR': 'Español (Puerto Rico)',
    'es-PY': 'Español (Paraguay)',
    'es-SV': 'Español (El Salvador)',
    'es-US': 'Español (Estados Unidos)',
    'es-UY': 'Español (Uruguay)',
    'es-VE': 'Español (Venezuela)',
    'fr-BE': 'Français (Belgique)',
    'fr-CA': 'Français (Canada)',
    'fr-CH': 'Français (Suisse)',
    'fr-FR': 'Français (France)',
    'it-IT': 'Italiano (Italia)',
    'pt-BR': 'Português (Brasil)',
    'pt-PT': 'Português (Portugal)',
    'nl-BE': 'Nederlands (België)',
    'nl-NL': 'Nederlands (Nederland)',
    'pl-PL': 'Polski (Polska)',
    'ru-RU': 'Русский (Россия)',
    'tr-TR': 'Türkçe (Türkiye)',
    'uk-UA': 'Українська (Україна)',
    'el-GR': 'Ελληνικά (Ελλάδα)',
    'cs-CZ': 'Čeština (Česko)',
    'da-DK': 'Dansk (Danmark)',
    'fi-FI': 'Suomi (Suomi)',
    'nb-NO': 'Norsk Bokmål (Norge)',
    'sv-SE': 'Svenska (Sverige)',
    'hu-HU': 'Magyar (Magyarország)',
    'ro-RO': 'Română (România)',
    'sk-SK': 'Slovenčina (Slovensko)',
    'bg-BG': 'Български (България)',
    'ja-JP': '日本語 (日本)',
    'ko-KR': '한국어 (대한민국)',
    'zh-CN': '中文 (简体)',
    'zh-TW': '中文 (繁體)',
    'zh-HK': '中文 (香港)',
    'th-TH': 'ไทย (ประเทศไทย)',
    'vi-VN': 'Tiếng Việt (Việt Nam)',
    'id-ID': 'Bahasa Indonesia',
    'ms-MY': 'Bahasa Melayu',
    'hi-IN': 'हिन्दी (भारत)',
    'bn-IN': 'বাংলা (ভারত)',
    'ta-IN': 'தமிழ் (இந்தியா)',
    'te-IN': 'తెలుగు (భారత్)',
    'mr-IN': 'मराठी (भारत)',
    'kn-IN': 'ಕನ್ನಡ (ಭಾರತ)',
    'gu-IN': 'ગુજરાતી (ભારત)',
    'pa-IN': 'ਪੰਜਾਬੀ (ਭਾਰਤ)',
    'ur-PK': 'اردو (پاکستان)',
    'fa-IR': 'فارسی (ایران)',
    'ar-SA': 'العربية (السعودية)',
    'ar-AE': 'العربية (الإمارات)',
    'ar-EG': 'العربية (مصر)',
    'ar-MA': 'العربية (المغرب)',
    'he-IL': 'עברית (ישראל)',
    'sw-KE': 'Kiswahili (Kenya)',
    'zu-ZA': 'isiZulu (iNingizimu Afrika)',
    'af-ZA': 'Afrikaans (Suid-Afrika)',
    'ca-ES': 'Català (Espanya)',
    'eu-ES': 'Euskara (Euskadi)',
    'gl-ES': 'Galego (Galicia)',
    'cy-GB': 'Cymraeg (Cymru)',
    'ga-IE': 'Gaeilge (Éire)',
    'mt-MT': 'Malti (Malta)',
    'is-IS': 'Íslenska (Ísland)',
    'lv-LV': 'Latviešu (Latvija)',
    'lt-LT': 'Lietuvių (Lietuva)',
    'et-EE': 'Eesti (Eesti)',
    'sl-SI': 'Slovenščina (Slovenija)',
    'sr-RS': 'Српски (Србија)',
    'mk-MK': 'Македонски (Северна Македонија)',
    'sq-AL': 'Shqip (Shqipëri)',
    'hy-AM': 'Հայերեն (Հայաստան)',
    'ka-GE': 'ქართული (საქართველო)',
    'az-AZ': 'Azərbaycan (Azərbaycan)',
    'kk-KZ': 'Қазақша (Қазақстан)',
    'ky-KG': 'Кыргызча (Кыргызстан)',
    'tg-TJ': 'Тоҷикӣ (Тоҷикистон)',
    'tk-TM': 'Türkmençe (Türkmenistan)',
    'uz-UZ': 'Oʻzbekcha (Oʻzbekiston)'
};

// Stimme laden
function loadVoices() {
    voices = synth.getVoices();

    // Sprachen einfügen (priorisiert verfügbare, zeigt alle als Fallback)
    const availableLanguages = [...new Set(voices.map(v => v.lang))].sort();
    
    // Alle Sprachen als Optionen anzeigen
    languageSelect.innerHTML = '';
    
    // Zuerst verfügbare Sprachen
    availableLanguages.forEach(lang => {
        if (supportedLanguages[lang]) {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = supportedLanguages[lang] + ' ✓';
            languageSelect.appendChild(option);
        }
    });
    
    // Dann restliche Sprachen als Fallback-Optionen
    Object.entries(supportedLanguages).forEach(([code, name]) => {
        if (!availableLanguages.includes(code)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            languageSelect.appendChild(option);
        }
    });

    populateVoices();
}

function populateVoices() {
    const selectedLang = languageSelect.value;
    let filtered = selectedLang
        ? voices.filter(v => v.lang === selectedLang)
        : voices;

    // Falls keine Stimmen für die gewählte Sprache, Fallback auf ähnliche Sprachen
    if (selectedLang && filtered.length === 0) {
        const langBase = selectedLang.split('-')[0];
        filtered = voices.filter(v => v.lang.startsWith(langBase));
        
        if (filtered.length === 0) {
            // Nochmal Fallback auf Standardstimmen
            filtered = voices.filter(v => ['Google', 'Microsoft'].some(p => v.name.includes(p)));
        }
    }

    voiceSelect.innerHTML = '';
    
    if (filtered.length > 0) {
        // Premium/Qualitätsstimmen zuerst (Google, Microsoft)
        const premium = filtered.filter(v => 
            ['Google', 'Microsoft'].some(p => v.name.includes(p))
        );
        const standard = filtered.filter(v => 
            !['Google', 'Microsoft'].some(p => v.name.includes(v.name))
        );
        
        [...premium, ...standard].forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            const qualityBadge = ['Google', 'Microsoft'].some(p => voice.name.includes(p)) ? '⭐' : '';
            option.textContent = `${qualityBadge}${voice.name} (${voice.lang})`;
            option.dataset.quality = ['Google', 'Microsoft'].some(p => voice.name.includes(p)) ? 'premium' : 'standard';
            voiceSelect.appendChild(option);
        });
    } else {
        // Keine Stimmen verfügbar - zeige Standard-Fallback
        const option = document.createElement('option');
        option.textContent = 'Keine Stimme verfügbar für diese Sprache';
        option.disabled = true;
        option.selected = true;
        voiceSelect.appendChild(option);
        
        // Zeige alle verfügbaren Stimmen als Alternative
        if (voices.length > 0) {
            const altOption = document.createElement('option');
            altOption.textContent = '-- Alle verfügbaren Stimmen --';
            altOption.disabled = true;
            voiceSelect.appendChild(altOption);
            
            voices.slice(0, 10).forEach(voice => {
                const alt = document.createElement('option');
                alt.value = voice.name;
                alt.textContent = `${voice.name} (${voice.lang}) ⚠️`;
                voiceSelect.appendChild(alt);
            });
        }
    }

    // Automatische Auswahl der besten Qualität
    const premiumVoice = filtered.find(v => ['Google', 'Microsoft'].some(p => v.name.includes(p)));
    if (premiumVoice) {
        voiceSelect.value = premiumVoice.name;
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
        status.textContent = '▶ Fortgesetzt...';
        return;
    }

    const text = output.innerText.trim();
    if (!text) {
        status.textContent = '⚠ Bitte zuerst Text eingeben oder aufnehmen!';
        output.style.border = '2px solid #ff6b6b';
        setTimeout(() => output.style.border = '1px solid #ccc', 2000);
        return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const selectedVoice = voiceSelect.value;
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.lang = languageSelect.value || 'de-DE';
    utterance.rate = parseFloat(document.getElementById('rate').value);
    utterance.pitch = parseFloat(document.getElementById('pitch').value);
    utterance.volume = Math.min(parseFloat(document.getElementById('volume').value), 1);

    utterance.onstart = () => {
        status.textContent = '🔊 Liest vor...';
        speakButton.querySelector('img').src = 'https://cdn-icons-png.flaticon.com/512/149/149668.png';
        speakButton.style.backgroundColor = '#66bb6a';
    };
    utterance.onend = () => {
        status.textContent = '✅ Fertig.';
        speakButton.querySelector('img').src = 'https://cdn-icons-png.flaticon.com/512/744/744974.png';
        speakButton.style.backgroundColor = 'rgb(159, 159, 252)';
    };
    utterance.onerror = (e) => {
        status.textContent = '❌ Fehler: ' + e.error;
        speakButton.querySelector('img').src = 'https://cdn-icons-png.flaticon.com/512/744/744974.png';
        speakButton.style.backgroundColor = 'rgb(159, 159, 252)';
    };

    synth.speak(utterance);
});

// Pause / Resume
pauseButton.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        status.textContent = '⏸ Pausiert.';
        pauseButton.textContent = '▶ Fortsetzen';
        pauseButton.style.backgroundColor = '#ff9800';
    } else if (synth.paused) {
        synth.resume();
        status.textContent = '▶ Fortgesetzt...';
        pauseButton.textContent = '⏸ Pause';
        pauseButton.style.backgroundColor = '#4CAF50';
    }
});

// Stop
stopButton.addEventListener('click', () => {
    synth.cancel();
    status.textContent = '⏹ Gestoppt.';
    pauseButton.textContent = '⏸ Pause';
    pauseButton.style.backgroundColor = '#4CAF50';
    speakButton.querySelector('img').src = 'https://cdn-icons-png.flaticon.com/512/744/744974.png';
    speakButton.style.backgroundColor = 'rgb(159, 159, 252)';
});

// Text löschen
clearButton.onclick = function() {
    output.innerText = '';
    status.textContent = '';
    output.style.boxShadow = 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px';
};

// Initialisierung
loadVoices();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Live-Voice-Erkennung beim Laden
window.addEventListener('load', () => {
    console.log(`🎤 ${voices.length} Stimmen geladen`);
    status.textContent = `✅ ${voices.length} Stimmen verfügbar`;
    setTimeout(() => status.textContent = '', 3000);
});

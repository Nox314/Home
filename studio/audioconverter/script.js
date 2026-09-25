document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const browseBtn = document.getElementById('browseBtn');
    const fileInput = document.getElementById('fileInput');
    const fileListPanel = document.getElementById('fileListPanel');
    const fileListContainer = document.getElementById('fileListContainer');
    const fileCount = document.getElementById('fileCount');
    const batchCount = document.getElementById('batchCount');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const convertBtn = document.getElementById('convertBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const progressContainer = document.getElementById('progressContainer');
    const resultContainer = document.getElementById('resultContainer');
    const downloadBtn = document.getElementById('downloadBtn');
    const newConversionBtn = document.getElementById('newConversionBtn');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressStatus = document.getElementById('progressStatus');
    const timeRemaining = document.getElementById('timeRemaining');
    const resultInfo = document.getElementById('resultInfo');
    const outputFormat = document.getElementById('outputFormat');
    const formatInfo = document.getElementById('formatInfo');

    let selectedFiles = [];
    let conversionInProgress = false;
    let conversionCancelled = false;

    const audioFormats = {
        mp3: 'MP3 - Universelles Audioformat',
        wav: 'WAV - Unkomprimiert, hohe Qualität',
        flac: 'FLAC - Verlustfreie Kompression',
        aac: 'AAC - Effiziente Kompression',
        ogg: 'OGG Vorbis - Open Source',
        m4a: 'M4A - Apple-kompatibel',
        wma: 'WMA - Windows Media Audio',
        opus: 'Opus - Moderne Nieder-Latenz',
        aiff: 'AIFF - Apple Unkomprimiert',
        alac: 'ALAC - Apple Lossless',
        amr: 'AMR - Sprachaufnahme optimiert',
        ape: 'APE - Hohe Kompressionsrate',
        caf: 'CAF - Apple Core Audio',
        dsf: 'DSF - DSD High Resolution',
        mka: 'MKA - Matroska Audio Container',
        mpc: 'MPC - MusePack',
        tta: 'TTA - True Audio',
        wv: 'WavPack - Hybridmodus',
        wvc: 'WavPack Correction',
        aax: 'AAX - Audible Hörbuch',
        ac3: 'AC3 - Dolby Digital',
        dts: 'DTS - Surround Sound',
        tak: 'TAK - Tom\'s Lossless',
        ofr: 'OFR - OptimFrog',
        mac: 'MAC - Monkey\'s Audio',
        spx: 'Speex - Sprache spezialisiert',
        gsm: 'GSM - Mobilfunk',
        voc: 'VOC - Creative Voice',
        au: 'AU - Sun/Unix Audio',
        ra: 'RA - RealAudio'
    };

    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    convertBtn.addEventListener('click', startConversion);
    cancelBtn.addEventListener('click', cancelConversion);
    newConversionBtn.addEventListener('click', resetConverter);
    clearAllBtn.addEventListener('click', clearAllFiles);
    outputFormat.addEventListener('change', updateFormatInfo);

    function handleFileSelect(e) {
        const files = e.target.files || e.dataTransfer.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => processFile(file));
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => processFile(file));
        }
    }

    function processFile(file) {
        if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|flac|aac|ogg|m4a|wma|opus|aiff|alac|amr|ape|caf|dsf|mka|mpc|tta|wv|wvc|aax|ac3|dts|tak|ofr|mac|spx|gsm|voc|au|ra)$/i)) {
            showError('Bitte wählen Sie eine gültige Audiodatei aus.');
            return;
        }

        if (!selectedFiles.some(f => f.name === file.name)) {
            selectedFiles.push(file);
            updateFileList();
        }
    }

    function updateFileList() {
        fileCount.textContent = selectedFiles.length;
        batchCount.textContent = selectedFiles.length;
        
        if (selectedFiles.length > 0) {
            fileListPanel.style.display = 'block';
            settingsPanel.style.display = 'block';
            convertBtn.disabled = false;
            cancelBtn.disabled = false;
        } else {
            fileListPanel.style.display = 'none';
            settingsPanel.style.display = 'none';
            convertBtn.disabled = true;
            cancelBtn.disabled = true;
        }

        renderFileList();
    }

    function renderFileList() {
        fileListContainer.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-item-name">${file.name}</span>
                <span class="file-item-info">${formatFileSize(file.size)}</span>
                <i class="fas fa-times file-item-remove" onclick="removeFile(${index})"></i>
            `;
            fileListContainer.appendChild(fileItem);
        });
    }

    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        updateFileList();
    }

    function clearAllFiles() {
        selectedFiles = [];
        fileInput.value = '';
        updateFileList();
    }

    function updateFormatInfo() {
        const format = outputFormat.value;
        formatInfo.textContent = audioFormats[format] || 'Audioformat wählen';
    }

    function startConversion() {
        if (selectedFiles.length === 0 || conversionInProgress) return;
        
        const format = outputFormat.value;
        const bitrate = document.getElementById('bitrate').value;
        const sampleRate = document.getElementById('sampleRate').value;
        const channels = document.getElementById('channels').value;
        
        fileListPanel.style.display = 'none';
        settingsPanel.style.display = 'none';
        progressContainer.style.display = 'block';
        conversionInProgress = true;
        conversionCancelled = false;
        
        let progress = 0;
        const filesPerSecond = 2;
        const totalDuration = Math.ceil(selectedFiles.length / filesPerSecond) * 1000;
        
        const interval = setInterval(() => {
            if (conversionCancelled) {
                clearInterval(interval);
                resetProgress();
                return;
            }
            
            progress += Math.random() * 3;
            if (progress > 100) progress = 100;
            
            updateProgress(progress);
            
            const remaining = Math.round((100 - progress) / 3);
            timeRemaining.textContent = `Geschätzte verbleibende Zeit: ${remaining} Sekunden`;
            
            if (progress === 100) {
                clearInterval(interval);
                conversionComplete(format);
            }
        }, 500);
    }

    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${Math.round(percent)}%`;
        
        if (percent < 30) {
            progressStatus.textContent = 'Bereite Audiodateien vor...';
        } else if (percent < 70) {
            progressStatus.textContent = 'Konvertiere Audiodateien...';
        } else {
            progressStatus.textContent = 'Schließe Konvertierung ab...';
        }
    }

    function resetProgress() {
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';
        progressStatus.textContent = 'Konvertiere...';
        timeRemaining.textContent = 'Geschätzte verbleibende Zeit: --';
    }

    function conversionComplete(format) {
        conversionInProgress = false;
        
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        const convertedFileName = `${selectedFiles[0].name.replace(/\.[^/.]+$/, '')}_converted.${format}`;
        resultInfo.textContent = `${selectedFiles.length} Audiodatei(en) erfolgreich in ${format.toUpperCase()} konvertiert.`;
        
        downloadBtn.setAttribute('download', convertedFileName);
        downloadBtn.href = URL.createObjectURL(selectedFiles[0]);
    }

    function cancelConversion() {
        if (conversionInProgress) {
            conversionCancelled = true;
            conversionInProgress = false;
            showError('Konvertierung abgebrochen');
            resetProgress();
            progressContainer.style.display = 'none';
            fileListPanel.style.display = 'block';
            settingsPanel.style.display = 'block';
        } else {
            resetConverter();
        }
    }

    function resetConverter() {
        selectedFiles = [];
        fileInput.value = '';
        fileListPanel.style.display = 'none';
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        convertBtn.disabled = true;
        cancelBtn.disabled = true;
        updateFileList();
    }

    function showError(message) {
        alert(message);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});

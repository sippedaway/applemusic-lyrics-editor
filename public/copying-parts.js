function createCopyPartsPopup() {
    const popup = document.createElement('div');
    popup.className = 'syllable-popup active';
    popup.id = 'copyPartsPopup';

    popup.innerHTML = `
        <div class="popup-header">
            <h3>Select lyrics to copy</h3>
            <button class="popup-close" onclick="closeCopyPartsPopup()">&times;</button>
        </div>
        <p style="color: gray; margin-top: 0;">Use this feature to copy repeating parts, for example a chorus.<br>Select a range of lyrics to copy, and then set a new starting time for the copied part.<br><b>Note: </b>word timings will not work with copied parts.</p>
        <div id="lyrics-selection" style="max-height: 480px; overflow-y: auto;">
        </div>
        <div style="margin-top: 20px;">
            <button id="copyPartsContinue" class="copyparts-button" disabled>Continue</button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay active';
    overlay.id = 'copyPartsOverlay';

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    populateLyricsSelection();
    setupCopyPartsListeners();
}

function populateLyricsSelection() {
    const container = document.getElementById('lyrics-selection');
    const lines = Array.from(document.querySelectorAll('#linesContainer .line'));

    container.innerHTML = lines.map((line, index) => {
        const lyricInput = line.querySelector('input[type="text"]:not(.timestamp)');
        const lyricText = lyricInput ? lyricInput.value : '';
        return `
            <div class="syllable-word" data-index="${index}">
                <input type="checkbox" class="copy-select">
                <span class="word-text">${lyricText || '(empty)'}</span>
            </div>
        `;
    }).join('');
}

function setupCopyPartsListeners() {
    const container = document.getElementById('lyrics-selection');
    const continueBtn = document.getElementById('copyPartsContinue');
    let startIndex = -1;
    let endIndex = -1;

    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('copy-select')) {
            const checkboxes = Array.from(container.querySelectorAll('.copy-select'));
            const checkedIndexes = checkboxes
                .map((cb, i) => cb.checked ? i : -1)
                .filter(i => i !== -1);

            if (checkedIndexes.length === 0) {
                startIndex = endIndex = -1;
            } else {
                startIndex = Math.min(...checkedIndexes);
                endIndex = Math.max(...checkedIndexes);
            }

            checkboxes.forEach((cb, i) => {
                if (i >= startIndex && i <= endIndex) {
                    cb.checked = true;
                } else {
                    cb.checked = false;
                }
            });

            continueBtn.disabled = startIndex === -1;
        }
    });

    continueBtn.addEventListener('click', () => {
        showTimeSelectionPopup(startIndex, endIndex);
    });
}

function showTimeSelectionPopup(startIndex, endIndex) {
    const popup = document.getElementById('copyPartsPopup');
    popup.style.height = 'auto';
    popup.innerHTML = `
        <div class="popup-header">
            <h3>Set new starting time</h3>
            <button class="popup-close" onclick="closeCopyPartsPopup()">&times;</button>
        </div>
        <p style="color: gray; margin-top: 0;">Enter the new starting time for the copied lyrics part. The timestamps of all copied lines will be adjusted accordingly.</p>
        <div style="margin: 20px 0;">
            <input type="text" id="newStartTime" placeholder="MM:SS:MSC" style="padding: 8px; width: 200px;">
        </div>
        <span style="color: #666;">Format: 00:00, 0:00, 00:00:000, 0:00:000</span>
        <div>
            <button id="copyPartsDone" class="copyparts-button">Done</button>
        </div>
    `;

    document.getElementById('copyPartsDone').addEventListener('click', () => {
        const newStartTime = document.getElementById('newStartTime').value;
        if (validateTimestamp(newStartTime)) {
            duplicateLyricsPart(startIndex, endIndex, newStartTime);
            closeCopyPartsPopup();
        } else {
            alert('Please enter a valid timestamp (MM:SS:MSC)');
        }
    });
}

function validateTimestamp(timestamp) {

    const formats = [
        /^\d{1,2}:\d{2}$/,
        /^\d{1,2}:\d{2}:\d{1,3}$/
    ];

    if (!formats.some(f => f.test(timestamp))) {
        return false;
    }

    if (!timestamp.includes(':')) return false;
    if (timestamp.split(':').length === 2) {
        timestamp += ':000';
    }

    const parts = timestamp.split(':');
    if (parts[2].length < 3) {
        parts[2] = parts[2].padEnd(3, '0');
    }

    const [min, sec, ms] = parts.map(Number);
    return sec < 60 && ms < 1000;
}

function timeToMs(timeStr) {
    let [min, sec, ms = '000'] = timeStr.split(':');

    ms = ms.padEnd(3, '0');
    return (Number(min) * 60 * 1000) + (Number(sec) * 1000) + Number(ms);
}

function msToTime(ms) {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    const milliseconds = ms % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}

function duplicateLyricsPart(startIndex, endIndex, newStartTime) {
    const lines = Array.from(document.querySelectorAll('#linesContainer .line'));
    const selectedLines = lines.slice(startIndex, endIndex + 1);

    const originalStartTime = timeToMs(selectedLines[0].querySelector('.timestamp').value);
    const newStartTimeMs = timeToMs(newStartTime);
    const timeOffset = newStartTimeMs - originalStartTime;

    selectedLines.forEach(line => {
        const clone = line.cloneNode(true);

        const timestamp = clone.querySelector('.timestamp');
        const originalTime = timeToMs(timestamp.value);
        timestamp.value = msToTime(originalTime + timeOffset);

        const sublyrics = clone.querySelectorAll('.sublyric');
        sublyrics.forEach(sub => {
            const subTimestamp = sub.querySelector('.timestamp');
            if (subTimestamp) {
                const originalSubTime = timeToMs(subTimestamp.value);
                subTimestamp.value = msToTime(originalSubTime + timeOffset);
            }
        });

        const syllableBtn = clone.querySelector('.syllable-btn');
        if (syllableBtn) {
            const newSyllableBtn = syllableBtn.cloneNode(true);
            syllableBtn.parentNode.replaceChild(newSyllableBtn, syllableBtn);
            if (typeof setupSyllableButton === 'function') {
                setupSyllableButton(newSyllableBtn);
            }
        }

        const inputs = clone.querySelectorAll('input');
        inputs.forEach(input => {
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
        });

        document.getElementById('linesContainer').appendChild(clone);
    });

    if (typeof updatePreview === 'function') {
        updatePreview();
    }
    if (typeof saveProject === 'function') {
        autoSave();
    }
}

function closeCopyPartsPopup() {
    const popup = document.getElementById('copyPartsPopup');
    const overlay = document.getElementById('copyPartsOverlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
}

document.addEventListener('DOMContentLoaded', () => {

    const addLineButtons = ['addLineButton', 'addLineButtonalt'];

    addLineButtons.forEach(buttonId => {
        const addLineBtn = document.getElementById(buttonId);
        if (addLineBtn) {
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';

            const copyBtn = document.createElement('button');
            copyBtn.className = "copypartsbuttonalt";
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>Copy part';
            copyBtn.onclick = createCopyPartsPopup;

            addLineBtn.parentNode.insertBefore(buttonContainer, addLineBtn);
            buttonContainer.appendChild(addLineBtn);
            buttonContainer.appendChild(copyBtn);
        }
    });
});
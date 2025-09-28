function openSyllablesEditor(lineDiv) {

    const textInput = lineDiv.querySelector('.lyricText');
    const beginInput = lineDiv.querySelector('.timestamp.begin');

    if (!textInput || !beginInput) {
        console.error('Required inputs not found');
        return;
    }

    const text = textInput.value.trim();
    const lineBegin = beginInput.value.trim();

    if (!text || !lineBegin) {
        alert('Please enter lyrics text and begin timestamp first.');
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay active';

    const popup = document.createElement('div');
    popup.className = 'syllable-popup active';

    const header = document.createElement('div');
    header.className = 'popup-header';
    header.innerHTML = `
        <h3>Word Timings Editor</h3>
        <button class="popup-close">&times;</button>
    `;

    const words = text.split(/\s+/);
    const existingSyllables = lineDiv.dataset.syllables ? JSON.parse(lineDiv.dataset.syllables) : [];

    const wordsContainer = document.createElement('div');
    wordsContainer.style.marginTop = '20px';
    wordsContainer.style.marginBottom = '20px';

    const revertBtn = document.createElement('button');
    revertBtn.className = 'add-sub-button';
    revertBtn.style.marginBottom = '20px';
    revertBtn.innerHTML = '<i class="fas fa-undo"></i> Revert to default';
    revertBtn.onclick = () => {
        const totalDuration = lineDiv.querySelector('.timestamp.duration').value;
        if (!totalDuration || !isValidTimestamp(totalDuration)) {
            statusMsg.textContent = 'Please set a valid duration for the line first';
            return;
        }

        const totalTime = parseTimestampFlexible(totalDuration);
        const wordDuration = totalTime / words.length;

        wordElements.forEach((wordDiv, index) => {
            const beginInput = wordDiv.querySelector('.word-begin');
            const durationInput = wordDiv.querySelector('.word-duration');

            const wordBeginTime = index === 0 ? 
                parseTimestampFlexible(lineBegin) : 
                parseTimestampFlexible(lineBegin) + (index * wordDuration);

            beginInput.value = formatTimestamp(wordBeginTime);
            durationInput.value = formatTimestamp(wordDuration);
        });

        statusMsg.textContent = '';
    };

    const wordElements = [];
    words.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'syllable-word';

        const existingSyllable = existingSyllables[index] || {};
        const nextSyllable = existingSyllables[index + 1];

        let wordBegin = index === 0 ? lineBegin : (existingSyllable.begin || '');
        let wordDuration = '';

        if (existingSyllable.begin && existingSyllable.end) {
            const beginTime = parseTimestampFlexible(existingSyllable.begin);
            const endTime = parseTimestampFlexible(existingSyllable.end);
            wordDuration = formatTimestamp(endTime - beginTime);
        }

        wordDiv.innerHTML = `
            <span class="word-text">${word}</span>
            <div style="display: flex; gap: 10px; align-items: center;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 12px; color: #888">Begin</label>
                    <input type="text" class="word-begin" value="${wordBegin}" 
                        ${index === 0 ? 'readonly style="background: #222; color: #666;"' : ''} 
                        placeholder="M:SS:MSC">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 12px; color: #888">Duration</label>
                    <input type="text" class="word-duration" value="${wordDuration}" placeholder="M:SS:MSC">
                </div>
            </div>
        `;

        wordsContainer.appendChild(wordDiv);
        wordElements.push(wordDiv);
    });

    const statusMsg = document.createElement('div');
    statusMsg.style.color = '#f55';
    statusMsg.style.marginBottom = '20px';
    statusMsg.style.fontWeight = 'bold';

    const autoFixToggle = document.createElement('div');
    autoFixToggle.style.marginBottom = '20px';
    autoFixToggle.style.display = 'flex';
    autoFixToggle.style.alignItems = 'center';
    autoFixToggle.style.gap = '8px';

    const autoFixCheckbox = document.createElement('input');
    autoFixCheckbox.type = 'checkbox';
    autoFixCheckbox.id = 'autoFixToggle';
    autoFixCheckbox.checked = true;

    const autoFixLabel = document.createElement('label');
    autoFixLabel.htmlFor = 'autoFixToggle';
    autoFixLabel.textContent = 'Auto fix overlapping timestamps';
    autoFixLabel.style.color = '#aaa';
    autoFixLabel.style.fontSize = '14px';

    autoFixToggle.appendChild(autoFixCheckbox);
    autoFixToggle.appendChild(autoFixLabel);

    function updateWordTimings(startIndex) {
        if (!autoFixCheckbox.checked) return;

        for (let i = startIndex; i < wordElements.length; i++) {
            const currentWord = wordElements[i];
            const nextWord = wordElements[i + 1];
            if (!nextWord) break;

            const currentBegin = parseTimestampFlexible(currentWord.querySelector('.word-begin').value);
            const currentDuration = parseTimestampFlexible(currentWord.querySelector('.word-duration').value);
            const currentEnd = currentBegin + currentDuration;

            nextWord.querySelector('.word-begin').value = formatTimestamp(currentEnd);

            const nextWordDuration = nextWord.querySelector('.word-duration').value;
            if (isValidTimestamp(nextWordDuration)) {
                const nextDuration = parseTimestampFlexible(nextWordDuration);

                const originalNextEnd = parseTimestampFlexible(nextWord.querySelector('.word-begin').value) + nextDuration;
                const newNextDuration = originalNextEnd - currentEnd;
                if (newNextDuration > 0) {
                    nextWord.querySelector('.word-duration').value = formatTimestamp(newNextDuration);
                }
            }

            updateWordTimings(i + 1);
        }
    }

    const manuallySetDurations = new Set();

    wordElements.forEach((wordDiv, index) => {
        const durationInput = wordDiv.querySelector('.word-duration');
        const beginInput = wordDiv.querySelector('.word-begin');

        durationInput.addEventListener('input', () => {
            if (isValidTimestamp(durationInput.value)) {
                manuallySetDurations.add(index);
                updateWordTimings(index);
            }
        });
    });

    function updateWordTimings(changedIndex) {
        if (!autoFixCheckbox.checked) return;

        const totalDuration = lineDiv.querySelector('.timestamp.duration').value;
        if (!totalDuration || !isValidTimestamp(totalDuration)) return;

        const totalTime = parseTimestampFlexible(totalDuration);
        const changedWord = wordElements[changedIndex];
        const changedDuration = parseTimestampFlexible(changedWord.querySelector('.word-duration').value);

        const unmodifiedIndices = wordElements
            .map((_, i) => i)
            .filter(i => i !== changedIndex && !manuallySetDurations.has(i));

        if (unmodifiedIndices.length > 0) {

            const usedTime = Array.from(manuallySetDurations)
                .filter(i => i !== changedIndex)
                .reduce((sum, i) => {
                    const duration = parseTimestampFlexible(wordElements[i].querySelector('.word-duration').value);
                    return sum + duration;
                }, changedDuration);

            const remainingTime = totalTime - usedTime;
            const timePerUnmodifiedWord = remainingTime / unmodifiedIndices.length;

            let currentTime = parseTimestampFlexible(lineBegin);

            wordElements.forEach((wordDiv, i) => {
                const beginInput = wordDiv.querySelector('.word-begin');
                const durationInput = wordDiv.querySelector('.word-duration');

                if (i === 0) {

                    beginInput.value = lineBegin;
                } else {
                    beginInput.value = formatTimestamp(currentTime);
                }

                if (!manuallySetDurations.has(i) && i !== changedIndex) {
                    durationInput.value = formatTimestamp(timePerUnmodifiedWord);
                    currentTime += timePerUnmodifiedWord;
                } else {
                    const duration = parseTimestampFlexible(durationInput.value);
                    currentTime += duration;
                }
            });
        }
    }

    wordElements.forEach((wordDiv, index) => {
        const durationInput = wordDiv.querySelector('.word-duration');
        durationInput.addEventListener('input', () => {
            if (isValidTimestamp(durationInput.value)) {
                updateWordTimings(index);
            }
        });
    });

    if (!existingSyllables || existingSyllables.length === 0) {
        const totalDuration = lineDiv.querySelector('.timestamp.duration').value;
        if (totalDuration && isValidTimestamp(totalDuration)) {
            const totalTime = parseTimestampFlexible(totalDuration);
            const wordDuration = totalTime / words.length;

            wordElements.forEach((wordDiv, index) => {
                const beginInput = wordDiv.querySelector('.word-begin');
                const durationInput = wordDiv.querySelector('.word-duration');

                const wordBeginTime = index === 0 ? 
                    parseTimestampFlexible(lineBegin) : 
                    parseTimestampFlexible(lineBegin) + (index * wordDuration);

                beginInput.value = formatTimestamp(wordBeginTime);
                durationInput.value = formatTimestamp(wordDuration);
            });
        }
    }

    const applyBtn = document.createElement('button');
    applyBtn.className = 'add-sub-button';
    applyBtn.textContent = 'Apply Changes';
    applyBtn.onclick = () => validateAndSave();

    popup.appendChild(header);
    popup.appendChild(revertBtn);
    popup.appendChild(autoFixToggle);
    popup.appendChild(wordsContainer);
    popup.appendChild(statusMsg);
    popup.appendChild(applyBtn);

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
    };

    function validateAndSave() {
        statusMsg.textContent = '';
        const syllables = [];
        let lastEndTime = 0;

        function roundTimestamps(time1, time2) {
            const diff = Math.abs(time1 - time2);
            if (diff < 0.01) { 
                return Math.max(time1, time2);
            }
            return time1;
        }

        for (let i = 0; i < words.length; i++) {
            const wordDiv = wordElements[i];
            const beginInput = wordDiv.querySelector('.word-begin');
            const durationInput = wordDiv.querySelector('.word-duration');

            const begin = beginInput.value.trim();
            const duration = durationInput.value.trim();

            if (!begin || !duration) {
                statusMsg.textContent = `Please fill in all timestamps for word "${words[i]}"`;
                return;
            }

            if (!isValidTimestamp(begin) || !isValidTimestamp(duration)) {
                statusMsg.textContent = `Invalid timestamp format for word "${words[i]}"`;
                return;
            }

            const beginTime = parseTimestampFlexible(begin);
            const durationTime = parseTimestampFlexible(duration);
            const endTime = beginTime + durationTime;

            const adjustedBeginTime = i > 0 ? roundTimestamps(beginTime, lastEndTime) : beginTime;

            if (i > 0 && adjustedBeginTime < lastEndTime) {
                statusMsg.textContent = `Word "${words[i]}" begins before previous word ends`;
                return;
            }

            syllables.push({
                text: words[i],
                begin: i > 0 ? formatTimestamp(adjustedBeginTime) : begin,
                end: formatTimestamp(endTime)
            });

            lastEndTime = endTime;
        }

        lineDiv.dataset.syllables = JSON.stringify(syllables);
        updatePreview();
        autoSave();
        closeBtn.click();
    }
}
function parseTimestamp(ts) {
    if (!ts) return 0;
    const parts = ts.split(':').map(p => parseFloat(p));
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 60 + parts[1] + (parts[2] / 1000);
    }
    return 0;
}

function getLyricsData() {
    const lines = document.querySelectorAll('#linesContainer .line');
    let data = [];
    lines.forEach(line => {
        const begin = line.querySelector('.timestamp.begin').value.trim();
        const duration = line.querySelector('.timestamp.duration').value.trim();
        const beginTime = parseTimestampFlexible(begin);
        const durationTime = parseTimestampFlexible(duration);
        const end = formatTimestamp(beginTime + durationTime);
        const text = line.querySelector('.lyricText').value;
        const position = line.querySelector('.align-btn.active').dataset.position;
        const sublyrics = Array.from(line.querySelectorAll('.sublyric')).map(sub => {
            const subBegin = sub.querySelector('.timestamp.begin').value.trim();
            const subDuration = sub.querySelector('.timestamp.duration').value.trim();
            const subBeginTime = parseTimestampFlexible(subBegin);
            const subDurationTime = parseTimestampFlexible(subDuration);
            return {
                begin: subBegin,
                end: formatTimestamp(subBeginTime + subDurationTime),
                text: sub.querySelector('.lyricText').value
            };
        });
        const syllables = line.dataset.syllables ? JSON.parse(line.dataset.syllables) : [];
        const isBackground = line.dataset.isBackground === 'true';
        data.push({
            begin,
            end,
            text,
            position,
            sublyrics,
            syllables,
            isBackground
        });
    });

    const themeData = window.getThemeData?.();
    if (themeData) {
        data.push({
            type: 'theme',
            settings: themeData
        });
    }

    return data;
}

function updatePreview() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';
    previewData = [];

    let lyricTooltip = document.getElementById('lyricTooltip');
    if (!lyricTooltip) {
        lyricTooltip = document.createElement('div');
        lyricTooltip.id = 'lyricTooltip';
        lyricTooltip.style.position = 'fixed';
        lyricTooltip.style.pointerEvents = 'none';
        lyricTooltip.style.background = '#222';
        lyricTooltip.style.color = '#fff';
        lyricTooltip.style.padding = '7px 13px';
        lyricTooltip.style.borderRadius = '8px';
        lyricTooltip.style.fontSize = '14px';
        lyricTooltip.style.boxShadow = '0 2px 10px rgba(0,0,0,0.4)';
        lyricTooltip.style.zIndex = 9999;
        lyricTooltip.style.display = 'none';
        document.body.appendChild(lyricTooltip);
    }

    const data = getLyricsData();

    const validLyrics = data.filter(item => 
        item && 
        typeof item === 'object' && 
        typeof item.text === 'string' &&
        item.type !== 'theme'
    );

    validLyrics.forEach(item => {
        const lineDiv = document.createElement('div');

        if (item.isBackground) {
            lineDiv.classList.add('preview-sublyric');
        } else {
            lineDiv.className = 'preview-line';
        }

        lineDiv.style.cursor = 'pointer';

        lineDiv.addEventListener('click', () => {
            const startTime = parseTimestamp(item.begin);
            startPlayback(startTime);

            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && audioPlayer.src && !audioPlayer.paused) {
                audioPlayer.pause();
            }
            if (audioPlayer && audioPlayer.src) {
                audioPlayer.currentTime = startTime;
                audioPlayer.play();
            }
        });

        if (item.position === 'right') {
            lineDiv.classList.add('right-lyric');
        } else {
            lineDiv.classList.add('left-lyric');
        }

        let allLetters = [];
        let wordContainers = [];

        const chars = item.text.split('');
        let currentWord = document.createElement('span');
        currentWord.className = 'preview-word';
        let currentWordLetters = [];

        const letterClass = item.isBackground ? 'preview-sublyric-letter' : 'preview-letter';
        const wordClass = 'preview-word';

        const words = item.text.split(/\s+/);

        words.forEach((word, wordIndex) => {
            const match = word.match(/^(\[)?(.+?)(\])?([^\w\*]+)?$/i);

            let openingBracket = match?.[1] || '';
            let wordCore = match?.[2] || '';
            let closingBracket = match?.[3] || '';
            let trailingPunct = match?.[4] || '';

            const cleanWord = wordCore.toLowerCase();
            const isBracketed = openingBracket === '[' && closingBracket === ']';
            const isNWord = cleanWord === 'n*';
            const isFWord = cleanWord === 'f*';
            const isAlwaysRedacted = isNWord || isFWord;
            const shouldCensor = isAlwaysRedacted || (isBracketed && window.lyricsCensorEnabled);

            if (shouldCensor) {
                const replacementDiv = document.createElement('div');
                replacementDiv.textContent =
                    isNWord ? 'N word' :
                    isFWord ? 'F word' :
                    '***' + (trailingPunct || '');

                replacementDiv.style.display = 'inline-block';
                replacementDiv.style.backgroundColor = '#333';
                replacementDiv.style.color = 'gray';
                replacementDiv.style.padding = '2px 6px';
                replacementDiv.style.borderRadius = '4px';
                replacementDiv.style.margin = '0 2px';
                replacementDiv.className = wordClass + ' redacted-word';

                lineDiv.appendChild(replacementDiv);
                wordContainers.push({ container: replacementDiv, letters: [] });
                allLetters.push(replacementDiv);
            } else {
                const wordSpan = document.createElement('span');
                wordSpan.className = wordClass;
                const letterSpans = [];

                const visibleWord = wordCore + (trailingPunct || '');
                for (const char of visibleWord) {
                    const letterSpan = document.createElement('span');
                    letterSpan.className = letterClass;
                    letterSpan.textContent = char;
                    wordSpan.appendChild(letterSpan);
                    letterSpans.push(letterSpan);
                    allLetters.push(letterSpan);
                }

                wordContainers.push({ container: wordSpan, letters: letterSpans });
                lineDiv.appendChild(wordSpan);
            }

            if (wordIndex < words.length - 1) {
                lineDiv.appendChild(document.createTextNode(' '));
            }
        });

        if (currentWordLetters.length > 0) {
            if (item.text.trim().split(' ').length === 1) {
                currentWord.classList.add('single-word');
            }
            wordContainers.push({ container: currentWord, letters: currentWordLetters });
            lineDiv.appendChild(currentWord);
        }

        const sublyricsContainer = document.createElement('div');
        sublyricsContainer.className = 'sublyrics-container';

        const subLyricsData = item.sublyrics?.map(sub => {
            const subDiv = document.createElement('div');
            subDiv.className = 'preview-sublyric';

            let subLetters = [];
            const words = sub.text.split(' ');

            words.forEach((word, i) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'preview-word';

                [...word].forEach(char => {
                    const letterSpan = document.createElement('span');
                    letterSpan.className = 'preview-letter';
                    letterSpan.textContent = char;
                    wordSpan.appendChild(letterSpan);
                    subLetters.push(letterSpan);
                });

                subDiv.appendChild(wordSpan);
                if (i < words.length - 1) subDiv.appendChild(document.createTextNode(' '));
            });

            sublyricsContainer.appendChild(subDiv);

            return {
                begin: parseTimestamp(sub.begin),
                end: parseTimestamp(sub.end),
                element: subDiv,
                letters: subLetters
            };
        }) || [];

        lineDiv.appendChild(sublyricsContainer);

        lineDiv.addEventListener('mouseenter', (e) => {
            let html = `<b>${item.begin} - ${item.end}</b>`;
            if (item.syllables && item.syllables.length > 0) {
                html += `<br><span style="color:#aaa;">Word timings:</span><br>`;
                html += item.syllables.map(syl =>
                    `<span style="white-space:nowrap;">${syl.text}: <span style="color:#0ff">${syl.begin}</span> - <span style="color:#0ff">${syl.end}</span></span>`
                ).join('<br>');
            }
            lyricTooltip.innerHTML = html;
            lyricTooltip.style.display = 'block';
        });

        lineDiv.addEventListener('mousemove', (e) => {
            lyricTooltip.style.left = (e.clientX + 16) + 'px';
            lyricTooltip.style.top = (e.clientY + 8) + 'px';
        });

        lineDiv.addEventListener('mouseleave', () => {
            lyricTooltip.style.display = 'none';
        });

        previewContainer.appendChild(lineDiv);
        const beginTime = parseTimestamp(item.begin);
        const endTime = parseTimestamp(item.end);

        previewData.push({
            begin: beginTime,
            end: endTime,
            text: item.text,
            letterSpans: allLetters,
            wordContainers: wordContainers,
            element: lineDiv,
            sublyrics: subLyricsData,
            syllables: item.syllables || []
        });

        const lineLetters = previewData[previewData.length - 1].letterSpans;

if (item.syllables && item.syllables.length > 0) {
    let currentLetterIndex = 0;
    item.syllables.forEach(syl => {
        const sylLength = syl.text.length;

        syl.letterIndexes = [];
        for (let i = 0; i < sylLength; i++) {
            if (lineLetters[currentLetterIndex]) {
                syl.letterIndexes.push(currentLetterIndex);
            }
            currentLetterIndex++;
        }
    });
}
    });
    updateTimeDisplay(0);
}

let lastFinishedIndex = -1;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function updateTimeDisplay(currentTime) {
    const timeDisplay = document.getElementById('timeDisplay');
    const maxEnd = Math.max(...previewData.map(line => line.end));
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(maxEnd)}`;
}

function updatePlayback() {
    const currentTime = (performance.now() / 1000) - playStartTime;
    let maxEnd = 0;

    updateTimeDisplay(currentTime);

    previewData.forEach((line, index) => {
    if (line.end > maxEnd) maxEnd = line.end;

    if (line.isBackground) {
        const isActive = currentTime >= line.begin && currentTime <= line.end + 0.4;

        line.element.classList.toggle('active', isActive);
        line.element.classList.toggle('visible', isActive);

        line.element.classList.toggle('finished', currentTime >= line.end + 0.4);

        line.letterSpans.forEach(letter => {
            if (isActive) {
                letter.classList.add('active');
            } else {
                letter.classList.remove('active');
            }
        });

        line.sublyrics?.forEach(sub => {
            const subIsVisible =
                (currentTime >= line.begin && currentTime <= line.end + 0.4) ||
                (currentTime >= sub.begin && currentTime <= sub.end + 0.4);

            sub.element.classList.toggle('visible', subIsVisible);
            sub.element.classList.toggle('active', currentTime >= sub.begin);

            const subLetterDuration = (sub.end - sub.begin) / sub.letters.length;
            sub.letters.forEach((letter, idx) => {
                if (currentTime >= sub.begin + idx * subLetterDuration) {
                    letter.classList.add('active');
                } else {
                    letter.classList.remove('active');
                }
            });
        });

        return;
    }

    if (currentTime < line.begin) {
        line.letterSpans.forEach(span => span.classList.remove('active'));
        line.wordContainers.forEach(wordObj => wordObj.container.classList.remove('finished'));
        line.element.classList.remove('active', 'finished');
    } else if (currentTime >= line.end + 0.4) {
        const allSublyricsFinished = line.sublyrics?.every(sub => currentTime >= sub.end) ?? true;
        if (allSublyricsFinished) {
            line.element.classList.remove('active');
            line.element.classList.add('finished');
            line.letterSpans.forEach(span => span.classList.add('active'));
            line.wordContainers.forEach(wordObj => wordObj.container.classList.add('finished'));
        }
    } else if (currentTime >= line.begin) {
        line.element.classList.add('active');
        line.element.classList.remove('finished');

        if (line.syllables && line.syllables.length > 0) {
            handleSyllableLine(line, currentTime);
        } else {
            const letterDuration = (line.end - line.begin) / line.letterSpans.length;
            line.letterSpans.forEach((span, idx) => {
                if (currentTime >= line.begin + idx * letterDuration) {
                    span.classList.add('active');
                } else {
                    span.classList.remove('active');
                }
            });

            line.wordContainers.forEach(wordObj => {
                if (wordObj.letters.every(letter => letter.classList.contains('active'))) {
                    wordObj.container.classList.add('finished');
                }
            });
        }
    }

    line.sublyrics?.forEach(sub => {
        if (
            (currentTime >= line.begin && currentTime <= line.end + 0.4) ||
            (currentTime >= sub.begin && currentTime <= sub.end + 0.4)
        ) {
            sub.element.classList.add('visible');

            if (currentTime >= sub.begin) {
                sub.element.classList.add('active');

                const subLetterDuration = (sub.end - sub.begin) / sub.letters.length;
                sub.letters.forEach((letter, idx) => {
                    if (currentTime >= sub.begin + idx * subLetterDuration) {
                        letter.classList.add('active');
                    }
                });
            }
        } else {
            sub.element.classList.remove('visible', 'active');
            sub.letters.forEach(letter => letter.classList.remove('active'));
        }
    });
});

    const firstActive = previewData.find(line =>
        line.element.classList.contains('active')
    );
    if (firstActive) {
        const currentElement = firstActive.element;
        const container = document.getElementById('previewContainer');
        const syncButton = document.getElementById('toggleSync');
        if (syncButton.classList.contains('active')) {
            const offsetTop = currentElement.offsetTop - 50;
            container.style.transform = `translateY(-${offsetTop}px)`;
        }
    }

    if (currentTime < maxEnd) {
        playRequestId = requestAnimationFrame(updatePlayback);
    } else {
        cancelAnimationFrame(playRequestId);
        isPlaying = false;
    }
}

function startPlayback(startTime = 0) {
    updatePreview();
    playStartTime = (performance.now() / 1000) - startTime;
    isPlaying = true;
    if (playRequestId) cancelAnimationFrame(playRequestId);
    updateTimeDisplay(startTime);
    document.getElementById('stopButton').classList.add('active');
    playRequestId = requestAnimationFrame(updatePlayback);
}

function stopPlayback() {
    if (playRequestId) {
        cancelAnimationFrame(playRequestId);
        playRequestId = null;
    }
    isPlaying = false;
    document.getElementById('stopButton').classList.remove('active');

    previewData.forEach(line => {
        line.letterSpans.forEach(span => span.classList.remove('active'));
        line.wordContainers.forEach(wordObj => wordObj.container.classList.remove('finished'));
        line.element.classList.remove('active', 'finished');

        line.sublyrics?.forEach(sub => {
            sub.element.classList.remove('visible', 'active');
            sub.letters.forEach(letter => letter.classList.remove('active'));
        });
    });

    document.querySelectorAll('.waiting-dots').forEach(dots => dots.remove());
    updateTimeDisplay(0);
}

document.getElementById('toggleSync').addEventListener('click', function () {
    this.classList.toggle('active');
    stopPlayback();
    const container = document.getElementById('previewContainer');
    if (!this.classList.contains('active')) {
        container.style.transform = '';
    }
});

function handleSyllableLine(line, currentTime) {

line.letterSpans.forEach(span => span.classList.remove('active'));
line.wordContainers.forEach(wordObj => wordObj.container.classList.remove('finished'));

const processedWords = new Set();

line.syllables.forEach((syllable, syllableIndex) => {
  const syllableBegin = parseTimestamp(syllable.begin);
  const syllableEnd = parseTimestamp(syllable.end);

  if (currentTime < syllableBegin) return;

  const words = line.text.trim().split(/\s+/);
  const currentWord = syllableIndex < words.length ? words[syllableIndex] : null;

  if (!currentWord) return;

  const wordContainer = line.wordContainers[syllableIndex];
  if (!wordContainer) return;

  const wordLetters = wordContainer.letters;
  const wordDuration = syllableEnd - syllableBegin;

  if (wordLetters.length <= 0 || wordDuration <= 0) return;

  const letterDuration = wordDuration / wordLetters.length;

  wordLetters.forEach((letter, letterIndex) => {
    const letterTiming = syllableBegin + (letterIndex * letterDuration);

    if (currentTime >= letterTiming) {
      letter.classList.add('active');
    }
  });

  if (currentTime >= syllableEnd) {
    wordContainer.container.classList.add('finished');
    processedWords.add(syllableIndex);
  }
});

line.wordContainers.forEach((wordObj, wordIndex) => {
  if (!processedWords.has(wordIndex) && line.syllables[wordIndex]) {

  } else if (!line.syllables[wordIndex]) {

    const lineBegin = parseTimestamp(line.begin);
    const lineEnd = parseTimestamp(line.end);
    const wordCount = line.wordContainers.length;
    const wordDuration = (lineEnd - lineBegin) / wordCount;

    const wordBegin = lineBegin + (wordIndex * wordDuration);
    const wordEnd = wordBegin + wordDuration;

    if (currentTime >= wordBegin) {
      const letterDuration = wordDuration / wordObj.letters.length;

      wordObj.letters.forEach((letter, letterIndex) => {
        if (currentTime >= wordBegin + (letterIndex * letterDuration)) {
          letter.classList.add('active');
        }
      });

      if (currentTime >= wordEnd) {
        wordObj.container.classList.add('finished');
      }
    }
  }
});
}
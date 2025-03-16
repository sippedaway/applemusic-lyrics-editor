function parseTimestamp(ts) {
    if (!ts) return 0;
    const parts = ts.split(':').map(p => parseFloat(p));
    if (parts.length === 2) {

      return parts[0]*60 + parts[1];
    } else if (parts.length === 3) {

      return parts[0]*60 + parts[1] + (parts[2] / 1000);
    }
    return 0;
  }

  function getLyricsData() {
      const lines = document.querySelectorAll('#linesContainer .line');
      let data = [];
      lines.forEach(line => {
        const begin = line.querySelector('.timestamp.begin').value.trim();
        const end = line.querySelector('.timestamp.end').value.trim();
        const text = line.querySelector('.lyricText').value;
        const position = line.querySelector('.align-btn.active').dataset.position;
        const sublyrics = Array.from(line.querySelectorAll('.sublyric')).map(sub => ({
          begin: sub.querySelector('.timestamp.begin').value.trim(),
          end: sub.querySelector('.timestamp.end').value.trim(),
          text: sub.querySelector('.lyricText').value
        }));
        data.push({ begin, end, text, position, sublyrics });
      });
      return data;
  }

function updatePreview() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';
    previewData = [];

    const data = getLyricsData();
    data.forEach(item => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'preview-line';
      lineDiv.style.cursor = 'pointer';
      lineDiv.addEventListener('click', () => {
        startPlayback(parseTimestamp(item.begin));
      });
      if(item.position === 'right') {
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

      chars.forEach(char => {
        if (char === ' ') {
          if (currentWordLetters.length > 0) {
            wordContainers.push({ container: currentWord, letters: currentWordLetters });
            lineDiv.appendChild(currentWord);
            currentWord = document.createElement('span');
            currentWord.className = 'preview-word';
            if (item.text.trim().split(' ').length === 1) {
              currentWord.classList.add('single-word');
            }
            currentWordLetters = [];
          }
          lineDiv.appendChild(document.createTextNode(' '));
        } else {

          const letterSpan = document.createElement('span');
          letterSpan.className = 'preview-letter';
          letterSpan.textContent = char;
          currentWord.appendChild(letterSpan);
          currentWordLetters.push(letterSpan);
          allLetters.push(letterSpan);
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

      previewContainer.appendChild(lineDiv);
      const beginTime = parseTimestamp(item.begin);
      const endTime = parseTimestamp(item.end);
      previewData.push({ begin: beginTime, end: endTime, letterSpans: allLetters, wordContainers: wordContainers, element: lineDiv, sublyrics: subLyricsData });
    });
    updateTimeDisplay(0);
}

  let lastFinishedIndex = -1; 

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updateTimeDisplay(currentTime) {
  const timeDisplay = document.getElementById('timeDisplay');
  const maxEnd = Math.max(...previewData.map(line => line.end));
  timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(maxEnd)}`;
}

function updatePlayback() {
  const currentTime = (performance.now() / 1000) - playStartTime;
  let maxEnd = 0;
  let currentActiveLine = null;

  updateTimeDisplay(currentTime);

  previewData.forEach((line, index) => {
    const nextLine = previewData[index + 1];
    if (nextLine && currentTime >= nextLine.begin - 0.7) {  
      const dotsElement = line.element.nextElementSibling;
      if (dotsElement?.classList.contains('waiting-dots')) {
        dotsElement.classList.add('disappearing');

        setTimeout(() => dotsElement.remove(), 500);
      }
    }
  });

  previewData.forEach((line, index) => {
    if (line.end > maxEnd) maxEnd = line.end;
    const totalLetters = line.letterSpans.length;
    const letterDuration = (line.end - line.begin) / totalLetters;

    if (currentTime < line.begin) {

      line.letterSpans.forEach(span => span.classList.remove('active'));
      line.wordContainers.forEach(wordObj => wordObj.container.classList.remove('finished'));
      line.element.classList.remove('active', 'finished');
    } else if (currentTime >= line.end + 0.4) { 

      line.letterSpans.forEach(span => span.classList.remove('active'));
      line.element.classList.remove('active');
      line.element.classList.add('finished');
      line.wordContainers.forEach(wordObj => wordObj.container.classList.add('finished'));

      const nextLine = previewData[index + 1];
      if (nextLine && (nextLine.begin - line.end) > 5 && currentTime < nextLine.begin) {
        if (!line.element.nextElementSibling?.classList.contains('waiting-dots')) {
          const dotsDiv = document.createElement('div');
          dotsDiv.className = 'waiting-dots';

          for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'waiting-dot';
            dotsDiv.appendChild(dot);
          }

          line.element.parentNode.insertBefore(dotsDiv, line.element.nextSibling);

          dotsDiv.offsetHeight;
          dotsDiv.classList.add('visible');

          const waitTime = nextLine.begin - line.end;
          const dotStartTimes = [
            line.end + (waitTime * 0.15),
            line.end + (waitTime * 0.3),
            line.end + (waitTime * 0.45)
          ];

          const dots = dotsDiv.children;
          for (let i = 0; i < dots.length; i++) {
            if (currentTime >= dotStartTimes[i]) {
              dots[i].classList.add('active');
            }
          }
        } else {

          const dots = line.element.nextElementSibling.children;
          const waitTime = nextLine.begin - line.end;
          const dotStartTimes = [
            line.end + (waitTime * 0.15),
            line.end + (waitTime * 0.3),
            line.end + (waitTime * 0.45)
          ];

          for (let i = 0; i < dots.length; i++) {
            if (currentTime >= dotStartTimes[i]) {
              dots[i].classList.add('active');
            }
          }
        }
      }
    } else if (currentTime >= line.begin) {

      if (index === 0 || currentTime >= previewData[index - 1].end) {
        line.element.classList.add('active');
        currentActiveLine = index;
      }

      line.letterSpans.forEach((span, idx) => {
        if (currentTime >= line.begin + (idx + 1) * letterDuration) {
          span.classList.add('active');
        } else {
          span.classList.remove('active');
        }
      });

      line.wordContainers.forEach(wordObj => {
        const allActive = wordObj.letters.every(letter => 
          letter.classList.contains('active'));
        if (allActive) {
          wordObj.container.classList.add('finished');
        }
      });
    }

    line.sublyrics?.forEach(sub => {
      if (currentTime >= line.begin && currentTime < line.end + 0.4) {  
        sub.element.classList.add('visible');

        if (currentTime >= sub.begin) {  
          sub.element.classList.add('active');

          const subLetterDuration = (sub.end - sub.begin) / sub.letters.length;
          sub.letters.forEach((letter, idx) => {
            if (currentTime >= sub.begin + (idx + 1) * subLetterDuration) {
              letter.classList.add('active');
            }
          });
        }
      } else {
        sub.element.classList.remove('visible');  
      }
    });
  });

  if (currentActiveLine !== null && previewData[currentActiveLine]) {
    const currentElement = previewData[currentActiveLine].element;
    const container = document.getElementById('previewContainer');
    const offsetTop = currentElement.offsetTop - (container.clientHeight * 0.4);
    container.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
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
  playRequestId = requestAnimationFrame(updatePlayback);
}

function stopPlayback() {
  if (playRequestId) {
    cancelAnimationFrame(playRequestId);
    playRequestId = null;
  }
  isPlaying = false;

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
let previewData = [];  
let isPlaying = false;
let playStartTime = 0;
let playRequestId = null;

function autoSave() {
    try {
        const data = getLyricsData();
        localStorage.setItem('lyricsProject', JSON.stringify(data));
    } catch (e) {
        console.error("Error saving to localStorage:", e);
        alert("Failed to auto-save. Your browser's storage might be full.");
    }
}

function loadFromCookie() {
    try {
        const data = localStorage.getItem('lyricsProject');
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error("Error loading from localStorage:", e);
    }
    return [];
}

function populateEditor(data) {
    const container = document.getElementById('linesContainer');
    container.innerHTML = '';
    data.forEach(item => {
      addLine(item.begin, item.end, item.text, item.position, item.sublyrics, item.syllables);  
    });
  }

  function addLine(begin = '', end = '', text = '', position = 'left', sublyrics = [], syllables = []) {
      const container = document.getElementById('linesContainer');
      const lineDiv = document.createElement('div');
      lineDiv.className = 'line';
      lineDiv.draggable = true;

      const grabHandle = document.createElement('div');
      grabHandle.className = 'grab-handle';
      grabHandle.innerHTML = '⋮⋮';  

      lineDiv.addEventListener('dragstart', (e) => {
          e.target.classList.add('dragging');
      });

      lineDiv.addEventListener('dragend', (e) => {
          e.target.classList.remove('dragging');
          updatePreview();
          autoSave();
      });

      const mainLineDiv = document.createElement('div');
      mainLineDiv.className = 'main-line';

      mainLineDiv.insertBefore(grabHandle, mainLineDiv.firstChild);

      const beginInput = document.createElement('input');
      beginInput.type = 'text';
      beginInput.placeholder = 'Begin (M:S:MS)';
      beginInput.className = 'timestamp begin';
      beginInput.value = begin;
      beginInput.addEventListener('input', () => { updatePreview(); autoSave(); });

      const endInput = document.createElement('input');
      endInput.type = 'text';
      endInput.placeholder = 'End (M:S:MS)';
      endInput.className = 'timestamp end';
      endInput.value = end;
      endInput.addEventListener('input', () => { updatePreview(); autoSave(); });

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'Lyric text';
      textInput.className = 'lyricText';
      textInput.style.flex = "1";
      textInput.value = text;
      textInput.addEventListener('input', () => { updatePreview(); autoSave(); });

      const alignmentButtons = document.createElement('div');
    alignmentButtons.className = 'alignment-buttons';

    const leftBtn = document.createElement('button');
    leftBtn.className = 'align-btn' + (position === 'left' ? ' active' : '');
    leftBtn.innerHTML = '<i class="fas fa-align-left"></i>';
    leftBtn.dataset.position = 'left';

    const rightBtn = document.createElement('button');
    rightBtn.className = 'align-btn' + (position === 'right' ? ' active' : '');
    rightBtn.innerHTML = '<i class="fas fa-align-right"></i>';
    rightBtn.dataset.position = 'right';

    [leftBtn, rightBtn].forEach(btn => {
        btn.addEventListener('click', (e) => {

            alignmentButtons.querySelectorAll('.align-btn').forEach(b => 
                b.classList.remove('active'));

            btn.classList.add('active');
            updatePreview();
            autoSave();
        });
    });

      const delButton = document.createElement('button');
      delButton.textContent = 'Delete';
        delButton.className = 'delete-line';
      delButton.addEventListener('click', () => {
        container.removeChild(lineDiv);
        updatePreview();
        autoSave();
      });

      alignmentButtons.appendChild(leftBtn);
    alignmentButtons.appendChild(rightBtn)

      mainLineDiv.appendChild(beginInput);
      mainLineDiv.appendChild(endInput);
      mainLineDiv.appendChild(textInput);
      mainLineDiv.appendChild(alignmentButtons);
      mainLineDiv.appendChild(delButton);

      const addSubButton = document.createElement('button');
      addSubButton.textContent = '+';
      addSubButton.className = 'add-sub-button';
      addSubButton.title = 'Add background lyric';
      addSubButton.addEventListener('click', () => {
        addSublyric(lineDiv);
      });


      const syllableButton = document.createElement('button');
      syllableButton.className = 'syllable-btn';
      syllableButton.title = 'Edit word timings';
      syllableButton.innerHTML = '<i class="fas fa-microphone"></i>';
      syllableButton.addEventListener('click', () => {
        openSyllableEditor(lineDiv, text, syllables);
      });

      mainLineDiv.appendChild(syllableButton);
      mainLineDiv.appendChild(addSubButton);
      lineDiv.appendChild(mainLineDiv);

      sublyrics.forEach(sub => {
        addSublyric(lineDiv, sub.begin, sub.end, sub.text);
      });

      if (syllables && syllables.length > 0) {
        lineDiv.dataset.syllables = JSON.stringify(syllables);
      }

      container.appendChild(lineDiv);
  }

  function addSublyric(parentLine, begin = '', end = '', text = '') {
      const subGroup = document.createElement('div');
      subGroup.className = 'sublyric-group';

      const arrowLabelDiv = document.createElement('div');
      arrowLabelDiv.className = 'arrow-label';

      const arrow = document.createElement('i');
      arrow.className = 'fas fa-arrow-down';
      arrow.style.fontSize = '12px';

      const label = document.createElement('span');
      label.textContent = 'Background lyric';
      label.style.fontSize = '12px';
      label.style.marginLeft = '5px';
      label.style.color = '#666';

      arrowLabelDiv.appendChild(arrow);
      arrowLabelDiv.appendChild(label);

      const subDiv = document.createElement('div');
      subDiv.className = 'sublyric';

      const beginInput = document.createElement('input');
      beginInput.type = 'text';
      beginInput.placeholder = 'Begin';
      beginInput.className = 'timestamp begin';
      beginInput.value = begin;
      beginInput.style.width = '70px';

      const endInput = document.createElement('input');
      endInput.type = 'text';
      endInput.placeholder = 'End';
      endInput.className = 'timestamp end';
      endInput.value = end;
      endInput.style.width = '70px';

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'Background lyric';
      textInput.className = 'lyricText';
      textInput.value = text;
      textInput.style.flex = '1';

      const delButton = document.createElement('button');
      delButton.textContent = 'X';
      delButton.className = 'delete-sub';

      [beginInput, endInput, textInput].forEach(input => {
        input.addEventListener('input', () => { updatePreview(); autoSave(); });
      });

      delButton.addEventListener('click', () => {
        parentLine.removeChild(subGroup);  
        updatePreview();
        autoSave();
      });

      subDiv.append(beginInput, endInput, textInput, delButton);
      subGroup.appendChild(arrowLabelDiv);
      subGroup.appendChild(subDiv);

      parentLine.appendChild(subGroup);
  }

  function saveProject() {
    const data = getLyricsData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "lyrics_project.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function openProject(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        populateEditor(data);
        updatePreview();
        autoSave();
      } catch (err) {
        alert("Error reading JSON file.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  document.getElementById('addLineButton').addEventListener('click', () => {
    addLine();
    updatePreview();
    autoSave();
  });

  document.getElementById('playButton').addEventListener('click', () => {
    startPlayback();
  });

  document.getElementById('stopButton').addEventListener('click', () => {
    stopPlayback();
  });

  document.getElementById('saveButton').addEventListener('click', () => {
    saveProject();
  });

  document.getElementById('openButton').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });

  document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      openProject(file);
    }
  });

  window.addEventListener('load', () => {
    const data = loadFromCookie();
    if (data && data.length > 0) {
      populateEditor(data);
    } else {
      addLine();
    }
    updatePreview();
  });

document.getElementById('linesContainer').addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    const container = document.getElementById('linesContainer');
    const siblings = [...container.querySelectorAll('.line:not(.dragging)')];

    const nextSibling = siblings.find(sibling => {
        const box = sibling.getBoundingClientRect();
        return e.clientY <= box.top + box.height / 2;
    });

    if (nextSibling) {
        container.insertBefore(draggingElement, nextSibling);
    } else {
        container.appendChild(draggingElement);
    }
});

const divider = document.getElementById('divider');
let isResizing = false;
let startX, startWidth;

divider.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.pageX;
    startWidth = document.getElementById('editor').offsetWidth;
    document.body.classList.add('resizing');
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const diff = e.pageX - startX;
    const containerWidth = window.innerWidth;
    const newWidth = Math.max(200, Math.min(startWidth + diff, containerWidth - 400));
    const editor = document.getElementById('editor');

    editor.style.width = `${newWidth}px`;
    editor.offsetHeight; 

    localStorage.setItem('editorWidth', newWidth);
});

document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.classList.remove('resizing');
});

window.addEventListener('load', () => {
    const savedWidth = localStorage.getItem('editorWidth');
    if (savedWidth) {
        const editor = document.getElementById('editor');
        editor.style.width = `${savedWidth}px`;
        editor.offsetHeight; 
    }
    const data = loadFromCookie();
    if (data && data.length > 0) {
        populateEditor(data);
    } else {
        addLine();
    }
    updatePreview();
});

let hoveredLine = null;

document.addEventListener('mouseover', (e) => {
    const line = e.target.closest('.line');
    hoveredLine = line;
});

document.addEventListener('mouseout', (e) => {
    if (!e.target.closest('.line')) {
        hoveredLine = null;
    }
});

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    // Handle Ctrl+S and Ctrl+O
    if (e.ctrlKey) {
        switch(e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                saveProject();
                break;
            case 'o':
                e.preventDefault();
                document.getElementById('fileInput').click();
                break;
        }
        return;
    }

    // Handle regular shortcuts
    switch(e.key.toUpperCase()) {
        case 'F':
            addLine();
            updatePreview();
            autoSave();
            break;
        case 'Q':
            if (hoveredLine) {
                const leftBtn = hoveredLine.querySelector('.align-btn[data-position="left"]');
                if (leftBtn) leftBtn.click();
            }
            break;
        case 'E':
            if (hoveredLine) {
                const rightBtn = hoveredLine.querySelector('.align-btn[data-position="right"]');
                if (rightBtn) rightBtn.click();
            }
            break;
        case 'O':
            if (hoveredLine) {
                const delBtn = hoveredLine.querySelector('.delete-line');
                if (delBtn) delBtn.click();
            }
            break;
        case 'S':
            if (hoveredLine) {
                const syllableBtn = hoveredLine.querySelector('.syllable-btn');
                if (syllableBtn) syllableBtn.click();
            }
            break;
        case 'Z':
            startPlayback();
            break;
        case 'X':
            stopPlayback();
            break;
    }
});

document.getElementById('exampleButton').addEventListener('click', async () => {
  if (confirm('This will replace your current project with an example. Are you sure?')) {
    try {
      const response = await fetch('https://raw.githubusercontent.com/sippedaway/applemusic-lyrics-generator/refs/heads/main/examples/Future%2C%20Metro%20Boomin%2C%20Kendrick%20Lamar%20-%20Like%20That.json');
      if (!response.ok) {
        throw new Error('Failed to fetch example project');
      }
      const data = await response.json();
      populateEditor(data);
      updatePreview();
      autoSave();
    } catch (err) {
      alert('Failed to load example project. Please try again later.');
      console.error('Error loading example:', err);
    }
  }
});

document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelector('#editor').classList.remove('active');
    document.querySelector('#preview').classList.remove('active');

    button.classList.add('active');
    document.querySelector(`#${button.dataset.tab}`).classList.add('active');
  });
});

if (window.innerWidth <= 768) {
  document.querySelector('#editor').classList.add('active');
}

function openSyllableEditor(lineDiv, text, existingSyllables = []) {
  // Get current text from input rather than using passed text parameter
  const currentText = lineDiv.querySelector('.lyricText').value.trim();
  
  if (!currentText) {
    alert('Please enter some lyrics first before editing word timings.');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';

  const popup = document.createElement('div');
  popup.className = 'syllable-popup';

  const header = document.createElement('div');
  header.className = 'popup-header';

  const title = document.createElement('h3');
  title.textContent = 'Word Timing Editor';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'popup-close';
  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
    document.body.removeChild(popup);
  };

  header.appendChild(title);
  header.appendChild(closeBtn);
  popup.appendChild(header);

  const words = currentText.split(' ');
  const begin = lineDiv.querySelector('.timestamp.begin').value;
  const end = lineDiv.querySelector('.timestamp.end').value;
  const totalDuration = parseTimestampFlexible(end) - parseTimestampFlexible(begin);
  const defaultWordDuration = totalDuration / words.length; 

  const wordDivs = [];
  words.forEach((word, i) => {
    const wordDiv = document.createElement('div');
    wordDiv.className = 'syllable-word';

    const existingSyllable = existingSyllables[i] || {};
    const wordBegin = existingSyllable.begin || formatTimestamp(parseTimestampFlexible(begin) + i * defaultWordDuration);
    const wordEnd = existingSyllable.end || formatTimestamp(parseTimestampFlexible(begin) + (i + 1) * defaultWordDuration);

    const wordText = document.createElement('span');
    wordText.className = 'word-text';
    wordText.textContent = word;

    const beginInput = document.createElement('input');
    beginInput.type = 'text';
    beginInput.value = wordBegin;
    beginInput.placeholder = 'M:SS';

    const endInput = document.createElement('input');
    endInput.type = 'text';
    endInput.value = wordEnd;
    endInput.placeholder = 'M:SS';

    endInput.addEventListener('change', () => {
      const currentEnd = parseTimestampFlexible(endInput.value);
      const nextIndex = i + 1;

      if (nextIndex < wordDivs.length) {
        const diff = currentEnd - parseTimestampFlexible(wordDivs[nextIndex].querySelector('input:first-of-type').value);

        if (diff > 0) {

          for (let j = nextIndex; j < wordDivs.length; j++) {
            const inputs = wordDivs[j].querySelectorAll('input');
            const newBegin = parseTimestampFlexible(inputs[0].value) + diff;
            const newEnd = parseTimestampFlexible(inputs[1].value) + diff;
            inputs[0].value = formatTimestamp(newBegin);
            inputs[1].value = formatTimestamp(newEnd);
          }
        }
      }
    });

    wordDiv.appendChild(wordText);
    wordDiv.appendChild(beginInput);
    wordDiv.appendChild(endInput);
    popup.appendChild(wordDiv);
    wordDivs.push(wordDiv);
  });

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.className = 'add-sub-button';
  saveBtn.onclick = () => {
    const syllables = Array.from(popup.querySelectorAll('.syllable-word')).map(wordDiv => ({
      text: wordDiv.querySelector('.word-text').textContent,
      begin: wordDiv.querySelector('input:first-of-type').value,
      end: wordDiv.querySelector('input:last-of-type').value
    }));

    lineDiv.dataset.syllables = JSON.stringify(syllables);
    updatePreview();
    autoSave();
    closeBtn.click();
  };

  popup.appendChild(saveBtn);

  overlay.classList.add('active');
  popup.classList.add('active');
  document.body.appendChild(overlay);
  document.body.appendChild(popup);
}

function formatTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return ms > 0 ? 
    `${minutes}:${String(secs).padStart(2, '0')}:${String(ms).padStart(3, '0')}` :
    `${minutes}:${String(secs).padStart(2, '0')}`;
}

function parseTimestampFlexible(ts) {
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
  const data = [];
  lines.forEach(line => {
    const begin = line.querySelector('.timestamp.begin').value;
    const end = line.querySelector('.timestamp.end').value;
    const text = line.querySelector('.lyricText').value;
    const position = line.querySelector('.align-btn.active').dataset.position;
    const sublyrics = Array.from(line.querySelectorAll('.sublyric')).map(sub => ({
      begin: sub.querySelector('.timestamp.begin').value,
      end: sub.querySelector('.timestamp.end').value,
      text: sub.querySelector('.lyricText').value
    }));
    const syllables = line.dataset.syllables ? JSON.parse(line.dataset.syllables) : [];
    data.push({ begin, end, text, position, sublyrics, syllables });
  });
  return data;
}

function updatePreview() {
  const previewContainer = document.getElementById('previewContainer');
  previewContainer.innerHTML = '';
  previewData = getLyricsData();

  previewData.forEach(lineData => {
    const lineDiv = document.createElement('div');
    lineDiv.className = `preview-line ${lineData.position}-lyric`;

    if (lineData.syllables && lineData.syllables.length > 0) {
      lineData.syllables.forEach((syllable, i) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'preview-word';
        wordSpan.dataset.begin = syllable.begin;
        wordSpan.dataset.end = syllable.end;

        const duration = parseTimestampFlexible(syllable.end) - parseTimestampFlexible(syllable.begin);
        if (duration > 3) {
          wordSpan.dataset.longDuration = 'true';
        }

        wordSpan.textContent = syllable.text;
        if (i < lineData.syllables.length - 1) wordSpan.textContent += ' ';
        lineDiv.appendChild(wordSpan);
      });
    } else {
      lineDiv.textContent = lineData.text;
    }

    previewContainer.appendChild(lineDiv);
  });
}

function updateActiveLyrics(currentTime) {

  document.querySelectorAll('.preview-word').forEach(word => {
    const begin = parseTimestampFlexible(word.dataset.begin);
    const end = parseTimestampFlexible(word.dataset.end);

    if (currentTime >= begin && currentTime <= end) {
      word.classList.add('active');

      if (word.dataset.longDuration === 'true') {
        word.classList.add('glow');
      }
    } else {
      word.classList.remove('active', 'glow');
    }
  });

}
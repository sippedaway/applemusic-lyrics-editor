let previewData = [];  
let isPlaying = false;
let playRequestId = null;

let syncedAudio = null;
let syncedAudioUrl = null;

const contextMenu = document.createElement('div');
contextMenu.className = 'context-menu';
contextMenu.innerHTML = `
  <button class="context-menu-item duplicate">Duplicate Line</button>
  <button class="context-menu-item delete">Delete Line</button>
`;
document.body.appendChild(contextMenu);

let currentContextLine = null;

function showContextMenu(e, lineDiv) {
  e.preventDefault();
  currentContextLine = lineDiv;
  contextMenu.style.display = 'block';
  contextMenu.style.left = e.pageX + 'px';
  contextMenu.style.top = e.pageY + 'px';
}

function hideContextMenu() {
  contextMenu.style.display = 'none';
  currentContextLine = null;
}

contextMenu.addEventListener('click', (e) => {
  if (!currentContextLine) {
    hideContextMenu();
    return;
  }
  const container = document.getElementById('linesContainer');
  if (e.target.classList.contains('delete')) {
    container.removeChild(currentContextLine);
    updatePreview();
    autoSave();
  } else if (e.target.classList.contains('duplicate')) {

    const clone = currentContextLine.cloneNode(true);

    clone.draggable = true;
    clone.addEventListener('contextmenu', (evt) => {
      showContextMenu(evt, clone);
    });
    clone.addEventListener('dragstart', (e) => {
      e.target.classList.add('dragging');
    });
    clone.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging');
      updatePreview();
      autoSave();
    });

    clone.addEventListener('input', (e) => {
      if (e.target.closest('.sublyric')) {

        updatePreview();
        autoSave();
      }
    });

    if (currentContextLine.nextSibling) {
      container.insertBefore(clone, currentContextLine.nextSibling);
    } else {
      container.appendChild(clone);
    }
    updatePreview();
    autoSave();
  }
  hideContextMenu();
});

document.addEventListener('click', hideContextMenu);
document.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('.line')) {
    hideContextMenu();
  }
});

const audioInput = document.getElementById('audioFileInput');
const syncAudioButton = document.getElementById('syncAudioButton');
const audioPlayer = document.getElementById('audioPlayer');
const audioVolumeBar = document.getElementById('audioVolumeBar');
const selectAudioFileBtn = document.getElementById('selectAudioFileBtn');
const syncDropdown = document.getElementById('syncDropdown');
const syncDropdownContent = document.getElementById('syncDropdownContent');

syncAudioButton.addEventListener('click', (e) => {
  e.stopPropagation();
  syncDropdownContent.style.display = syncDropdownContent.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', (e) => {
  if (!syncDropdown.contains(e.target)) {
    syncDropdownContent.style.display = 'none';
  }
});

selectAudioFileBtn.addEventListener('click', (e) => {
  e.preventDefault();
  audioInput.click();
});

audioInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    if (syncedAudioUrl) {
      URL.revokeObjectURL(syncedAudioUrl);
    }
    syncedAudioUrl = URL.createObjectURL(file);
    audioPlayer.src = syncedAudioUrl;
    syncedAudio = audioPlayer;
    audioPlayer.currentTime = 0;
  }
});

audioVolumeBar.addEventListener('input', () => {
  audioPlayer.volume = audioVolumeBar.value;
});

audioPlayer.volume = audioVolumeBar.value;

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

    lineDiv.addEventListener('contextmenu', (e) => {
      showContextMenu(e, lineDiv);
    });

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

    alignmentButtons.appendChild(leftBtn);
    alignmentButtons.appendChild(rightBtn);

    mainLineDiv.appendChild(beginInput);
    mainLineDiv.appendChild(endInput);
    mainLineDiv.appendChild(textInput);
    mainLineDiv.appendChild(alignmentButtons);

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

    if (syncedAudio && syncedAudio.src) {
      syncedAudio.currentTime = 0;
      syncedAudio.play();
    }
  });

  document.getElementById('stopButton').addEventListener('click', () => {
    stopPlayback();

    if (syncedAudio && !syncedAudio.paused) {
      syncedAudio.pause();
      syncedAudio.currentTime = 0;
    }
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
        case 'S':
            if (hoveredLine) {
                const syllableBtn = hoveredLine.querySelector('.syllable-btn');
                if (syllableBtn) syllableBtn.click();
            }
            break;
        case 'Z':
            startPlayback();

            if (syncedAudio && syncedAudio.src) {
              syncedAudio.currentTime = 0;
              syncedAudio.play();
            }
            break;
        case 'X':
            stopPlayback();

            if (syncedAudio && !syncedAudio.paused) {
              syncedAudio.pause();
              syncedAudio.currentTime = 0;
            }
            break;
    }
});

document.getElementById('exampleButton').addEventListener('click', async () => {
  if (confirm('This will replace your current project with an example. Are you sure?')) {
    try {
      const response = await fetch('https://raw.githubusercontent.com/sippedaway/applemusic-lyrics-generator/refs/heads/main/examples/Kendrick%20Lamar%2C%20Zacari%20-%20LOVE..json');
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

  document.querySelectorAll('.popup-overlay, .syllable-popup').forEach(el => el.remove());

  const currentText = lineDiv.querySelector('.lyricText').value.trim();
  if (!currentText) {
    alert('Please enter some lyrics first before editing word timings.');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay active';

  const popup = document.createElement('div');
  popup.className = 'syllable-popup active';
  popup.style.maxWidth = '900px';
  popup.style.width = '95vw';

  const header = document.createElement('div');
  header.className = 'popup-header';
  const title = document.createElement('h3');
  title.textContent = 'Word Timing Editor';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'popup-close';
  closeBtn.textContent = '×';
  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
    document.body.removeChild(popup);
  };
  header.appendChild(title);
  header.appendChild(closeBtn);
  popup.appendChild(header);

  const navBar = document.createElement('div');
  navBar.style.display = 'flex';
  navBar.style.justifyContent = 'flex-start';
  navBar.style.gap = '10px';
  navBar.style.marginBottom = '18px';

  const tabBtnClassic = document.createElement('button');
  tabBtnClassic.textContent = 'Classic Editor';
  tabBtnClassic.className = 'add-sub-button';
  tabBtnClassic.style.background = '#0af';
  tabBtnClassic.style.color = '#fff';

  const tabBtnTimeline = document.createElement('button');
  tabBtnTimeline.textContent = 'Timeline Editor';
  tabBtnTimeline.className = 'add-sub-button';
  tabBtnTimeline.style.background = '#222';
  tabBtnTimeline.style.color = '#fff';

  navBar.appendChild(tabBtnClassic);
  navBar.appendChild(tabBtnTimeline);
  popup.appendChild(navBar);

  const classicContainer = document.createElement('div');
  const timelineContainer = document.createElement('div');
  timelineContainer.style.display = 'none';

  (function renderClassic() {

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
      let wordBegin;
      if (i === 0) {
        wordBegin = begin;
      } else if (existingSyllables[i - 1] && existingSyllables[i - 1].end) {
        wordBegin = existingSyllables[i - 1].end;
      } else {
        wordBegin = formatTimestamp(parseTimestampFlexible(begin) + i * defaultWordDuration);
      }
      let wordEnd;
      if (i === words.length - 1) {
        wordEnd = existingSyllable.end || end;
      } else {
        wordEnd = existingSyllable.end || formatTimestamp(parseTimestampFlexible(begin) + (i + 1) * defaultWordDuration);
      }

      const wordText = document.createElement('span');
      wordText.className = 'word-text';
      wordText.textContent = word;

      let beginInput = document.createElement('input');
      beginInput.type = 'text';
      beginInput.value = wordBegin;
      beginInput.placeholder = 'M:SS';
      beginInput.readOnly = true;
      beginInput.className = 'syllable-begin';
      beginInput.style.background = '#222';
      beginInput.style.color = '#aaa';
      beginInput.style.cursor = 'not-allowed';

      let endInput = document.createElement('input');
      endInput.type = 'text';
      endInput.value = wordEnd;
      endInput.placeholder = 'M:SS';
      endInput.className = 'syllable-end';

      endInput.addEventListener('input', () => {
        if (wordDivs[i + 1]) {
          const nextBeginInput = wordDivs[i + 1].querySelector('input.syllable-begin');
          if (nextBeginInput) {
            nextBeginInput.value = endInput.value;
          }
        }
      });

      wordDiv.appendChild(wordText);
      wordDiv.appendChild(beginInput);
      wordDiv.appendChild(endInput);
      classicContainer.appendChild(wordDiv);
      wordDivs.push(wordDiv);
    });

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'add-sub-button';
    saveBtn.onclick = () => {
      const syllables = wordDivs.map((wordDiv, idx) => ({
        text: wordDiv.querySelector('.word-text').textContent,
        begin: wordDiv.querySelector('.syllable-begin').value,
        end: wordDiv.querySelector('.syllable-end').value
      }));

      lineDiv.dataset.syllables = JSON.stringify(syllables);
      updatePreview();
      autoSave();
      closeBtn.click();
    };
    classicContainer.appendChild(saveBtn);
  })();

  (function renderTimeline() {

    const info = document.createElement('div');
    info.style.marginBottom = '16px';
    info.style.color = '#aaa';
    info.style.fontSize = '15px';
    info.style.lineHeight = '1.6';
    info.innerHTML = `
      <b>Timeline Editor:</b> <br>
      Adjust the duration for each word using the arrows. The sum of all durations must exactly match the lyric's total duration.<br>
      Each word will glow for its duration. Gray timestamps show when each word starts.
    `;
    timelineContainer.appendChild(info);

    const words = currentText.split(' ');
    const begin = lineDiv.querySelector('.timestamp.begin').value;
    const end = lineDiv.querySelector('.timestamp.end').value;
    const totalDuration = parseTimestampFlexible(end) - parseTimestampFlexible(begin);

    let durations = [];
    if (existingSyllables && existingSyllables.length === words.length) {
      for (let i = 0; i < words.length; ++i) {
        const b = parseTimestampFlexible(existingSyllables[i].begin);
        const e = parseTimestampFlexible(existingSyllables[i].end);
        durations.push(e - b);
      }
    } else {
      for (let i = 0; i < words.length; ++i) durations.push(totalDuration / words.length);
    }

    const wordWidths = [];
    let totalChars = words.reduce((acc, w) => acc + w.length, 0);
    for (let i = 0; i < words.length; ++i) {
      let w = Math.max(90, Math.min(220, Math.round((words[i].length / totalChars) * 900)));
      wordWidths.push(w);
    }

    const timelineScroll = document.createElement('div');
    timelineScroll.style.overflowX = 'auto';
    timelineScroll.style.overflowY = 'visible';
    timelineScroll.style.whiteSpace = 'nowrap';
    timelineScroll.style.paddingBottom = '10px';
    timelineScroll.style.marginBottom = '10px';
    timelineScroll.style.display = 'flex';
    timelineScroll.style.gap = '24px';

    const errorDiv = document.createElement('div');
    errorDiv.style.color = '#f55';
    errorDiv.style.margin = '10px 0 0 0';
    errorDiv.style.fontWeight = 'bold';

    let timestampSpans = [];

    function updateTimestampsAndError() {
      let sum = 0;
      for (let i = 0; i < durations.length; ++i) {
        timestampSpans[i].textContent = formatTimestamp(parseTimestampFlexible(begin) + sum);
        sum += durations[i];
      }
      if (Math.abs(sum - totalDuration) > 0.001) {
        errorDiv.textContent = `Total duration mismatch: ${sum.toFixed(3)}s (should be ${totalDuration.toFixed(3)}s)`;
      } else {
        errorDiv.textContent = '';
      }
    }

    function updateDurDisplays() {
      const displays = timelineScroll.querySelectorAll('.duration-display');
      for (let i = 0; i < durations.length; ++i) {
        displays[i].textContent = durations[i].toFixed(3) + 's';
      }
    }

    for (let i = 0; i < words.length; ++i) {
      const wordCol = document.createElement('div');
      wordCol.style.display = 'flex';
      wordCol.style.flexDirection = 'column';
      wordCol.style.alignItems = 'center';
      wordCol.style.boxSizing = 'border-box';
      wordCol.style.margin = '0 0px';
      wordCol.style.background = 'rgba(255,255,255,0.03)';
      wordCol.style.borderRadius = '12px';
      wordCol.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      wordCol.style.padding = '0 0 0 0';

      const wordDiv = document.createElement('div');
      wordDiv.textContent = words[i];
      wordDiv.style.fontWeight = 'bold';
      wordDiv.style.fontSize = '18px';
      wordDiv.style.padding = '8px 8px 2px 8px';
      wordDiv.style.background = 'rgba(255,255,255,0.07)';
      wordDiv.style.borderRadius = '12px 12px 0 0';
      wordDiv.style.textAlign = 'center';
      wordDiv.style.width = '100%';
      wordCol.appendChild(wordDiv);

      const ts = document.createElement('span');
      ts.style.fontSize = '12px';
      ts.style.color = '#888';
      ts.style.marginBottom = '2px';
      ts.style.marginTop = '2px';
      ts.textContent = formatTimestamp(parseTimestampFlexible(begin) + durations.slice(0, i).reduce((a, b) => a + b, 0));
      wordCol.appendChild(ts);
      timestampSpans.push(ts);

      const durRow = document.createElement('div');
      durRow.style.display = 'flex';
      durRow.style.alignItems = 'center';
      durRow.style.justifyContent = 'space-between';
      durRow.style.width = '100%';
      durRow.style.background = 'linear-gradient(90deg, #0af 60%, #09f 100%)';
      durRow.style.borderRadius = '0 0 12px 12px';
      durRow.style.padding = '10px 0';
      durRow.style.margin = '0';
      durRow.style.position = 'relative';
      durRow.style.minWidth = '70px';

      const leftBtn = document.createElement('button');
      leftBtn.innerHTML = '<svg width="22" height="22" style="vertical-align:middle;" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#222"/><path d="M14 7l-4 4 4 4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      leftBtn.className = 'add-sub-button';
      leftBtn.style.background = 'transparent';
      leftBtn.style.border = 'none';
      leftBtn.style.padding = '0 4px 0 0';
      leftBtn.style.margin = '0';
      leftBtn.style.cursor = 'pointer';
      leftBtn.style.boxShadow = 'none';
      leftBtn.style.fontSize = '15px';
      leftBtn.onmousedown = e => e.preventDefault();
      leftBtn.onclick = () => {
        let minDur = 0.05;
        if (durations[i] <= minDur) return;
        let delta = Math.min(0.05, durations[i] - minDur);
        durations[i] -= delta;
        let others = durations.length - 1;
        for (let j = 0; j < durations.length; ++j) {
          if (j !== i) durations[j] += delta / others;
        }
        updateDurDisplays();
        updateTimestampsAndError();
      };

      const rightBtn = document.createElement('button');
      rightBtn.innerHTML = '<svg width="22" height="22" style="vertical-align:middle;" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#222"/><path d="M8 7l4 4-4 4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      rightBtn.className = 'add-sub-button';
      rightBtn.style.background = 'transparent';
      rightBtn.style.border = 'none';
      rightBtn.style.padding = '0 0 0 4px';
      rightBtn.style.margin = '0';
      rightBtn.style.cursor = 'pointer';
      rightBtn.style.boxShadow = 'none';
      rightBtn.style.fontSize = '15px';
      rightBtn.onmousedown = e => e.preventDefault();
      rightBtn.onclick = () => {
        let maxDelta = 0.05;
        let others = durations.length - 1;
        let maxInc = Math.min(
          maxDelta,
          ...durations.filter((d, idx) => idx !== i).map(d => d - 0.05)
        );
        if (maxInc <= 0) return;
        durations[i] += maxInc;
        for (let j = 0; j < durations.length; ++j) {
          if (j !== i) durations[j] -= maxInc / others;
        }
        updateDurDisplays();
        updateTimestampsAndError();
      };

      const durDisplay = document.createElement('div');
      durDisplay.textContent = durations[i].toFixed(3) + 's';
      durDisplay.style.background = 'transparent';
      durDisplay.style.color = '#fff';
      durDisplay.style.border = 'none';
      durDisplay.style.borderRadius = '4px';
      durDisplay.style.padding = '0 12px';
      durDisplay.style.margin = '0 2px';
      durDisplay.style.fontWeight = 'bold';
      durDisplay.style.fontSize = '15px';
      durDisplay.className = 'duration-display';
      durDisplay.style.pointerEvents = 'none';
      durDisplay.style.userSelect = 'none';

      durRow.appendChild(leftBtn);
      durRow.appendChild(durDisplay);
      durRow.appendChild(rightBtn);

      wordCol.appendChild(durRow);
      timelineScroll.appendChild(wordCol);
    }

    timelineContainer.appendChild(timelineScroll);
    timelineContainer.appendChild(errorDiv);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Done';
    saveBtn.className = 'add-sub-button';
    saveBtn.style.marginTop = '30px';
    saveBtn.onclick = () => {
      let sum = 0;
      for (let i = 0; i < durations.length; ++i) sum += durations[i];
      if (Math.abs(sum - totalDuration) > 0.001) {
        errorDiv.textContent = `Total duration mismatch: ${sum.toFixed(3)}s (should be ${totalDuration.toFixed(3)}s)`;
        return;
      }
      let syllables = [];
      let cur = parseTimestampFlexible(begin);
      for (let i = 0; i < words.length; ++i) {
        const dur = durations[i];
        syllables.push({
          text: words[i],
          begin: formatTimestamp(cur),
          end: formatTimestamp(cur + dur)
        });
        cur += dur;
      }
      lineDiv.dataset.syllables = JSON.stringify(syllables);
      updatePreview();
      autoSave();
      closeBtn.click();
    };
    timelineContainer.appendChild(saveBtn);

    updateDurDisplays();
    updateTimestampsAndError();
  })();

  function showClassic() {
    classicContainer.style.display = '';
    timelineContainer.style.display = 'none';
    tabBtnClassic.style.background = '#0af';
    tabBtnTimeline.style.background = '#222';
  }
  function showTimeline() {
    classicContainer.style.display = 'none';
    timelineContainer.style.display = '';
    tabBtnClassic.style.background = '#222';
    tabBtnTimeline.style.background = '#0af';
  }
  tabBtnClassic.onclick = showClassic;
  tabBtnTimeline.onclick = showTimeline;
  showClassic();

  popup.appendChild(classicContainer);
  popup.appendChild(timelineContainer);

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
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
      addLine(item.begin, item.end, item.text, item.position, item.sublyrics);  
    });
  }

  function addLine(begin = '', end = '', text = '', position = 'left', sublyrics = []) {
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

      mainLineDiv.appendChild(addSubButton);
      lineDiv.appendChild(mainLineDiv);

      sublyrics.forEach(sub => {
        addSublyric(lineDiv, sub.begin, sub.end, sub.text);
      });

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
    switch(e.key.toUpperCase()) {
        case 'F':
            addLine();
            updatePreview();
            autoSave();
            break;
    case 'Q':
            if (hoveredLine) {
                const leftBtn = hoveredLine.querySelector('.align-btn[dataqeqe-position="left"]');
                if (leftBtn) {
                    leftBtn.click();
                }
            }
            break;
        case 'E':
            if (hoveredLine) {
                const rightBtn = hoveredLine.querySelector('.align-btn[data-position="right"]');
                if (rightBtn) {
                    rightBtn.click();
                }
            }
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
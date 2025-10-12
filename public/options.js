let activeTab = 'customization';

function createOptionsMenu() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay active';
    overlay.style.zIndex = '999';

    const popup = document.createElement('div');
    popup.className = 'options-popup active';
    popup.innerHTML = `
        <div class="options-sidebar">
            <div class="options-header">
                <h2>Options</h2>
                <button class="popup-close">×</button>
            </div>
            <div class="options-tabs">
                <button data-tab="export"><i class="fas fa-file-export"></i>Export</button>
                <button data-tab="customization"><i class="fas fa-paint-brush"></i>Customization</button>
                <button data-tab="examples"><i class="fas fa-lightbulb"></i>Examples</button>
                <button data-tab="more"><i class="fas fa-ellipsis-h"></i>More</button>
            </div>
        </div>
        <div class="options-content"></div>
    `;

    function switchTab(tabName) {
        activeTab = tabName;
        const content = popup.querySelector('.options-content');
        const tabs = popup.querySelectorAll('.options-tabs button');
        
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        content.innerHTML = '';
        
        switch(tabName) {
            case 'export':
                content.innerHTML = `
                    <h2>Export Project</h2>
                    
                    <div class="options-section">
                        <h3>Editor Project</h3>
                        <p class="option-description">Save and load complete project files with all features</p>
                        <div style="display:flex;gap:10px;margin-top:15px;">
                            <button class="option-button" onclick="document.getElementById('saveButton').click()">
                                <i class="fas fa-save"></i>Save .JSON
                            </button>
                        </div>
                    </div>

                    <div class="options-section">
                        <h3>Export Formats</h3>
                        <p class="option-description" style="color:#ff6b6b;margin-bottom:15px;">
                            Note: Word timings, themes, and background lyrics won't be included in these formats
                        </p>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;">
                            <button class="option-button" onclick="exportAsSubtitles('srt')">
                                <i class="fas fa-file-export"></i>Save as .SRT
                            </button>
                            <button class="option-button" onclick="exportAsSubtitles('vtt')">
                                <i class="fas fa-file-export"></i>Save as .VTT
                            </button>
                            <button class="option-button" onclick="exportAsSubtitles('ass')">
                                <i class="fas fa-file-export"></i>Save as .ASS
                            </button>
                            <button class="option-button" onclick="exportAsText()">
                                <i class="fas fa-file-alt"></i>Save as .TXT
                            </button>
                            <button class="option-button" onclick="exportAsLRC()">
                                <i class="fas fa-music"></i>Save as .LRC
                            </button>
                        </div>
                    </div>

                    <div class="options-section">
                        <h3>Website Export</h3>
                        <p class="option-description">Generate a standalone webpage with your lyrics</p>
                        <p class="option-description" style="color:#ff6b6b;margin-bottom:15px;">
                            Note: This feature is experimental. Word timings, and background lyrics won't be included in the website
                        </p>
                        <div style="display:flex;gap:10px;margin-top:15px;">
                            <button class="option-button" onclick="openLyricWebsite()">
                                <i class="fas fa-eye"></i>Preview Website
                            </button>
                            <button class="option-button" onclick="downloadFile('lyrics.html', generateWebsite())">
                                <i class="fas fa-download"></i>Download .HTML
                            </button>
                        </div>
                    </div>
                `;
                break;

            case 'customization':
                renderThemeEditor(content);
                break;

            case 'examples':
                renderExamplesList(content);
                break;

            case 'more':
                content.innerHTML = `
                    <img src="./assets/lyricseditor.png" alt="LyricsEditor logo" style="width: 500px; height: auto;"></img>
                    <div class="options-section">
                        <div>    
                            <h1>Version 2.0</h1>
                            <p class="version">- Rebrand <br>- Options menu <br>- Exporting <br>- QOL changes, bug fixes, and more!</p>
                        </div>
                        <a href="https://github.com/sippedaway/lyricseditor" target="_blank" class="github-button">
                            <i class="fab fa-github"></i>
                            View on GitHub
                        </a>
                        <button onclick="restartonboarding()" class="github-button">
                            <i class="fas fa-sync"></i>
                            Onboarding
                        </button>
                        <div class="legal">
                            <p>This tool is not affiliated with or endorsed by Apple, Apple Music, Spotify, and/or any of the artists or their labels from the example projects.</p>
                            <p>Created by sipped as an open-source free project.</p>
                        </div>
                    </div>
                `;
                break;
        }
    }

    popup.querySelector('.popup-close').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    popup.querySelectorAll('.options-tabs button').forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
        document.body.removeChild(overlay);
    }
});
    
    switchTab(activeTab);
}

function restartonboarding() {
    document.body.removeChild(document.querySelector('.popup-overlay'));
    createOnboardingPopup();
}

function renderExamplesList(container) {
    container.innerHTML = `
        <h2>Example Projects</h2>
        <p style="color: #888; margin-bottom: 20px;">Click on an example project to load it. This will replace your current project.</p>
        <div class="options-section examples-grid"></div>
    `;

    const grid = container.querySelector('.examples-grid');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    grid.style.gap = '20px';

    examples.forEach(example => {
        const card = document.createElement('div');
        card.style.background = '#1a1a1a';
        card.style.borderRadius = '8px';
        card.style.padding = '15px';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.2s ease';

        card.innerHTML = `
            <img src="${example.cover}" style="width: 100%; aspect-ratio: 1; border-radius: 4px; margin-bottom: 12px;">
            <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 4px;">${example.title}</div>
            <div style="color: #888; font-size: 14px; margin-bottom: 12px;">${example.artist}</div>
            <div class="tags-container" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
        `;

        const tagsContainer = card.querySelector('.tags-container');
        example.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.textContent = tag.text;
            tagElement.style.cssText = `
                font-size: 11px;
                padding: 4px 8px;
                border-radius: 12px;
                background-color: ${tag.color}1A;
                color: ${tag.color};
                border: 1px solid ${tag.color};
            `;
            tagsContainer.appendChild(tagElement);
        });

        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';
        card.onclick = () => loadExample(example.url, example.song);

        grid.appendChild(card);
    });
}

function renderThemeEditor(container) {
    container.innerHTML = `
        <h2>Theme Settings</h2>

        <div class="options-section">
            <h3 style="margin: 0 0 16px 0;">Quick Themes</h3>
            <div class="theme-buttons"></div>
            <p style="color: #888; font-size: 13px; margin: 8px 0;">Choose from predefined themes or customize below.</p>
        </div>

        <div class="options-section theme-advanced">
            <h3 style="margin: 0 0 16px 0;">Advanced Settings</h3>
            <div class="theme-settings"></div>
        </div>
    `;

    /* ---------- QUICK THEMES ---------- */
    const themeButtons = container.querySelector('.theme-buttons');
    themeButtons.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-bottom: 8px;';

    Object.entries(themePresets).forEach(([key, theme]) => {
        const button = document.createElement('button');
        button.className = 'add-sub-button';
        button.textContent = theme.name;
        button.style.fontFamily = theme.font;
        button.style.background = theme.backgroundColor.startsWith('url')
            ? '#222'
            : theme.backgroundColor;
        button.style.color = theme.activeTextColor;
        button.onclick = () => applyThemePreset(key);
        themeButtons.appendChild(button);
    });

    /* ---------- ADVANCED SETTINGS ---------- */
    const settings = container.querySelector('.theme-settings');
    settings.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';

    // Background
    const bgGroup = document.createElement('div');
    bgGroup.className = 'setting-group';
    bgGroup.innerHTML = `
        <label>Background</label>
        <div style="display:flex;gap:8px;">
            <input type="text" class="coloris" value="${themeSettings.backgroundColor}" style="flex:1;">
            <button class="add-sub-button">Browse</button>
        </div>
        <input type="file" accept="image/*" style="display:none;">
        <p style="color:gray;margin:8px 0 0;font-size:13px;">
            Background image is <strong>experimental</strong>.<br>
            Ensure it's loopable on all sides.
        </p>
    `;
    const bgInput = bgGroup.querySelector('input.coloris');
    const bgFile = bgGroup.querySelector('input[type=file]');
    const bgBrowse = bgGroup.querySelector('button');

    bgBrowse.onclick = () => bgFile.click();
    bgFile.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                themeSettings.backgroundColor = `url('${ev.target.result}')`;
                applyTheme();
            };
            reader.readAsDataURL(file);
        }
    };
    bgInput.addEventListener('input', () => {
        themeSettings.backgroundColor = bgInput.value;
        applyTheme();
    });

    // Font
    const fontGroup = document.createElement('div');
    fontGroup.className = 'setting-group';
    const fontLabel = document.createElement('label');
    fontLabel.textContent = 'Font';
    const fontSelect = document.createElement('select');
    fontSelect.style.cssText = 'width:100%;padding:8px;background:#222;border:1px solid #333;border-radius:6px;color:#fff;';
    const fonts = [
        'SF Pro', 'Arial Narrow', 'Helvetica', 'Circular', 'Roboto', 'Open Sans',
        'Segoe UI', 'Dela Gothic One', 'Steelfish', 'Times New Roman'
    ];
    fonts.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        if (f === themeSettings.font) opt.selected = true;
        fontSelect.appendChild(opt);
    });
    fontSelect.addEventListener('change', () => {
        themeSettings.font = fontSelect.value;
        applyTheme();
    });
    fontGroup.appendChild(fontLabel);
    fontGroup.appendChild(fontSelect);

    // Blur Amount
    const blurGroup = document.createElement('div');
    blurGroup.className = 'setting-group';
    blurGroup.innerHTML = `
        <label>Blur Amount <span style="color:#666;font-size:13px;">(default: 1px)</span></label>
        <div style="display:flex;align-items:center;gap:12px;">
            <input type="range" min="0" max="3" step="0.1" value="${themeSettings.blurAmount}" style="flex:1;">
            <span style="min-width:45px;color:#aaa;">${themeSettings.blurAmount}px</span>
        </div>
    `;
    const blurRange = blurGroup.querySelector('input[type=range]');
    const blurVal = blurGroup.querySelector('span');
    blurRange.addEventListener('input', () => {
        themeSettings.blurAmount = parseFloat(blurRange.value);
        blurVal.textContent = blurRange.value + 'px';
        applyTheme();
    });

    // Active Text Color
    const activeColorGroup = document.createElement('div');
    activeColorGroup.className = 'setting-group';
    activeColorGroup.innerHTML = `
        <label>Active Text Color</label>
        <input type="text" class="coloris" value="${themeSettings.activeTextColor}">
    `;
    const activeColorInput = activeColorGroup.querySelector('input');
    activeColorInput.addEventListener('input', () => {
        themeSettings.activeTextColor = activeColorInput.value;
        applyTheme();
    });

    // Inactive Text Color
    const inactiveColorGroup = document.createElement('div');
    inactiveColorGroup.className = 'setting-group';
    inactiveColorGroup.innerHTML = `
        <label>Inactive Text Color</label>
        <input type="text" class="coloris" value="${themeSettings.inactiveTextColor}">
    `;
    const inactiveColorInput = inactiveColorGroup.querySelector('input');
    inactiveColorInput.addEventListener('input', () => {
        themeSettings.inactiveTextColor = inactiveColorInput.value;
        applyTheme();
    });

    // Active Text Blur
    const activeBlurGroup = document.createElement('div');
    activeBlurGroup.className = 'setting-group';
    activeBlurGroup.innerHTML = `
        <label>Active Text Blur <span style="color:#666;font-size:13px;">(default: 0px)</span></label>
        <div style="display:flex;align-items:center;gap:12px;">
            <input type="range" min="0" max="3" step="0.1" value="${themeSettings.activeBlurAmount}" style="flex:1;">
            <span style="min-width:45px;color:#aaa;">${themeSettings.activeBlurAmount}px</span>
        </div>
    `;
    const activeBlurRange = activeBlurGroup.querySelector('input');
    const activeBlurVal = activeBlurGroup.querySelector('span');
    activeBlurRange.addEventListener('input', () => {
        themeSettings.activeBlurAmount = parseFloat(activeBlurRange.value);
        activeBlurVal.textContent = activeBlurRange.value + 'px';
        applyTheme();
    });

    // Glow
    const glowGroup = document.createElement('div');
    glowGroup.className = 'setting-group';
    glowGroup.innerHTML = `
        <label>Active Text Glow <span style="color:#666;font-size:13px;">(default: 0.2px)</span></label>
        <div style="display:flex;align-items:center;gap:12px;">
            <input type="range" min="0" max="4" step="0.1" value="${themeSettings.glowAmount}" style="flex:1;">
            <span style="min-width:45px;color:#aaa;">${themeSettings.glowAmount}px</span>
        </div>
    `;
    const glowRange = glowGroup.querySelector('input');
    const glowVal = glowGroup.querySelector('span');
    glowRange.addEventListener('input', () => {
        themeSettings.glowAmount = parseFloat(glowRange.value);
        glowVal.textContent = glowRange.value + 'px';
        applyTheme();
    });

    const noWordTimingsGroup = document.createElement('div');
    noWordTimingsGroup.className = 'setting-group';
    noWordTimingsGroup.innerHTML = `
        <div class="option-row">
            <label>
                <input type="checkbox" id="noWordTimingsToggle" ${window.noWordTimings ? 'checked' : ''}>
                No word timings
            </label>
            <p class="option-description">Light up entire lyrics at once instead of word by word</p>
        </div>
    `;
    const noWordTimingsCheckbox = noWordTimingsGroup.querySelector('#noWordTimingsToggle');
    noWordTimingsCheckbox.addEventListener('change', () => {
        window.noWordTimings = noWordTimingsCheckbox.checked;
        if (typeof autoSave === 'function') autoSave();
    });

    // Bind to Project
    const bindGroup = document.createElement('div');
    bindGroup.className = 'setting-group';
    bindGroup.style.cssText = 'display:block;padding:12px;background:#151515;border-radius:6px;';
    bindGroup.innerHTML = `
        <label style="color:#fff;display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="bindThemeCheckbox" ${themeSettings.boundToProject ? 'checked' : ''}>
            Save theme with project
        </label>
        <p style="color:#888;margin:8px 0 0 24px;font-size:13px;">
            When enabled, these theme settings will be saved in the project file and restored when opened.
        </p>
    `;
    const bindCheckbox = bindGroup.querySelector('#bindThemeCheckbox');
    bindCheckbox.addEventListener('change', () => {
        themeSettings.boundToProject = bindCheckbox.checked;
        if (typeof autoSave === 'function') autoSave();
    });

    // Add everything to container
    settings.appendChild(bgGroup);
    settings.appendChild(fontGroup);
    settings.appendChild(blurGroup);
    settings.appendChild(activeColorGroup);
    settings.appendChild(inactiveColorGroup);
    settings.appendChild(activeBlurGroup);
    settings.appendChild(glowGroup);
    settings.appendChild(noWordTimingsGroup);
    settings.appendChild(bindGroup);

    // Initialize Coloris pickers
    Coloris({
        el: '.coloris',
        theme: 'dark',
        themeMode: 'dark',
        alpha: false,
        wrap: false,
        format: 'hex',
        closeButton: true,
        closeText: 'OK'
    });
}


//# sourceMappingURL=options.js.map
window.openOptions = createOptionsMenu;

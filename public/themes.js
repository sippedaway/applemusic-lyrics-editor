let themeSettings = {
    backgroundColor: '#000000',
    font: 'SF Pro',
    blurAmount: 1,
    activeTextColor: '#ffffff',
    inactiveTextColor: '#808080',
    activeBlurAmount: 0,
    glowAmount: 0.2
};

const defaultTheme = {
    backgroundColor: '#000000',
    font: 'SF Pro',
    blurAmount: 1,
    activeTextColor: '#ffffff',
    inactiveTextColor: '#808080',
    activeBlurAmount: 0,
    glowAmount: 0.2
};

const themePresets = {
    default: {
        name: 'Apple Music (Default)',
        backgroundColor: '#000000',
        font: 'SF Pro',
        blurAmount: 1,
        activeTextColor: '#ffffff',
        inactiveTextColor: '#808080',
        activeBlurAmount: 0,
        glowAmount: 0.2
    },
    brat: {
        name: 'Brat',
        backgroundColor: '#8ACE00',
        font: 'Arial Narrow',
        blurAmount: 1.5,
        activeTextColor: '#000000',
        inactiveTextColor: '#808080',
        activeBlurAmount: 1,
        glowAmount: 0
    },
    blue: {
        name: 'BLUE',
        backgroundColor: '#000000',
        font: 'Dela Gothic One',
        blurAmount: 1.5,
        activeTextColor: '#007397',
        inactiveTextColor: '#4d4470',
        activeBlurAmount: 0,
        glowAmount: 0.2
    }
};

function applyThemePreset(preset) {
    const settings = themePresets[preset];
    if (!settings) return;

    Object.assign(themeSettings, settings);
    applyTheme();

    const inputs = document.querySelectorAll('.coloris');
    if (inputs.length) {
        inputs.forEach(input => {
            if (input.closest('.setting-group').querySelector('label').textContent === 'Background Color') {
                input.value = settings.backgroundColor;
            } else if (input.closest('.setting-group').querySelector('label').textContent === 'Active Text Color') {
                input.value = settings.activeTextColor;
            } else if (input.closest('.setting-group').querySelector('label').textContent === 'Inactive Text Color') {
                input.value = settings.inactiveTextColor;
            }
        });
        document.querySelector('select').value = settings.font;

        const blurSlider = document.querySelector('.setting-group:nth-child(3) input[type="range"]');
        if (blurSlider) {
            blurSlider.value = settings.blurAmount;
            const valueSpan = blurSlider.parentElement.querySelector('span');
            if (valueSpan) valueSpan.textContent = settings.blurAmount + 'px';
        }

        const activeBlurSlider = document.querySelector('.setting-group:nth-child(6) input[type="range"]');
        if (activeBlurSlider) {
            activeBlurSlider.value = settings.activeBlurAmount;
            const valueSpan = activeBlurSlider.parentElement.querySelector('span');
            if (valueSpan) valueSpan.textContent = settings.activeBlurAmount + 'px';
        }

        const glowSlider = document.querySelector('.setting-group:nth-child(7) input[type="range"]');
        if (glowSlider) {
            glowSlider.value = settings.glowAmount;
            const valueSpan = glowSlider.parentElement.querySelector('span');
            if (valueSpan) valueSpan.textContent = settings.glowAmount + 'px';
        }
    }
}

function openThemeEditor() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay active';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999';

    const popup = document.createElement('div');
    popup.className = 'theme-popup active';
    popup.style.maxWidth = '600px';
    popup.style.width = '95vw';
    popup.style.background = '#111';
    popup.style.borderRadius = '12px';
    popup.style.padding = '24px';
    popup.style.position = 'relative'; 
    popup.style.zIndex = '1000';
    popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '24px';

    const themesSection = document.createElement('div');
    themesSection.style.marginBottom = '24px';

    const themesTitle = document.createElement('h3');
    themesTitle.textContent = 'Quick Themes';
    themesTitle.style.margin = '0 0 12px 0';
    themesTitle.style.color = '#fff';
    themesTitle.style.fontSize = '16px';

    const themeBtnsContainer = document.createElement('div');
    themeBtnsContainer.style.display = 'flex';
    themeBtnsContainer.style.gap = '10px';
    themeBtnsContainer.style.marginBottom = '8px';

    const themesInfo = document.createElement('p');
    themesInfo.textContent = 'Choose from predefined themes or customize your own settings below.';
    themesInfo.style.margin = '8px 0';
    themesInfo.style.color = '#888';
    themesInfo.style.fontSize = '13px';

    const defaultThemeBtn = document.createElement('button');
    defaultThemeBtn.textContent = 'Apple Music (Default)';
    defaultThemeBtn.className = 'add-sub-button';
    defaultThemeBtn.onclick = () => applyThemePreset('default');

    const bratThemeBtn = document.createElement('button');
    bratThemeBtn.textContent = 'Brat';
    bratThemeBtn.className = 'add-sub-button';
    bratThemeBtn.style.background = '#8ACE00';
    bratThemeBtn.style.color = '#000000';
    bratThemeBtn.style.fontFamily = 'Arial Narrow';
    bratThemeBtn.onclick = () => applyThemePreset('brat');

    const blueThemeBtn = document.createElement('button');
    blueThemeBtn.textContent = 'BLUE';
    blueThemeBtn.className = 'add-sub-button';
    blueThemeBtn.style.background = '#000000';
    blueThemeBtn.style.color = '#007397';
    blueThemeBtn.style.fontFamily = 'Dela Gothic One, Helvetica, Arial';
    blueThemeBtn.style.fontWeight = 'bold';
    blueThemeBtn.onclick = () => applyThemePreset('blue');

    themeBtnsContainer.appendChild(defaultThemeBtn);
    themeBtnsContainer.appendChild(bratThemeBtn);
    themeBtnsContainer.appendChild(blueThemeBtn);

    const title = document.createElement('h2');
    title.textContent = 'Customize Preview';
    title.style.margin = '0';
    title.style.color = '#fff';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'popup-close';
    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
    };

    header.appendChild(title);
    header.appendChild(closeBtn);
    popup.appendChild(header);

    themesSection.appendChild(themesTitle);
    themesSection.appendChild(themeBtnsContainer);
    themesSection.appendChild(themesInfo);
    popup.appendChild(themesSection);

    const settingsSection = document.createElement('div');
    settingsSection.style.backgroundColor = '#0a0a0a';
    settingsSection.style.padding = '20px';
    settingsSection.style.borderRadius = '8px';
    settingsSection.style.marginBottom = '20px';

    const settingsTitle = document.createElement('h3');
    settingsTitle.textContent = 'Advanced Settings';
    settingsTitle.style.margin = '0 0 16px 0';
    settingsTitle.style.color = '#fff';
    settingsTitle.style.fontSize = '16px';

    const settingsContainer = document.createElement('div');
    settingsContainer.style.display = 'flex';
    settingsContainer.style.flexDirection = 'column';
    settingsContainer.style.gap = '20px';

    const bgColorGroup = document.createElement('div');
    bgColorGroup.className = 'setting-group';
    const bgColorLabel = document.createElement('label');
    bgColorLabel.textContent = 'Background Color';
    const bgColorInput = document.createElement('input');
    bgColorInput.type = 'text';
    bgColorInput.className = 'coloris';
    bgColorInput.value = themeSettings.backgroundColor;

    bgColorInput.addEventListener('input', () => {
        themeSettings.backgroundColor = bgColorInput.value;
        applyTheme();
    });

    bgColorGroup.appendChild(bgColorLabel);
    bgColorGroup.appendChild(bgColorInput);

    const fontGroup = document.createElement('div');
    fontGroup.className = 'setting-group';
    const fontLabel = document.createElement('label');
    fontLabel.textContent = 'Font';
    const fontSelect = document.createElement('select');
    fontSelect.style.width = '100%';
    fontSelect.style.padding = '8px';
    fontSelect.style.background = '#222';
    fontSelect.style.border = '1px solid #333';
    fontSelect.style.borderRadius = '6px';
    fontSelect.style.color = '#fff';
    fontSelect.style.fontSize = '14px';

    const fonts = [
        'SF Pro',
        'Arial Narrow',
        'Helvetica',
        'Inter',
        'Roboto',
        'Open Sans',
        'Segoe UI',
        'Dela Gothic One',
        'Times New Roman'
    ];

    fonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        option.selected = font === themeSettings.font;
        fontSelect.appendChild(option);
    });

    fontSelect.addEventListener('change', () => {
        themeSettings.font = fontSelect.value;
        applyTheme();
    });
    fontGroup.appendChild(fontLabel);
    fontGroup.appendChild(fontSelect);

    const blurGroup = document.createElement('div');
    blurGroup.className = 'setting-group';
    const blurLabel = document.createElement('label');
    blurLabel.innerHTML = 'Blur Amount <span style="color:#666;font-size:13px;">(default: 1px)</span>';

    const blurContainer = document.createElement('div');
    blurContainer.style.display = 'flex';
    blurContainer.style.alignItems = 'center';
    blurContainer.style.gap = '12px';

    const blurSlider = document.createElement('input');
    blurSlider.type = 'range';
    blurSlider.min = '0';
    blurSlider.max = '3';
    blurSlider.step = '0.1';
    blurSlider.value = themeSettings.blurAmount;
    blurSlider.style.flex = '1';

    const blurValue = document.createElement('span');
    blurValue.textContent = themeSettings.blurAmount + 'px';
    blurValue.style.minWidth = '45px';
    blurValue.style.color = '#aaa';

    blurSlider.addEventListener('input', () => {
        themeSettings.blurAmount = parseFloat(blurSlider.value);
        blurValue.textContent = blurSlider.value + 'px';
        applyTheme();
    });

    blurContainer.appendChild(blurSlider);
    blurContainer.appendChild(blurValue);
    blurGroup.appendChild(blurLabel);
    blurGroup.appendChild(blurContainer);

    const activeColorGroup = document.createElement('div');
    activeColorGroup.className = 'setting-group';
    const activeColorLabel = document.createElement('label');
    activeColorLabel.textContent = 'Active Text Color';
    const activeColorInput = document.createElement('input');
    activeColorInput.type = 'text';
    activeColorInput.className = 'coloris';
    activeColorInput.value = themeSettings.activeTextColor;
    activeColorInput.addEventListener('input', () => {
        themeSettings.activeTextColor = activeColorInput.value;
        applyTheme();
    });
    activeColorGroup.appendChild(activeColorLabel);
    activeColorGroup.appendChild(activeColorInput);

    const inactiveColorGroup = document.createElement('div');
    inactiveColorGroup.className = 'setting-group';
    const inactiveColorLabel = document.createElement('label');
    inactiveColorLabel.textContent = 'Inactive Text Color';
    const inactiveColorInput = document.createElement('input');
    inactiveColorInput.type = 'text';
    inactiveColorInput.className = 'coloris';
    inactiveColorInput.value = themeSettings.inactiveTextColor;
    inactiveColorInput.addEventListener('input', () => {
        themeSettings.inactiveTextColor = inactiveColorInput.value;
        applyTheme();
    });
    inactiveColorGroup.appendChild(inactiveColorLabel);
    inactiveColorGroup.appendChild(inactiveColorInput);

    const activeBlurGroup = document.createElement('div');
    activeBlurGroup.className = 'setting-group';
    const activeBlurLabel = document.createElement('label');
    activeBlurLabel.innerHTML = 'Active Text Blur <span style="color:#666;font-size:13px;">(default: 0px)</span>';

    const activeBlurContainer = document.createElement('div');
    activeBlurContainer.style.display = 'flex';
    activeBlurContainer.style.alignItems = 'center';
    activeBlurContainer.style.gap = '12px';

    const activeBlurSlider = document.createElement('input');
    activeBlurSlider.type = 'range';
    activeBlurSlider.min = '0';
    activeBlurSlider.max = '3';
    activeBlurSlider.step = '0.1';
    activeBlurSlider.value = themeSettings.activeBlurAmount;
    activeBlurSlider.style.flex = '1';

    const activeBlurValue = document.createElement('span');
    activeBlurValue.textContent = themeSettings.activeBlurAmount + 'px';
    activeBlurValue.style.minWidth = '45px';
    activeBlurValue.style.color = '#aaa';

    activeBlurSlider.addEventListener('input', () => {
        themeSettings.activeBlurAmount = parseFloat(activeBlurSlider.value);
        activeBlurValue.textContent = activeBlurSlider.value + 'px';
        applyTheme();
    });

    activeBlurContainer.appendChild(activeBlurSlider);
    activeBlurContainer.appendChild(activeBlurValue);
    activeBlurGroup.appendChild(activeBlurLabel);
    activeBlurGroup.appendChild(activeBlurContainer);

    settingsContainer.appendChild(bgColorGroup);
    settingsContainer.appendChild(fontGroup);
    settingsContainer.appendChild(blurGroup);
    settingsContainer.appendChild(activeColorGroup);
    settingsContainer.appendChild(inactiveColorGroup);

    const glowGroup = document.createElement('div');
    glowGroup.className = 'setting-group';
    const glowLabel = document.createElement('label');
    glowLabel.innerHTML = 'Active Text Glow <span style="color:#666;font-size:13px;">(default: 0.2px)</span>';

    const glowContainer = document.createElement('div');
    glowContainer.style.display = 'flex';
    glowContainer.style.alignItems = 'center';
    glowContainer.style.gap = '12px';

    const glowSlider = document.createElement('input');
    glowSlider.type = 'range';
    glowSlider.min = '0';
    glowSlider.max = '4';
    glowSlider.step = '0.1';
    glowSlider.value = themeSettings.glowAmount;
    glowSlider.style.flex = '1';

    const glowValue = document.createElement('span');
    glowValue.textContent = themeSettings.glowAmount + 'px';
    glowValue.style.minWidth = '45px';
    glowValue.style.color = '#aaa';

    glowSlider.addEventListener('input', () => {
        themeSettings.glowAmount = parseFloat(glowSlider.value);
        glowValue.textContent = glowSlider.value + 'px';
        applyTheme();
    });

    glowContainer.appendChild(glowSlider);
    glowContainer.appendChild(glowValue);
    glowGroup.appendChild(glowLabel);
    glowGroup.appendChild(glowContainer);

    settingsContainer.appendChild(activeBlurGroup);
    settingsContainer.appendChild(glowGroup);

    settingsSection.appendChild(settingsTitle);
    settingsSection.appendChild(settingsContainer);
    popup.appendChild(settingsSection);

    const bindContainer = document.createElement('div');
    bindContainer.className = 'setting-group';
    bindContainer.style.marginTop = '20px';
    bindContainer.style.padding = '12px';
    bindContainer.style.background = '#151515';
    bindContainer.style.borderRadius = '6px';

    const bindCheckbox = document.createElement('input');
    bindCheckbox.type = 'checkbox';
    bindCheckbox.id = 'bindThemeCheckbox';
    bindCheckbox.checked = !!themeSettings.boundToProject;
    bindCheckbox.style.marginRight = '8px';

    const bindLabel = document.createElement('label');
    bindLabel.htmlFor = 'bindThemeCheckbox';
    bindLabel.textContent = 'Save theme with project';
    bindLabel.style.color = '#fff';

    const bindInfo = document.createElement('p');
    bindInfo.textContent = 'When enabled, these theme settings will be saved in the project file and restored when opened.';
    bindInfo.style.margin = '8px 0 0 24px';
    bindInfo.style.color = '#888';
    bindInfo.style.fontSize = '13px';

    bindCheckbox.addEventListener('change', () => {
        themeSettings.boundToProject = bindCheckbox.checked;

        if (typeof autoSave === 'function') {
            autoSave();
        }
    });

    bindContainer.appendChild(bindCheckbox);
    bindContainer.appendChild(bindLabel);
    bindContainer.appendChild(bindInfo);
    settingsSection.appendChild(bindContainer);

    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Changes';
    applyButton.className = 'add-sub-button';
    applyButton.style.width = '100%';
    applyButton.style.padding = '10px';
    applyButton.style.fontSize = '14px';
    applyButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    popup.appendChild(applyButton);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

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

function applyTheme() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    preview.style.backgroundColor = themeSettings.backgroundColor;

    preview.style.fontFamily = themeSettings.font;

    document.documentElement.style.setProperty('--base-blur', `${themeSettings.blurAmount}px`);
    document.documentElement.style.setProperty('--active-blur', `${themeSettings.activeBlurAmount}px`);
    document.documentElement.style.setProperty('--inactive-blur', `${themeSettings.blurAmount * 1.5}px`);

    document.documentElement.style.setProperty('--active-text-color', themeSettings.activeTextColor);
    document.documentElement.style.setProperty('--inactive-text-color', themeSettings.inactiveTextColor);
    document.documentElement.style.setProperty('--glow-amount', `${themeSettings.glowAmount}px`);
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
});

function getThemeData() {
    if (!themeSettings.boundToProject) return null;

    return {
        ...themeSettings,

        boundToProject: true
    };
}

function loadThemeData(themeData) {
    if (!themeData || !themeData.boundToProject) return;

    Object.assign(themeSettings, themeData);
    applyTheme();
}

window.getThemeData = getThemeData;
window.loadThemeData = loadThemeData;
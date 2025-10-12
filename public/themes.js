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
        glowAmount: 0.2,
        nowordtimings: false
    },
    spotify: {
        name: 'Spotify',
        backgroundColor: '#808080',
        font: 'Circular',
        blurAmount: 0,
        activeTextColor: '#ffffff',
        inactiveTextColor: '#000000ff',
        activeBlurAmount: 0,
        glowAmount: 0,
        nowordtimings: true
    },
    youtubemusic: {
        name: 'YouTube Music',
        backgroundColor: '#111111ff',
        font: 'SF Pro',
        blurAmount: 0,
        activeTextColor: '#ffffff',
        inactiveTextColor: '#705d68',
        activeBlurAmount: 0,
        glowAmount: 0,
        nowordtimings: false
    },
    brat: {
        name: 'Brat',
        backgroundColor: '#8ACE00',
        font: 'Arial Narrow',
        blurAmount: 1.5,
        activeTextColor: '#000000',
        inactiveTextColor: '#808080',
        activeBlurAmount: 1,
        glowAmount: 0,
        nowordtimings: false
    },
    bratalt: {
        name: 'Brat (alt)',
        backgroundColor: '#000000',
        font: 'Arial Narrow',
        blurAmount: 1.5,
        activeTextColor: '#ffffff',
        inactiveTextColor: '#808080',
        activeBlurAmount: 1,
        glowAmount: 0,
        nowordtimings: false
    },
    blue: {
        name: 'BLUE',
        backgroundColor: '#000000',
        font: 'Dela Gothic One',
        blurAmount: 1.5,
        activeTextColor: '#007397',
        inactiveTextColor: '#4d4470',
        activeBlurAmount: 0,
        glowAmount: 0.2,
        nowordtimings: false
    },
    showgirl: {
        name: 'SHOWGIRL',
        backgroundColor: "url('/themes/showgirl/background.jpg')",
        font: 'Steelfish',
        blurAmount: 0.6,
        activeTextColor: '#cb5f40',
        inactiveTextColor: '#cb5f40',
        activeBlurAmount: 0,
        glowAmount: 0.2,
        nowordtimings: false
    }
};
function applyThemePreset(preset) {
    const settings = themePresets[preset];
    if (!settings) return;

    Object.assign(themeSettings, settings);
    applyTheme();

    if (typeof settings.nowordtimings !== 'undefined') {
        window.noWordTimings = settings.nowordtimings;

        const toggle = document.getElementById('noWordTimingsToggle');
        if (toggle) {
            toggle.checked = settings.nowordtimings;
        }
    }

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
    // If the options popup already exists, just switch to the Customization tab
    const optionsPopup = document.querySelector('.options-popup');

    if (optionsPopup) {
        // Popup already exists: switch to Customization tab
        activeTab = 'customization';
        const tabButton = optionsPopup.querySelector('.options-tabs button[data-tab="customization"]');
        if (tabButton) tabButton.click();
    } else if (typeof createOptionsMenu === 'function') {
        // Set the active tab before creating the popup
        activeTab = 'customization';
        createOptionsMenu();
    } else {
        console.warn('createOptionsMenu() is not defined. Cannot open customization tab.');
    }
}



function applyTheme() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    // Handle background image or color with blur effect
    if (themeSettings.backgroundColor.startsWith('url(')) {
        preview.style.background = themeSettings.backgroundColor;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
    } else {
        preview.style.background = themeSettings.backgroundColor;
        preview.style.backdropFilter = 'none';
        preview.style.webkitBackdropFilter = 'none';
    }

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
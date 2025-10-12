const onboardingSteps = [{
        title: 'Welcome',
        content: `
            <div style="display: flex; height: 40px; gap: 20px; align-items: center;">
                <img src="./assets/favicon.png" alt="LyricsEditor Logo" style="width:40px; height:auto;">
                <h2>Welcome to LyricsEditor!</h2>
            </div>
            <p>Create realistic lyrics of any style with advanced features like:</p>
            <div class="feature-grid">
                <div class="feature-item">
                    <i class="fas fa-clock"></i>
                    <span>Word-by-word timing</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-layer-group"></i>
                    <span>Background lyrics</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-paint-brush"></i>
                    <span>Custom themes</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-music"></i>
                    <span>Audio sync</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-eye"></i>
                    <span>Censoring words</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-sync"></i>
                    <span>Frequent updates and changes!</span>
                </div>
            </div>
        `
    },
    {
        title: 'Personalization',
        content: `
            <h2>Choose Your Theme</h2>
            <p>Pick a quick theme that matches your style, or customize your own later!</p>
            <div class="theme-buttons"></div>
            <div class="theme-preview">
                <div class="preview-line">
                    Preview how your lyrics will look
                </div>
            </div>
        `
    },
    {
        title: 'Get Started',
        content: `
            <h2>Start Your Project</h2>
            <div class="start-options">
                <button class="start-option" data-action="new">
                    <i class="fas fa-plus"></i>
                    <h3>New Project</h3>
                    <p>Start from scratch</p>
                </button>
                <button class="start-option" data-action="open">
                    <i class="fas fa-folder-open"></i>
                    <h3>Open Project</h3>
                    <p>Load existing project</p>
                </button>
                <button class="start-option" data-action="example">
                    <i class="fas fa-lightbulb"></i>
                    <h3>Example Project</h3>
                    <p>Start from a template</p>
                </button>
            </div>
        `
    }
];

const themes = {
    default: {
        themename: 'default',
        name: 'Apple Music (Default)',
        backgroundColor: '#000000',
        font: 'SF Pro',
        blurAmount: 1,
        activeTextColor: '#ffffff',
        inactiveTextColor: '#808080',
        activeBlurAmount: 0,
        glowAmount: 0
    },
    spotify: {
        themename: 'spotify',
        name: 'Spotify',
        backgroundColor: '#808080',
        font: 'Circular',
        blurAmount: 0,
        activeTextColor: '#ffffff',
        inactiveTextColor: '#000000ff',
        activeBlurAmount: 0,
        glowAmount: 0
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
        themename: 'brat',
        name: 'Brat',
        backgroundColor: '#8ACE00',
        font: 'Arial Narrow',
        blurAmount: 1.5,
        activeTextColor: '#000000',
        inactiveTextColor: '#808080',
        activeBlurAmount: 1,
        glowAmount: 0
    },
    bratalt: {
        themename: 'bratalt',
        name: 'Brat (alt)',
        backgroundColor: '#000000',
        font: 'Arial Narrow',
        blurAmount: 1.5,
        activeTextColor: '#ffffff',
        inactiveTextColor: '#808080',
        activeBlurAmount: 1,
        glowAmount: 0
    },
    blue: {
        themename: 'blue',
        name: 'BLUE',
        backgroundColor: '#000000',
        font: 'Dela Gothic One',
        blurAmount: 1.5,
        activeTextColor: '#007397',
        inactiveTextColor: '#4d4470',
        activeBlurAmount: 0,
        glowAmount: 0
    },
    showgirl: {
        themename: 'showgirl',
        name: 'SHOWGIRL',
        backgroundColor: "url('/themes/showgirl/background.jpg')",
        font: 'Steelfish',
        blurAmount: 0.6,
        activeTextColor: '#ffffffff',
        inactiveTextColor: '#cb5f40',
        activeBlurAmount: 0,
        glowAmount: 0
    }
};

let currentStep = 0;
let selectedTheme = themes.default;

function createOnboardingPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay active';
    overlay.style.zIndex = '1001';

    const popup = document.createElement('div');
    popup.className = 'onboarding-popup active';
    popup.style.maxWidth = '800px';
    popup.style.width = '95vw';
    popup.style.height = '600px';
    popup.style.background = '#111';
    popup.style.borderRadius = '20px';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';

    const steps = document.createElement('div');
    steps.className = 'onboarding-steps';
    steps.innerHTML = onboardingSteps.map((step, index) => `
        <div class="step ${index === 0 ? 'active' : ''}" data-step="${index}">
            ${step.title}
        </div>
    `).join('');

    const content = document.createElement('div');
    content.className = 'onboarding-content';

    const buttons = document.createElement('div');
    buttons.className = 'onboarding-buttons';
    buttons.innerHTML = `
        <button class="skip-button">Skip</button>
        <div>
            <button class="prev-button" disabled><i class="fas fa-arrow-left" style="margin-right: 10px"></i>Previous</button>
            <button class="next-button">
            <i class="fas fa-arrow-right" style="margin-right: 10px"></i>
            Next</button>
        </div>
    `;

    popup.appendChild(steps);
    popup.appendChild(content);
    popup.appendChild(buttons);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    setupEventListeners(popup);
    showStep(0);
}

function setupEventListeners(popup) {
    const nextBtn = popup.querySelector('.next-button');
    const prevBtn = popup.querySelector('.prev-button');
    const skipBtn = popup.querySelector('.skip-button');

    nextBtn.addEventListener('click', () => {
        if (currentStep < onboardingSteps.length - 1) {
            showStep(currentStep + 1);
        } else {
            completeOnboarding();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    });

    skipBtn.addEventListener('click', completeOnboarding);
}

function showStep(step) {
    currentStep = step;
    const popup = document.querySelector('.onboarding-popup');
    const content = popup.querySelector('.onboarding-content');
    const prevBtn = popup.querySelector('.prev-button');
    const nextBtn = popup.querySelector('.next-button');

    popup.querySelectorAll('.step').forEach((s, i) => {
        s.classList.toggle('active', i === step);
        s.classList.toggle('completed', i < step);
    });

    content.innerHTML = onboardingSteps[step].content;

    prevBtn.disabled = step === 0;
    nextBtn.textContent = step === onboardingSteps.length - 1 ? 'Get Started' : 'Next';

    if (step === 1) {
        initializeThemeStep();
    } else if (step === 2) {
        initializeProjectStep();
    }
}

function initializeThemeStep() {
    const themeButtons = document.querySelector('.theme-buttons');
    themeButtons.innerHTML = Object.entries(themes).map(([key, theme]) => `
        <button class="theme-button ${selectedTheme === theme ? 'active' : ''}" 
                data-theme="${key}"
                style="background: ${theme.backgroundColor.startsWith('url') ? 'darkorange' : theme.backgroundColor}; 
                       color: ${theme.activeTextColor}; 
                       border: 2px solid ${theme.activeTextColor};
                       font-family: ${theme.font};">
            ${theme.name}
        </button>
    `).join('');

    themeButtons.addEventListener('click', (e) => {
        const themeBtn = e.target.closest('.theme-button');
        if (themeBtn) {
            const themeKey = themeBtn.dataset.theme;
            selectedTheme = themes[themeKey];
            updateThemePreview();

            themeButtons.querySelectorAll('.theme-button').forEach(btn =>
                btn.classList.toggle('active', btn === themeBtn)
            );
        }
    });

    updateThemePreview();
}

function updateThemePreview() {
    const preview = document.querySelector('.theme-preview');
    preview.style.background = selectedTheme.backgroundColor;
    preview.style.padding = '20px';
    preview.style.borderRadius = '12px';
    preview.style.marginTop = '20px';

    const line = preview.querySelector('.preview-line');
    line.style.color = selectedTheme.activeTextColor;
    line.style.fontFamily = selectedTheme.font;
    line.style.filter = `blur(${selectedTheme.activeBlurAmount}px)`;
    line.style.textShadow = selectedTheme.glowAmount > 0 ?
        `0 0 ${selectedTheme.glowAmount * 10}px ${selectedTheme.activeTextColor}` :
        'none';
}

function initializeProjectStep() {
    const options = document.querySelectorAll('.start-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            switch (option.dataset.action) {
                case 'new':
                    completeOnboarding();
                    resetwithoutasking();
                    break;
                case 'open':
                    document.getElementById('fileInput').click();
                    completeOnboarding();
                    break;
                case 'example':
                    openExamplesPopup();
                    completeOnboarding();
                    break;
            }
        });
    });
}

function completeOnboarding() {
    if (selectedTheme) {
        applyThemePreset(selectedTheme.themename);
    }

    localStorage.setItem('onboardingCompleted', 'true');

    const overlay = document.querySelector('.popup-overlay');
    if (overlay) overlay.remove();
}

addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('onboardingCompleted')) {
        createOnboardingPopup();
    }
});
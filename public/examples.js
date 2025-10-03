const examples = [
    {
        title: "BLUE",
        artist: "Billie Eilish",
        url: "https://raw.githubusercontent.com/sippedaway/applemusic-lyrics-generator/refs/heads/main/examples/Billie%20Eilish%20-%20BLUE.json",
        cover: "https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c1f62",
        tags: [
            { text: "New background lyrics", color: "#007AFF" },
            { text: "Advanced word timings", color: "#2dffcaff" }
        ]
    },
    {
        title: "Sympathy is a knife",
        artist: "Charli xcx, Ariana Grande",
        url: "https://raw.githubusercontent.com/sippedaway/applemusic-lyrics-generator/refs/heads/main/examples/Charli%20xcx%2C%20Ariana%20Grande%20-%20Sympathy%20is%20a%20knife.json",
        cover: "https://i.scdn.co/image/ab67616d0000b273cb260d46ad3b5cc7f91dc6ee",
        tags: [
            { text: "Multiple people", color: "#FF2D55" },
        ]
    },
    {
        title: "Like That",
        artist: "Future, Metro Boomin, Kendrick Lamar",
        url: "https://raw.githubusercontent.com/sippedaway/applemusic-lyrics-generator/refs/heads/main/examples/Future%2C%20Metro%20Boomin%2C%20Kendrick%20Lamar%20-%20Like%20That.json",
        cover: "https://i.scdn.co/image/ab67616d0000b2731729574fe2a8e391a2ce1ece",
        tags: [
            { text: "Multiple people", color: "#FF2D55" },
            { text: "Swear words", color: "#AF52DE" },
        ]
    },
    {
        title: "LOVE.",
        artist: "Kendrick Lamar, Zacari",
        url: "https://raw.githubusercontent.com/sippedaway/applemusic-lyrics-generator/refs/heads/main/examples/Kendrick%20Lamar%2C%20Zacari%20-%20LOVE..json",
        cover: "https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699",
        tags: [
            { text: "Multiple people", color: "#FF2D55" },
        ]
    },
    {
        title: "The Fate of Ophelia",
        artist: "Taylor Swift",
        url: "https://raw.githubusercontent.com/sippedaway/applemusic-lyrics-editor/refs/heads/main/examples/The%20Fate%20of%20Ophelia.json",
        cover: "https://i.scdn.co/image/ab67616d0000b2733d29cbdaf500d735492c693b",
        tags: [
            { text: "Custom theme", color: "#ff7b00ff" }
        ]
    }
];

function openExamplesPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay active';
    overlay.style.zIndex = '999';

    const popup = document.createElement('div');
    popup.className = 'theme-popup active';
    popup.style.maxWidth = '800px';
    popup.style.width = '95vw';
    popup.style.background = '#111';
    popup.style.borderRadius = '12px';
    popup.style.padding = '24px';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1000';
    popup.style.maxHeight = '90vh';
    popup.style.overflow = 'auto';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '24px';

    const title = document.createElement('h2');
    title.textContent = 'Example Projects';
    title.style.margin = '0';
    title.style.color = '#fff';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'popup-close';
    closeBtn.onclick = () => document.body.removeChild(overlay);

    header.appendChild(title);
    header.appendChild(closeBtn);
    popup.appendChild(header);

    const examplesContainer = document.createElement('div');
    examplesContainer.style.display = 'grid';
    examplesContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    examplesContainer.style.gap = '20px';

    examples.forEach(example => {
        const exampleCard = document.createElement('div');
        exampleCard.style.background = '#1a1a1a';
        exampleCard.style.borderRadius = '8px';
        exampleCard.style.padding = '15px';
        exampleCard.style.cursor = 'pointer';
        exampleCard.style.transition = 'transform 0.2s ease';

        exampleCard.onmouseover = () => exampleCard.style.transform = 'translateY(-5px)';
        exampleCard.onmouseout = () => exampleCard.style.transform = 'translateY(0)';
        exampleCard.onclick = () => loadExample(example.url);

        const cover = document.createElement('img');
        cover.src = example.cover;
        cover.style.width = '100%';
        cover.style.aspectRatio = '1';
        cover.style.borderRadius = '4px';
        cover.style.marginBottom = '12px';

        const songTitle = document.createElement('div');
        songTitle.textContent = example.title;
        songTitle.style.color = '#fff';
        songTitle.style.fontSize = '16px';
        songTitle.style.fontWeight = 'bold';
        songTitle.style.marginBottom = '4px';

        const artistName = document.createElement('div');
        artistName.textContent = example.artist;
        artistName.style.color = '#888';
        artistName.style.fontSize = '14px';
        artistName.style.marginBottom = '12px';

        const tagsContainer = document.createElement('div');
        tagsContainer.style.display = 'flex';
        tagsContainer.style.gap = '6px';
        tagsContainer.style.flexWrap = 'wrap';

        example.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.textContent = tag.text;
            tagElement.style.fontSize = '11px';
            tagElement.style.padding = '4px 8px';
            tagElement.style.borderRadius = '12px';
            tagElement.style.backgroundColor = tag.color + '1A'; 
            tagElement.style.color = tag.color;
            tagElement.style.border = `1px solid ${tag.color}`;
            tagsContainer.appendChild(tagElement);
        });

        exampleCard.appendChild(cover);
        exampleCard.appendChild(songTitle);
        exampleCard.appendChild(artistName);
        exampleCard.appendChild(tagsContainer);
        examplesContainer.appendChild(exampleCard);
    });

    popup.appendChild(examplesContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

async function loadExample(url) {
    if (confirm('This will replace your current project with an example. Are you sure?')) {
        try {1
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch example project');
            }
            const data = await response.json();

            document.getElementById('linesContainer').innerHTML = '';
            localStorage.removeItem('lyricsProject');

            populateEditor(data);
            updatePreview();
            autoSave();

            const overlay = document.querySelector('.popup-overlay');
            if (overlay) document.body.removeChild(overlay);
        } catch (error) {
            console.error('Error loading example:', error);
            alert('Failed to load example project. Please try again later.');
        }
    }
}
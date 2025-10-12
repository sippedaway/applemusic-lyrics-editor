function exportAsSubtitles(format) {
    const data = getLyricsData();
    let output = '';
    
    switch(format) {
        case 'srt':
            data.forEach((line, index) => {
                if (line.type === 'theme') return;
                output += `${index + 1}\n`;
                output += `${formatSRTTime(line.begin)} --> ${formatSRTTime(line.end)}\n`;
                output += `${line.text}\n\n`;
            });
            break;

        case 'vtt':
            output = 'WEBVTT\n\n';
            data.forEach((line, index) => {
                if (line.type === 'theme') return;
                output += `${index + 1}\n`;
                output += `${formatVTTTime(line.begin)} --> ${formatVTTTime(line.end)}\n`;
                output += `${line.text}\n\n`;
            });
            break;

        case 'ass':
    output = `[Script Info]
ScriptType: 4
Collisions: Normal
PlayDepth: 0
Timer: 100.0000

[V4 Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, TertiaryColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, AlphaLevel, Expand, DropShadow, Vertical, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,1,1.00,0.00,2,10,10,10,0,0,0,0,1

[Events]
Format: Marked, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    data.forEach(line => {
        if (line.type === 'theme') return;
        output += `Dialogue: Marked,${formatASSTime(line.begin)},${formatASSTime(line.end)},Default,,0,0,0,,${line.text}\n`;
    });

            break;
    }

    downloadFile(`lyrics.${format}`, output);
}

function exportAsText() {
    const data = getLyricsData();
    let output = data.filter(line => line.type !== 'theme')
                    .map(line => line.text)
                    .join('\n');
    downloadFile('lyrics.txt', output);
}

function exportAsLRC() {
    const data = getLyricsData();
    let output = '[ti:Untitled]\n[ar:Unknown Artist]\n[al:Unknown Album]\n\n';
    
    data.forEach(line => {
        if (line.type === 'theme') return;
        output += `[${formatLRCTime(line.begin)}]${line.text}\n`;
    });

    downloadFile('lyrics.lrc', output);
}

function generateWebsite() {
    const data = getLyricsData() || [];
    const themeData = data.find(item => item.type === 'theme')?.settings || themePresets.default;
    const audioElement = document.getElementById('audioPlayer');
    const audioSrc = audioElement?.src || '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lyrics Viewer</title>
    <style>
        :root {
            --active-text-color: ${themeData.activeTextColor};
            --inactive-text-color: ${themeData.inactiveTextColor};
            --glow-amount: ${themeData.glowAmount}px;
        }
        
        body {
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            background: ${themeData.backgroundColor};
            font-family: ${themeData.font}, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .controls {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 20px;
            padding: 15px 30px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 100;
            align-items: center;
        }

        .volume-control {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #888;
            font-size: 14px;
        }

        .volume-control input[type="range"] {
            width: 100px;
            height: 4px;
            -webkit-appearance: none;
            background: #444;
            border-radius: 2px;
            outline: none;
        }

        .volume-control input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
        }

        .play-controls {
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 12px;
            background: #333;
            color: #888;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        
        button:hover {
            background: #444;
            color: #fff;
        }
        
        button.active {
            background: #0af;
            color: #fff;
        }
        
        .lyrics-container {
            max-width: 800px;
            width: 100%;
            padding: 80px 20px 20px 20px;
            box-sizing: border-box;
        }
        
        .lyric {
            font-size: 32px;
            margin: 20px 0;
            opacity: 0.5;
            transition: all 0.3s ease;
            filter: blur(${themeData.blurAmount}px);
            cursor: pointer;
        }
        
        .lyric.active {
            opacity: 1;
            filter: blur(${themeData.activeBlurAmount}px);
        }
        
        .lyric.right {
            text-align: right;
        }

        .letter {
            display: inline-block;
            color: var(--inactive-text-color);
            transition: color 0.3s ease;
        }
        
        .letter.active {
            color: var(--active-text-color);
            text-shadow: 0 0 var(--glow-amount) var(--active-text-color);
        }
        
        .time-display {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.5);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            font-family: monospace;
            color: #888;
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
    <div class="controls">
        <div class="volume-control">
            <i class="fas fa-volume-up"></i>
            <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="1">
        </div>
        <div class="play-controls">
            <button onclick="togglePlay()">
                <i class="fas fa-play"></i>Play
            </button>
            <button onclick="stopPlayback()">
                <i class="fas fa-stop"></i>Stop
            </button>
        </div>
        <div class="time-display">00:00 / 00:00</div>
    </div>
    
    <div class="lyrics-container">
        ${data
            .filter(line => line.type !== 'theme')
            .map(line => {
                // Split text into words while preserving spaces
                const words = line.text.split(/(\s+)/g);
                return `
                    <div class="lyric ${line.position}" 
                         data-start="${parseTimestamp(line.begin)}" 
                         data-end="${parseTimestamp(line.end)}"
                         onclick="startFromTime(${parseTimestamp(line.begin)})">
                        ${words.map(word => {
                            if (word.trim() === '') return word; // Return spaces as-is
                            return word.split('').map(char => 
                                `<span class="letter">${char}</span>`
                            ).join('');
                        }).join('')}
                    </div>
                `;
            }).join('')}
    </div>
    
    ${audioSrc ? `<audio id="audio" src="${audioSrc}"></audio>` : ''}

    <script>
        const audio = document.getElementById('audio');
        const lyrics = document.querySelectorAll('.lyric');
        const timeDisplay = document.querySelector('.time-display');
        const volumeSlider = document.getElementById('volumeSlider');
        let isPlaying = false;
        let playStartTime = 0;
        let playRequestId = null;

        // Add volume control
        if (audio && volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                audio.volume = volumeSlider.value;
            });
        }

        function formatTime(seconds) {
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return \`\${String(min).padStart(2, '0')}:\${String(sec).padStart(2, '0')}\`;
        }

        function updateTimeDisplay(currentTime) {
            const duration = audio ? audio.duration : Math.max(...Array.from(lyrics).map(l => 
                parseFloat(l.dataset.end) || 0
            ));
            timeDisplay.textContent = \`\${formatTime(currentTime)} / \${formatTime(duration || 0)}\`;
        }

        function startFromTime(time) {
            if (audio) {
                audio.currentTime = time;
                if (!isPlaying) togglePlay();
            } else {
                playStartTime = performance.now() / 1000 - time;
                if (!isPlaying) togglePlay();
            }
        }

        function updatePlayback() {
            if (!isPlaying) return;
            
            const currentTime = audio ? audio.currentTime : (performance.now() / 1000) - playStartTime;
            updateTimeDisplay(currentTime);

            lyrics.forEach(lyric => {
                const start = parseFloat(lyric.dataset.start);
                const end = parseFloat(lyric.dataset.end);
                const letters = lyric.querySelectorAll('.letter');
                
                if (currentTime >= start && currentTime <= end) {
                    lyric.classList.add('active');
                    
                    const duration = end - start;
                    const letterDuration = duration / letters.length;
                    
                    letters.forEach((letter, index) => {
                        if (currentTime >= start + (index * letterDuration)) {
                            letter.classList.add('active');
                        } else {
                            letter.classList.remove('active');
                        }
                    });
                    
                    const containerHeight = window.innerHeight;
                    const lyricTop = lyric.offsetTop;
                    window.scrollTo({
                        top: lyricTop - (containerHeight / 3),
                        behavior: 'smooth'
                    });
                } else {
                    lyric.classList.remove('active');
                    letters.forEach(letter => letter.classList.remove('active'));
                }
            });

            playRequestId = requestAnimationFrame(updatePlayback);
        }

        function togglePlay() {
            const playBtn = document.querySelector('.controls button');
            
            if (isPlaying) {
                if (audio) audio.pause();
                isPlaying = false;
                playBtn.classList.remove('active');
                playBtn.innerHTML = '<i class="fas fa-play"></i>Play';
                cancelAnimationFrame(playRequestId);
            } else {
                if (audio) {
                    audio.play();
                    playStartTime = performance.now() / 1000 - audio.currentTime;
                } else {
                    playStartTime = performance.now() / 1000;
                }
                isPlaying = true;
                playBtn.classList.add('active');
                playBtn.innerHTML = '<i class="fas fa-pause"></i>Pause';
                updatePlayback();
            }
        }

        function stopPlayback() {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            isPlaying = false;
            const playBtn = document.querySelector('.controls button');
            playBtn.classList.remove('active');
            playBtn.innerHTML = '<i class="fas fa-play"></i>Play';
            cancelAnimationFrame(playRequestId);
            lyrics.forEach(lyric => {
                lyric.classList.remove('active');
                lyric.querySelectorAll('.letter').forEach(letter => 
                    letter.classList.remove('active')
                );
            });
            timeDisplay.textContent = '00:00';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (audio) {
            audio.addEventListener('ended', stopPlayback);
        }

        // Initialize time display
        if (audio) {
            audio.addEventListener('loadedmetadata', () => {
                updateTimeDisplay(0);
            });
        }
    </script>
</body>
</html>`;

    return html;
}


function formatSRTTime(timestamp) {
    const parts = timestamp.split(':').map(Number);
    let min = parts[0] || 0;
    let sec = parts[1] || 0;
    let ms  = parts[2] || 0;

    const hh = Math.floor(min / 60).toString().padStart(2, '0');
    const mm = (min % 60).toString().padStart(2, '0');
    const ss = sec.toString().padStart(2, '0');
    const mss = ms.toString().padStart(3, '0'); // milliseconds must be 3 digits

    return `${hh}:${mm}:${ss},${mss}`;
}



function formatVTTTime(timestamp) {
    const parts = timestamp.split(':').map(Number);
    let min = parts[0] || 0;
    let sec = parts[1] || 0;
    let ms  = parts[2] || 0;

    const hh = Math.floor(min / 60).toString().padStart(2, '0');
    const mm = (min % 60).toString().padStart(2, '0');
    const ss = sec.toString().padStart(2, '0');
    const mss = ms.toString().padStart(3, '0'); // milliseconds must be 3 digits

    return `${hh}:${mm}:${ss}.${mss}`;
}


function formatASSTime(timestamp) {
    const parts = timestamp.split(':').map(Number);
    let min = parts[0] || 0;
    let sec = parts[1] || 0;
    let ms  = parts[2] || 0;

    const h = Math.floor(min / 60);
    const m = (min % 60).toString().padStart(2, '0');
    const s = sec.toString().padStart(2, '0');
    const cs = Math.floor(ms / 10).toString().padStart(2, '0'); // centiseconds

    return `${h}:${m}:${s}.${cs}`;
}

function formatLRCTime(timestamp) {
    const parts = timestamp.split(':').map(Number);
    let min = parts[0] || 0;
    let sec = parts[1] || 0;
    let ms  = parts[2] || 0;

    const centi = Math.floor(ms / 10).toString().padStart(2, '0'); // centiseconds
    const mm = min.toString().padStart(2, '0');
    const ss = sec.toString().padStart(2, '0');

    return `${mm}:${ss}.${centi}`;
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function openLyricWebsite() {
    const html = generateWebsite();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

window.exportAsSubtitles = exportAsSubtitles;
window.exportAsText = exportAsText;
window.exportAsLRC = exportAsLRC;
window.openLyricWebsite = openLyricWebsite;
window.generateWebsite = generateWebsite;

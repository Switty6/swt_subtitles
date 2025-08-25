// Audio subtitle manager (optimizat)
class AudioSubtitleManager {
    constructor() {
        this.audioPlayers = new Map();
        this.subtitleElement = document.getElementById('subtitle-text');
        this.audioContainer = document.getElementById('audio-container');
        this.masterVolume = 0.7;
        this.currentTimeout = null;
        this.fadeTimeout = null;
        this.activeSubtitleId = null;
        
        this.initializeCallbacks();
        this.log('AudioSubtitleManager initialized');
    }
    
    initializeCallbacks() {
        window.addEventListener('message', (event) => {
            this.handleMessage(event.data);
        });
        
        // Debug for keyboard
        document.addEventListener('keydown', (event) => {
            if (event.key === 'F8') {
                this.debugInfo();
            }
        });
    }

    // Unified logging (eliminate redundancy)
    log(message, type = 'info') {
        const prefix = type === 'error' ? '[ERROR]' : '[AudioSubtitles]';
        console.log(`${prefix} ${message}`);
        
        // Send callback for all log types
        this.sendCallback('debugLog', {message: `${prefix} ${message}`});
    }
    
    handleMessage(data) {
        const actions = {
            'initialize': () => this.config = data.config,
            'playAudioWithSubtitles': () => this.playAudioWithSubtitles(data),
            'controlAudio': () => this.controlAudio(data.control, data.audioId, data.params),
            'addSubtitleDynamic': () => this.addSubtitleDynamic(data.audioId, data.subtitle),
            'stopAllAudio': () => this.stopAllAudio(),
            'setMasterVolume': () => this.setMasterVolume(data.volume),
            'showSubtitle': () => this.showSubtitle(data.text, data.duration, data.position, data.style),
            'hideSubtitle': () => this.hideSubtitle(),
            'syncSubtitleToTime': () => this.syncSubtitleToTime(data.audioId, data.time, data.subtitle)
        };
        
        const action = actions[data.action];
        if (action) {
            action();
        } else {
            this.log(`Acțiune necunoscută: ${data.action}`, 'error');
        }
    }
    
    playAudioWithSubtitles(data) {
        const audioId = data.audioId;
        
        // Stop the previous audio with the same ID if it exists
        if (this.audioPlayers.has(audioId)) {
            this.stopAudio(audioId);
        }
        
        const audio = this.createAudioElement(data);
        this.setupAudioEventListeners(audio, audioId, data);
        
        // Save in manager
        this.audioPlayers.set(audioId, {
            audio: audio,
            subtitles: data.subtitles || [],
            lastSubtitleIndex: -1,
            startTime: Date.now(),
            audioDuration: 0,
            customEvent: data.customEvent || null,
            serverEvent: data.serverEvent || null
        });
        
        // Add to DOM and start
        this.audioContainer.appendChild(audio);
        
        if (data.autoplay !== false) {
            this.playAudio(audio);
        }
    }
    
    // Helper for creating the audio element (reduce redundancy)
    createAudioElement(data) {
        const audio = document.createElement('audio');
        audio.src = data.audioFile;
        audio.volume = (data.volume || this.masterVolume) * this.masterVolume;
        audio.loop = data.loop || false;
        return audio;
    }
    
    // Helper for configuring event listeners
    setupAudioEventListeners(audio, audioId, data) {
        const events = {
            'loadedmetadata': () => {
                this.log(`Audio încărcat: ${data.audioFile} (${audio.duration.toFixed(2)}s)`);
                const player = this.audioPlayers.get(audioId);
                if (player) {
                    this.validateAndSortSubtitles(player, audio.duration);
                }
            },
            'ended': () => {
                this.log(`Audio terminat: ${audioId}`);
                this.onAudioEnded(audioId);
            },
            'error': (e) => {
                this.log(`Eroare audio ${audioId}: ${e.message}`, 'error');
                this.onAudioError(audioId, e.message);
            },
            'timeupdate': () => {
                this.checkSubtitles(audioId, audio.currentTime);
            }
        };
        
        Object.entries(events).forEach(([eventName, handler]) => {
            audio.addEventListener(eventName, handler);
        });
    }
    
    playAudio(audio) {
        audio.play().catch(e => {
            this.log(`Eroare pornire audio: ${e.message}`, 'error');
        });
    }
    
    validateAndSortSubtitles(player, audioDuration) {
        player.audioDuration = audioDuration;
        
        // Sort subtitles by time
        player.subtitles.sort((a, b) => a.time - b.time);
        
        // Validate that the time does not exceed the audio duration
        const validSubtitles = player.subtitles.filter(subtitle => {
            if (subtitle.time > audioDuration) {
                this.log(`Subtitrare ignorată - timpul (${subtitle.time}s) depășește durata audio-ului (${audioDuration}s): "${subtitle.text}"`);
                return false;
            }
            return true;
        });
        
        player.subtitles = validSubtitles;
        this.log(`Subtitrări validate pentru audio: ${player.subtitles.length} subtitrări`);
    }
    
    checkSubtitles(audioId, currentTime) {
        const player = this.audioPlayers.get(audioId);
        if (!player) return;
        
        const currentTimeMs = currentTime * 1000;
        
        // Find the next subtitle to display
        for (let i = player.lastSubtitleIndex + 1; i < player.subtitles.length; i++) {
            const subtitle = player.subtitles[i];
            const subtitleTimeMs = subtitle.time * 1000;
            
            if (subtitleTimeMs <= currentTimeMs) {
                this.displaySubtitleFromPlayer(player, i, subtitle, audioId);
                player.lastSubtitleIndex = i;
                break;
            } else {
                break;
            }
        }
    }
    
    displaySubtitleFromPlayer(player, index, subtitle, audioId) {
        // Calculate automatic duration if not specified
        let duration = subtitle.duration;
        if (!duration || duration <= 0) {
            duration = this.calculateAutomaticDuration(player, index, subtitle);
        }
        
        // Show subtitle
        const subtitleId = `${audioId}_sub_${index}`;
        this.displaySubtitle(subtitle.text, duration, subtitle.position, subtitle.style, subtitleId);
        
        this.log(`Subtitle shown: "${subtitle.text}" at ${subtitle.time}s for ${duration}ms`);
    }
    
    calculateAutomaticDuration(player, subtitleIndex, subtitle) {
        const nextSubtitle = player.subtitles[subtitleIndex + 1];
        
        if (nextSubtitle) {
            const timeUntilNext = (nextSubtitle.time - subtitle.time) * 1000;
            return Math.max(1000, Math.min(5000, timeUntilNext));
        } else {
            const timeUntilEnd = (player.audioDuration - subtitle.time) * 1000;
            return Math.max(2000, Math.min(8000, timeUntilEnd));
        }
    }
    
    syncSubtitleToTime(audioId, time, subtitle) {
        const player = this.audioPlayers.get(audioId);
        if (!player) {
            this.log(`Audio ID nu există pentru sincronizare: ${audioId}`, 'error');
            return;
        }
        
        subtitle.time = time;
        player.subtitles.push(subtitle);
        player.subtitles.sort((a, b) => a.time - b.time);
        player.lastSubtitleIndex = -1;
        
        this.log(`Subtitrare sincronizată la ${time}s: "${subtitle.text}"`);
    }
    
    displaySubtitle(text, duration, position, style, subtitleId) {
        if (!this.config) return;
        
        const pos = this.config.Positions[position] || this.config.Positions['bottom'];
        const styleData = this.config.Styles[style] || this.config.Styles['default'];
        
        this.clearSubtitleTimeouts();
        
        // Apply styles (consolidated)
        this.applySubtitleStyles(text, pos, styleData);
        
        this.activeSubtitleId = subtitleId;
        
        // Schedule hide
        if (duration > 0) {
            this.currentTimeout = setTimeout(() => {
                this.hideSubtitle();
            }, duration);
        }
        
        // Callback to FiveM
        this.sendCallback('subtitleShown', {
            text: text, 
            duration: duration, 
            subtitleId: subtitleId,
            timestamp: Date.now()
        });
    }
    
    applySubtitleStyles(text, pos, styleData) {
        const element = this.subtitleElement;
        element.textContent = text;
        
        // Position
        element.style.left = pos.x + '%';
        element.style.top = pos.y + '%';
        
        // Styles
        Object.assign(element.style, {
            fontSize: styleData.fontSize,
            color: styleData.color,
            backgroundColor: styleData.backgroundColor,
            fontFamily: styleData.fontFamily
        });
        
        // Display animation
        element.classList.remove('fade-out', 'slide-out');
        element.classList.add('show', 'slide-in');
    }
    
    showSubtitle(text, duration, position, style) {
        this.displaySubtitle(text, duration, position, style, 'manual_subtitle');
    }
    
    hideSubtitle() {
        this.clearSubtitleTimeouts();
        
        const element = this.subtitleElement;
        element.classList.add('slide-out');
        element.classList.remove('slide-in');
        
        this.fadeTimeout = setTimeout(() => {
            element.classList.remove('show', 'slide-out');
            this.activeSubtitleId = null;
        }, 300);
    }
    
    clearSubtitleTimeouts() {
        [this.currentTimeout, this.fadeTimeout].forEach(timeout => {
            if (timeout) {
                clearTimeout(timeout);
            }
        });
        this.currentTimeout = null;
        this.fadeTimeout = null;
    }
    
    controlAudio(action, audioId, params = {}) {
        const player = this.audioPlayers.get(audioId);
        if (!player) {
            this.log(`Audio ID nu există: ${audioId}`, 'error');
            return;
        }
        
        const audio = player.audio;
        const actions = {
            'play': () => this.playAudio(audio),
            'pause': () => audio.pause(),
            'stop': () => this.stopAudio(audioId),
            'setVolume': () => audio.volume = Math.max(0, Math.min(1, params.volume || 0.5)) * this.masterVolume,
            'setTime': () => {
                audio.currentTime = Math.max(0, params.time || 0);
                player.lastSubtitleIndex = -1;
                this.log(`Audio time setat la: ${params.time}s`);
            },
            'getCurrentTime': () => this.sendCallback('audioTimeResponse', {
                audioId: audioId,
                currentTime: audio.currentTime,
                duration: audio.duration
            })
        };
        
        const actionFunction = actions[action];
        if (actionFunction) {
            actionFunction();
        } else {
            this.log(`Acțiune audio necunoscută: ${action}`, 'error');
        }
    }
    
    stopAudio(audioId) {
        const player = this.audioPlayers.get(audioId);
        if (player) {
            player.audio.pause();
            player.audio.src = '';
            if (player.audio.parentNode) {
                player.audio.parentNode.removeChild(player.audio);
            }
            this.audioPlayers.delete(audioId);
            this.log(`Audio oprit: ${audioId}`);
        }
    }
    
    stopAllAudio() {
        Array.from(this.audioPlayers.keys()).forEach(audioId => {
            this.stopAudio(audioId);
        });
        this.hideSubtitle();
        this.log('Toate audio-urile oprite');
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all active audio
        this.audioPlayers.forEach(player => {
            const currentRelativeVolume = player.audio.volume / this.masterVolume;
            player.audio.volume = currentRelativeVolume * this.masterVolume;
        });
        
        this.log(`Master volume setat la: ${this.masterVolume}`);
    }
    
    addSubtitleDynamic(audioId, subtitle) {
        const player = this.audioPlayers.get(audioId);
        if (player) {
            player.subtitles.push(subtitle);
            player.subtitles.sort((a, b) => a.time - b.time);
            this.log(`Subtitrare dinamică adăugată la ${audioId}: ${subtitle.text}`);
        }
    }
    
    onAudioEnded(audioId) {
        const player = this.audioPlayers.get(audioId);
        this.sendCallback('audioEnded', {
            audioId: audioId,
            audioFile: player ? player.audio.src : null,
            customEvent: player ? player.customEvent : null,
            serverEvent: player ? player.serverEvent : null
        });
        this.stopAudio(audioId);
    }
    
    onAudioError(audioId, error) {
        const player = this.audioPlayers.get(audioId);
        this.sendCallback('audioError', {
            audioId: audioId, 
            error: error,
            audioFile: player ? player.audio.src : null
        });
        this.stopAudio(audioId);
    }
    
    sendCallback(event, data) {
        if (typeof fetch !== 'undefined' && GetParentResourceName) {
            fetch(`https://${GetParentResourceName()}/${event}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).catch(err => {
                this.log(`Callback failed for ${event}: ${err.message}`, 'error');
            });
        }
    }
    
    debugInfo() {
        console.log('=== Audio Manager Debug Info ===');
        console.log('Active audio players:', this.audioPlayers.size);
        console.log('Master volume:', this.masterVolume);
        console.log('Active subtitle:', this.activeSubtitleId);
        console.log('Config loaded:', !!this.config);
    }
}

function GetParentResourceName() {
    return window.location.hostname.split('.')[0];
}

// Initialize the manager when the page loads
const audioManager = new AudioSubtitleManager();
window.audioManager = audioManager;
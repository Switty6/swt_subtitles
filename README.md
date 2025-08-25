# 🎬 Advanced Audio Subtitles System for FiveM

A comprehensive and feature-rich subtitle system with audio synchronization for FiveM servers. This resource allows you to play audio files with synchronized subtitles, offering multiple positioning options, custom styling, and advanced playback control.

## ✨ Features

- **🎵 Audio-Subtitle Synchronization**: Timed subtitles that sync with audio playback
- **📍 Multiple Positioning**: Bottom, top, center, bottom-left, bottom-right positioning
- **🎨 Custom Styling**: Multiple built-in styles (default, large, colored, dialog) with full customization
- **⏯️ Advanced Playback Control**: Play, pause, stop, volume control, seek functionality
- **🔄 Dynamic Subtitle Management**: Add subtitles in real-time during playback
- **👥 Multiplayer Support**: Server-side events for synchronized playback across players
- **🎯 Event System**: Custom client and server events for integration with other resources
- **⚡ Performance Optimized**: Efficient NUI communication and memory management
- **🛠️ Developer Friendly**: Easy-to-use exports

## 📦 Installation

1. Download the resource and place it in your `resources` folder
2. Add `ensure subtitles` to your `server.cfg`
3. Place your audio files in the `audio/` directory (`.ogg` format recommended)
4. Restart your server

## 🚀 Quick Start

### Basic Usage

```lua
-- Play audio with subtitles
local subtitles = {
    exports['subtitles']:CreateSubtitle(2.5, "Hello there!", nil, "bottom", "default"),
    exports['subtitles']:CreateSubtitle(5.0, "This is a test subtitle", 3000, "center", "large"),
    exports['subtitles']:CreateSubtitle(8.2, "Goodbye!", nil, "top", "colored")
}

exports['subtitles']:PlayAudioWithSubtitles('audio/test.ogg', subtitles, {
    volume = 0.8,
    audioId = "my_audio_1",
    onEndEvent = "myAudioEnded" -- Client event
})
```

### Display Subtitle Without Audio

```lua
-- Show a simple subtitle for 5 seconds
exports['subtitles']:ShowSubtitle("Important message!", 5000, "center", "large")
```

## 📚 API Reference

### Client Exports

#### `PlayAudioWithSubtitles(audioFile, subtitles, options)`
Plays an audio file with synchronized subtitles.

**Parameters:**
- `audioFile` (string): Path to audio file (relative to resource)
- `subtitles` (table): Array of subtitle objects
- `options` (table): Optional configuration

**Options:**
```lua
{
    volume = 0.7,           -- Audio volume (0.0 - 1.0)
    loop = false,           -- Loop audio
    autoplay = true,        -- Auto-start playback
    audioId = "unique_id",  -- Custom audio identifier
    onEndEvent = "event",   -- Client event when audio ends
    onServerEvent = "event" -- Server event when audio ends
}
```

#### `CreateSubtitle(timeSeconds, text, duration, position, style)`
Creates a subtitle object for use with audio playback.

**Parameters:**
- `timeSeconds` (number): Time in seconds when subtitle should appear
- `text` (string): Subtitle text
- `duration` (number|nil): Display duration in ms (nil for auto-duration)
- `position` (string): Position on screen
- `style` (string): Style preset name

**Positions:**
- `"bottom"` - Bottom center (default)
- `"top"` - Top center
- `"center"` - Screen center
- `"bottom-left"` - Bottom left
- `"bottom-right"` - Bottom right

**Styles:**
- `"default"` - Standard white text
- `"large"` - Larger font size
- `"colored"` - Golden colored text
- `"dialog"` - Dialog-style with serif font

#### `ControlAudio(action, audioId, params)`
Controls audio playback.

**Actions:**
- `"play"` - Start/resume playback
- `"pause"` - Pause playback
- `"stop"` - Stop and cleanup audio
- `"setVolume"` - Set volume (params.volume)
- `"setTime"` - Seek to time (params.time)
- `"getCurrentTime"` - Get current playback time

#### `ShowSubtitle(text, duration, position, style)`
Display a subtitle without audio.

#### `HideSubtitle()`
Hide currently displayed subtitle.

#### `SyncSubtitleToTime(audioId, time, text, duration, position, style)`
Add a subtitle to playing audio at specific time.

#### `StopAllAudio()`
Stop all currently playing audio.

#### `SetMasterVolume(volume)`
Set global volume multiplier.

### Server Events

#### `subtitles:server:playAudioForAll`
Play audio with subtitles for all players.

```lua
TriggerServerEvent('subtitles:server:playAudioForAll', audioFile, subtitles, options)
```

#### `subtitles:server:playAudioForPlayers`
Play audio for specific players.

```lua
local targetPlayers = {1, 2, 3} -- Player IDs
TriggerServerEvent('subtitles:server:playAudioForPlayers', targetPlayers, audioFile, subtitles, options)
```

#### `subtitles:server:controlAudio`
Control audio for all or specific players.

```lua
TriggerServerEvent('subtitles:server:controlAudio', action, audioId, params, targetPlayers)
```

## 🎯 Advanced Examples

### Dynamic Subtitle Addition

```lua
-- Start audio without subtitles
exports['subtitles']:PlayAudioWithSubtitles('audio/dynamic.ogg', {}, {audioId = "dynamic_audio"})

-- Add subtitles dynamically during playback
CreateThread(function()
    Wait(2000)
    exports['subtitles']:SyncSubtitleToTime("dynamic_audio", 2.0, "First subtitle", 2000, "bottom", "default")
    
    Wait(3000)
    exports['subtitles']:SyncSubtitleToTime("dynamic_audio", 5.0, "Second subtitle", nil, "center", "large")
end)
```

### Event-Driven System

```lua
-- Client-side event handler
AddEventHandler('myAudioEnded', function(audioId, audioFile)
    print("Audio finished: " .. audioId)
    -- Trigger next sequence, show notification, etc.
end)

-- Play audio with event callback
exports['subtitles']:PlayAudioWithSubtitles('audio/story.ogg', subtitles, {
    audioId = "story_part_1",
    onEndEvent = "myAudioEnded"
})
```

### Multiplayer Synchronization

```lua
-- Server-side: Play for all players
RegisterCommand('announce', function(source, args)
    local message = table.concat(args, ' ')
    local subtitles = {
        exports['subtitles']:CreateSubtitle(0.5, message, 5000, "center", "large")
    }
    
    TriggerClientEvent('subtitles:client:playAudio', -1, 'audio/announcement.ogg', subtitles, {
        volume = 1.0,
        audioId = "server_announcement"
    })
end, true)
```

### Custom Audio Controls

```lua
-- Create audio control panel
RegisterCommand('audiocontrol', function(source, args)
    local action = args[1]
    local audioId = args[2] or "current_audio"
    
    if action == "pause" then
        exports['subtitles']:ControlAudio("pause", audioId)
    elseif action == "resume" then
        exports['subtitles']:ControlAudio("play", audioId)
    elseif action == "volume" then
        local volume = tonumber(args[3]) or 0.5
        exports['subtitles']:ControlAudio("setVolume", audioId, {volume = volume})
    elseif action == "seek" then
        local time = tonumber(args[3]) or 0
        exports['subtitles']:ControlAudio("setTime", audioId, {time = time})
    end
end)
```

## 🎨 Customization

### Custom Styles

Edit `config.lua` to add or modify subtitle styles:

```lua
Config.Styles = {
    ['mystyle'] = {
        fontSize = '22px',
        color = '#FF6B6B',
        backgroundColor = 'rgba(0, 0, 0, 0.8)',
        fontFamily = 'Impact, sans-serif'
    }
}
```

### Custom Positions

Add new positions in `config.lua`:

```lua
Config.Positions = {
    ['custom-top-left'] = { x = 10, y = 10 },
    ['custom-bottom-center'] = { x = 50, y = 90 }
}
```

### Audio Settings

Configure default audio behavior:

```lua
Config.Audio = {
    volume = 0.7,           -- Default volume
    fadeInDuration = 500,   -- Fade in time (ms)
    fadeOutDuration = 500,  -- Fade out time (ms)
}
```

## 🐛 Debugging

### Enable Debug Mode

Press **F8** while in-game to show debug information in the browser console.

### Debug Commands

```lua
-- Get current time of playing audio
exports['subtitles']:GetAudioCurrentTime("your_audio_id")

-- Check all active audio players
-- (Check browser console for debug info)
```

### Common Issues

1. **Audio not playing**: Ensure audio files are in `.ogg` format and placed in the `audio/` directory
2. **Subtitles not showing**: Check that NUI is initialized (wait 1-2 seconds after resource start)
3. **Timing issues**: Verify subtitle times don't exceed audio duration
4. **Volume issues**: Check both individual audio volume and master volume settings

## 🔧 Performance Tips

- Use `.ogg` format for better compression and compatibility
- Keep subtitle text reasonably short for better readability
- Clean up audio IDs when no longer needed
- Avoid too many simultaneous audio streams

## 📄 Dependencies

- **FiveM Server** (latest recommended)
- **No additional resources required**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📝 License

This project is open source. Feel free to modify and distribute according to your needs.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the developer: **Switty**

---

**Version:** 1.0.0  
**Author:** Switty  
**Last Updated:** 2024

---

*Made with ❤️ for the FiveM community*
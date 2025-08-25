local isNUIReady = false

-- Inițializare NUI
CreateThread(function()
    SetNuiFocus(false, false)
    Wait(1000)
    
    SendNUIMessage({
        action = 'initialize',
        config = Config
    })
    
    isNUIReady = true
    print("^2[Subtitles]^0 NUI system initialized")
end)

-- Funcție helper pentru așteptarea NUI (optimizată)
local function sendToNUI(data, callback)
    if isNUIReady then
        SendNUIMessage(data)
        if callback then callback() end
    else
        CreateThread(function()
            while not isNUIReady do
                Wait(50) -- Redus de la 100ms
            end
            SendNUIMessage(data)
            if callback then callback() end
        end)
    end
end

-- NUI Callbacks (consolidate)
local nuiCallbacks = {
    audioEnded = function(data, cb)
        if data.audioId then
            print("^3[Subtitles]^0 Audio ended: " .. data.audioId)
            
            -- Client event
            if data.customEvent then
                TriggerEvent(data.customEvent, data.audioId, data.audioFile)
            end
            
            -- Server event
            if data.serverEvent then
                TriggerServerEvent('subtitles:server:triggerEvent', 'audioEnded', data.serverEvent, data.audioId, data.audioFile, data.customEvent)
            end
        end
        cb('ok')
    end,

    audioError = function(data, cb)
        print("^1[Subtitles]^0 Audio error: " .. (data.error or "unknown"))
        TriggerServerEvent('subtitles:server:triggerEvent', 'audioError', nil, data.audioId, data.audioFile, {error = data.error})
        cb('ok')
    end,

    audioTimeResponse = function(data, cb)
        print("^5[Subtitles]^0 Audio " .. data.audioId .. " - Current time: " .. data.currentTime .. "s / " .. data.duration .. "s")
        cb('ok')
    end,

    subtitleShown = function(data, cb)
        print("^2[Subtitles]^0 Subtitle shown: " .. data.text .. " (ID: " .. data.subtitleId .. ")")
        cb('ok')
    end,

    debugLog = function(data, cb)
        print("^5[NUI Debug]^0 " .. (data.message or ""))
        cb('ok')
    end
}

-- Înregistrare automată callbacks
for callbackName, callbackFunc in pairs(nuiCallbacks) do
    RegisterNUICallback(callbackName, callbackFunc)
end

-- Server event handlers
RegisterNetEvent('subtitles:client:playAudio')
AddEventHandler('subtitles:client:playAudio', function(audioFile, subtitles, options)
    exports['subtitles']:PlayAudioWithSubtitles(audioFile, subtitles, options)
end)

RegisterNetEvent('subtitles:client:controlAudio')
AddEventHandler('subtitles:client:controlAudio', function(action, audioId, params)
    exports['subtitles']:ControlAudio(action, audioId, params)
end)

 
-- Main export for playing audio with subtitles
exports('PlayAudioWithSubtitles', function(audioFile, subtitles, options)
    options = options or {}
    
    local audioData = {
        action = 'playAudioWithSubtitles',
        audioFile = audioFile,
        subtitles = subtitles or {},
        volume = options.volume or Config.Audio.volume,
        loop = options.loop or false,
        autoplay = options.autoplay ~= false,
        audioId = options.audioId or "audio_" .. GetGameTimer(),
        customEvent = options.onEndEvent,
        serverEvent = options.onServerEvent
    }
    
    sendToNUI(audioData, function()
        print("^2[Subtitles]^0 Audio cu subtitrări pornit: " .. audioFile)
    end)
end)

-- Export for creating subtitles (replaces the 3 functions)
exports('CreateSubtitle', function(timeSeconds, text, duration, position, style)
    return {
        time = timeSeconds,
        text = text,
        duration = duration, -- nil pentru auto, number pentru fixed
        position = position or 'bottom',
        style = style or 'default'
    }
end)

-- Export for synchronizing subtitles
exports('SyncSubtitleToTime', function(audioId, time, text, duration, position, style)
    sendToNUI({
        action = 'syncSubtitleToTime',
        audioId = audioId,
        time = time,
        subtitle = {
            time = time,
            text = text,
            duration = duration,
            position = position or 'bottom',
            style = style or 'default'
        }
    })
end)

-- Export for controlling playback
exports('ControlAudio', function(action, audioId, params)
    sendToNUI({
        action = 'controlAudio',
        control = action,
        audioId = audioId,
        params = params or {}
    })
end)

local function sendSimpleNUIMessage(action, data)
    sendToNUI(table.merge({action = action}, data or {}))
end

exports('StopAllAudio', function()
    sendSimpleNUIMessage('stopAllAudio')
end)

exports('SetMasterVolume', function(volume)
    sendSimpleNUIMessage('setMasterVolume', {volume = volume})
end)

exports('ShowSubtitle', function(text, duration, position, style)
    sendSimpleNUIMessage('showSubtitle', {
        text = text,
        duration = duration or 3000,
        position = position or 'bottom',
        style = style or 'default'
    })
end)

exports('HideSubtitle', function()
    sendSimpleNUIMessage('hideSubtitle')
end)

exports('GetAudioCurrentTime', function(audioId)
    sendSimpleNUIMessage('controlAudio', {
        control = 'getCurrentTime',
        audioId = audioId
    })
end)

function table.merge(t1, t2)
    for k, v in pairs(t2) do
        t1[k] = v
    end
    return t1
end
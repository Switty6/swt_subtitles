-- Multiplayer synchronization events
RegisterNetEvent('subtitles:server:playAudioForAll')
AddEventHandler('subtitles:server:playAudioForAll', function(audioFile, subtitles, options)
    local source = source
    TriggerClientEvent('subtitles:client:playAudio', -1, audioFile, subtitles, options)
end)

RegisterNetEvent('subtitles:server:playAudioForPlayers')
AddEventHandler('subtitles:server:playAudioForPlayers', function(targetPlayers, audioFile, subtitles, options)
    local source = source
    
    for _, playerId in ipairs(targetPlayers) do
        TriggerClientEvent('subtitles:client:playAudio', playerId, audioFile, subtitles, options)
    end
end)

RegisterNetEvent('subtitles:server:controlAudio')
AddEventHandler('subtitles:server:controlAudio', function(action, audioId, params, targetPlayers)
    if targetPlayers then
        for _, playerId in ipairs(targetPlayers) do
            TriggerClientEvent('subtitles:client:controlAudio', playerId, action, audioId, params)
        end
    else
        TriggerClientEvent('subtitles:client:controlAudio', -1, action, audioId, params)
    end
end)

RegisterNetEvent('subtitles:server:triggerEvent')
AddEventHandler('subtitles:server:triggerEvent', function(eventType, eventName, audioId, audioFile, additionalData)
    local source = source
    local player = GetPlayerName(source)
    if eventType == 'audioEnded' then
        print("^3[Subtitles Server]^0 Audio ended: " .. audioId .. " (Player: " .. player .. ")")
        if eventName then
            TriggerEvent(eventName, source, audioId, audioFile, additionalData)
        end
    elseif eventType == 'audioError' then
        local errorMsg = additionalData and additionalData.error or "unknown"
        print("^1[Subtitles Server]^0 Audio error: " .. audioId .. " - " .. errorMsg .. " (Player: " .. player .. ")")
    elseif eventType == 'customEvent' and eventName then
        print("^3[Subtitles Server]^0 Custom event triggered: " .. eventName .. " for audio: " .. audioId .. " (Player: " .. player .. ")")
        TriggerEvent(eventName, source, audioId, audioFile, additionalData)
    end
end)
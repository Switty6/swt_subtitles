Config = {}

Config.Positions = {
    ['bottom'] = { x = 50, y = 85 }, 
    ['top'] = { x = 50, y = 15 }, 
    ['bottom-left'] = { x = 20, y = 85 }, 
    ['bottom-right'] = { x = 80, y = 85 }, 
    ['center'] = { x = 50, y = 50 } 
}

Config.Styles = {
    ['default'] = {
        fontSize = '18px',
        color = '#FFFFFF',
        backgroundColor = 'rgba(0, 0, 0, 0.7)',
        fontFamily = 'Arial, sans-serif'
    },
    ['large'] = {
        fontSize = '24px',
        color = '#FFFFFF',
        backgroundColor = 'rgba(0, 0, 0, 0.8)',
        fontFamily = 'Arial, sans-serif'
    },
    ['colored'] = {
        fontSize = '18px',
        color = '#FFD700',
        backgroundColor = 'rgba(0, 0, 0, 0.7)',
        fontFamily = 'Arial, sans-serif'
    },
    ['dialog'] = {
        fontSize = '20px',
        color = '#F0F0F0',
        backgroundColor = 'rgba(20, 20, 20, 0.9)',
        fontFamily = 'Georgia, serif'
    }
}

-- Audio settings
Config.Audio = {
    volume = 0.7,
    fadeInDuration = 500,
    fadeOutDuration = 500,
}

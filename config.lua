Config = {}

-- Custom Fonts Configuration
Config.CustomFonts = {
    -- Add your custom fonts here
    -- Example:
    -- ['my-custom-font'] = {
    --     file = 'fonts/MyCustomFont.ttf',
    --     format = 'truetype',
    --     weight = 'normal',
    --     style = 'normal'
    -- },
    -- ['my-bold-font'] = {
    --     file = 'fonts/MyBoldFont.ttf',
    --     format = 'truetype',
    --     weight = 'bold',
    --     style = 'normal'
    -- }
    
    -- Uncomment and modify these examples when you add font files:
    -- ['roboto'] = {
    --     file = 'fonts/Roboto-Regular.ttf',
    --     format = 'truetype',
    --     weight = 'normal',
    --     style = 'normal'
    -- },
    -- ['roboto-bold'] = {
    --     file = 'fonts/Roboto-Bold.ttf',
    --     format = 'truetype',
    --     weight = 'bold',
    --     style = 'normal'
    -- }
}

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
    },
    -- Custom font style examples (uncomment and modify as needed)
    -- ['custom-font'] = {
    --     fontSize = '20px',
    --     color = '#FFFFFF',
    --     backgroundColor = 'rgba(0, 0, 0, 0.7)',
    --     fontFamily = 'my-custom-font, Arial, sans-serif'
    -- },
    -- ['bold-custom'] = {
    --     fontSize = '22px',
    --     color = '#FFFFFF',
    --     backgroundColor = 'rgba(0, 0, 0, 0.8)',
    --     fontFamily = 'my-bold-font, Arial, sans-serif'
    -- }
    
    -- Uncomment these when you add the corresponding font files:
    -- ['roboto-style'] = {
    --     fontSize = '20px',
    --     color = '#FFFFFF',
    --     backgroundColor = 'rgba(0, 0, 0, 0.7)',
    --     fontFamily = 'roboto, Arial, sans-serif'
    -- },
    -- ['roboto-bold-style'] = {
    --     fontSize = '22px',
    --     color = '#FFFFFF',
    --     backgroundColor = 'rgba(0, 0, 0, 0.8)',
    --     fontFamily = 'roboto-bold, Arial, sans-serif'
    -- }
}

-- Audio settings
Config.Audio = {
    volume = 0.7,
    fadeInDuration = 500,
    fadeOutDuration = 500,
}

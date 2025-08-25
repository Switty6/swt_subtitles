fx_version 'cerulean'
game 'gta5'

author 'Switty'
description 'Advanced subtitles system with audio synchronization for FiveM'
version '1.0.0'

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

shared_scripts {
    'config.lua'
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/fonts/*.ttf',
    'html/fonts/*.otf',
    'html/fonts/*.woff',
    'html/fonts/*.woff2',
    'audio/*.ogg'
}

ui_page 'html/index.html'
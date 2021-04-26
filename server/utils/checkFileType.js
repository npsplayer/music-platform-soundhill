module.exports.checkFileType = (filelink) => {

    switch (filelink) {
        case 'png':
            return('image/png');
            break;
        case 'gif':
            return('image/gif');
            break;
        case 'bmp':
            return('image/bmp');
            break;
        case 'jpg':
        case 'jpeg':    
            return('image/jpg');
            break;    
        case 'svg':
            return('image/svg+xml');
            break;
        case 'js':
            return('text/javascript');
            break;
        case 'css':
            return('text/css');
            break;
        case 'json':
            return('application/json');
            break;
        case 'swf':
            return('application/x-shockwave-flash');
            break;
        case 'mp3':
            return('audio/mpeg3');
            break;
        case 'eot':
            return('image/webp');
            break;
        case 'ttf':
            return('application/octet-stream');
            break;
        case 'woff':
            return('font/woff');
            break;
        case 'woff2':
            return('font/woff2');
            break;
        case 'html':
            return('text/html');
            break;
        case 'pdf':
            return('application/pdf');
            break;
        default:
            return('application/octet-stream');
    }
}

// Videos
const videos = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/3gpp'];

// Images
const hiec = ['image/heic', 'image/heif'];
const jpeg = ['image/jpeg', 'image/jpg'];
const png = ['image/png'];
const gif = ['image/gif'];
const tiff = ['image/tiff'];
const webp = ['image/webp'];
const dng = ['image/x-adobe-dng', 'image/dng'];
const nef = ['image/x-nikon-nef', 'image/nef'];

export const ACCEPTED_MIME_TYPES = [...videos, ...jpeg, ...png, ...hiec, ...gif, ...tiff, ...webp, ...dng, ...nef];

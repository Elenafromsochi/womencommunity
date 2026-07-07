// Разбор ссылки на медиа → что и как показать в карточке материала.
// Популярные сервисы встраиваются плеером; прямой файл — аудиоплеером;
// всё остальное — кнопкой «Открыть».

export type Media =
  | { kind: "video"; embedUrl: string }
  | { kind: "music"; embedUrl: string; height: number }
  | { kind: "audio"; src: string }
  | { kind: "link"; url: string }
  | null;

const AUDIO_EXT = /\.(mp3|m4a|wav|ogg|aac|flac)(\?|#|$)/i;

export function parseMedia(raw?: string): Media {
  const url = (raw ?? "").trim();
  if (!url) return null;

  // Прямой аудиофайл
  if (AUDIO_EXT.test(url)) return { kind: "audio", src: url };

  // YouTube
  let m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
  if (m) return { kind: "video", embedUrl: `https://www.youtube.com/embed/${m[1]}` };

  // Rutube
  m = url.match(/rutube\.ru\/(?:video|play\/embed)\/([\w]+)/i);
  if (m) return { kind: "video", embedUrl: `https://rutube.ru/play/embed/${m[1]}` };

  // VK Видео (vk.com/video-123_456, vkvideo.ru/…, video_ext.php)
  if (/video_ext\.php/i.test(url)) return { kind: "video", embedUrl: url };
  m = url.match(/(?:vk\.com|vkvideo\.ru)\/video(-?\d+)_(\d+)/i);
  if (m)
    return {
      kind: "video",
      embedUrl: `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}&hd=2`,
    };

  // Vimeo
  m = url.match(/vimeo\.com\/(\d+)/i);
  if (m) return { kind: "video", embedUrl: `https://player.vimeo.com/video/${m[1]}` };

  // Дзен-видео
  m = url.match(/dzen\.ru\/(?:video\/watch\/|embed\/)([\w-]+)/i);
  if (m) return { kind: "video", embedUrl: `https://dzen.ru/embed/${m[1]}` };

  // Яндекс Музыка: трек / альбом / плейлист
  m = url.match(/music\.yandex\.[a-z]+\/album\/(\d+)\/track\/(\d+)/i);
  if (m)
    return {
      kind: "music",
      embedUrl: `https://music.yandex.ru/iframe/#track/${m[2]}/${m[1]}`,
      height: 180,
    };
  m = url.match(/music\.yandex\.[a-z]+\/users\/([^/]+)\/playlists\/(\d+)/i);
  if (m)
    return {
      kind: "music",
      embedUrl: `https://music.yandex.ru/iframe/#playlist/${m[1]}/${m[2]}/`,
      height: 450,
    };
  m = url.match(/music\.yandex\.[a-z]+\/album\/(\d+)/i);
  if (m)
    return {
      kind: "music",
      embedUrl: `https://music.yandex.ru/iframe/#album/${m[1]}`,
      height: 450,
    };

  // SoundCloud
  if (/soundcloud\.com\//i.test(url))
    return {
      kind: "music",
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23bb6b52`,
      height: 166,
    };

  // Всё остальное — открыть по кнопке
  return { kind: "link", url };
}

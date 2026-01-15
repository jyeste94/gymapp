
import Image from "next/image";

type MediaShowcaseProps = {
  image?: string;
  video?: string;
};

const isYouTubeUrl = (url: string) => /youtube\.com|youtu\.be/.test(url.toLowerCase());

const normalizeYouTubeEmbed = (url: string) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const identifier = parsed.pathname.split("/").filter(Boolean)[0];
      if (identifier) {
        return `https://www.youtube.com/embed/${identifier}?rel=0`;
      }
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        if (url.includes("rel=")) {
          return url;
        }
        return url.includes("?") ? `${url}&rel=0` : `${url}?rel=0`;
      }
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0`;
      }
    }
  } catch {
    return url;
  }
  return url;
};

export default function MediaShowcase({ image, video }: MediaShowcaseProps) {
  if (!image && !video) {
    return null;
  }
  const hasImage = Boolean(image);
  const hasVideo = Boolean(video);
  const isYouTube = Boolean(video && isYouTubeUrl(video));
  const videoSrc = video ? (isYouTube ? normalizeYouTubeEmbed(video) : video) : null;
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {hasImage && image && (
        <figure className="overflow-hidden rounded-2xl border">
          <Image src={image} alt="Referencia del ejercicio" className="h-full w-full object-cover" loading="lazy" width={500} height={500} />
        </figure>
      )}
      {hasVideo && videoSrc && (
        <div className="rounded-2xl border bg-black/90 p-2">
          {isYouTube ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                src={videoSrc}
                title="Video de demostracion"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <video controls preload="metadata" className="w-full rounded-xl">
              <source src={videoSrc} type="video/mp4" />
              Tu navegador no soporta video embebido.
            </video>
          )}
        </div>
      )}
    </section>
  );
}

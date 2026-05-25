import imageCompression from "browser-image-compression";

export interface OptimizedImage {
  full: File;
  thumb: File;
}

const HEIC_EXTENSIONS = new Set(["heic", "heif"]);
const getFileExtension = (file: File) => file.name.split(".").pop()?.toLowerCase();
const isHeicFile = (file: File) => {
  const type = file.type.toLowerCase();
  const ext = getFileExtension(file);
  return type === "image/heic" || type === "image/heif" || (!type && ext ? HEIC_EXTENSIONS.has(ext) : false) || (ext ? HEIC_EXTENSIONS.has(ext) : false);
};

async function normalizeImageFile(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;

  try {
    const heic2any = (await import("heic2any")).default;
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch (error) {
    console.warn("HEIC/HEIF conversion failed, falling back to original file:", error);
    return file;
  }
}

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  const normalizedFile = await normalizeImageFile(file);
  const baseName = normalizedFile.name.replace(/\.[^.]+$/, "");

  const full = await imageCompression(normalizedFile, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.85,
    maxIteration: 10,
  });

  const thumb = await imageCompression(normalizedFile, {
    maxSizeMB: 0.15,
    maxWidthOrHeight: 480,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.75,
    maxIteration: 10,
  });

  return {
    full: new File([full], `${baseName}.webp`, { type: "image/webp" }),
    thumb: new File([thumb], `${baseName}-thumb.webp`, { type: "image/webp" }),
  };
}

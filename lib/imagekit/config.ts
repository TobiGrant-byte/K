export const imageKitPublicKey = "public_Ajl2OcqM6AILA8tqE5bj3HCtwhM=";
export const imageKitUrlEndpoint = "https://ik.imagekit.io/drsundayokafor/";

/** True when the URL is served from this project's ImageKit CDN. */
export function isImageKitUrl(url: string): boolean {
  const endpoint = imageKitUrlEndpoint.replace(/\/+$/, "");
  return url.startsWith(`${endpoint}/`) || url.startsWith("https://ik.imagekit.io/");
}

type SignedImageUploadParams = {
  userId: string;
  date: string;
  imageName: string;
};

const encodePathSegment = (segment: string) => {
  let decodedSegment = segment;

  try {
    decodedSegment = decodeURIComponent(segment);
  } catch {
    // Treat malformed percent escapes as literal characters.
  }

  return encodeURIComponent(decodedSegment.normalize("NFC"));
};

export const encodeCloudFrontPath = (path: string) => {
  return path.split("/").map(encodePathSegment).join("/");
};

export const buildSignedImageUploadUrl = (apiUrl: string, params: SignedImageUploadParams) => {
  return `${apiUrl.replace(/\/$/, "")}/signedUrl?${new URLSearchParams(params).toString()}`;
};

export const createImageObjectName = (uniqueId: string) => {
  const asciiId = uniqueId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `${asciiId || "image"}-image`;
};

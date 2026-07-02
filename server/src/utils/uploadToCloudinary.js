import { cloudinary } from "../config/cloudinary.js";

export const uploadBufferToCloudinary = (buffer, options = {}) => {
  const isPdf = buffer && buffer.length >= 4 &&
    buffer[0] === 0x25 && // '%'
    buffer[1] === 0x50 && // 'P'
    buffer[2] === 0x44 && // 'D'
    buffer[3] === 0x46;   // 'F'

  // eslint-disable-next-line no-console
  console.log("uploadBufferToCloudinary:", {
    length: buffer ? buffer.length : 0,
    firstBytes: buffer ? [buffer[0], buffer[1], buffer[2], buffer[3]] : [],
    isPdf,
    folder: options.folder,
    originalResourceType: options.resource_type
  });

  const finalOptions = isPdf ? { ...options, resource_type: "image" } : options;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(finalOptions, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};


import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImage } from "../utils/cropImage";

export const ImageCropModal = ({
  imageSrc,
  onClose,
  onComplete,
  outputWidth = 1024,
  outputHeight = 1536,
  title = "Crop cover"
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImage(imageSrc, croppedAreaPixels, outputWidth, outputHeight);
    const file = new File([blob], "journal-cover.jpg", { type: "image/jpeg" });
    onComplete(file);
  };

  return (
    <div className="crop-modal" role="dialog" aria-modal="true">
      <div className="crop-modal__backdrop" onClick={onClose} />
      <div className="crop-modal__panel">
        <div className="crop-modal__header">
          <h3>{title}</h3>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="crop-modal__body">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={outputWidth / outputHeight}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="crop-modal__footer">
          <label className="crop-modal__zoom">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
          <button type="button" className="primary-btn" onClick={handleSave}>
            Use cropped image
          </button>
        </div>
      </div>
    </div>
  );
};

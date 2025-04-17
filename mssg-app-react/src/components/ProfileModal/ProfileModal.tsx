import Cropper from 'react-easy-crop';
import axios from 'axios';
import { Point } from 'react-easy-crop';
import { useCallback } from 'react';
import { Area } from 'react-easy-crop';
import { useState } from 'react';
import { getCookie } from '../utils';
import { ProfileModalProps } from '../types/profileModal';
import './ProfileModal.css';


const ProfileModal = ({ modalRef, setProfilePicture }: ProfileModalProps) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (newCrop: Point) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imgURL = reader.result?.toString() || '';
      setImgSrc(imgURL);
    });
    reader.readAsDataURL(file);
  };

  const handleBlur = () => {
    setImgSrc('');
  };

  const closeModal = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === modalRef.current) {
      setImgSrc('');
      modalRef.current?.close();
    }
  };

  const handleCloseButton = () => {
    setImgSrc('');
    modalRef.current?.close();
  };

  const getCroppedImg = async (imgSrc: string, pixelCrop: Area): Promise<Blob | null> => {
    const image = new Image();
    image.src = imgSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleApply = async () => {
    if (!croppedAreaPixels || !imgSrc) return;

    const croppedBlob = await getCroppedImg(imgSrc, croppedAreaPixels);
    if (!croppedBlob) return;

    const formData = new FormData();
    formData.append('cropped_image', croppedBlob, 'profile.jpg');
    const uploadProfilePictureEndpoint = 'http://localhost:8000/upload/profile-pic/';
    try {
      const response = await axios.post(uploadProfilePictureEndpoint, formData, {
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
        withCredentials: true,
      });
      const data = response.data;
      setProfilePicture(data.profile_pic);
      localStorage.setItem('profile_pic', data.profile_pic);
    } catch (error: any) {
      console.error(error);
    }
    setImgSrc('');
    modalRef.current?.close();
  };

  return (
    <dialog className="upload-pfp-modal" ref={modalRef} onClick={closeModal}>
      <div className="modal-inner">
        <div className="upload-pfp-form-wrapper">
          <h3>Edit Image</h3>
          <form className="upload-pfp-form">
            <label className="pgp-img-label" htmlFor="pfp-img-input">
              Upload
            </label>
            <input
              id="pfp-img-input"
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              onBlur={handleBlur}
            />
          </form>
        </div>
        <div className="upload-pfp-img-wrapper">
          <div className="img-crop-wrapper">
            {imgSrc && (
              <Cropper
                image={imgSrc}
                crop={crop}
                cropShape="round"
                showGrid={false}
                zoom={zoom}
                aspect={1}
                onCropChange={onCropChange}
                onCropComplete={onCropCompleteCallback}
                onZoomChange={onZoomChange}
              ></Cropper>
            )}
          </div>
        </div>
        <div className="zoom-slider-container">
          {imgSrc && (
            <input
              className="zoom-slider"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
            />
          )}
        </div>
        <div className="edit-pfp-options-wrapper">
          <div className="edit-pfp-options">
            <button className="cancel-pfp-button" onClick={handleCloseButton}>
              Cancel
            </button>
            <button onClick={handleApply} className="apply-pfp-button">
              Apply
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ProfileModal;

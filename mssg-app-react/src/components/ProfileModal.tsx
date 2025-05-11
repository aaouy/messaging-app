import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop';
import { useState, useCallback, useEffect } from 'react';
import { getCookie } from './utils';
import { ProfileModalProps, User } from '../types';

const ProfileModal = ({ modalRef }: ProfileModalProps) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User>();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('Logged in user not found!');
      }

      const user = JSON.parse(storedUser);
      setLoggedInUser(user);
    } catch (error) {
      console.error(error);
    }
  }, []);

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

    try {
      const uploadProfilePictureUrl = 'http://localhost:8000/upload/profile-pic/';
      const csrfCookie = getCookie('csrftoken');
      if (!csrfCookie) throw new Error('CSRF cookie was not able to be fetched from the browser!');

      const response = await fetch(uploadProfilePictureUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfCookie,
        },
        body: formData,
      });

      if (!response.ok)
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      if (!loggedInUser) throw new Error('No user logged in!');

      const data = await response.json();
      loggedInUser.profilePicture = data.profile_pic;
      localStorage.setItem('user', JSON.stringify(loggedInUser));
    } catch (error: any) {
      console.error(error);
    }
    setImgSrc('');
    modalRef.current?.close();
  };

  return (
    <dialog
      className="w-[50vw] h-[80vh] border-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      ref={modalRef}
      onClick={closeModal}
    >
      <div className="flex flex-col pl-[2%] p-[2%] w-full h-full">
        <div className="flex w-1/3 h-[10%] justify-evenly items-center">
          <h3 className="text-black w-1/2">Edit Image</h3>
          <form className="flex items-center justify-between ">
            <label
              className="p-1 pl-3 pr-3 rounded-sm bg-black cursor-pointer text-white inline-block"
              htmlFor="pfp-img-input"
            >
              Upload
            </label>
            <input
              id="pfp-img-input"
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              onBlur={handleBlur}
              hidden
            />
          </form>
        </div>
        <div className="bg-[#f5f5f5] w-full h-full relative">
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
        <div className="flex justify-center items-center h-1/10 w-full">
          {imgSrc && (
            <input
              className="w-1/2 rounded-[50%]"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
            />
          )}
        </div>
        <div className="flex items-center w-full justify-end">
          <div className="flex w-1/4 items-center justify-between">
            <button className="cursor-pointer text-black" onClick={handleCloseButton}>
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="bg-black p-2 pl-4 pr-4 text-white cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ProfileModal;

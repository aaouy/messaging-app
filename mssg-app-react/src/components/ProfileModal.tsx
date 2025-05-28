import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop';
import { useState, useCallback } from 'react';
import { getCookie } from './utils';
import { ProfileModalProps, User } from '../types';
import SuccessAlert from './SuccessAlert';

const ProfileModal = ({ loggedInUser, setLoggedInUser, modalRef }: ProfileModalProps) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

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

    setIsLoading(true);

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
      const newProfilePic: string = data.profile_pic;
      setLoggedInUser((prev: User | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          profilePicture: newProfilePic,
        };
      });
      localStorage.setItem(
        'user',
        JSON.stringify({ ...loggedInUser, profilePicture: newProfilePic })
      );
    } catch (error: any) {
      console.error(error);
    }
    setImgSrc('');
    modalRef.current?.close();
    setIsLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  };

  return (
    <>
    {success ? (<SuccessAlert header='Image Uploaded Successfully' description=''></SuccessAlert>) : (<></>)}
    <dialog
      className="w-[50vw] h-[80vh] border-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      ref={modalRef}
      onClick={closeModal}
    >
      <div className="relative flex flex-col pl-[2%] p-[2%] w-full h-full">
        <div className="flex items-center w-fit h-[10%]">
          <h3 className="text-black mr-6">Edit Image</h3>
          <form className="flex items-center justify-between ">
            <label
              className="hover:scale-105 p-1 pl-3 pr-3 rounded-sm bg-black cursor-pointer text-white inline-block"
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
        <div className='flex justify-end'>
          <div className="flex w-fit items-center relative right-0 bottom-0 justify-between">
            <button className="cursor-pointer relative text-black mr-7" onClick={handleCloseButton}>
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="hover:scale-105 bg-black right-0 p-2 pl-4 pr-4 text-white cursor-pointer"
            >
              {isLoading ? (
                <svg className="left-0 animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="32"
                    strokeDashoffset="32"
                  ></circle>
                </svg>
              ) : (
                <>Apply</>
              )}
            </button>
          </div>
        </div>
      </div>
    </dialog>
    </>
  );
};

export default ProfileModal;

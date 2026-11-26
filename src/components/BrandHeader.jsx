import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoAsset from '../assets/logo.jpeg';

export default function BrandHeader({
  showAdminLink = true,
  adminLabel = 'Admin',
  adminTo = '/admin',
  hidden = false,
}) {
  const [imgSrc, setImgSrc] = useState(logoAsset);
  const [imgFailed, setImgFailed] = useState(false);

  const handleImageError = () => {
    if (imgSrc !== '/logo.jpeg') {
      setImgSrc('/logo.jpeg');
    } else {
      setImgFailed(true);
    }
  };

  return (
    <>
      {/* Centered Large Circular Logo */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          hidden
            ? 'opacity-0 -translate-y-4 pointer-events-none'
            : 'opacity-100'
        }`}
      >
        <Link
          to="/"
          aria-label="Kirei Collection Home"
          className="block rounded-full p-2 bg-[#FDF6F5]/95 backdrop-blur-md border-4 border-[#C8A262] shadow-2xl hover:scale-105 transition-transform duration-300"
        >
          {!imgFailed ? (
            <img
              src={imgSrc}
              alt="Kirei Collection Logo"
              onError={handleImageError}
              className="w-56 h-56 md:w-80 md:h-80 rounded-full object-cover block bg-[#F7E4E2]"
            />
          ) : (
            <div className="w-56 h-56 md:w-80 md:h-80 rounded-full bg-[#B8335A] text-[#FDF6F5] flex items-center justify-center font-serif text-5xl font-bold">
              KC
            </div>
          )}
        </Link>
      </div>

      {/* Admin Link in Top-Right Corner */}
      {showAdminLink && (
        <Link
          to={adminTo}
          className={`fixed top-4 right-4 z-40 px-3.5 py-2 rounded-full bg-[#2D2226]/85 hover:bg-[#B8335A] backdrop-blur-md border border-[#C8A262]/60 text-[#FDF6F5] text-[11px] tracking-widest uppercase font-semibold shadow-lg transition-all duration-300 ${
            hidden
              ? 'opacity-0 -translate-y-4 pointer-events-none'
              : 'opacity-100'
          }`}
        >
          {adminLabel}
        </Link>
      )}
    </>
  );
}
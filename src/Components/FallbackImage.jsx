import React from "react";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
      <rect width="140" height="140" fill="#f3f4f6"/>

      <path
        d="M42 52h56l-5 55H47L42 52z"
        fill="#ffffff"
        stroke="#d1d5db"
        stroke-width="4"
        stroke-linejoin="round"
      />

      <path
        d="M55 52c0-12 7-22 15-22s15 10 15 22"
        fill="none"
        stroke="#9ca3af"
        stroke-width="4"
        stroke-linecap="round"
      />

      <circle cx="58" cy="65" r="3" fill="#9ca3af"/>
      <circle cx="82" cy="65" r="3" fill="#9ca3af"/>

      <path
        d="M56 86c6 7 22 7 28 0"
        fill="none"
        stroke="#9ca3af"
        stroke-width="4"
        stroke-linecap="round"
      />

      <text
        x="70"
        y="126"
        text-anchor="middle"
        font-size="12"
        font-family="Arial, sans-serif"
        fill="#9ca3af"
      >
        Product
      </text>
    </svg>
  `);

const FallbackImage = ({
  src,
  alt = "Product image",
  className = "",
  style = {},
  ...props
}) => {
  return (
    <img
      src={src || FALLBACK_IMAGE}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = FALLBACK_IMAGE;
      }}
      {...props}
    />
  );
};

export default FallbackImage;
export { FALLBACK_IMAGE };
import React, { useState, useEffect } from 'react';
import { cvApi } from '../services/api';

const CVThumbnail = ({ cvId }) => {
  const [thumbUrl, setThumbUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchThumb = async () => {
      try {
        const blob = await cvApi.getThumbnailBlob(cvId);
        const url = URL.createObjectURL(blob);
        if (active) setThumbUrl(url);
      } catch (err) {
        if (active) setError(true);
      }
    };
    fetchThumb();
    return () => { active = false; };
  }, [cvId]);

  if (error || !thumbUrl) {
    return (
      <div style={{ width: '40px', height: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        📄
      </div>
    );
  }

  return (
    <img 
      src={thumbUrl} 
      alt="CV Thumbnail" 
      style={{ width: '40px', height: '54px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }} 
    />
  );
};

export default CVThumbnail;

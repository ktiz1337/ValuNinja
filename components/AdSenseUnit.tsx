
import React, { useEffect } from 'react';

interface AdSenseUnitProps {
  slotId?: string;
  className?: string;
  type?: 'auto' | 'rectangle' | 'vertical';
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({ slotId = "DEFAULT_SLOT", className, type = 'auto' }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.debug('AdSense init delayed or failed', e);
    }
  }, []);

  return (
    <div className={`bg-white border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center p-4 overflow-hidden shadow-inner ${className || 'w-full h-full'}`}>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '100%' }}
           data-ad-client="ca-pub-7036070872302532"
           data-ad-slot={slotId}
           data-ad-format={type}
           data-full-width-responsive="true"></ins>
    </div>
  );
};


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
    <div className={`bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner ${className || 'w-full h-full'}`}>
      <div className="w-full flex justify-between items-center mb-2 px-4">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Intelligence Relay</span>
          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Sponsored Content</span>
      </div>
      <div className="w-full h-full min-h-[50px]">
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', height: '100%' }}
             data-ad-client="ca-pub-7036070872302532"
             data-ad-slot={slotId}
             data-ad-format={type}
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
};

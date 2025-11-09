import React, { useState, useEffect } from 'react';
import { Route } from '../types';
import XIcon from './icons/XIcon';
import LinkIcon from './icons/LinkIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import ShareIcon from './icons/ShareIcon';
import { generateGoogleMapsUrl } from '../utils/mapUtils';

interface ShareModalProps {
  route: Route;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ route, onClose }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const shareUrl = generateGoogleMapsUrl(route);
  const shareText = `Check out this walking route on Google Maps: ${route.name}`;

  useEffect(() => {
    if (linkCopied) {
      const timer = setTimeout(() => setLinkCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [linkCopied]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
    });
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Stroll Path: ${route.name}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Sharing is not supported on this browser. Try copying the link instead.');
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Share "{route.name}"</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><XIcon /></button>
        </div>
        <div className="p-4 space-y-3">
             <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <div className="bg-slate-200 p-2 rounded-full"><LinkIcon className="w-5 h-5 text-slate-700" /></div>
                <span className="font-semibold text-slate-800">{linkCopied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
            <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <div className="bg-green-100 p-2 rounded-full"><WhatsappIcon className="w-5 h-5 text-green-600" /></div>
                <span className="font-semibold text-slate-800">Share on WhatsApp</span>
            </button>
             <button
                onClick={handleGenericShare}
                className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <div className="bg-amber-100 p-2 rounded-full"><ShareIcon className="w-5 h-5 text-amber-500" /></div>
                <span className="font-semibold text-slate-800">More Options...</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

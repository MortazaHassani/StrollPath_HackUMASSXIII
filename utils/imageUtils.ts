const WARM_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?w=400&h=400&fit=crop&q=80&auto=format',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=400&fit=crop&q=80&auto=format',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop&q=80&auto=format',
  'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&h=400&fit=crop&q=80&auto=format',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&h=400&fit=crop&q=80&auto=format',
  'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=400&h=400&fit=crop&q=80&auto=format',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop&q=80&auto=format',
  'https://images.unsplash.com/photo-1473170511457-758872262d51?w=400&h=400&fit=crop&q=80&auto=format'
];

export const getWarmImageUrl = (seed: string, width: number, height: number): string => {
  // Simple hash function to get a somewhat deterministic index from the seed string (route.id)
  const hashCode = (s: string) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
  const index = Math.abs(hashCode(seed)) % WARM_IMAGE_URLS.length;
  const baseUrl = WARM_IMAGE_URLS[index];
  
  // The URLs already contain default w/h, but we can replace them if needed for different contexts (like RouteDetail)
  const url = new URL(baseUrl);
  url.searchParams.set('w', String(width));
  url.searchParams.set('h', String(height));
  return url.toString();
};

export const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("FileReader did not successfully read the file."));
      }
      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use JPEG for better compression for photos
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
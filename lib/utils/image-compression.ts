export async function compressImage(file: File, maxWidth = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Get the compressed image data
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Check if compression actually reduced the file size
        const originalSize = file.size;
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4); // Estimate base64 size

        if (compressedSize < originalSize) {
          resolve(compressedDataUrl);
        } else {
          // If compression didn't reduce size, return original file as data URL
          const originalReader = new FileReader();
          originalReader.readAsDataURL(file);
          originalReader.onload = () => resolve(originalReader.result as string);
          originalReader.onerror = reject;
        }
      };
      img.onerror = (error) => reject(new Error(`Error loading image: ${error}`));
    };
    reader.onerror = (error) => reject(new Error(`Error reading file: ${error}`));
  });
}

// Helper function to convert data URL to Blob
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}


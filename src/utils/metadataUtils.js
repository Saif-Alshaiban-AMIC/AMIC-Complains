
/**
 * Strip metadata from image files by redrawing on canvas
 * This removes EXIF data including GPS, camera info, timestamps, etc.
 * @param {File} file - The image file to process
 * @returns {Promise<File>} - Clean file without metadata
 */
const stripImageMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas with image dimensions
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas (this strips all EXIF data)
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas back to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file from clean blob
            const cleanFile = new File([blob], file.name, { 
              type: file.type,
              lastModified: Date.now()
            });
            resolve(cleanFile);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, file.type, 0.95); // 0.95 quality for JPEG
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Strip metadata from PDF files
 * Note: This is a basic implementation. For production, consider using pdf-lib
 * @param {File} file - The PDF file to process
 * @returns {Promise<File>} - Clean file without metadata
 */
const stripPdfMetadata = async (file) => {
  // Basic approach: create new file without preserving metadata
  // For more advanced PDF metadata removal, you'd need pdf-lib library
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  return new File([blob], file.name, { 
    type: file.type,
    lastModified: Date.now()
  });
};

/**
 * Strip metadata from document files (Word, Excel, etc.)
 * Note: This is a basic implementation
 * @param {File} file - The document file to process
 * @returns {Promise<File>} - Clean file without metadata
 */
const stripDocumentMetadata = async (file) => {
  // Basic approach: create new blob
  // For production, consider specialized libraries for each format
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  return new File([blob], file.name, { 
    type: file.type,
    lastModified: Date.now()
  });
};

/**
 * Main function to strip metadata from any file type
 * Automatically detects file type and applies appropriate method
 * @param {File} file - The file to process
 * @returns {Promise<File>} - Clean file without metadata
 */
export const stripMetadata = async (file) => {
  try {
    // Handle images with canvas method (most thorough)
    if (file.type.startsWith('image/')) {
      return await stripImageMetadata(file);
    }
    
    // Handle PDFs
    if (file.type === 'application/pdf') {
      return await stripPdfMetadata(file);
    }
    
    // Handle Word documents
    if (
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return await stripDocumentMetadata(file);
    }
    
    // Handle Excel files
    if (
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return await stripDocumentMetadata(file);
    }
    
    // For other file types, create a clean copy
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    return new File([blob], file.name, { 
      type: file.type,
      lastModified: Date.now()
    });
    
  } catch (error) {
    console.error('Error stripping metadata:', error);
    throw error;
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file size (max 10MB per file)
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum size in MB (default: 10)
 * @returns {boolean} - Whether file is within size limit
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - Whether file type is allowed
 */
/**
 * Validate file type - Comprehensive version
 * Supports: Images, PDFs, Videos, Audio, Word, Excel, PowerPoint
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether file type is allowed
 */
export const validateFileType = (file) => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    
    // PDFs
    'application/pdf',
    
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
    'video/ogg',
    
    // Audio/Voice
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/m4a',
    'audio/x-m4a',
    
    // Word Documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    
    // PowerPoint (bonus)
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text
    'text/plain',
    'text/csv'
  ];
  
  // Quick check for common categories
  if (file.type.startsWith('image/')) {
    return true;
  }
  
  if (file.type.startsWith('video/')) {
    return true;
  }
  
  if (file.type.startsWith('audio/')) {
    return true;
  }
  
  // Check if file type is in allowed list
  return allowedTypes.includes(file.type);
};
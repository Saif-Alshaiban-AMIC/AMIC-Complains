const convertFilesToBase64 = async (files) => {
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // remove data:*/*;base64,
        resolve({
          filename: file.name,
          content: base64,
          contentType: file.type
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return Promise.all(files.map(readFileAsBase64));
};
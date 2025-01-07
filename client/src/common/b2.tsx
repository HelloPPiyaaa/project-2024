export const uploadImage = async (img: File) => {
  let imgUrl = null;

  const formData = new FormData();
  formData.append("file", img);

  try {
    const uploadResponse = await fetch(
      `${import.meta.env.VITE_DOMAIN}/get-upload-picture`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (uploadResponse.ok) {
      const { filename } = await uploadResponse.json();
      imgUrl = `${import.meta.env.VITE_DOMAIN}/uploads/${filename}`;
    } else {
      throw new Error("Error uploading image");
    }
  } catch (error) {
    console.error("Error during image upload:", error);
  }

  return imgUrl; // ส่งกลับ URL ของไฟล์ที่อัพโหลด
};

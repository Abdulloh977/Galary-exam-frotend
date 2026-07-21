// Cross-origin rasmlarni ham majburiy yuklab olish uchun blob orqali ishlaydigan util.
// Kompyuterda: fayl "Downloads" papkasiga tushadi.
// Telefonda (mobil brauzer): rasm brauzerning yuklab olish menejeri orqali
// avtomatik ravishda qurilmaning galereyasiga (Photos/Gallery) saqlanadi.
export const downloadImage = async (url, filename = "image.jpg") => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error("Rasmni yuklab olishda xatolik:", error);
    // Blob usuli ishlamasa (masalan CORS to'sig'i), rasmni yangi tabda ochamiz —
    // shunda foydalanuvchi uni qo'lda saqlab olishi mumkin bo'ladi.
    window.open(url, "_blank");
    return false;
  }
};

const imagekit = require("../config/imageKit");
const AppError = require("../utils/appErrors");

class ImageService {
  // ================= Upload =================
  static async uploadSingle(file, folder) {
    if (!file) throw new AppError("No file provided", 400);

    const result = await imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}-${file.originalname}`,
      folder,
    });

    return {
      url: result.url,
      fileId: result.fileId,
    };
  }

  static async uploadMultiple(files, folder) {
    if (!files || !files.length) {
      throw new AppError("No files provided", 400);
    }

    const uploads = files.map((file) =>
      imagekit.upload({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname}`,
        folder,
      }),
    );

    const results = await Promise.all(uploads);

    return results.map((r) => ({
      url: r.url,
      fileId: r.fileId,
    }));
  }

  // ================= Delete =================
  static async deleteSingle(fileId) {
    if (!fileId) throw new AppError("fileId is required", 400);
    await imagekit.deleteFile(fileId);
  }

  static async deleteMultiple(fileIds = []) {
    if (!fileIds.length) return;

    await Promise.all(fileIds.map((id) => imagekit.deleteFile(id)));
  }

  // ================= Get Optimized URL =================
  static getImageUrl(filePath, transformations = []) {
    /**
     * filePath مثال:
     * /users/profile-pictures/avatar.png
     */

    return imagekit.url({
      path: filePath,
      transformation: transformations,
    });
  }
}

module.exports = ImageService;

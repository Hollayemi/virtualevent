import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from './error';

// Local disk storage placeholder — swap for S3/Cloudinary/etc. in production.
// Files are served statically from /uploads (see server.ts `express.static`).
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (req: Request, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const userId = (req as any).user?.id ?? 'anon';
        cb(null, `${userId}-${Date.now()}${ext}`);
    },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new AppError('Avatar must be an image file', 400) as unknown as Error);
    }
    cb(null, true);
};

export const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');

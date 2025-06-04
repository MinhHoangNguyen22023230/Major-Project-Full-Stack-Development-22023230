import s3 from "./access";
import {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = process.env.AWS_BUCKET_NAME as string;
const BUCKET_REGION = process.env.AWS_BUCKET_REGION as string;
const PUBLIC_URL_PREFIX = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/`;

// --- Helper to build S3 keys ---
const buildKey = (folder: string, id: string | undefined, filename: string) => {
    if (id) {
        return `${folder}/${id}/${filename}`;
    }
    return `${folder}/${filename}`;
};

// --- Admin ---
export async function uploadAdminImage(adminId: string, filename: string, body: Buffer | Uint8Array | Blob | string, contentType?: string) {
    await deleteAdminImage(adminId);
    const key = buildKey("admin", adminId, filename);
    await uploadFile(key, body, contentType);
    return PUBLIC_URL_PREFIX + key;
}
export async function getAdminImage(adminId: string, filename: string) {
    return getFile(buildKey("admin", adminId, filename));
}
export async function deleteAdminImage(adminId: string) {
    const prefix = `admin/${adminId}/`;
    const keys = await listFiles(prefix);
    if (keys.length > 0) {
        for (const key of keys) {
            if (key) await deleteFile(key);
        }
    }
    return true;
}
export async function listAdminImages(adminId: string) {
    return listFiles(`admin/${adminId}/`);
}

// --- Brand ---
export async function uploadBrandImage(brandId: string, filename: string, body: Buffer | Uint8Array | Blob | string, contentType?: string) {
    await deleteBrandImage(brandId);
    const key = buildKey("brand", brandId, filename);
    await uploadFile(key, body, contentType);
    return PUBLIC_URL_PREFIX + key;
}
export async function getBrandImage(brandId: string, filename: string) {
    return getFile(buildKey("brand", brandId, filename));
}
export async function deleteBrandImage(brandId: string) {
    const prefix = `brand/${brandId}/`;
    const keys = await listFiles(prefix);
    if (keys.length > 0) {
        for (const key of keys) {
            if (key) await deleteFile(key);
        }
    }
    return true;
}
export async function listBrandImages(brandId: string) {
    return listFiles(`brand/${brandId}/`);
}

// --- Category ---
export async function uploadCategoryImage(categoryId: string, filename: string, body: Buffer | Uint8Array | Blob | string, contentType?: string) {
    await deleteCategoryImage(categoryId);
    const key = buildKey("category", categoryId, filename);
    await uploadFile(key, body, contentType);
    return PUBLIC_URL_PREFIX + key;
}
export async function getCategoryImage(categoryId: string, filename: string) {
    return getFile(buildKey("category", categoryId, filename));
}
export async function deleteCategoryImage(categoryId: string) {
    const prefix = `category/${categoryId}/`;
    const keys = await listFiles(prefix);
    if (keys.length > 0) {
        for (const key of keys) {
            if (key) await deleteFile(key);
        }
    }
    return true;
}
export async function listCategoryImages(categoryId: string) {
    return listFiles(`category/${categoryId}/`);
}

// --- User ---
export async function uploadUserImage(userId: string, filename: string, body: Buffer | Uint8Array | Blob | string, contentType?: string) {
    await deleteUserImage(userId);
    const key = buildKey("user", userId, filename);
    await uploadFile(key, body, contentType);
    return PUBLIC_URL_PREFIX + key;
}
export async function getUserImage(userId: string, filename: string) {
    return getFile(buildKey("user", userId, filename));
}
export async function deleteUserImage(userId: string) {
    const prefix = `user/${userId}/`;
    const keys = await listFiles(prefix);
    if (keys.length > 0) {
        for (const key of keys) {
            if (key) await deleteFile(key);
        }
    }
    return true;
}
export async function listUserImages(userId: string) {
    return listFiles(`user/${userId}/`);
}

// --- Product ---
export async function uploadProductImage(productId: string, filename: string, body: Buffer | Uint8Array | Blob | string, contentType?: string) {
    await deleteProductImage(productId);
    const key = buildKey("product", productId, filename);
    await uploadFile(key, body, contentType);
    return PUBLIC_URL_PREFIX + key;
}
export async function getProductImage(productId: string, filename: string) {
    return getFile(buildKey("product", productId, filename));
}
export async function deleteProductImage(productId: string) {
    const prefix = `product/${productId}/`;
    const keys = await listFiles(prefix);
    if (keys.length > 0) {
        for (const key of keys) {
            if (key) await deleteFile(key);
        }
    }
    return true;
}
export async function listProductImages(productId: string) {
    return listFiles(`product/${productId}/`);
}

// --- Default ---
export async function getDefaultImage(filename: string) {
    return getFile(buildKey("default", undefined, filename));
}
export async function getSignedDefaultImageUrl(filename: string, expiresInSeconds = 3600) {
    return getSignedFileUrl(buildKey("default", undefined, filename), expiresInSeconds);
}

// --- Generic functions (for advanced/fallback usage) ---
export async function uploadFile(key: string, body: Buffer | Uint8Array | Blob | string, contentType?: string) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    return s3.send(command);
}

export async function getFile(key: string) {
    // Return the public URL for the file instead of the raw AWS SDK object
    return PUBLIC_URL_PREFIX + key;
}

export async function deleteFile(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    return s3.send(command);
}

export async function listFiles(prefix?: string) {
    const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
    });
    const result = await s3.send(command);
    // Return just the keys as an array of strings
    return (result.Contents ?? []).map(obj => obj.Key).filter(Boolean) as string[];
}

export async function getSignedFileUrl(key: string, expiresInSeconds = 3600) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

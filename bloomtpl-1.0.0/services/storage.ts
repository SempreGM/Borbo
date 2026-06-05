import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  MAX_SITE_IMAGE_UPLOAD_SIZE_BYTES,
  MAX_SITE_IMAGE_UPLOAD_SIZE_LABEL,
} from "@/lib/heroBanner";

export const SITE_ASSETS_BUCKET = "site-assets";
export const PRODUCT_IMAGES_BUCKET = "product-images";

export async function uploadImage(file: File, bucket = SITE_ASSETS_BUCKET) {
  if (file.size > MAX_SITE_IMAGE_UPLOAD_SIZE_BYTES) {
    throw new Error(`A imagem ultrapassa o limite de ${MAX_SITE_IMAGE_UPLOAD_SIZE_LABEL}.`);
  }

  const supabase = createSupabaseBrowserClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}

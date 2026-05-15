import { apiGet, apiUpload } from "./api";

export type CatalogStats = {
  categoriesCount: number;
  productsCount: number;
  brandsCount: number;
};

export type UploadedImage = {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export function getCatalogStats() {
  return apiGet<CatalogStats>("/admin/stats/catalog");
}

export function uploadImage(file: File, type: "products" | "categories" | "brands" | "general") {
  const body = new FormData();
  body.append("file", file);

  return apiUpload<UploadedImage>(`/uploads/image?type=${type}`, body);
}

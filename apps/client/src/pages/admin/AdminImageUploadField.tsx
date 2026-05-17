import { ImagePlus, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { resolveUploadUrl } from "../../lib/products-api";

type AdminImageUploadFieldProps = {
  label: string;
  images: string[];
  multiple?: boolean;
  onSelect: (files: FileList | null) => void;
  onRemove: (image: string) => void;
};

export function AdminImageUploadField({
  label,
  images,
  multiple = false,
  onSelect,
  onRemove,
}: AdminImageUploadFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onSelect(event.target.files);
    event.target.value = "";
  }

  return (
    <div className="admin_field">
      <span>{label}</span>
      <label className="admin_image_upload">
        <input accept="image/*" multiple={multiple} type="file" onChange={handleChange} />
        <ImagePlus size={18} />
        <span>{multiple ? "Добавить изображения" : "Добавить изображение"}</span>
      </label>

      {images.length ? (
        <div className="admin_image_preview_list">
          {images.map((image) => {
            const imageUrl = resolveUploadUrl(image);

            return (
              <div className="admin_image_preview" key={image}>
                {imageUrl ? <img alt="" src={imageUrl} /> : null}
                <button
                  aria-label="Убрать изображение"
                  className="admin_image_remove"
                  type="button"
                  onClick={() => onRemove(image)}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

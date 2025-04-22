import { useCallback } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 4,
}: ImageUploadProps) {
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length + images.length > maxImages) {
        alert(`You can only upload up to ${maxImages} images`);
        return;
      }

      for (const file of files) {
        const fileId = uuidv4();
        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileId, file);

        if (error) console.error(error);

        const imageUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(fileId).data.publicUrl;

        onChange([...images, imageUrl]);
      }
    },
    [images, onChange, maxImages]
  );

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={image}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              multiple={maxImages - images.length > 1}
            />
          </label>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Upload up to {maxImages} product images. First image will be used as the
        main product image.
      </p>
    </div>
  );
}

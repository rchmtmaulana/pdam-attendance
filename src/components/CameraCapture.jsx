import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

const CameraCapture = ({ onPhotoCapture, existingPhoto }) => {
    const [preview, setPreview] = useState(existingPhoto || null);
    const [capturing, setCapturing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar!');
            return;
        }

        if (file.size > 800 * 1024) {
            toast.error('Ukuran foto maksimal 800KB! Gunakan kamera dengan resolusi lebih rendah.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            onPhotoCapture(file);
        };
        reader.readAsDataURL(file);
    };


    const handleCapture = () => {
        fileInputRef.current?.click();
    };

    const handleRetake = () => {
        setPreview(null);
        onPhotoCapture(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm">Belum ada foto</p>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex gap-3">
                {preview ? (
                    <>
                        <button
                            onClick={handleRetake}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                        >
                            📷 Ambil Ulang
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleCapture}
                        disabled={capturing}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        📸 Ambil Foto Kegiatan
                    </button>
                )}
            </div>

            <p className="text-xs text-gray-500 text-center">
                ℹ️ Ambil foto kegiatan yang sedang dilakukan (Live). Maksimal 5MB.
            </p>
        </div>
    );
};

export default CameraCapture;

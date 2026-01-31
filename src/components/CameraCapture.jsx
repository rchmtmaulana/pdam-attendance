import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

const CameraCapture = ({ onPhotoCapture, existingPhoto }) => {
    const [preview, setPreview] = useState(existingPhoto || null);
    const [capturing, setCapturing] = useState(false);
    const fileInputRef = useRef(null);

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width = img.width;
                    let height = img.height;
                    const maxDimension = 1920;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File(
                                    [blob],
                                    file.name,
                                    { type: 'image/jpeg', lastModified: Date.now() }
                                );

                                console.log('Original size:', (file.size / 1024).toFixed(2), 'KB');
                                console.log('Compressed size:', (compressedFile.size / 1024).toFixed(2), 'KB');

                                resolve(compressedFile);
                            } else {
                                reject(new Error('Compression failed'));
                            }
                        },
                        'image/jpeg',
                        0.85
                    );
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar!');
            return;
        }

        setCapturing(true);

        try {
            const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            console.log('Original file size:', originalSizeMB, 'MB');

            let processedFile = file;

            if (file.size > 2 * 1024 * 1024) {
                toast.info('📦 Mengompres foto...');
                processedFile = await compressImage(file);

                const compressedSizeMB = (processedFile.size / (1024 * 1024)).toFixed(2);
                console.log('Compressed file size:', compressedSizeMB, 'MB');
            }

            if (processedFile.size > 5 * 1024 * 1024) {
                toast.error('Ukuran foto terlalu besar! Maksimal 5MB setelah kompresi.');
                setCapturing(false);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                onPhotoCapture(processedFile);
                toast.success('✅ Foto berhasil diambil!');
                setCapturing(false);
            };
            reader.readAsDataURL(processedFile);

        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Gagal memproses foto. Silakan coba lagi.');
            setCapturing(false);
        }
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

                {capturing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center">
                            <svg className="animate-spin h-8 w-8 mx-auto mb-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-sm">Memproses...</p>
                        </div>
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
                    <button
                        onClick={handleRetake}
                        disabled={capturing}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
                    >
                        📷 Ambil Ulang
                    </button>
                ) : (
                    <button
                        onClick={handleCapture}
                        disabled={capturing}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        {capturing ? '⏳ Memproses...' : '📸 Ambil Foto Kegiatan'}
                    </button>
                )}
            </div>

        </div>
    );
};

export default CameraCapture;

const LoadingSpinner = ({ message = 'Memuat data...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full opacity-20"></div>
                </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">{message}</p>
        </div>
    );
};

export default LoadingSpinner;

import { Lightbulb } from "lucide-react";

const RedirectModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed text-black inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" aria-modal="true">
            <div className="bg-white p-6 rounded shadow-lg items-center justify-center flex flex-col transition-opacity duration-300 ease-in-out opacity-100">
                <div className="flex flex-col md:flex-row items-center justify-center mb-4">
                    <Lightbulb className="h-10 w-10 text-yellow-500 mb-2 md:mb-0 md:mr-2" />
                    <h2 className="text-2xl md:text-3xl font-bold">Important Instructions</h2>
                </div>

                <p>You are about to be redirected to the quick survey section.</p>
                <button
                    onClick={onClose}
                    className="mt-4 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-2 px-6 md:px-7 rounded-full border border-[#FCD200] font-medium"
                    aria-label="Close modal"
                >
                    Ok
                </button>
            </div>
        </div>
    );
};

export default RedirectModal;
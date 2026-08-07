/**
 * ImagePreview - fullscreen image viewer for image-type files.
 *
 * Separate from MediaPlayer because images have no video/audio controls,
 * no progress bar, no PiP, and no public-link auto-generation needs.
 * The browser can render the file directly via <img> with the authorized
 * stream URL.
 */
import { X, Download } from 'lucide-react';
import { TelegramFile } from '../lib/api';

interface ImagePreviewProps {
    file: TelegramFile;
    onClose: () => void;
}

export default function ImagePreview({ file, onClose }: ImagePreviewProps) {
    // The stream endpoint returns the file with the user's auth header when
    // accessed via the axios `api` client, but the <img> tag can't set
    // headers. We append the JWT as a query string so the backend (or the
    // axios interceptor in dev) can pick it up. This mirrors the same
    // pattern used for thumbnail URLs in FileCard.
    const token = localStorage.getItem('access_token') || '';
    const baseUrl = file.stream_url;
    const sep = baseUrl.includes('?') ? '&' : '?';
    const authorizedUrl = `${baseUrl}${sep}token=${encodeURIComponent(token)}`;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
            onClick={onClose}
        >
            {/* Top bar */}
            <div
                className="flex items-center justify-between p-4 text-white shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="font-medium truncate flex-1 mr-4">{file.file_name}</p>
                <div className="flex items-center gap-2 shrink-0">
                    <a
                        href={authorizedUrl}
                        download={file.file_name}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Download"
                    >
                        <Download className="w-5 h-5" />
                    </a>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Image area */}
            <div
                className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-0"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={authorizedUrl}
                    alt={file.file_name}
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                />
            </div>
        </div>
    );
}

/**
 * ImagePreview - fullscreen image viewer for image-type files.
 *
 * Separate from MediaPlayer because images have no video/audio controls,
 * no progress bar, no PiP, and no public-link auto-generation needs.
 * The browser can render the file directly via <img> with the authorized
 * stream URL.
 */
import { useState, useEffect } from 'react';
import { X, Download, AlertTriangle } from 'lucide-react';
import { TelegramFile } from '../lib/api';
import { useT } from '../lib/i18n';

interface ImagePreviewProps {
    file: TelegramFile;
    onClose: () => void;
}

export default function ImagePreview({ file, onClose }: ImagePreviewProps) {
    const t = useT();
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    // The stream endpoint returns the file with the user's auth header when
    // accessed via the axios `api` client, but the <img> tag can't set
    // headers. We append the JWT as a query string so the backend (or the
    // axios interceptor in dev) can pick it up. This mirrors the same
    // pattern used for thumbnail URLs in FileCard.
    const token = localStorage.getItem('access_token') || '';
    const baseUrl = file.stream_url;
    const sep = baseUrl.includes('?') ? '&' : '?';
    const authorizedUrl = `${baseUrl}${sep}token=${encodeURIComponent(token)}`;

    // Reset loading state when file changes
    useEffect(() => {
        setStatus('loading');
    }, [file.id]);

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
                        title={t('common.download') || 'Download'}
                    >
                        <Download className="w-5 h-5" />
                    </a>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title={t('common.close') || 'Close'}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Image area */}
            <div
                className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-0 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Loading spinner */}
                {status === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                )}

                {/* Error message */}
                {status === 'error' && (
                    <div className="text-center p-8 max-w-md">
                        <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-5 border border-yellow-500/30">
                            <AlertTriangle className="w-8 h-8 text-yellow-400" />
                        </div>
                        <p className="text-dark-300 mb-4">{t('common.imageLoadError') || 'Image failed to load'}</p>
                        <a
                            href={authorizedUrl}
                            download={file.file_name}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-lg text-white hover:bg-primary-500 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            {t('common.download') || 'Download'}
                        </a>
                    </div>
                )}

                {/* The actual image — hidden while loading or on error */}
                {status !== 'error' && (
                    <img
                        src={authorizedUrl}
                        alt={file.file_name}
                        className={`max-w-full max-h-full object-contain select-none ${status === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        draggable={false}
                        onLoad={() => setStatus('loaded')}
                        onError={() => setStatus('error')}
                    />
                )}
            </div>
        </div>
    );
}

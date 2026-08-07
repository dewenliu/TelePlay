/**
 * UploadModal - informs the user how to upload files.
 *
 * Why a modal instead of a real upload form?
 * ------------------------------------------
 * TelePlay uses Telegram as storage. The browser cannot talk to Telegram directly;
 * files must be sent to the Telegram bot, which forwards them to the storage channel.
 * This modal just shows the bot's deep-link + a reminder that web-side file pickers
 * would have to re-upload to the bot anyway.
 *
 * If/when the backend gains a "web → bot" upload relay endpoint, this modal can be
 * extended with a real <input type="file" /> form.
 */
import { useEffect, useState } from 'react';
import { X, Upload, Send, ExternalLink } from 'lucide-react';
import { useBotInfo } from '../lib/api';
import { useT } from '../lib/i18n';

interface UploadModalProps {
    currentFolderId: number | null;
    onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
    const t = useT();
    const { data: botInfo } = useBotInfo();
    const botUsername = botInfo?.username;
    const botUrl = botUsername ? `https://t.me/${botUsername}` : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-md p-6 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary-400" />
                        {t('upload.title')}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded" title={t('modal.close')}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-dark-800/60 border border-white/[0.04] rounded-lg p-4 mb-4">
                    <p className="text-sm text-dark-300 mb-3">
                        {t('upload.howto')}
                    </p>
                    <ol className="text-sm text-dark-300 space-y-2 list-decimal list-inside">
                        <li>{t('upload.step1')}</li>
                        <li>{t('upload.step2')}</li>
                        <li>{t('upload.step3')}</li>
                    </ol>
                </div>

                {botUrl ? (
                    <a
                        href={botUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {t('upload.openBot')}
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                ) : (
                    <p className="text-xs text-dark-500 text-center">{t('upload.botLoading')}</p>
                )}

                <p className="text-xs text-dark-500 mt-4 text-center">
                    {t('upload.supportedTypes')}
                </p>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-dark-400 hover:text-white transition-colors text-sm"
                    >
                        {t('modal.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

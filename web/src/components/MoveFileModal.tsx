/**
 * MoveFileModal - modal for selecting a destination folder.
 *
 * Remembers the last-picked destination in localStorage so consecutive moves
 * to the same folder don't require scrolling the tree every time.
 */
import { useState, useEffect, useRef } from 'react';
import { X, Folder as FolderIcon, ChevronRight, Home, Star } from 'lucide-react';
import { useFolderTree, TelegramFile, Folder, useMoveFiles, useMoveFolders } from '../lib/api';
import { useAppStore } from '../lib/store';
import { useT } from '../lib/i18n';

interface MoveFileModalProps {
    items: { files: TelegramFile[]; folders: Folder[] };
    onClose: () => void;
}

const LAST_MOVE_TARGET_KEY = 'teleplay.lastMoveTargetId';

export default function MoveFileModal({ items, onClose }: MoveFileModalProps) {
    const t = useT();
    const { data: folderTree, isLoading } = useFolderTree();
    const { mutateAsync: moveFiles, isPending: isFilesPending } = useMoveFiles();
    const { mutateAsync: moveFolders, isPending: isFoldersPending } = useMoveFolders();
    const { addToast, clearSelection } = useAppStore();

    // Try to restore the last-picked target. We store a JSON-serialised {kind,id}
    // so we can tell apart "move to root" (kind='root') from "no prior move" (null).
    const initialTarget = useRef<number | null | undefined>(undefined);
    if (initialTarget.current === undefined) {
        try {
            const raw = window.localStorage.getItem(LAST_MOVE_TARGET_KEY);
            if (raw === null) initialTarget.current = null;
            else {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed.id === 'number') initialTarget.current = parsed.id;
                else if (parsed && parsed.kind === 'root') initialTarget.current = null;
                else initialTarget.current = null;
            }
        } catch {
            initialTarget.current = null;
        }
    }
    const [selectedId, setSelectedId] = useState<number | null>(initialTarget.current ?? null);
    const [autoExpanded, setAutoExpanded] = useState(true);

    const isPending = isFilesPending || isFoldersPending;
    const totalItems = items.files.length + items.folders.length;

    // Persist destination on every change so the next open picks it up.
    useEffect(() => {
        try {
            window.localStorage.setItem(
                LAST_MOVE_TARGET_KEY,
                JSON.stringify(selectedId === null ? { kind: 'root' } : { kind: 'folder', id: selectedId })
            );
        } catch {
            // ignore storage errors
        }
    }, [selectedId]);

    const handleMove = async () => {
        try {
            const promises = [];
            if (items.files.length > 0) {
                promises.push(moveFiles({ ids: items.files.map(f => f.id), folderId: selectedId }));
            }
            if (items.folders.length > 0) {
                const folderIds = items.folders.map(f => f.id);
                if (selectedId && folderIds.includes(selectedId)) {
                    addToast(t('modal.moveSelfError'), 'error');
                    return;
                }
                promises.push(moveFolders({ ids: folderIds, folderId: selectedId }));
            }

            await Promise.all(promises);
            addToast(t('toast.movedOk', { n: totalItems }));
            clearSelection();
            onClose();
        } catch (error) {
            addToast(t('toast.moveFailed'), 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-md p-6 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{t('modal.moveItemsCount', { n: totalItems })}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded" title={t('modal.close')}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-dark-400 mb-4 truncate">
                    {t('modal.selectDest')}
                </p>

                <div className="bg-dark-800 rounded-lg max-h-64 overflow-y-auto mb-4 custom-scrollbar">
                    {/* Root option */}
                    <button
                        onClick={() => setSelectedId(null)}
                        className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-dark-700 transition-colors ${selectedId === null ? 'bg-primary-600/20 text-primary-400' : ''
                            }`}
                    >
                        <Home className="w-4 h-4" />
                        <span className="flex-1 text-left">{t('modal.rootNoFolder')}</span>
                        {initialTarget.current === null && (
                            <span title="last used" className="text-amber-400"><Star className="w-3.5 h-3.5 fill-current" /></span>
                        )}
                    </button>

                    {isLoading ? (
                        <div className="p-4 text-center text-dark-400">{t('modal.loadingFolders')}</div>
                    ) : (
                        folderTree?.map((folder) => (
                            <FolderTreeItem
                                key={folder.id}
                                folder={folder}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                depth={0}
                                defaultExpanded={autoExpanded}
                                isLastUsed={initialTarget.current === folder.id}
                            />
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
                    >
                        {t('modal.cancel')}
                    </button>
                    <button
                        onClick={handleMove}
                        disabled={isPending}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('modal.moving')}
                            </>
                        ) : (
                            t('modal.moveHere')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FolderTreeItem({ folder, selectedId, onSelect, depth, defaultExpanded, isLastUsed }: {
    folder: Folder;
    selectedId: number | null;
    onSelect: (id: number) => void;
    depth: number;
    defaultExpanded: boolean;
    isLastUsed: boolean;
}) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const hasChildren = folder.children && folder.children.length > 0;

    return (
        <div>
            <button
                onClick={() => onSelect(folder.id)}
                className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-dark-700 transition-colors ${selectedId === folder.id ? 'bg-primary-600/20 text-primary-400' : ''
                    }`}
                style={{ paddingLeft: `${16 + depth * 16}px` }}
            >
                {hasChildren ? (
                    <div
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        className="p-0.5"
                    >
                        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                    </div>
                ) : (
                    <div className="w-4" />
                )}
                <FolderIcon className="w-4 h-4 text-primary-400" />
                <span className="truncate flex-1 text-left">{folder.name}</span>
                {isLastUsed && (
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" title="last used" />
                )}
                <span className="text-xs text-dark-500 ml-auto">{folder.file_count}</span>
            </button>

            {expanded && hasChildren && folder.children?.map((child) => (
                <FolderTreeItem
                    key={child.id}
                    folder={child}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    depth={depth + 1}
                    defaultExpanded={defaultExpanded}
                    isLastUsed={isLastUsed}
                />
            ))}
        </div>
    );
}

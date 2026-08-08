/**
 * Lightweight i18n for TelePlay web.
 *
 * - Zero runtime deps.
 * - Persists user language choice in localStorage.
 * - Auto-detects browser language on first load.
 * - Supports `t('key')` with optional `{var}` interpolation.
 * - Supports a single `useT()` hook plus a `t()` function for non-component code.
 *
 * To add a new key: append to both `zh` and `en`.
 * To add a new language: add a new dict and a new entry in `LANGUAGES`.
 */

import { useCallback, useEffect, useState } from 'react';

export type Lang = 'zh' | 'en';

const STORAGE_KEY = 'teleplay.lang';
const DEFAULT_LANG: Lang = 'zh'; // project is zh-first; English-speaking users can switch in the UI.

type Dict = Record<string, string>;

const zh: Dict = {
  // App / Login
  'app.title': 'TelePlay',
  'app.tagline': '从 Telegram 串流你的文件',
  'app.checkingAuth': '正在验证身份…',
  'app.authError': '身份验证失败',
  'app.goLogin': '前往登录',
  'app.processing': '处理中…',
  'app.tokenSaved': '✅ Token 已保存，正在跳转…',
  'app.tokenSaveFailed': '❌ Token 保存到 localStorage 失败',
  'app.noToken': '❌ URL 中没有 token',
  'app.copyTokenHint': 'Token 已复制。打开浏览器 DevTools 控制台并执行：\nlocalStorage.setItem("access_token", "粘贴-token-此处")',
  'app.manualLogin': '手动登录 →',

  // Login page
  'login.codeTitle': '使用登录码登录',
  'login.codePlaceholder': '请输入 6 位登录码',
  'login.submit': '登录',
  'login.verifying': '正在验证…',
  'login.waitingConfirm': '等待确认中…',
  'login.botHint': '向 Bot 发送 {cmd} 即可获取登录码',
  'login.botHintBefore': '向 Bot 发送 ',
  'login.botHintAfter': ' 即可获取登录码',
  'login.orOpenBot': '或直接打开 Bot',
  'login.invalidCode': '登录码无效',

  // FileBrowser header
  'browser.search': '搜索…',
  'browser.myFiles': '我的文件',
  'browser.recent': '最近添加',
  'browser.continueWatching': '继续观看',
  'browser.refresh': '刷新',
  'browser.viewGrid': '网格视图',
  'browser.viewList': '列表视图',
  'browser.filterAll': '全部',
  'browser.filterVideo': '视频',
  'browser.filterAudio': '音频',
  'browser.filterImage': '图片',
  'browser.filterDocument': '文档',
  'browser.filterOther': '其它',
  'browser.newFolder': '新建文件夹',
  'browser.upload': '上传文件',
  'browser.uploadHint': '请把文件发送给 Telegram Bot，由 Bot 上传到此处',
  'browser.pasteCount': '粘贴 ({n})',
  'browser.selectAll': '全选',
  'browser.noFiles': '还没有文件',
  'browser.noFilesHint': '把文件发送给 Telegram Bot 即可上传',
  'browser.loadingMore': '加载中…',
  'browser.noMore': '没有更多了',
  'browser.selectedCount': '已选 {n} 项',

  // Modals
  'modal.cancel': '取消',
  'modal.confirm': '确定',
  'modal.close': '关闭',
  'modal.move': '移动',
  'modal.moving': '移动中…',
  'modal.moveHere': '移动到此处',
  'modal.moveItemsCount': '移动 {n} 个项目',
  'modal.delete': '删除',
  'modal.deleting': '删除中…',
  'modal.deleteConfirmTitle': '确定要删除吗？',
  'modal.deleteConfirmBody': '此操作无法撤销。',
  'modal.newFolder': '新建文件夹',
  'modal.folderName': '文件夹名称',
  'modal.create': '创建',
  'modal.creating': '创建中…',
  'modal.rename': '重命名',
  'modal.renaming': '重命名中…',
  'modal.newName': '新名称',
  'modal.selectDest': '选择目标文件夹',
  'modal.rootNoFolder': '根目录（无文件夹）',
  'modal.loadingFolders': '正在加载文件夹…',
  'modal.moveSelfError': '不能将文件夹移动到自身',
  'modal.copyNotSupported': '暂不支持复制，只能移动（剪切）。',
  'modal.folderWillMove': '此文件夹下的文件会移到根目录。',
  'modal.deleteBody': '此操作无法撤销。',

  // Context menu
  'ctx.play': '播放',
  'ctx.download': '下载',
  'ctx.copyStream': '复制串流链接',
  'ctx.copied': '✓ 已复制',
  'ctx.copyDownload': '复制下载链接',
  'ctx.createPublic': '创建公开链接',
  'ctx.copyPublic': '复制公开链接',
  'ctx.revokePublic': '撤销公开链接',
  'ctx.rename': '重命名',
  'ctx.moveTo': '移动到…',
  'ctx.moveCount': '移动 ({n}) 项',
  'ctx.delete': '删除',
  'ctx.deleteCount': '删除 ({n}) 项',
  'ctx.open': '打开',
  'ctx.selectedHeader': '已选 {n} 项',

  // Toasts
  'toast.deletedOk': '删除成功',
  'toast.deleteFailed': '删除失败',
  'toast.movedOk': '已移动 {n} 个项目',
  'toast.moveFailed': '移动失败',
  'toast.renamedOk': '重命名成功',
  'toast.renameFailed': '重命名失败',
  'toast.folderCreated': '文件夹已创建',
  'toast.folderCreateFailed': '创建文件夹失败',
  'toast.uploadHint': '请把文件发送给 Telegram Bot：{bot}',

  // Upload modal
  'upload.title': '上传文件',
  'upload.howto': 'TelePlay 用 Telegram 作为云存储，浏览器不能直接上传。需把文件发给 Bot，由 Bot 转发到存储频道。',
  'upload.step1': '打开 Telegram，进入 Bot 对话',
  'upload.step2': '发送任意文件（视频 / 音频 / 图片 / 文档）',
  'upload.step3': 'Bot 处理完成后，文件会自动出现在此处',
  'upload.openBot': '打开 Bot',
  'upload.botLoading': 'Bot 信息加载中…',
  'upload.supportedTypes': '支持：视频、音频、图片、文档',

  // Sidebar
  'sidebar.files': '我的文件',
  'sidebar.recent': '最近添加',
  'sidebar.continueWatching': '继续观看',
  'sidebar.storage': '存储',
  'sidebar.language': '语言',
  'sidebar.unlimitedStorage': '无限存储 🚀',
  'sidebar.logout': '退出登录',
  'sidebar.logoutAll': '退出所有设备',
  'sidebar.confirmLogout': '确认退出登录',
  'sidebar.logoutConfirmBody': '确定要结束当前会话吗？',
  'sidebar.logoutEverywhere': '在所有设备退出',
  'sidebar.logoutAllConfirmBody': '这将结束你在**所有设备**上的会话，确定吗？',
  'sidebar.logoutAllPending': '…',

  // Rename modal prompt
  'prompt.renameFile': '重命名文件',
  'prompt.renameFolder': '重命名文件夹',

  // Common
  'common.file': '文件',
  'common.files': '个文件',
  'common.fileCount': '{n} 个文件',
  'common.fileCountSingular': '1 个文件',
  'common.video': '视频',
  'common.audio': '音频',
  'common.image': '图片',
  'common.document': '文档',
  'common.other': '其它',
  'common.unknown': '未知',
  'common.copied': '已复制',
  'common.copy': '复制',
  'common.download': '下载',
  'common.close': '关闭',
  'common.imageLoadError': '图片加载失败，请尝试下载查看',
  'common.resumedFrom': '从 {pos} 续播',

  // Player
  'player.playbackNotSupported': '不支持此格式',
  'player.openInVlc': '用 VLC 打开',
  'player.copyUrl': '复制链接',
  'player.download': '下载',
  'player.close': '关闭',
  'player.originalArtwork': '原始封面',
  'player.maximize': '最大化',
  'player.minimize': '最小化',
  'player.playbackSpeed': '播放速度',
  'player.pictureInPicture': '画中画',
  'player.fullscreen': '全屏',
  'player.exitFullscreen': '退出全屏',
};

const en: Dict = {
  // App / Login
  'app.title': 'TelePlay',
  'app.tagline': 'Stream your files from Telegram',
  'app.checkingAuth': 'Checking authentication…',
  'app.authError': 'Authentication Error',
  'app.goLogin': 'Go to Login',
  'app.processing': 'Processing…',
  'app.tokenSaved': '✅ Token saved! Redirecting…',
  'app.tokenSaveFailed': '❌ Failed to save token to localStorage',
  'app.noToken': '❌ No token in URL',
  'app.copyTokenHint': 'Token copied! Open browser DevTools console and run:\nlocalStorage.setItem("access_token", "paste-token-here")',
  'app.manualLogin': 'Try Manual Login →',

  // Login page
  'login.codeTitle': 'Login with Code',
  'login.codePlaceholder': 'ENTER 6-DIGIT CODE',
  'login.submit': 'Login',
  'login.verifying': 'Verifying…',
  'login.waitingConfirm': 'Waiting for confirmation…',
  'login.botHint': 'Send {cmd} to the bot to get a code.',
  'login.botHintBefore': 'Send ',
  'login.botHintAfter': ' to the bot to get a code.',
  'login.orOpenBot': 'Or open bot directly',
  'login.invalidCode': 'Invalid code',

  // FileBrowser header
  'browser.search': 'Search…',
  'browser.myFiles': 'My Files',
  'browser.recent': 'Recently Added',
  'browser.continueWatching': 'Continue Watching',
  'browser.refresh': 'Refresh',
  'browser.viewGrid': 'Grid view',
  'browser.viewList': 'List view',
  'browser.filterAll': 'All',
  'browser.filterVideo': 'Videos',
  'browser.filterAudio': 'Audio',
  'browser.filterImage': 'Images',
  'browser.filterDocument': 'Documents',
  'browser.filterOther': 'Other',
  'browser.newFolder': 'New Folder',
  'browser.upload': 'Upload',
  'browser.uploadHint': 'Send files to the Telegram bot to upload',
  'browser.pasteCount': 'Paste ({n})',
  'browser.selectAll': 'Select all',
  'browser.noFiles': 'No files found',
  'browser.noFilesHint': 'Upload files by sending them to the Telegram bot',
  'browser.loadingMore': 'Loading…',
  'browser.noMore': 'No more files',
  'browser.selectedCount': '{n} selected',

  // Modals
  'modal.cancel': 'Cancel',
  'modal.confirm': 'OK',
  'modal.close': 'Close',
  'modal.move': 'Move',
  'modal.moving': 'Moving…',
  'modal.moveHere': 'Move Here',
  'modal.moveItemsCount': 'Move {n} Item(s)',
  'modal.delete': 'Delete',
  'modal.deleting': 'Deleting…',
  'modal.deleteConfirmTitle': 'Are you sure?',
  'modal.deleteConfirmBody': 'This action cannot be undone.',
  'modal.newFolder': 'New Folder',
  'modal.folderName': 'Folder name',
  'modal.create': 'Create',
  'modal.creating': 'Creating…',
  'modal.rename': 'Rename',
  'modal.renaming': 'Renaming…',
  'modal.newName': 'New name',
  'modal.selectDest': 'Select destination folder',
  'modal.rootNoFolder': 'Root (No folder)',
  'modal.loadingFolders': 'Loading…',
  'modal.moveSelfError': 'Cannot move a folder into itself',
  'modal.copyNotSupported': 'Copy is not yet supported. Only Move (Cut) is supported.',
  'modal.folderWillMove': 'Files in this folder will be moved to root.',
  'modal.deleteBody': 'This action cannot be undone.',

  // Context menu
  'ctx.play': 'Play',
  'ctx.download': 'Download',
  'ctx.copyStream': 'Copy Stream URL',
  'ctx.copied': '✓ Copied!',
  'ctx.copyDownload': 'Copy Download URL',
  'ctx.createPublic': 'Create Public Link',
  'ctx.copyPublic': 'Copy Public Link',
  'ctx.revokePublic': 'Revoke Public Link',
  'ctx.rename': 'Rename',
  'ctx.moveTo': 'Move to…',
  'ctx.moveCount': 'Move ({n}) Items',
  'ctx.delete': 'Delete',
  'ctx.deleteCount': 'Delete ({n}) Items',
  'ctx.open': 'Open',
  'ctx.selectedHeader': '{n} Selected',

  // Toasts
  'toast.deletedOk': 'Items deleted successfully',
  'toast.deleteFailed': 'Failed to delete items',
  'toast.movedOk': 'Moved {n} item(s) successfully',
  'toast.moveFailed': 'Failed to move items',
  'toast.renamedOk': 'Renamed successfully',
  'toast.renameFailed': 'Failed to rename',
  'toast.folderCreated': 'Folder created',
  'toast.folderCreateFailed': 'Failed to create folder',
  'toast.uploadHint': 'Send files to the Telegram bot: {bot}',

  // Upload modal
  'upload.title': 'Upload files',
  'upload.howto': "TelePlay uses Telegram as cloud storage. The browser can't upload directly. Send the file to the Bot, which forwards it to the storage channel.",
  'upload.step1': 'Open Telegram and start a chat with the Bot',
  'upload.step2': 'Send any file (video / audio / image / document)',
  'upload.step3': 'Once the Bot finishes processing, the file appears here',
  'upload.openBot': 'Open Bot',
  'upload.botLoading': 'Loading bot info…',
  'upload.supportedTypes': 'Supports: video, audio, image, document',

  // Sidebar
  'sidebar.files': 'My Files',
  'sidebar.recent': 'Recently Added',
  'sidebar.continueWatching': 'Continue Watching',
  'sidebar.storage': 'Storage',
  'sidebar.language': 'Language',
  'sidebar.unlimitedStorage': 'Unlimited Storage 🚀',
  'sidebar.logout': 'Logout',
  'sidebar.logoutAll': 'Logout All',
  'sidebar.confirmLogout': 'Confirm Logout',
  'sidebar.logoutConfirmBody': 'Are you sure you want to end your session?',
  'sidebar.logoutEverywhere': 'Logout Everywhere',
  'sidebar.logoutAllConfirmBody': 'This will end your session on **all devices**. Are you sure?',
  'sidebar.logoutAllPending': '…',

  // Rename modal prompt
  'prompt.renameFile': 'Rename file',
  'prompt.renameFolder': 'Rename folder',

  // Common
  'common.file': 'file',
  'common.files': 'files',
  'common.fileCount': '{n} files',
  'common.fileCountSingular': '1 file',
  'common.video': 'Video',
  'common.audio': 'Audio',
  'common.image': 'Image',
  'common.document': 'Document',
  'common.other': 'Other',
  'common.unknown': 'Unknown',
  'common.copied': 'Copied',
  'common.copy': 'Copy',
  'common.download': 'Download',
  'common.close': 'Close',
  'common.imageLoadError': 'Image failed to load. Try downloading instead.',
  'common.resumedFrom': 'Resumed from {pos}',

  // Player
  'player.playbackNotSupported': 'Playback Not Supported',
  'player.openInVlc': 'Open in VLC',
  'player.copyUrl': 'Copy URL',
  'player.download': 'Download',
  'player.close': 'Close',
  'player.originalArtwork': 'Original Artwork',
  'player.maximize': 'Maximize',
  'player.minimize': 'Minimize',
  'player.playbackSpeed': 'Playback Speed',
  'player.pictureInPicture': 'Picture in Picture',
  'player.fullscreen': 'Fullscreen',
  'player.exitFullscreen': 'Exit Fullscreen',
};

const DICTS: Record<Lang, Dict> = { zh, en };

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'en', label: 'English', native: 'English' },
];

/** Read persisted language choice; fall back to browser language; fall back to default. */
function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && (stored === 'zh' || stored === 'en')) return stored;
  const navLang = (window.navigator?.language || '').toLowerCase();
  if (navLang.startsWith('zh')) return 'zh';
  return 'en';
}

let currentLang: Lang = detectInitialLang();
const subscribers = new Set<() => void>();

function setLangInternal(next: Lang) {
  if (next === currentLang) return;
  currentLang = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // localStorage might be unavailable (e.g. private mode); silently ignore.
  }
  subscribers.forEach((fn) => fn());
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  setLangInternal(lang);
}

/**
 * Translate a key, with optional `{var}` interpolation.
 * Missing keys fall back to the key string itself so the UI still works in dev.
 */
export function translate(key: string, vars?: Record<string, string | number>): string {
  const dict = DICTS[currentLang] || DICTS[DEFAULT_LANG];
  let s = dict[key];
  if (s === undefined) {
    // Fall back to the other language so a half-translated UI still renders sensibly.
    const other = currentLang === 'zh' ? DICTS.en : DICTS.zh;
    s = other[key] ?? key;
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return s;
}

/** React hook: returns a `t(key, vars?)` function and re-renders on language change. */
export function useT(): (key: string, vars?: Record<string, string | number>) => string {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }, []);
  return useCallback((key, vars) => translate(key, vars), []);
}

/** Hook that returns the current language + a setter. */
export function useLang(): [Lang, (l: Lang) => void] {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }, []);
  return [currentLang, setLang];
}

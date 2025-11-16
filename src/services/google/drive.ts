// Google Drive API モジュール
// フォルダの検索、ナビゲーション、ファイル操作を実装

import { google } from 'googleapis';
import { getAuthenticatedClient } from './auth.js';
import type { DriveFolder, DriveFolderList } from '../../types/index.js';

const drive = google.drive('v3');

/**
 * ルートフォルダ一覧を取得（"My Drive"直下のフォルダ）
 */
export async function listRootFolders(): Promise<DriveFolder[]> {
  try {
    const auth = await getAuthenticatedClient();

    const response = await drive.files.list({
      auth,
      q: "mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
      fields: 'files(id, name, parents)',
      orderBy: 'name',
      pageSize: 100
    });

    const folders = response.data.files || [];

    return folders.map(file => ({
      id: file.id!,
      name: file.name!,
      parents: file.parents || undefined
    }));
  } catch (error) {
    console.error('ルートフォルダ一覧取得エラー:', error);
    throw new Error('Google Driveのルートフォルダ一覧の取得に失敗しました。');
  }
}

/**
 * 指定フォルダ配下のフォルダ一覧を取得
 */
export async function listFoldersInFolder(parentFolderId: string): Promise<DriveFolder[]> {
  try {
    const auth = await getAuthenticatedClient();

    const response = await drive.files.list({
      auth,
      q: `mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
      fields: 'files(id, name, parents)',
      orderBy: 'name',
      pageSize: 100
    });

    const folders = response.data.files || [];
    return folders.map(file => ({
      id: file.id!,
      name: file.name!,
      parents: file.parents || undefined
    }));
  } catch (error) {
    console.error('フォルダ一覧取得エラー:', error);
    throw new Error('Google Driveのフォルダ一覧の取得に失敗しました。');
  }
}

/**
 * フォルダ情報を取得
 */
export async function getFolderInfo(folderId: string): Promise<DriveFolder> {
  try {
    const auth = await getAuthenticatedClient();

    const response = await drive.files.get({
      auth,
      fileId: folderId,
      fields: 'id, name, parents'
    });

    return {
      id: response.data.id!,
      name: response.data.name!,
      parents: response.data.parents || undefined
    };
  } catch (error) {
    console.error('フォルダ情報取得エラー:', error);
    throw new Error('Google Driveのフォルダ情報の取得に失敗しました。');
  }
}

/**
 * フォルダパスを取得（ルートからの階層）
 * パンくずリスト用
 */
export async function getFolderPath(folderId: string): Promise<DriveFolder[]> {
  try {
    const breadcrumb: DriveFolder[] = [];
    let currentId: string | undefined = folderId;

    // ルートに到達するまで親をたどる
    while (currentId && currentId !== 'root') {
      const folder = await getFolderInfo(currentId);
      breadcrumb.unshift(folder);  // 先頭に追加（逆順）
      currentId = folder.parents?.[0];  // 親フォルダに移動
    }

    return breadcrumb;
  } catch (error) {
    console.error('フォルダパス取得エラー:', error);
    throw new Error('Google Driveのフォルダパスの取得に失敗しました。');
  }
}

/**
 * フォルダ一覧とパンくずリストを含む情報を取得
 */
export async function getDriveFolderList(parentFolderId?: string): Promise<DriveFolderList> {
  try {
    let folders: DriveFolder[];
    let currentFolder: DriveFolder | undefined;
    let breadcrumb: DriveFolder[];

    if (parentFolderId) {
      // 指定フォルダ配下の取得
      folders = await listFoldersInFolder(parentFolderId);
      currentFolder = await getFolderInfo(parentFolderId);
      breadcrumb = await getFolderPath(parentFolderId);
    } else {
      // ルートフォルダの取得
      folders = await listRootFolders();
      breadcrumb = [];
    }

    return {
      folders,
      currentFolder,
      breadcrumb
    };
  } catch (error) {
    console.error('フォルダリスト取得エラー:', error);
    throw new Error('Google Driveのフォルダリストの取得に失敗しました。');
  }
}

/**
 * ドキュメントを指定フォルダに移動してリネーム
 */
export async function moveAndRenameDocument(
  documentId: string,
  folderId: string,
  newName: string
): Promise<void> {
  try {
    const auth = await getAuthenticatedClient();

    // ドキュメントの現在の親フォルダを取得
    const file = await drive.files.get({
      auth,
      fileId: documentId,
      fields: 'parents'
    });

    const previousParents = file.data.parents?.join(',') || '';

    // 移動とリネームを実行
    await drive.files.update({
      auth,
      fileId: documentId,
      addParents: folderId,
      removeParents: previousParents,
      requestBody: {
        name: newName
      }
    });

    console.log(`ドキュメントを移動・リネームしました: ${newName}`);
  } catch (error) {
    console.error('ドキュメント移動エラー:', error);
    throw new Error('Google Driveへのドキュメント移動に失敗しました。');
  }
}

/**
 * フォルダを作成
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<DriveFolder> {
  try {
    const auth = await getAuthenticatedClient();

    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const response = await drive.files.create({
      auth,
      requestBody: fileMetadata,
      fields: 'id, name, parents'
    });

    console.log(`フォルダを作成しました: ${folderName}`);

    return {
      id: response.data.id!,
      name: response.data.name!,
      parents: response.data.parents || undefined
    };
  } catch (error) {
    console.error('フォルダ作成エラー:', error);
    throw new Error('Google Driveのフォルダ作成に失敗しました。');
  }
}

/**
 * フォルダ名からフォルダを検索（指定された親フォルダ配下）
 */
export async function findFolderByName(
  folderName: string,
  parentFolderId?: string
): Promise<DriveFolder | null> {
  try {
    const auth = await getAuthenticatedClient();

    let q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    if (parentFolderId) {
      q += ` and '${parentFolderId}' in parents`;
    } else {
      q += ` and 'root' in parents`;
    }

    const response = await drive.files.list({
      auth,
      q,
      fields: 'files(id, name, parents)',
      pageSize: 1
    });

    const folders = response.data.files || [];
    if (folders.length > 0) {
      return {
        id: folders[0].id!,
        name: folders[0].name!,
        parents: folders[0].parents || undefined
      };
    }

    return null;
  } catch (error) {
    console.error('フォルダ検索エラー:', error);
    throw new Error('Google Driveのフォルダ検索に失敗しました。');
  }
}

/**
 * フォルダを取得または作成
 * 存在すればそのフォルダを返し、存在しなければ作成する
 */
export async function getOrCreateFolder(
  folderName: string,
  parentFolderId?: string
): Promise<DriveFolder> {
  try {
    // まず検索
    const existingFolder = await findFolderByName(folderName, parentFolderId);
    if (existingFolder) {
      console.log(`既存のフォルダを使用: ${folderName}`);
      return existingFolder;
    }

    // 存在しなければ作成
    return await createFolder(folderName, parentFolderId);
  } catch (error) {
    console.error('フォルダ取得/作成エラー:', error);
    throw new Error('Google Driveのフォルダ取得/作成に失敗しました。');
  }
}

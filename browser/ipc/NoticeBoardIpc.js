const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
const EventSource = require('eventsource');
const noticeBoardController = require(path.join(__project_path, 'browser/controller/NoticeBoardController.js'));
class NoticeBoardIpc {
	constructor() {
        ipcMain.handle('createNoticeBoardGroup', async (event, param = {}) => {
			return noticeBoardController.createNoticeBoardGroup(param);
		});
		ipcMain.handle('createNoticeBoard', async (event, param = {}) => {
			return noticeBoardController.createNoticeBoard(param);
		});
        ipcMain.handle('createNoticeBoardDetail', async (event, param = {}) => {
            return noticeBoardController.createNoticeBoardDetail(param)
        })
        ipcMain.handle('searchNoticeBoardList', async (event, param = {}) => {
            return noticeBoardController.searchNoticeBoardList(param, EventSource, mainWindow);
		});
        ipcMain.handle('searchNoticeBoardDetailList', async (event, param = {}) => {
            return noticeBoardController.searchNoticeBoardDetailList(param, EventSource, mainWindow);
        })
        ipcMain.handle('deleteNoticeBoardGroup', async (event, param = {}) => {
			return noticeBoardController.deleteNoticeBoardGroup(param);
		});
		ipcMain.handle('deleteNoticeBoard', async (event, param = {}) => {
			return noticeBoardController.deleteNoticeBoard(param);
		});
		ipcMain.handle('updateNoticeBoardOrder', async (event, param = []) => {
			return noticeBoardController.updateNoticeBoardOrder(param);
		});
        ipcMain.handle('updateNoticeBoardDetailOrder', async (event, param = []) => {
			return noticeBoardController.updateNoticeBoardDetailOrder(param);
		});
    }
}
const noticeBoardIpc = new NoticeBoardIpc();
module.exports = noticeBoardIpc
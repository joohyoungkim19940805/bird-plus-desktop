const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/windowUtil.js'))
const log = require('electron-log');
const EventSource = require('eventsource');
const roomController = require(path.join(__project_path, 'browser/controller/RoomController.js'));
class RoomIpc {
	constructor() {
		ipcMain.handle('createRoom', async (event, param = {}) => {
			return roomController.createRoom(param);
		});
		ipcMain.handle('createMySelfRoom', async (event, param = {})=> {
			return roomController.createMySelfRoom(param);
		});
		ipcMain.handle('createRoomInAccount', async (event, param = []) => {
			return roomController.createRoomInAccount(param);
		});
		ipcMain.handle('createRoomFavorites', async (event, param = {}) => {
			return roomController.createRoomFavorites(param);
		});
		ipcMain.handle('updateRoomInAccoutOrder', async (event, param = []) => {
			return roomController.updateRoomInAccoutOrder(param);
		});
		ipcMain.handle('updateRoomFavorites', async (event, param = []) => {
			return roomController.updateRoomFavorites(param);
		});
        ipcMain.handle('searchRoom', async (event, param = {}) => {
			return roomController.searchRoom(param);
		});
		ipcMain.handle('searchMyJoinedRoomList', async (event, param = {}) => {
			return roomController.searchMyJoinedRoomList(param);
		});
		ipcMain.handle('searchRoomFavoritesList', async (event, param = {}) => {
			return roomController.searchRoomFavoritesList(param);
		});
		ipcMain.handle('searchRoomJoinedAccountList', async (event, param = {}) => {
			return roomController.searchRoomJoinedAccountList(param, EventSource, mainWindow);
		});
		ipcMain.handle('getRoomDetail', async (event, param = {}) => {
			return roomController.getRoomDetail(param);
		});
		ipcMain.handle('isRoomFavorites', async (event, param = {}) => {
			return roomController.isRoomFavorites(param);
		});
		ipcMain.handle('isRoomOwner', async (event, param = {}) => {
			return roomController.isRoomOwner(param);
		});
    }
}
const roomIpc = new RoomIpc();
module.exports = roomIpc
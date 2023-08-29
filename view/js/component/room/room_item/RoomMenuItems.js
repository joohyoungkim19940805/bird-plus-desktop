
export default class RoomMenuItems{
	#workspaceId
	#roomId

	constructor(){
		
	}

	set workspaceId(workspaceId){
		this.#workspaceId = workspaceId;
	}
	get workspaceId(){
		return this.#workspaceId;
	}

	set roomId(roomId){
		this.#roomId = roomId;
	}
	get roomId(){
		return this.#roomId;
	}

}

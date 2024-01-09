const path = require('path');
const axios = require('axios');
const log = require('electron-log');

class EventStreamController {
    source;
	prevWorkspaceId;
    #initIntervar;
    constructor(){
    }

	initWorkspaceStream(param, EventSource, eventSendObj){
        let {workspaceId} = param;
        if( ! EventSource) EventSource = top?.EventSource;
		/*if(this.prevWorkspaceId == workspaceId && (this.source?.readyState == 1 || this.source?.readyState == 0)){
            return;
        }else if(this.prevWorkspaceId != workspaceId && (this.source?.readyState == 1 || this.source?.readyState == 0)){
            this.source.close();
        }*/

        if(this.source) this.source.close();
        
        this.prevWorkspaceId = workspaceId;

        this.source = new EventSource(`${__serverApi}/api/event-stream/workspace/${workspaceId}`, {
            headers: {
                'Authorization' : axios.defaults.headers.common['Authorization'],
            },
            withCredentials : ! top.__isLocal
        });
        this.source.onmessage = (event) => {
            let {data, lastEventId, origin, type} = event;
            data = JSON.parse(data);
            log.debug('event stream data ::: ', data);

            let eventName = data.serverSentStreamType.split('_').map((e, i)=>{
                if(i == 0){
                    return e.toLowerCase(); 
                }
                return e.charAt(0) + e.substring(1).toLowerCase();
            }).join('');

            log.debug('on message: ', event.data, 'eventName ::', eventName);

            if(this[eventName]){
                this[eventName](eventName, data);
                return ;
            }
            if(eventSendObj.webEventSend){
                eventSendObj.webEventSend(eventName, data);
            }else{
                eventSendObj.send(eventName, data);
            }
        };

        this.source.onerror = (error) => {
            log.error('on stream err: ', error);
            //log.debug('source ::: ', this.source);
            /*this.#isConnectSource = false;
            windowUtil.isLogin( result => {
                if( ! result.isLogin){
                    axios.defaults.headers.common['Authorization'] = '';
                    this.source.close();
                    this.#send('needLoginRequest', result);
                }
            })*/
            //연결 실패되면 계속 시도하기에 임시 조치로 close
            //모바일 웹에서는 연결 실패 후 재시도 안하기에 수동 재시도로 변경
            this.source.close();
            setTimeout(()=>{
                this.initWorkspaceStream(param, EventSource, eventSendObj)
            },500)
            //stop();
        };
        this.source.onopen = (success) => {
            log.debug('on success: ', success)
        }
        /*
        * This will listen only for events
        * similar to the following:
        *
        * event: notice
        * data: useful data
        * id: someid
        this.source.addEventListener("notice", (e) => {
            log.debug('event notice', e.data);
        });
        */

        /*
        * Similarly, this will listen for events
        * with the field `event: update`
        this.source.addEventListener("update", (e) => {
            log.debug('event update ::: ',e.data);
        });
        */

        /*
        * The event "message" is a special case, as it
        * will capture events without an event field
        * as well as events that have the specific type
        * `event: message` It will not trigger on any
        * other event type.
        this.source.addEventListener("message", (e) => {
            log.debug('message !!!!! : ', e.data);
        });
        */
        //}
        
	}
    #initEvent(EventSource, eventSendObj){
        
    }
    #closeRequest(){
        this.source.close();
    }
}

const eventStreamController = new EventStreamController();
module.exports = eventStreamController
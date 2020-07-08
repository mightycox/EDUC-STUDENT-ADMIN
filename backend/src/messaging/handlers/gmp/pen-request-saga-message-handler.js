'use strict';
const STAN = require('node-nats-streaming');
const log = require('../../../components/logger');

const penRequestReturnSagaTopic = 'PEN_REQUEST_RETURN_SAGA_TOPIC';
const penRequestUnlinkSagaTopic = 'PEN_REQUEST_UNLINK_SAGA_TOPIC';
const penRequestRejectSagaTopic = 'PEN_REQUEST_REJECT_SAGA_TOPIC';
const redisUtil = require('../../../util/redis/redis-utils');
const webSocket = require('../../../socket/web-socket');

const PenRequestSagaMessageHandler = {
  penRequestReturnSagaSubscription(stan, opts) {
    const penReqReturnSagaSubscription = stan.subscribe(penRequestReturnSagaTopic, '', opts);// no queue group as all the pods need the messages to broadcast to websocket clients.
    penReqReturnSagaSubscription.on('error', (err) => {
      log.error(`subscription for ${penRequestReturnSagaTopic} raised an error: ${err}`);
    });
    penReqReturnSagaSubscription.on('message', async (msg) => {
      await this.handlePenRequestSagaMessage(msg);
    });
  },
  penRequestUnlinkSagaSubscription(stan, opts) {
    const penReqReturnSagaSubscription = stan.subscribe(penRequestUnlinkSagaTopic, '', opts); // no queue group as all the pods need the messages to broadcast to websocket clients.
    penReqReturnSagaSubscription.on('error', (err) => {
      log.error(`subscription for ${penRequestReturnSagaTopic} raised an error: ${err}`);
    });
    penReqReturnSagaSubscription.on('message', async (msg) => {
      await this.handlePenRequestSagaMessage(msg);
    });
  },
  penRequestRejectSagaSubscription(stan, opts) {
    const penReqRejectSagaSubscription = stan.subscribe(penRequestRejectSagaTopic, '', opts); // no queue group as all the pods need the messages to broadcast to websocket clients.
    penReqRejectSagaSubscription.on('error', (err) => {
      log.error(`subscription for ${penRequestRejectSagaTopic} raised an error: ${err}`);
    });
    penReqRejectSagaSubscription.on('message', async (msg) => {
      await this.handlePenRequestSagaMessage(msg);
    });
  },
  /**
   * This is where all the subscription will be done related pen requests
   * @param stan
   */
  subscribe(stan) {
    const opts = stan.subscriptionOptions().setStartWithLastReceived();
    opts.setDurableName('student-admin-node-consumer');
    this.penRequestReturnSagaSubscription(stan, opts);
    this.penRequestUnlinkSagaSubscription(stan, opts);
    this.penRequestRejectSagaSubscription(stan, opts);
  },
  async handlePenRequestSagaMessage(msg) {
    const event = JSON.parse(msg.getData()); // it is always a JSON string of Event object.
    log.silly(`received message for SAGA ID :: ${event.sagaId} :: getSequence ${msg.getSequence()} :: event :: ${msg.getData()}`);
    if('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus){
      const recordFoundInRedis = await redisUtil.removePenRequestSagaRecordFromRedis(event); // if record is not found in redis means duplicate message which was already processed.
      if(recordFoundInRedis){
        this.broadCastMessageToWebSocketClients(msg.getData());
      }
    }else if('INITIATED' === event.sagaStatus) { // broadcast only when the saga is completed or initiated, clients are not interested in each step.
      this.broadCastMessageToWebSocketClients(msg.getData());
    }
  },
  broadCastMessageToWebSocketClients(msg){
    const connectedClients = webSocket.getWebSocketClients();
    if (connectedClients && connectedClients.length > 0) {
      for (const connectedClient of connectedClients) {
        try {
          connectedClient.send(msg);
        } catch (e) {
          log.error(`Error while sending message to connected client ${connectedClient} :: ${e}`);
        }
      }
    }
  }
};

module.exports = PenRequestSagaMessageHandler;

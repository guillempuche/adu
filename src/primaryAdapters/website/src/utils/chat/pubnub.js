/**
 * Settings for the PubNub.
 */
import PubNub from 'pubnub';

/**
 * Create the PubNub instance.
 * @async
 * @param {string} uuid
 * @return {Object} PubNub's instance.
 */
export default uuid => {
    try {
        return new PubNub({
            publishKey: process.env.REACT_APP_PUBNUB_PUBLISH_KEY,
            subscribeKey: process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY,
            // authKey: process.env.REACT_APP_PUBNUB_AUTH_KEY,
            uuid,
            ssl: true,
            logVerbosity: false
        });
    } catch (err) {
        throw Error(err);
    }
};

// pubnub.subscribe({
//     channels:  ['faculty#5c6aaae0317e143a2b9775b2'],
//     withPresence: true
// });
// pubnub.setState(
//         {
//             state: {hello: 'there'},
//             channels: [channel],
//         },
//         (status, response) => {
//             console.log('Set State - status', status);
//             console.log('Set State - response', response);
//         }
// );
// pubnub.addListener({
//     presence: p => {
//         console.log('Presence', p);
//     }
// });

/**
 * Subscribe to one or multiple PubNub channels to send and receive messages.
 * @param {Object} pubnub
 * @param {string|Array<string>} items A channel or a group of channels.
 */

const subscribeToChannels = (pubnub, items) => {
    // console.log(
    //     'Subscribe - channels = ',
    //     Array.isArray(items) ? items : [items]
    // );
    // console.log('Subscribe for UUID ' + pubnub.getUUID());

    pubnub.subscribe({
        channels: Array.isArray(items) ? items : [items],
        withPresence: true
    });

    // setTimeout(() => {
    //     pubnub.whereNow({ uuid: pubnub.getUUID() }, (status, response) => {
    //         console.log('WhereNow - status', status);
    //         console.log('WhereNow - response', response);
    //     });
    // }, 1000);
};

/**
 * Unsubscribe to one or multiple PubNub channels.
 * @param {Object} pubnub
 * @param {string|Array<string>} channels A channel or a group of channels.
 */
const unsubscribeFromChannels = (pubnub, channels) => {
    pubnub.unsubscribe({
        channels: Array.isArray(channels) ? channels : [channels]
    });
};

/**
 * Set state of PubNub instance from specific channels.
 *
 * IMPORTANT: JSON object of key/value pairs with supported
 * data-types of `int`, `float` and `string`. Nesting of key/values
 * is not permitted and key names beginning with prefix `pn` are
 * reserved.
 *
 * @async
 * @param {Object} newState State paramaters to create. If
 * they already exist, they will be over-written.
 * @param {Object} pubnub
 * @param {string|Array<string>} channels A channel or a group of channels.
 * @return {{isError: Promise<boolean>, newState: Promise<Object>}}. Promise object. If message has sent successfully, there isn't an error, else `isError`=`true`. We also return the message.
 */
const setState = async (newState, pubnub, channels) => {
    // // // return new Promise(resolve => {
    // // console.log('Set State - newState', newState);
    // // console.log('Set State - newState JSON', JSON.stringify(newState));
    // console.log('Set State - channel', channels);
    // await new Promise(resolve => {
    //     pubnub.whereNow({ uuid: pubnub.getUUID() }, (status, response) => {
    //         console.log('WhereNow status', status);
    //         console.log('WhereNow response', response);
    //         resolve();
    //     });
    // });
    // const nouEstat = { ei: '1' };
    // pubnub.setState(
    //     {
    //         // state: JSON.stringify(newState),
    //         // state: newState,
    //         // state: JSON.stringify(nouEstat),
    //         // channels: ['faculty#5c6aaae0317e143a2b9775b2'],
    //         channels: Array.isArray(channels) ? channels : [channels],
    //         state: { hello: 'there' }
    //     },
    //     (status, response) => {
    //         console.log('Set State - status', status);
    //         console.log('Set State - response', response);
    //         const isError = isErrorOnSendingMessage(status);
    //         // resolve({ isError, newState });
    //     }
    // );
    // // });
};

/**
 * Send a event to a PubNub channel.
 * @async
 * @param {string|Object} event Can be: `stoppedFAQs`, `attachmentTemplateEmail` or an object.
 * @param {Object} pubnub
 * @param {string} channel Channel when we want to send the event.
 * @return {{isError: Promise<boolean>, messageSent: Promise<Object>}}. Promise object. If message has sent successfully, there isn't an error, else `isError`=`true`. We also return the message.
 */
const sendEvent = async (event, pubnub, channel) => {
    return new Promise(resolve => {
        pubnub.publish(
            {
                message: { event },
                channel
            },
            status => {
                const isError = isErrorOnSendingMessage(status);

                resolve({ isError, messageSent: event });
            }
        );
    });
};

/**
 * PubNub's status events for all type of status.
 *
 * Status event for publish and subscribe: https://www.pubnub.com/docs/web-javascript/status-events
 * @param {Object} status PubNub's status. We only use 2 variables: `operation` and `error`.
 * @param {string} status.operation Name of the operation.
 * @param {boolean} status.error `True` if there's an error on the operation.
 * @return {boolean} `True` if there's an error, else `false`.
 */
const isErrorOnSendingMessage = status => {
    // When there's a fatal error, we throw an error.
    if (status.type === 'validationError')
        throw Error(`${status.message}`, status);

    // Error on publishing/sending the message.
    if (status.error) {
        //&& (status.operation === 'PNPublishOperation' || status.operation === 'PNSetStateOperation' )) {
        console.error('Error on sending the message', status);
        return true;
    }

    return false;
};

export {
    subscribeToChannels,
    unsubscribeFromChannels,
    setState,
    sendEvent,
    isErrorOnSendingMessage
};

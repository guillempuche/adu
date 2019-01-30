"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handoff_1 = require("./handoff");

/**
 * Función que inicializa el array `conversations`
 */
exports.init = () => {
    // `conversations` contiene cada conversaci'on
    exports.conversations = [];
};

/**
 * Función que transcribe/registra el mensaje en el
 * array `conversation.transcript[]` (tanto si proviene de
 * un Agente o un Cliente).
 *
 * Devuelve `true` si se ha registrado el mensaje, `false` si
 * no existe ninguna conversación.
 *
 * @param {Object} by
 * @param {string} text
 */
const addToTranscript = (by, text) => {
    const conversation = getConversation(by);
    if (!conversation) return false;
    conversation.transcript.push({
        timestamp: Date.now(),
        from: by.agentConversationId ? "agent" : "customer",
        text
    });
    return true;
};

/**
 * Función que hace lo siguiente:
 *  - cambia el estado de la conversación a `Watch` o `Agent`
 *  - añade la dirección del Agente al objeto `conversation`
 *  - devuelve toda la conversación actual
 *
 * @param {Object} by
 * @param {Object} stateUpdate El valor del estado debe ser `Watch` o `Agent`
 * @param {Object} agentAddress
 */
const connectCustomerToAgent = (by, stateUpdate, agentAddress) => {
    const conversation = getConversation(by);
    if (conversation) {
        conversation.state = stateUpdate;
        conversation.agent = agentAddress;
    }
    return conversation;
};

/**
 * Función que el llamada en el archivo `command.js` y que
 * se ejecuta cuando el Cliente pide ayuda por primera vez y
 * aquí se cambia el estado de `Bot` a `Waiting`.
 *
 * @param {Object} by
 */
const queueCustomerForAgent = by => {
    const conversation = getConversation(by);
    if (!conversation) return false;
    conversation.state = handoff_1.ConversationState.Waiting;
    if (conversation.agent) delete conversation.agent;
    return true;
};

const connectCustomerToBot = by => {
    const conversation = getConversation(by);
    if (!conversation) return false;
    conversation.state = handoff_1.ConversationState.Bot;
    if (conversation.agent) delete conversation.agent;
    return true;
};

/**
 * Función que busca la conversación (`conversation.id`) en el array `conversations`
 * para según el argumento `by`.
 *
 * Devuelve el array `converations` exportandola (`exports.conversations`), y si no existe ninguna, la crea.
 * Si no se busca, pero encuentra la conversación, se devuelve `undefined`. Si todo
 * esto no se cumple, se devuelve un `null`.
 *
 * TIP:El método `find()` devuelve el valor del primer elemento del array
 * que cumple la función de prueba proporcionada. En cualquier
 * otro caso se devuelve `undefined`.
 *
 * @param {Object} by
 * @param {string} by.bestChoice
 * @param {string} by.customerName
 * @param {string} by.agentConversationId
 * @param {string} by.customerConversationId
 * @param {Object} customerAddress Argumento que solo se usa para crear una nueva conversación si aún no existe
 */
const getConversation = (
    by,
    customerAddress // if looking up by customerConversationId, create new conversation if one doesn't already exist
) => {
    /**
     * Función que actualiza o crea una conversación (solo si el Cliente aún no tiene una).
     *
     * IMPORTANTE: No se crea una nueva conversación para un Agente.
     *
     * @param {Object} customerAddress
     */
    const createConversation = customerAddress => {
        const conversation = {
            customer: customerAddress,
            state: handoff_1.ConversationState.Bot, // Estado actual de la conversación.
            transcript: []
        };
        exports.conversations.push(conversation);
        return conversation;
    };
    if (by.bestChoice) {
        const waitingLongest = exports.conversations
            .filter(
                conversation =>
                    conversation.state === handoff_1.ConversationState.Waiting
            )
            .sort(
                (x, y) =>
                    y.transcript[y.transcript.length - 1].timestamp -
                    x.transcript[x.transcript.length - 1].timestamp
            );
        return waitingLongest.length > 0 && waitingLongest[0];
    }
    if (by.customerName) {
        return exports.conversations.find(
            conversation => conversation.customer.user.name == by.customerName
        );
    } else if (by.agentConversationId) {
        return exports.conversations.find(
            conversation =>
                conversation.agent &&
                conversation.agent.conversation.id === by.agentConversationId
        );
    } else if (by.customerConversationId) {
        let conversation = exports.conversations.find(
            conversation =>
                conversation.customer.conversation.id ===
                by.customerConversationId
        );
        if (!conversation && customerAddress) {
            conversation = createConversation(customerAddress);
        }
        return conversation;
    }
    return null;
};

/**
 * Función que exporta todas las conversaciones previamente registradas
 * tanto del Cliente, el Agente y el Bot.
 */
const currentConversations = () => exports.conversations;

/**
 * Exportar métodos para que `handoff.js` los importe.
 */
exports.defaultProvider = {
    // Inicialización
    init: exports.init,

    // Update
    addToTranscript,
    connectCustomerToAgent,
    connectCustomerToBot,
    queueCustomerForAgent,

    // Get
    getConversation,
    currentConversations
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handoff_1 = require("./handoff");

/**
 * Función que se ejecuta cunado el bot recibe un mensaje. Envia el mensaje
 * (procedente del Agente o el Cliente) a analizar.
 *
 * @param {Object} handoff
 */
function commandsMiddleware(handoff) {
    return {
        botbuilder: (session, next) => {
            if (session.message.type === "message") {
                command(session, next, handoff);
            }
        }
    };
}
exports.commandsMiddleware = commandsMiddleware;

/**
 * Función que analiza el mensaje para ver si contiene un comando.
 *
 * @param {Object} session
 * @param {*} next
 * @param {Object} handoff
 */
function command(session, next, handoff) {
    if (handoff.isAgent(session)) {
        agentCommand(session, next, handoff);
    } else {
        customerCommand(session, next, handoff);
    }
}

/**
 * Función
 *
 * @param {Object} session
 * @param {*} next
 * @param {Object} handoff
 */
function agentCommand(session, next, handoff) {
    const message = session.message;
    const conversation = handoff.getConversation({
        agentConversationId: message.address.conversation.id
    });

    /**
     * Separar las palabras del mensaje del Agente en una matriz con:
     *
     * `string.split([separador][,limite])`
     *
     * Si el `separador` no es encontrado o se omite, el array contendrá
     * un único elemento con la cadena original completa. Si el separadores
     * una expresión regular que contiene paréntesis de captura, entonces
     * cada vez que el separador concuerda, los resultados (incluído cualquier
     * resultado indefinido) de los paréntesis de captura son divididos en el array resultante.
     * Más información en https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/String/split
     */
    const inputWords = message.text.split(" ");

    // Si no existe ningun text/carácter en el mensaje del Agente, se devuelve 'undefined'.
    if (inputWords.length == 0) return;

    if (message.text === "disconnect") {
        disconnectCustomer(conversation, handoff, session);
        return;
    }

    // Comandos para ejecutar ya sea conectado a un Cliente o no.
    switch (inputWords[0]) {
        case "options":
            sendAgentCommandOptions(session);
            return;
        // Devolver el estado de las conversaciones de los Clientes actuales.
        case "list":
            session.send(currentConversations(handoff));
            return;
        case "history":
            /**
             * Si Agente escribe "history Carlos", se obtiene toda la conversación
             * del Cliente Carlos. Si solo escribe "history", se obtiene toda la conversación del Agente.
             *
             * El métode `getCustomerTranscript()` añadirá un `session.send()` con cada
             * mensaje.
             */
            handoff.getCustomerTranscript(
                inputWords.length > 1
                    ? { customerName: inputWords.slice(1).join(" ") }
                    : { agentConversationId: message.address.conversation.id },
                session
            );

            return;
        // Conectar al Cliente que está esperando desde hace más tiempo.
        case "waiting":
            if (conversation) {
                // Desconectarse de la conversación actual si ya está "Waiting" o también hablando
                disconnectCustomer(conversation, handoff, session);
            }
            const waitingConversation = handoff.connectCustomerToAgent(
                { bestChoice: true },
                handoff_1.ConversationState.Agent,
                message.address
            );
            if (waitingConversation) {
                session.send(
                    "You are connected to " +
                        waitingConversation.customer.user.name
                );
            } else {
                session.send("No customers waiting.");
            }
            return;
        // Se ejecutará el código del próximo caso ("watch").
        case "connect":
        // Conecatarse con el Cliente que ha estado esperando más tiempo.
        case "watch":
            let newConversation;

            /**
             * Conectarse con el Cliente con nombre en el array 'inputWord[1]' o
             * si no existe, conectarse con el 'id' de la conversación actual.
             *
             * Se cambia el estado de la conversación a "Agent"
             */
            if (inputWords[0] === "connect") {
                newConversation = handoff.connectCustomerToAgent(
                    inputWords.length > 1
                        ? { customerName: inputWords.slice(1).join(" ") }
                        : {
                              customerConversationId:
                                  conversation.customer.conversation.id
                          },
                    handoff_1.ConversationState.Agent,
                    message.address
                );
            }
            // Observar la conversación del
            else {
                // "watch" actualmente solo admite la especificación de un Cliente para mirar (o "watch")
                newConversation = handoff.connectCustomerToAgent(
                    { customerName: inputWords.slice(1).join(" ") },
                    handoff_1.ConversationState.Watch,
                    message.address
                );
            }
            if (newConversation) {
                session.send(
                    "You are connected to " + newConversation.customer.user.name
                );
                return;
            } else {
                session.send("something went wrong.");
            }
            return;
        // Si el mensaje no concuerda con ningun comando, hacer lo siguiente
        default:
            //
            if (
                conversation &&
                conversation.state === handoff_1.ConversationState.Agent
            ) {
                return next();
            }
            sendAgentCommandOptions(session);
            return;
    }
}

/**
 * Función que analiza el mensaje procedente del Cliente
 * para comprobar si es un comando.
 *
 * @param {Object} session
 * @param {*} next
 * @param {Object} handoff
 */
function customerCommand(session, next, handoff) {
    const message = session.message;

    /**
     * Si el Cliente pide ayuda por segunda vez en la misma conversación,
     * es decir, que el estado de la conversación actual está en "Waiting"
     * en lugar de "Bot", no se regitrará ningún mensaje en 'routeCustomerMessage()'
     * en 'handoff.js'.
     */
    if (message.text === "help") {
        // Buscar la conversación (crearla si aún no existe)
        const conversation = handoff.getConversation(
            { customerConversationId: message.address.conversation.id },
            message.address
        );

        // Si el estado de la conversación es "Bot", se cambia a "Waiting" aquí.
        if (conversation.state == handoff_1.ConversationState.Bot) {
            // Se registra/guarda el mensaje del Cliente
            handoff.addToTranscript(
                {
                    customerConversationId:
                        conversation.customer.conversation.id
                },
                message.text
            );

            // Se cambia el estado a "Waiting" para esperar a un Agente.
            handoff.queueCustomerForAgent({
                customerConversationId: conversation.customer.conversation.id
            });

            // Este mensaje también se enviará en "routeCustomerMessage()" de "handoff.js"
            // si se mantiene el estado "Waiting".
            session.send("Connecting you to the next available agent.");
            return;
        }
    }
    return next();
}

/**
 * Función que envia un mensaje al Agente con todos los comandos
 * disponibles.
 *
 * @param {Object} session
 */
function sendAgentCommandOptions(session) {
    const commands =
        " ### Agent Options\n - Type *waiting* to connect to customer who has been waiting longest.\n - Type *connect { user name }* to connect to a specific conversation\n - Type *watch { user name }* to monitor a customer conversation\n - Type *history { user name }* to see a transcript of a given user\n - Type *list* to see a list of all current conversations.\n - Type *disconnect* while talking to a user to end a conversation.\n - Type *options* at any time to see these options again.";
    session.send(commands);
    return;
}

/**
 * Función que devuelve el estado actual de la conversion de todos los
 * Clientes para que el bot informe al Agente del estado actual.
 *
 * @param {Object} handoff
 */
function currentConversations(handoff) {
    const conversations = handoff.currentConversations();
    if (conversations.length === 0) {
        return "No customers are in conversation.";
    }
    let text = "### Current Conversations \n";
    conversations.forEach(conversation => {
        const starterText = " - *" + conversation.customer.user.name + "*";
        switch (handoff_1.ConversationState[conversation.state]) {
            case "Bot":
                text += starterText + " is talking to the bot\n";
                break;
            case "Agent":
                text += starterText + " is talking to an agent\n";
                break;
            case "Waiting":
                text += starterText + " is waiting to talk to an agent\n";
                break;
            case "Watch":
                text += starterText + " is being monitored by an agent\n";
                break;
        }
    });
    return text;
}
function disconnectCustomer(conversation, handoff, session) {
    if (
        handoff.connectCustomerToBot({
            customerConversationId: conversation.customer.conversation.id
        })
    ) {
        session.send(
            "Customer " +
                conversation.customer.user.name +
                " is now connected to the bot."
        );
    }
}

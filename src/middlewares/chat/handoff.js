"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder = require("botbuilder");
const provider_1 = require("./provider");

/**
 * Estados posibles en una conversación:
 *  - `Bot`: Cliente hablando con el Bot.
 *  - `Waiting`: si el mensaje es del Cliente y contiene el texto `help`, actualizamos el estado
 *      del Cliente de `Bot` a `Waiting`, lo que significa que el Cliente
 *      ahora espera un Agente.
 *  - `Agent`: si un agente retoma la conversación, el estado cambia de `Waiting` a `Agent`.
 *      En este estado, cualquier mensaje enviado por el Cliente es interceptado
 *      por el middleware y enviado al Agente utilizando la información almacenada
 *      de la dirección para el Agente que recogió la conversación, y viceversa.
 *  - `Watch`: se envia al agente que está observando.
 */
var ConversationState;
(function(ConversationState) {
    ConversationState[(ConversationState["Bot"] = 0)] = "Bot";
    ConversationState[(ConversationState["Waiting"] = 1)] = "Waiting";
    ConversationState[(ConversationState["Agent"] = 2)] = "Agent";
    ConversationState[(ConversationState["Watch"] = 3)] = "Watch";
})(
    (ConversationState =
        exports.ConversationState || (exports.ConversationState = {}))
);
/**
 * Clase Handoff se procesa la conversación del Agente y el Cliente.
 *
 * Una conversación de Handoff consiste en:
 *  - información de la dirección para esta conversación con el Cliente
 *  - el estado actual de esta conversación
 *  - la transcripción conversacional
 *  - información de dirección para el Agente, si el Agente está actualmente
 *      conectado a este Cliente (Handoff no registra los metadatos conversacionales
 *      para el Agente, excepto cuando están conectados a un Cliente)
 */
class Handoff {
    // Si personaliza, transfiera tu propio cheque para 'isAgent' y sus propias versiones de métodos en 'defaultProvider'
    constructor(bot, isAgent, provider = provider_1.defaultProvider) {
        this.bot = bot;
        this.isAgent = isAgent;
        this.provider = provider;
        this.connectCustomerToAgent = (by, nextState, agentAddress) =>
            this.provider.connectCustomerToAgent(by, nextState, agentAddress);
        this.connectCustomerToBot = by =>
            this.provider.connectCustomerToBot(by);
        this.queueCustomerForAgent = by =>
            this.provider.queueCustomerForAgent(by);
        this.addToTranscript = (by, text) =>
            this.provider.addToTranscript(by, text);
        this.getConversation = (by, customerAddress) =>
            this.provider.getConversation(by, customerAddress);
        this.currentConversations = () => this.provider.currentConversations();
        this.provider.init();
    }

    // ====================================
    // Métodos de enrutamiento de los mensajes
    // ====================================
    /**
     * Middleware que enruta el mensaje según el bot lo ha enviado o recibido.
     */
    routingMiddleware() {
        return {
            botbuilder: (session, next) => {
                // Pass incoming messages to routing method
                if (session.message.type === "message") {
                    this.routeMessage(session, next);
                }
            },
            send: (event, next) => {
                // Los mensajes enviados desde el bot no necesitan enrutarse.
                const message = event;
                const customerConversation = this.getConversation({
                    customerConversationId: event.address.conversation.id
                });

                // Enviar mensaje al agente que está observando la conversación.
                if (customerConversation.state === ConversationState.Watch) {
                    this.bot.send(
                        new builder.Message()
                            .address(customerConversation.agent)
                            .text(message.text)
                    );
                }

                // Registrar el mensaje enviado por el bot a la conversación actual del Cliente.
                this.trancribeMessageFromBot(message, next);
            }
        };
    }

    /**
     * Método que enruta el mensaje según si es del "Agente" o del "Cliente".
     *
     * @param {Object} session
     * @param {*} next
     */
    routeMessage(session, next) {
        if (this.isAgent(session)) {
            this.routeAgentMessage(session);
        } else {
            this.routeCustomerMessage(session, next);
        }
    }

    /**
     * Método que envia el mensaje del Agente hacia el Cliente mediante el bot.
     *
     * Devuelve un `undefined` si no existe la conversación, o bien
     * si el estado de la conversación del Cliente no es `Agent`.
     *
     * @param {Object} session
     */
    routeAgentMessage(session) {
        const message = session.message;

        // Para comprobar si
        const conversation = this.getConversation({
            agentConversationId: message.address.conversation.id
        });

        // Si no hay ningún Agente conversando, no es necesario enviar el mensaje al Cliente.
        // !undefined === true
        // !"hello" === false
        if (!conversation) return;

        // Si el Agente está observando a un Cliente, no es necesario enviar el mensaje al Cliente.
        if (conversation.state !== ConversationState.Agent) return;

        // Enviar el texto que el Agente escribió al Cliente con el que están conversando
        this.bot.send(
            new builder.Message()
                .address(conversation.customer)
                .text(message.text)
        );
    }

    /**
     * Método que transcribe el mensaje del Cliente y según el estado
     * actual de la conversación envia una respuesta al cliente.
     *
     * @param {Object} session
     * @param {*} next
     */
    routeCustomerMessage(session, next) {
        const message = session.message;

        // This method will either return existing conversation or a newly created conversation if this is first time we've heard from customer
        const conversation = this.getConversation(
            { customerConversationId: message.address.conversation.id },
            message.address
        );

        /*const transcript = {
            customerConversationId: conversation.customer.conversation.id,
            customerInfo: conversation.customer.user.name
        };*/

        this.addToTranscript(
            { customerConversationId: conversation.customer.conversation.id },
            message.text
        );

        switch (conversation.state) {
            // Si el Cliente habla con el bot, .
            case ConversationState.Bot:
                return next();
            // Si el Cliente está "Waiting", no se regitra ningún mensaje y
            // se envia al Cliente un mensaje para que espere a un Agente.
            case ConversationState.Waiting:
                session.send("Connecting you to the next available agent.");
                return;
            // Si el Cliente está "Watch", se envia el mensaje a un Agente.
            case ConversationState.Watch:
                this.bot.send(
                    new builder.Message()
                        .address(conversation.agent)
                        .text(message.text)
                );
                return next();
            // Si la conversación está en estado "Agente", se envia el mensaje al Agente conectado.
            case ConversationState.Agent:
                if (!conversation.agent) {
                    session.send(
                        "No agent address present while customer in state Agent"
                    );
                    console.log(
                        "No agent address present while customer in state Agent"
                    );
                    return;
                }
                this.bot.send(
                    new builder.Message()
                        .address(conversation.agent)
                        .text(message.text)
                );
                return;
        }
    }

    // ====================================
    // Métodos son envoltorios alrededor del proveedor que maneja los datos
    // ====================================
    /**
     * Método que transcribe el mensaje enviado por el bot y lo registra en
     * la conversación del Cliente.
     *
     * @param {Object} message
     * @param {*} next
     */
    trancribeMessageFromBot(message, next) {
        this.provider.addToTranscript(
            { customerConversationId: message.address.conversation.id },
            message.text
        );
        next();
    }
    /**
     * Método que devuelve toda conversación ya registrada/guardada
     * (o el historial) en formato texto.
     *
     * @param {Object} by
     * @param {Object} session Se le ejecuta el método `send()` para enviar el historial.
     */
    getCustomerTranscript(by, session) {
        const customerConversation = this.getConversation(by);
        if (customerConversation) {
            customerConversation.transcript.forEach(transcriptLine =>
                session.send(transcriptLine.text)
            );
        } else {
            session.send(
                "No Transcript to show. Try entering a username or try again when connected to a customer"
            );
        }
    }
}

// Hacer pública la clase Handoff
exports.Handoff = Handoff;

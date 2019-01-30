"use strict";

/**
 * Definir el objeto con nombre `exports` para convertir `module.exports = ...`
 * por defecto.
 *
 * Si el módulo CommonJS tiene una propiedad `__esModule` en su objeto `module.exports`,
 * ese objeto `module.exports` se usa en lugar de la exportación del espacio de nombres.
 *
 * Si el módulo `require` es un módulo ES, y una propiedad llamada `__esModule` no está
 * expuesta en el resultado, se agrega una propiedad no enumerable de ese nombre y se establece en `true`.
 *
 * Más información sobre el uso de `__esModule` en https://github.com/DanielRosenwasser/es-commonjs-interop/blob/master/Loading%20Behavior.md
 * Ejemplos en: https://babeljs.io/docs/plugins/transform-es2015-modules-commonjs/
 * Más información sobre `defineProperty()` en https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 */
Object.defineProperty(exports, "__esModule", { value: true });
const builder = require("botbuilder");
const keys = require("../config/keys");
const { logMessage } = require("../middlewares/chat/logMessages");
const handoff_1 = require("../middlewares/chat/handoff");
const commands = require("../middlewares/chat/commands");

const PORT = 5001;

module.exports = (app, express) => {
    // ==========================================
    //      BOT SETUP
    // ==========================================

    // Setup bot Express server
    app.listen(PORT, () => {
        console.log("Bot server on port", PORT);
    });

    // Not use Bot State because it may be deprecated.
    var inMemoryStorage = new builder.MemoryBotStorage();

    // ChatConnector class connects your bot to the Bot Framework Connector Service (webchat,
    // Facebook...)
    const connector = new builder.ChatConnector({
        appId: keys.microsoft.appId,
        appPassword: keys.microsoft.appPassword
    });

    // UniversalBot class forms the brains of our bot. It's responsible for managing all the
    // conversations our bot has with a user.
    const bot = new builder.UniversalBot(connector, [
        // We resend to oneself all messages that aren't commands.
        function(session, args, next) {
            session.send("Echo " + session.message.text);
        }
    ]).set("storage", inMemoryStorage); // Register in-memory storage

    app.post("/api/messages", connector.listen());

    // replace this function with custom login/verification for agents
    const isAgent = session => session.message.user.id.startsWith("agent");
    const handoff = new handoff_1.Handoff(bot, isAgent);

    // ==========================
    //      TESTING
    // ==========================
    var client = {
        id: "123",
        name: "Guillem Puche"
    };
    var univerisity = {
        _id: "5b7ebd9cdc02ae7b301375cf"
    };

    //bot.receive(session.send({ type: "typing" }));

    // ========================================
    //      BOT MIDDLEWARES
    // ========================================
    /**
     * Middleware that log messages to the database.
     *
     * More info on: https://github.com/Microsoft/BotBuilder/blob/34454c5ff374c5bb33f21439ded6fed1459e4c0e/Node/core/lib/bots/UniversalBot.js#L104
     */
    bot.use(
        {
            // =======================================
            //      BOT RECEIVES THE MESSAGE
            // =======================================
            // IMPORTANT: 'session' object is different from a message sent or received.
            botbuilder: function(session, next) {
                // Filtrar el mensaje del objeto 'session' ya que entre los mensajes
                // del usuario o el bot hay informacion irrelevante 'conversationUpdate'
                if (session.type !== "conversationUpdate") {
                    session.messageFrom = "user";

                    logMessage(session);
                }
                next();
            },
            // ==========================================
            //      BOT SENDS THE MESSAGE
            // ==========================================
            // ALERTA: cuando se debuga se puede ver que cuando el bot envia 2
            // mensajes y sin se retrasa la ejecución se envia 2 objetos
            // 'session' que cuando se procesan 'require().logMessage'
            // se executan las operaciones practicamente al mismo tiempo. Es decir, no
            // se ejecuta todo el codigo de de 'logMessage' sino que se ejecuta algunas linias
            // se ejecutan primero para cada objeto 'session' y despues se ejecuta otra linia.
            // En 'log_database.js' se usa un delay para solucionarlo.
            send: function(session, next) {
                // IMPORTANTE: objeto 'session' es diferente que en mensaje recibido
                // Filtrar el mensaje del objeto 'session' ya que entre los mensajes
                // del usuario o el bot hay informacion irrelevante 'conversationUpdate'
                if (session.type !== "conversationUpdate") {
                    session.messageFrom = "bot";

                    logMessage(session);
                }
                next();
            }
        },
        commands.commandsMiddleware(handoff),
        handoff.routingMiddleware()
    );
};

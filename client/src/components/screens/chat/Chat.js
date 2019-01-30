import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// Import all Action Creators.
import * as actions from "../../../actions";
import ChatEngineCore from "chat-engine";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";

import Message from "./Message";

const styles = theme => ({});

const ChatEngine = ChatEngineCore.create(
    {
        publishKey: "pub-c-793ff292-76de-4f21-91b3-5814a4168bff",
        subscribeKey: "sub-c-df77f930-b115-11e8-9dc0-ee1e3492c5ad"
    },
    {
        globalChannel: "universitat-1"
    }
);

class Chat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            messages: [],
            chatInput: "",
            chat: ""
        };

        this.setChatInput = this.setChatInput.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this._handleKeyPress = this._handleKeyPress.bind(this);
    }

    componentDidMount() {
        const { user } = this.props;

        // Connect with the username we have created.
        ChatEngine.connect(
            user.id,
            user
        );

        //const newChat = new ChatEngine.Chat("chat-1");
        //this.setState({chat: newChat});

        // Listen for a 'message' event and fire a callback.
        ChatEngine.global.on("message", payload => {
            let messages = this.state.messages;

            messages.push(
                <Message
                    key={this.state.messages.length}
                    uuid={payload.sender.uuid}
                    text={payload.data.text}
                />
            );

            this.setState({
                messages: messages
            });
        });
    }

    // Update the input field when the user types something.
    setChatInput(text) {
        this.setState({ chatInput: text });
    }

    // Send the message to the other users.
    sendMessage() {
        if (this.state.chatInput) {
            ChatEngine.global.emit("message", {
                text: this.state.chatInput
            });
            this.setState({ chatInput: "" });
        }
    }

    // Bind the 'Enter' key for sending messages.
    _handleKeyPress(e) {
        if (e.key === "Enter") {
            this.sendChat();
        }
    }

    render() {
        const { messages, chatInput } = this.state;
        const { classes, user } = this.props;

        // console.log("Chat | props", this.props);

        if (user.id !== "agent") {
            connect(user);
        }

        // TIP: ChatEngine's events always begin with a $. They are automatically emitted
        // when specific things happen.
        ChatEngine.on("$.ready", () => {
            console.log("ChatEngine is on");

            return (
                <div>
                    <div id="chat-output"> {messages} </div>{" "}
                    <input
                        id="chat-input"
                        type="text"
                        name=""
                        value={chatInput}
                        onChange={this.setChatInput}
                        onKeyPress={this._handleKeyPress}
                    />{" "}
                    <input
                        type="button"
                        onClick={this.sendChat}
                        value="Send Chat"
                    />
                </div>
            );
        });
    }
}

Chat.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })
};

export default withStyles(styles)(Chat);

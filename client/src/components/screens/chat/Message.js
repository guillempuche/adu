import React, { Component } from "react";
import PropTypes from "prop-types";

class Message extends Component {
    render() {
        const { uuid, text } = this.props;
        return (
            <div>
                {uuid}: {text}
            </div>
        );
    }
}

Message.propTypes = {
    uuid: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
};

export default Message;

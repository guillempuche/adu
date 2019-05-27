import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-markdown';

/**
 * Text message that accepts markdown.
 *
 * More options for markdown on: https://www.npmjs.com/package/react-markdown#node-types
 */
function Text({ text }) {
    const markdownTypesAllowed = [
        'text',
        'strong',
        'delete',
        'emphasis',
        'link'
    ];

    return (
        <Markdown
            source={text}
            allowedTypes={markdownTypesAllowed}
            unwrapDisallowed={true}
            // Open the links on a new tab.
            linkTarget="_blank"
        />
    );
}

Text.propTypes = {
    text: PropTypes.string.isRequired
};

export default Text;

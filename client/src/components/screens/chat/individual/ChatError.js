import React from 'react';
import { withStyles } from '@material-ui/core';

const styles = theme => ({});

function ChatError({ classes }) {
    return (
        <div>
            Au 🤖: Sorry, I've an error 😩. I'll put my 200% to correct it.
        </div>
    );
}

export default withStyles(styles)(ChatError);

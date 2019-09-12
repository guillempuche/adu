import React from 'react';
import { withStyles } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    text: {
        overflowX: 'auto'
    }
});

/**
 * @function CellText Show text of the cell.
 */
function CellText({ value, onValueChange, classes }) {
    function setValue(event) {
        onValueChange(event.target.value);
    }

    return (
        <Tooltip title={value ? value : ''} placement="top-start">
            <div className={classes.text}>
                {// Show Text Field if the DataTypeProvider is on mode 'Editor' (not 'Formatter').
                typeof onValueChange === 'undefined' ? (
                    value
                ) : (
                    <TextField defaultValue={value} onChange={setValue} />
                )}
            </div>
        </Tooltip>
    );
}

export default withStyles(styles)(CellText);

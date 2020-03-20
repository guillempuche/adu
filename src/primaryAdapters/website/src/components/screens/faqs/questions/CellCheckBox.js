import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';

/**
 * @function CellCheckBox
 */
function CellCheckBox({ value, onValueChange }) {
    /**
     * Change the value of the cell.
     * Callback fired when the CheckBox state is changed.
     * @param {boolean} checked The alue of the switch
     */
    function onClick(event, checked) {
        if (value !== checked) onValueChange(checked);
    }

    // Disable the Check Box if the DataTypeProvider is on mode 'Formatter' (not 'Editor').
    return (
        <Checkbox
            // When we add a new row, value is `undefined`.
            checked={value ? value : false}
            disabled={typeof onValueChange === 'undefined' ? true : false}
            color="secondary"
            onChange={onClick}
        />
    );
}

export default CellCheckBox;

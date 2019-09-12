import React, { Component } from 'react';
import { withStyles } from '@material-ui/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
    list: {
        display: 'flex'
    },
    chipsList: {
        overflowX: 'auto',
        display: 'flex',
        flexDirection: 'row'
    },
    chip: {
        margin: theme.spacing(0.2)
    }
});

/**
 * @class Show list of chips. We can drag and drop every chip.
 */
class CellChipsList extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.renderDragDrop = this.renderDragDrop.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    componentDidMount() {
        const { column, value, onValueChange } = this.props;

        // Only, we can drop if the DataTypeProvider is on mode 'Editor' (not 'Formatter')
        const listMode =
            typeof onValueChange === 'undefined' ? 'formatter' : 'editor';

        this.setState({
            column: {
                name: column.name,
                values: value
            },
            listMode
        });
    }

    renderDragDrop() {
        const { listMode } = this.state;
        const { column, value, classes } = this.props;

        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId={column.name} direction="horizontal">
                    {provided => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={classes.chipsList}
                        >
                            {value.map((item, index) => (
                                <Draggable
                                    key={item}
                                    draggableId={item}
                                    index={index}
                                    isDragDisabled={
                                        listMode === 'formatter' ? true : false
                                    }
                                >
                                    {provided => (
                                        <Chip
                                            key={item}
                                            label={item}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={classes.chip}
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {
                                // Increase a blank space when a compoenent is dragging.
                                provided.placeholder
                            }
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }

    addChip() {
        return (
            <IconButton color="secondary" size="small">
                <AddIcon />
            </IconButton>
        );
    }

    /**
     * A drag has ended. It is the responsibility of this responder
     * to synchronously apply changes that has resulted from the drag.
     *
     * More info: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/responders.md#synchronous-reordering
     * @param {Object} result
     * @param {Object} result.source
     * @param {number} result.source.index
     * @param {string} result.source.droppableId It's the name of the column.
     * @param {Object} result.destination
     * @param {number} result.destination.index
     * @param {string} result.destination.droppableId It's the name of the column.
     * @param {string} result.draggableId
     */
    onDragEnd(result) {
        const { column } = this.state;
        const { destination, source, draggableId } = result;

        // We need to remove the item from your list and insert it at the correct position.
        if (
            destination.droppableId === source.droppableId &&
            destination.index !== source.index
        ) {
            let columnValuesClone = column.values.slice();

            columnValuesClone.splice(source.index, 1);
            columnValuesClone.splice(destination.index, 0, draggableId);

            // Prop passed by the DataTypeProvider editor.
            this.props.onValueChange(columnValuesClone);
        }
    }

    render() {
        if (this.state.listMode === 'formatter') {
            const { value, classes } = this.props;
            let listOfStrings = '';

            // Create a long string with the list of all values of the cell.
            value.forEach((item, index) => {
                // Not last position.
                if (index !== value.length - 1) listOfStrings += `${item}, `;
                else listOfStrings += item;
            });
            return (
                <Tooltip title={listOfStrings} placement="top-start">
                    <div className={classes.list}>
                        <div>{this.renderDragDrop()}</div>
                        <div>{this.addChip()}</div>
                    </div>
                </Tooltip>
            );
        } else {
            return this.renderDragDrop();
        }
    }
}

export default withStyles(styles)(CellChipsList);

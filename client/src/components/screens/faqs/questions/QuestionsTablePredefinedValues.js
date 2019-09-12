import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
    Grid,
    Table,
    TableHeaderRow,
    TableEditRow,
    TableEditColumn
} from '@devexpress/dx-react-grid-material-ui';
import { EditingState } from '@devexpress/dx-react-grid';

import ROUTES from '../../../../utils/routes';
import * as actions from '../../../../actions';

class QuestionsTablePredefinedValues extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                {
                    name: 'originalValue',
                    title: 'Original Value'
                },
                {
                    name: 'newValue',
                    title: 'New Value'
                }
            ],
            editingRowIds: [],
            addedRows: [],
            rowChanges: {}
        };

        this.getRowId = this.getRowId.bind(this);
        this.changeAddedRows = this.changeAddedRows.bind(this);
        this.changeEditingRowIds = this.changeEditingRowIds.bind(this);
        this.changeRowChanges = this.changeRowChanges.bind(this);
        this.commitChanges = this.commitChanges.bind(this);
    }

    /**
     * Get a unique row identifier: the ObjectId created on the database.
     * @param {Object} row
     * @return {string} ObjectId of the row.
     */
    getRowId(row) {
        return row._id;
    }

    /**
     * Handles adding or removing a row to/from the `addedRows` array.
     * @param {Array<any>} addedRows
     */
    changeAddedRows(addedRows) {
        // const initialized = addedRows.map(row =>
        //     Object.keys(row).length ? row : { city: 'Tokio' }
        // );
        console.log('Added rows', addedRows);
        this.setState({ addedRows });
    }

    /**
     * Handles adding or removing a row to/from the `editingRowIds` array.
     * @param {Array<string>} editingRowIds
     */
    changeEditingRowIds(editingRowIds) {
        this.setState({ editingRowIds });
    }

    /**
     * Handles adding or removing a row changes to/from the `rowChanges` array.
     * @param {{[key: string]: any}} rowChanges
     */
    changeRowChanges(rowChanges) {
        this.setState({ rowChanges });
    }

    /**
     * Handles row changes committing.
     * @param {Object}
     * @param {Array<any>} added An array of rows to be created.
     * @param {{[key: string]: any}} changed An associative array that stores changes
     * made to existing data. Each array item specifies changes made to a
     * row. The item’s key specifies the associated row’s ID.
     * @param {Array<string>} deleted An array of IDs representing rows to be deleted.
     */
    commitChanges({ added, changed, deleted }) {
        const { all, saveQuestions } = this.props;
        let questionsIds = [],
            questionsAllValues = [];

        if (added) {
            // questionsIds = Object.keys(added);
            // questionsAllValues = all.find(question => {
            //     question._id ==
            // })
            console.log('added', added);
            saveQuestions(added, 'new');
            //   const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
            //   rows = [
            //     ...rows,
            //     ...added.map((row, index) => ({
            //       id: startingAddedId + index,
            //       ...row,
            //     })),
            //   ];
        }

        if (changed) {
            saveQuestions(changed, 'edit');
            //   rows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
        }

        if (deleted) {
            saveQuestions(deleted, 'delete');
            //   const deletedSet = new Set(deleted);
            //   rows = rows.filter(row => !deletedSet.has(row.id));
        }

        // this.setState({ rows });
    }

    render() {
        const {
            columns,
            editingColumnExtensions,
            defaultColumnWidths,
            editingRowIds,
            addedRows,
            rowChanges,
            formattedTextColumns,
            formattedChipsColumns,
            formattedCheckBoxColumns
        } = this.state;
        const { superuser } = this.props;

        // Don't show questions if the user isn't a superuser.
        if (!superuser) return <Redirect to={ROUTES.faqs.path} />;
        else if (superuser)
            return (
                <Grid rows={[]} columns={columns} getRowId={this.getRowId}>
                    <EditingState
                        editingRowIds={editingRowIds}
                        onEditingRowIdsChange={this.changeEditingRowIds}
                        rowChanges={rowChanges}
                        onRowChangesChange={this.changeRowChanges}
                        addedRows={addedRows}
                        onAddedRowsChange={this.changeAddedRows}
                        onCommitChanges={this.commitChanges}
                    />
                    <Table />
                    <TableHeaderRow />
                    <TableEditRow />
                    <TableEditColumn
                        showAddCommand
                        showEditCommand
                        showDeleteCommand
                    />
                </Grid>
            );
        else return null;
    }
}

function mapStateToProps({ auth, settings }) {
    // TIP: 'superuser' variable only exists for superusers.
    const { superuser } = auth.userType;
    return { superuser };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    )
);

export default enhancer(QuestionsTablePredefinedValues);

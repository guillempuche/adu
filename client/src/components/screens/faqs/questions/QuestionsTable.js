import _ from 'lodash';
import React, { Component } from 'react';
import { compose } from 'redux';
import { graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { Query } from 'react-apollo';
import produce from 'immer';
import { Redirect } from 'react-router-dom';
import {
    Grid,
    Table,
    TableHeaderRow,
    TableColumnResizing,
    TableEditRow,
    TableEditColumn
} from '@devexpress/dx-react-grid-material-ui';
import { EditingState, DataTypeProvider } from '@devexpress/dx-react-grid';

import { QUESTIONS_QUERY, UPDATE_QUESTION } from '../../../../graphql/faqs';
import ROUTES from '../../../../utils/routes';
import * as actions from '../../../../actions';
import CellText from './CellText';
import CellChipsList from './CellChipsList';
import CellCheckBox from './CellCheckBox';

class QuestionsTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                {
                    name: 'enabled',
                    title: 'Enabled',
                    getCellValue: row => {
                        // When we add a new row, the variable isn't defined.
                        if (
                            row.metadata &&
                            typeof row.metadata.enabled !== 'undefined'
                        )
                            return row.metadata.enabled;
                        else return false;
                    }
                },
                {
                    name: 'question_enUS',
                    title: 'Q-enUS',
                    getCellValue: row => {
                        // When we add a new row, the variable isn't defined.
                        if (typeof row.question_enUS !== 'undefined')
                            return row.question_enUS;
                        else return '';
                    }
                },
                {
                    name: 'public',
                    title: 'Public',
                    getCellValue: row => {
                        // When we add a new row, the variable isn't defined.
                        if (typeof row.public !== 'undefined')
                            return row.public;
                        else return [];
                    }
                },
                {
                    name: 'categories',
                    title: 'Categories',
                    getCellValue: row => {
                        // When we add a new row, the variable isn't defined.
                        if (typeof row.categories !== 'undefined')
                            return row.categories;
                        else return [];
                    }
                },
                {
                    name: 'question_esES',
                    title: 'Q-esES',
                    getCellValue: row => {
                        // When we add a new row, the variable isn't defined.
                        if (typeof row.question_esES !== 'undefined')
                            return row.question_esES;
                        else return '';
                    }
                },
                {
                    name: 'question_ca',
                    title: 'Q-ca',
                    getCellValue: row => {
                        // When we add a new row, the variable isn't defined.
                        if (typeof row.question_ca !== 'undefined')
                            return row.question_ca;
                        else return '';
                    }
                }
            ],
            // Custom value of a specific column because of the depth of the value of the cell's object.
            // More info on: https://devexpress.github.io/devextreme-reactive/react/grid/docs/guides/data-accessors/
            editingColumnExtensions: [
                {
                    columnName: 'enabled',
                    createRowChange: (row, value) =>
                        produce(row, draft => {
                            // If metadata object doesn't exist, we create it.
                            if (typeof draft.metadata === 'undefined')
                                draft.metadata = {
                                    enabled: value
                                };
                            else draft.metadata.enabled = value;
                        })
                }
            ],
            defaultColumnWidths: [
                {
                    columnName: 'enabled',
                    // The default value.
                    width: 75
                },
                {
                    columnName: 'question_enUS',
                    width: 300
                },
                {
                    columnName: 'public',
                    width: 250
                },
                {
                    columnName: 'categories',
                    width: 250
                },
                {
                    columnName: 'question_esES',
                    width: 250
                },
                {
                    columnName: 'question_ca',
                    width: 250
                }
            ],
            formattedTextColumns: [
                'question_enUS',
                'question_esES',
                'question_ca'
            ],
            formattedChipsColumns: ['public', 'categories'],
            formattedCheckBoxColumns: ['enabled'],
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
    async commitChanges({ added, changed, deleted }) {
        const { mutate } = this.props;

        /**
         * Reformat the data of the React Grid.
         * @param {Object} state It has question's id as a key, its value is the question's data that has changed.
         * @return {Object} Question structure like the GraphQL question structure.
         */
        function getQuestionFormat(state) {
            const questionsId = Object.keys(state);
            let question = {
                _id: questionsId[0]
            };
            question = _.merge(state[question._id], question);

            return question;
        }

        if (added) {
            const question = getQuestionFormat(added);

            mutate({
                variables: {
                    input: {
                        action: 'NEW',
                        question
                    }
                },
                update: (
                    cache,
                    {
                        data: {
                            updateFaqsQuestion: { question }
                        }
                    }
                ) => {
                    try {
                        // Read local state (the cache).
                        const data = cache.readQuery({
                            query: QUESTIONS_QUERY
                        });

                        // Add the new question to the cloned cache.
                        let dataClone = _.cloneDeep(data);
                        dataClone.faqs.questions.push(question);

                        // Update the local state
                        cache.writeQuery({
                            query: QUESTIONS_QUERY,
                            data: dataClone
                        });
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        }

        if (changed) {
            const question = getQuestionFormat(changed);

            mutate({
                variables: {
                    input: {
                        action: 'EDIT',
                        question
                    }
                }
            });
        }

        if (deleted) {
            const question = {
                _id: deleted[0]
            };

            await mutate({
                variables: {
                    input: {
                        action: 'DELETE',
                        question
                    }
                },
                update: (
                    cache,
                    {
                        data: {
                            updateFaqsQuestion: { question }
                        }
                    }
                ) => {
                    try {
                        // Read local state (the cache).
                        const data = cache.readQuery({
                            query: QUESTIONS_QUERY
                        });

                        // Delete the question to the clonedcache.
                        let dataClone = _.cloneDeep(data);
                        dataClone.faqs.questions.splice(
                            data.faqs.questions.findIndex(
                                item => item._id === question._id
                            ),
                            1
                        );

                        // Update the local state
                        cache.writeQuery({
                            query: QUESTIONS_QUERY,
                            data: dataClone
                        });
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        }
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
        const { superuser, setError } = this.props;

        // Don't show questions if the user isn't a superuser.
        if (!superuser) return <Redirect to={ROUTES.faqs.path} />;

        return (
            <Query query={QUESTIONS_QUERY}>
                {({ loading, error, data }) => {
                    if (loading) return 'Loading';

                    if (error) {
                        setError(
                            'Problem getting the list of all questions of FAQs'
                        );
                        return null;
                    }

                    return (
                        <Grid
                            rows={data.faqs.questions}
                            columns={columns}
                            getRowId={this.getRowId}
                        >
                            <EditingState
                                columnExtensions={editingColumnExtensions}
                                editingRowIds={editingRowIds}
                                onEditingRowIdsChange={this.changeEditingRowIds}
                                rowChanges={rowChanges}
                                onRowChangesChange={this.changeRowChanges}
                                addedRows={addedRows}
                                onAddedRowsChange={this.changeAddedRows}
                                onCommitChanges={this.commitChanges}
                            />
                            <DataTypeProvider
                                for={formattedTextColumns}
                                formatterComponent={CellText}
                                editorComponent={CellText}
                            />
                            <DataTypeProvider
                                for={formattedChipsColumns}
                                formatterComponent={CellChipsList}
                                editorComponent={CellChipsList}
                            />
                            <DataTypeProvider
                                for={formattedCheckBoxColumns}
                                formatterComponent={CellCheckBox}
                                editorComponent={CellCheckBox}
                            />
                            <Table />
                            <TableColumnResizing
                                defaultColumnWidths={defaultColumnWidths}
                            />
                            <TableHeaderRow />
                            <TableEditRow />
                            <TableEditColumn
                                showAddCommand
                                showEditCommand
                                showDeleteCommand
                            />
                        </Grid>
                    );
                }}
            </Query>
        );
    }
}

function mapStateToProps({ auth }) {
    // TIP: 'superuser' variable only exists for superusers.
    const { superuser } = auth.userType;
    return { superuser };
}

const enhancer = compose(
    graphql(UPDATE_QUESTION),
    connect(
        mapStateToProps,
        actions
    )
);

export default enhancer(QuestionsTable);

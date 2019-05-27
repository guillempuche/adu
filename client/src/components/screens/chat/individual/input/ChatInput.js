import axios from 'axios';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../../../../actions';
import { reduxForm, Field } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import AddIcon from '@material-ui/icons/Add';
import SendIcon from '@material-ui/icons/Send';
import Chip from '@material-ui/core/Chip';
import { fade } from '@material-ui/core/styles/colorManipulator';

import ChatAttach from './ChatAttach';

const styles = theme => ({
    chatInput: {
        display: 'flex',
        alignItems: 'center',
        // Move to the sides the TextField, Chip and SendIcon.
        justifyContent: 'space-between',
        borderTopStyle: 'solid',
        borderTopWidth: 2,
        borderTopColor: fade(theme.palette.primary.main, 0.07),
        // Same minimum height when we show the TextField or the Chip.
        minHeight: 59
    },
    // Expand the input field throughout the free space
    // (it depends on the space taken by the button).
    input: { flexGrow: 1, marginLeft: 4 },
    textfield: {
        padding: '12px 16px',
        // Style of the DOM element `fieldset` (provided by `TextField`)
        [`& fieldset`]: {
            borderRadius: 24
        }
    },
    chipButton: {
        margin: 4
    },
    blankSpace: { flexGrow: 1 }
});

/**
 * @class Chat input that wraps all the components for send messages/files.
 */
class ChatInput extends Component {
    constructor(props) {
        super(props);

        this.state = { files: [], openCloudinary: false };

        this.attachCancel = this.attachCancel.bind(this);
        this.renderField = this.renderField.bind(this);
        this.handleCloudinaryOpening = this.handleCloudinaryOpening.bind(this);
    }

    // Delete the files that client/user doesn't want to sent.
    componentWillUnmount() {
        this.attachCancel();
    }

    /**
     * We delete the files from:
     * - Cloudinary CDN (because Cloudinary Widget uploads all of them)
     * - Redux Store
     */
    async attachCancel() {
        const {
            attachedFiles,
            setChatErrorGeneral,
            deleteAllAttachedFiles,
            t
        } = this.props;

        try {
            // It isn't necessary to cancel the attachment if it isn't any file.
            if (attachedFiles.length !== 0) {
                // Delete on Cloudinary.
                await axios.post('/api/chat/attach/delete', {
                    files: attachedFiles
                });

                // Delete on Redux Store.
                deleteAllAttachedFiles();
            }
        } catch (err) {
            setChatErrorGeneral(t('attach.error'));
        }
    }

    handleCloudinaryOpening() {
        this.setState(({ openCloudinary }) => ({
            openCloudinary: !openCloudinary
        }));
    }

    renderField({ input, ...custom }) {
        const { classes } = this.props;
        return (
            <TextField
                variant="outlined"
                multiline
                rowsMax="4"
                margin="dense"
                {...custom}
                {...input}
                InputProps={{
                    className: classes.textfield
                }}
            />
        );
    }

    render() {
        const {
            attachedFiles,
            onSend,
            handleSubmit,
            deleteAllAttachedFiles,
            classes,
            t
        } = this.props;
        const { openCloudinary } = this.state;

        return (
            <form>
                <div className={classes.chatInput}>
                    {attachedFiles.length === 0 ? (
                        <Fragment>
                            <Field
                                name="text" // Redux Form field's id
                                type="text"
                                className={classes.input}
                                component={this.renderField}
                                normalize={normalizeToUnicode}
                            />
                            <IconButton
                                color="secondary"
                                className={classes.buttonAttach}
                                onClick={this.handleCloudinaryOpening}
                            >
                                <AttachFileIcon />
                            </IconButton>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <Chip
                                variant="outlined"
                                label={t('attach.send', {
                                    count: attachedFiles.length
                                })}
                                onDelete={this.attachCancel}
                                className={classes.chipButton}
                            />
                            <IconButton
                                color="secondary"
                                className={classes.buttonAttach}
                                onClick={this.handleCloudinaryOpening}
                            >
                                <AddIcon />
                            </IconButton>
                        </Fragment>
                    )}
                    <IconButton
                        variant="contained"
                        color="secondary"
                        onClick={
                            // handleSubmit() has to be in a button tag.
                            handleSubmit(() => {
                                onSend();

                                // Only delete attached files if there are someone.
                                if (attachedFiles.length !== 0)
                                    deleteAllAttachedFiles();
                            })
                        }
                    >
                        <SendIcon />
                    </IconButton>
                    <ChatAttach
                        open={openCloudinary}
                        handleOpen={this.handleCloudinaryOpening}
                    />
                </div>
            </form>
        );
    }
}

// Normalize the string to Unicode Normalization Form Canonical Composition
const normalizeToUnicode = value => {
    if (!value) return value;
    else return value.normalize('NFC');
};

const mapStateToProps = ({ chat }) => {
    const { attachedFiles } = chat.selectedRoom;
    return { attachedFiles };
};

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withNamespaces('chatInput'),
    reduxForm({
        form: 'chatInputForm'
    }),
    withStyles(styles)
);

ChatInput.propTypes = {
    onSend: PropTypes.func.isRequired
};

export default enhancer(ChatInput);

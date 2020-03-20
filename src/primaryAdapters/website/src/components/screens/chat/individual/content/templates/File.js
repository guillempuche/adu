import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FileIcon from '@material-ui/icons/InsertDriveFile';

const styles = theme => ({
    file: {
        display: 'flex',
        alignItems: 'center'
    },
    fileName: {
        margin: '0px 10px'
    },
    link: {
        textDecoration: 'none',
        marginRight: 5,
        // No wrap the text of the button when file's name is long.
        whiteSpace: 'nowrap'
    },
    button: theme.chat.message.button
});

/**
 * @function File Show the file's title and the download button.
 *
 * For more info about `file` structure, go to Message DB.
 */
function File({ file, classes, t }) {
    const { url, fileName } = file;

    return (
        <div className={classes.file}>
            <FileIcon color="primary" />
            <Typography variant="body1" className={classes.fileName}>
                {fileName}
            </Typography>
            <a href={url} download={file.fileName} className={classes.link}>
                <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    className={classes.button}
                >
                    {t('content.file-button-open')}
                </Button>
            </a>
        </div>
    );
}

const enhancer = compose(
    withStyles(styles),
    withTranslation('chatClient')
);

File.propTypes = {
    file: PropTypes.object.isRequired
};

export default enhancer(File);

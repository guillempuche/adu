import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Lightbox from 'react-image-lightbox';

const styles = theme => ({
    image: {
        width: '100%',
        //  image behaving like a character of text. We indicate that no such space is needed.
        verticalAlign: 'bottom'
    }
});

/**
 * @class Show the image.
 *
 * For more info about `image` structure, go to Message DB.
 */
class Image extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openViewer: false
        };

        this.handleViewer = this.handleViewer.bind(this);
    }

    /**
     * Change the state `openViewer` to open or close the `Viewer`.
     */
    handleViewer() {
        this.setState(({ openViewer }) => ({ openViewer: !openViewer }));
    }

    render() {
        const { openViewer } = this.state;
        const { image, classes } = this.props;
        const { url } = image;

        return (
            <Fragment>
                <img
                    src={url}
                    onClick={this.handleViewer}
                    className={classes.image}
                />
                {openViewer && (
                    <Lightbox
                        mainSrc={url}
                        onCloseRequest={this.handleViewer}
                    />
                )}
            </Fragment>
        );
    }
}

Image.propTypes = {
    image: PropTypes.object.isRequired
};

export default withStyles(styles)(Image);

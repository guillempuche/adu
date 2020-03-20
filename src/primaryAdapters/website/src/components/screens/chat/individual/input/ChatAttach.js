import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../../../../actions';
import { withTranslation } from 'react-i18next';

/**
 * @class Attach files through Cloudinary CDN Widget.
 */
class ChatAttach extends Component {
    constructor(props) {
        super(props);
        this.state = { widget: {} };
    }

    componentDidMount() {
        const { i18n, saveAttachedFile } = this.props;

        // 'getResourceBundle' only accepts 'es', not 'es-ES'. We
        // need to get the fallback language.
        const lng = i18n.languages[i18n.languages.length - 1];
        let translation = {};
        translation[lng] = i18n.getResourceBundle(
            lng,
            'chatInput'
        ).attach.cloudinary;

        // Private Images https://cloudinary.com/documentation/upload_images?query=raw&c_query=Uploading%20non-image%20files%20as%20raw%20files#private_images
        // More options: https://cloudinary.com/documentation/upload_widget#upload_widget_options
        // Localization: https://cloudinary.com/documentation/upload_widget#localization
        var widget = window.cloudinary.createUploadWidget(
            {
                cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
                uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
                sources: ['local', 'url', 'image_search'],
                language: lng,
                // More about Cloudinary Widget text https://widget.cloudinary.com/v2.0/global/text.json
                text: translation
            },
            (error, result) => {
                // Widget events: https://cloudinary.com/documentation/upload_widget?query=show%20completed&c_query=Upload%20widget%20options%20%E2%80%BA%20showCompletedButton#api_events
                if (error) {
                    console.error('Cloudinary error', error);
                } else {
                    const { event, info } = result;

                    if (event === 'success') {
                        const file = _.pick(info, [
                            'original_filename',
                            'secure_url',
                            'resource_type',
                            // This is necesary to delete the attachments on Cloudinary CDN.
                            'public_id'
                        ]);

                        saveAttachedFile(file);
                    }
                }
            }
        );

        this.setState({ widget });
    }

    // Only open the Cloudinary Widget when the parent component changes its state.
    componentDidUpdate(prevProps) {
        if (prevProps.open !== this.props.open) this.state.widget.open();
    }

    render() {
        return null;
    }
}

const enhancer = compose(
    connect(
        null,
        actions
    ),
    withTranslation('chatInput')
);

ChatAttach.propTypes = {
    open: PropTypes.bool.isRequired,
    handleOpen: PropTypes.func.isRequired
};

export default enhancer(ChatAttach);

/*
// PDF:
info: {
    access_mode: "public"
    bytes: 399849
    created_at: "2019-04-13T10:43:00Z"
    etag: "22881a3598551b9b04ad6670c2db5f1d"
    format: "pdf"
    height: 841
    original_filename: "prova"
    pages: 3
    path: "v1555152180/dev/brnsrqhi8ofygphsfs5y.pdf"
    placeholder: false
    public_id: "dev/brnsrqhi8ofygphsfs5y"
    resource_type: "image"
    secure_url: "https://res.cloudinary.com/guillemau/image/upload/v1555152180/dev/brnsrqhi8ofygphsfs5y.pdf"
    signature: "ea1ecb503ab4d1f6332892989fe45bfd6f9c0940"
    tags: []
    thumbnail_url: "https://res.cloudinary.com/guillemau/image/upload/c_limit,h_60,w_90/v1555152180/dev/brnsrqhi8ofygphsfs5y.jpg"
    type: "upload"
    url: "http://res.cloudinary.com/guillemau/image/upload/v1555152180/dev/brnsrqhi8ofygphsfs5y.pdf"
    version: 1555152180
    width: 595
}

// TXT
info: {
    access_mode: "public"
    bytes: 14
    created_at: "2019-04-13T10:44:27Z"
    etag: "8688a9eb07e6e19348bb8d994d6c1f3c"
    original_filename: "prova"
    path: "v1555152267/dev/gmkanfcuruquuejrsbmj.txt"
    placeholder: false
    public_id: "dev/gmkanfcuruquuejrsbmj.txt"
    resource_type: "raw"
    secure_url: "https://res.cloudinary.com/guillemau/raw/upload/v1555152267/dev/gmkanfcuruquuejrsbmj.txt"
    signature: "c7a9f685b06068974a03b4a0e3080c457b8eff74"
    tags: []
    type: "upload"
    url: "http://res.cloudinary.com/guillemau/raw/upload/v1555152267/dev/gmkanfcuruquuejrsbmj.txt"
    version: 1555152267
}

// DOCX
info: {
    access_mode: "public"
    bytes: 14411
    created_at: "2019-04-13T10:48:40Z"
    etag: "518ba49630773e709baffa5201d6d605"
    original_filename: "presentacion word"
    path: "v1555152520/dev/hwurinhyb2hrpsmtxbeb.docx"
    placeholder: false
    public_id: "dev/hwurinhyb2hrpsmtxbeb.docx"
    resource_type: "raw"
    secure_url: "https://res.cloudinary.com/guillemau/raw/upload/v1555152520/dev/hwurinhyb2hrpsmtxbeb.docx"
    signature: "b6187a20dce04795583aa8e6007769c3dcba2eab"
    tags: []
    type: "upload"
    url: "http://res.cloudinary.com/guillemau/raw/upload/v1555152520/dev/hwurinhyb2hrpsmtxbeb.docx"
    version: 1555152520
}
 */

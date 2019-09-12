/**
 * API for chat.
 */
'use strict';

const { getFileExtension } = require('../utils/chatUtils');
const keys = require('../../../config/keys');
const logger = require('../utils/logger').logger(__filename);
let cloudinary = require('cloudinary').v2;

module.exports = app => {
    /**
     * Delete the attachments uploaded to Cloudinary.
     *
     *  Delete method API: https://cloudinary.com/documentation/image_upload_api_reference#destroy_method
     */
    app.post('/api/chat/attach/delete', (req, res) => {
        const { files } = req.body;

        try {
            if (!files) throw Error('Files not found.');

            cloudinary.config({
                api_key: keys.cloudinaryKey,
                api_secret: keys.cloudinarySecret,
                cloud_name: keys.cloudinaryCloudName,
                secure: true
            });

            files.forEach(file => {
                let { public_id, resource_type } = file;

                const fileExtension = getFileExtension(public_id);

                /**
                 * To delete the file on Cloudinary The identifier of the uploaded asset.
                 * Note: The public ID value for images and videos should not include a file extension. Include the file extension for raw files only.
                 */
                if (resource_type === 'image' || fileExtension === 'pdf') {
                    const index = public_id.lastIndexOf('.');
                    if (index > 0) public_id = public_id.substr(0, index);
                }

                cloudinary.uploader.destroy(
                    public_id,
                    { resource_type },
                    (err, result) => {
                        if (err || result === 'not found')
                            throw Error(
                                `Not able to delete the file=${public_id}`
                            );

                        res.send(true);
                    }
                );
            });
        } catch (err) {
            logger.error('`#API Error on deleting Cloudinary files. ' + err);

            // 409 === conflict.
            res.status(409).send(false);
        }
    });
};

# PHP upload manager

## Description
file upload manager can be used to upload chunked and not chunked files.
uploads can be resumed later , add your files , upload them and close
the explorer (browser) , next time you can open browser and resume
the upload , supports standard HTML form file uploads.

## Features
* **Multiple file upload:**
  Allows to select multiple files at once and upload them simultaneously.
* **Cancelable uploads:**
  Individual file uploads can be canceled to stop the upload progress.
* **Resumable uploads:**
  Aborted uploads can be resumed later.
* **Chunked uploads:**
  Large files can be uploaded in smaller chunks.
* **Customizable and extensible:**
  Provides an interface to define callback methods for various upload events.

## Requirements

### requirements
* [PHP](https://php.net/) v. 5.6+
* [FileInfo ext](https://pecl.php.net/package/Fileinfo/) : Required for recognizing file's mimeType.

### Optional requirements
* [Json ext](https://pecl.php.net/package/json) : Used to return json messages can be used in client side.

## Contributing
Please read the [contribution guidelines](https://github.com/khanzadimahdi/UploadManager/blob/master/CONTRIBUTING.md) before submitting a pull request.

## Support
This project is actively maintained, but there is no official support channel.

## License
Released under the [MIT license](https://opensource.org/licenses/MIT).

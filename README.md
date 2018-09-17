# PHP upload manager

## Description
File upload manager can be used to upload chunk and non-chunk files.

Uploads can be resumed later(see **"resumable-chunk-upload"** example in **"examples/js-example directory"**).

Add your files , upload them and close browser, next time you can open browser and resume
the uncompleted uploads.

## Features
* **Multiple file upload:**
  Allows to select multiple files at once and upload them simultaneously.
* **Cancelable uploads:**
  Individual file uploads can be canceled to stop the upload progress.
* **Resumable uploads:**
  Aborted uploads can be resumed later.
* **Chunk uploads:**
  Large files can be uploaded in smaller chunks.
* **Customizable and extensible:**
  Provides an interface to define callback methods for various upload events.

## Getting started

### Installation

```shell
composer require khanzadimahdi/uploadmanager
```
## Usage

### Available Classes :

* UploadManager\Chunk : contains file's (or chunk) information.
* UploadManager\Upload : stores received files (or chunks).

#### Example: (simple file upload)

> Files are in the **"examples/simple-upload"** directory

First we create a simple HTML form

``` html
<form method="post" action="<?= htmlentities($_SERVER['PHP_SELF']) ?>" enctype="multipart/form-data">
    <label for="media">select file to upload:</label>
    <input id="media" name="media" type="file">
    <input type="submit" value="upload files">
</form>
```

Then we store file (or files) using the below codes:

```php
if($_SERVER['REQUEST_METHOD']=='POST'){
    $uploadManager=new \UploadManager\Upload('media');
    $chunks=$uploadManager->upload('uploads');
    if(!empty($chunks)){
        foreach($chunks as $chunk){
            echo '<p class="success">'.$chunk->getNameWithExtension().' has been uploaded successfully</p>';
        }
    }
}
```

if uploaded file has any errors or it cant be uploaded , the "upload" method throws an exception,
so it's better to call this method in a try catch block.

```php
try{
    if($_SERVER['REQUEST_METHOD']=='POST'){
        $uploadManager=new \UploadManager\Upload('media');
        $chunks=$uploadManager->upload('uploads');
        if(!empty($chunks)){
            foreach($chunks as $chunk){
                echo '<p class="success">'.$chunk->getNameWithExtension().' has been uploaded successfully</p>';
            }
        }
    }
}catch(\UploadManager\Exceptions\Upload $exception){
    //if file exists: (user selects a file)
    if(!empty($exception->getChunk())){
        foreach($exception->getChunk()->getErrors() as $error){
            echo '<p class="error">'.$error.'</p>';
        }
    }else{
        echo '<p class="error">'.$exception->getMessage().'</p>';
    }
}
```

Each file (or chunk) related errors can be retrieved by "getErrors" method as an array.

### Validations

We can validate files (or chunks) before storing them.

> a simple validation example is in **"examples/using-validations"** directory

Available validations :

1. Extension
2. MimeType
3. Size

#### Example:

```php
//add validations
$uploadManager->addValidations([
    new \UploadManager\Validations\Size('2M'), //maximum file size is 2M
    new \UploadManager\Validations\Extension(['jpg','jpeg','png','gif']),
]);
```
as you see, we can use **"addValidations"** method to add an array of validations.

> you can use either available validations or creating a custom validation by implementing 
  **"UploadManager\Contracts\ValidationInterface"** interface.

### Callbacks

Here we have the below callbacks:

1. beforeValidate

2. afterValidate

3. beforeUpload

4. afterUpload

> Callbacks can be used to control the flow of uploading mechanism.

#### example:

Here we remove uploaded file (or chunk) if an error occurred.

> Files are in the **"examples/simple-callbacks"** directory

```php
//add callback : remove uploaded chunks on error
$uploadManager->afterValidate(function($chunk){
    $address=($chunk->getSavePath().$chunk->getNameWithExtension());
    if($chunk->hasError() && file_exists($address)){
        //remove current chunk on error
        @unlink($address);
    }
});
```

## More real examples

see the **"examples/js-examples"** directory for more real examples.

#### available examples:

* Dropzone

* JQuery file upload

* Plupload

* Resumable-Chunk-Upload : the best example for resuming uploads in the future!
 in this example you need to create a database and import **"server/medias.sql"** in it , 
 then change connection configs in **"server/upload.php"**

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

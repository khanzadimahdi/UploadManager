<?php
	//add composer autoloader
	include '../../../../vendor/autoload.php';


    try{
        if($_SERVER['REQUEST_METHOD']=='POST'){
            $uploadManager=new \UploadManager\Upload('media');

            //add validations
            $uploadManager->addValidations([
                new \UploadManager\Validations\Size('5M'), //maximum file size must be 2M
                new \UploadManager\Validations\Extension(['jpg','jpeg','png','gif']),
            ]);

            //add callback : remove uploaded chunks on error
            $uploadManager->afterValidate(function($chunk){
                $address=($chunk->getSavePath().$chunk->getNameWithExtension());
                if(file_exists($address)){
                    @unlink($address);
                }
            });

            $chunks=$uploadManager->upload('../uploads');

        }
    }catch(\UploadManager\Exceptions\Upload $exception){
        //send bad request error
        header($_SERVER['SERVER_PROTOCOL'].' 400 Bad Request',true,'400');

		echo $exception->getMessage();
    }

<?php
	//add composer autoloader
	require '../../../../vendor/autoload.php';


    try{
        if($_SERVER['REQUEST_METHOD']=='POST'){
            $uploadManager=new \UploadManager\Upload('media');

            //add validations
            $uploadManager->addValidations([
                new \UploadManager\Validations\Size('5M'), //maximum file size must be 2M
                //new \UploadManager\Validations\Extension(['jpg','jpeg','png','gif']),
            ]);

            //add callback : remove uploaded chunks on error
            $uploadManager->afterValidate(function($chunk){
				$address=($chunk->getSavePath().$chunk->getNameWithExtension());
				if($chunk->hasError() && file_exists($address)){
					//remove current chunk on error
					@unlink($address);
				}
            });

            $chunks=$uploadManager->upload('../uploads');

			// Return Success JSON-RPC response
			echo ('{"jsonrpc" : "2.0", "result" : null, "id" : "id"}');
        }
    }catch(\UploadManager\Exceptions\Upload $exception){
        //send bad request error
        header($_SERVER['SERVER_PROTOCOL'].' 400 Bad Request',true,'400');
		echo ('{"jsonrpc" : "2.0", "error" : {"code": 400, "message": "'.$exception->getMessage().'"}, "id" : "id"}');
    }

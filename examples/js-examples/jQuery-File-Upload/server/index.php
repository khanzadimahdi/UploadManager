<?php
	//add composer autoloader
	require '../../../../vendor/autoload.php';

    try{
        if($_SERVER['REQUEST_METHOD']=='POST'){
            $uploadManager=new \UploadManager\Upload('files');

            //add validations
            $uploadManager->addValidations([
                new \UploadManager\Validations\Size('5M'), //maximum file size must be 2M
                new \UploadManager\Validations\Extension(['jpg','jpeg','png','gif']),
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

			$response=array();

			foreach($chunks as $chunk){
				$response[] = [
					'url'  => './uploads/'.basename($chunk->getSavePath().$chunk->getNameWithExtension()),
					'thumbnail_url' => './uploads/'.basename($chunk->getSavePath().$chunk->getNameWithExtension()),
					'name' => $chunk->getNameWithExtension(),
					'type' => $chunk->getMimeType(),
					'size' => $chunk->getSavedSize(),
					'delete_url'   => '',
					'delete_type' => 'DELETE' // method for destroy action
				];
			}
        }
    }catch(\UploadManager\Exceptions\Upload $exception){
        //send bad request error
		if(!empty($exception->getChunk())){
			$chunk=$exception->getChunk();
			$response[] = [
				'error' => $exception->getMessage(),
				'url'  => './uploads/'.basename($chunk->getSavePath().$chunk->getNameWithExtension()),
				'thumbnail_url' => './uploads/'.basename($chunk->getSavePath().$chunk->getNameWithExtension()),
				'name' => $chunk->getNameWithExtension(),
				'type' => $chunk->getMimeType(),
				'size' => $chunk->getSavedSize(),
				'delete_url'   => '',
				'delete_type' => 'DELETE' // method for destroy action
			];
		}else{
			$response[] = [
				'error' => $exception->getMessage(),
				'url'  => '',
				'thumbnail_url' => '',
				'name' => '',
				'type' => '',
				'size' => '',
				'delete_url'   => '',
				'delete_type' => 'DELETE' // method for destroy action
			];
		}
    }finally{
    	$filejson = new stdClass();
    	$filejson->files=$response;
		echo json_encode($filejson,JSON_UNESCAPED_UNICODE);
    }

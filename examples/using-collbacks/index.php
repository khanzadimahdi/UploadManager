<?php
	//add composer autoloader
	include '../../vendor/autoload.php';
?>
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<title>Document</title>
        <style>
            .success{
                color:#0F0;
            }
            .error{
                color:#F00;
            }
        </style>
	</head>
	<body>
		<?php
		    try{
				if($_SERVER['REQUEST_METHOD']=='POST'){
					$uploadManager=new \UploadManager\Upload('media');

					//add validations
					$uploadManager->addValidations([
					    new \UploadManager\Validations\Size('2M'), //maximum file size must be 2M
					    new \UploadManager\Validations\Extension(['jpg','jpeg','png','gif']),
                    ]);

                    //add callback : remove uploaded chunks on error
                    $uploadManager->afterValidate(function($chunk){
                        $address=($chunk->getSavePath().$chunk->getNameWithExtension());
                        if(file_exists($address)){
                            @unlink($address);
                        }
                    });



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
		?>
		<form method="post" action="<?= htmlentities($_SERVER['PHP_SELF']) ?>" enctype="multipart/form-data">
			<label for="media">select file to upload:</label>
			<input id="media" name="media[]" type="file" multiple>
			<input type="submit" value="upload files">
		</form>
	</body>
</html>

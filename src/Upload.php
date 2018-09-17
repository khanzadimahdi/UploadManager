<?php
namespace UploadManager;


use UploadManager\Contracts\ChunkInterface;
use UploadManager\Contracts\UploadInterface;
use UploadManager\Contracts\ValidationInterface;
use UploadManager\Exceptions\Upload as UploadException;

/**
 * stores files (or chunks)
 *
 * Class Upload
 * @package UploadManager
 */
class Upload implements UploadInterface {

    /**
     * Upload error code messages
     * @var array
     */
    public static $errorCodeMessages = array(
        1 => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
        2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
        3 => 'The uploaded file was only partially uploaded',
        4 => 'No file was uploaded',
        6 => 'Missing a temporary folder',
        7 => 'Failed to write file to disk',
        8 => 'A PHP extension stopped the file upload'
    );

	/**
	 * Chunk file information
	 *
	 * @var array[ChunkInterface]
	 */
	protected $chunks=array();

	/**
	 * Validations
	 *
	 * @var array[ValidationInterface]
	 */
	protected $validations=array();

	/**
	 * validation errors
	 *
	 * @var array[string]
	 */
	protected $errors=array();

    /**
     * Before validation callback
     * @var callable
     */
    protected $beforeValidationCallback;

    /**
     * After validation callback
     * @var callable
     */
    protected $afterValidationCallback;

    /**
     * Before upload callback
     * @var callable
     */
    protected $beforeUploadCallback;

    /**
     * After upload callback
     * @var callable
     */
    protected $afterUploadCallback;

	public function __construct($inputName,array $validations=[])
	{
        // Check if file uploads are allowed
        if (ini_get('file_uploads') == false) {
            throw new \RuntimeException('File uploads are disabled in your PHP.ini file');
        }
        // Check if key exists
        if (isset($_FILES[$inputName]) === false) {
            throw new \InvalidArgumentException("Cannot find uploaded file(s) identified by key: $inputName");
        }

		//add validations
        if(!empty($validations)){
			$this->addValidations($validations);
        }

        // Collect chunk info
        if (is_array($_FILES[$inputName]['tmp_name']) === true) {
            foreach ($_FILES[$inputName]['tmp_name'] as $index => $tmpName) {
                if ($_FILES[$inputName]['error'][$index] !== UPLOAD_ERR_OK) {
                    $this->errors[] = sprintf(
                        '%s: %s',
                        $_FILES[$inputName]['name'][$index],
                        static::$errorCodeMessages[$_FILES[$inputName]['error'][$index]]
                    );
                    continue;
                }
                $this->chunks[] = Chunk::createFromFactory(
                    $_FILES[$inputName]['tmp_name'][$index],
                    $_FILES[$inputName]['name'][$index]
                );
            }
        } else {
            if ($_FILES[$inputName]['error'] !== UPLOAD_ERR_OK) {
                $this->errors[] = sprintf(
                    '%s: %s',
                    $_FILES[$inputName]['name'],
                    static::$errorCodeMessages[$_FILES[$inputName]['error']]
                );
            }
            $this->chunks[] = Chunk::createFromFactory(
                $_FILES[$inputName]['tmp_name'],
                $_FILES[$inputName]['name']
            );
        }

	}

    /********************************************************************************
     * Callbacks
     *******************************************************************************/

    /**
     * Set `beforeValidation` callable
     *
	 * @param callable $callable
	 * @return $this
     * @throws \InvalidArgumentException	If argument is not a Closure or invokable object
	 *
	 */
    public function beforeValidate(callable $callable)
    {
        if (!is_callable($callable)) {
            throw new \InvalidArgumentException('Callback is not a callable.');
        }
        $this->beforeValidation = $callable;
        return $this;
    }

    /**
     * Set `afterValidation` callable
     *
	 * @param callable $callable
	 * @return $this
     * @throws \InvalidArgumentException	If argument is not a Closure or invokable object
	 *
	 */
    public function afterValidate(callable $callable)
    {
        if (!is_callable($callable)) {
            throw new \InvalidArgumentException('Callback is not a callable.');
        }
        $this->afterValidation = $callable;
        return $this;
    }

    /**
     * Set `beforeUpload` callable
     *
	 * @param callable $callable
	 * @return $this
     * @throws \InvalidArgumentException	If argument is not a Closure or invokable object
	 *
	 */
    public function beforeUpload(callable $callable)
    {
        if (!is_callable($callable)) {
            throw new \InvalidArgumentException('Callback is not a callable.');
        }
        $this->beforeUpload = $callable;
        return $this;
    }

    /**
     * Set `afterUpload` callable
     *
	 * @param callable $callable
	 * @return $this
     * @throws \InvalidArgumentException	If argument is not a Closure or invokable object
	 *
	 */
    public function afterUpload(callable $callable)
    {
        if (!is_callable($callable)) {
            throw new \InvalidArgumentException('Callback is not a callable.');
        }
        $this->afterUpload = $callable;
        return $this;
    }

    /**
     * Apply callable
     *
	 * @param $callbackName
	 * @param chunk $chunk
	 */
    protected function applyCallback($callbackName, chunk $chunk)
    {
        if (in_array($callbackName, array('beforeValidation', 'afterValidation', 'beforeUpload', 'afterUpload')) === true) {
            if (isset($this->$callbackName) === true) {
                call_user_func_array($this->$callbackName, array($chunk));
            }
        }
    }

	/********************************************************************************
	 * Validation and Error Handling
	 *******************************************************************************/

	/**
	 * @param array $validations
	 * @return $this
	 */
    public function addValidations(array $validations)
    {
        foreach ($validations as $validation) {
            $this->addValidation($validation);
        }
        return $this;
    }

	/**
	 * @param ValidationInterface $validation
	 * @return $this
	 */
    public function addValidation(ValidationInterface $validation)
    {
        $this->validations[] = $validation;
        return $this;
    }

	/**
	 * @return array
	 */
    public function getValidations()
    {
        return $this->validations;
    }

	/**
	 * @return bool
	 */
    public function validate()
    {
        foreach ($this->chunks as $chunk) {
            // Before validation callback
            $this->applyCallback('beforeValidation', $chunk);
            // Check is uploaded file
            if ($this->isUploadedFile($chunk) === false) {
            	$error='Is not an uploaded file';
                $this->errors[] = sprintf(
                    '%s: %s',
                    $chunk->getNameWithExtension(),
                    $error
                );
                $chunk->addError($error);
                continue;
            }
            // Apply user validations
            foreach ($this->validations as $validation) {
                try {
                    $validation->validate($chunk);
                } catch (UploadException $e) {
                    $this->errors[] = sprintf(
                        '%s: %s',
                        $chunk->getNameWithExtension(),
                        $e->getMessage()
                    );
					$chunk->addError($e->getMessage());
                }
            }
            // After validation callback
            $this->applyCallback('afterValidation', $chunk);
        }
        return empty($this->errors);
    }

    public function getErrors()
    {
        return $this->errors;
    }

    /********************************************************************************
    * Upload
    *******************************************************************************/

	/**
	 * @param ChunkInterface $chunk
	 * @return bool
	 */
	public function isUploadedFile(ChunkInterface $chunk)
	{
		return is_uploaded_file($chunk->getTmpName());
	}

	/**
	 * @param null $path
	 * @param null $nameWithExtension
	 * @param bool $uniqueNameInPath
	 * @param null $offset
	 * @param null $length
	 * @return array
	 * @throws UploadException
	 */
    public function upload($path=null,$nameWithExtension=null,$uniqueNameInPath=false,$offset=null,$length=null)
    {
    	//set upload path
		foreach($this->chunks as $chunk){
			if(!empty($nameWithExtension)){
				$chunk->setNameAndExtension($nameWithExtension);
			}

			//check if name is unique in that path?
			if(!empty($uniqueNameInPath)){
				$name=static::findUniqueName($path,$chunk->getName(),$chunk->getExtension());
				$chunk->setName($name);
			}

			if(empty($path)){
				$path='./';
			}

			$chunk->setSavePath($path);
		}

		//validation
        if ($this->validate() === false) {
        	$message=null;
        	foreach($this->errors as $error){
        		$message.=$error.PHP_EOL;
        	}
			throw new UploadException($message);
        }

        foreach ($this->chunks as $chunk) {
            $this->applyCallback('beforeUpload', $chunk);

			$chunk->save(null,$offset,$length);

            $this->applyCallback('afterUpload', $chunk);
        }
        return $this->chunks;
    }

    /********************************************************************************
    * Helpers
    *******************************************************************************/

	/**
	 * creates a unique name in given path
	 *
	 * @param $path
	 * @param $name
	 * @param $extension
	 * @return string
	 */
	public static function findUniqueName($path,$name,$extension){
		$counter=0;
		do{
			$unique_name=$name.($counter>0?('_'.($counter)):'');
			$file_address=$path.DIRECTORY_SEPARATOR.$unique_name.'.'.$extension;
			$counter++;
		}while(is_file($file_address) && file_exists($file_address));
		return $unique_name;
	}

	/**
	 * converts human readable string to bytes
	 *
	 * @param $input
	 * @return float|int
	 */
	public static function humanReadableToBytes($input){
        $number = (int)$input;
        $units = array('b','k','m','g','t','p', 'e','z','y');
        $unit = strtolower(substr($input, -1));
        if (array_search($unit,$units)!==false) {
        	$power=array_search($unit,$units);
        	$bytes=pow(1024,$power);
            $number = $number * $bytes;
        }
        return $number;
	}

}
<?php
namespace UploadManager;


use UploadManager\Contracts\ChunkInterface;

/**
 * keeps files' (or chunks') information
 *
 * Class Chunk
 * @package UploadManager
 */
class Chunk implements ChunkInterface {

	/**
	 * chunk temp name
	 * @var string
	 */
	protected $tmp_name;

	/**
	 * full name (name.extension)
	 * @var string
	 */
	protected $fullName;

	/**
	 * name
	 * @var string
	 */
	protected $name;

	/**
	 * extension
	 * @var string
	 */
	protected $extension;

	/**
	 * save path
	 * @var string
	 */
	protected $savePath='./';

	/**
	 * validation errors
	 * @var array
	 */
	protected $errors=array();

	/**
	 * dynamically add properties
	 * @var array
	 */
	protected $properties=array();

	/**
	 * Chunk constructor.
	 * retrieves chunk temp_name and fullName and sets name and extension
	 *
	 * @param $tmp_name
	 * @param $name
	 */
	public function __construct($tmp_name,$name)
	{
		$this->tmp_name=$tmp_name;
		$this->fullName=$name;

		$this->setNameAndExtension($this->fullName);
	}

	/**
	 * retrieves size in bytes
	 *
	 * @return int
	 */
	public function getSize()
	{
		return filesize($this->tmp_name);
	}

	/**
	 * retrieves name (without extension)
	 *
	 * @return string
	 */
	public function getName()
	{
		return $this->name;
	}

	/**
	 * sets name
	 *
	 * @param $name
	 * @return $this
	 */
	public function setName($name)
	{
		$this->name=$name;
		return $this;
	}

	/**
	 * retrieves temp name
	 *
	 * @return string
	 */
	public function getTmpName(){
		return $this->tmp_name;
	}

	/**
	 * retrieves extension
	 *
	 * @return mixed
	 */
	public function getExtension()
	{
		return $this->extension;
	}

	/**
	 * sets extension
	 *
	 * @param $extension
	 * @return $this
	 */
	public function setExtension($extension)
	{
		$this->extension=$extension;
		return $this;
	}

	/**
	 * sets name and extension
	 *
	 * @param $nameWithExtension
	 * @return $this
	 */
	public function setNameAndExtension($nameWithExtension){
		$this->name=pathInfo($nameWithExtension,PATHINFO_FILENAME);
		$this->extension=pathInfo($nameWithExtension,PATHINFO_EXTENSION);
		return $this;
	}

	/**
	 * retrieves full name
	 * @example : john_doe.png
	 *
	 * @return string
	 */
	public function getNameWithExtension(){
		return ( $this->getName().'.'.$this->getExtension() );
	}

	/**
	 * retrieving file mime type
	 *
	 * @return string
	 */
	public function getMimeType()
	{
		return mime_content_type($this->tmp_name);
	}

    /********************************************************************************
	 * working with errors
     *******************************************************************************/

	/**
	 * determines if has any error
	 *
	 * @return bool
	 */
	public function hasError(){
		return !empty($this->errors);
	}

	/**
	 * retrieves errors
	 *
	 * @return array
	 */
	public function getErrors(){
		return $this->errors;
	}

	/**
	 * pushes an error in stack
	 *
	 * @param $error
	 * @return $this
	 */
	public function addError($error){
		$this->errors[]=$error;
		return $this;
	}

	/**
	 * clears error's stack
	 *
	 * @return $this
	 */
	public function clearErrors(){
		$this->errors=array();
		return $this;
	}


    /********************************************************************************
	 * save files and retrieve their info
     *******************************************************************************/

	/**
	 * retrieves saved path
	 * saved path is used to save chunk
	 *
	 * @return string
	 */
	public function getSavePath(){
		return $this->savePath;
	}

	/**
	 * set save path
	 *
	 * @param $path
	 * @return $this
	 */
	public function setSavePath($path){
		//remove trailing slash
		$path=rtrim($path, '/');
		$path=rtrim($path, '\\');
		$this->savePath=$path.DIRECTORY_SEPARATOR;
		return $this;
	}

	/**
	 * retrieves file size which has been saved in save path
	 *
	 * @return int (if file exists)
	 * @return bool(false) (if file not exists)
	 */
	public function getSavedSize(){
		$savedFile=$this->getSavePath().$this->getNameWithExtension();
		if(is_file($savedFile) && file_exists($savedFile)) {
			return filesize($savedFile);
		}
		return false;
	}

	/**
	 * saving file
	 *
	 * @param null $path
	 * @param null $offset
	 * @param null $length
	 * @return bool|string
	 */
	public function save($path=null,$offset=null,$length=null)
	{
		if(!empty($path)){
			$this->setSavePath($path);
		}

		//create destination
		$destination=$this->getSavePath().$this->getNameWithExtension();

		$fromChunkHandler=fopen($this->tmp_name,'r');
		$toChunkHandler=fopen($destination,'a');

		@clearstatcache();

		if(!empty($offset) && is_numeric($offset)){
			fseek($toChunkHandler,$offset);
		}

		if(empty($length) || !is_numeric($length)){
			$length=$this->getSize();
		}

		flock($fromChunkHandler, LOCK_EX);
		flock($toChunkHandler, LOCK_EX);

		$result=fwrite(
			$toChunkHandler,
			fread($fromChunkHandler,$length)
		);

		flock($fromChunkHandler, LOCK_UN);
		flock($toChunkHandler, LOCK_UN);

		fclose($fromChunkHandler);
		fclose($toChunkHandler);

		if($result){
			return $destination;
		}

		return false;
	}

    /********************************************************************************
	 * helper methods
     *******************************************************************************/

	/**
	 * Creating a new chunk instance
	 *
	 * @param $tmp_name
	 * @param $name
	 * @return Chunk
	 */
	public static function createFromFactory($tmp_name,$name){
		return new static($tmp_name,$name);
	}

	/**
	 * add new property
	 *
	 * @param $name
	 * @param $value
	 */
	public function __set($name,$value){
		$this->properties[$name]=$value;
	}

	/**
	 * retrieve property value if exists
	 *
	 * @param $name
	 * @return mixed|null
	 */
	public function __get($name){
		return ( !empty($this->properties[$name]) ? $this->properties[$name] : null );
	}
}
<?php
namespace UploadManager\Contracts;

interface ChunkInterface{

	/**
	 * retrieves size in bytes
	 *
	 * @return string
	 */
	public function getSize();

	/**
	 * retrieves name(without extension)
	 *
	 * @return string
	 */
	public function getName();

	/**
	 * set name
	 *
	 * @param $name
	 * @return $this
	 */
	public function setName($name);

	/**
	 * get uploaded chunk's name
	 *
	 * @return string
	 */
	public function getTmpName();

	/**
	 * retrieves extension
	 *
	 * @return string
	 */
	public function getExtension();

	/**
	 * set extension
	 *
	 * @param $extension
	 * @return $this
	 */
	public function setExtension($extension);

	/**
	 * gives full filename and sets name and extension
	 * @example: john_doe.png	name=john_doe and extension=png
	 *
	 * @param $nameWithExtension
	 * @return $this
	 */
	public function setNameAndExtension($nameWithExtension);

	/**
	 * retrieves full name
	 * @example : john_doe.png
	 *
	 * @return string
	 */
	public function getNameWithExtension();

	/**
	 * retrieves mimeType
	 *
	 * @return string
	 */
	public function getMimeType();

    /********************************************************************************
	 * working with errors
     *******************************************************************************/

	/**
	 * determines if has any error
	 *
	 * @return bool
	 */
	public function hasError();

	/**
	 * retrieves errors
	 *
	 * @return array
	 */
	public function getErrors();

	/**
	 * pushes an error in stack
	 *
	 * @param $error
	 * @return $this
	 */
	public function addError($error);

	/**
	 * clears error's stack
	 *
	 * @return $this
	 */
	public function clearErrors();

    /********************************************************************************
	 * save files and retrieve their info
     *******************************************************************************/

	/**
	 * retrieves saved path
	 * saved path is used to save chunk
	 *
	 * @return string
	 */
	public function getSavePath();

	/**
	 * sets save path
	 *
	 * @param $path
	 * @return $this
	 */
	public function setSavePath($path);

	/**
	 * retrieves file size which has been saved in save path
	 *
	 * @return int (if file exists)
	 * @return bool(false) (if file not exists)
	 */
	public function getSavedSize();

	/**
	 * saves file (in save path)
	 * offset can be used to write data in a specific position
	 * length determines data's length can be stored
	 *
	 * notice: if you dont want to use parameters just put them null ,
	 * so default configs will be used
	 *
	 * @example save(null,null,1024)
	 *
	 * @param null $path
	 * @param null $offset
	 * @param null $length
	 * @return bool|string
	 */
	public function save($path=null,$offset=null,$length=null);

}
<?php
namespace UploadManager\Contracts;

interface UploadInterface{

	/**
	 * calls a function/method before validation
	 *
	 * @param callable $callable
	 * @return mixed
	 */
	public function beforeValidate(callable $callable);

	/**
	 * calls a function/method after validation
	 *
	 * @param callable $callable
	 * @return mixed
	 */
    public function afterValidate(callable $callable);

	/**
	 * runs a function/method before upload
	 *
	 * @param callable $callable
	 * @return mixed
	 */
    public function beforeUpload(callable $callable);

	/**
	 * runs a function/method after upload
	 *
	 * @param callable $callable
	 * @return mixed
	 */
    public function afterUpload(callable $callable);

	/**
	 * push validations into stack
	 *
	 * @param array $validations
	 * @return $this
	 */
    public function addValidations(array $validations);

	/**
	 *	push a validation into stack
	 *
	 * @param ValidationInterface $validation
	 * @return $this
	 */
    public function addValidation(ValidationInterface $validation);

	/**
	 * retrieves validations
	 *
	 * @return array
	 */
    public function getValidations();

	/**
	 * validate validations (exists in stack)
	 *
	 * @return bool (if all validations are correct , returns true)
	 */
    public function validate();

	/**
	 * retrieves errors
	 *
	 * @return array
	 */
	public function getErrors();

	/**
	 * determines if file has been uploaded successfully
	 *
	 * @param ChunkInterface $chunk
	 * @return bool
	 */
	public function isUploadedFile(ChunkInterface $chunk);

	/**
	 * runs upload process
	 *
	 * @param null $path
	 * @param null $nameWithExtension
	 * @param bool $uniqueNameInPath
	 * @param null $offset
	 * @param null $length
	 * @return array (contains chunks)
	 */
    public function upload($path=null,$nameWithExtension=null,$uniqueNameInPath=false,$offset=null,$length=null);

}
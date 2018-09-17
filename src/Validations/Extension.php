<?php
namespace UploadManager\Validations;

use UploadManager\Contracts\ChunkInterface;
use UploadManager\Contracts\ValidationInterface;
use UploadManager\Exceptions\Upload;

/**
 * Extension validation
 *
 * Class Extension
 * @package UploadManager\Validations
 */

class Extension implements ValidationInterface{

    /**
     * Array of acceptable file extensions without leading dots
     * @var array
     */
    protected $allowedExtensions;
    /**
     * Constructor
     *
     * @param string|array $allowedExtensions Allowed file extensions
     * @example new \UploadManager\Validation\Extension(array('png','jpg','gif'))
     * @example new \UploadManager\Validation\Extension('png')
     */
    public function __construct($allowedExtensions)
    {
        if (is_string($allowedExtensions) === true) {
            $allowedExtensions = array($allowedExtensions);
        }
        $this->allowedExtensions = array_map('strtolower', $allowedExtensions);
    }

    /**
     * Validate
     *
	 * @param ChunkInterface $chunk
	 * @throws Upload
	 */
    public function validate(ChunkInterface $chunk)
    {
        $fileExtension = strtolower($chunk->getExtension());
        if (in_array($fileExtension, $this->allowedExtensions) === false) {
            throw new Upload(sprintf('Invalid file extension. Must be one of: %s', implode(', ', $this->allowedExtensions)), $chunk);
        }
    }

}

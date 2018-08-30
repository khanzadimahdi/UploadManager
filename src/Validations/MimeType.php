<?php
namespace UploadManager\Validations;

use UploadManager\Contracts\ChunkInterface;
use UploadManager\Contracts\ValidationInterface;
use UploadManager\Exceptions\Upload;

class MimeType implements ValidationInterface{

    /**
     * Valid media types
     * @var array
     */
    protected $allowedMimeTypes;

    /**
     * Constructor
     *
     * @param string|array $allowedMimeTypes
     */
    public function __construct($allowedMimeTypes)
    {
        if (is_string($allowedMimeTypes) === true) {
            $allowedMimeTypes = array($allowedMimeTypes);
        }
        $this->allowedMimeTypes = $allowedMimeTypes;
    }
    /**
     * Validate
     *
	 * @param ChunkInterface $chunk
	 * @throws Upload
	 */
    public function validate(ChunkInterface $chunk)
    {
        if (in_array($chunk->getMimeType(), $this->allowedMimeTypes) === false) {
            throw new Upload(sprintf('Invalid mimeType. Must be one of: %s', implode(', ', $this->allowedMimeTypes)), $chunk);
        }
    }
}
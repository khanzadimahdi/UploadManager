<?php
namespace UploadManager\Validations;

use UploadManager\Contracts\ChunkInterface;
use UploadManager\Contracts\ValidationInterface;
use UploadManager\Exceptions\Upload as UploadException;
use UploadManager\Upload;

class Size implements ValidationInterface{

    /**
     * Minimum acceptable file size (bytes)
     * @var int
     */
    protected $minSize;
    /**
     * Maximum acceptable file size (bytes)
     * @var int
     */
    protected $maxSize;


	public function __construct($maxSize, $minSize = 0){
        if (is_string($maxSize)) {
            $maxSize = Upload::humanReadableToBytes($maxSize);
        }
        $this->maxSize = $maxSize;

        if (is_string($minSize)) {
            $minSize = Upload::humanReadableToBytes($minSize);
        }
        $this->minSize = $minSize;
	}

	/**
	 * validate
	 *
	 * @param ChunkInterface $chunk
	 * @throws UploadException
	 */
	public function validate(ChunkInterface $chunk)
	{
		$fileSize = $chunk->getSize();
		$savedFileSize=$chunk->getSavedSize();

        if ($fileSize < $this->minSize || $savedFileSize<$this->minSize) {
            throw new UploadException(sprintf('File size is too small. Must be greater than or equal to: %s bytes', $this->minSize), $chunk);
        }

        if ($fileSize > $this->maxSize || $savedFileSize > $this->maxSize) {
            throw new UploadException(sprintf('File size is too large. Must be less than: %s bytes', $this->maxSize), $chunk);
        }

	}

}
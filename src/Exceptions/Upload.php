<?php
namespace UploadManager\Exceptions;

use \Exception;
use UploadManager\Contracts\ChunkInterface;

class Upload extends Exception {

	/**
	 * @var null|ChunkInterface
	 */
    protected $chunk;

	/**
	 * UploadException constructor.
	 *
	 * @param $message
	 * @param ChunkInterface|null $chunk
	 */
    public function __construct($message, ChunkInterface $chunk = null)
    {
        $this->chunk = $chunk;
        parent::__construct($message);
    }

    /**
     * Get related chunk
     *
	 * @return null|ChunkInterface
	 */
    public function getChunk()
    {
        return $this->chunk;
    }

}
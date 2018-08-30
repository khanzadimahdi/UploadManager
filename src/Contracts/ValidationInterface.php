<?php
namespace UploadManager\Contracts;

interface ValidationInterface
{

	/**
	 * validates a chunk
	 *
	 * @param ChunkInterface $chunk
	 * @return mixed
	 */
    public function validate(ChunkInterface $chunk);

}
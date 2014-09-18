<?php namespace FlipperMaps;

use Illuminate\Database\Eloquent\Model;

class Rate extends Model
{
	public function machine()
	{
		return $this->belongsTo('FlipperMaps\Machine');
	}
}

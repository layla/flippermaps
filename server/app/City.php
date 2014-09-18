<?php namespace FlipperMaps;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
	public function locations()
	{
		return $this->hasMany('FlipperMaps\Location');
	}
}

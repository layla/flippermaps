<?php namespace FlipperMaps;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
	public function cities()
	{
		return $this->hasMany('FlipperMaps\City');
	}
}

<?php namespace FlipperMaps;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
	public function city()
	{
		return $this->belongsTo('FlipperMaps\City');
	}

	public function machines()
	{
		return $this->hasMany('FlipperMaps\Machine');
	}
}

<?php namespace FlipperMaps;

use Illuminate\Database\Eloquent\Model;

class Machine extends Model
{
	public function location()
	{
		return $this->belongsTo('FlipperMaps\Location');
	}

	public function rates()
	{
		return $this->hasMany('FlipperMaps\Rate');
	}
}

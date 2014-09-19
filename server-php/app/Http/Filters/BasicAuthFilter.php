<?php namespace FlipperMaps\Http\Filters;

use Auth;

class BasicAuthFilter {

	/**
	 * Run the request filter.
	 *
	 * @return mixed
	 */
	public function filter()
	{
		return Auth::basic();
	}

}
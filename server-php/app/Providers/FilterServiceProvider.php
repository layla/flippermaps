<?php namespace FlipperMaps\Providers;

use Illuminate\Routing\FilterServiceProvider as ServiceProvider;

class FilterServiceProvider extends ServiceProvider {

	/**
	 * The filters that should run before all requests.
	 *
	 * @var array
	 */
	protected $before = [
		'FlipperMaps\Http\Filters\MaintenanceFilter',
	];

	/**
	 * The filters that should run after all requests.
	 *
	 * @var array
	 */
	protected $after = [
		//
	];

	/**
	 * All available route filters.
	 *
	 * @var array
	 */
	protected $filters = [
		'auth' => 'FlipperMaps\Http\Filters\AuthFilter',
		'auth.basic' => 'FlipperMaps\Http\Filters\BasicAuthFilter',
		'csrf' => 'FlipperMaps\Http\Filters\CsrfFilter',
		'guest' => 'FlipperMaps\Http\Filters\GuestFilter',
	];

}
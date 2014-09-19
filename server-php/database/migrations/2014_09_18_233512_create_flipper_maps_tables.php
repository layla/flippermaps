<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFlipperMapsTables extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('countries', function($table)
		{
			$table->increments('id');
			$table->timestamps();
		});

		Schema::create('cities', function($table)
		{
			$table->increments('id');
			$table->timestamps();
		});

		Schema::create('locations', function($table)
		{
			$table->increments('id');
			$table->timestamps();
		});

		Schema::create('machines', function($table)
		{
			$table->increments('id');
			$table->timestamps();
		});

		Schema::create('rates', function($table)
		{
			$table->increments('id');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('rates');
		Schema::drop('machines');
		Schema::drop('locations');
		Schema::drop('cities');
		Schema::drop('countries');
	}

}

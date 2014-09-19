<?php

use Illuminate\Database\Migrations\Migration;

class CreateFlipperMapsTables extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('countries', function ($table) {
			$table->increments('id');
			$table->string('name');
			$table->string('code');
			$table->timestamps();
		});

		Schema::create('cities', function ($table) {
			$table->increments('id');
			$table->integer('country_id')->unsigned();
			$table->string('name');
			$table->timestamps();
		});

		Schema::create('locations', function ($table) {
			$table->increments('id');
			$table->integer('city_id')->unsigned();
			$table->string('name');
			$table->timestamps();
		});

		Schema::create('models', function ($table) {
			$table->increments('id');
			$table->string('name');
			$table->text('description');
			$table->timestamps();
		});

		Schema::create('machines', function ($table) {
			$table->increments('id');
			$table->integer('location_id')->unsigned();
			$table->integer('model_id')->unsigned();
			$table->timestamps();
		});

		Schema::create('rates', function ($table) {
			$table->increments('id');
			$table->integer('machine_id')->unsigned();
			$table->decimal('price');
			$table->integer('games')->unsigned();
			$table->timestamps();
		});

		Schema::create('notes', function ($table) {
			$table->increments('id');
			$table->integer('user_id')->unsigned();
			$table->integer('noteable_id')->unsigned();
			$table->string('noteable_type');
			$table->string('type');
			$table->text('note');
			$table->timestamps();
		});

		Schema::create('ratings', function ($table) {
			$table->increments('id');
			$table->integer('rateable_id')->unsigned();
			$table->string('rateable_type');
			$table->integer('rating');
			$table->integer('votes');
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
		Schema::drop('ratings');
		Schema::drop('notes');
		Schema::drop('rates');
		Schema::drop('machines');
		Schema::drop('models');
		Schema::drop('locations');
		Schema::drop('cities');
		Schema::drop('countries');
	}

}

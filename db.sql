Table User_app [headercolor: #175e7a] {
	id_user integer [ pk, increment, not null ]
	name varchar [ not null ]
	email varchar [ not null ]
}

Table Composer [headercolor: #175e7a] {
	id_composer integer [ pk, increment, not null ]
	id_user integer
	nickname varchar [ not null ]
	description varchar [ not null ]
}

Table Composition [headercolor: #175e7a] {
	id_composition integer [ pk, increment, not null ]
	id_composer integer [ not null ]
	id_work integer [ not null ]
}

Table Work [headercolor: #175e7a] {
	id_work integer [ pk, increment, not null ]
	name varchar [ not null ]
	description varchar [ not null ]
	write_date date [ not null ]
}

Table Work_genre [headercolor: #175e7a] {
	id_work_genre integer [ pk, increment, not null ]
	id_work integer [ not null ]
	id_genre integer [ not null ]
}

Table Genre [headercolor: #175e7a] {
	id_genre integer [ pk, increment, not null ]
	name varchar [ not null ]
	description varchar [ not null ]
}

Table Director [headercolor: #175e7a] {
	id_director integer [ pk, increment, not null ]
	id_user integer
	nickname varchar [ not null ]
	description varchar [ not null ]
}

Table Artist [headercolor: #175e7a] {
	id_artist integer [ pk, increment, not null ]
	id_user integer
	nickname varchar [ not null ]
	description varchar [ not null ]
}

Table Instrument [headercolor: #175e7a] {
	id_instrument integer [ pk, increment, not null ]
	id_type_instrument integer [ not null ]
	name varchar [ not null ]
	description varchar [ not null ]
}

Table Type_instrument [headercolor: #175e7a] {
	id_type_instrument integer [ pk, increment, not null ]
	name varchar [ not null ]
	description varchar [ not null ]
}

Table Interpretation [headercolor: #175e7a] {
	id_interpretation integer [ pk, increment, not null ]
	id_type_interpretation integer [ not null ]
	id_work integer [ not null ]
	id_director integer [ not null ]
	load_file_date date [ not null ]
}

Table Type_intertationpre [headercolor: #175e7a] {
	id_type_interpretation integer [ pk, increment, not null ]
	name varchar [ not null ]
	description varchar [ not null ]
	min_artist integer [ not null ]
	max_artist integer [ not null ]
}

Table Interpretation_artist [headercolor: #175e7a] {
	id_interpretation_artist integer [ pk, increment, not null ]
	id_artist integer [ not null ]
	id_instrument integer [ not null ]
	id_interpretation integer [ not null ]
}

Ref fk_User_app_id_user_Composer {
	User_app.id_user < Composer.id_user [ delete: no action, update: no action ]
}

Ref fk_User_app_id_user_Director {
	User_app.id_user < Director.id_user [ delete: no action, update: no action ]
}

Ref fk_User_app_id_user_Artist {
	User_app.id_user < Artist.id_user [ delete: no action, update: no action ]
}

Ref fk_Work_id_work_Composition {
	Work.id_work < Composition.id_work [ delete: no action, update: no action ]
}

Ref fk_Composer_id_composer_Composition {
	Composer.id_composer < Composition.id_composer [ delete: no action, update: no action ]
}

Ref fk_Work_id_work_Work_genre {
	Work.id_work < Work_genre.id_work [ delete: no action, update: no action ]
}

Ref fk_Work_genre_id_genre_Genre {
	Work_genre.id_genre > Genre.id_genre [ delete: no action, update: no action ]
}

Ref fk_Instrument_id_type_instrument_Type_instrument {
	Instrument.id_type_instrument > Type_instrument.id_type_instrument [ delete: no action, update: no action ]
}

Ref fk_Director_id_director_Interpretation {
	Director.id_director < Interpretation.id_director [ delete: no action, update: no action ]
}

Ref fk_Interpretation_id_work_Work {
	Interpretation.id_work > Work.id_work [ delete: no action, update: no action ]
}

Ref fk_Interpretation_id_type_interpretation_Type_interpretation {
	Interpretation.id_type_interpretation > Type_intertationpre.id_type_interpretation [ delete: no action, update: no action ]
}

Ref fk_Piece_artist_id_instrument_Instrument {
	Interpretation_artist.id_instrument > Instrument.id_instrument [ delete: no action, update: no action ]
}

Ref fk_Artist_id_artist_Piece_artist {
	Artist.id_artist < Interpretation_artist.id_artist [ delete: no action, update: no action ]
}

Ref fk_Piece_artist_id_piece_Piece {
	Interpretation_artist.id_interpretation > Interpretation.id_interpretation [ delete: no action, update: no action ]
}
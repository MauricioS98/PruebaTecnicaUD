import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const UserApp = sequelize.define('user_app', {
  id_user: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
});

export const Composer = sequelize.define('composer', {
  id_composer: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_user: { type: DataTypes.INTEGER, allowNull: true },
  nickname: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
});

export const Work = sequelize.define('work', {
  id_work: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  write_date: { type: DataTypes.DATEONLY, allowNull: false },
});

export const Composition = sequelize.define('composition', {
  id_composition: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_composer: { type: DataTypes.INTEGER, allowNull: false },
  id_work: { type: DataTypes.INTEGER, allowNull: false },
});

export const Genre = sequelize.define('genre', {
  id_genre: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
});

export const WorkGenre = sequelize.define('work_genre', {
  id_work_genre: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_work: { type: DataTypes.INTEGER, allowNull: false },
  id_genre: { type: DataTypes.INTEGER, allowNull: false },
});

export const Director = sequelize.define('director', {
  id_director: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_user: { type: DataTypes.INTEGER, allowNull: true },
  nickname: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
});

export const Artist = sequelize.define('artist', {
  id_artist: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_user: { type: DataTypes.INTEGER, allowNull: true },
  nickname: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
});

export const TypeInstrument = sequelize.define('type_instrument', {
  id_type_instrument: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
});

export const Instrument = sequelize.define('instrument', {
  id_instrument: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_type_instrument: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
});

export const TypeInterpretation = sequelize.define('type_interpretation', {
  id_type_interpretation: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  min_artist: { type: DataTypes.INTEGER, allowNull: false },
  max_artist: { type: DataTypes.INTEGER, allowNull: false },
});

export const Interpretation = sequelize.define('interpretation', {
  id_interpretation: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_type_interpretation: { type: DataTypes.INTEGER, allowNull: true },
  id_work: { type: DataTypes.INTEGER, allowNull: false },
  id_director: { type: DataTypes.INTEGER, allowNull: true },
  load_file_date: { type: DataTypes.DATEONLY, allowNull: false },
});

export const InterpretationArtist = sequelize.define('interpretation_artist', {
  id_interpretation_artist: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_artist: { type: DataTypes.INTEGER, allowNull: false },
  id_instrument: { type: DataTypes.INTEGER, allowNull: true },
  id_interpretation: { type: DataTypes.INTEGER, allowNull: false },
});

// Asociaciones
Composer.belongsTo(UserApp, { foreignKey: 'id_user' });
UserApp.hasMany(Composer, { foreignKey: 'id_user' });

Director.belongsTo(UserApp, { foreignKey: 'id_user' });
UserApp.hasMany(Director, { foreignKey: 'id_user' });

Artist.belongsTo(UserApp, { foreignKey: 'id_user' });
UserApp.hasMany(Artist, { foreignKey: 'id_user' });

Work.belongsToMany(Composer, { through: Composition, foreignKey: 'id_work', otherKey: 'id_composer' });
Composer.belongsToMany(Work, { through: Composition, foreignKey: 'id_composer', otherKey: 'id_work' });
Composition.belongsTo(Work, { foreignKey: 'id_work' });
Composition.belongsTo(Composer, { foreignKey: 'id_composer' });
Work.hasMany(Composition, { foreignKey: 'id_work' });
Composer.hasMany(Composition, { foreignKey: 'id_composer' });

Work.belongsToMany(Genre, { through: WorkGenre, foreignKey: 'id_work', otherKey: 'id_genre' });
Genre.belongsToMany(Work, { through: WorkGenre, foreignKey: 'id_genre', otherKey: 'id_work' });

Instrument.belongsTo(TypeInstrument, { foreignKey: 'id_type_instrument' });
TypeInstrument.hasMany(Instrument, { foreignKey: 'id_type_instrument' });

Interpretation.belongsTo(Work, { foreignKey: 'id_work' });
Interpretation.belongsTo(Director, { foreignKey: 'id_director' });
Interpretation.belongsTo(TypeInterpretation, { foreignKey: 'id_type_interpretation' });
Work.hasMany(Interpretation, { foreignKey: 'id_work' });
Director.hasMany(Interpretation, { foreignKey: 'id_director' });

Interpretation.hasMany(InterpretationArtist, { foreignKey: 'id_interpretation' });
InterpretationArtist.belongsTo(Interpretation, { foreignKey: 'id_interpretation' });
InterpretationArtist.belongsTo(Artist, { foreignKey: 'id_artist' });
InterpretationArtist.belongsTo(Instrument, { foreignKey: 'id_instrument' });
Artist.hasMany(InterpretationArtist, { foreignKey: 'id_artist' });

export const models = {
  UserApp,
  Composer,
  Work,
  Composition,
  Genre,
  WorkGenre,
  Director,
  Artist,
  TypeInstrument,
  Instrument,
  TypeInterpretation,
  Interpretation,
  InterpretationArtist,
};

export default sequelize;

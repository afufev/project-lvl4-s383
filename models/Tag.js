export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { arg: true, msg: 'Tag name can\'t be empty' },
      },
    },
  }, {});
  Tag.associate = (models) => {
    Tag.belongsToMany(models.Task, { through: 'TaskTag' });
  };
  return Tag;
};

exports.createSELECT = createSELECT;
/**
 * createSELECT
 *
 * @param {string} modelName
 * @param {Model} model
 * @param {Options} [options={}]
 * @returns
 */
function createSELECT(modelName, model, options = {}) {
  // setup options
  const {
    nativeQuery,
    populate = {},
    projection = [],
    where = {},
    limit = '',
    order = '',
    debug,
  } = options;

  if (nativeQuery) {
    if (debug) console.log('query>\n', nativeQuery);
    return nativeQuery;
  }

  const { keys } = Object;
  if (!model) throw new Error(`No model found for ${modelName}`);
  if (!model.__table) throw new Error(`No table found for ${modelName}.__table `);

  const table = model.__table;

  const props = keys(model);
  const defaultProjection = props
    .filter(prop => prop !== '__table')
    .filter(prop => projection.length === 0 || projection.indexOf(prop) !== -1)
    .map(prop => `${table}.${prop} as ${prop}`)
    .join(', ');

  const getForeignData = alias => {
    let foreignKey = populate[alias];
    if (!foreignKey) throw new Error(`alias \`${alias}\` not found in the \`populate\` object`);
    let foreignModel = model[foreignKey];
    let foreignParentTable = null;
    let foreignParentName = null;

    // m: p.message_id
    if (foreignKey.split('.').length == 2) {
      const parentAlias = foreignKey.split('.')[0];
      foreignKey = foreignKey.split('.')[1];
      const foreignParentKey = populate[parentAlias];
      foreignModel = model[foreignParentKey][foreignKey];
      foreignParentTable = model[foreignParentKey].__table;
      foreignParentName = foreignParentKey.split('_')[0];
    }

    const foreignName = foreignKey.split('_')[0];
    const foreignTable = foreignModel.__table;
    const foreignProps = keys(foreignModel).filter(prop => prop !== '__table');

    return {
      foreignKey,
      foreignName,
      foreignTable,
      foreignModel,
      foreignProps,
      foreignParentTable,
      foreignParentName,
    };
  };

  const joins = [];
  const projections = [];
  if (keys(populate).length > 0) {
    keys(populate).map(alias => {
      const {
        foreignKey,
        foreignTable,
        foreignName,
        foreignProps,
        foreignParentTable,
        foreignParentName,
      } = getForeignData(alias);
      const asProp = prop =>
        foreignParentName
          ? `${foreignParentName}___${foreignName}___${prop}`
          : `${foreignName}___${prop}`;
      const foreignProjection = foreignProps
        .filter(prop => projection.length === 0 || projection.indexOf(`${alias}.${prop}`) !== -1)
        .map(prop => `${foreignTable}.${prop} as ${asProp(prop)}`)
        .join(', ');

      if (foreignProjection) {
        projections.push(foreignProjection);
      }

      const refTable = foreignParentTable ? foreignParentTable : table;

      joins.push(
        `\n  LEFT JOIN ${foreignTable} ON ${foreignTable}.${foreignKey} = ${refTable}.${foreignKey}`
      );

      return alias;
    });
  }

  const withJoins = joins.length > 0 ? joins.reduce((_, join) => _ + join, '') : '';

  let fullProjection = defaultProjection;

  if (projections.length > 0) {
    fullProjection += ', ' + projections.join(', ');
  }

  let LIMIT = '';
  let ORDER = '';
  let whereCondition = '';

  if (keys(where).length > 0) {
    const whereProps = keys(where).map(prop => {
      const propCondition = where[prop].split(' ').length === 1 ? ` = ${where[prop]}` : where[prop];
      if (prop.split('.').length === 2) {
        const alias = prop.split('.')[0];
        const { foreignTable } = getForeignData(alias);
        const foreignProp = prop.split('.')[1];
        return `${foreignTable}.${foreignProp} ${propCondition}`;
      }
      return `${prop} ${propCondition}`;
    });
    whereCondition = `\nWHERE ${whereProps.join(' AND ')}`;
  }

  if (limit) {
    LIMIT = `\nLIMIT ${limit}`;
  }

  if (keys(order).length > 0) {
    const propsToOrder = keys(order).map(prop => {
      if (prop.split('.').length === 2) {
        const alias = prop.split('.')[0];
        const { foreignTable } = getForeignData(alias);
        const foreignProp = prop.split('.')[1];
        return `${foreignTable}.${foreignProp} ${order[prop]}`;
      }
      return `${prop} ${order[prop]}`;
    });
    ORDER = `\nORDER BY ${propsToOrder.join(', ')}`;
  }

  const query = `SELECT ${fullProjection} \nFROM ${table} ${withJoins}${whereCondition}${ORDER}${LIMIT}`.trim();
  if (debug) console.log('query>\n' + query);

  return query;
}

exports.normalize = normalize;
/**
 * normalize
 *
 * @param {string} [token='___']
 * @returns {Array<Model>}
 */
function normalize(token = '___') {
  /*
    EXAMPLE
    user: {
      id,
      name,
      company_id,
      company___name,
      company___company_id,
      company___country___name
    }
    =>
    user: {
      id,
      name,
      company_id,
      company {
        name,
        company_id,
        country: {
          name
        }
      }
    }
  */
  return rows =>
    rows.map(row => {
      const item = {};
      Object.keys(row).map(key => {
        const value = row[key];
        if (key.split(token).length === 2) {
          const _key = key.split(token)[0];
          const subkey = key.split(token)[1];
          if (item[_key]) {
            item[_key][subkey] = value;
          } else {
            item[_key] = { [subkey]: value };
          }
        } else if (key.split(token).length === 3) {
          // post___message___text:
          const _key = key.split(token)[0];
          const subkey = key.split(token)[1];
          const leafKey = key.split(token)[2];
          if (item[_key]) {
            if (item[_key][subkey]) {
              item[_key][subkey][leafKey] = value;
            } else {
              item[_key][subkey] = { [leafKey]: value };
            }
          } else {
            item[_key] = { [subkey]: { [leafKey]: value } };
          }
        } else {
          item[key] = value;
        }
      });
      return item;
    });
}

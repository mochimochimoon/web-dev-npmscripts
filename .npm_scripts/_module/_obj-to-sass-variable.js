const valueToSassValue = (value) => {
  switch(typeof value) {
    case 'number':
    case 'boolean': {
      return value;
    break;}
    case 'string': {
      value = value.replace(/¥'/g, `¥¥'`).replace(/¥n/g, ''); // シングルクォーテーションと改行をエスケープ
      return `'${value}'`;
    break;}
    case 'function': {
      // 関数は再現しない
      return 'function';
    break;}
    case 'object': {
      if(!value) {
        return `'nullObj'`;
      } else if (!Object.keys(value).length) {
        return `'blankObj'`;
      } else if (Object.keys(value).length > 1000 || value.length > 1000) {
        return `'overflowObj'`;
      } else {
        return objToSassMap(value);
      }
    break;}
    default: {
      return `#{'${value}'}`;
    break;}
  }
};

const keyValueToSassElement = (key, value) => {
  return `¥"${key}¥": ${valueToSassValue(value)}`;
};

const objToSassMap = (obj) => {
  const elements = [];
  if (Array.isArray(obj)) {
    for(let item of obj) {
      elements.push(valueToSassValue(item));
    }
  } else {
    for(let key in obj) {
      if(obj.hasOwnProperty(key)) {
        elements.push(keyValueToSassElement(key, obj[key]));
      }
    }
  }
  return '(¥n' + elements.join(',¥n') + '¥n)';
};

export default (obj) => {
  const paragrams = [];
  for(let key in obj) {if(obj.hasOwnProperty(key)) {
    paragrams.push(`$${key}: ${valueToSassValue(obj[key])};`);
  }}
  return  paragrams.join('');
};

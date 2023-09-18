import jsonDirToObject from "./_json-dir-to-object.js";
import jsDirToObjectAsync from "./_js-dir-to-object-async.js";
import command from "./_command.js";

export default async (databaseDir = 'src/.database', moduleDir = 'src/.module') => {
  const data = {
    database: jsonDirToObject(databaseDir),
    module: await jsDirToObjectAsync(moduleDir),
    command: command(),
  }
  return data;
}

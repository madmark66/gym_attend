const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM classRecord WHERE class_date >= '2022-3-1'`
  );
  const data1 = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    rows
  }
}

module.exports = {
    getMultiple
  }
'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');

async function searchStudent(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  let searchListCriteria = [];

  if(req.query.searchQueries) {
    let searchQueries = JSON.parse(req.query.searchQueries);
    Object.keys(searchQueries).forEach(element => {
      let operation = 'like_ignore_case';
      let valueType = 'STRING';
      searchListCriteria.push({key: element, operation: operation, value: searchQueries[element], valueType: valueType});
    });
  }

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      searchCriteriaList: JSON.stringify(searchListCriteria)
    }
  };

  return Promise.all([
    utils.getData(token, config.get('server:studentURL') + '/paginated', params),
  ])
    .then(async ([dataResponse]) =>
    {
      let filteredList = [];
      dataResponse['content'].forEach((element, i) => {
        filteredList.push(dataResponse['content'][i]);
      });
      dataResponse['content'] = filteredList;
      return res.status(200).json(dataResponse);
    }).catch((e) => {
      logApiError(e, 'getStudentById', 'Error occurred while attempting to GET student.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    });
}

module.exports = {
  searchStudent
};
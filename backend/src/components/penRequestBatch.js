'use strict';
const { logApiError } = require('./utils');
const config = require('../config/index');
const { getBackendToken, getData, putData, errorResponse, getPaginatedListForSCGroups } = require('./utils');
const {FILTER_OPERATION, CONDITION, VALUE_TYPE} = require('../util/constants');
const HttpStatus = require('http-status-codes');

async function getPENBatchRequestStats(req, res) {
  const schoolGroupCodes = [
    {
      schoolGroupCode: 'K12'
    },
    {
      schoolGroupCode: 'PSI'
    }
  ];
  let promises = [];
  schoolGroupCodes.forEach((schoolGroupCode) => {
    const search = [
      {
        searchCriteriaList: [
          {
            key: 'schoolGroupCode',
            operation: FILTER_OPERATION.EQUAL,
            value: schoolGroupCode.schoolGroupCode,
            valueType: VALUE_TYPE.STRING
          },
          {
            condition: CONDITION.AND,
            key: 'penRequestBatchStatusCode',
            operation: FILTER_OPERATION.IN,
            value: 'ACTIVE,UNARCHIVED',
            valueType: VALUE_TYPE.STRING
          }
        ]
      }
    ];
    promises.push(
      getData(getBackendToken(req), config.get('server:penRequestBatch:paginated'), {
        params: {
          pageSize: config.get('server:penRequestBatch:maxPaginatedElements'),
          searchCriteriaList: JSON.stringify(search)
        }
      }),
    );
  });
  return Promise.all(promises).then((response) => {
    let formattedResponse = {};
    schoolGroupCodes.forEach((schoolGroupCode, index) => {
      formattedResponse[schoolGroupCode.schoolGroupCode] = {
        pending: response[index].totalElements,
        fixable: response[index].content.reduce((a, b) => +a + (+b['fixableCount'] || 0), 0),
        repeats: response[index].content.reduce((a, b) => +a + (+b['repeatCount'] || 0), 0),
        unarchived: response[index].content.filter((obj) => obj.penRequestBatchStatusCode === 'UNARCHIVED').length
      };
    });
    return res.status(200).json(formattedResponse);
  }).catch(e => {
    logApiError(e, 'getPENBatchRequestStats', 'Error occurred while attempting to GET number of pen batch requests.');
    return errorResponse(res);
  });
}

async function updatePrbStudentInfoRequested(req, res) {
  const token = getBackendToken(req, res);
  if(!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  try {
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    let studentData = await getData(token, url);

    const studentReq = {
      ... studentData,
      infoRequest: req.body.infoRequest,
      penRequestBatchStudentStatusCode: req.body.penRequestBatchStudentStatusCode
    };

    const studentRes = await putData(token, url, studentReq);
    return res.status(200).json(studentRes);
  } catch(e) {
    logApiError(e, 'updateStudentInfoRequested', 'Error updating a PrbStudent.');
    return errorResponse(res);
  }
}

async function getPenRequestBatchStudentById(req, res) {
  const token = getBackendToken(req, res);
  try {
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    let studentData = await getData(token, url);
    return res.status(200).json({repeatRequestOriginalStatus: studentData.penRequestBatchStudentStatusCode});
  } catch(e) {
    logApiError(e, 'getPenRequestBatchStudentById', 'Error getting a PrbStudent.');
    return errorResponse(res);
  }
}

async function getPenRequestBatchStudentMatchOutcome(req, res) {
  const token = getBackendToken(req, res);
  if(!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  try {
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.query.id}/student/${req.query.studentId}/possible-match`;
    let matchData = await getData(token, url);

    return Promise.all(matchData.map(async (match) => {
      const studentUrl = `${config.get('server:student:rootURL')}/${match.matchedStudentId}`;
      return await getData(token, studentUrl);
    })).then((response) => {
      return res.status(200).json(response);
    }).catch(e => {
      logApiError(e, 'getPenRequestBatchStudentMatchOutcome', 'Error occurred while attempting to GET student records.');
      return errorResponse(res);
    });
  } catch(e) {
    logApiError(e, 'getPenRequestBatchStudentMatchOutcome', 'Error getting pen request student possible matches.');
    return errorResponse(res);
  }
}

module.exports = {
  getPENBatchRequestStats,
  updatePrbStudentInfoRequested,
  getPenRequestFiles: getPaginatedListForSCGroups('getPenRequestFiles', `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/paginated`),
  getPenRequestBatchStudents: getPaginatedListForSCGroups('getPenRequestBatchStudents', `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/student/paginated`),
  getPenRequestBatchStudentById,
  getPenRequestBatchStudentMatchOutcome
};

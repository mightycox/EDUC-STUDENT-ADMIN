'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = process.env.NODE_ENV;

nconf.argv()
  .file({file: path.join(__dirname, `${env}.json`)});

nconf.defaults({
  environment: env,
  logoutEndpoint: process.env.KC_DOMAIN + '/protocol/openid-connect/logout',
  siteMinder_logout_endpoint: process.env.SITEMINDER_LOGOUT_ENDPOINT,
  server: {
    frontend: process.env.SERVER_FRONTEND,
    backend: process.env.SERVER_FRONTEND + '/api',
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: '8080',
    session: {
      maxAge: +process.env.SESSION_MAX_AGE
    },
    penRequest: {
      statusCodeURL: process.env.PEN_REQUEST_API_URL + '/statuses',
      documentTypeCodesURL: process.env.PEN_REQUEST_API_URL + '/document-types',
      rootURL: process.env.PEN_REQUEST_API_URL,
      macrosURL: process.env.PEN_REQUEST_API_URL + '/pen-request-macro',
      emails: process.env.PEN_REQUEST_EMAIL_API_URL,
      paginated: process.env.PEN_REQUEST_API_URL + '/paginated',
      rolesAllowed: process.env.GMP_ROLES ? process.env.GMP_ROLES.split(',') : '', // please provide comma separated values.
      roleAdmin: process.env.GMP_ROLE_ADMIN
    },
    studentRequest: {
      statusCodeURL: process.env.STUDENT_PROFILE_API_URL + '/statuses',
      documentTypeCodesURL: process.env.STUDENT_PROFILE_API_URL + '/document-types',
      rootURL: process.env.STUDENT_PROFILE_API_URL,
      macrosURL: process.env.STUDENT_PROFILE_API_URL + '/student-profile-macro',
      emails: process.env.STUDENT_PROFILE_EMAIL_API_URL,
      paginated: process.env.STUDENT_PROFILE_API_URL + '/paginated',
      rolesAllowed: process.env.UMP_ROLES ? process.env.UMP_ROLES.split(',') : '', // please provide comma separated values.
      roleAdmin: process.env.UMP_ROLE_ADMIN
    },
    studentSearch: {
      roleAdmin: process.env.STUDENT_SEARCH_ADMIN
    },
    penRequestBatch: {
      rootURL: process.env.PEN_REQUEST_BATCH_API_URL,
      paginated: process.env.PEN_REQUEST_BATCH_API_URL + '/pen-request-batch/paginated',
      studentStatusCodesURL: process.env.PEN_REQUEST_BATCH_API_URL + '/pen-request-batch/student/pen-request-batch-student-status-codes',
      studentInfoMacrosURL: process.env.PEN_REQUEST_BATCH_API_URL + '/pen-request-batch-macro',
      roleAdmin: process.env.PEN_REQUEST_BATCH_ADMIN,
      maxPaginatedElements: 1000
    },
    penMatch: {
      rootURL: process.env.PEN_MATCH_API_URL,
      roleAdmin: process.env.STUDENT_SEARCH_ADMIN
    },
    demographicsURL: process.env.PEN_DEMOGRAPHICS_URL,
    digitalIdURL: process.env.DIGITAL_ID_URL,
    digitalIdIdentityTypeCodesURL: process.env.DIGITAL_ID_URL + '/identityTypeCodes',
    profileSagaAPIURL: process.env.PROFILE_REQUEST_SAGA_API_URL,
    student: {
      rootURL: process.env.STUDENT_API_URL,
      genderCodesURL: process.env.STUDENT_API_URL + '/gender-codes',
      demogCodesURL: process.env.STUDENT_API_URL + '/demog-codes',
      statusCodesURL: process.env.STUDENT_API_URL + '/status-codes',
      gradeCodesURL: process.env.STUDENT_API_URL + '/grade-codes',
      twinReasonCodesURL: process.env.STUDENT_API_URL + '/student-twin-reason-codes',
    },
    penServices: {
      rootURL: process.env.PEN_SERVICES_API_URL,
      nextPenURL: process.env.PEN_SERVICES_API_URL + '/next-pen-number',
      validateDemographicsURL: process.env.PEN_SERVICES_API_URL + '/validation/student-request'
    }
  },
  oidc: {
    publicKey: process.env.SOAM_PUBLIC_KEY,
    clientId: process.env.ID,
    clientSecret: process.env.SECRET,
    discovery: process.env.DISCOVERY,
  },
  tokenGenerate: {
    privateKey: process.env.UI_PRIVATE_KEY,
    publicKey: process.env.UI_PUBLIC_KEY,
    audience: process.env.SERVER_FRONTEND,
    issuer: process.env.ISSUER,
    expiresIn: process.env.TOKEN_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  },
  messaging: {
    natsUrl: process.env.NATS_URL,
    natsCluster: process.env.NATS_CLUSTER
  },
  scheduler: {
    schedulerCronStaleSagaRecordRedis: process.env.SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS,
    minTimeBeforeSagaIsStaleInMinutes: process.env.MIN_TIME_BEFORE_SAGA_IS_STALE_IN_MINUTES
  }
});
module.exports = nconf;

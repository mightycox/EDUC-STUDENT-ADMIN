const FILTER_OPERATION = Object.freeze(
  {
    /**
     * Equal filter operation.
     */
    EQUAL: 'eq',
    /**
     * Not equal filter operation.
     */
    NOT_EQUAL: 'neq',
    /**
     * Greater than filter operation.
     */
    GREATER_THAN: 'gt',
    /**
     * Greater than or equal to filter operation.
     */
    GREATER_THAN_OR_EQUAL_TO: 'gte',
    /**
     * Less than filter operation.
     */
    LESS_THAN: 'lt',
    /**
     * Less than or equal to filter operation.
     */
    LESS_THAN_OR_EQUAL_TO: 'lte',
    /**
     * In filter operation.
     */
    IN: 'in',
    /**
     * Not in filter operation.
     */
    NOT_IN: 'nin',
    /**
     * Between filter operation.
     */
    BETWEEN: 'btn',
    /**
     * Contains filter operation.
     */
    CONTAINS: 'like',
    /**
     * Contains ignore case filter operation.
     */
    CONTAINS_IGNORE_CASE: 'like_ignore_case',
    /**
     * Starts with filter operation.
     */
    STARTS_WITH: 'starts_with',
    /**
     * Starts with ignore case filter operation.
     */
    STARTS_WITH_IGNORE_CASE: 'starts_with_ignore_case'
  }
);
const CONDITION = Object.freeze(
  {
    /**
     * And condition.
     */
    AND:'AND',
    /**
     * Or condition.
     */
    OR:'OR'
  }
);

const VALUE_TYPE = Object.freeze(
  {
    /**
     * String value type.
     */
    STRING:'STRING',
    /**
     * Integer value type.
     */
    INTEGER:'INTEGER',
    /**
     * Long value type.
     */
    LONG:'LONG',
    /**
     * Date value type.
     */
    DATE:'DATE',
    /**
     * Date time value type.
     */
    DATE_TIME:'DATE_TIME',
    /**
     * Uuid value type.
     */
    UUID:'UUID'
  }
);
module.exports = {
  FILTER_OPERATION,
  CONDITION,
  VALUE_TYPE
};
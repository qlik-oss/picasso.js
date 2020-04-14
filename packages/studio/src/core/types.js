import PropTypes from 'prop-types';

const SettingsType = PropTypes.shape({
  api: PropTypes.shape({
    chart: PropTypes.bool,
    compose: PropTypes.bool,
  }),
  renderer: PropTypes.shape({
    prio: PropTypes.arrayOf(PropTypes.string),
  }),
  logger: PropTypes.number,
});

export default SettingsType;

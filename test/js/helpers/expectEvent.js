const should = require('chai').should();

const inLogs = async (logs, eventName, eventArgs = {}) => {
  const event = logs.find(e => e.event === eventName);
  should.exist(event, 'Event `'+eventName+'` has not emited!');
  for (const [k, v] of Object.entries(eventArgs)) {
    should.exist(event.args[k], 'Field `'+k+'` is absent in event params');
    event.args[k].should.to.deep.equal(v);
  }
  return event;
};

const inTransaction = async (tx, eventName, eventArgs = {}) => {
  const { logs } = await tx;
  return inLogs(logs, eventName, eventArgs);
};

module.exports = {
  inLogs,
  inTransaction,
};

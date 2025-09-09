// Porta de Analytics (DIP)
class AnalyticsPublisher {
  // publish(eventName: string, payload: object, context?: object): Promise<void>
  async publish(_eventName, _payload, _context = {}) {
    throw new Error('Not implemented');
  }
}
module.exports = AnalyticsPublisher;



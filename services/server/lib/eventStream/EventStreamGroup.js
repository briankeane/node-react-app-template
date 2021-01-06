class EventStreamGroup {
  constructor(streams) {
    for (let stream of streams) {
      this[stream.name] = stream;
    }
    this.streams = streams;
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.streams.length === 0) {
        return reject(new Error('EventStreamGroup should not contain 0 streams'));
      }

      let promises = [];
      for (let stream of this.streams) {
        promises.push( stream.connect() );
      }

      Promise.all(promises)
        .then((connections) => resolve())
        .catch(error => reject(error));
    });
  }

}

module.exports = EventStreamGroup;